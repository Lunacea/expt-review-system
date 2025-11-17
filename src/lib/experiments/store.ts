// 実験管理のストア

import { writable, derived, get } from 'svelte/store';
import type { Experiment, ExperimentTask, ParticipantData, ExperimentLog, Questionnaire } from './types';

// 参加者データ
export const participantData = writable<ParticipantData | null>(null);

// 参加者データを復元
export function restoreParticipantData(): ParticipantData | null {
	if (typeof window === 'undefined') return null;
	const stored = window.localStorage.getItem('experimentParticipantData');
	if (!stored) return null;
	try {
		const parsed = JSON.parse(stored) as ParticipantData;
		const normalized = normalizeParticipantExperiments(parsed);
		participantData.set(normalized);
		return normalized;
	} catch (error) {
		console.error('Failed to restore participant data from storage:', error);
		return null;
	}
}

// 参加者データを保存
function persistParticipantData(data: ParticipantData) {
	if (typeof window === 'undefined') return;
	window.localStorage.setItem('experimentParticipantData', JSON.stringify(data));
}

type LegacyExperimentId = {
	id: Experiment['id'];
	variant?: Experiment['variant'];
};

const LEGACY_EXPERIMENT_ID_MAP: Record<string, LegacyExperimentId> = {
	'exp-text-vs-selection': { id: 'text-vs-selection' },
	'exp-numeric-evaluation': { id: 'numeric-evaluation' },
	'exp-effectiveness-control': { id: 'effectiveness', variant: 'control' },
	'exp-effectiveness-treatment': { id: 'effectiveness', variant: 'treatment' }
};

function normalizeExperimentIdentifiers(experiment: Experiment): Experiment {
	const mapping = LEGACY_EXPERIMENT_ID_MAP[experiment.id];
	if (!mapping) {
		return experiment;
	}
	const normalized: Experiment = {
		...experiment,
		id: mapping.id
	};
	if (mapping.variant) {
		normalized.variant = mapping.variant;
	}
	return normalized;
}

function normalizeExperiments(
	experiments: Experiment[]
): { normalized: Experiment[]; changed: boolean } {
	let changed = false;
	const normalized = experiments.map((experiment) => {
		const next = normalizeExperimentIdentifiers(experiment);
		if (next !== experiment) {
			changed = true;
		}
		return next;
	});
	return { normalized, changed };
}

function normalizeParticipantExperiments(data: ParticipantData): ParticipantData {
	const { normalized, changed } = normalizeExperiments(data.experiments);
	if (!changed) {
		return data;
	}
	const normalizedData: ParticipantData = {
		...data,
		experiments: normalized
	};
	persistParticipantData(normalizedData);
	return normalizedData;
}

// 現在の実験
export const currentExperiment = writable<Experiment | null>(null);

// 実験ログ
export const experimentLogs = writable<ExperimentLog[]>([]);

// アンケートデータ
export const questionnaires = writable<Questionnaire[]>([]);

// 現在のタスク（派生ストア）
export const currentTask = derived(currentExperiment, ($exp) => {
	if (!$exp || $exp.currentTaskIndex >= $exp.tasks.length) {
		return null;
	}
	return $exp.tasks[$exp.currentTaskIndex];
});

// 実験の進捗率（派生ストア）
export const experimentProgress = derived(currentExperiment, ($exp) => {
	if (!$exp) return 0;
	const completed = $exp.tasks.filter((t) => t.completed).length;
	return (completed / $exp.tasks.length) * 100;
});

function persistCurrentExperiment(exp: Experiment | null) {
	if (typeof window === 'undefined') return;
	if (!exp) {
		window.localStorage.removeItem('currentExperiment');
		return;
	}
	window.localStorage.setItem('currentExperiment', JSON.stringify(exp));
}

function updateExperimentTasks(
	experiment: Experiment,
	updater: (task: ExperimentTask) => ExperimentTask
): Experiment {
	const updatedTasks = experiment.tasks.map(updater);
	return { ...experiment, tasks: updatedTasks };
}

export function restoreCurrentExperiment(): Experiment | null {
	if (typeof window === 'undefined') return null;
	const stored = window.localStorage.getItem('currentExperiment');
	if (!stored) return null;
	try {
		const parsed = JSON.parse(stored) as Experiment;
		const normalized = normalizeExperimentIdentifiers(parsed);
		currentExperiment.set(normalized);
		if (normalized !== parsed) {
			persistCurrentExperiment(normalized);
		}
		return normalized;
	} catch (error) {
		console.error('Failed to restore experiment from storage:', error);
		window.localStorage.removeItem('currentExperiment');
		return null;
	}
}

// 実験を開始
export function startExperiment(experiment: Experiment) {
	// 既存の実験履歴を確認
	const existing = get(participantData)?.experiments.find((exp) => exp.id === experiment.id);
	
	let updatedExp: Experiment;
	if (existing) {
		// 既存の実験を更新（開始時刻は最初の開始時のみ）
		updatedExp = {
			...existing,
			status: 'in-progress',
			startedAt: existing.startedAt || new Date().toISOString()
		};
	} else {
		// 新規実験
		updatedExp = {
			...experiment,
			status: 'in-progress',
			startedAt: new Date().toISOString()
		};
	}
	
	currentExperiment.set(updatedExp);
	persistCurrentExperiment(updatedExp);

	// 参加者データに追加または更新
	participantData.update((data) => {
		if (!data) {
			const newData: ParticipantData = {
				participantId: generateParticipantId(),
				experiments: [updatedExp],
				createdAt: new Date().toISOString()
			};
			persistParticipantData(newData);
			return newData;
		}
		
		// 既存の実験を更新または新規追加
		const existingIndex = data.experiments.findIndex((exp) => exp.id === experiment.id);
		let updated: ParticipantData;
		if (existingIndex >= 0) {
			const updatedExperiments = [...data.experiments];
			updatedExperiments[existingIndex] = updatedExp;
			updated = {
				...data,
				experiments: updatedExperiments
			};
		} else {
			updated = {
				...data,
				experiments: [...data.experiments, updatedExp]
			};
		}
		persistParticipantData(updated);
		return updated;
	});
}

// タスクを開始
export function startTask(taskId: string) {
	currentExperiment.update((exp) => {
		if (!exp) return exp;
		let mutated = false;
		const updated = updateExperimentTasks(exp, (task) => {
			if (task.id !== taskId || task.startedAt) {
				return task;
			}
			mutated = true;
			return { ...task, startedAt: new Date().toISOString() };
		});
		if (mutated) {
			persistCurrentExperiment(updated);
		}
		return updated;
	});

	// ログ記録
	logEvent('task-start', { taskId });
}

// タスクを完了
export function completeTask(taskId: string) {
	currentExperiment.update((exp) => {
		if (!exp) return exp;

		// 現在のタスクのインデックスを検索
		const currentTaskIndex = exp.tasks.findIndex((t) => t.id === taskId);
		
		const updatedTasks = exp.tasks.map((task) => {
			if (task.id !== taskId || task.completed) {
				return task;
			}
			return { ...task, completed: true, completedAt: new Date().toISOString() };
		});

		// 次のタスクのインデックスを計算（現在のタスクの次のインデックス）
		const nextIndex = currentTaskIndex !== -1 
			? Math.min(currentTaskIndex + 1, updatedTasks.length)
			: Math.min(exp.currentTaskIndex + 1, updatedTasks.length);
		
		const allCompleted = updatedTasks.every((t) => t.completed);

		const updatedExperiment: Experiment = {
			...exp,
			tasks: updatedTasks,
			currentTaskIndex: nextIndex,
			status: allCompleted ? 'completed' : 'in-progress',
			completedAt: allCompleted ? new Date().toISOString() : exp.completedAt
		};

		persistCurrentExperiment(updatedExperiment);

		// 参加者データの履歴も更新
		participantData.update((data) => {
			if (!data) return data;
			const existingIndex = data.experiments.findIndex((exp) => exp.id === updatedExperiment.id);
			if (existingIndex >= 0) {
				const updatedExperiments = [...data.experiments];
				updatedExperiments[existingIndex] = updatedExperiment;
				const updated = {
					...data,
					experiments: updatedExperiments
				};
				persistParticipantData(updated);
				return updated;
			}
			return data;
		});

		return updatedExperiment;
	});

	// ログ記録
	logEvent('task-complete', { taskId });
}

// タスクの完了状態を解除
export function uncompleteTask(taskId: string) {
	currentExperiment.update((exp) => {
		if (!exp) return exp;

		// 現在のタスクのインデックスを検索
		const currentTaskIndex = exp.tasks.findIndex((t) => t.id === taskId);
		
		const updatedTasks = exp.tasks.map((task) => {
			if (task.id !== taskId || !task.completed) {
				return task;
			}
			return { ...task, completed: false, completedAt: undefined };
		});

		// currentTaskIndexを現在のタスクに戻す
		const updatedIndex = currentTaskIndex !== -1 ? currentTaskIndex : exp.currentTaskIndex;
		
		const allCompleted = updatedTasks.every((t) => t.completed);

		const updatedExperiment: Experiment = {
			...exp,
			tasks: updatedTasks,
			currentTaskIndex: updatedIndex,
			status: allCompleted ? 'completed' : 'in-progress',
			completedAt: allCompleted ? new Date().toISOString() : exp.completedAt
		};

		persistCurrentExperiment(updatedExperiment);

		// 参加者データの履歴も更新
		participantData.update((data) => {
			if (!data) return data;
			const existingIndex = data.experiments.findIndex((exp) => exp.id === updatedExperiment.id);
			if (existingIndex >= 0) {
				const updatedExperiments = [...data.experiments];
				updatedExperiments[existingIndex] = updatedExperiment;
				const updated = {
					...data,
					experiments: updatedExperiments
				};
				persistParticipantData(updated);
				return updated;
			}
			return data;
		});

		return updatedExperiment;
	});

	// ログ記録
	logEvent('task-uncomplete', { taskId });
}

// イベントをログに記録
export function logEvent(
	eventType: ExperimentLog['eventType'],
	data: Record<string, unknown>
) {
	const exp = get(currentExperiment);
	const task = get(currentTask);
	const participant = get(participantData);

	if (!exp || !task || !participant) return;

	const log: ExperimentLog = {
		participantId: participant.participantId,
		experimentId: exp.id,
		taskId: task.id,
		eventType,
		data,
		timestamp: new Date().toISOString()
	};

	experimentLogs.update((logs) => [...logs, log]);
}

export function clearCurrentExperiment() {
	currentExperiment.set(null);
	persistCurrentExperiment(null);
}

// 参加者IDを生成
export function generateParticipantId(): string {
	return `participant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// 参加者データを初期化
export function initializeParticipant() {
	const participantId = generateParticipantId();
	const data: ParticipantData = {
		participantId,
		experiments: [],
		createdAt: new Date().toISOString()
	};
	participantData.set(data);
	persistParticipantData(data);

	// LocalStorageに保存
	if (typeof window !== 'undefined') {
		localStorage.setItem('experimentParticipantId', participantId);
	}

	return participantId;
}

// LocalStorageから参加者データを復元
export function loadParticipantData(): string | null {
	if (typeof window === 'undefined') return null;
	return localStorage.getItem('experimentParticipantId');
}

// 同意状態を管理
const CONSENT_STORAGE_KEY = 'experimentConsent';
const CONSENT_DATE_STORAGE_KEY = 'experimentConsentDate';

export function hasConsent(): boolean {
	if (typeof window === 'undefined') return false;
	return localStorage.getItem(CONSENT_STORAGE_KEY) === 'true';
}

export function setConsent(consented: boolean) {
	if (typeof window === 'undefined') return;
	if (consented) {
		localStorage.setItem(CONSENT_STORAGE_KEY, 'true');
		localStorage.setItem(CONSENT_DATE_STORAGE_KEY, new Date().toISOString());
	} else {
		localStorage.removeItem(CONSENT_STORAGE_KEY);
		localStorage.removeItem(CONSENT_DATE_STORAGE_KEY);
		// 同意取消時は参加者データもクリア
		localStorage.removeItem('experimentParticipantData');
		participantData.set(null);
	}
}

export function getConsentDate(): string | null {
	if (typeof window === 'undefined') return null;
	return localStorage.getItem(CONSENT_DATE_STORAGE_KEY);
}

// 実験データをエクスポート
export function exportExperimentData() {
	const participant = get(participantData);
	const logs = get(experimentLogs);
	const surveys = get(questionnaires);

	return {
		participant,
		logs,
		questionnaires: surveys,
		exportedAt: new Date().toISOString()
	};
}


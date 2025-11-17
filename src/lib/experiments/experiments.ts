// 実験定義

import type { Experiment, Question, ExperimentVariant } from './types';

// タスクの順序をランダム化
function shuffleArray<T>(array: T[]): T[] {
	const shuffled = [...array];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}

// 実験1: テキストによるレビュー評価との比較
export function createTextVsSelectionExperiment(randomize = true): Experiment {
	const tasks = [
		{
			id: 'task-text-1',
			type: 'text-feedback' as const,
			title: 'テキストによるレビュー評価',
			description: 'レビューに対して自由記述で評価を行ってください',
			productSlug: 'wireless-earbuds-pro',
			order: 0,
			completed: false
		},
		{
			id: 'task-selection-1',
			type: 'sentence-annotations' as const,
			title: '選択式レビュー評価',
			description: 'レビューに対して選択肢から評価を行ってください',
			productSlug: 'wireless-earbuds-pro',
			order: 1,
			completed: false
		},
		{
			id: 'task-questionnaire-1',
			type: 'questionnaire' as const,
			title: 'アンケート',
			description: '評価方法について回答してください',
			productSlug: '',
			order: 2,
			completed: false
		}
	];

	// ランダム化（アンケートは最後に固定）
	if (randomize) {
		const evaluationTasks = tasks.slice(0, 2);
		const questionnaire = tasks[2];
		const shuffled = shuffleArray(evaluationTasks);
		shuffled.forEach((task, index) => {
			task.order = index;
		});
		questionnaire.order = 2;
		return {
			id: 'text-vs-selection',
			type: 'text-vs-selection',
			title: '実験1: テキストによるレビュー評価との比較',
			description: '選択式レビュー評価とテキストによるレビュー評価の差異を評価します',
			tasks: [...shuffled, questionnaire],
			currentTaskIndex: 0,
			status: 'not-started'
		};
	}

	return {
		id: 'text-vs-selection',
		type: 'text-vs-selection',
		title: '実験1: テキストによるレビュー評価との比較',
		description: '選択式レビュー評価とテキストによるレビュー評価の差異を評価します',
		tasks,
		currentTaskIndex: 0,
		status: 'not-started'
	};
}

// 実験2: 数値的レビュー評価との比較
export function createNumericEvaluationExperiment(): Experiment {
	return {
		id: 'numeric-evaluation',
		type: 'numeric-evaluation',
		title: '実験2: 数値的レビュー評価との比較',
		description: '数値的レビュー評価がどの程度自分の評価を反映できているかを確認します',
		tasks: [
			{
				id: 'task-numeric-1',
				type: 'helpful-votes',
				title: '数値的レビュー評価',
				description: 'レビューに対して「役に立った」を投票してください',
				productSlug: 'smart-watch-x1',
				order: 0,
				completed: false
			},
			{
				id: 'task-questionnaire-2',
				type: 'questionnaire',
				title: 'アンケート',
				description: '評価の根拠と満足度について回答してください',
				productSlug: '',
				order: 1,
				completed: false
			}
		],
		currentTaskIndex: 0,
		status: 'not-started'
	};
}

// 実験3: 選択式レビュー評価の有効性評価
export function createEffectivenessExperiment(group: ExperimentVariant): Experiment {
	const taskType = group === 'control' ? 'helpful-votes' : 'sentence-annotations';
	const taskTitle = group === 'control' ? '数値的レビュー評価を閲覧' : '選択式レビュー評価を閲覧';

	return {
		id: 'effectiveness',
		variant: group,
		type: 'effectiveness',
		title: '実験3: 選択式レビュー評価の有効性評価',
		description: 'レビュー評価が商品理解にどの程度役立つかを評価します',
		tasks: [
			{
				id: 'task-review-viewing',
				type: taskType,
				title: taskTitle,
				description: 'レビューとレビュー評価を閲覧してください',
				productSlug: 'mechanical-keyboard-rgb',
				order: 0,
				completed: false
			},
			{
				id: 'task-comprehension-test',
				type: 'comprehension-test',
				title: '理解度テスト',
				description: '商品について理解度テストを受けてください',
				productSlug: 'mechanical-keyboard-rgb',
				order: 1,
				completed: false
			},
			{
				id: 'task-questionnaire-3',
				type: 'questionnaire',
				title: 'アンケート',
				description: 'ユーザインタフェースについて回答してください',
				productSlug: '',
				order: 2,
				completed: false
			}
		],
		currentTaskIndex: 0,
		status: 'not-started'
	};
}

// 実験1のアンケート質問
export const textVsSelectionQuestions: Question[] = [
	{
		id: 'q1-1',
		type: 'likert-5',
		text: 'レビューに対して自由記述による評価を行った際、言いたいことを過不足なく表現できたと感じますか。',
		required: true
	},
	{
		id: 'q1-2',
		type: 'likert-5',
		text: 'レビューに対して選択肢による評価を行った際、言いたいことを過不足なく表現できたと感じますか。',
		required: true
	},
	{
		id: 'q1-3',
		type: 'text',
		text: '選択肢による評価において、表現できなかったと思う内容があればお答えください。',
		required: false
	},
	{
		id: 'q1-4',
		type: 'likert-5',
		text: 'レビューに対して自由記述による評価を行うことに抵抗はありましたか。',
		required: true
	},
	{
		id: 'q1-5',
		type: 'likert-5',
		text: 'レビューに対して選択肢による評価を行うことに抵抗はありましたか。',
		required: true
	},
	{
		id: 'q1-6',
		type: 'likert-5',
		text: 'レビューに対して自由記述による評価は行いやすいと思いましたか。',
		required: true
	},
	{
		id: 'q1-7',
		type: 'likert-5',
		text: 'レビューに対して選択肢による評価は行いやすいと思いましたか。',
		required: true
	},
	{
		id: 'q1-8',
		type: 'likert-5',
		text: 'テキストによる評価と比較して、選択肢によるレビュー評価を行いたいと思いましたか。',
		required: true
	}
];

// 実験2のアンケート質問
export const numericEvaluationQuestions: Question[] = [
	{
		id: 'q2-1',
		type: 'text',
		text: 'それぞれのレビューに対して「役に立った」を投票した理由を記述してください。',
		required: true
	},
	{
		id: 'q2-2',
		type: 'text',
		text: '「役に立った」の投票で反映できなかった部分があれば記述してください。',
		required: false
	},
	{
		id: 'q2-3',
		type: 'likert-5',
		text: '「役に立った」の投票は自分の評価を反映できたと感じますか。',
		required: true
	}
];

// 実験3のアンケート質問
export const effectivenessQuestions: Question[] = [
	{
		id: 'q3-1',
		type: 'likert-5',
		text: '提案システムの全般的なユーザインタフェース（メニューの形状、色、配置など）は適切であり、操作しやすい。',
		required: true
	},
	{
		id: 'q3-2',
		type: 'likert-5',
		text: '提案システムの選択的リアクション機能は、直感的な操作で行える。',
		required: true
	},
	{
		id: 'q3-3',
		type: 'likert-5',
		text: '選択的リアクションの各センテンスに対するビジュアライゼーション（視覚的表現）は理解しやすい。',
		required: true
	},
	{
		id: 'q3-4',
		type: 'likert-5',
		text: '選択的リアクションのレビュー全体に対するビジュアライゼーションは理解しやすい。',
		required: true
	}
];

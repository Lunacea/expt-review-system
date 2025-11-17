<script lang="ts">
	import type { PageData } from './$types';
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { get } from 'svelte/store';
	import { goto } from '$app/navigation';
	import {
		currentExperiment,
		completeTask,
		logEvent,
		restoreCurrentExperiment
	} from '$lib/experiments/store';
	import type { Experiment, Question } from '$lib/experiments/types';
	import { Card, CardContent, CardHeader, CardTitle } from '$shared/components/ui/card';
	import { Button } from '$shared/components/ui/button';
	import { CheckCircle, ArrowLeft, ArrowRight } from '@lucide/svelte';
	import { getTaskPath } from '$lib/experiments/navigation';

	let { data }: { data: PageData } = $props();
	const { questionnaire, comprehension } = data;

	const params = get(page).params;
	const experimentId = params.experimentId ?? '';
	const taskId = params.taskId ?? '';

	let experiment = $state<Experiment | null>(null);
	let task = $state<Experiment['tasks'][0] | null>(null);
	let isLoading = $state(true);
	let submissionData = $state<Record<string, unknown> | null>(null);

	let unsubscribe: (() => void) | null = null;

	function assignTask(exp: Experiment | null) {
		if (!exp) {
			task = null;
			return;
		}
		task = exp.tasks.find((t) => t.id === taskId) ?? null;
	}

function navigateToTask() {
	if (task) {
		goto(getTaskPath(experimentId, task));
	} else {
		goto(`/experiments/${experimentId}/start`);
	}
}

	onMount(() => {
		unsubscribe = currentExperiment.subscribe((value) => {
			experiment = value;
			assignTask(value);
		});

		if (!experiment) {
			const restored = restoreCurrentExperiment();
			if (restored) {
				experiment = restored;
				assignTask(restored);
			}
		}

		if (!experiment || !task) {
			goto(`/experiments/${experimentId}/start`);
			return;
		}

		// LocalStorageから送信データを取得
		const storedData = localStorage.getItem(`task-submission-${taskId}`);
		if (storedData) {
			try {
				submissionData = JSON.parse(storedData);
			} catch (e) {
				console.error('Failed to parse submission data:', e);
			}
		}

		if (!submissionData) {
			// 送信データがない場合はタスクページに戻る
		navigateToTask();
			return;
		}

		isLoading = false;
	});

	onDestroy(() => {
		unsubscribe?.();
	});

	function handleComplete() {
		if (!task) return;

		// ログを記録
		if (submissionData) {
			logEvent('feedback', {
				taskId,
				submissionData
			});
		}

		// タスクを完了
		completeTask(taskId);

		// 送信データを削除
		localStorage.removeItem(`task-submission-${taskId}`);

		// 完了画面に遷移
		goto(`/experiments/${experimentId}/complete`);
	}

	function handleBack() {
	navigateToTask();
	}
</script>

<svelte:head>
	<title>回答確認 | 実験タスク</title>
</svelte:head>

{#if isLoading}
	<div class="flex h-72 items-center justify-center text-gray-600">読み込んでいます...</div>
{:else if !task || !submissionData}
	<div class="flex h-72 items-center justify-center text-gray-600">
		データが見つかりませんでした。
	</div>
{:else}
	<div class="space-y-6">
		<Card>
			<CardHeader>
				<CardTitle class="flex items-center gap-2">
					<CheckCircle size={24} class="text-green-600" />
					回答確認
				</CardTitle>
			</CardHeader>
			<CardContent class="space-y-6">
				<div class="rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
					<p class="font-semibold">タスク: {task.title}</p>
					<p class="mt-1">以下の内容で送信しますか？</p>
				</div>

				{#if task.type === 'questionnaire' && submissionData.responses && questionnaire}
					<div class="space-y-4">
						<h3 class="text-lg font-semibold">アンケート回答</h3>
						{#each (submissionData.responses as Array<{ questionId: string; value: string }>) as response}
							{@const question = questionnaire.questions.find((q) => q.id === response.questionId)}
							<div class="rounded-lg border p-4">
								<p class="text-sm font-semibold text-gray-700">
									{question ? question.text : `質問ID: ${response.questionId}`}
								</p>
								<p class="mt-2 text-sm text-gray-600">{response.value}</p>
							</div>
						{/each}
					</div>
				{:else if task.type === 'comprehension-test' && submissionData.answers && comprehension}
					<div class="space-y-4">
						<h3 class="text-lg font-semibold">理解度テスト回答</h3>
						{#each (submissionData.answers as Array<{ questionId: string; answer: number }>) as answer}
							{@const question = comprehension.questions.find((q) => q.id === answer.questionId)}
							<div class="rounded-lg border p-4">
								<p class="text-sm font-semibold text-gray-700">
									{question ? question.question : `質問ID: ${answer.questionId}`}
								</p>
								<p class="mt-2 text-sm text-gray-600">
									{question && question.options[answer.answer]
										? question.options[answer.answer]
										: `回答: ${answer.answer}`}
								</p>
							</div>
						{/each}
						{#if submissionData.score !== undefined}
							<div class="rounded-lg border border-green-200 bg-green-50 p-4">
								<p class="text-sm font-semibold text-green-700">
									正答率: {submissionData.score}%
								</p>
							</div>
						{/if}
					</div>
				{:else if task.type === 'helpful-votes' && submissionData.votes}
					<div class="space-y-4">
						<h3 class="text-lg font-semibold">Helpful投票</h3>
						<div class="rounded-lg border p-4">
							<p class="text-sm font-semibold text-gray-700">
								投票数: {Object.keys(submissionData.votes as Record<string, unknown>).length}件
							</p>
						</div>
					</div>
				{:else if task.type === 'sentence-annotations' && submissionData.annotations}
					<div class="space-y-4">
						<h3 class="text-lg font-semibold">センテンス評価</h3>
						<div class="rounded-lg border p-4">
							<p class="text-sm font-semibold text-gray-700">
								評価数: {Object.keys(submissionData.annotations as Record<string, unknown>).length}件
							</p>
						</div>
					</div>
				{:else if task.type === 'text-feedback' && submissionData.feedbacks}
					<div class="space-y-4">
						<h3 class="text-lg font-semibold">テキストフィードバック</h3>
						<div class="rounded-lg border p-4">
							<p class="text-sm font-semibold text-gray-700">
								コメント数: {Object.keys(submissionData.feedbacks as Record<string, unknown>).length}件
							</p>
						</div>
					</div>
				{:else}
					<div class="rounded-lg border p-4">
						<p class="text-sm text-gray-600">送信データを確認できませんでした。</p>
					</div>
				{/if}

				<div class="flex items-center justify-between border-t pt-4">
					<Button variant="outline" onclick={handleBack}>
						<ArrowLeft size={16} class="mr-2" />
						戻る
					</Button>
					<Button onclick={handleComplete}>
						完了する
						<CheckCircle size={16} class="ml-2" />
					</Button>
				</div>
			</CardContent>
		</Card>
	</div>
{/if}


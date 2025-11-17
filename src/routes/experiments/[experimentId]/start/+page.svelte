<script lang="ts">
	import { page } from '$app/stores';
	import { get } from 'svelte/store';
	import { goto } from '$app/navigation';
	import ExperimentInstructions from '$features/experiments/ExperimentInstructions.svelte';
	import {
		createTextVsSelectionExperiment,
		createNumericEvaluationExperiment,
		createEffectivenessExperiment
	} from '$lib/experiments/experiments';
	import { startExperiment, restoreParticipantData } from '$lib/experiments/store';
	import type { Experiment } from '$lib/experiments/types';
	import { getTaskPath } from '$lib/experiments/navigation';
	import { onMount } from 'svelte';

	const params = get(page).params;
	const experimentId = params.experimentId ?? '';

	function buildExperiment(randomize = true): Experiment | null {
		switch (experimentId) {
			case 'text-vs-selection':
				return createTextVsSelectionExperiment(randomize);
			case 'numeric-evaluation':
				return createNumericEvaluationExperiment();
			case 'effectiveness':
				return createEffectivenessExperiment('treatment');
			default:
				return null;
		}
	}

	let previewExperiment = $state<Experiment | null>(null);

	onMount(() => {
		// 既存の実験履歴を確認
		const participantData = restoreParticipantData();
		const existing = participantData?.experiments.find((exp) => exp.id === experimentId);
		
		if (existing) {
			// 既存の実験を使用
			previewExperiment = existing;
		} else {
			// 新規実験を作成
			previewExperiment = buildExperiment();
		}
	});

	function handleStart() {
		const exp = previewExperiment;
		if (!exp) return;

		startExperiment(exp);

		// 最初の未完了タスクまたは最初のタスクへ移動
		const firstIncompleteTask = exp.tasks.find((t) => !t.completed);
		const targetTask = firstIncompleteTask || exp.tasks[0];
		goto(getTaskPath(experimentId, targetTask));
	}

	function handleBack() {
		goto('/experiments');
	}
</script>

<svelte:head>
	<title>実験説明 | カスタマーレビューシステム実験</title>
</svelte:head>

<div class="py-8">
	{#if previewExperiment}
		{@const exp = previewExperiment}
		{#if exp}
			<ExperimentInstructions
				experiment={exp}
				onStart={handleStart}
				onClose={handleBack}
				showCloseButton={true}
			/>
		{/if}
	{:else}
		<div class="text-center">
			<p class="text-gray-600">実験が見つかりませんでした</p>
			<button onclick={handleBack} class="mt-4 text-blue-600 hover:underline">
				実験一覧に戻る
			</button>
		</div>
	{/if}
</div>


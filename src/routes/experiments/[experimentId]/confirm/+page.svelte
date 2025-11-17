<script lang="ts">
	import type { PageData } from './$types';
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { get } from 'svelte/store';
	import { goto } from '$app/navigation';
	import { currentExperiment, restoreCurrentExperiment } from '$lib/experiments/store';
	import type { Experiment } from '$lib/experiments/types';
	import { Card, CardContent, CardHeader, CardTitle } from '$shared/components/ui/card';
	import { Button } from '$shared/components/ui/button';
	import { CheckCircle, ArrowLeft } from '@lucide/svelte';
	import { getTaskPath } from '$lib/experiments/navigation';

	let { data }: { data: PageData } = $props();

	const params = get(page).params;
	const experimentId = params.experimentId ?? '';

	let experiment = $state<Experiment | null>(null);
	let isLoading = $state(true);
	let submissionData = $state<Record<string, unknown> | null>(null);

	let unsubscribe: (() => void) | null = null;

	onMount(() => {
		unsubscribe = currentExperiment.subscribe((value) => {
			experiment = value;
		});

		if (!experiment) {
			const restored = restoreCurrentExperiment();
			if (restored) {
				experiment = restored;
			}
		}

		if (!experiment || experiment.id !== experimentId) {
			goto(`/experiments/${experimentId}/start`);
			return;
		}

		// LocalStorageから送信データを取得
		const storedData = localStorage.getItem(`experiment-submission-${experimentId}`);
		if (storedData) {
			try {
				submissionData = JSON.parse(storedData);
			} catch (e) {
				console.error('Failed to parse submission data:', e);
			}
		}

		isLoading = false;
	});

	onDestroy(() => {
		unsubscribe?.();
	});

	function handleComplete() {
		if (!experiment) return;

		// 送信データを削除
		localStorage.removeItem(`experiment-submission-${experimentId}`);

		// 完了画面に遷移
		goto(`/experiments/${experimentId}/complete`);
	}

	function handleBack() {
		// 最後のタスクに戻る
		if (experiment && experiment.tasks.length > 0) {
			const lastTask = experiment.tasks[experiment.tasks.length - 1];
			goto(getTaskPath(experimentId, lastTask));
		} else {
			goto(`/experiments/${experimentId}/start`);
		}
	}
</script>

<svelte:head>
	<title>実験回答確認 | カスタマーレビューシステム実験</title>
</svelte:head>

{#if isLoading}
	<div class="flex h-72 items-center justify-center text-gray-600">読み込んでいます...</div>
{:else if !experiment}
	<div class="flex h-72 items-center justify-center text-gray-600">
		データが見つかりませんでした。
	</div>
{:else}
	<div class="space-y-6">
		<Card>
			<CardHeader>
				<CardTitle class="flex items-center gap-2">
					<CheckCircle size={24} class="text-green-600" />
					実験回答確認
				</CardTitle>
			</CardHeader>
			<CardContent class="space-y-6">
				<div class="rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
					<p class="font-semibold">実験: {experiment.title}</p>
					<p class="mt-1">すべてのタスクが完了しました。以下の内容で送信しますか？</p>
				</div>

				<div class="space-y-4">
					<h3 class="text-lg font-semibold">完了したタスク</h3>
					{#each experiment.tasks as task (task.id)}
						<div class="rounded-lg border p-4">
							<div class="flex items-center justify-between">
								<div>
									<p class="text-sm font-semibold text-gray-700">{task.title}</p>
									<p class="mt-1 text-xs text-gray-500">{task.description}</p>
								</div>
								{#if task.completed}
									<CheckCircle size={20} class="text-green-600" />
								{/if}
							</div>
							{#if task.completedAt}
								<p class="mt-2 text-xs text-gray-500">
									完了時刻: {new Date(task.completedAt).toLocaleString('ja-JP')}
								</p>
							{/if}
						</div>
					{/each}
				</div>

				{#if submissionData}
					<div class="rounded-lg border p-4">
						<p class="text-sm font-semibold text-gray-700">送信データ</p>
						<p class="mt-2 text-xs text-gray-600">
							{Object.keys(submissionData).length}件のデータが記録されています。
						</p>
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

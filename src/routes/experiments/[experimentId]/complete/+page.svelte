<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
import { page } from '$app/stores';
import { get } from 'svelte/store';
	import {
		currentExperiment,
		restoreCurrentExperiment,
		clearCurrentExperiment,
		experimentLogs
	} from '$lib/experiments/store';
	import type { Experiment } from '$lib/experiments/types';
	import { Card, CardContent, CardHeader, CardTitle } from '$shared/components/ui/card';
	import { Badge } from '$shared/components/ui/badge';
	import { Button } from '$shared/components/ui/button';
import { CheckCircle, FlaskConical, Home, ListOrdered } from '@lucide/svelte';

const experimentId = get(page).params.experimentId ?? '';

let experiment = $state<Experiment | null>(null);
let logsCount = $state(0);
let unsubscribeExperiment: (() => void) | null = null;
let unsubscribeLogs: (() => void) | null = null;

onMount(() => {
	unsubscribeExperiment = currentExperiment.subscribe((value) => {
		experiment = value;
	});

	unsubscribeLogs = experimentLogs.subscribe((value) => {
		logsCount = value.length;
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

	logsCount = get(experimentLogs).length;
});

	function finish() {
		clearCurrentExperiment();
		goto('/experiments');
	}

onDestroy(() => {
	unsubscribeExperiment?.();
	unsubscribeLogs?.();
});
</script>

<svelte:head>
	<title>実験完了 | カスタマーレビューシステム実験</title>
</svelte:head>

{#if !experiment}
	<div class="flex h-72 items-center justify-center text-gray-600">
		実験情報を読み込んでいます...
	</div>
{:else}
	<div class="space-y-6">
		<Card class="border-none bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-xl">
			<CardContent class="space-y-4 p-8">
				<div class="flex items-center gap-3">
					<CheckCircle size={28} />
					<h1 class="text-3xl font-bold">完了しました</h1>
				</div>
				<p class="text-lg leading-relaxed text-white/90">
					お疲れ様でした。ご協力ありがとうございました。
				</p>
				<p class="text-sm leading-relaxed text-white/80">
					以下は実験の完了サマリーです。
				</p>
				<div class="flex flex-wrap gap-2">
					<Badge variant="secondary" class="bg-white/20 text-white">
						{experiment.title}
					</Badge>
					<Badge variant="secondary" class="bg-white/20 text-white">
						タスク数: {experiment.tasks.length}
					</Badge>
				</div>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>タスク一覧</CardTitle>
			</CardHeader>
			<CardContent class="space-y-4">
				{#each experiment.tasks as task (task.id)}
					<div class="rounded-lg border border-gray-200 p-4">
						<div class="flex flex-wrap items-center justify-between gap-2">
							<div>
								<p class="text-sm font-semibold text-gray-800">{task.title}</p>
								<p class="text-xs text-gray-500">{task.description}</p>
							</div>
							<Badge variant="outline">{task.type}</Badge>
						</div>
						<div class="mt-2 text-xs text-gray-500">
							完了時刻: {task.completedAt ? new Date(task.completedAt).toLocaleString('ja-JP') : '---'}
						</div>
					</div>
				{/each}
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>収集されたログ</CardTitle>
			</CardHeader>
			<CardContent class="text-sm text-gray-600">
				実験中に {logsCount} 件の操作ログが記録されました。必要に応じてエクスポート機能を追加してください。
			</CardContent>
		</Card>

		<div class="flex flex-wrap gap-3">
			<Button variant="outline" href="/">
				<Home size={16} class="mr-2" />
				ホームに戻る
			</Button>
			<Button variant="outline" href="/experiments">
				<ListOrdered size={16} class="mr-2" />
				実験一覧へ
			</Button>
			<Button onclick={finish}>
				<FlaskConical size={16} class="mr-2" />
				ログアウトして終了
			</Button>
		</div>
	</div>
{/if}


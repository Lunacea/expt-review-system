<script lang="ts">
	import { Card, CardContent } from '$shared/components/ui/card';
	import { Badge } from '$shared/components/ui/badge';
	import { CheckCircle2, Circle } from '@lucide/svelte';
	import type { Experiment } from '$lib/experiments/types';

	interface Props {
		experiment: Experiment;
		compact?: boolean;
	}

	let { experiment, compact = false }: Props = $props();

	const progress = $derived(() => {
		const completed = experiment.tasks.filter((t) => t.completed).length;
		return (completed / experiment.tasks.length) * 100;
	});
</script>

{#if compact}
	<div class="rounded-lg border bg-white p-3">
		<div class="mb-2 flex items-center justify-between">
			<span class="text-sm font-semibold">進捗状況</span>
			<Badge variant="secondary">{progress().toFixed(0)}%</Badge>
		</div>
		<div class="h-2 overflow-hidden rounded-full bg-gray-200">
			<div class="h-full bg-blue-500 transition-all" style="width: {progress()}%"></div>
		</div>
		<div class="mt-2 text-xs text-gray-600">
			{experiment.tasks.filter((t) => t.completed).length} / {experiment.tasks.length} タスク完了
		</div>
	</div>
{:else}
	<Card>
		<CardContent class="p-6">
			<h3 class="mb-4 font-semibold">実験の進捗</h3>

			<!-- プログレスバー -->
			<div class="mb-6">
				<div class="mb-2 flex items-center justify-between">
					<span class="text-sm text-gray-600">全体の進捗</span>
					<Badge variant="secondary">{progress().toFixed(0)}%</Badge>
				</div>
				<div class="h-3 overflow-hidden rounded-full bg-gray-200">
					<div class="h-full bg-blue-500 transition-all" style="width: {progress()}%"></div>
				</div>
			</div>

			<!-- タスク一覧 -->
			<div class="space-y-3">
				{#each experiment.tasks as task, index}
					<div
						class="flex items-center gap-3 rounded-lg border p-3 {task.completed
							? 'bg-green-50'
							: experiment.currentTaskIndex === index
								? 'border-blue-500 bg-blue-50'
								: ''}"
					>
						{#if task.completed}
							<CheckCircle2 class="text-green-600" size={20} />
						{:else if experiment.currentTaskIndex === index}
							<Circle class="text-blue-600" size={20} />
						{:else}
							<Circle class="text-gray-300" size={20} />
						{/if}

						<div class="flex-1">
							<div class="flex items-center gap-2">
								<span class="text-sm font-medium">{task.title}</span>
								{#if experiment.currentTaskIndex === index && !task.completed}
									<Badge variant="default" class="text-xs">実施中</Badge>
								{:else if task.completed}
									<Badge variant="secondary" class="text-xs">完了</Badge>
								{/if}
							</div>
							<p class="text-xs text-gray-600">{task.description}</p>
						</div>
					</div>
				{/each}
			</div>
		</CardContent>
	</Card>
{/if}


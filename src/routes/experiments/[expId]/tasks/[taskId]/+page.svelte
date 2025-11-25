<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	// Components
	import HelpfulVotesTask from '$features/tasks/HelpfulVotesTask.svelte';
	import TextFeedbackTask from '$features/tasks/TextFeedbackTask.svelte';
	import SentenceAnnotationTask from '$features/tasks/SentenceAnnotationTask.svelte';
	import QuestionnaireTask from '$features/tasks/QuestionnaireTask.svelte';
	import ComprehensionTestTask from '$features/tasks/ComprehensionTestTask.svelte';

	let { data, form } = $props();

	let experiment = $derived(data.experiment);
	let task = $derived(data.task);
	let status = $derived(data.status);
	let nextTask = $derived(data.nextTask);

	let currentStatus = $state(data.status);
	let taskData = $state({});

	$effect(() => {
		currentStatus = data.status;
		taskData = {};
	});

	$effect(() => {
		if (form?.success) {
			currentStatus = 'completed';
		}
	});

	function handleTaskComplete(e: CustomEvent) {
		taskData = e.detail;
	}
</script>

{#key task.id}
	<div class="space-y-6">
		<div class="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
			<div class="mb-6 md:flex md:items-center md:justify-between">
				<h2 class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
					{experiment.title} / {task.title}
				</h2>
				<a href="/experiments" class="text-indigo-600 hover:text-indigo-900">一覧に戻る</a>
			</div>

			<div class="mt-6 border-t border-gray-200 pt-6">
				{#if task.type === 'helpful_votes'}
					<HelpfulVotesTask {...task.props || {}} on:complete={handleTaskComplete} />
				{:else if task.type === 'text_feedback'}
					<TextFeedbackTask {...task.props || {}} on:complete={handleTaskComplete} />
				{:else if task.type === 'sentence_annotation'}
					<SentenceAnnotationTask {...task.props || {}} on:complete={handleTaskComplete} />
				{:else if task.type === 'questionnaire'}
					<QuestionnaireTask {...task.props || {}} on:complete={handleTaskComplete} />
				{:else if task.type === 'comprehension_test'}
					<ComprehensionTestTask {...task.props || {}} on:complete={handleTaskComplete} />
				{:else}
					<p class="text-gray-700">Unknown Task Type: {task.type}</p>
				{/if}
			</div>

			<div class="mt-8 flex justify-end space-x-4">
				{#if currentStatus !== 'completed'}
					<form method="POST" action="?/complete" use:enhance>
						<input type="hidden" name="result" value={JSON.stringify(taskData)} />

						<button
							type="submit"
							disabled={false}
							class="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-300"
						>
							タスクを完了して保存
						</button>
					</form>
				{:else}
					<span
						class="inline-flex items-center rounded-md border border-transparent bg-green-100 px-4 py-2 text-sm font-medium text-green-700"
					>
						完了済み
					</span>
				{/if}

				<div class="ml-4">
					{#if nextTask}
						<a
							href="/experiments/{experiment.id}/tasks/{nextTask.id}"
							data-sveltekit-preload-data="hover"
							class="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                        {currentStatus !== 'completed' ? 'pointer-events-none opacity-50' : ''}"
						>
							次のタスクへ
						</a>
					{:else}
						<a
							href="/experiments/{experiment.id}/complete"
							class="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                        {currentStatus !== 'completed' ? 'pointer-events-none opacity-50' : ''}"
						>
							実験完了確認へ
						</a>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/key}

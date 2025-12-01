<script lang="ts">
	import { enhance } from '$app/forms';
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
	let nextTask = $derived(data.nextTask);

	let currentStatus = $state(data.status);
	let taskData = $state({});
	// Validation flag from child components (default true for optional tasks, false for required ones like questionnaire)
	let isTaskValid = $state(true);

	$effect(() => {
		currentStatus = data.status;
		// Reset valid state when task changes or status resets
		if (data.status === 'completed') {
			isTaskValid = true;
		} else {
			// Default validity depends on task type potentially, but here we listen to component events
			// For safety, assume invalid if it's a strict task, but most are optional now except Questionnaire/Quiz
			isTaskValid = !['questionnaire', 'comprehension_test'].includes(task.type);
		}
		taskData = {};
	});

	$effect(() => {
		if (form?.success) {
			if (form.reset) {
				currentStatus = 'pending';
				isTaskValid = !['questionnaire', 'comprehension_test'].includes(task.type); // Reset validity
			} else {
				currentStatus = 'completed';
			}
		}
	});

	function handleTaskChange(e: CustomEvent) {
		taskData = e.detail;
		// Check specific validity properties if sent
		if (e.detail.isValid !== undefined) {
			isTaskValid = e.detail.isValid;
		} else if (e.detail.isComplete !== undefined) {
			isTaskValid = e.detail.isComplete;
		} else {
			// For annotation/helpful/text, it's always valid (optional)
			isTaskValid = true;
		}
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
				<!-- If completed, show message or read-only view? 
                     Requirement: "Ability to make incomplete". 
                     So we should probably show the active task even if completed, 
                     but maybe with current values? 
                     For now, let's keep it editable. -->

				{#if task.type === 'helpful_votes'}
					<HelpfulVotesTask {...task.props || {}} on:change={handleTaskChange} />
				{:else if task.type === 'text_feedback'}
					<TextFeedbackTask {...task.props || {}} on:change={handleTaskChange} />
				{:else if task.type === 'sentence_annotation'}
					<SentenceAnnotationTask {...task.props || {}} on:change={handleTaskChange} />
				{:else if task.type === 'questionnaire'}
					<QuestionnaireTask {...task.props || {}} on:change={handleTaskChange} />
				{:else if task.type === 'comprehension_test'}
					<ComprehensionTestTask {...task.props || {}} on:change={handleTaskChange} />
				{:else}
					<p class="text-gray-700">Unknown Task Type: {task.type}</p>
				{/if}
			</div>

			<div
				class="sticky bottom-0 mt-8 flex justify-end space-x-4 border-t bg-white bg-opacity-90 pb-2 pt-4 backdrop-blur"
			>
				{#if currentStatus !== 'completed'}
					<form method="POST" action="?/complete" use:enhance>
						<input type="hidden" name="action" value="complete" />
						<input type="hidden" name="result" value={JSON.stringify(taskData)} />

						<button
							type="submit"
							disabled={!isTaskValid}
							class="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-300"
						>
							タスクを完了して保存
						</button>
					</form>
				{:else}
					<div class="flex items-center space-x-4">
						<span
							class="inline-flex items-center rounded-md border border-transparent bg-green-100 px-4 py-2 text-sm font-medium text-green-700"
						>
							完了済み
						</span>

						<form method="POST" action="?/complete" use:enhance>
							<input type="hidden" name="action" value="reset" />
							<button
								type="submit"
								class="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-red-600 shadow-sm hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
							>
								未完了に戻す（データをクリア）
							</button>
						</form>
					</div>
				{/if}

				<div class="ml-4 border-l pl-4">
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

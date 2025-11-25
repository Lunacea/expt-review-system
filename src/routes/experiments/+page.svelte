<script lang="ts">
	import { ALL_EXPERIMENTS } from '$lib/config';

	let { data } = $props();
	const user = data.user;

	// Use user-specific order if defined, else default
	// We want to show tasks in the order the user sees them
	function getUserTasks(expId: string) {
		const defaultTasks = ALL_EXPERIMENTS.find((e) => e.id === expId)?.tasks || [];
		const order = user.experimentOrder?.[expId];

		if (!order) return defaultTasks;

		// Map order to task objects
		const tasks = order.map((id) => defaultTasks.find((t) => t.id === id)).filter(Boolean);
		return tasks as typeof defaultTasks; // Cast to avoid undefined errors since we filtered
	}

	function getTaskStatus(expId: string, taskId: string) {
		return user.experimentProgress?.[expId]?.tasks?.[taskId]?.status || 'pending';
	}

	function isTaskDisabled(expId: string, taskId: string, taskList: any[]) {
		const status = getTaskStatus(expId, taskId);
		if (status === 'completed') return true;

		// Find index in the specific list
		const index = taskList.findIndex((t) => t.id === taskId);
		if (index > 0) {
			const prevTask = taskList[index - 1];
			if (prevTask) {
				const prevStatus = getTaskStatus(expId, prevTask.id);
				if (prevStatus !== 'completed') return true;
			}
		}
		return false;
	}

	function isExperimentCompleted(expId: string, taskList: any[]) {
		const expStatus = user.experimentProgress?.[expId]?.status;
		if (expStatus === 'completed') return true;
		return taskList.every((t) => getTaskStatus(expId, t.id) === 'completed');
	}
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
		<div>
			<h2 class="text-lg font-medium text-gray-900">実験一覧</h2>
			<p class="mt-1 text-sm text-gray-500">割り当てられた順序でタスクを実施してください。</p>
		</div>
		<div>
			{#if user.consent?.pdfPath}
				<a
					href={user.consent.pdfPath}
					target="_blank"
					class="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
				>
					同意書を確認
				</a>
			{/if}
		</div>
	</div>

	<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
		{#each ALL_EXPERIMENTS as experiment}
			{@const taskList = getUserTasks(experiment.id)}
			{@const isCompleted = isExperimentCompleted(experiment.id, taskList)}

			<div
				class="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow {isCompleted
					? 'opacity-75'
					: ''}"
			>
				<div class="bg-gray-50 px-4 py-5 sm:px-6">
					<h3 class="text-lg font-medium leading-6 text-gray-900">{experiment.title}</h3>
					<p class="mt-1 text-sm text-gray-500">{experiment.description}</p>
					{#if isCompleted}
						<span
							class="mt-2 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800"
						>
							完了
						</span>
					{/if}
				</div>
				<div class="px-4 py-5 sm:p-6">
					<ul class="space-y-4">
						{#each taskList as task}
							{@const status = getTaskStatus(experiment.id, task.id)}
							{@const disabled = isTaskDisabled(experiment.id, task.id, taskList)}

							<li>
								<div class="flex items-center justify-between">
									<span
										class="text-sm font-medium {status === 'completed'
											? 'text-gray-400 line-through'
											: 'text-gray-900'}"
									>
										{task.title}
									</span>
									<span
										class="text-xs {status === 'completed'
											? 'text-green-600'
											: status === 'pending'
												? 'text-gray-500'
												: 'text-blue-600'}"
									>
										{status === 'completed' ? '完了' : '未完了'}
									</span>
								</div>
								<div class="mt-2">
									{#if status === 'completed'}
										<button
											disabled
											class="inline-flex w-full cursor-not-allowed items-center justify-center rounded border border-transparent bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-500"
										>
											完了済み
										</button>
									{:else if disabled}
										<button
											disabled
											class="inline-flex w-full cursor-not-allowed items-center justify-center rounded border border-transparent bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-400"
										>
											ロック（前のタスクを完了してください）
										</button>
									{:else}
										<a
											href="/experiments/{experiment.id}/tasks/{task.id}"
											class="inline-flex w-full items-center justify-center rounded border border-transparent bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
										>
											開始する
										</a>
									{/if}
								</div>
							</li>
						{/each}
					</ul>
				</div>
				{#if !isCompleted && taskList.length > 0 && taskList.every((t) => getTaskStatus(experiment.id, t.id) === 'completed')}
					<div class="border-t border-yellow-200 bg-yellow-50 px-4 py-4 sm:px-6">
						<a
							href="/experiments/{experiment.id}/complete"
							class="inline-flex w-full items-center justify-center rounded-md border border-transparent bg-yellow-100 px-4 py-2 text-sm font-medium text-yellow-800 hover:bg-yellow-200"
						>
							実験結果を確認して完了
						</a>
					</div>
				{/if}
			</div>
		{/each}
	</div>

	<!-- Final Completion -->
	{#if ALL_EXPERIMENTS.every((e) => isExperimentCompleted(e.id, getUserTasks(e.id)))}
		<div class="mt-10 pb-10 text-center">
			<a
				href="/complete"
				class="inline-flex items-center rounded-md border border-transparent bg-green-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-green-700"
			>
				全ての実験を終了する
			</a>
		</div>
	{/if}
</div>

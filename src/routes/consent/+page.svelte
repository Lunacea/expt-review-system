<script lang="ts">
	let { form } = $props();
</script>

<div class="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
	<h1 class="text-2xl font-bold mb-6">実験同意書</h1>

	<div class="mb-6 border rounded p-4 bg-gray-50">
		<iframe src="/lib/expt-inst.pdf" class="w-full h-[600px]" title="実験説明書"></iframe>
	</div>

	<form method="POST" action="?/submit" class="space-y-6">
		<div class="flex items-start">
			<div class="flex items-center h-5">
				<input
					id="agree"
					name="agree"
					type="checkbox"
					required
					class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
				/>
			</div>
			<div class="ml-3 text-sm">
				<label for="agree" class="font-medium text-gray-700"
					>説明内容を理解し、実験に参加することに同意します。</label
				>
			</div>
		</div>

		<div>
			<label for="name" class="block text-sm font-medium text-gray-700">氏名（署名）</label>
			<input
				type="text"
				name="name"
				id="name"
				required
				class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
				placeholder="氏名を入力してください"
			/>
		</div>

		{#if form?.error}
			<p class="text-red-600 text-sm">{form.error}</p>
		{/if}

		<div>
			<button
				type="submit"
				class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
			>
				同意して実験一覧へ
			</button>
		</div>
	</form>
</div>


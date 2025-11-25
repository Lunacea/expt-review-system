<script lang="ts">
	let { form } = $props();
</script>

<div class="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-md">
	<h1 class="text-2xl font-bold mb-6 text-center">カスタマーレビューシステム実験</h1>
	
	<div class="mb-8 text-gray-700">
		<p class="mb-2">本実験にご協力いただきありがとうございます。</p>
		<p class="mb-2">以下のフォームに被験者IDを入力してログインしてください。</p>
	</div>

	<form method="POST" action="?/login" class="space-y-4">
		<div>
			<label for="username" class="block text-sm font-medium text-gray-700">被験者ID</label>
			<input 
				type="text" 
				id="username" 
				name="username" 
				required 
				class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
				placeholder="IDを入力"
			/>
		</div>

		{#if form?.error}
			<p class="text-red-600 text-sm">{form.error}</p>
		{/if}

		<button 
			type="submit" 
			class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
		>
			ログイン / 実験開始
		</button>
	</form>
</div>


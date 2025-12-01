<script lang="ts">
	let { children, data } = $props();
</script>

<div class="min-h-screen bg-gray-100">
	<header class="bg-white shadow">
		<div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
			<h1 class="text-3xl font-bold text-gray-900">実験システム</h1>
			<div class="flex items-center space-x-4">
				<span class="text-gray-700">ID: {data.user.username}</span>
				<form action="/auth/logout" method="POST">
					<button type="submit" class="text-sm text-red-600 hover:text-red-800">ログアウト</button>
				</form>
			</div>
		</div>
	</header>
	<main>
		<div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
			{@render children()}
		</div>
	</main>
</div>



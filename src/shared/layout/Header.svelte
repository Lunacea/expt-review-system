<script lang="ts">
	import { getContext } from 'svelte';
	let { children } = $props();
</script>

<header class="flex items-center justify-between border-b p-2">
	<h1 class="text-xl font-bold">{getContext('headerTitle')}</h1>
	{@render children?.()}
</header>

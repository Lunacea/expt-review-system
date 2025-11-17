<script lang="ts">
	import '$shared/styles/app.css';
	import favicon from '$lib/assets/favicon.svg';
	import HeaderWithAvator from '$widgets/layout/HeaderWithAvator.svelte';
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<HeaderWithAvator title="カスタマーレビューシステム実験" />

<main class="mx-auto max-w-screen-md p-2">
	{@render children?.()}
</main>

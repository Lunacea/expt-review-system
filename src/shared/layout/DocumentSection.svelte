<script lang="ts">
	let { heading, children } = $props();
</script>

<section>
	<h2 class="text-lg font-bold">{heading}</h2>
	{@render children?.()}
</section>

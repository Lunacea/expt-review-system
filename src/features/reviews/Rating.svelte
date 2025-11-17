<script lang="ts">
	import { Star } from '@lucide/svelte';

	interface Props {
		rating: number;
		maxRating?: number;
		size?: number;
		showNumber?: boolean;
		class?: string;
	}

	let {
		rating = 5,
		maxRating = 5,
		size = 16,
		showNumber = true,
		class: className = ''
	}: Props = $props();

	// 整数部分と小数部分を取得
	const fullStars = Math.floor(rating);
	const hasHalfStar = rating % 1 >= 0.5;
	const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0);
</script>

<div class="flex items-center gap-1 {className}">
	{#each Array(fullStars) as _, i (i)}
		<Star class="fill-yellow-400 text-yellow-400" {size} />
	{/each}
	{#if hasHalfStar}
		<div class="relative">
			<Star class="text-yellow-400" {size} />
			<div class="absolute inset-0 overflow-hidden" style="width: 50%">
				<Star class="fill-yellow-400 text-yellow-400" {size} />
			</div>
		</div>
	{/if}
	{#each Array(emptyStars) as _, i (i)}
		<Star class="text-gray-300" {size} />
	{/each}
	{#if showNumber}
		<span class="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
	{/if}
</div>

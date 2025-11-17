<script lang="ts">
	import type { PageData } from './$types';
	import { Card, CardContent, CardHeader, CardTitle } from '$shared/components/ui/card';
	import { Badge } from '$shared/components/ui/badge';
	import Rating from '$features/reviews/Rating.svelte';

	let { data }: { data: PageData } = $props();
	const { products } = data;
</script>

<svelte:head>
	<title>商品一覧 | カスタマーレビューシステム</title>
</svelte:head>

<div class="space-y-6">
	<div class="border-b pb-4">
		<h1 class="text-3xl font-bold">商品一覧</h1>
		<p class="mt-2 text-gray-600">レビューシステムの実験用商品カタログ</p>
	</div>

	<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each products as product (product.id)}
			<a href="/product/{product.slug}" class="block transition-transform hover:scale-105">
				<Card class="h-full">
					<CardHeader>
						<div class="aspect-square overflow-hidden rounded-lg">
							<img
								src={product.image}
								alt={product.name}
								class="h-full w-full object-cover"
							/>
						</div>
					</CardHeader>
					<CardContent class="space-y-3">
						<div>
							<Badge variant="outline" class="mb-2 text-xs">{product.category}</Badge>
							<CardTitle class="text-lg">{product.name}</CardTitle>
						</div>

						<div class="flex items-center gap-2">
							<Rating rating={product.averageRating} size={14} showNumber={true} />
							<span class="text-sm text-gray-500">({product.totalReviews}件)</span>
						</div>

						<div class="text-xl font-bold text-red-600">
							¥{product.price.toLocaleString('ja-JP')}
						</div>
					</CardContent>
				</Card>
			</a>
		{/each}
	</div>
</div>


<script lang="ts">
	import type { PageData } from './$types';
	import { Card, CardContent, CardHeader, CardTitle } from '$shared/components/ui/card';
	import { Badge } from '$shared/components/ui/badge';
	import { Button } from '$shared/components/ui/button';
	import { Separator } from '$shared/components/ui/separator';
	import Rating from '$features/reviews/Rating.svelte';
	import ReviewCard from '$features/reviews/ReviewCard.svelte';
	import { MessageSquare, FileText, ThumbsUp } from '@lucide/svelte';

	let { data }: { data: PageData } = $props();

	const { product, reviews } = data;

	// 評価の分布を計算
	const ratingDistribution = [5, 4, 3, 2, 1].map((star) => {
		const count = reviews.filter((r) => r.rating === star).length;
		const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
		return { star, count, percentage };
	});
</script>

<svelte:head>
	<title>{product.name} | カスタマーレビューシステム</title>
</svelte:head>

<div class="space-y-6">
	<!-- 商品情報 -->
	<Card>
		<CardContent class="p-6">
			<div class="grid gap-6 md:grid-cols-2">
				<div class="aspect-square overflow-hidden rounded-lg">
					<img src={product.image} alt={product.name} class="h-full w-full object-cover" />
				</div>

				<div class="space-y-4">
					<div>
						<Badge variant="outline" class="mb-2">{product.category}</Badge>
						<h1 class="text-3xl font-bold">{product.name}</h1>
					</div>

					<div class="flex items-center gap-3">
						<Rating rating={product.averageRating} size={20} />
						<span class="text-lg font-semibold">{product.totalReviews}件のレビュー</span>
					</div>

					<div class="text-3xl font-bold text-red-600">
						¥{product.price.toLocaleString('ja-JP')}
					</div>

					<div class="flex gap-3">
						<Button class="flex-1">カートに追加</Button>
						<Button variant="outline" class="flex-1">お気に入り</Button>
					</div>
				</div>
			</div>
		</CardContent>
	</Card>

	<!-- レビュー機能へのリンク -->
	<Card>
		<CardHeader>
			<CardTitle>レビュー機能を試す</CardTitle>
		</CardHeader>
		<CardContent>
			<div class="grid gap-4 md:grid-cols-3">
				<a href="/product/{product.slug}/helpful-votes" class="block">
					<Button variant="outline" class="h-full w-full flex-col gap-2 py-6">
						<ThumbsUp size={24} />
						<div class="text-center">
							<div class="font-semibold">Helpful投票</div>
							<div class="text-xs text-gray-500">一般的な投票機能</div>
						</div>
					</Button>
				</a>

				<a href="/product/{product.slug}/sentence-annotations" class="block">
					<Button variant="outline" class="h-full w-full flex-col gap-2 py-6">
						<FileText size={24} />
						<div class="text-center">
							<div class="font-semibold">センテンス評価</div>
							<div class="text-xs text-gray-500">文単位での投票</div>
						</div>
					</Button>
				</a>

				<a href="/product/{product.slug}/text-feedback" class="block">
					<Button variant="outline" class="h-full w-full flex-col gap-2 py-6">
						<MessageSquare size={24} />
						<div class="text-center">
							<div class="font-semibold">テキストフィードバック</div>
							<div class="text-xs text-gray-500">スレッド式返信</div>
						</div>
					</Button>
				</a>
			</div>
		</CardContent>
	</Card>

	<!-- 評価の分布 -->
	<Card>
		<CardHeader>
			<CardTitle>カスタマーレビュー</CardTitle>
		</CardHeader>
		<CardContent class="space-y-4">
			<div class="grid gap-6 md:grid-cols-2">
				<div class="flex flex-col items-center justify-center text-center">
					<div class="text-5xl font-bold">{product.averageRating.toFixed(1)}</div>
					<Rating rating={product.averageRating} size={20} showNumber={false} class="mt-2" />
					<div class="mt-2 text-sm text-gray-600">{product.totalReviews}件の評価</div>
				</div>

				<div class="space-y-2">
					{#each ratingDistribution as dist (dist.star)}
						<div class="flex items-center gap-2">
							<span class="w-12 text-sm">{dist.star}つ星</span>
							<div class="h-4 flex-1 overflow-hidden rounded-full bg-gray-200">
								<div
									class="h-full bg-yellow-400 transition-all"
									style="width: {dist.percentage}%"
								></div>
							</div>
							<span class="w-12 text-right text-sm text-gray-600"
								>{dist.percentage.toFixed(0)}%</span
							>
						</div>
					{/each}
				</div>
			</div>

			<Separator />

			<!-- レビュー一覧 -->
			<div class="space-y-4">
				{#each reviews as review (review.id)}
					<ReviewCard {review} showHelpfulVotes={true} />
				{/each}
			</div>
		</CardContent>
	</Card>
</div>

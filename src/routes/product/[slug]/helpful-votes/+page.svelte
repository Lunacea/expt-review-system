<script lang="ts">
	import type { PageData } from './$types';
	import { Card, CardContent, CardHeader, CardTitle } from '$shared/components/ui/card';
	import { Badge } from '$shared/components/ui/badge';
	import { Button } from '$shared/components/ui/button';
	import { Avatar, AvatarFallback, AvatarImage } from '$shared/components/ui/avatar';
	import Rating from '$features/reviews/Rating.svelte';
	import { ThumbsUp, ThumbsDown, ChevronLeft } from '@lucide/svelte';

	let { data }: { data: PageData } = $props();
	const { product, reviews } = data;

	// 各レビューの投票状態を管理
	let voteState = $state<Record<string, 'helpful' | 'not-helpful' | null>>(
		Object.fromEntries(reviews.map((r) => [r.id, null]))
	);

	// 各レビューの投票数を管理（モック）
	let voteCounts = $state<Record<string, { helpful: number; notHelpful: number }>>(
		Object.fromEntries(
			reviews.map((r) => [
				r.id,
				{ helpful: r.helpfulVotes, notHelpful: r.totalVotes - r.helpfulVotes }
			])
		)
	);

	function handleVote(reviewId: string, voteType: 'helpful' | 'not-helpful') {
		const currentVote = voteState[reviewId];

		// 既に同じ投票をしている場合は取り消し
		if (currentVote === voteType) {
			voteState[reviewId] = null;
			if (voteType === 'helpful') {
				voteCounts[reviewId].helpful--;
			} else {
				voteCounts[reviewId].notHelpful--;
			}
			return;
		}

		// 別の投票から変更する場合
		if (currentVote !== null) {
			if (currentVote === 'helpful') {
				voteCounts[reviewId].helpful--;
			} else {
				voteCounts[reviewId].notHelpful--;
			}
		}

		// 新しい投票を記録
		voteState[reviewId] = voteType;
		if (voteType === 'helpful') {
			voteCounts[reviewId].helpful++;
		} else {
			voteCounts[reviewId].notHelpful++;
		}
	}

	function getInitials(name: string): string {
		return name.charAt(0);
	}

	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		return date.toLocaleDateString('ja-JP', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	// 連続した改行を1つだけ減らす（2つ以上の連続した改行を1つ減らす）
	function normalizeNewlines(text: string): string {
		// Windows改行（\r\n）とUnix改行（\n）の両方に対応
		// 2つ以上の連続した改行を1つ減らす
		return text
			.replace(/(\r\n){2,}/g, (match) => match.slice(0, -2)) // Windows改行: 2つ以上を1つ減らす
			.replace(/\n{2,}/g, (match) => match.slice(0, -1)); // Unix改行: 2つ以上を1つ減らす
	}
</script>

<svelte:head>
	<title>Helpful投票 - {product.name} | カスタマーレビューシステム</title>
</svelte:head>

<div class="space-y-6">
	<!-- ヘッダー -->
	<div class="flex items-center gap-4">
		<a href="/product/{product.slug}">
			<Button variant="outline" size="icon">
				<ChevronLeft size={20} />
			</Button>
		</a>
		<div>
			<h1 class="text-3xl font-bold">Helpful投票機能</h1>
			<p class="mt-1 text-gray-600">レビューの有用性を評価できます</p>
		</div>
	</div>

	<!-- 商品情報カード -->
	<Card>
		<CardContent class="flex items-center gap-4 p-4">
			<img src={product.image} alt={product.name} class="h-20 w-20 rounded-lg object-cover" />
			<div>
				<Badge variant="outline" class="mb-1 text-xs">{product.category}</Badge>
				<h2 class="text-lg font-semibold">{product.name}</h2>
				<div class="mt-1 flex items-center gap-2">
					<Rating rating={product.averageRating} size={14} />
					<span class="text-sm text-gray-600">({product.totalReviews}件)</span>
				</div>
			</div>
		</CardContent>
	</Card>

	<!-- 説明カード -->
	<Card class="border-l-4 border-l-blue-500 bg-blue-50">
		<CardContent class="p-4">
			<h3 class="font-semibold">この機能について</h3>
			<p class="mt-2 text-sm text-gray-700">
				各レビューに対して「参考になった」または「参考にならなかった」を投票できます。投票結果は他のユーザーがレビューの有用性を判断する際の参考になります。
			</p>
		</CardContent>
	</Card>

	<!-- レビュー一覧 -->
	<div class="space-y-4">
		{#each reviews as review (review.id)}
			{@const counts = voteCounts[review.id]}
			{@const userVote = voteState[review.id]}
			{@const totalVotes = counts.helpful + counts.notHelpful}
			{@const helpfulPercentage = totalVotes > 0 ? (counts.helpful / totalVotes) * 100 : 0}

			<Card class="overflow-hidden">
				<CardHeader>
					<div class="flex items-start gap-3">
						<Avatar>
							<AvatarImage src={review.userAvatar} alt={review.userName} />
							<AvatarFallback>{getInitials(review.userName)}</AvatarFallback>
						</Avatar>
						<div class="flex-1">
							<div class="flex items-center gap-2">
							<span class="font-semibold">{review.userName}</span>
						</div>
							<div class="mt-1 flex items-center gap-2">
								<Rating rating={review.rating} size={14} showNumber={false} />
								<span class="text-sm font-bold">{review.title}</span>
							</div>
							<div class="mt-1 text-xs text-gray-500">
								{formatDate(review.createdAt)}にレビュー済み
							</div>
						</div>
					</div>
				</CardHeader>
				<CardContent class="space-y-4">
					<p class="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
						{normalizeNewlines(review.content)}
					</p>

					<!-- 投票統計 -->
					{#if totalVotes > 0}
						<div class="rounded-lg bg-gray-50 p-3">
							<div class="flex items-center justify-between text-sm">
								<span class="text-gray-600">
									{totalVotes}人中{counts.helpful}人が参考になったと回答
								</span>
								<span class="font-semibold text-green-600">
									{helpfulPercentage.toFixed(0)}%
								</span>
							</div>
							<div class="mt-2 h-2 overflow-hidden rounded-full bg-gray-200">
								<div
									class="h-full bg-green-500 transition-all duration-300"
									style="width: {helpfulPercentage}%"
								></div>
							</div>
						</div>
					{/if}

					<!-- 投票ボタン -->
					<div class="flex items-center gap-3 border-t pt-4">
						<span class="text-sm font-semibold text-gray-700"
							>このレビューは参考になりましたか？</span
						>
						<Button
							variant={userVote === 'helpful' ? 'default' : 'outline'}
							size="sm"
							onclick={() => handleVote(review.id, 'helpful')}
							class="gap-1"
						>
							<ThumbsUp size={14} class={userVote === 'helpful' ? 'fill-white' : ''} />
							はい ({counts.helpful})
						</Button>
						<Button
							variant={userVote === 'not-helpful' ? 'default' : 'outline'}
							size="sm"
							onclick={() => handleVote(review.id, 'not-helpful')}
							class="gap-1"
						>
							<ThumbsDown size={14} class={userVote === 'not-helpful' ? 'fill-white' : ''} />
							いいえ ({counts.notHelpful})
						</Button>
					</div>

					<!-- 投票済みメッセージ -->
					{#if userVote !== null}
						<div class="rounded-md bg-green-50 p-2 text-center text-sm text-green-700">
							投票ありがとうございます！もう一度クリックすると取り消せます。
						</div>
					{/if}
				</CardContent>
			</Card>
		{/each}
	</div>
</div>

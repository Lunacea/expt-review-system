<script lang="ts">
	import type { Review } from '$lib/types/reviews';
	import Rating from '$features/reviews/Rating.svelte';
	import { Card, CardContent, CardHeader } from '$shared/components/ui/card';
	import { Badge } from '$shared/components/ui/badge';
	import { Avatar, AvatarFallback, AvatarImage } from '$shared/components/ui/avatar';
	import { ThumbsUp, ThumbsDown } from '@lucide/svelte';

	interface Props {
		review: Review;
		showHelpfulVotes?: boolean;
		class?: string;
	}

	let { review, showHelpfulVotes = false, class: className = '' }: Props = $props();

	// 日付をフォーマット
	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		return date.toLocaleDateString('ja-JP', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	// ユーザー名のイニシャルを取得
	function getInitials(name: string): string {
		return name.charAt(0);
	}

	// 連続した改行を1つだけ減らす（2つ以上の連続した改行を1つ減らす）
	function normalizeNewlines(text: string): string {
		// Windows改行（\r\n）とUnix改行（\n）の両方に対応
		// 2つ以上の連続した改行を1つ減らす
		return text
			.replace(/(\r\n){2,}/g, (match) => {
				// 最後の\r\nを1つだけ削除
				return match.slice(0, -2);
			})
			.replace(/\n{2,}/g, (match) => {
				// 最後の\nを1つだけ削除
				return match.slice(0, -1);
			});
	}
</script>

<Card class={className}>
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
	<CardContent>
		<p class="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
			{normalizeNewlines(review.content)}
		</p>

		{#if showHelpfulVotes && review.totalVotes > 0}
			<div class="mt-4 flex items-center gap-2 border-t pt-3">
				<span class="text-sm text-gray-600">
					{review.helpfulVotes}人中{review.totalVotes}人が参考になったと回答
				</span>
			</div>
		{/if}

		<div class="mt-4 flex items-center gap-2">
			<span class="text-sm text-gray-600">このレビューは参考になりましたか？</span>
			<button
				class="flex items-center gap-1 rounded-md border px-3 py-1 text-sm transition-colors hover:bg-gray-50"
			>
				<ThumbsUp size={14} />
				はい
			</button>
			<button
				class="flex items-center gap-1 rounded-md border px-3 py-1 text-sm transition-colors hover:bg-gray-50"
			>
				<ThumbsDown size={14} />
				いいえ
			</button>
		</div>
	</CardContent>
</Card>

<script lang="ts">
	import type { PageData } from './$types';
	import type { TextFeedback } from '$lib/types/reviews';
	import { Card, CardContent, CardHeader } from '$shared/components/ui/card';
	import { Badge } from '$shared/components/ui/badge';
	import { Button } from '$shared/components/ui/button';
	import { Avatar, AvatarFallback, AvatarImage } from '$shared/components/ui/avatar';
	import Rating from '$features/reviews/Rating.svelte';
	import { ChevronLeft, MessageSquare, Send, Reply } from '@lucide/svelte';

	let { data }: { data: PageData } = $props();
	const { product, reviews, feedbacks } = data;

	// 各レビューのフィードバックを管理（モック）
	let reviewFeedbacks = $state<Record<string, TextFeedback[]>>(
		Object.fromEntries(Object.entries(feedbacks).map(([id, fb]) => [id, [...fb]]))
	);

	// 返信フォームの表示状態
	let replyingTo = $state<string | null>(null);
	let replyContent = $state<Record<string, string>>({});

	// 新規コメントフォームの表示状態
	let showCommentForm = $state<Record<string, boolean>>(
		Object.fromEntries(reviews.map((r) => [r.id, false]))
	);
	let commentContent = $state<Record<string, string>>({});

	function handleAddComment(reviewId: string) {
		const content = commentContent[reviewId]?.trim();
		if (!content) return;

		const newFeedback: TextFeedback = {
			id: `feedback-${Date.now()}`,
			reviewId,
			userId: 'user-current',
			userName: '現在のユーザー',
			userAvatar: 'https://i.pravatar.cc/150?u=current',
			content,
			createdAt: new Date().toISOString()
		};

		if (!reviewFeedbacks[reviewId]) {
			reviewFeedbacks[reviewId] = [];
		}
		reviewFeedbacks[reviewId] = [...reviewFeedbacks[reviewId], newFeedback];
		commentContent[reviewId] = '';
		showCommentForm[reviewId] = false;
	}

	function handleAddReply(feedbackId: string, reviewId: string) {
		const content = replyContent[feedbackId]?.trim();
		if (!content) return;

		const newReply: TextFeedback = {
			id: `reply-${Date.now()}`,
			reviewId,
			userId: 'user-current',
			userName: '現在のユーザー',
			userAvatar: 'https://i.pravatar.cc/150?u=current',
			content,
			createdAt: new Date().toISOString()
		};

		// 元のフィードバックを見つけて返信を追加
		reviewFeedbacks[reviewId] = reviewFeedbacks[reviewId].map((fb) => {
			if (fb.id === feedbackId) {
				return {
					...fb,
					replies: [...(fb.replies || []), newReply]
				};
			}
			return fb;
		});

		replyContent[feedbackId] = '';
		replyingTo = null;
	}

	function getInitials(name: string): string {
		return name.charAt(0);
	}

	// 連続した改行を1つだけ減らす（2つ以上の連続した改行を1つ減らす）
	function normalizeNewlines(text: string): string {
		// Windows改行（\r\n）とUnix改行（\n）の両方に対応
		// 2つ以上の連続した改行を1つ減らす
		return text
			.replace(/(\r\n){2,}/g, (match) => match.slice(0, -2)) // Windows改行: 2つ以上を1つ減らす
			.replace(/\n{2,}/g, (match) => match.slice(0, -1)); // Unix改行: 2つ以上を1つ減らす
	}

	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);

		if (diffMins < 1) return 'たった今';
		if (diffMins < 60) return `${diffMins}分前`;
		if (diffHours < 24) return `${diffHours}時間前`;
		if (diffDays < 7) return `${diffDays}日前`;

		return date.toLocaleDateString('ja-JP', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>テキストフィードバック - {product.name} | カスタマーレビューシステム</title>
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
			<h1 class="text-3xl font-bold">テキストフィードバック機能</h1>
			<p class="mt-1 text-gray-600">レビューに対して質問や意見を投稿できます</p>
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
	<Card class="border-l-4 border-l-indigo-500 bg-indigo-50">
		<CardContent class="p-4">
			<h3 class="font-semibold">この機能について</h3>
			<p class="mt-2 text-sm text-gray-700">
				レビューに対してコメントを投稿したり、他のユーザーのコメントに返信したりできます。スレッド形式で会話が展開されます。
			</p>
		</CardContent>
	</Card>

	<!-- レビュー一覧 -->
	<div class="space-y-6">
		{#each reviews as review (review.id)}
			{@const feedbackList = reviewFeedbacks[review.id] || []}

			<Card>
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

					<!-- コメントセクション -->
					<div class="border-t pt-4">
						<div class="mb-3 flex items-center justify-between">
							<h4 class="flex items-center gap-2 font-semibold">
								<MessageSquare size={18} />
								<span>フィードバック ({feedbackList.length})</span>
							</h4>
							<Button
								variant="outline"
								size="sm"
								onclick={() => (showCommentForm[review.id] = !showCommentForm[review.id])}
							>
								<MessageSquare size={14} class="mr-1" />
								コメントを追加
							</Button>
						</div>

						<!-- 新規コメント入力フォーム -->
						{#if showCommentForm[review.id]}
							<div class="mb-4 rounded-lg border bg-gray-50 p-4">
								<textarea
									bind:value={commentContent[review.id]}
									placeholder="このレビューに対する質問や意見を入力してください..."
									rows="3"
									class="w-full resize-none rounded-md border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
								></textarea>
								<div class="mt-2 flex justify-end gap-2">
									<Button
										variant="outline"
										size="sm"
										onclick={() => {
											showCommentForm[review.id] = false;
											commentContent[review.id] = '';
										}}
									>
										キャンセル
									</Button>
									<Button
										size="sm"
										onclick={() => handleAddComment(review.id)}
										disabled={!commentContent[review.id]?.trim()}
									>
										<Send size={14} class="mr-1" />
										投稿
									</Button>
								</div>
							</div>
						{/if}

						<!-- フィードバック一覧 -->
						<div class="space-y-4">
							{#each feedbackList as feedback (feedback.id)}
								<div class="rounded-lg border bg-white p-4">
									<div class="flex gap-3">
										<Avatar class="h-8 w-8">
											<AvatarImage src={feedback.userAvatar} alt={feedback.userName} />
											<AvatarFallback>{getInitials(feedback.userName)}</AvatarFallback>
										</Avatar>
										<div class="flex-1">
											<div class="flex items-center gap-2">
												<span class="text-sm font-semibold">{feedback.userName}</span>
												<span class="text-xs text-gray-500">{formatDate(feedback.createdAt)}</span>
											</div>
											<p class="mt-1 text-sm text-gray-700">{feedback.content}</p>

											<button
												onclick={() =>
													(replyingTo = replyingTo === feedback.id ? null : feedback.id)}
												class="mt-2 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
											>
												<Reply size={12} />
												返信
											</button>

											<!-- 返信フォーム -->
											{#if replyingTo === feedback.id}
												<div class="mt-3 rounded-lg border bg-gray-50 p-3">
													<textarea
														bind:value={replyContent[feedback.id]}
														placeholder="返信を入力してください..."
														rows="2"
														class="w-full resize-none rounded-md border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
													></textarea>
													<div class="mt-2 flex justify-end gap-2">
														<Button
															variant="outline"
															size="sm"
															onclick={() => {
																replyingTo = null;
																replyContent[feedback.id] = '';
															}}
														>
															キャンセル
														</Button>
														<Button
															size="sm"
															onclick={() => handleAddReply(feedback.id, review.id)}
															disabled={!replyContent[feedback.id]?.trim()}
														>
															<Send size={14} class="mr-1" />
															返信
														</Button>
													</div>
												</div>
											{/if}

											<!-- 返信一覧 -->
											{#if feedback.replies && feedback.replies.length > 0}
												<div class="ml-6 mt-3 space-y-3 border-l-2 pl-3">
													{#each feedback.replies as reply (reply.id)}
														<div class="flex gap-2">
															<Avatar class="h-6 w-6">
																<AvatarImage src={reply.userAvatar} alt={reply.userName} />
																<AvatarFallback>{getInitials(reply.userName)}</AvatarFallback>
															</Avatar>
															<div class="flex-1">
																<div class="flex items-center gap-2">
																	<span class="text-xs font-semibold">{reply.userName}</span>
																	<span class="text-xs text-gray-500"
																		>{formatDate(reply.createdAt)}</span
																	>
																</div>
																<p class="mt-0.5 text-xs text-gray-700">{reply.content}</p>
															</div>
														</div>
													{/each}
												</div>
											{/if}
										</div>
									</div>
								</div>
							{/each}

							{#if feedbackList.length === 0}
								<p class="text-center text-sm text-gray-500">
									まだフィードバックがありません。最初のコメントを投稿してみましょう！
								</p>
							{/if}
						</div>
					</div>
				</CardContent>
			</Card>
		{/each}
	</div>
</div>

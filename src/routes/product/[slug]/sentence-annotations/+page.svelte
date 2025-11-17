<script lang="ts">
	import type { PageData } from './$types';
	import { Card, CardContent, CardHeader } from '$shared/components/ui/card';
	import { Badge } from '$shared/components/ui/badge';
	import { Button } from '$shared/components/ui/button';
	import { Avatar, AvatarFallback, AvatarImage } from '$shared/components/ui/avatar';
	import Rating from '$features/reviews/Rating.svelte';
	import {
		ChevronLeft,
		Eye,
		CheckCircle2,
		Sparkles,
		Heart,
		FileQuestion,
		AlertTriangle,
		Flag
	} from '@lucide/svelte';

	let { data }: { data: PageData } = $props();
	const { product, reviews } = data;

	// アノテーションタイプの定義
	const annotationTypes = [
		// ポジティブ（寒色）
		{
			type: 'clear-claim',
			label: '明確な主張（わかりやすい）',
			icon: Eye,
			bgColor: 'bg-blue-100 hover:bg-blue-200',
			textColor: 'text-gray-900'
		},
		{
			type: 'convincing',
			label: '納得できる',
			icon: CheckCircle2,
			bgColor: 'bg-cyan-100 hover:bg-cyan-200',
			textColor: 'text-gray-900'
		},
		{
			type: 'multi-perspective',
			label: '多角的な視点（興味深い）',
			icon: Sparkles,
			bgColor: 'bg-teal-100 hover:bg-teal-200',
			textColor: 'text-gray-900'
		},
		{
			type: 'empathy',
			label: '共感できる',
			icon: Heart,
			bgColor: 'bg-indigo-100 hover:bg-indigo-200',
			textColor: 'text-gray-900'
		},
		// ネガティブ（暖色）
		{
			type: 'needs-evidence',
			label: '根拠が必要',
			icon: FileQuestion,
			bgColor: 'bg-orange-100 hover:bg-orange-200',
			textColor: 'text-gray-900'
		},
		{
			type: 'needs-objectivity',
			label: 'もっと客観的に',
			icon: AlertTriangle,
			bgColor: 'bg-amber-100 hover:bg-amber-200',
			textColor: 'text-gray-900'
		},
		{
			type: 'inappropriate',
			label: '内容が不適切',
			icon: Flag,
			bgColor: 'bg-red-100 hover:bg-red-200',
			textColor: 'text-gray-900'
		}
	] as const;

	type AnnotationType = (typeof annotationTypes)[number]['type'];

	// 選択中の文を管理
	let selectedSentenceId = $state<string | null>(null);

	// 各文のアノテーション投票状態を管理
	let sentenceVotes = $state<Record<string, Set<AnnotationType>>>(
		Object.fromEntries(
			reviews.flatMap((review) =>
				(review.sentences || []).map((sentence) => [sentence.id, new Set<AnnotationType>()])
			)
		)
	);

	// 各文のアノテーション集計を管理（モック）
	let sentenceAnnotations = $state<Record<string, Record<AnnotationType, number>>>(
		Object.fromEntries(
			reviews.flatMap((review) =>
				(review.sentences || []).map((sentence) => [
					sentence.id,
					{
						'clear-claim': sentence.annotations.find((a) => a.type === 'clear-claim')?.count || 0,
						convincing: sentence.annotations.find((a) => a.type === 'convincing')?.count || 0,
						'multi-perspective':
							sentence.annotations.find((a) => a.type === 'multi-perspective')?.count || 0,
						empathy: sentence.annotations.find((a) => a.type === 'empathy')?.count || 0,
						'needs-evidence':
							sentence.annotations.find((a) => a.type === 'needs-evidence')?.count || 0,
						'needs-objectivity':
							sentence.annotations.find((a) => a.type === 'needs-objectivity')?.count || 0,
						inappropriate: sentence.annotations.find((a) => a.type === 'inappropriate')?.count || 0
					}
				])
			)
		)
	);

	function toggleAnnotation(sentenceId: string, annotationType: AnnotationType) {
		const votes = sentenceVotes[sentenceId];
		if (votes.has(annotationType)) {
			votes.delete(annotationType);
			sentenceAnnotations[sentenceId][annotationType]--;
		} else {
			votes.add(annotationType);
			sentenceAnnotations[sentenceId][annotationType]++;
		}
		// 状態の更新をトリガー
		sentenceVotes[sentenceId] = new Set(votes);
	}

	function selectSentence(sentenceId: string) {
		selectedSentenceId = sentenceId === selectedSentenceId ? null : sentenceId;
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
	<title>センテンス評価 - {product.name} | カスタマーレビューシステム</title>
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
			<h1 class="text-3xl font-bold">センテンス評価機能</h1>
			<p class="mt-1 text-gray-600">レビューの各文に対して評価できます</p>
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
	<Card class="border-l-4 border-l-purple-500 bg-purple-50">
		<CardContent class="p-4">
			<h3 class="font-semibold">この機能について</h3>
			<p class="mt-2 text-sm text-gray-700">
				レビューを文単位で分析し、各文に対して複数のタイプの評価を行えます。ポジティブな評価（明確な主張、納得できる、多角的な視点、共感できる）とネガティブな評価（根拠が必要、もっと客観的に、内容が不適切）から選択できます（複数選択可）。
			</p>
		</CardContent>
	</Card>

	<!-- アノテーションタイプの凡例 -->
	<Card>
		<CardContent class="p-4">
			<div class="flex flex-wrap gap-3">
				<span class="font-semibold">評価タイプ:</span>
				{#each annotationTypes as annType}
					{@const Icon = annType.icon}
					<div
						class="flex items-center gap-1 rounded-full {annType.bgColor} {annType.textColor} px-3 py-1 text-sm"
					>
						<Icon size={14} />
						<span>{annType.label}</span>
					</div>
				{/each}
			</div>
		</CardContent>
	</Card>

	<!-- レビュー一覧 -->
	<div class="space-y-4">
		{#each reviews as review (review.id)}
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
					{#if review.sentences && review.sentences.length > 0}
						<!-- レビュー文（インライン表示） -->
						<div class="rounded-lg border bg-gray-50 p-4">
							<p class="text-sm leading-relaxed">
								{#each review.sentences as sentence, index (sentence.id)}
									{@const userVotes = sentenceVotes[sentence.id]}
									{@const hasVotes = userVotes.size > 0}
									{@const isSelected = selectedSentenceId === sentence.id}
									<span
										role="button"
										tabindex="0"
										onclick={() => selectSentence(sentence.id)}
										onkeydown={(e) => {
											if (e.key === 'Enter' || e.key === ' ') selectSentence(sentence.id);
										}}
										class="cursor-pointer rounded px-1 py-0.5 transition-all {isSelected
											? 'bg-blue-200 ring-2 ring-blue-400'
											: hasVotes
												? 'bg-yellow-100 hover:bg-yellow-200'
												: 'hover:bg-gray-200'}"
									>
										{sentence.text}
									</span>
									{#if index < review.sentences.length - 1}
										{' '}
									{/if}
								{/each}
							</p>
						</div>

						<!-- ヒント -->
						<div class="rounded-md bg-blue-50 p-3 text-sm text-blue-800">
							文をクリックすると、その文に対する評価を選択できます。
						</div>

						<!-- 選択中の文のアノテーションパネル -->
						{#if selectedSentenceId}
							{@const selectedSentence = review.sentences.find((s) => s.id === selectedSentenceId)}
							{#if selectedSentence}
								{@const annotations = sentenceAnnotations[selectedSentence.id]}
								{@const userVotes = sentenceVotes[selectedSentence.id]}

								<div
									class="rounded-lg border-2 border-blue-500 bg-white p-4 shadow-lg transition-all"
								>
									<div class="mb-3 flex items-center justify-between">
										<h4 class="font-semibold text-blue-900">選択中の文</h4>
										<button
											onclick={() => (selectedSentenceId = null)}
											class="text-sm text-gray-500 hover:text-gray-700"
										>
											閉じる
										</button>
									</div>

									<p class="mb-4 rounded bg-blue-50 p-3 text-sm leading-relaxed text-gray-800">
										{selectedSentence.text}
									</p>

									<p class="mb-3 text-sm font-medium text-gray-700">
										この文に対する評価を選択してください（複数選択可）:
									</p>

									<!-- アノテーションボタン -->
									<div class="grid grid-cols-2 gap-3">
										{#each annotationTypes as annType}
											{@const count = annotations[annType.type]}
											{@const isActive = userVotes.has(annType.type)}
											{@const Icon = annType.icon}
											<button
												onclick={() => toggleAnnotation(selectedSentence.id, annType.type)}
												class="flex items-center justify-between rounded-lg border-2 p-3 text-sm font-medium transition-all {annType.bgColor} {annType.textColor} {isActive
													? 'border-gray-800 shadow-md'
													: 'border-transparent opacity-60 hover:opacity-100'}"
											>
												<div class="flex items-center gap-2">
													<Icon size={18} />
													<span>{annType.label}</span>
												</div>
												{#if count > 0}
													<Badge variant="secondary" class="ml-1">
														{count}
													</Badge>
												{/if}
											</button>
										{/each}
									</div>

									{#if userVotes.size > 0}
										<div class="mt-3 rounded-md bg-green-50 p-2 text-center text-sm text-green-700">
											評価済み
										</div>
									{/if}
								</div>
							{/if}
						{/if}

						<!-- 全文のアノテーション概要 -->
						<div class="rounded-lg border bg-white p-4">
							<h4 class="mb-3 font-semibold">評価済みの文一覧</h4>
							<div class="space-y-2">
								{#each review.sentences.filter((s) => sentenceVotes[s.id].size > 0) as sentence}
									{@const userVotes = sentenceVotes[sentence.id]}
									<div class="flex items-start gap-2 text-sm">
										<span class="text-gray-600">•</span>
										<div class="flex-1">
											<p class="text-gray-700">{sentence.text}</p>
											<div class="mt-1 flex flex-wrap gap-1">
												{#each annotationTypes as annType}
													{#if userVotes.has(annType.type)}
														{@const Icon = annType.icon}
														<span
															class="flex items-center gap-1 rounded-full {annType.bgColor} {annType.textColor} px-2 py-0.5 text-xs"
														>
															<Icon size={10} />
															{annType.label}
														</span>
													{/if}
												{/each}
											</div>
										</div>
									</div>
								{:else}
									<p class="text-center text-sm text-gray-500">まだ評価されていません</p>
								{/each}
							</div>
						</div>
					{:else}
						<p class="text-sm text-gray-500">このレビューは文に分割されていません。</p>
					{/if}
				</CardContent>
			</Card>
		{/each}
	</div>
</div>

<script lang="ts">
	import type { PageData } from './$types';
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { get } from 'svelte/store';
	import { goto } from '$app/navigation';
	import {
		currentExperiment,
		startTask,
		completeTask,
		uncompleteTask,
		logEvent,
		restoreCurrentExperiment
	} from '$lib/experiments/store';
	import type {
		Experiment,
		ExperimentTask,
		Question,
		ComprehensionQuestion
	} from '$lib/experiments/types';
	import type { Review, ReviewSentence } from '$lib/types/reviews';
	import { getTaskPath } from '$lib/experiments/navigation';
	import { Card, CardContent, CardHeader, CardTitle } from '$shared/components/ui/card';
	import { Badge } from '$shared/components/ui/badge';
	import { Button } from '$shared/components/ui/button';
	import Rating from '$features/reviews/Rating.svelte';
	import { Avatar, AvatarFallback, AvatarImage } from '$shared/components/ui/avatar';
	import {
		ArrowRight,
		CheckCircle,
		CircleCheck,
		ClipboardList,
		ThumbsDown,
		ThumbsUp,
		Eye,
		CheckCircle2,
		Sparkles,
		Heart,
		FileQuestion,
		AlertTriangle,
		Flag,
		RotateCcw
	} from '@lucide/svelte';

	type LikertScale = 5 | 7;

	let { data }: { data: PageData } = $props();
	const { taskType, product, reviews = [], questionnaire, comprehension } = data;
	const reviewList: Review[] = reviews as Review[];

	const params = get(page).params;
	const experimentId = params.experimentId ?? '';
	const taskId = params.taskId ?? '';

	// ========== 状態管理 ==========
	let experiment = $state<Experiment | null>(null);
	let task = $state<ExperimentTask | null>(null);
	let isLoading = $state(true);
	let errorMessage = $state<string | null>(null);

	const completionState = $derived(task?.completed ? 'completed' : 'pending');
	const pageTitle = $derived(task ? `${task.title} | 実験タスク` : 'タスク | 実験');

	let unsubscribe: (() => void) | null = null;

	// ========== ライフサイクル ==========
	onMount(() => {
		// ストアの変更を監視
		unsubscribe = currentExperiment.subscribe((value) => {
			experiment = value;
			task = value?.tasks.find((t) => t.id === taskId) ?? null;
		});

		// 初期化
		const restored = restoreCurrentExperiment();
		if (!restored) {
			goto(`/experiments/${experimentId}/start`);
			return;
		}

		experiment = restored;
		task = restored.tasks.find((t) => t.id === taskId) ?? null;

		if (!task) {
			goto(`/experiments/${experimentId}/start`);
			return;
		}

		if (!task.startedAt) {
			startTask(taskId);
		}

		isLoading = false;
	});

	onDestroy(() => {
		unsubscribe?.();
	});

	// ========== タスク完了関連の関数 ==========
	function markTaskCompleted(summary?: Record<string, unknown>) {
		if (!task || task.completed || !experiment) return;

		// 送信データを準備
		let submissionData: Record<string, unknown> = {};
		if (task.type === 'helpful-votes') {
			submissionData = { votes: helpfulVoteState, ...summary };
		} else if (task.type === 'sentence-annotations') {
			submissionData = {
				annotations: Object.fromEntries(
					Object.entries(sentenceVotes).map(([sentenceId, votes]) => [
						sentenceId,
						Array.from(votes)
					])
				),
				...summary
			};
		} else if (task.type === 'text-feedback') {
			submissionData = { feedbacks: submittedFeedbacks, ...summary };
		} else {
			submissionData = summary || {};
		}

		// ログを記録
		logEvent('feedback', { taskId, ...submissionData });

		// タスクを完了
		completeTask(taskId);

		// 最後のタスクの場合は確認画面へ遷移
		const currentIndex = experiment.tasks.findIndex((t) => t.id === taskId);
		if (currentIndex === experiment.tasks.length - 1) {
			localStorage.setItem(
				`experiment-submission-${experimentId}`,
				JSON.stringify({ taskId, ...submissionData })
			);
			const params = new URLSearchParams(window.location.search);
			goto(`/experiments/${experimentId}/confirm?${params.toString()}`);
		}
	}

	function uncompleteCurrentTask() {
		if (!task?.completed) return;
		uncompleteTask(taskId);
	}

	function goToNextTask() {
		if (!task?.completed || !experiment) {
			errorMessage = 'タスクを完了してから次のタスクへ進んでください。';
			return;
		}

		const currentIndex = experiment.tasks.findIndex((t) => t.id === taskId);
		const nextIndex = currentIndex + 1;

		if (nextIndex < experiment.tasks.length) {
			const nextTaskObj = experiment.tasks[nextIndex];
			goto(getTaskPath(experimentId, nextTaskObj));
		} else {
			goto(`/experiments/${experimentId}/complete`);
		}
	}

	/* ---------- Helpful Votes Task ---------- */
	const helpfulVoteState = $state<Record<string, 'helpful' | 'not-helpful' | null>>(
		Object.fromEntries(reviewList.map((review) => [review.id, null]))
	);
	const helpfulVoteCounts = $state<Record<string, { helpful: number; notHelpful: number }>>(
		Object.fromEntries(
			reviewList.map((review) => [
				review.id,
				{
					helpful: review.helpfulVotes,
					notHelpful: Math.max(0, review.totalVotes - review.helpfulVotes)
				}
			])
		)
	);

	function handleHelpfulVote(reviewId: string, voteType: 'helpful' | 'not-helpful') {
		const current = helpfulVoteState[reviewId];
		if (current === voteType) {
			helpfulVoteState[reviewId] = null;
			if (voteType === 'helpful') {
				helpfulVoteCounts[reviewId].helpful = Math.max(0, helpfulVoteCounts[reviewId].helpful - 1);
			} else {
				helpfulVoteCounts[reviewId].notHelpful = Math.max(
					0,
					helpfulVoteCounts[reviewId].notHelpful - 1
				);
			}
			logEvent('vote', { reviewId, voteType, action: 'remove' });
			return;
		}

		if (current) {
			if (current === 'helpful') {
				helpfulVoteCounts[reviewId].helpful = Math.max(0, helpfulVoteCounts[reviewId].helpful - 1);
			} else {
				helpfulVoteCounts[reviewId].notHelpful = Math.max(
					0,
					helpfulVoteCounts[reviewId].notHelpful - 1
				);
			}
		}

		helpfulVoteState[reviewId] = voteType;
		if (voteType === 'helpful') {
			helpfulVoteCounts[reviewId].helpful += 1;
		} else {
			helpfulVoteCounts[reviewId].notHelpful += 1;
		}
		logEvent('vote', { reviewId, voteType, action: 'add' });
	}

	/* ---------- Sentence Annotation Task ---------- */
	type AnnotationType =
		| 'clear-claim'
		| 'convincing'
		| 'multi-perspective'
		| 'empathy'
		| 'needs-evidence'
		| 'needs-objectivity'
		| 'inappropriate';

	const sentenceVotes = $state<Record<string, Set<AnnotationType>>>(
		Object.fromEntries(
			reviewList.flatMap((review) =>
				(review.sentences ?? []).map((sentence: ReviewSentence) => [
					sentence.id,
					new Set<AnnotationType>()
				])
			)
		)
	);

	const sentenceAnnotationCounts = $state<Record<string, Record<AnnotationType, number>>>(
		Object.fromEntries(
			reviewList.flatMap((review) =>
				(review.sentences ?? []).map((sentence: ReviewSentence) => [
					sentence.id,
					{
						'clear-claim':
							sentence.annotations.find(
								(a: ReviewSentence['annotations'][number]) => a.type === 'clear-claim'
							)?.count ?? 0,
						convincing:
							sentence.annotations.find(
								(a: ReviewSentence['annotations'][number]) => a.type === 'convincing'
							)?.count ?? 0,
						'multi-perspective':
							sentence.annotations.find(
								(a: ReviewSentence['annotations'][number]) => a.type === 'multi-perspective'
							)?.count ?? 0,
						empathy:
							sentence.annotations.find(
								(a: ReviewSentence['annotations'][number]) => a.type === 'empathy'
							)?.count ?? 0,
						'needs-evidence':
							sentence.annotations.find(
								(a: ReviewSentence['annotations'][number]) => a.type === 'needs-evidence'
							)?.count ?? 0,
						'needs-objectivity':
							sentence.annotations.find(
								(a: ReviewSentence['annotations'][number]) => a.type === 'needs-objectivity'
							)?.count ?? 0,
						inappropriate:
							sentence.annotations.find(
								(a: ReviewSentence['annotations'][number]) => a.type === 'inappropriate'
							)?.count ?? 0
					}
				])
			)
		)
	);

	let selectedSentence = $state<string | null>(null);

	const annotationTypes = [
		// ポジティブ（寒色）
		{
			type: 'clear-claim',
			label: '明確な主張（わかりやすい）',
			bgColor: 'bg-blue-100 hover:bg-blue-200',
			textColor: 'text-gray-900',
			icon: Eye
		},
		{
			type: 'convincing',
			label: '納得できる',
			bgColor: 'bg-cyan-100 hover:bg-cyan-200',
			textColor: 'text-gray-900',
			icon: CheckCircle2
		},
		{
			type: 'multi-perspective',
			label: '多角的な視点（興味深い）',
			bgColor: 'bg-teal-100 hover:bg-teal-200',
			textColor: 'text-gray-900',
			icon: Sparkles
		},
		{
			type: 'empathy',
			label: '共感できる',
			bgColor: 'bg-indigo-100 hover:bg-indigo-200',
			textColor: 'text-gray-900',
			icon: Heart
		},
		// ネガティブ（暖色）
		{
			type: 'needs-evidence',
			label: '根拠が必要',
			bgColor: 'bg-orange-100 hover:bg-orange-200',
			textColor: 'text-gray-900',
			icon: FileQuestion
		},
		{
			type: 'needs-objectivity',
			label: 'もっと客観的に',
			bgColor: 'bg-amber-100 hover:bg-amber-200',
			textColor: 'text-gray-900',
			icon: AlertTriangle
		},
		{
			type: 'inappropriate',
			label: '内容が不適切',
			bgColor: 'bg-red-100 hover:bg-red-200',
			textColor: 'text-gray-900',
			icon: Flag
		}
	] as const;

	function toggleAnnotation(reviewId: string, sentenceId: string, annotation: AnnotationType) {
		const votes = sentenceVotes[sentenceId] ?? new Set<AnnotationType>();
		const annotations = sentenceAnnotationCounts[sentenceId];

		let action: 'add' | 'remove' = 'add';
		if (votes.has(annotation)) {
			votes.delete(annotation);
			annotations[annotation] = Math.max(0, annotations[annotation] - 1);
			action = 'remove';
		} else {
			votes.add(annotation);
			annotations[annotation] = annotations[annotation] + 1;
		}

		sentenceVotes[sentenceId] = new Set(votes);
		sentenceAnnotationCounts[sentenceId] = { ...annotations };

		logEvent('annotation', {
			reviewId,
			sentenceId,
			annotationType: annotation,
			action
		});
	}

	/* ---------- Text Feedback Task ---------- */
	const feedbackDrafts = $state<Record<string, string>>(
		Object.fromEntries(reviewList.map((review) => [review.id, '']))
	);
	const submittedFeedbacks = $state<
		Record<
			string,
			{ id: string; content: string; createdAt: string; userName: string; userAvatar: string }[]
		>
	>(Object.fromEntries(reviewList.map((review) => [review.id, []])));

	function submitFeedback(reviewId: string) {
		const content = feedbackDrafts[reviewId]?.trim();
		if (!content) return;

		const newFeedback = {
			id: `${reviewId}-${Date.now()}`,
			content,
			createdAt: new Date().toISOString(),
			userName: '参加者',
			userAvatar: 'https://i.pravatar.cc/150?u=participant'
		};

		submittedFeedbacks[reviewId] = [...(submittedFeedbacks[reviewId] ?? []), newFeedback];
		feedbackDrafts[reviewId] = '';

		logEvent('feedback', {
			reviewId,
			content
		});
	}

	/* ---------- Questionnaire Task ---------- */
	const questionnaireResponses = $state<Record<string, string>>({});

	function setQuestionResponse(questionId: string, value: string) {
		questionnaireResponses[questionId] = value;
	}

	function validateQuestionnaire(questions: Question[]): boolean {
		return questions.every((question) => {
			if (!question.required) return true;
			const value = questionnaireResponses[question.id];
			return value !== undefined && value !== '';
		});
	}

	function submitQuestionnaire(questions: Question[]) {
		if (!questionnaire || !experiment) return;
		if (!validateQuestionnaire(questions)) {
			errorMessage = '必須項目に回答してください。';
			return;
		}

		errorMessage = null;
		const responses = questions.map((question) => ({
			questionId: question.id,
			value: questionnaireResponses[question.id] ?? ''
		}));

		const submissionData = {
			questionnaireId: questionnaire.id,
			responses
		};

		// ログを記録
		logEvent('feedback', {
			taskId,
			...submissionData
		});

		// タスクを完了
		markTaskCompleted(submissionData);
	}

	function getLikertLabels(scale: LikertScale) {
		const points = Array.from({ length: scale }, (_, i) => i + 1);
		return points;
	}

	/* ---------- Comprehension Task ---------- */
	const comprehensionAnswers = $state<Record<string, number>>({});
	let comprehensionScore = $state<number | null>(null);

	function submitComprehensionTest(questions: ComprehensionQuestion[]) {
		if (!experiment) return;
		const unanswered = questions.some(
			(question) => comprehensionAnswers[question.id] === undefined
		);
		if (unanswered) {
			errorMessage = 'すべての設問に回答してください。';
			return;
		}

		errorMessage = null;
		const correct = questions.filter(
			(question) => comprehensionAnswers[question.id] === question.correctAnswer
		).length;
		comprehensionScore = Math.round((correct / questions.length) * 100);

		const submissionData = {
			comprehensionId: comprehension?.id ?? 'comprehension',
			score: comprehensionScore,
			answers: questions.map((question) => ({
				questionId: question.id,
				answer: comprehensionAnswers[question.id]
			}))
		};

		// タスクを完了
		markTaskCompleted(submissionData);
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
		return date.toLocaleDateString('ja-JP', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>{pageTitle}</title>
</svelte:head>

{#if isLoading}
	<div class="flex h-72 items-center justify-center text-gray-600">タスクを読み込んでいます...</div>
{:else if !task}
	<div class="text-center text-gray-600">
		<p>タスク情報を取得できませんでした。実験の開始ページに戻ります。</p>
		<Button class="mt-4" onclick={() => goto(`/experiments/${experimentId}/start`)}>戻る</Button>
	</div>
{:else}
	{@const currentTask = task}
	{@const exp = experiment}
	<div class="space-y-6">
		<Card>
			<CardContent class="flex flex-wrap items-center justify-between gap-4 p-6">
				<div class="space-y-2">
					<h1 class="text-2xl font-bold">{currentTask.title}</h1>
					<p class="text-sm text-gray-600">{currentTask.description}</p>
					<div class="flex flex-wrap gap-2">
						{#if exp}
							<Badge variant="outline">
								タスク {exp.tasks.findIndex((t) => t.id === currentTask.id) + 1}/{exp.tasks.length}
							</Badge>
						{/if}
						<Badge variant="outline">{taskType}</Badge>
					</div>
				</div>
				{#if completionState === 'completed'}
					<div class="flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-green-700">
						<CircleCheck size={18} />
						<span class="text-sm font-semibold">完了済み</span>
					</div>
				{/if}
			</CardContent>
		</Card>

		{#if errorMessage}
			<div class="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
				{errorMessage}
			</div>
		{/if}

		<!-- Task Content -->
		{#if taskType === 'helpful-votes' && product}
			<section class="space-y-4">
				<Card>
					<CardContent class="flex flex-wrap items-center gap-4 p-4">
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

				{#each reviewList as review (review.id)}
					{@const counts = helpfulVoteCounts[review.id]}
					{@const userVote = helpfulVoteState[review.id]}
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

							<div class="flex flex-wrap items-center gap-3 border-t pt-4">
								<span class="text-sm font-semibold text-gray-700"
									>このレビューは参考になりましたか？</span
								>
								<Button
									variant={userVote === 'helpful' ? 'default' : 'outline'}
									size="sm"
									onclick={() => handleHelpfulVote(review.id, 'helpful')}
									class="gap-1"
								>
									<ThumbsUp size={14} class={userVote === 'helpful' ? 'fill-white' : ''} />
									はい ({counts.helpful})
								</Button>
								<Button
									variant={userVote === 'not-helpful' ? 'default' : 'outline'}
									size="sm"
									onclick={() => handleHelpfulVote(review.id, 'not-helpful')}
									class="gap-1"
								>
									<ThumbsDown size={14} class={userVote === 'not-helpful' ? 'fill-white' : ''} />
									いいえ ({counts.notHelpful})
								</Button>
							</div>
						</CardContent>
					</Card>
				{/each}

				<div class="rounded-md border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900">
					<p class="font-semibold">タスク完了条件</p>
					<p class="mt-1">
						最低でも数件のレビューに投票してから「タスクを完了」ボタンを押してください。
					</p>
					<Button
						class="mt-3"
						onclick={() => markTaskCompleted()}
						disabled={completionState === 'completed'}
					>
						タスクを完了
					</Button>
				</div>
			</section>
		{:else if taskType === 'sentence-annotations' && product}
			<section class="space-y-4">
				<Card>
					<CardContent class="flex flex-wrap items-center gap-4 p-4">
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

				<div class="rounded-lg border bg-white p-4">
					<h3 class="mb-3 text-sm font-semibold text-gray-700">
						文に対する評価を選択してください（複数選択可）
					</h3>
					<div class="flex flex-wrap gap-2">
						{#each annotationTypes as annType}
							<Badge variant="outline" class="flex items-center gap-1">
								<span class="h-2 w-2 rounded-full {annType.bgColor}"></span>
								<span class={annType.textColor}>{annType.label}</span>
							</Badge>
						{/each}
					</div>
				</div>

				{#each reviewList as review (review.id)}
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
								<div class="rounded-lg border bg-gray-50 p-4 text-sm leading-relaxed">
									{#each review.sentences as sentence (sentence.id)}
										{@const userVotes = sentenceVotes[sentence.id]}
										{@const isSelected = selectedSentence === sentence.id}
										<span
											role="button"
											tabindex="0"
											onclick={() =>
												(selectedSentence = selectedSentence === sentence.id ? null : sentence.id)}
											onkeydown={(event) => {
												if (event.key === 'Enter' || event.key === ' ') {
													selectedSentence = selectedSentence === sentence.id ? null : sentence.id;
												}
											}}
											class="cursor-pointer rounded px-1 py-0.5 transition-all {isSelected
												? 'bg-blue-200 ring-2 ring-blue-400'
												: userVotes.size > 0
													? 'bg-yellow-100 hover:bg-yellow-200'
													: 'hover:bg-gray-200'}"
										>
											{sentence.text}
										</span>
										{' '}
									{/each}
								</div>

								{#if selectedSentence}
									{@const currentSentence = review.sentences.find(
										(s: ReviewSentence) => s.id === selectedSentence
									)}
									{#if currentSentence}
										<div class="rounded-lg border bg-white p-4 shadow">
											<h4 class="mb-2 text-sm font-semibold text-gray-700">選択中の文</h4>
											<p class="rounded bg-blue-50 p-3 text-sm leading-relaxed text-gray-700">
												{currentSentence.text}
											</p>
											<div class="mt-3 grid gap-2 md:grid-cols-2">
												{#each annotationTypes as annType}
													{@const hasVote =
														sentenceVotes[currentSentence.id]?.has(annType.type) ?? false}
													{@const counts = sentenceAnnotationCounts[currentSentence.id]}
													{@const Icon = annType.icon}
													<button
														onclick={() =>
															toggleAnnotation(review.id, currentSentence.id, annType.type)}
														class="flex items-center justify-between rounded-lg border-2 p-3 text-sm font-medium transition-all {annType.bgColor} {annType.textColor} {hasVote
															? 'border-gray-800 shadow-md'
															: 'border-transparent opacity-60 hover:opacity-100'}"
													>
														<div class="flex items-center gap-2">
															<Icon size={18} />
															<span>{annType.label}</span>
														</div>
														{#if counts[annType.type] > 0}
															<Badge variant="secondary" class="ml-1">
																{counts[annType.type]}
															</Badge>
														{/if}
													</button>
												{/each}
											</div>
										</div>
									{/if}
								{/if}
							{:else}
								<p class="text-sm text-gray-500">このレビューには文の情報がありません。</p>
							{/if}
						</CardContent>
					</Card>
				{/each}

				<div class="rounded-md border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900">
					<p class="font-semibold">タスク完了条件</p>
					<p class="mt-1">複数の文に対して評価を行ってからタスクを完了してください。</p>
					<Button
						class="mt-3"
						onclick={() => markTaskCompleted()}
						disabled={completionState === 'completed'}
					>
						タスクを完了
					</Button>
				</div>
			</section>
		{:else if taskType === 'text-feedback' && product}
			<section class="space-y-4">
				<Card>
					<CardContent class="flex flex-wrap items-center gap-4 p-4">
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

				{#each reviewList as review (review.id)}
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

							<div class="rounded-lg border bg-gray-50 p-4">
								<label class="text-sm font-semibold text-gray-700" for={`feedback-${review.id}`}>
									レビューに対するコメントを入力してください
								</label>
								<textarea
									id={`feedback-${review.id}`}
									bind:value={feedbackDrafts[review.id]}
									rows="3"
									class="mt-2 w-full rounded-md border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
									placeholder="感じたこと、質問などを記入してください"
								></textarea>
								<div class="mt-3 flex justify-end">
									<Button size="sm" onclick={() => submitFeedback(review.id)}>コメントを送信</Button
									>
								</div>
							</div>

							{#if submittedFeedbacks[review.id]?.length}
								<div class="space-y-3 rounded-lg border bg-white p-3">
									<p class="text-xs font-semibold uppercase text-gray-500">送信済みコメント</p>
									{#each submittedFeedbacks[review.id] as feedbackItem (feedbackItem.id)}
										<div class="rounded-md bg-indigo-50 p-3 text-sm text-indigo-900">
											<p class="font-medium">{feedbackItem.content}</p>
											<p class="mt-1 text-xs opacity-70">
												{new Date(feedbackItem.createdAt).toLocaleString('ja-JP')}
											</p>
										</div>
									{/each}
								</div>
							{/if}
						</CardContent>
					</Card>
				{/each}

				<div class="rounded-md border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900">
					<p class="font-semibold">タスク完了条件</p>
					<p class="mt-1">最低1件以上のコメントを送信してからタスクを完了してください。</p>
					<Button
						class="mt-3"
						onclick={() => markTaskCompleted()}
						disabled={completionState === 'completed'}
					>
						タスクを完了
					</Button>
				</div>
			</section>
		{:else if taskType === 'questionnaire' && questionnaire}
			<section class="space-y-4">
				<Card>
					<CardHeader>
						<CardTitle>{questionnaire.title}</CardTitle>
						<p class="mt-2 text-sm text-gray-600">{questionnaire.description}</p>
					</CardHeader>
					<CardContent class="space-y-6">
						{#each questionnaire.questions as question, index (question.id)}
							<div class="space-y-2">
								<p class="text-sm font-semibold text-gray-700">
									{index + 1}. {question.text}
									{#if question.required}
										<span class="ml-2 text-xs text-red-500">必須</span>
									{/if}
								</p>

								{#if question.type === 'likert-5' || question.type === 'likert-7'}
									{@const scale = question.type === 'likert-5' ? 5 : 7}
									<div class="flex flex-wrap gap-2">
										{#each getLikertLabels(scale as LikertScale) as value}
											<button
												type="button"
												class="rounded-md border px-3 py-1 text-sm transition-colors {questionnaireResponses[
													question.id
												] === value.toString()
													? 'border-indigo-500 bg-indigo-500 text-white'
													: 'hover:border-indigo-300 hover:bg-indigo-50'}"
												onclick={() => setQuestionResponse(question.id, value.toString())}
											>
												{value}
											</button>
										{/each}
									</div>
								{:else if question.type === 'yes-no'}
									<div class="flex gap-3">
										<Button
											variant={questionnaireResponses[question.id] === 'yes'
												? 'default'
												: 'outline'}
											onclick={() => setQuestionResponse(question.id, 'yes')}
										>
											はい
										</Button>
										<Button
											variant={questionnaireResponses[question.id] === 'no' ? 'default' : 'outline'}
											onclick={() => setQuestionResponse(question.id, 'no')}
										>
											いいえ
										</Button>
									</div>
								{:else if question.type === 'multiple-choice' && question.options}
									<div class="grid gap-2 md:grid-cols-2">
										{#each question.options as option}
											<Button
												variant={questionnaireResponses[question.id] === option
													? 'default'
													: 'outline'}
												onclick={() => setQuestionResponse(question.id, option)}
											>
												{option}
											</Button>
										{/each}
									</div>
								{:else}
									<textarea
										rows="3"
										class="w-full rounded-md border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
										bind:value={questionnaireResponses[question.id]}
										placeholder="自由記述で回答してください"
									></textarea>
								{/if}
							</div>
						{/each}

						<div class="flex justify-end">
							<Button onclick={() => submitQuestionnaire(questionnaire.questions)}>
								回答を送信する
							</Button>
						</div>
					</CardContent>
				</Card>
			</section>
		{:else if taskType === 'comprehension-test' && comprehension && product}
			<section class="space-y-4">
				<Card>
					<CardHeader>
						<CardTitle>{comprehension.title}</CardTitle>
						<p class="mt-2 text-sm text-gray-600">{comprehension.description}</p>
					</CardHeader>
					<CardContent class="space-y-6">
						{#each comprehension.questions as question, index (question.id)}
							<div class="space-y-3 rounded-lg border p-4">
								<p class="text-sm font-semibold text-gray-700">
									{index + 1}. {question.question}
								</p>
								<div class="grid gap-2 md:grid-cols-2">
									{#each question.options as option, optionIndex}
										<Button
											variant={comprehensionAnswers[question.id] === optionIndex
												? 'default'
												: 'outline'}
											onclick={() => (comprehensionAnswers[question.id] = optionIndex)}
										>
											{option}
										</Button>
									{/each}
								</div>
							</div>
						{/each}

						<div class="flex justify-end">
							<Button onclick={() => submitComprehensionTest(comprehension.questions)}>
								解答を提出する
							</Button>
						</div>

						{#if comprehensionScore !== null}
							<div
								class="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700"
							>
								正答率: {comprehensionScore}% お疲れさまでした！
							</div>
						{/if}
					</CardContent>
				</Card>
			</section>
		{:else}
			<Card>
				<CardContent class="p-6 text-sm text-gray-600">
					該当するタスクビューが設定されていません。管理者にお問い合わせください。
				</CardContent>
			</Card>
		{/if}

		<!-- 追従式の完了ボタン -->
		<div class="fixed bottom-0 left-0 right-0 z-50 border-t bg-white p-4 shadow-lg transition-all">
			<div class="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
				<Button variant="outline" href={`/experiments/${experimentId}/start`}>
					<ClipboardList size={16} class="mr-2" />
					説明に戻る
				</Button>
				<div class="flex gap-2">
					{#if completionState === 'completed'}
						<Button
							variant="outline"
							onclick={uncompleteCurrentTask}
							class="border-orange-300 text-orange-700 hover:bg-orange-50"
						>
							<RotateCcw size={16} class="mr-2" />
							完了を取り消す
						</Button>
						<Button variant="default" class="bg-green-600 hover:bg-green-700" disabled>
							<CircleCheck size={16} class="mr-2" />
							タスク完了済み
						</Button>
						{#if experiment && task}
							{@const currentTaskIndex = experiment.tasks.findIndex((t) => t.id === task!.id)}
							{@const isLast = currentTaskIndex === experiment.tasks.length - 1}
							{#if !isLast}
								<Button onclick={goToNextTask}>
									次のタスクへ
									<ArrowRight size={16} class="ml-2" />
								</Button>
							{/if}
						{/if}
					{:else}
						<Button variant="default" onclick={() => markTaskCompleted()}>
							<CheckCircle size={16} class="mr-2" />
							タスクを完了
						</Button>
						<Button variant="outline" disabled>
							次のタスクへ
							<ArrowRight size={16} class="ml-2" />
						</Button>
					{/if}
				</div>
			</div>
		</div>
		<!-- ボタンのためのスペーサー -->
		<div class="h-24"></div>
	</div>
{/if}

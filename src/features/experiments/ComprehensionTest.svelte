<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$shared/components/ui/card';
	import { Button } from '$shared/components/ui/button';
	import { Badge } from '$shared/components/ui/badge';
	import { CheckCircle2, XCircle, AlertCircle } from '@lucide/svelte';
	import type { ComprehensionQuestion } from '$lib/experiments/types';

	interface Props {
		questions: ComprehensionQuestion[];
		onSubmit: (answers: number[], score: number) => void;
		onCancel?: () => void;
	}

	let { questions, onSubmit, onCancel }: Props = $props();

	// 回答を管理
	let answers = $state<Record<number, number>>({});
	let submitted = $state(false);
	let score = $state(0);

	// すべての質問に回答済みかチェック
	const canSubmit = $derived(() => {
		return questions.every((_, index) => answers[index] !== undefined);
	});

	function handleSubmit() {
		const answerArray = questions.map((_, index) => answers[index] ?? -1);
		const correctCount = questions.filter(
			(q, index) => answers[index] === q.correctAnswer
		).length;

		score = Math.round((correctCount / questions.length) * 100);
		submitted = true;

		onSubmit(answerArray, score);
	}

	function isCorrect(questionIndex: number): boolean {
		return answers[questionIndex] === questions[questionIndex].correctAnswer;
	}
</script>

<Card class="mx-auto max-w-3xl">
	<CardHeader>
		<div class="mb-2 flex items-center justify-between">
			<Badge variant="outline">理解度テスト</Badge>
			{#if submitted}
				<Badge variant={score >= 70 ? 'default' : 'secondary'} class="text-lg">
					スコア: {score}点
				</Badge>
			{/if}
		</div>
		<CardTitle class="text-2xl">商品理解度テスト</CardTitle>
		<p class="mt-2 text-gray-600">
			レビューを読んで理解した内容について、以下の質問に答えてください。
		</p>
	</CardHeader>
	<CardContent class="space-y-8">
		{#if !submitted}
			{#each questions as question, questionIndex}
				<div class="space-y-3">
					<div class="flex gap-2">
						<span class="font-semibold">Q{questionIndex + 1}.</span>
						<div class="flex-1">
							<p class="font-medium">{question.question}</p>
						</div>
					</div>

					<div class="ml-8 space-y-2">
						{#each question.options as option, optionIndex}
							<label
								class="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-gray-50 {answers[questionIndex] === optionIndex
									? 'border-blue-500 bg-blue-50'
									: ''}"
							>
								<input
									type="radio"
									name={`question-${questionIndex}`}
									value={optionIndex}
									bind:group={answers[questionIndex]}
									class="h-4 w-4"
								/>
								<span class="text-sm">{option}</span>
							</label>
						{/each}
					</div>
				</div>
			{/each}

			<!-- 送信ボタン -->
			<div class="flex justify-end gap-3 border-t pt-6">
				{#if onCancel}
					<Button variant="outline" onclick={onCancel}>キャンセル</Button>
				{/if}
				<Button onclick={handleSubmit} disabled={!canSubmit()} size="lg">
					回答を送信
				</Button>
			</div>
		{:else}
			<!-- 結果表示 -->
			<div class="space-y-6">
				<!-- スコア -->
				<div class="rounded-lg {score >= 70 ? 'bg-green-50' : 'bg-amber-50'} p-6 text-center">
					<div class="mb-2 flex justify-center">
						{#if score >= 70}
							<CheckCircle2 class="text-green-600" size={48} />
						{:else}
							<AlertCircle class="text-amber-600" size={48} />
						{/if}
					</div>
					<h3 class="text-2xl font-bold">
						{score}点 / 100点
					</h3>
					<p class="mt-2 text-sm text-gray-600">
						{questions.filter((_, i) => isCorrect(i)).length} / {questions.length} 問正解
					</p>
				</div>

				<!-- 各質問の正誤 -->
				{#each questions as question, questionIndex}
					{@const correct = isCorrect(questionIndex)}
					<div class="rounded-lg border p-4 {correct ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}">
						<div class="mb-2 flex items-start gap-2">
							{#if correct}
								<CheckCircle2 class="text-green-600" size={20} />
							{:else}
								<XCircle class="text-red-600" size={20} />
							{/if}
							<div class="flex-1">
								<p class="font-medium">Q{questionIndex + 1}. {question.question}</p>
							</div>
						</div>

						<div class="ml-7 space-y-2 text-sm">
							<div>
								<span class="font-semibold">あなたの回答:</span>
								<span class={correct ? 'text-green-700' : 'text-red-700'}>
									{question.options[answers[questionIndex]]}
								</span>
							</div>
							{#if !correct}
								<div>
									<span class="font-semibold">正解:</span>
									<span class="text-green-700">
										{question.options[question.correctAnswer]}
									</span>
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</CardContent>
</Card>


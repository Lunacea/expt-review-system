<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$shared/components/ui/card';
	import { Button } from '$shared/components/ui/button';
	import { Badge } from '$shared/components/ui/badge';
	import type { Question, QuestionnaireResponse } from '$lib/experiments/types';

	interface Props {
		title: string;
		description?: string;
		questions: Question[];
		onSubmit: (responses: QuestionnaireResponse[]) => void;
		onCancel?: () => void;
	}

	let { title, description, questions, onSubmit, onCancel }: Props = $props();

	// 回答を管理
	let responses = $state<Record<string, string | number>>({});

	// Likert尺度のラベル
	const likert5Labels = [
		'全くそう思わない',
		'そう思わない',
		'どちらともいえない',
		'そう思う',
		'非常にそう思う'
	];

	const likert7Labels = [
		'全くそう思わない',
		'そう思わない',
		'あまりそう思わない',
		'どちらともいえない',
		'ややそう思う',
		'そう思う',
		'非常にそう思う'
	];

	// すべての必須質問に回答済みかチェック
	const canSubmit = $derived(() => {
		return questions
			.filter((q) => q.required)
			.every((q) => responses[q.id] !== undefined && responses[q.id] !== '');
	});

	function handleSubmit() {
		const questionnaireResponses: QuestionnaireResponse[] = questions.map((q) => ({
			questionId: q.id,
			value: responses[q.id] ?? '',
			timestamp: new Date().toISOString()
		}));
		onSubmit(questionnaireResponses);
	}
</script>

<Card class="mx-auto max-w-3xl">
	<CardHeader>
		<div class="mb-2">
			<Badge variant="outline">アンケート</Badge>
		</div>
		<CardTitle class="text-2xl">{title}</CardTitle>
		{#if description}
			<p class="mt-2 text-gray-600">{description}</p>
		{/if}
	</CardHeader>
	<CardContent class="space-y-8">
		{#each questions as question, index}
			<div class="space-y-3">
				<div class="flex gap-2">
					<span class="font-semibold">Q{index + 1}.</span>
					<div class="flex-1">
						<p class="font-medium">{question.text}</p>
						{#if question.required}
							<Badge variant="destructive" class="mt-1 text-xs">必須</Badge>
						{/if}
					</div>
				</div>

				<!-- Likert 5段階 -->
				{#if question.type === 'likert-5'}
					<div class="ml-8 space-y-2">
						{#each likert5Labels as label, i}
							<label class="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-gray-50">
								<input
									type="radio"
									name={question.id}
									value={i + 1}
									bind:group={responses[question.id]}
									class="h-4 w-4"
								/>
								<span class="text-sm">{i + 1}. {label}</span>
							</label>
						{/each}
					</div>
				{/if}

				<!-- Likert 7段階 -->
				{#if question.type === 'likert-7'}
					<div class="ml-8 space-y-2">
						{#each likert7Labels as label, i}
							<label class="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-gray-50">
								<input
									type="radio"
									name={question.id}
									value={i + 1}
									bind:group={responses[question.id]}
									class="h-4 w-4"
								/>
								<span class="text-sm">{i + 1}. {label}</span>
							</label>
						{/each}
					</div>
				{/if}

				<!-- はい/いいえ -->
				{#if question.type === 'yes-no'}
					<div class="ml-8 flex gap-4">
						<label class="flex items-center gap-2">
							<input
								type="radio"
								name={question.id}
								value="yes"
								bind:group={responses[question.id]}
								class="h-4 w-4"
							/>
							<span>はい</span>
						</label>
						<label class="flex items-center gap-2">
							<input
								type="radio"
								name={question.id}
								value="no"
								bind:group={responses[question.id]}
								class="h-4 w-4"
							/>
							<span>いいえ</span>
						</label>
					</div>
				{/if}

				<!-- テキスト入力 -->
				{#if question.type === 'text'}
					<div class="ml-8">
						<textarea
							bind:value={responses[question.id]}
							placeholder="ご回答をご記入ください"
							rows="4"
							class="w-full rounded-md border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
						></textarea>
					</div>
				{/if}

				<!-- 多肢選択 -->
				{#if question.type === 'multiple-choice' && question.options}
					<div class="ml-8 space-y-2">
						{#each question.options as option, i}
							<label class="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-gray-50">
								<input
									type="radio"
									name={question.id}
									value={option}
									bind:group={responses[question.id]}
									class="h-4 w-4"
								/>
								<span class="text-sm">{option}</span>
							</label>
						{/each}
					</div>
				{/if}
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
	</CardContent>
</Card>


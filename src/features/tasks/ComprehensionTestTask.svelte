<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	interface Props {
		reviews?: any[];
		product?: string;
		formId?: string;
		condition?: string;
	}

	let { reviews = [], product = '', condition = '' } = $props<Props>();

	const reviewText =
		'この商品は非常に軽く、持ち運びに便利です。バッテリーの持ちも良く、一日中使えます。ただし、充電時間が少し長いです。';
	const helpfulCount = 42; // Mock helpful count for control condition

	const quiz = [
		{
			id: 'q1',
			text: 'バッテリーの持ちはどうですか？',
			options: ['良い', '悪い', '書かれていない']
		},
		{ id: 'q2', text: '充電時間はどうですか？', options: ['短い', '長い', '普通'] }
	];

	let answers = $state<Record<string, string>>({});

	// Check if answered
	let isComplete = $derived(quiz.every((q) => answers[q.id]));

	function updateAnswer(id: string, value: string) {
		answers[id] = value;
		dispatch('change', { answers, isComplete }); // Pass isComplete status
	}

	$effect(() => {
		dispatch('change', { answers, isComplete });
	});
</script>

<div class="space-y-8">
	<div class="rounded border bg-white p-6 shadow">
		<h3 class="mb-4 text-lg font-bold">レビュー内容を確認してください</h3>
		<p class="mb-2 text-sm text-gray-500">
			条件: {condition === 'control'
				? '通常表示（テキスト＋役に立った数）'
				: '提案手法表示（テキスト＋アノテーション可視化）'}
		</p>

		<div class="rounded border bg-gray-50 p-4">
			{#if condition === 'control'}
				<!-- Existing Method: Text + Helpful Count -->
				<p class="mb-4 leading-relaxed text-gray-800">{reviewText}</p>
				<div class="flex items-center border-t pt-2 text-sm text-gray-600">
					<span class="mr-1 font-medium">{helpfulCount}人</span
					>のお客様がこれが役に立ったと考えています
				</div>
			{:else}
				<!-- Proposed Method: Visualized View -->
				<p class="mb-4 leading-relaxed">
					<span class="rounded border-b-2 border-green-200 bg-green-100 px-1"
						>この商品は非常に軽く、持ち運びに便利です。</span
					>
					<span class="rounded border-b-2 border-green-200 bg-green-100 px-1"
						>バッテリーの持ちも良く、一日中使えます。</span
					>
					<span class="rounded border-b-2 border-yellow-200 bg-yellow-100 px-1"
						>ただし、充電時間が少し長いです。</span
					>
				</p>
				<div class="border-t pt-2 text-xs text-gray-500">
					<div class="flex items-center space-x-4">
						<span class="flex items-center"
							><span class="mr-1 inline-block h-3 w-3 border border-green-200 bg-green-100"
							></span>好評: わかりやすい・共感</span
						>
						<span class="flex items-center"
							><span class="mr-1 inline-block h-3 w-3 border border-yellow-200 bg-yellow-100"
							></span>不満: 難解・不適切</span
						>
					</div>
				</div>
			{/if}
		</div>
	</div>

	<div class="border-t pt-6">
		<h3 class="mb-4 font-bold">理解度確認テスト</h3>
		{#each quiz as q}
			<div class="mb-6">
				<p class="mb-2 font-medium">{q.text}</p>
				<div class="space-y-2">
					{#each q.options as opt}
						<label class="flex cursor-pointer items-center rounded p-2 hover:bg-gray-50">
							<input
								type="radio"
								name={q.id}
								value={opt}
								bind:group={answers[q.id]}
								onchange={() => updateAnswer(q.id, opt)}
								class="mr-3 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
							/>
							<span class="text-gray-800">{opt}</span>
						</label>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>

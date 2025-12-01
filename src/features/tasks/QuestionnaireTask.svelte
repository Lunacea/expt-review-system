<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	interface Props {
		reviews?: any[];
		product?: string;
		formId?: string;
		condition?: string;
		method?: string; // For dynamic text replacement
	}

	let { formId = '', product = '', reviews = [], condition = '', method = '' } = $props<Props>();

	let questions = $state([]);

	// Scale labels (7-point)
	const scaleLabels = {
		1: '全くそう思わない',
		7: '非常にそう思う'
	};

	// A. Method-Specific Subjective Evaluation (H1, H2)
	// Basic questions for each method (Numeric, Text, Proposed)
	if (formId.startsWith('q_method_') && formId !== 'q_method_proposed_detail') {
		const targetMethod = method || 'この手法';
		questions = [
			{
				id: 'q_expressiveness',
				text: `${targetMethod}を用いて、レビューに対する自分の意見や感想を過不足なく表現できたと感じますか？`,
				type: 'likert_7'
			},
			{
				id: 'q_burden',
				text: `${targetMethod}で評価を行うことに対して、面倒だと感じたり、心理的な抵抗を感じたりしましたか？`,
				type: 'likert_7'
			},
			{
				id: 'q_ease',
				text: '評価を完了するまでの操作は簡単でしたか？',
				type: 'likert_7'
			},
			{
				id: 'q_intention',
				text: '今後、ECサイト等でこの機能が実装されていたら利用したいと思いますか？',
				type: 'likert_7'
			}
		];
	}
	// B. Proposed Method Detailed Evaluation (Moved to 1C)
	else if (formId === 'q_method_proposed_detail') {
		questions = [
			{
				id: 'q_ui_appropriateness',
				text: 'リアクションボタンの配置や色、メニューの形状は適切で見やすいと感じましたか？',
				type: 'likert_7'
			},
			{
				id: 'q_ui_intuitive',
				text: 'センテンスにカーソルを合わせ、リアクションを選ぶ操作は直感的でしたか？',
				type: 'likert_7'
			},
			{
				id: 'q_coverage',
				text: '用意された6つのリアクションは、あなたの評価を伝えるのに十分でしたか？',
				type: 'likert_7'
			},
			{
				id: 'q_inappropriate_btn',
				text: '「不適切である」というボタンをリアクションとして押すことに抵抗はありましたか？',
				type: 'likert_7'
			},
			{
				id: 'q_free_reaction',
				text: '「こういうリアクションボタンが欲しかった」というものがあれば教えてください。',
				type: 'text'
			}
		];
	}
	// C. Comparison 1A (Numeric vs Proposed)
	else if (formId === 'q_comparison_1a') {
		questions = [
			{
				id: 'comp_1a_expressiveness',
				text: '「役に立った投票」と「提案手法」のうち、自分の評価をより具体的に表現できたのはどちらですか？',
				type: 'choice',
				options: ['役に立った投票', '提案手法（選択式）', 'どちらも同じくらい']
			},
			{
				id: 'comp_1a_ease',
				text: '「役に立った投票」と「提案手法」のうち、より手軽に行えたのはどちらですか？',
				type: 'choice',
				options: ['役に立った投票', '提案手法（選択式）', 'どちらも同じくらい']
			},
			{
				id: 'comp_1a_comment',
				text: '役に立った投票と提案手法を比較して、感じたことを自由に記述してください。',
				type: 'text'
			}
		];
	}
	// D. Comparison 1B (Text vs Proposed)
	else if (formId === 'q_comparison_1b') {
		questions = [
			{
				id: 'comp_1b_expressiveness',
				text: '「テキスト評価」と「提案手法」のうち、自分の評価をより具体的に表現できたのはどちらですか？',
				type: 'choice',
				options: ['テキスト評価', '提案手法（選択式）', 'どちらも同じくらい']
			},
			{
				id: 'comp_1b_ease',
				text: '「テキスト評価」と「提案手法」のうち、より手軽に行えたのはどちらですか？',
				type: 'choice',
				options: ['テキスト評価', '提案手法（選択式）', 'どちらも同じくらい']
			},
			{
				id: 'comp_1b_comment',
				text: 'テキスト評価と提案手法を比較して、感じたことを自由に記述してください。',
				type: 'text'
			}
		];
	}
	// E. Final Comparison (Post-All)
	else if (formId === 'q_compare_all') {
		questions = [
			{
				id: 'comp_expressiveness',
				text: '3つの手法の中で、自分の言いたいことを最も的確に伝えられたのはどれですか？',
				type: 'choice',
				options: ['提案手法（選択式）', 'テキスト入力', '数値評価（役に立ったボタン）']
			},
			{
				id: 'comp_ease',
				text: '3つの手法の中で、最も手軽に（楽に）行えたのはどれですか？',
				type: 'choice',
				options: ['提案手法（選択式）', 'テキスト入力', '数値評価（役に立ったボタン）']
			},
			{
				id: 'comp_preference',
				text: '総合的に最も使いたいと思ったのはどれですか？',
				type: 'choice',
				options: ['提案手法（選択式）', 'テキスト入力', '数値評価（役に立ったボタン）']
			},
			{
				id: 'comp_comment',
				text: '全体の実験を通して、感想や改善点があれば自由に記述してください。',
				type: 'text'
			}
		];
	}
	// Exp 2: Viewing UI Evaluation
	else if (formId === 'q3_ui') {
		questions = [
			{
				id: 'q1',
				text: 'ハイライトによる可視化は、レビューの重要なポイントを見つけるのに役立ちましたか？',
				type: 'likert_7'
			},
			{
				id: 'q2',
				text: '全体として、提案手法の表示形式は読みやすいと感じましたか？',
				type: 'likert_7'
			},
			{
				id: 'q3',
				text: '通常の表示（役に立った数のみ）と比較して、提案手法の表示の方が商品理解に役立つと感じましたか？',
				type: 'likert_7'
			},
			{
				id: 'q4',
				text: '画面のデザインや使い勝手について、改善点があれば教えてください。',
				type: 'text'
			}
		];
	}
	// Fallback
	else {
		questions = [{ id: 'q_generic', text: 'コメント', type: 'text' }];
	}

	let answers = $state<Record<string, any>>({});

	let isValid = $derived(
		questions.every((q) => {
			if (q.type.startsWith('likert') || q.type === 'choice') return answers[q.id];
			return true;
		})
	);

	function updateAnswer(id: string, value: any) {
		answers[id] = value;
		dispatch('change', { answers, isValid });
	}

	$effect(() => {
		dispatch('change', { answers, isValid });
	});
</script>

<div class="space-y-6">
	<h3 class="border-b pb-2 text-lg font-medium">アンケート回答</h3>

	{#each questions as q}
		<div class="space-y-4 border-b border-gray-100 py-4 last:border-0">
			<label for={q.id} class="block text-sm font-bold leading-relaxed text-gray-800">
				{q.text}
				{#if q.type === 'likert_7'}
					<span class="mt-1 block text-xs font-normal text-gray-500"
						>（1: {scaleLabels[1]} 〜 7: {scaleLabels[7]}）</span
					>
				{/if}
			</label>

			{#if q.type === 'likert_7'}
				<div class="mt-2">
					<div class="flex flex-wrap items-center gap-2 sm:gap-4">
						{#each [1, 2, 3, 4, 5, 6, 7] as val}
							<label class="group flex cursor-pointer flex-col items-center">
								<input
									type="radio"
									name={q.id}
									value={val}
									bind:group={answers[q.id]}
									onchange={() => updateAnswer(q.id, val)}
									class="mb-1 h-5 w-5 border-gray-300 text-indigo-600 focus:ring-indigo-500"
								/>
								<span class="text-sm font-medium text-gray-700">{val}</span>
							</label>
						{/each}
					</div>
					<div class="mt-2 flex w-full max-w-md justify-between px-1 text-xs text-gray-500">
						<span>{scaleLabels[1]}</span>
						<span>{scaleLabels[7]}</span>
					</div>
				</div>
			{:else if q.type === 'choice'}
				<div class="mt-2 space-y-2">
					{#each q.options as opt}
						<label
							class="flex cursor-pointer items-center rounded border border-transparent p-2 hover:border-gray-200 hover:bg-gray-50"
						>
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
			{:else}
				<textarea
					bind:value={answers[q.id]}
					oninput={(e) => updateAnswer(q.id, e.currentTarget.value)}
					rows="3"
					class="mt-1 w-full rounded-md border-gray-300 p-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
					placeholder="自由記述..."
				></textarea>
			{/if}
		</div>
	{/each}
</div>

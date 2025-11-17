<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$shared/components/ui/card';
	import { Button } from '$shared/components/ui/button';
	import { Badge } from '$shared/components/ui/badge';
	import { AlertCircle, Info, CheckCircle2 } from '@lucide/svelte';
	import type { Experiment } from '$lib/experiments/types';

	interface Props {
		experiment: Experiment;
		onStart?: () => void;
		onClose?: () => void;
		showCloseButton?: boolean;
	}

	let { experiment, onStart, onClose, showCloseButton = false }: Props = $props();

	// 実験ごとの詳細説明
	const experimentDetails: Record<
		string,
		{ objective: string; procedure: string[]; time: string; notes: string[] }
	> = {
		'text-vs-selection': {
			objective:
				'選択式レビュー評価とテキストによるレビュー評価の差異を評価し、どちらがより表現力があり、使いやすいかを明らかにします。',
			procedure: [
				'レビュー評価を2種類の方法（テキスト入力と選択式）で実施していただきます',
				'実施順序はランダムに決定されます',
				'すべての評価が終わったら、アンケートに回答していただきます',
				'使いやすさ、表現力、好みなどについて質問します'
			],
			time: '約10〜15分',
			notes: [
				'対象商品は、あなたが使ったことのある商品です',
				'率直な意見をお聞かせください',
				'途中で保存して後から続けることができます'
			]
		},
		'numeric-evaluation': {
			objective:
				'「役に立った」のような数値的な投票が、自分の評価をどの程度反映できているかを確認します。',
			procedure: [
				'レビューに対して「役に立った」の投票を行っていただきます',
				'すべての投票が終わったら、その理由をアンケートで記述していただきます',
				'投票で反映できなかった内容があれば、それも記述していただきます'
			],
			time: '約5〜10分',
			notes: [
				'なぜその投票をしたのか、後で説明できるように意識してください',
				'投票の理由を覚えておいてください'
			]
		},
		'effectiveness:control': {
			objective: '数値的レビュー評価が商品理解にどの程度役立つかを評価します。',
			procedure: [
				'レビューと数値的なレビュー評価を閲覧していただきます',
				'その後、商品に関する理解度テストを受けていただきます',
				'最後に、UIについてのアンケートに回答していただきます'
			],
			time: '約10〜15分',
			notes: [
				'対象商品は、あなたが使ったことのない商品です',
				'レビューと評価をよく読んで理解してください',
				'メモを取ることができます'
			]
		},
		'effectiveness:treatment': {
			objective: '選択式レビュー評価が商品理解にどの程度役立つかを評価します。',
			procedure: [
				'レビューと選択式のレビュー評価を閲覧していただきます',
				'その後、商品に関する理解度テストを受けていただきます',
				'最後に、UIについてのアンケートに回答していただきます'
			],
			time: '約10〜15分',
			notes: [
				'対象商品は、あなたが使ったことのない商品です',
				'レビューと評価をよく読んで理解してください',
				'各文に対する評価も参考にしてください'
			]
		}
	};

	const detailsKey = experiment.variant ? `${experiment.id}:${experiment.variant}` : experiment.id;
	const details =
		experimentDetails[detailsKey] ||
		experimentDetails[experiment.id] ||
		experimentDetails['text-vs-selection'];
</script>

<Card class="mx-auto max-w-3xl">
	<CardHeader>
		<div class="mb-2 flex items-center justify-between">
			<Badge variant="outline">実験説明</Badge>
			{#if showCloseButton && onClose}
				<Button variant="ghost" size="sm" onclick={onClose}>閉じる</Button>
			{/if}
		</div>
		<CardTitle class="text-2xl">{experiment.title}</CardTitle>
		<p class="mt-2 text-gray-600">{experiment.description}</p>
	</CardHeader>
	<CardContent class="space-y-6">
		<!-- 実験目的 -->
		<div>
			<div class="mb-2 flex items-center gap-2">
				<Info class="text-blue-600" size={20} />
				<h3 class="font-semibold">実験目的</h3>
			</div>
			<p class="text-sm text-gray-700">{details.objective}</p>
		</div>

		<!-- 実験手順 -->
		<div>
			<div class="mb-2 flex items-center gap-2">
				<CheckCircle2 class="text-green-600" size={20} />
				<h3 class="font-semibold">実験手順</h3>
			</div>
			<ol class="ml-6 list-decimal space-y-2 text-sm text-gray-700">
				{#each details.procedure as step}
					<li>{step}</li>
				{/each}
			</ol>
		</div>

		<!-- 所要時間 -->
		<div>
			<div class="mb-2 flex items-center gap-2">
				<h3 class="font-semibold">所要時間</h3>
			</div>
			<p class="text-sm text-gray-700">{details.time}</p>
		</div>

		<!-- 注意事項 -->
		<div>
			<div class="mb-2 flex items-center gap-2">
				<AlertCircle class="text-amber-600" size={20} />
				<h3 class="font-semibold">注意事項</h3>
			</div>
			<ul class="ml-6 list-disc space-y-1 text-sm text-gray-700">
				{#each details.notes as note}
					<li>{note}</li>
				{/each}
			</ul>
		</div>

		<!-- タスク一覧 -->
		<div>
			<h3 class="mb-3 font-semibold">実施するタスク</h3>
			<div class="space-y-2">
				{#each experiment.tasks as task, index}
					<div class="flex items-center gap-3 rounded-lg border p-3">
						<Badge variant="secondary">ステップ {index + 1}</Badge>
						<div class="flex-1">
							<div class="font-medium">{task.title}</div>
							<div class="text-sm text-gray-600">{task.description}</div>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- 開始ボタン -->
		{#if onStart}
			<div class="flex justify-center pt-4">
				<Button size="lg" onclick={onStart} class="px-8">実験を開始する</Button>
			</div>
		{/if}
	</CardContent>
</Card>

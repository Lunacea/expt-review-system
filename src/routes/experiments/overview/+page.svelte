<script lang="ts">
	import { goto } from '$app/navigation';
	import { Card, CardContent, CardHeader, CardTitle } from '$shared/components/ui/card';
	import { Button } from '$shared/components/ui/button';
	import { initializeParticipant, loadParticipantData } from '$lib/experiments/store';
	import { onMount } from 'svelte';

	let participantId = $state<string | null>(null);

	onMount(() => {
		// 参加者IDを取得または生成
		let id = loadParticipantData();
		if (!id) {
			id = initializeParticipant();
		}
		participantId = id;
	});

	function handleNext() {
		goto('/experiments/consent');
	}
</script>

<svelte:head>
	<title>実験概要 | カスタマーレビューシステム実験</title>
</svelte:head>

<div class="space-y-6">
	<!-- ヘッダー -->
	<div class="rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 p-8 text-white">
		<h1 class="text-4xl font-bold">実験概要</h1>
		<p class="mt-4 text-lg opacity-90">
			レビュー評価システムの研究にご協力ください
		</p>
		{#if participantId}
			<div class="mt-4 flex items-center gap-2">
				<span class="text-sm opacity-80">参加者ID: {participantId.slice(0, 20)}...</span>
			</div>
		{/if}
	</div>

	<!-- 実験概要 -->
	<Card>
		<CardHeader>
			<CardTitle>実験の目的</CardTitle>
		</CardHeader>
		<CardContent class="space-y-4">
			<p class="text-gray-700">
				本実験では、Amazonのようなレビューシステムにおける評価機能の有効性を検証します。
				従来の数値的な評価と、より詳細な選択式の評価を比較し、ユーザーにとってより良いシステムを明らかにします。
			</p>
		</CardContent>
	</Card>

	<!-- 実験内容 -->
	<Card>
		<CardHeader>
			<CardTitle>実験内容</CardTitle>
		</CardHeader>
		<CardContent class="space-y-4">
			<p class="text-gray-700">
				本実験では、以下の3つの実験のうち、1つまたは複数に参加していただきます。
			</p>
			<div class="space-y-3">
				<div class="rounded-lg border p-4">
					<h4 class="mb-2 font-semibold">実験1: テキストと選択式の比較</h4>
					<p class="text-sm text-gray-600">
						自由記述と選択式のレビュー評価を比較し、表現力と使いやすさを評価します
					</p>
				</div>
				<div class="rounded-lg border p-4">
					<h4 class="mb-2 font-semibold">実験2: 数値的評価の検証</h4>
					<p class="text-sm text-gray-600">
						「役に立った」投票がどれだけ評価を反映できるかを検証します
					</p>
				</div>
				<div class="rounded-lg border p-4">
					<h4 class="mb-2 font-semibold">実験3: 有効性の評価</h4>
					<p class="text-sm text-gray-600">
						レビュー評価が商品理解にどれだけ役立つかを理解度テストで評価します
					</p>
				</div>
			</div>
		</CardContent>
	</Card>

	<!-- 実験の流れ -->
	<Card>
		<CardHeader>
			<CardTitle>実験の流れ</CardTitle>
		</CardHeader>
		<CardContent class="space-y-4">
			<div class="grid gap-4 md:grid-cols-3">
				<div class="rounded-lg border p-4">
					<h4 class="mb-2 font-semibold">所要時間</h4>
					<p class="text-sm text-gray-600">各実験は5〜15分程度で完了します</p>
				</div>
				<div class="rounded-lg border p-4">
					<h4 class="mb-2 font-semibold">データの取り扱い</h4>
					<p class="text-sm text-gray-600">匿名で記録され、研究目的のみに使用されます</p>
				</div>
				<div class="rounded-lg border p-4">
					<h4 class="mb-2 font-semibold">途中保存</h4>
					<p class="text-sm text-gray-600">途中で中断しても、後から続けられます</p>
				</div>
			</div>
		</CardContent>
	</Card>

	<!-- 注意事項 -->
	<Card class="border-l-4 border-l-amber-500 bg-amber-50">
		<CardContent class="p-4">
			<h3 class="mb-2 font-semibold text-amber-900">実験参加にあたっての注意事項</h3>
			<ul class="ml-6 list-disc space-y-1 text-sm text-amber-800">
				<li>実験中は正直な感想・評価をお願いします</li>
				<li>不明な点があれば、いつでも説明を確認できます</li>
				<li>実験はいつでも中断・再開できます</li>
				<li>すべての回答は匿名で処理されます</li>
			</ul>
		</CardContent>
	</Card>

	<!-- 次へボタン -->
	<div class="flex justify-end">
		<Button size="lg" onclick={handleNext}>
			次へ（同意書へ）
		</Button>
	</div>
</div>


<script lang="ts">
	import DocumentSection from '$shared/layout/DocumentSection.svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '$shared/components/ui/card';
	import { Badge } from '$shared/components/ui/badge';
	import { Button } from '$shared/components/ui/button';
	import { goto } from '$app/navigation';
	import { BookOpen, ClipboardList, ArrowRight, CheckCircle, ShieldCheck, Target, Timer, Activity } from '@lucide/svelte';

	const outline = [
		{ id: 'preparation', label: '準備・事前説明' },
		{ id: 'flow', label: '実験の構成' },
		{ id: 'dataset', label: '使用データセット' },
		{ id: 'logging', label: '記録・倫理配慮' },
		{ id: 'next', label: '参加方法' }
	];
</script>

<svelte:head>
	<title>実験セクションガイド | カスタマーレビューシステム実験</title>
</svelte:head>

<div class="space-y-10">
	<Card class="border-none bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xl">
		<CardContent class="space-y-4 p-8">
			<div class="flex flex-wrap items-center gap-3">
				<BookOpen size={28} class="opacity-90" />
				<h1 class="text-3xl font-bold">実験セクションガイド</h1>
			</div>
			<p class="text-sm leading-relaxed text-white/90">
				本ガイドでは、レビュー評価実験の構成と各セクションで行う内容を整理しています。参加前の確認や研究ノートの参照にご活用ください。
			</p>
			<div class="flex flex-wrap gap-2">
				<Badge variant="secondary" class="bg-white/20 text-white">
					実験時間: 約30〜40分（全セクション通しの場合）
				</Badge>
				<Badge variant="secondary" class="bg-white/20 text-white">
					対象機能: Helpful投票 / センテンス評価 / テキストフィードバック
				</Badge>
			</div>
		</CardContent>
	</Card>

	<nav class="rounded-lg border bg-white p-4 shadow-sm">
		<h2 class="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
			<ClipboardList size={18} class="text-indigo-500" />
			セクション一覧
		</h2>
		<div class="flex flex-wrap gap-2">
			{#each outline as item}
				<a
					href={`#${item.id}`}
					class="rounded-full border border-indigo-200 px-3 py-1 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-50"
				>
					{item.label}
				</a>
			{/each}
		</div>
	</nav>

	<section id="preparation">
		<DocumentSection heading="準備・事前説明">
			<div class="space-y-4 text-sm leading-relaxed text-gray-700">
				<p>
					参加者には最初に研究目的とデータ取り扱いに関する説明を行います。参加者IDはローカルストレージで管理され、氏名などの個人情報は収集しません。
				</p>
				<ul class="ml-5 list-disc space-y-1 text-gray-600">
					<li>参加者IDの付与と同意確認</li>
					<li>インターフェースの概要と操作チュートリアル</li>
					<li>中断・再開の方法や問い合わせ先の案内</li>
				</ul>
				<div class="flex items-start gap-3 rounded-lg bg-indigo-50 p-4 text-indigo-900">
					<CheckCircle size={18} class="mt-0.5" />
					<p class="text-xs">
						UI の静的説明が必要な場合は、`$features/experiments/ExperimentInstructions.svelte` を活用し、スクリーンショット付きで操作手順を提示してください。
					</p>
				</div>
			</div>
		</DocumentSection>
	</section>

	<section id="flow">
	<DocumentSection heading="実験の構成">
		<div class="grid gap-4 md:grid-cols-3">
			<Card>
				<CardHeader class="space-y-2">
					<div class="flex items-center gap-2 text-indigo-600">
						<Target size={18} />
						<span class="text-xs font-semibold uppercase tracking-wide">Experiment 1</span>
					</div>
					<CardTitle class="text-base">テキスト vs 選択式</CardTitle>
				</CardHeader>
				<CardContent class="space-y-2 text-xs leading-relaxed text-gray-600">
					<p>自由記述とセンテンス評価 UI を対比させ、表現しやすさと操作性を比較します。</p>
					<ul class="ml-4 list-disc space-y-1">
						<li>タスクA: テキストフィードバック投稿</li>
						<li>タスクB: センテンス評価での多面的投票</li>
						<li>タスクC: 体験後アンケート</li>
					</ul>
				</CardContent>
			</Card>

			<Card>
				<CardHeader class="space-y-2">
					<div class="flex items-center gap-2 text-emerald-600">
						<Timer size={18} />
						<span class="text-xs font-semibold uppercase tracking-wide">Experiment 2</span>
					</div>
					<CardTitle class="text-base">Helpful 投票の妥当性</CardTitle>
				</CardHeader>
				<CardContent class="space-y-2 text-xs leading-relaxed text-gray-600">
					<p>役立ち度投票だけで評価が十分かを確認し、理由記述欄で補完度を測定します。</p>
					<ul class="ml-4 list-disc space-y-1">
						<li>タスクA: Helpful 投票シミュレーション</li>
						<li>タスクB: 判断理由の記録</li>
						<li>タスクC: 満足度アンケート</li>
					</ul>
				</CardContent>
			</Card>

			<Card>
				<CardHeader class="space-y-2">
					<div class="flex items-center gap-2 text-purple-600">
						<Activity size={18} />
						<span class="text-xs font-semibold uppercase tracking-wide">Experiment 3</span>
					</div>
					<CardTitle class="text-base">理解度テスト付き評価</CardTitle>
				</CardHeader>
				<CardContent class="space-y-2 text-xs leading-relaxed text-gray-600">
					<p>選択的リアクションが商品理解に与える効果を、理解度テストで計測します。</p>
					<ul class="ml-4 list-disc space-y-1">
						<li>タスクA: レビュー閲覧（対照群/介入群）</li>
						<li>タスクB: 理解度テスト（`$lib/mock/comprehension-tests.ts`）</li>
						<li>タスクC: UI 評価アンケート</li>
					</ul>
				</CardContent>
			</Card>
		</div>
	</DocumentSection>
	</section>

	<section id="dataset">
	<DocumentSection heading="使用データセット">
		<div class="space-y-4 text-sm leading-relaxed text-gray-700">
			<p>
				レビュー本文は、Hugging Face の
				<a
					href="https://huggingface.co/datasets/SetFit/amazon_reviews_multi_ja"
					target="_blank"
					rel="noreferrer"
					class="text-indigo-600 underline"
				>
					SetFit/amazon_reviews_multi_ja
				</a>
				から取得し、
				<a
					href="https://note.com/eurekachan/n/nbde77c119945"
					target="_blank"
					rel="noreferrer"
					class="text-indigo-600 underline"
				>
					事例記事
				</a>
				を参考に肯定/否定ラベルを整備した上で MongoDB に取り込みました。商品ごとに 30 件ずつの肯定・否定レビューを用意しています。
			</p>

			<ul class="ml-5 list-disc space-y-1 text-gray-600">
				<li>`scripts/import_reviews.py` を使用して `products` / `reviews` コレクションを整備</li>
				<li>レビュー文は自動でセンテンス分割し、注釈カウンタを初期化</li>
				<li>Helpful 投票・検証用に擬似的な `helpfulVotes` / `totalVotes` を付与</li>
			</ul>

			<div class="rounded-lg border border-dashed border-indigo-300 bg-indigo-50 p-4 text-xs text-indigo-900">
				<p class="font-semibold">MongoDB シード手順</p>
				<pre class="mt-2 overflow-x-auto rounded bg-white/60 p-3 text-[11px] leading-relaxed">
python scripts/import_reviews.py \
  --mongodb-uri mongodb://localhost:27017 \
  --mongodb-db review-system
</pre
				>
				<p class="mt-2">
					投入後は `src/lib/server/db/reviews.ts` を通じてサーバーロードから利用できます。
				</p>
			</div>
		</div>
	</DocumentSection>
	</section>

	<section id="logging">
	<DocumentSection heading="記録・倫理配慮">
		<div class="space-y-4 text-sm leading-relaxed text-gray-700">
			<p>
				参加者の操作ログはクライアントストアで収集し、後続で MongoDB に保存できる設計です。ログ出力は
				<code class="rounded bg-gray-100 px-1">src/lib/experiments/store.ts</code>
				の `logEvent` を中心に扱います。
			</p>
			<ul class="ml-5 list-disc space-y-1 text-gray-600">
				<li>記録する情報はタスク ID・イベント種別・タイムスタンプのみ</li>
				<li>参加者 ID は自動生成し、個人を特定できない形式</li>
				<li>アンケートは任意回答とし、自由記述は匿名化を前提に利用</li>
			</ul>
			<div class="flex items-start gap-3 rounded-lg bg-emerald-50 p-4 text-emerald-900">
				<ShieldCheck size={18} class="mt-0.5" />
				<p class="text-xs">
					研究倫理審査を想定する場合、匿名化方針とデータ保持期間を実装コメントに記載し、外部共有時はサマリレベルに匿名化してください。
				</p>
			</div>
		</div>
	</DocumentSection>
	</section>

	<section id="next">
	<DocumentSection heading="参加方法">
		<div class="space-y-4 text-sm leading-relaxed text-gray-700">
			<p>
				準備が整ったら、以下のボタンから実験一覧へ移動し、参加したい実験を選択してください。各タスクは進捗が保存されるため、途中で離脱しても再開が可能です。
			</p>
			<Button class="gap-2" onclick={() => goto('/experiments')}>
				実験一覧ページへ戻る
				<ArrowRight size={16} />
			</Button>
		</div>
	</DocumentSection>
	</section>
</div>


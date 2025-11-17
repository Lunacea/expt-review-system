<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$shared/components/ui/card';
	import { Button } from '$shared/components/ui/button';
	import { ShoppingBag, FlaskConical } from '@lucide/svelte';
</script>

<svelte:head>
	<title>カスタマーレビューシステム実験 | ホーム</title>
</svelte:head>

<div class="space-y-8">
	<!-- ヒーローセクション -->
	<div class="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 p-8 text-white">
		<h1 class="text-4xl font-bold">カスタマーレビューシステム実験</h1>
		<p class="mt-4 text-lg opacity-90">Amazonライクなレビューシステムの実験プラットフォーム</p>
	</div>

	<!-- 実験概要 -->
	<Card>
		<CardHeader>
			<CardTitle>実験概要</CardTitle>
		</CardHeader>
		<CardContent class="space-y-4">
			<p class="text-gray-700">
				本実験では、Amazonのようなレビューシステムにおける評価機能の有効性を検証します。
				従来の数値的な評価と、より詳細な選択式の評価を比較し、ユーザーにとってより良いシステムを明らかにします。
			</p>
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

	<!-- アクションボタン -->
	<div class="grid gap-6 md:grid-cols-2">
		<div class="rounded-lg border-2 border-dashed bg-gray-50 p-8 text-center">
			<h3 class="text-xl font-bold">システムのプレビュー</h3>
			<p class="mt-2 text-gray-600">
				商品一覧から気になる商品を選んで、各レビュー機能を体験してください。
			</p>
			<div class="mt-6">
				<a href="/products">
					<Button size="lg">
						<ShoppingBag class="mr-2" size={20} />
						プレビューへ
					</Button>
				</a>
			</div>
		</div>

		<div class="rounded-lg border-2 border-purple-500 bg-purple-50 p-8 text-center">
			<h3 class="text-xl font-bold">実験に参加する</h3>
			<p class="mt-2 text-gray-600">
				レビューシステムの研究にご協力いただける方は、実験にご参加ください。
			</p>
			<div class="mt-6">
				<a href="/experiments/overview">
					<Button size="lg" class="bg-purple-600 hover:bg-purple-700">
						<FlaskConical class="mr-2" size={20} />
						実験へ
					</Button>
				</a>
			</div>
		</div>
	</div>
</div>

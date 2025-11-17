<script lang="ts">
	import { goto } from '$app/navigation';
	import { Card, CardContent, CardHeader, CardTitle } from '$shared/components/ui/card';
	import { Button } from '$shared/components/ui/button';
	import { setConsent } from '$lib/experiments/store';

	let agreed = $state(false);

	function handleAgree() {
		if (!agreed) return;
		setConsent(true);
		goto('/experiments');
	}

	function handleBack() {
		goto('/experiments/overview');
	}
</script>

<svelte:head>
	<title>実験同意書 | カスタマーレビューシステム実験</title>
</svelte:head>

<div class="space-y-6">
	<!-- ヘッダー -->
	<div class="rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 p-8 text-white">
		<h1 class="text-4xl font-bold">実験同意書</h1>
		<p class="mt-4 text-lg opacity-90">
			実験に参加する前に、以下の内容をご確認ください
		</p>
	</div>

	<!-- 同意書内容 -->
	<Card>
		<CardHeader>
			<CardTitle>研究への参加について</CardTitle>
		</CardHeader>
		<CardContent class="space-y-4">
			<div class="space-y-4 text-sm text-gray-700">
				<div>
					<h4 class="mb-2 font-semibold">1. 研究の目的</h4>
					<p>
						本実験は、オンラインレビューシステムにおける評価機能の有効性を検証することを目的としています。
						ユーザーがレビューを評価する際の行動や意見を分析し、より良いレビューシステムの設計に役立てます。
					</p>
				</div>

				<div>
					<h4 class="mb-2 font-semibold">2. 実験の内容</h4>
					<p>
						実験では、商品レビューを閲覧し、そのレビューに対して評価を行っていただきます。
						評価方法は実験によって異なり、従来の「役に立った」投票や、より詳細な選択式評価などがあります。
						また、一部の実験ではアンケートや理解度テストにご協力いただく場合があります。
					</p>
				</div>

				<div>
					<h4 class="mb-2 font-semibold">3. 所要時間</h4>
					<p>
						各実験は5〜15分程度で完了します。複数の実験に参加される場合は、その合計時間がかかります。
						実験は途中で中断し、後から続けることができます。
					</p>
				</div>

				<div>
					<h4 class="mb-2 font-semibold">4. データの取り扱い</h4>
					<p>
						収集されたデータは匿名で処理され、研究目的のみに使用されます。
						個人を特定できる情報は収集されません。データは統計的に分析され、学術論文や研究発表に使用される可能性があります。
					</p>
				</div>

				<div>
					<h4 class="mb-2 font-semibold">5. 参加の自由</h4>
					<p>
						実験への参加は任意です。いつでも中断や辞退が可能です。
						実験を中断または辞退されても、不利益を被ることはありません。
					</p>
				</div>

				<div>
					<h4 class="mb-2 font-semibold">6. リスクと利益</h4>
					<p>
						本実験は、通常のWebサイトの利用と同程度のリスクしかありません。
						直接的な利益はありませんが、オンラインレビューシステムの改善に貢献できます。
					</p>
				</div>

				<div>
					<h4 class="mb-2 font-semibold">7. 問い合わせ</h4>
					<p>
						実験に関する質問や懸念事項がある場合は、実験ページの説明を確認するか、
						実験管理者にお問い合わせください。
					</p>
				</div>
			</div>
		</CardContent>
	</Card>

	<!-- 同意チェックボックス -->
	<Card class="border-l-4 border-l-blue-500 bg-blue-50">
		<CardContent class="p-4">
			<label class="flex cursor-pointer items-start gap-3">
				<input
					type="checkbox"
					bind:checked={agreed}
					class="mt-1 h-5 w-5 rounded border-gray-300"
				/>
				<div class="flex-1">
					<p class="font-semibold text-blue-900">
						上記の内容を理解し、実験に参加することに同意します
					</p>
					<p class="mt-1 text-sm text-blue-800">
						チェックを入れることで、実験への参加に同意したものとみなされます。
					</p>
				</div>
			</label>
		</CardContent>
	</Card>

	<!-- ボタン -->
	<div class="flex justify-between">
		<Button variant="outline" onclick={handleBack}>
			戻る
		</Button>
		<Button size="lg" onclick={handleAgree} disabled={!agreed}>
			同意して実験一覧へ進む
		</Button>
	</div>
</div>

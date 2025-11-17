<script lang="ts">
	import { goto } from '$app/navigation';
	import { Card, CardContent, CardHeader, CardTitle } from '$shared/components/ui/card';
	import { Button } from '$shared/components/ui/button';
	import { Badge } from '$shared/components/ui/badge';
	import { ClipboardList, BarChart, Eye, ChevronRight, CheckCircle2, Circle, FileDown, X } from '@lucide/svelte';
	import {
		hasConsent,
		initializeParticipant,
		loadParticipantData,
		restoreParticipantData,
		getConsentDate,
		setConsent,
		participantData as participantDataStore
	} from '$lib/experiments/store';
	import { onMount } from 'svelte';
	import type { Experiment, ParticipantData } from '$lib/experiments/types';
	import { get } from 'svelte/store';
	import jsPDF from 'jspdf';
	import html2canvas from 'html2canvas';

	let participantId = $state<string | null>(null);
	let participantData = $state<ParticipantData | null>(null);
	let consentDate = $state<string | null>(null);
	let showConsentDocument = $state(false);
	let consentContentRef: HTMLDivElement | null = $state(null);
	let pdfContentRef: HTMLDivElement | null = $state(null);

	function updateParticipantData() {
		const data = get(participantDataStore);
		participantData = data;
	}

	onMount(() => {
		// 同意チェック（クライアントサイドでのみ実行）
		if (typeof window === 'undefined') return;
		
		if (!hasConsent()) {
			goto('/experiments/overview');
			return;
		}

		// 参加者IDを取得または生成
		let id = loadParticipantData();
		if (!id) {
			id = initializeParticipant();
		}
		participantId = id;

		// 参加者データを復元
		const data = restoreParticipantData();
		if (data) {
			participantData = data;
		} else {
			// データがない場合は初期化（IDは既に取得済み）
			if (id) {
				participantData = {
					participantId: id,
					experiments: [],
					createdAt: new Date().toISOString()
				};
			}
		}

		// 同意日時を取得
		consentDate = getConsentDate();

		// ストアの変更を監視
		const unsubscribe = participantDataStore.subscribe(() => {
			updateParticipantData();
		});

		return () => {
			unsubscribe();
		};
	});

	const experiments = [
		{
			id: 'text-vs-selection',
			title: '実験1: テキストと選択式の比較',
			description: '自由記述と選択式のレビュー評価を比較し、表現力と使いやすさを評価します',
			icon: ClipboardList,
			color: 'bg-blue-100 text-blue-600',
			time: '約10〜15分'
		},
		{
			id: 'numeric-evaluation',
			title: '実験2: 数値的評価の検証',
			description: '「役に立った」投票がどれだけ評価を反映できるかを検証します',
			icon: BarChart,
			color: 'bg-green-100 text-green-600',
			time: '約5〜10分'
		},
		{
			id: 'effectiveness',
			title: '実験3: 有効性の評価',
			description: 'レビュー評価が商品理解にどれだけ役立つかを理解度テストで評価します',
			icon: Eye,
			color: 'bg-purple-100 text-purple-600',
			time: '約10〜15分'
		}
	];

	function getExperimentHistory(experimentId: string): Experiment | undefined {
		if (!participantData || !participantData.experiments) return undefined;
		return participantData.experiments.find((exp) => exp.id === experimentId);
	}

	function formatDate(dateString: string | undefined): string {
		if (!dateString) return '-';
		const date = new Date(dateString);
		return date.toLocaleString('ja-JP', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function startExperiment(experimentId: string) {
		goto(`/experiments/${experimentId}/start`);
	}

	function handleRevokeConsent() {
		if (confirm('同意を取り消すと、すべての実験データが削除されます。本当に同意を取り消しますか？')) {
			setConsent(false);
			goto('/');
		}
	}

	function toggleConsentDocument() {
		showConsentDocument = !showConsentDocument;
	}

	async function downloadPDF() {
		if (!pdfContentRef) return;

		try {
			// HTMLをキャンバスに変換
			const canvas = await html2canvas(pdfContentRef, {
				scale: 2,
				useCORS: true,
				backgroundColor: '#ffffff',
				width: pdfContentRef.scrollWidth,
				height: pdfContentRef.scrollHeight
			});

			// PDFを作成
			const imgData = canvas.toDataURL('image/png');
			const pdf = new jsPDF('p', 'mm', 'a4');
			const pdfWidth = pdf.internal.pageSize.getWidth();
			const pdfHeight = pdf.internal.pageSize.getHeight();
			
			const imgWidth = canvas.width;
			const imgHeight = canvas.height;
			const ratio = pdfWidth / imgWidth;
			const imgScaledHeight = imgHeight * ratio;

			// 複数ページに分割
			let heightLeft = imgScaledHeight;
			let position = 0;

			pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgScaledHeight);
			heightLeft -= pdfHeight;

			while (heightLeft > 0) {
				position = heightLeft - imgScaledHeight;
				pdf.addPage();
				pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgScaledHeight);
				heightLeft -= pdfHeight;
			}

			// PDFをダウンロード
			const date = new Date().toISOString().split('T')[0];
			pdf.save(`実験同意書_${date}.pdf`);
		} catch (error) {
			console.error('PDF生成エラー:', error);
			alert('PDFの生成に失敗しました。もう一度お試しください。');
		}
	}
</script>

<svelte:head>
	<title>実験一覧 | カスタマーレビューシステム実験</title>
</svelte:head>

<div class="space-y-8">
	<!-- ヘッダー -->
	<div class="rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 p-8 text-white">
		<h1 class="text-4xl font-bold">レビューシステム実験</h1>
		<p class="mt-4 text-lg opacity-90">
			レビュー評価システムの研究にご協力ください
		</p>
		{#if participantId}
			<div class="mt-4 flex items-center gap-2">
				<Badge variant="secondary" class="bg-white/20 text-white">
					参加者ID: {participantId.slice(0, 20)}...
				</Badge>
			</div>
		{/if}
		{#if consentDate}
			<div class="mt-2 text-sm opacity-80">
				同意日時: {formatDate(consentDate)}
			</div>
		{/if}
		<div class="mt-4 flex gap-3">
			<Button variant="outline" class="bg-white/10 text-white hover:bg-white/20" onclick={toggleConsentDocument}>
				<Eye size={18} class="mr-2" />
				同意書を表示
			</Button>
			<Button variant="outline" class="bg-white/10 text-white hover:bg-white/20" onclick={downloadPDF}>
				<FileDown size={18} class="mr-2" />
				PDFダウンロード
			</Button>
			<Button variant="outline" class="bg-white/10 text-white hover:bg-white/20" onclick={handleRevokeConsent}>
				<X size={18} class="mr-2" />
				同意を取り消す
			</Button>
		</div>
	</div>

	<!-- 同意書表示モーダル -->
	{#if showConsentDocument}
		<div
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
			onclick={toggleConsentDocument}
			role="button"
			tabindex="0"
			onkeydown={(e) => {
				if (e.key === 'Escape') toggleConsentDocument();
			}}
		>
			<div
				class="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl"
				onclick={(e) => e.stopPropagation()}
				role="dialog"
			>
				<div class="mb-4 flex items-center justify-between">
					<h2 class="text-2xl font-bold">実験同意書</h2>
					<Button variant="ghost" size="icon" onclick={toggleConsentDocument}>×</Button>
				</div>
				<div bind:this={consentContentRef} class="space-y-4 p-6">
					<h1 class="text-3xl font-bold">実験同意書</h1>
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
				</div>
			</div>
		</div>
	{/if}

	<!-- 同意書内容（PDF生成用の非表示要素） -->
	<div bind:this={pdfContentRef} class="fixed -left-[9999px] top-0 w-[210mm] bg-white p-8">
		<h1 class="mb-6 text-3xl font-bold">実験同意書</h1>
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
	</div>

	<!-- 実験一覧 -->
	<div>
		<h2 class="mb-4 text-2xl font-bold">実施可能な実験</h2>
		<div class="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
			{#each experiments as experiment}
				{@const Icon = experiment.icon}
				{@const history = getExperimentHistory(experiment.id)}
				<Card class="transition-shadow hover:shadow-lg">
					<CardContent class="p-6">
						<div class="flex items-start gap-6">
							<div class="flex h-16 w-16 items-center justify-center rounded-lg {experiment.color}">
								<Icon size={32} />
							</div>

							<div class="flex-1">
								<div class="mb-2 flex items-center justify-between">
									<h3 class="text-xl font-bold">{experiment.title}</h3>
									{#if history}
										{#if history.status === 'completed'}
											<Badge variant="default" class="bg-green-600">
												<CheckCircle2 size={14} class="mr-1" />
												完了
											</Badge>
										{:else if history.status === 'in-progress'}
											<Badge variant="default" class="bg-blue-600">
												進行中
											</Badge>
										{/if}
									{/if}
								</div>
								<p class="mb-4 text-gray-600">{experiment.description}</p>

								{#if history}
									<div class="mb-4 rounded-lg border bg-gray-50 p-4">
										<h4 class="mb-2 text-sm font-semibold">実験履歴</h4>
										<div class="space-y-2 text-sm text-gray-600">
											<div>
												<span class="font-medium">開始日時:</span> {formatDate(history.startedAt)}
											</div>
											{#if history.completedAt}
												<div>
													<span class="font-medium">完了日時:</span> {formatDate(history.completedAt)}
												</div>
											{/if}
											<div>
												<span class="font-medium">進捗:</span> {history.tasks.filter((t) => t.completed).length} / {history.tasks.length} タスク完了
											</div>
										</div>

										<!-- タスク一覧 -->
										<div class="mt-3 space-y-2">
											<h5 class="text-xs font-semibold text-gray-700">タスク一覧</h5>
											{#each history.tasks as task}
												<div class="flex items-center gap-2 rounded border bg-white p-2 text-xs">
													{#if task.completed}
														<CheckCircle2 size={14} class="text-green-600" />
													{:else if task.startedAt}
														<Circle size={14} class="text-blue-600" />
													{:else}
														<Circle size={14} class="text-gray-300" />
													{/if}
													<span class="flex-1">{task.title}</span>
													{#if task.completedAt}
														<span class="text-gray-500">
															{new Date(task.completedAt).toLocaleString('ja-JP', {
																month: 'short',
																day: 'numeric',
																hour: '2-digit',
																minute: '2-digit'
															})}
														</span>
													{/if}
												</div>
											{/each}
										</div>
									</div>
								{/if}

								<div class="mb-4">
									<Badge variant="outline">{experiment.time}</Badge>
								</div>

								<Button onclick={() => startExperiment(experiment.id)} class="gap-2">
									{#if history?.status === 'completed'}
										再開
									{:else if history?.status === 'in-progress'}
										続ける
									{:else}
										実験を開始
									{/if}
									<ChevronRight size={16} />
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			{/each}
		</div>
	</div>
</div>


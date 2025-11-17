// 理解度テストのモックデータ

import type { ComprehensionQuestion } from '$lib/experiments/types';

// メカニカルキーボードの理解度テスト
export const mechanicalKeyboardTest: ComprehensionQuestion[] = [
	{
		id: 'q1',
		question: 'このキーボードのスイッチは何軸ですか？',
		options: ['赤軸', '青軸', '茶軸', '黒軸'],
		correctAnswer: 1
	},
	{
		id: 'q2',
		question: 'レビューによると、このキーボードの主な用途として最も適しているのは？',
		options: ['ゲーム', 'プログラミング', '動画編集', 'デザイン'],
		correctAnswer: 1
	},
	{
		id: 'q3',
		question: 'このキーボードの欠点として指摘されているのは？',
		options: [
			'キーの反応が悪い',
			'やや重い',
			'RGBライティングが派手すぎる',
			'価格が高すぎる'
		],
		correctAnswer: 1
	},
	{
		id: 'q4',
		question: 'レビューによると、長時間のタイピングに対する評価は？',
		options: [
			'非常に疲れやすい',
			'やや疲れやすい',
			'普通',
			'疲れにくい'
		],
		correctAnswer: 3
	},
	{
		id: 'q5',
		question: 'ビルドクオリティについての評価は？',
		options: ['低品質', '普通', '高品質', '非常に高品質'],
		correctAnswer: 2
	},
	{
		id: 'q6',
		question: 'RGBライティングについての意見は？',
		options: [
			'派手すぎる',
			'ちょうど良い',
			'地味すぎる',
			'機能しない'
		],
		correctAnswer: 1
	},
	{
		id: 'q7',
		question: 'このキーボードを最も評価している点は？',
		options: [
			'価格の安さ',
			'デザイン性',
			'キーの反応とタイピング感',
			'持ち運びやすさ'
		],
		correctAnswer: 2
	},
	{
		id: 'q8',
		question: 'レビューアーが使用して起きた問題は？',
		options: [
			'キーが外れた',
			'接続が切れた',
			'誤入力が減った',
			'ソフトウェアが動かない'
		],
		correctAnswer: 2
	},
	{
		id: 'q9',
		question: 'このキーボードの総合的な評価は？',
		options: [
			'非常に不満',
			'やや不満',
			'満足',
			'非常に満足'
		],
		correctAnswer: 3
	},
	{
		id: 'q10',
		question: 'レビューアーは何台のメカニカルキーボードを試してきましたか？',
		options: [
			'これが初めて',
			'2〜3台',
			'何台も',
			'記載なし'
		],
		correctAnswer: 2
	}
];

// スマートウォッチの理解度テスト
export const smartWatchTest: ComprehensionQuestion[] = [
	{
		id: 'q1',
		question: 'レビューアーにとってこれは何台目のスマートウォッチですか？',
		options: ['1台目（初めて）', '2台目', '3台目以上', '記載なし'],
		correctAnswer: 0
	},
	{
		id: 'q2',
		question: 'バッテリーの持続時間は？',
		options: ['1日', '2日', '3日', '5日'],
		correctAnswer: 2
	},
	{
		id: 'q3',
		question: 'このスマートウォッチで記録できる健康データとして言及されていないのは？',
		options: ['睡眠の質', '心拍数', '血圧', '歩数'],
		correctAnswer: 2
	},
	{
		id: 'q4',
		question: 'レビューアーの生活に対する影響は？',
		options: [
			'特に変化なし',
			'やや改善',
			'生活が変わった',
			'悪影響があった'
		],
		correctAnswer: 2
	},
	{
		id: 'q5',
		question: 'デザインについての評価は？',
		options: [
			'ダサい',
			'普通',
			'スタイリッシュ',
			'記載なし'
		],
		correctAnswer: 2
	}
];

export function getComprehensionTest(productSlug: string): ComprehensionQuestion[] {
	switch (productSlug) {
		case 'mechanical-keyboard-rgb':
			return mechanicalKeyboardTest;
		case 'smart-watch-x1':
			return smartWatchTest;
		default:
			return [];
	}
}


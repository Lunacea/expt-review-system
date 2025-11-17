// 日本語レビューデータのモック
// 査読付き論文で使用される楽天データセットをベースにしたサンプル

export interface Sentence {
	id: string;
	text: string;
	annotations: {
		type: 'insightful' | 'unclear' | 'empathy' | 'helpful';
		count: number;
	}[];
}

export interface Review {
	id: string;
	productId: string;
	userId: string;
	userName: string;
	userAvatar: string;
	rating: number;
	title: string;
	content: string;
	sentences?: Sentence[];
	verifiedPurchase: boolean;
	createdAt: string;
	helpfulVotes: number;
	totalVotes: number;
	images?: string[];
}

export interface Product {
	id: string;
	slug: string;
	name: string;
	category: string;
	image: string;
	price: number;
	averageRating: number;
	totalReviews: number;
}

export interface TextFeedback {
	id: string;
	reviewId: string;
	userId: string;
	userName: string;
	userAvatar: string;
	content: string;
	createdAt: string;
	replies?: TextFeedback[];
}

// 文を分割する関数（簡易版）
function splitIntoSentences(text: string): Sentence[] {
	const sentenceEnds = /[。！？\n]/g;
	const sentences: string[] = [];
	let lastIndex = 0;
	let match;

	while ((match = sentenceEnds.exec(text)) !== null) {
		const sentence = text.slice(lastIndex, match.index + 1).trim();
		if (sentence) {
			sentences.push(sentence);
		}
		lastIndex = match.index + 1;
	}

	// 残りのテキストを追加
	const remaining = text.slice(lastIndex).trim();
	if (remaining) {
		sentences.push(remaining);
	}

	return sentences.map((text, index) => ({
		id: `sentence-${index}`,
		text,
		annotations: [
			{ type: 'insightful', count: 0 },
			{ type: 'unclear', count: 0 },
			{ type: 'empathy', count: 0 },
			{ type: 'helpful', count: 0 }
		]
	}));
}

// モック商品データ
export const mockProducts: Product[] = [
	{
		id: 'prod-001',
		slug: 'wireless-earbuds-pro',
		name: 'ワイヤレスイヤホン Pro',
		category: '家電・カメラ',
		image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400',
		price: 15800,
		averageRating: 4.2,
		totalReviews: 127
	},
	{
		id: 'prod-002',
		slug: 'smart-watch-x1',
		name: 'スマートウォッチ X1',
		category: '家電・カメラ',
		image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
		price: 29800,
		averageRating: 4.5,
		totalReviews: 89
	},
	{
		id: 'prod-003',
		slug: 'mechanical-keyboard-rgb',
		name: 'メカニカルキーボード RGB',
		category: 'パソコン・周辺機器',
		image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400',
		price: 12500,
		averageRating: 4.7,
		totalReviews: 213
	}
];

// モックレビューデータ（楽天データセット形式を参考）
const mockReviewsRaw: Omit<Review, 'sentences'>[] = [
	{
		id: 'rev-001',
		productId: 'prod-001',
		userId: 'user-001',
		userName: '田中太郎',
		userAvatar: 'https://i.pravatar.cc/150?u=user001',
		rating: 5,
		title: '音質が素晴らしい！コスパ最高のイヤホンです',
		content:
			'ワイヤレスイヤホンを初めて購入しましたが、この価格帯でこの音質は驚きです。低音がしっかり出ていて、高音も綺麗に響きます。バッテリーの持ちも良く、一日中使用しても問題ありません。ケースもコンパクトで持ち運びやすいです。ただし、装着感には個人差があるかもしれません。私の耳には完璧にフィットしましたが、友人に貸したところ少し緩いと言っていました。それでも、この価格でこの品質なら文句なしです。',
		verifiedPurchase: true,
		createdAt: '2024-10-15T14:23:00Z',
		helpfulVotes: 42,
		totalVotes: 48
	},
	{
		id: 'rev-002',
		productId: 'prod-001',
		userId: 'user-002',
		userName: '佐藤花子',
		userAvatar: 'https://i.pravatar.cc/150?u=user002',
		rating: 4,
		title: '良い製品だが、接続が少し不安定',
		content:
			'音質は価格を考えると十分満足できるレベルです。デザインもシンプルで気に入っています。しかし、時々Bluetooth接続が途切れることがあります。特に混雑した駅などでは頻繁に起こります。それ以外は特に問題なく使えているので、この評価にしました。ファームウェアのアップデートで改善されることを期待しています。',
		verifiedPurchase: true,
		createdAt: '2024-10-18T09:45:00Z',
		helpfulVotes: 28,
		totalVotes: 35
	},
	{
		id: 'rev-003',
		productId: 'prod-001',
		userId: 'user-003',
		userName: '鈴木一郎',
		userAvatar: 'https://i.pravatar.cc/150?u=user003',
		rating: 3,
		title: '可もなく不可もなく',
		content:
			'普通のワイヤレスイヤホンです。音質は価格相応といったところでしょうか。特に不満はありませんが、特に感動もありません。通勤時に音楽を聴く程度の使用なら十分だと思います。',
		verifiedPurchase: true,
		createdAt: '2024-10-20T18:12:00Z',
		helpfulVotes: 12,
		totalVotes: 20
	},
	{
		id: 'rev-004',
		productId: 'prod-001',
		userId: 'user-004',
		userName: '山田美咲',
		userAvatar: 'https://i.pravatar.cc/150?u=user004',
		rating: 5,
		title: 'ランニングに最適！汗にも強い',
		content:
			'ジョギング用に購入しました。防水性能が高く、汗をかいても全く問題ありません。装着感も安定していて、激しく動いても外れることがありません。音質もランニング中に聴く分には十分です。充電ケースも小さくてポケットに入るサイズなので、持ち運びに便利です。スポーツをする人には特におすすめです。',
		verifiedPurchase: true,
		createdAt: '2024-10-22T07:30:00Z',
		helpfulVotes: 35,
		totalVotes: 38
	},
	{
		id: 'rev-005',
		productId: 'prod-001',
		userId: 'user-005',
		userName: '高橋健太',
		userAvatar: 'https://i.pravatar.cc/150?u=user005',
		rating: 2,
		title: 'すぐに故障しました',
		content:
			'購入して2週間で左側のイヤホンから音が出なくなりました。カスタマーサポートに連絡したところ、交換対応してくれるとのことですが、品質管理に問題があるのではないでしょうか。音質自体は悪くなかっただけに残念です。',
		verifiedPurchase: true,
		createdAt: '2024-10-25T16:50:00Z',
		helpfulVotes: 15,
		totalVotes: 25
	},
	{
		id: 'rev-006',
		productId: 'prod-002',
		userId: 'user-006',
		userName: '伊藤さくら',
		userAvatar: 'https://i.pravatar.cc/150?u=user006',
		rating: 5,
		title: '健康管理に役立っています',
		content:
			'スマートウォッチは初めてですが、これを買って生活が変わりました。睡眠の質や心拍数が記録されるので、健康管理に非常に役立っています。通知機能も便利で、スマホを取り出さなくてもメッセージを確認できます。バッテリーも3日は持つので、頻繁に充電する必要がありません。デザインもスタイリッシュで、どんな服装にも合います。',
		verifiedPurchase: true,
		createdAt: '2024-10-12T11:20:00Z',
		helpfulVotes: 56,
		totalVotes: 61
	},
	{
		id: 'rev-007',
		productId: 'prod-003',
		userId: 'user-007',
		userName: '渡辺大輔',
		userAvatar: 'https://i.pravatar.cc/150?u=user007',
		rating: 5,
		title: 'プログラミングに最適なキーボード',
		content:
			'メカニカルキーボードを何台も試してきましたが、これが一番気に入っています。青軸のクリック感が心地よく、長時間のタイピングでも疲れません。キーの反応も良く、誤入力が減りました。RGBライティングは派手すぎず、作業の邪魔になりません。ビルドクオリティも高く、しっかりとした作りです。唯一の欠点は少し重いことですが、持ち運ばない限り問題ありません。',
		verifiedPurchase: true,
		createdAt: '2024-10-08T22:15:00Z',
		helpfulVotes: 73,
		totalVotes: 78
	}
];

// センテンスに分割してモックレビューを作成
export const mockReviews: Review[] = mockReviewsRaw.map((review) => ({
	...review,
	sentences: splitIntoSentences(review.content)
}));

// モックテキストフィードバック
export const mockTextFeedbacks: TextFeedback[] = [
	{
		id: 'feedback-001',
		reviewId: 'rev-001',
		userId: 'user-010',
		userName: '中村次郎',
		userAvatar: 'https://i.pravatar.cc/150?u=user010',
		content: '詳しいレビューありがとうございます！装着感について質問ですが、長時間使用しても耳が痛くなりませんか？',
		createdAt: '2024-10-16T10:30:00Z',
		replies: [
			{
				id: 'feedback-002',
				reviewId: 'rev-001',
				userId: 'user-001',
				userName: '田中太郎',
				userAvatar: 'https://i.pravatar.cc/150?u=user001',
				content:
					'質問ありがとうございます。私は3時間連続で使用しても特に痛みは感じませんでした。ただ、耳の形には個人差があるので、実際に試してみることをお勧めします。',
				createdAt: '2024-10-16T14:20:00Z'
			}
		]
	},
	{
		id: 'feedback-003',
		reviewId: 'rev-002',
		userId: 'user-011',
		userName: '小林優子',
		userAvatar: 'https://i.pravatar.cc/150?u=user011',
		content:
			'同じ問題を経験しました。設定でBluetoothのコーデックをSBCからAACに変更すると改善されるかもしれません。',
		createdAt: '2024-10-19T15:45:00Z'
	}
];

// レビューを取得する関数（モック）
export function getReviewsByProductId(productId: string): Review[] {
	return mockReviews.filter((review) => review.productId === productId);
}

// 商品を取得する関数（モック）
export function getProductBySlug(slug: string): Product | undefined {
	return mockProducts.find((product) => product.slug === slug);
}

// テキストフィードバックを取得する関数（モック）
export function getTextFeedbacksByReviewId(reviewId: string): TextFeedback[] {
	return mockTextFeedbacks.filter((feedback) => feedback.reviewId === reviewId);
}


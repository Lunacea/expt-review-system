export type SentenceAnnotationType =
	| 'clear-claim' // 明確な主張（わかりやすい）
	| 'convincing' // 納得できる
	| 'multi-perspective' // 多角的な視点（興味深い）
	| 'empathy' // 共感できる
	| 'needs-evidence' // 根拠が必要
	| 'needs-objectivity' // もっと客観的に
	| 'inappropriate'; // 内容が不適切

export interface SentenceAnnotation {
	type: SentenceAnnotationType;
	count: number;
}

export interface ReviewSentence {
	id: string;
	text: string;
	annotations: SentenceAnnotation[];
}

export interface Review {
	id: string;
	productId: string;
	productSlug: string;
	datasetId?: string;
	sentiment: 'positive' | 'negative';
	rating: number;
	title: string;
	content: string;
	userId: string;
	userName: string;
	userAvatar: string;
	verifiedPurchase: boolean;
	createdAt: string;
	helpfulVotes: number;
	totalVotes: number;
	language: string;
	sentences?: ReviewSentence[];
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
	description?: string;
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


// データベースモデル定義

import { ObjectId } from 'mongodb';

// ユーザーモデル
export interface User {
	_id?: ObjectId;
	username: string;
	email: string;
	password: string; // ハッシュ化されたパスワード
	displayName: string;
	role: 'participant' | 'researcher' | 'admin';
	createdAt: Date;
	updatedAt: Date;
	lastLoginAt?: Date;
}

// 実験データモデル
export interface ExperimentData {
	_id?: ObjectId;
	userId: ObjectId;
	experimentId: string;
	experimentType: 'text-vs-selection' | 'numeric-evaluation' | 'effectiveness';
	status: 'not-started' | 'in-progress' | 'completed';
	tasks: {
		taskId: string;
		type: string;
		completed: boolean;
		startedAt?: Date;
		completedAt?: Date;
	}[];
	startedAt?: Date;
	completedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
}

// 実験ログモデル
export interface ExperimentLog {
	_id?: ObjectId;
	userId: ObjectId;
	experimentId: string;
	taskId: string;
	eventType: 'task-start' | 'task-complete' | 'annotation' | 'vote' | 'feedback';
	data: Record<string, unknown>;
	timestamp: Date;
	createdAt: Date;
}

// アンケート回答モデル
export interface QuestionnaireResponse {
	_id?: ObjectId;
	userId: ObjectId;
	experimentId: string;
	questionnaireId: string;
	responses: {
		questionId: string;
		value: string | number;
		timestamp: Date;
	}[];
	submittedAt: Date;
	createdAt: Date;
}

// 理解度テスト結果モデル
export interface ComprehensionTestResult {
	_id?: ObjectId;
	userId: ObjectId;
	experimentId: string;
	productSlug: string;
	answers: number[];
	score: number;
	completedAt: Date;
	createdAt: Date;
}

// レビュー関連モデル
export type SentenceAnnotationType =
	| 'clear-claim' // 明確な主張（わかりやすい）
	| 'convincing' // 納得できる
	| 'multi-perspective' // 多角的な視点（興味深い）
	| 'empathy' // 共感できる
	| 'needs-evidence' // 根拠が必要
	| 'needs-objectivity' // もっと客観的に
	| 'inappropriate'; // 内容が不適切

export interface ReviewSentence {
	id: string;
	text: string;
	annotations: {
		type: SentenceAnnotationType;
		count: number;
	}[];
}

export interface ReviewDocument {
	_id?: ObjectId;
	reviewId: string;
	productId: string;
	productSlug: string;
	datasetId: string;
	datasetLabel: number;
	datasetSplit: string;
	sentiment: 'positive' | 'negative';
	rating: number;
	title: string;
	content: string;
	userId: string;
	userName: string;
	userAvatar: string;
	verifiedPurchase: boolean;
	helpfulVotes: number;
	totalVotes: number;
	createdAt: Date;
	updatedAt: Date;
	language: string;
	sentences: ReviewSentence[];
}

export interface ProductDocument {
	_id?: ObjectId;
	productId: string;
	slug: string;
	name: string;
	category: string;
	image: string;
	price: number;
	averageRating: number;
	totalReviews: number;
	description?: string;
	createdAt: Date;
	updatedAt: Date;
}

// コレクション名の定数
export const Collections = {
	USERS: 'users',
	PRODUCTS: 'products',
	REVIEWS: 'reviews',
	EXPERIMENTS: 'experiments',
	EXPERIMENT_LOGS: 'experiment_logs',
	QUESTIONNAIRES: 'questionnaires',
	COMPREHENSION_TESTS: 'comprehension_tests'
} as const;


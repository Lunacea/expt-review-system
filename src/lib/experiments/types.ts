// 実験システムの型定義

export type ExperimentType = 'text-vs-selection' | 'numeric-evaluation' | 'effectiveness';
export type ExperimentVariant = 'control' | 'treatment';

export type TaskType =
	| 'helpful-votes'
	| 'sentence-annotations'
	| 'text-feedback'
	| 'numeric-rating'
	| 'questionnaire'
	| 'comprehension-test';

export interface ExperimentTask {
	id: string;
	type: TaskType;
	title: string;
	description: string;
	productSlug: string;
	order: number;
	completed: boolean;
	startedAt?: string;
	completedAt?: string;
}

export interface Experiment {
	id: string;
	type: ExperimentType;
	variant?: ExperimentVariant;
	title: string;
	description: string;
	tasks: ExperimentTask[];
	currentTaskIndex: number;
	status: 'not-started' | 'in-progress' | 'completed';
	startedAt?: string;
	completedAt?: string;
}

export interface ParticipantData {
	participantId: string;
	experiments: Experiment[];
	demographicData?: {
		age?: string;
		gender?: string;
		occupation?: string;
	};
	createdAt: string;
}

// アンケート関連
export type QuestionType = 'likert-5' | 'likert-7' | 'yes-no' | 'text' | 'multiple-choice';

export interface Question {
	id: string;
	type: QuestionType;
	text: string;
	required: boolean;
	options?: string[];
}

export interface QuestionnaireResponse {
	questionId: string;
	value: string | number;
	timestamp: string;
}

export interface Questionnaire {
	id: string;
	experimentId: string;
	title: string;
	description: string;
	questions: Question[];
	responses: QuestionnaireResponse[];
}

// 理解度テスト関連
export interface ComprehensionQuestion {
	id: string;
	question: string;
	options: string[];
	correctAnswer: number; // インデックス
}

export interface ComprehensionTest {
	id: string;
	experimentId: string;
	productSlug: string;
	questions: ComprehensionQuestion[];
	userAnswers: number[];
	score?: number;
	completedAt?: string;
}

// 実験データの記録
export interface AnnotationRecord {
	reviewId: string;
	sentenceId: string;
	annotationType: string;
	action?: 'add' | 'remove';
	timestamp: string;
}

export interface VoteRecord {
	reviewId: string;
	voteType: 'helpful' | 'not-helpful';
	action?: 'add' | 'remove';
	timestamp: string;
}

export interface FeedbackRecord {
	reviewId: string;
	content: string;
	timestamp: string;
}

export interface ExperimentLog {
	participantId: string;
	experimentId: string;
	taskId: string;
	eventType: 'task-start' | 'task-complete' | 'annotation' | 'vote' | 'feedback';
	data: AnnotationRecord | VoteRecord | FeedbackRecord | Record<string, unknown>;
	timestamp: string;
}

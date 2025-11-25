// Config for Experiment Structure based on the draft & V3 requirements
import SELECTED_REVIEWS from './assets/selected_reviews.json';

export interface Task {
	id: string;
	title: string;
    type: 'helpful_votes' | 'text_feedback' | 'sentence_annotation' | 'comprehension_test' | 'questionnaire';
    props?: any; 
}

export interface Experiment {
	id: string;
	title: string;
	description: string;
	tasks: Task[];
}

// Helper to get reviews (mocking dynamic load if needed, but using static for now)
const reviews = SELECTED_REVIEWS;

// We define ALL possible experiments. 
// The user logic will determine which ones are shown or the order.
// Requirement: "Numeric comparison" and "Text comparison" should be separate experiments.
// Requirement: "Randomize order of methods".

// Let's define the base tasks.
// Exp 1: Numeric vs Proposed
export const EXPERIMENT_1A = {
	id: 'exp1a',
	title: '実験１A：役に立った投票との比較',
	description: '複数のレビューに対して、役に立った投票および選択式評価を行っていただきます。',
	tasks: [
        {
            id: 'task-numeric',
            title: 'タスク A: 役に立った投票',
            type: 'helpful_votes',
            props: { reviews: reviews }
        },
        {
            id: 'task-proposed-1',
            title: 'タスク B: 選択式評価（提案手法）',
            type: 'sentence_annotation',
            props: { reviews: reviews }
        },
        {
            id: 'q-1a',
            title: '比較アンケート',
            type: 'questionnaire',
            props: { formId: 'q_comparison_numeric' }
        }
    ]
};

// Exp 1B: Text vs Proposed
export const EXPERIMENT_1B = {
	id: 'exp1b',
	title: '実験１B：テキスト評価との比較',
	description: '複数のレビューに対して、テキスト評価および選択式評価を行っていただきます。',
	tasks: [
        {
            id: 'task-text',
            title: 'タスク A: テキスト評価',
            type: 'text_feedback',
            props: { reviews: reviews }
        },
        {
            id: 'task-proposed-2',
            title: 'タスク B: 選択式評価（提案手法）',
            type: 'sentence_annotation',
            props: { reviews: reviews }
        },
        {
            id: 'q-1b',
            title: '比較アンケート',
            type: 'questionnaire',
            props: { formId: 'q_comparison_text' }
        }
    ]
};

export const EXPERIMENT_2 = {
    id: 'exp2',
    title: '実験２：数値的評価の質的確認',
    description: '数値的評価が自身の意見をどの程度反映できているかを確認します。',
    tasks: [
        { 
            id: 'task2-1', 
            title: '数値的評価の振り返り',
            type: 'questionnaire', 
            props: { formId: 'q2_reflection' } 
        }
    ]
};

export const EXPERIMENT_3 = {
    id: 'exp3',
    title: '実験３：レビュー閲覧と理解度',
    description: 'レビュー評価（既存 vs 提案）を閲覧し、商品理解度をテストします。',
    tasks: [
        { 
            id: 'task3-1', 
            title: 'レビュー閲覧（条件A：既存）',
            type: 'comprehension_test', 
            props: { condition: 'control', product: 'Unknown Product A' }
        },
        { 
            id: 'task3-2', 
            title: 'レビュー閲覧（条件B：提案）',
            type: 'comprehension_test', 
            props: { condition: 'proposed', product: 'Unknown Product B' }
        },
         {
            id: 'task3-3',
            title: 'UI評価アンケート',
            type: 'questionnaire',
            props: { formId: 'q3_ui' }
        }
    ]
};

export const ALL_EXPERIMENTS = [EXPERIMENT_1A, EXPERIMENT_1B, EXPERIMENT_2, EXPERIMENT_3];

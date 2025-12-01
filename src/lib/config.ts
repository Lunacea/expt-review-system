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

// Experiment 1A: Numeric (Helpful) vs Proposed
export const EXPERIMENT_1A = {
	id: 'exp1a',
	title: '実験１A：役に立った投票と提案手法',
	description: '複数のレビューに対して、役に立った投票および選択式評価（提案手法）を行い、それぞれの使用感を評価していただきます。',
	tasks: [
        {
            id: 'task-numeric',
            title: 'タスク A: 役に立った投票',
            type: 'helpful_votes',
            props: { reviews: reviews }
        },
        {
            id: 'q-numeric',
            title: 'アンケート (役に立った投票)',
            type: 'questionnaire',
            props: { formId: 'q_method_numeric', method: '役に立った投票' }
        },
        {
            id: 'task-proposed-1',
            title: 'タスク B: 選択式評価（提案手法）',
            type: 'sentence_annotation',
            props: { reviews: reviews }
        },
        // Only ask specific Proposed Method evaluation here? Or move to 1C? 
        // User said: "Proposed method survey is enough once". 
        // But we need comparison after EACH experiment.
        {
            id: 'q-comp-1a',
            title: '比較アンケート (1A)',
            type: 'questionnaire',
            props: { formId: 'q_comparison_1a' } // New comparison form for 1A
        }
    ]
};

// Experiment 1B: Text vs Proposed
export const EXPERIMENT_1B = {
	id: 'exp1b',
	title: '実験１B：テキスト評価と提案手法',
	description: '複数のレビューに対して、テキスト評価および選択式評価（提案手法）を行い、それぞれの使用感を評価していただきます。',
	tasks: [
        {
            id: 'task-text',
            title: 'タスク A: テキスト評価',
            type: 'text_feedback',
            props: { reviews: reviews }
        },
        {
            id: 'q-text',
            title: 'アンケート (テキスト評価)',
            type: 'questionnaire',
            props: { formId: 'q_method_text', method: 'テキスト評価' }
        },
        {
            id: 'task-proposed-2',
            title: 'タスク B: 選択式評価（提案手法）',
            type: 'sentence_annotation',
            props: { reviews: reviews }
        },
        {
            id: 'q-comp-1b',
            title: '比較アンケート (1B)',
            type: 'questionnaire',
            props: { formId: 'q_comparison_1b' } // New comparison form for 1B
        }
    ]
};

// Experiment 1C: Final Detailed Proposed Evaluation
// User said: "Proposed method survey is enough once". 
// Let's put the detailed "UI/UX" questions about Proposed Method here, alongside overall preference.
export const EXPERIMENT_1C = {
    id: 'exp1c',
    title: '実験１C：提案手法の評価と全体比較',
    description: '提案手法（選択式評価）の詳細な評価と、全体を通した比較評価を行ってください。',
    tasks: [
        {
            id: 'q-proposed-detail',
            title: '提案手法の詳細評価',
            type: 'questionnaire',
            props: { formId: 'q_method_proposed_detail', method: '提案手法' }
        },
        {
            id: 'q-compare-all',
            title: '全体比較アンケート',
            type: 'questionnaire',
            props: { formId: 'q_compare_all' }
        }
    ]
};

// Experiment 2: Viewing (Formerly Exp 3)
export const EXPERIMENT_2 = {
    id: 'exp2',
    title: '実験２：レビュー閲覧と理解度',
    description: 'レビュー評価（既存 vs 提案）を閲覧し、商品理解度をテストします。',
    tasks: [
        { 
            id: 'task2-1', 
            title: 'レビュー閲覧（条件A：既存）',
            type: 'comprehension_test', 
            props: { condition: 'control', product: 'Unknown Product A' }
        },
        { 
            id: 'task2-2', 
            title: 'レビュー閲覧（条件B：提案）',
            type: 'comprehension_test', 
            props: { condition: 'proposed', product: 'Unknown Product B' }
        },
         {
            id: 'task2-3',
            title: 'UI評価アンケート',
            type: 'questionnaire',
            props: { formId: 'q3_ui' }
        }
    ]
};

export const ALL_EXPERIMENTS = [EXPERIMENT_1A, EXPERIMENT_1B, EXPERIMENT_1C, EXPERIMENT_2];

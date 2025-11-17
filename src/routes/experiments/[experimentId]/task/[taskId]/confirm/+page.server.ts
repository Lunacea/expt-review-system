import type { PageServerLoad } from './$types';
import {
	textVsSelectionQuestions,
	numericEvaluationQuestions,
	effectivenessQuestions
} from '$lib/experiments/experiments';
import { getComprehensionTest } from '$lib/mock/comprehension-tests';
import type { TaskType, Question, ComprehensionQuestion } from '$lib/experiments/types';

const questionnaireMeta = {
	'text-vs-selection': {
		id: 'questionnaire-text-vs-selection',
		title: '実験1アンケート',
		description: '自由記述と選択式の体験に関する振り返りをお願いします。',
		questions: textVsSelectionQuestions
	},
	'numeric-evaluation': {
		id: 'questionnaire-numeric-evaluation',
		title: '実験2アンケート',
		description: 'Helpful投票とその理由についてお聞かせください。',
		questions: numericEvaluationQuestions
	},
	effectiveness: {
		id: 'questionnaire-effectiveness',
		title: '実験3アンケート',
		description: '選択的リアクション UI の有効性を評価してください。',
		questions: effectivenessQuestions
	}
} as const;

export const load: PageServerLoad = async ({ params, url }) => {
	const taskTypeParam = url.searchParams.get('type');
	if (!taskTypeParam) {
		return {
			taskType: null,
			questionnaire: null,
			comprehension: null
		};
	}

	const taskType = taskTypeParam as TaskType;
	const productSlug = url.searchParams.get('product') ?? undefined;

	type QuestionnairePayload = {
		id: string;
		title: string;
		description: string;
		questions: Question[];
	};

	type ComprehensionPayload = {
		id: string;
		title: string;
		description: string;
		questions: ComprehensionQuestion[];
	};

	let questionnaire: QuestionnairePayload | null = null;
	let comprehension: ComprehensionPayload | null = null;

	if (taskType === 'questionnaire') {
		const meta = questionnaireMeta[params.experimentId as keyof typeof questionnaireMeta];
		if (meta) {
			questionnaire = meta;
		}
	}

	if (taskType === 'comprehension-test' && productSlug) {
		const questions = getComprehensionTest(productSlug);
		if (questions.length > 0) {
			comprehension = {
				id: `comprehension-${productSlug}`,
				title: '理解度テスト',
				description: 'レビューを読んで得た知識を確認してください。',
				questions
			};
		}
	}

	return {
		experimentId: params.experimentId,
		taskId: params.taskId,
		taskType,
		questionnaire,
		comprehension
	};
};


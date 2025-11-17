import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getProductBySlug, getReviewsByProductId } from '$lib/server/db/reviews';
import {
	textVsSelectionQuestions,
	numericEvaluationQuestions,
	effectivenessQuestions
} from '$lib/experiments/experiments';
import { getComprehensionTest } from '$lib/mock/comprehension-tests';
import type { TaskType, Question, ComprehensionQuestion } from '$lib/experiments/types';
import type { Product, Review } from '$lib/types/reviews';
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
		throw error(400, 'タスクタイプが指定されていません');
	}

	const taskType = taskTypeParam as TaskType;
	let productSlug = url.searchParams.get('product') ?? undefined;

	let product: Product | null = null;
	let reviews: Review[] = [];

	if (productSlug) {
		const foundProduct = await getProductBySlug(productSlug);
		if (!foundProduct) {
			throw error(404, '関連する商品が見つかりません');
		}
		product = foundProduct;
		reviews = await getReviewsByProductId(foundProduct.id);
		if (reviews.length > 12) {
			reviews = reviews.slice(0, 12);
		}
	} else {
		productSlug = undefined;
	}

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
		if (!meta) {
			throw error(404, 'アンケートが見つかりません');
		}
		questionnaire = meta;
	}

	if (taskType === 'comprehension-test') {
		if (!productSlug) {
			throw error(400, '理解度テストには商品情報が必要です');
		}
		const questions = getComprehensionTest(productSlug);
		if (questions.length === 0) {
			throw error(404, '理解度テストが設定されていません');
		}
		comprehension = {
			id: `comprehension-${productSlug}`,
			title: '理解度テスト',
			description: 'レビューを読んで得た知識を確認してください。',
			questions
		};
	}

	return {
		experimentId: params.experimentId,
		taskId: params.taskId,
		taskType,
		product,
		reviews,
		questionnaire,
		comprehension
	};
};


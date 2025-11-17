import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getProductBySlug, getReviewsByProductId } from '$lib/server/db/reviews';

export const load: PageServerLoad = async ({ params }) => {
	const product = await getProductBySlug(params.slug);

	if (!product) {
		throw error(404, '商品が見つかりません');
	}

	const reviews = await getReviewsByProductId(product.id);
	const feedbacks = Object.fromEntries(reviews.map((review) => [review.id, []]));

	return {
		product,
		reviews,
		feedbacks
	};
};


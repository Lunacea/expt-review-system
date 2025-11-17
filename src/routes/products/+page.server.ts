import type { PageServerLoad } from './$types';
import { getProducts } from '$lib/server/db/reviews';

export const load: PageServerLoad = async () => {
	const products = await getProducts();

	return {
		products
	};
};


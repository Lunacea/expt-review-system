import type { WithId } from 'mongodb';
import { getDB } from './client';
import {
	Collections,
	type ProductDocument,
	type ReviewDocument,
	type ReviewSentence as ReviewSentenceDocument
} from './models';
import type { Product, Review, ReviewSentence as ReviewSentenceView } from '$lib/types/reviews';

function mapSentence(sentence: ReviewSentenceDocument): ReviewSentenceView {
	return {
		id: sentence.id,
		text: sentence.text,
		annotations: sentence.annotations.map((annotation) => ({
			type: annotation.type,
			count: annotation.count
		}))
	};
}

function mapReview(doc: WithId<ReviewDocument>): Review {
	return {
		id: doc.reviewId,
		productId: doc.productId,
		productSlug: doc.productSlug,
		datasetId: doc.datasetId,
		sentiment: doc.sentiment,
		rating: doc.rating,
		title: doc.title,
		content: doc.content,
		userId: doc.userId,
		userName: doc.userName,
		userAvatar: doc.userAvatar,
		verifiedPurchase: doc.verifiedPurchase,
		createdAt: doc.createdAt.toISOString(),
		helpfulVotes: doc.helpfulVotes,
		totalVotes: doc.totalVotes,
		language: doc.language,
		sentences: doc.sentences?.map(mapSentence)
	};
}

function mapProduct(doc: WithId<ProductDocument>): Product {
	return {
		id: doc.productId,
		slug: doc.slug,
		name: doc.name,
		category: doc.category,
		image: doc.image,
		price: doc.price,
		averageRating: doc.averageRating,
		totalReviews: doc.totalReviews,
		description: doc.description
	};
}

export async function getProducts(): Promise<Product[]> {
	const db = await getDB();
	const docs = await db
		.collection<ProductDocument>(Collections.PRODUCTS)
		.find({})
		.sort({ name: 1 })
		.toArray();
	return docs.map((doc) => mapProduct(doc as WithId<ProductDocument>));
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
	const db = await getDB();
	const doc = await db
		.collection<ProductDocument>(Collections.PRODUCTS)
		.findOne({ slug });
	return doc ? mapProduct(doc as WithId<ProductDocument>) : null;
}

export async function getProductById(productId: string): Promise<Product | null> {
	const db = await getDB();
	const doc = await db
		.collection<ProductDocument>(Collections.PRODUCTS)
		.findOne({ productId });
	return doc ? mapProduct(doc as WithId<ProductDocument>) : null;
}

export async function getReviewsByProductId(productId: string): Promise<Review[]> {
	const db = await getDB();
	const docs = await db
		.collection<ReviewDocument>(Collections.REVIEWS)
		.find({ productId })
		.sort({ createdAt: -1 })
		.toArray();
	return docs.map((doc) => mapReview(doc as WithId<ReviewDocument>));
}

export async function getReviewsByProductSlug(productSlug: string): Promise<Review[]> {
	const db = await getDB();
	const docs = await db
		.collection<ReviewDocument>(Collections.REVIEWS)
		.find({ productSlug })
		.sort({ createdAt: -1 })
		.toArray();
	return docs.map((doc) => mapReview(doc as WithId<ReviewDocument>));
}


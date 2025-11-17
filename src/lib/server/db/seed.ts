// データベースのシードデータ（初期データ投入）

import { getDB } from './client';
import { createUser } from './users';
import { Collections } from './models';

// テストユーザーのデータ
const testUsers = [
	{
		username: 'test1',
		email: 'test1@example.com',
		password: 'password123',
		displayName: 'テストユーザー1',
		role: 'participant' as const
	},
	{
		username: 'test2',
		email: 'test2@example.com',
		password: 'password123',
		displayName: 'テストユーザー2',
		role: 'participant' as const
	},
	{
		username: 'test3',
		email: 'test3@example.com',
		password: 'password123',
		displayName: 'テストユーザー3',
		role: 'participant' as const
	},
	{
		username: 'researcher',
		email: 'researcher@example.com',
		password: 'researcher123',
		displayName: '研究者',
		role: 'researcher' as const
	},
	{
		username: 'admin',
		email: 'admin@example.com',
		password: 'admin123',
		displayName: '管理者',
		role: 'admin' as const
	}
];

// データベースを初期化してシードデータを投入
export async function seedDatabase() {
	console.log('🌱 データベースのシード処理を開始します...');

	const db = await getDB();

	// 既存のユーザーを確認
	const users = db.collection(Collections.USERS);
	const existingCount = await users.countDocuments();

	if (existingCount > 0) {
		console.log(`⚠️  既に${existingCount}人のユーザーが存在します。スキップします。`);
		return;
	}

	// テストユーザーを作成
	for (const userData of testUsers) {
		try {
			const user = await createUser(
				userData.username,
				userData.email,
				userData.password,
				userData.displayName,
				userData.role
			);
			console.log(`✅ ユーザーを作成しました: ${user.username} (${user.role})`);
		} catch (error) {
			console.error(`❌ ユーザー作成エラー (${userData.username}):`, error);
		}
	}

	// インデックスを作成
	await createIndexes();

	console.log('🎉 シード処理が完了しました！');
	console.log('\n📋 テストユーザー一覧:');
	console.log('┌─────────────┬──────────────┬───────────────┐');
	console.log('│ ユーザー名  │ パスワード   │ 役割          │');
	console.log('├─────────────┼──────────────┼───────────────┤');
	testUsers.forEach((user) => {
		console.log(
			`│ ${user.username.padEnd(11)} │ ${user.password.padEnd(12)} │ ${user.role.padEnd(13)} │`
		);
	});
	console.log('└─────────────┴──────────────┴───────────────┘\n');
}

// データベースインデックスを作成
async function createIndexes() {
	console.log('📊 インデックスを作成中...');

	const db = await getDB();

	// ユーザーコレクションのインデックス
	await db.collection(Collections.USERS).createIndexes([
		{ key: { username: 1 }, unique: true },
		{ key: { email: 1 }, unique: true },
		{ key: { createdAt: -1 } }
	]);

	// 商品コレクションのインデックス
	await db.collection(Collections.PRODUCTS).createIndexes([
		{ key: { productId: 1 }, unique: true },
		{ key: { slug: 1 }, unique: true },
		{ key: { updatedAt: -1 } }
	]);

	// レビューコレクションのインデックス
	await db.collection(Collections.REVIEWS).createIndexes([
		{ key: { reviewId: 1 }, unique: true },
		{ key: { productId: 1, createdAt: -1 } },
		{ key: { productSlug: 1, createdAt: -1 } },
		{ key: { sentiment: 1 } }
	]);

	// 実験データのインデックス
	await db.collection(Collections.EXPERIMENTS).createIndexes([
		{ key: { userId: 1 } },
		{ key: { experimentId: 1 } },
		{ key: { status: 1 } },
		{ key: { createdAt: -1 } }
	]);

	// 実験ログのインデックス
	await db.collection(Collections.EXPERIMENT_LOGS).createIndexes([
		{ key: { userId: 1 } },
		{ key: { experimentId: 1 } },
		{ key: { timestamp: -1 } }
	]);

	// アンケート回答のインデックス
	await db.collection(Collections.QUESTIONNAIRES).createIndexes([
		{ key: { userId: 1 } },
		{ key: { experimentId: 1 } },
		{ key: { createdAt: -1 } }
	]);

	// 理解度テストのインデックス
	await db.collection(Collections.COMPREHENSION_TESTS).createIndexes([
		{ key: { userId: 1 } },
		{ key: { experimentId: 1 } },
		{ key: { createdAt: -1 } }
	]);

	console.log('✅ インデックスの作成が完了しました');
}

// データベースをリセット（開発用）
export async function resetDatabase() {
	console.log('⚠️  データベースをリセットします...');

	const db = await getDB();

	// すべてのコレクションを削除
	const collections = await db.listCollections().toArray();
	for (const collection of collections) {
		await db.collection(collection.name).drop();
		console.log(`🗑️  コレクション「${collection.name}」を削除しました`);
	}

	console.log('✅ データベースのリセットが完了しました');
}


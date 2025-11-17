// MongoDB接続クライアント

import { MongoClient, Db } from 'mongodb';

// SvelteKit環境では$env/static/privateから、それ以外ではprocess.envから取得
let MONGODB_URI: string;
let MONGODB_DB_NAME: string;

try {
	// SvelteKit環境で実行される場合
	const env = await import('$env/static/private');
	MONGODB_URI = env.MONGODB_URI;
	MONGODB_DB_NAME = env.MONGODB_DB_NAME;
} catch {
	// スタンドアロンスクリプトとして実行される場合
	MONGODB_URI = process.env.MONGODB_URI || '';
	MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'review-system';
}

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectDB(): Promise<Db> {
	if (db) {
		return db;
	}

	if (!MONGODB_URI) {
		throw new Error('MONGODB_URI環境変数が設定されていません');
	}

	try {
		// MongoDB接続オプションを設定（DNS解決の問題を回避）
		const clientOptions: {
			serverSelectionTimeoutMS?: number;
			connectTimeoutMS?: number;
		} = {
			serverSelectionTimeoutMS: 30000, // 30秒
			connectTimeoutMS: 30000,
		};

		// 注意: ServerApiはViteのCommonJS互換性の問題で使用しない
		// MongoDB AtlasはServerApiがなくても接続可能

		client = new MongoClient(MONGODB_URI, clientOptions);
		await client.connect();
		db = client.db(MONGODB_DB_NAME || 'review-system');

		console.log('✅ MongoDBに接続しました');
		return db;
	} catch (error) {
		console.error('❌ MongoDB接続エラー:', error);
		throw error;
	}
}

export async function getDB(): Promise<Db> {
	if (!db) {
		return await connectDB();
	}
	return db;
}

export async function closeDB(): Promise<void> {
	if (client) {
		await client.close();
		client = null;
		db = null;
		console.log('MongoDB接続を閉じました');
	}
}

// プロセス終了時にDB接続を閉じる
if (typeof process !== 'undefined') {
	process.on('SIGINT', async () => {
		await closeDB();
		process.exit(0);
	});

	process.on('SIGTERM', async () => {
		await closeDB();
		process.exit(0);
	});
}


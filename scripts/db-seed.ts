#!/usr/bin/env bun

// データベースシードスクリプト

import { config } from 'dotenv';

// .envファイルを読み込む
config();

import { connectDB, closeDB } from '../src/lib/server/db/client';
import { seedDatabase, resetDatabase } from '../src/lib/server/db/seed';

const args = process.argv.slice(2);
const shouldReset = args.includes('--reset');

async function main() {
	try {
		console.log('🚀 データベースシードスクリプトを開始します\n');

		// データベースに接続
		await connectDB();

		// リセットオプションが指定されている場合
		if (shouldReset) {
			await resetDatabase();
			console.log('');
		}

		// シードデータを投入
		await seedDatabase();

		console.log('\n✨ すべての処理が完了しました！');
	} catch (error) {
		console.error('\n❌ エラーが発生しました:', error);
		process.exit(1);
	} finally {
		await closeDB();
	}
}

main();


// サーバーサイドフック

import type { Handle } from '@sveltejs/kit';
import { getSession } from '$lib/server/auth/session';
import { connectDB } from '$lib/server/db/client';

// データベースに接続
connectDB().catch((error) => {
	console.error('❌ データベース接続エラー:', error);
});

export const handle: Handle = async ({ event, resolve }) => {
	// セッション情報を取得してlocalsに保存
	const session = getSession(event);
	event.locals.user = session;

	return resolve(event);
};


// ログアウトAPIエンドポイント

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { clearSession } from '$lib/server/auth/session';

export const POST: RequestHandler = async ({ cookies }) => {
	clearSession({ cookies } as any);
	return json({ success: true });
};


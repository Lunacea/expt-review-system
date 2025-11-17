// ログインAPIエンドポイント

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { authenticateUser } from '$lib/server/db/users';
import { setSession } from '$lib/server/auth/session';

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const { username, password } = await request.json();

		if (!username || !password) {
			return json({ message: 'ユーザー名とパスワードを入力してください' }, { status: 400 });
		}

		// ユーザー認証
		const user = await authenticateUser(username, password);

		if (!user) {
			return json({ message: 'ユーザー名またはパスワードが正しくありません' }, { status: 401 });
		}

		// セッションを設定
		setSession({ cookies } as any, user);

		return json({
			success: true,
			user: {
				id: user._id!.toString(),
				username: user.username,
				displayName: user.displayName,
				role: user.role
			}
		});
	} catch (error) {
		console.error('ログインエラー:', error);
		return json({ message: 'サーバーエラーが発生しました' }, { status: 500 });
	}
};


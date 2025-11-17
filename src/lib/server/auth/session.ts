// セッション管理

import type { RequestEvent } from '@sveltejs/kit';
import type { User } from '../db/models';
import { getUserById } from '../db/users';

const SESSION_COOKIE_NAME = 'session';

// セッションデータの型
export interface SessionData {
	userId: string;
	username: string;
	role: User['role'];
}

// セッションを作成（簡易実装）
export function createSession(user: User): string {
	const sessionData: SessionData = {
		userId: user._id!.toString(),
		username: user.username,
		role: user.role
	};

	// 本番環境では暗号化やJWTを使用すべき
	return Buffer.from(JSON.stringify(sessionData)).toString('base64');
}

// セッションからユーザーデータを取得
export function parseSession(sessionToken: string): SessionData | null {
	try {
		const decoded = Buffer.from(sessionToken, 'base64').toString('utf-8');
		return JSON.parse(decoded) as SessionData;
	} catch {
		return null;
	}
}

// クッキーからセッションを取得
export function getSession(event: RequestEvent): SessionData | null {
	const sessionToken = event.cookies.get(SESSION_COOKIE_NAME);
	if (!sessionToken) {
		return null;
	}

	return parseSession(sessionToken);
}

// セッションを設定
export function setSession(event: RequestEvent, user: User): void {
	const sessionToken = createSession(user);
	event.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		maxAge: 60 * 60 * 24 * 7 // 7日間
	});
}

// セッションをクリア
export function clearSession(event: RequestEvent): void {
	event.cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
}

// 現在のユーザーを取得
export async function getCurrentUser(event: RequestEvent): Promise<User | null> {
	const session = getSession(event);
	if (!session) {
		return null;
	}

	return await getUserById(session.userId);
}

// ログインチェック
export function requireAuth(event: RequestEvent): SessionData {
	const session = getSession(event);
	if (!session) {
		throw new Error('認証が必要です');
	}
	return session;
}

// ロールチェック
export function requireRole(event: RequestEvent, allowedRoles: User['role'][]): SessionData {
	const session = requireAuth(event);
	if (!allowedRoles.includes(session.role)) {
		throw new Error('権限がありません');
	}
	return session;
}


// ユーザー関連のデータベース操作

import { getDB } from './client';
import { Collections, type User } from './models';
import bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';

const SALT_ROUNDS = 10;

// ユーザー作成
export async function createUser(
	username: string,
	email: string,
	password: string,
	displayName: string,
	role: User['role'] = 'participant'
): Promise<User> {
	const db = await getDB();
	const users = db.collection<User>(Collections.USERS);

	// 既存ユーザーチェック
	const existing = await users.findOne({
		$or: [{ username }, { email }]
	});

	if (existing) {
		throw new Error('ユーザー名またはメールアドレスが既に使用されています');
	}

	// パスワードをハッシュ化
	const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

	const user: User = {
		username,
		email,
		password: hashedPassword,
		displayName,
		role,
		createdAt: new Date(),
		updatedAt: new Date()
	};

	const result = await users.insertOne(user);
	return { ...user, _id: result.insertedId };
}

// ユーザー認証
export async function authenticateUser(
	username: string,
	password: string
): Promise<User | null> {
	const db = await getDB();
	const users = db.collection<User>(Collections.USERS);

	const user = await users.findOne({ username });
	if (!user) {
		return null;
	}

	const isValid = await bcrypt.compare(password, user.password);
	if (!isValid) {
		return null;
	}

	// 最終ログイン時刻を更新
	await users.updateOne(
		{ _id: user._id },
		{
			$set: {
				lastLoginAt: new Date(),
				updatedAt: new Date()
			}
		}
	);

	return user;
}

// ユーザーIDで取得
export async function getUserById(userId: string | ObjectId): Promise<User | null> {
	const db = await getDB();
	const users = db.collection<User>(Collections.USERS);

	const id = typeof userId === 'string' ? new ObjectId(userId) : userId;
	return await users.findOne({ _id: id });
}

// ユーザー名で取得
export async function getUserByUsername(username: string): Promise<User | null> {
	const db = await getDB();
	const users = db.collection<User>(Collections.USERS);

	return await users.findOne({ username });
}

// すべてのユーザーを取得（管理用）
export async function getAllUsers(): Promise<User[]> {
	const db = await getDB();
	const users = db.collection<User>(Collections.USERS);

	return await users.find({}).toArray();
}

// ユーザー削除
export async function deleteUser(userId: string | ObjectId): Promise<boolean> {
	const db = await getDB();
	const users = db.collection<User>(Collections.USERS);

	const id = typeof userId === 'string' ? new ObjectId(userId) : userId;
	const result = await users.deleteOne({ _id: id });

	return result.deletedCount > 0;
}


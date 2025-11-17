# データベースセットアップガイド

## MongoDB Atlasの設定

### 1. 環境変数の設定

`.env`ファイルを作成し、MongoDB Atlasの接続情報を設定してください：

```bash
cp .env.example .env
```

`.env`ファイルを編集：

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/review-system?retryWrites=true&w=majority
MONGODB_DB_NAME=review-system
SESSION_SECRET=your-secret-key-here-change-in-production
PUBLIC_APP_URL=http://localhost:5173
NODE_ENV=development
```

### 2. MongoDB Atlasで接続文字列を取得

1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)にログイン
2. クラスタの「Connect」ボタンをクリック
3. 「Connect your application」を選択
4. Driver: Node.js, Version: 6.0 or later を選択
5. 接続文字列をコピーして`.env`の`MONGODB_URI`に設定
6. `<password>`を実際のパスワードに置き換え

## データベースの初期化

### テストユーザーの作成

以下のコマンドでテストユーザーを作成できます：

```bash
# データベースに接続してテストユーザーを作成
bun run db:seed
```

### データベースのリセット（開発用）

すべてのデータを削除して再作成する場合：

```bash
# データベースをリセットして再作成
bun run db:reset
```

### Amazonレビュー実験データの投入

Hugging Faceの[`SetFit/amazon_reviews_multi_ja`](https://huggingface.co/datasets/SetFit/amazon_reviews_multi_ja)を利用し、[note記事](https://note.com/eurekachan/n/nbde77c119945)で紹介されている手順を参考にレビューコーパスを整形するPythonスクリプトを用意しました。

1. 事前にMongoDBが起動していること、`MONGODB_URI`と`MONGODB_DB_NAME`が設定されていることを確認してください。
2. 必要に応じて`pip install pymongo`を実行します。
3. 次のコマンドで商品・レビューを投入します（ローカルMongoDBの例）：

```bash
python scripts/import_reviews.py \
  --mongodb-uri mongodb://localhost:27017 \
  --mongodb-db review-system
```

初回実行時に`data/amazon_reviews/`以下へJSONLファイルをダウンロードし、商品ごとに肯定30件/否定30件のレビューを抽出して`products`および`reviews`コレクションに保存します。既存レビューはデフォルトで置き換えられます。

## テストユーザー一覧

シード処理で以下のテストユーザーが作成されます：

| ユーザー名 | パスワード | 役割 | 説明 |
|-----------|-----------|------|------|
| test1 | password123 | participant | テスト参加者1 |
| test2 | password123 | participant | テスト参加者2 |
| test3 | password123 | participant | テスト参加者3 |
| researcher | researcher123 | researcher | 研究者アカウント |
| admin | admin123 | admin | 管理者アカウント |

## ログイン方法

1. アプリケーションを起動：

```bash
bun run dev
```

2. ブラウザで`http://localhost:5173/auth/login`にアクセス

3. テストユーザーのいずれかをクリックするか、ユーザー名とパスワードを入力してログイン

## データベース構造

### コレクション

#### users
ユーザー情報を管理

```typescript
{
  _id: ObjectId,
  username: string,
  email: string,
  password: string, // ハッシュ化
  displayName: string,
  role: 'participant' | 'researcher' | 'admin',
  createdAt: Date,
  updatedAt: Date,
  lastLoginAt: Date
}
```

#### experiments
実験データを管理

```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  experimentId: string,
  experimentType: string,
  status: 'not-started' | 'in-progress' | 'completed',
  tasks: Array,
  startedAt: Date,
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### experiment_logs
実験中のアクションログを記録

```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  experimentId: string,
  taskId: string,
  eventType: string,
  data: Object,
  timestamp: Date,
  createdAt: Date
}
```

#### questionnaires
アンケート回答を管理

```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  experimentId: string,
  questionnaireId: string,
  responses: Array,
  submittedAt: Date,
  createdAt: Date
}
```

#### comprehension_tests
理解度テスト結果を管理

```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  experimentId: string,
  productSlug: string,
  answers: Array<number>,
  score: number,
  completedAt: Date,
  createdAt: Date
}
```

## コードベースでのDB管理

### ユーザー操作

```typescript
import { createUser, authenticateUser, getUserById } from '$lib/server/db/users';

// ユーザー作成
const user = await createUser('username', 'email@example.com', 'password', 'Display Name', 'participant');

// ユーザー認証
const user = await authenticateUser('username', 'password');

// ユーザー取得
const user = await getUserById(userId);
```

### データベース接続

```typescript
import { getDB, connectDB, closeDB } from '$lib/server/db/client';

// データベース取得
const db = await getDB();

// コレクションにアクセス
const users = db.collection('users');
const result = await users.findOne({ username: 'test1' });
```

### インデックス

以下のインデックスが自動的に作成されます：

- users: username（ユニーク）, email（ユニーク）, createdAt
- experiments: userId, experimentId, status, createdAt
- experiment_logs: userId, experimentId, timestamp
- questionnaires: userId, experimentId, createdAt
- comprehension_tests: userId, experimentId, createdAt

## トラブルシューティング

### 接続エラー

```
❌ MongoDB接続エラー
```

- `.env`ファイルの`MONGODB_URI`が正しいか確認
- MongoDB Atlasでネットワークアクセスが許可されているか確認（IP制限）
- データベースユーザーのパスワードが正しいか確認

### ユーザーが作成できない

```
ユーザー名またはメールアドレスが既に使用されています
```

- データベースをリセット：`bun run db:reset`
- または、異なるユーザー名を使用

### セッションが保持されない

- ブラウザのCookieが有効になっているか確認
- `.env`の`SESSION_SECRET`が設定されているか確認

## セキュリティ注意事項

⚠️ **本番環境では以下を必ず実施してください：**

1. 強力な`SESSION_SECRET`を設定
2. テストユーザーを削除または無効化
3. パスワードポリシーを強化
4. HTTPS通信を使用
5. レート制限を実装
6. MongoDB Atlasのネットワークアクセスを制限
7. JWTなどのより安全なセッション管理を実装

現在の実装は実験・開発環境用の簡易版です。


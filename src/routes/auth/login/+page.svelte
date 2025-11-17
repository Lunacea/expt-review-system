<script lang="ts">
	import { goto } from '$app/navigation';
	import { Card, CardContent, CardHeader, CardTitle } from '$shared/components/ui/card';
	import { Button } from '$shared/components/ui/button';
	import { Badge } from '$shared/components/ui/badge';
	import { AlertCircle, LogIn } from '@lucide/svelte';

	let username = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function doLogin() {
		error = '';
		loading = true;

		try {
			const response = await fetch('/auth/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ username, password })
			});

			const data = await response.json();

			if (!response.ok) {
				error = data.message || 'ログインに失敗しました';
				return;
			}

			// ログイン成功
			goto('/experiments');
		} catch (err) {
			error = 'ネットワークエラーが発生しました';
			console.error(err);
		} finally {
			loading = false;
		}
	}

	function handleLogin(event: SubmitEvent) {
		event.preventDefault();
		doLogin();
	}

	// テストユーザーでログイン
	function loginAsTestUser(testUsername: string, testPassword: string) {
		username = testUsername;
		password = testPassword;
		doLogin();
	}

	const testUsers = [
		{ username: 'test1', password: 'password123', role: '参加者1' },
		{ username: 'test2', password: 'password123', role: '参加者2' },
		{ username: 'test3', password: 'password123', role: '参加者3' },
		{ username: 'researcher', password: 'researcher123', role: '研究者' },
		{ username: 'admin', password: 'admin123', role: '管理者' }
	];
</script>

<svelte:head>
	<title>ログイン | カスタマーレビューシステム実験</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-gray-50 p-4">
	<div class="w-full max-w-4xl space-y-6">
		<div class="text-center">
			<h1 class="text-3xl font-bold">カスタマーレビューシステム実験</h1>
			<p class="mt-2 text-gray-600">ログインして実験に参加してください</p>
		</div>

		<div class="grid gap-6 md:grid-cols-2">
			<!-- ログインフォーム -->
			<Card>
				<CardHeader>
					<CardTitle class="flex items-center gap-2">
						<LogIn size={20} />
						ログイン
					</CardTitle>
				</CardHeader>
				<CardContent class="space-y-4">
					{#if error}
						<div class="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
							<AlertCircle size={16} />
							{error}
						</div>
					{/if}

					<form onsubmit={handleLogin} class="space-y-4">
						<div>
							<label for="username" class="mb-1 block text-sm font-medium">
								ユーザー名
							</label>
							<input
								id="username"
								type="text"
								bind:value={username}
								required
								class="w-full rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="ユーザー名を入力"
							/>
						</div>

						<div>
							<label for="password" class="mb-1 block text-sm font-medium">
								パスワード
							</label>
							<input
								id="password"
								type="password"
								bind:value={password}
								required
								class="w-full rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="パスワードを入力"
							/>
						</div>

						<Button type="submit" class="w-full" disabled={loading}>
							{loading ? 'ログイン中...' : 'ログイン'}
						</Button>
					</form>
				</CardContent>
			</Card>

			<!-- テストユーザー -->
			<Card>
				<CardHeader>
					<CardTitle>テストユーザー</CardTitle>
					<p class="text-sm text-gray-600">クリックで自動ログイン</p>
				</CardHeader>
				<CardContent class="space-y-2">
					{#each testUsers as user}
						<button
							onclick={() => loginAsTestUser(user.username, user.password)}
							class="flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors hover:bg-gray-50"
							disabled={loading}
						>
							<div>
								<div class="font-medium">{user.username}</div>
								<div class="text-sm text-gray-600">{user.role}</div>
							</div>
							<Badge variant="outline">クリックでログイン</Badge>
						</button>
					{/each}

					<div class="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
						テスト環境用のユーザーです。本番環境では使用しないでください。
					</div>
				</CardContent>
			</Card>
		</div>

		<Card class="border-l-4 border-l-blue-500 bg-blue-50">
			<CardContent class="p-4">
				<h3 class="mb-2 font-semibold text-blue-900">初めての方へ</h3>
				<ul class="ml-6 list-disc space-y-1 text-sm text-blue-800">
					<li>テストユーザーをクリックすると自動的にログインできます</li>
					<li>ログイン後、実験ページから実験に参加できます</li>
					<li>実験データは匿名で記録され、研究目的のみに使用されます</li>
				</ul>
			</CardContent>
		</Card>
	</div>
</div>


<script lang="ts">
	import Header from '$shared/layout/Header.svelte';
	import Avator from '$features/users/Avator.svelte';
	import { Button } from '$shared/components/ui/button';
	import { Badge } from '$shared/components/ui/badge';
	import { setContext } from 'svelte';
	import { Home, LogIn, LogOut } from '@lucide/svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	let {
		title,
		avator = {
			src: 'https://github.com/shadcn.png',
			alt: 'Shadcn',
			width: 32,
			height: 32,
			name: 'test user'
		}
	} = $props();

	setContext('headerTitle', title);
	setContext('headerAvator', avator);

	const user = $derived($page.data.user);

	async function handleLogout() {
		await fetch('/auth/logout', { method: 'POST' });
		goto('/auth/login');
	}
</script>

<Header>
	<div class="flex items-center gap-4">
		<a
			href="/"
			class="flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-gray-100"
		>
			<Home size={18} />
			<span>ホーム</span>
		</a>

		{#if user}
			<div class="flex items-center gap-3">
				<Badge variant="outline">{user.username}</Badge>
				<Button variant="ghost" size="sm" onclick={handleLogout}>
					<LogOut size={16} class="mr-1" />
					ログアウト
				</Button>
				<Avator />
			</div>
		{:else}
			<a href="/auth/login">
				<Button variant="default" size="sm">
					<LogIn size={16} class="mr-1" />
					ログイン
				</Button>
			</a>
		{/if}
	</div>
</Header>

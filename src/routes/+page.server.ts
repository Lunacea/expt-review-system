import { fail, redirect } from '@sveltejs/kit';
import { getUser, createUser } from '$lib/server/db/users';

export const actions = {
	login: async ({ request, cookies }) => {
		const data = await request.formData();
		const username = data.get('username')?.toString();

		if (!username) {
			return fail(400, { error: 'IDを入力してください' });
		}

		let user = await getUser(username);
		if (!user) {
			user = await createUser(username);
		}

		cookies.set('session_user', username, {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			maxAge: 60 * 60 * 24 * 7 // 1 week
		});

		if (user.consent?.signed) {
			throw redirect(303, '/experiments');
		} else {
			throw redirect(303, '/consent');
		}
	}
};


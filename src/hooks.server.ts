import { getUser } from '$lib/server/db/users';
import { serializeUser } from '$lib/server/db/utils';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const username = event.cookies.get('session_user');
	if (username) {
		const user = await getUser(username);
		if (user) {
			event.locals.user = serializeUser(user);
		}
	}
	return resolve(event);
};

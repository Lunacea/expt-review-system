import { fail } from '@sveltejs/kit';
import { completeSystem } from '$lib/server/db/users';

export const actions = {
    complete: async ({ locals }) => {
        if (!locals.user) return fail(401);
        
        await completeSystem(locals.user.username);
        
        return { success: true };
    }
};


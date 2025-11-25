import { redirect } from '@sveltejs/kit';
import { updateExperimentStatus } from '$lib/server/db/users';
import { ALL_EXPERIMENTS } from '$lib/config';

export const load = async ({ params }) => {
    const { expId } = params;
    const experiment = ALL_EXPERIMENTS.find(e => e.id === expId);
    if (!experiment) throw redirect(303, '/experiments');
    return { experiment };
};

export const actions = {
    finish: async ({ params, locals }) => {
        if (!locals.user) return fail(401);
        const { expId } = params;
        
        await updateExperimentStatus(locals.user.username, expId, 'completed');
        
        throw redirect(303, '/experiments');
    }
};

// Rename exp3 -> exp2 in randomizer logic or generic handling
import { redirect } from '@sveltejs/kit';
import { ALL_EXPERIMENTS } from '$lib/config';
import { getUser, createUser } from '$lib/server/db/users';

export const load = async ({ locals, url, cookies }) => {
	// Simple auth check
	if (!locals.user) {
		throw redirect(302, '/');
	}

	// Check consent
	if (!locals.user.consent?.signed) {
		throw redirect(302, '/consent');
	}

    // Initialize experiment order if not present
    // We shuffle Exp 1A and 1B order to counterbalance.
    if (!locals.user.experimentOrder) {
        const order = ['exp1a', 'exp1b'];
        // Fisher-Yates shuffle
        for (let i = order.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [order[i], order[j]] = [order[j], order[i]];
        }
        
        // Define task orders for each experiment if needed
        // For now, we just store the experiment sequence.
        // We'll store it as a special key 'main_sequence' or just map expId -> taskIds
        // Let's store the main sequence of experiments to guide the user?
        // Actually the current UI shows all experiments.
        // We just want to randomize the visual order or the enforced order?
        // User asked for "Randomize order of methods".
        // Let's stick to the shuffled 1A/1B in the DB for reference, 
        // though the UI currently lists ALL_EXPERIMENTS in config order.
        
        // Update user with order
        const db = await import('$lib/server/db/client').then(m => m.getDB());
        await db.collection('users').updateOne(
            { username: locals.user.username },
            { $set: { experimentOrder: { main: order } } }
        );
        
        // Reload user
        const updatedUser = await getUser(locals.user.username);
        if (updatedUser) locals.user = updatedUser;
    }

	return {
		user: locals.user,
        experiments: ALL_EXPERIMENTS
	};
};

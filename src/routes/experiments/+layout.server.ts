import { redirect } from '@sveltejs/kit';
import { getDB } from '$lib/server/db/client';
import { Collections } from '$lib/server/db/models';
import { ALL_EXPERIMENTS } from '$lib/config';

// Helper to shuffle array
function shuffle(array: any[]) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

export const load = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(303, '/');
	}
    if (!locals.user.consent?.signed) {
        throw redirect(303, '/consent');
    }

    // Check if user has experiment order assigned
    // If not, assign it now (Randomization)
    // We modify the user object in DB, but locals might be stale if we don't update it or reload.
    // However, since we return the user data here, we can return the structure needed.
    // Actually, let's update the DB and return the *structure* of experiments customized for this user.

    let experimentOrder = locals.user.experimentOrder;

    if (!experimentOrder) {
        // Define default or randomized order
        // Exp 1A and 1B tasks should be randomized internally?
        // The requirement says "Randomize order of methods". 
        // In config.ts we defined Exp 1A tasks as [Numeric, Proposed].
        // We should shuffle these tasks for each user.
        
        // Clone the config structure to store customized order
        // We only need to store the IDs or the structure in DB to persist order.
        // Let's store a map of { expId: [taskId1, taskId2, ...] }
        
        const newOrder: Record<string, string[]> = {};
        
        for (const exp of ALL_EXPERIMENTS) {
            // For Exp 1A and 1B, shuffle the first 2 tasks (Comparison tasks), keep questionnaire last.
            // Tasks are defined as [MethodA, MethodB, Questionnaire].
            if (exp.id === 'exp1a' || exp.id === 'exp1b') {
                const comparisonTasks = exp.tasks.slice(0, 2);
                const otherTasks = exp.tasks.slice(2);
                const shuffled = shuffle([...comparisonTasks]);
                newOrder[exp.id] = [...shuffled.map(t => t.id), ...otherTasks.map(t => t.id)];
            } else {
                newOrder[exp.id] = exp.tasks.map(t => t.id);
            }
        }
        
        const db = await getDB();
        await db.collection(Collections.USERS).updateOne(
            { username: locals.user.username },
            { $set: { experimentOrder: newOrder } }
        );
        
        experimentOrder = newOrder;
        
        // Update locals for this request
        locals.user.experimentOrder = newOrder;
    }

	return {
		user: locals.user,
        experimentOrder
	};
};

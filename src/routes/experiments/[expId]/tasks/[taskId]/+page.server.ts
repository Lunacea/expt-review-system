import { fail } from '@sveltejs/kit';
import { updateTaskStatus } from '$lib/server/db/users';
import { ALL_EXPERIMENTS } from '$lib/config';

export const load = async ({ params, locals }) => {
    const { expId, taskId } = params;
    
    const userOrder = locals.user?.experimentOrder?.[expId];
    
    const experiment = ALL_EXPERIMENTS.find(e => e.id === expId);
    if (!experiment) throw new Error('Experiment not found');

    const taskConfig = experiment.tasks.find(t => t.id === taskId);
    if (!taskConfig) throw new Error('Task not found');

    let nextTaskConfig = null;
    if (userOrder) {
        const currentIndex = userOrder.indexOf(taskId);
        if (currentIndex !== -1 && currentIndex < userOrder.length - 1) {
            const nextId = userOrder[currentIndex + 1];
            nextTaskConfig = experiment.tasks.find(t => t.id === nextId);
        }
    } else {
        const idx = experiment.tasks.findIndex(t => t.id === taskId);
        nextTaskConfig = experiment.tasks[idx + 1];
    }

    const status = locals.user?.experimentProgress?.[expId]?.tasks?.[taskId]?.status || 'pending';
    const result = locals.user?.experimentProgress?.[expId]?.tasks?.[taskId]?.result || null;
    
    return {
        experiment,
        task: taskConfig,
        status,
        savedResult: result, // Pass saved result to client
        nextTask: nextTaskConfig
    };
};

export const actions = {
    complete: async ({ params, locals, request }) => {
        const { expId, taskId } = params;
        if (!locals.user) return fail(401);
        
        const data = await request.formData();
        const actionType = data.get('action'); // 'complete' or 'reset'

        if (actionType === 'reset') {
            console.log(`Resetting task ${taskId} for user ${locals.user.username}`);
             try {
                // Pass null resultData to clear it, and set status to 'pending' (or 'in_progress' if preferred, but 'pending' implies incomplete)
                // Actually updateTaskStatus implementation handles `resultData` update. 
                // We need to ensure we can clear it.
                // Let's assume passing specific flag or null works.
                await updateTaskStatus(locals.user.username, expId, taskId, 'pending', null); 
            } catch (e) {
                console.error('DB Reset Failed:', e);
                return fail(500, { error: 'Failed to reset progress' });
            }
             return { success: true, reset: true };
        }

        const resultRaw = data.get('result');
        let result = null;
        if (resultRaw) {
            try {
                result = JSON.parse(resultRaw.toString());
            } catch (e) {
                console.error('Failed to parse result JSON:', e);
            }
        }
        
        console.log(`Completing task ${taskId} for user ${locals.user.username} with result:`, result);
        
        try {
            await updateTaskStatus(locals.user.username, expId, taskId, 'completed', result);
        } catch (e) {
            console.error('DB Update Failed:', e);
            return fail(500, { error: 'Failed to save progress' });
        }
        
        return { success: true };
    }
};

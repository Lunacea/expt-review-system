import { addLog } from '$lib/server/db/logs';
import { json } from '@sveltejs/kit';

export const POST = async ({ request, locals }) => {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });
	
	const body = await request.json();
    
    // Support batch or single
    if (Array.isArray(body)) {
        for (const log of body) {
             await addLog({ ...log, userId: locals.user.username });
        }
    } else {
	    await addLog({ ...body, userId: locals.user.username });
    }
    
	return json({ success: true });
};


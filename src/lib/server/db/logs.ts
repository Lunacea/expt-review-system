import { getDB } from './client';
import { Collections, type Log } from './models';

export async function addLog(logData: Omit<Log, '_id' | 'timestamp'>): Promise<void> {
	const db = await getDB();
	const log: Log = {
		...logData,
		timestamp: new Date()
	};
    // Ensure database write actually happens and catch errors
    try {
	    await db.collection<Log>(Collections.LOGS).insertOne(log);
    } catch(e) {
        console.error('Failed to write log to MongoDB:', e);
    }
}

import { getDB } from './client';
import { Collections, type User } from './models';

export async function getUser(username: string): Promise<User | null> {
	const db = await getDB();
	return await db.collection<User>(Collections.USERS).findOne({ username });
}

export async function createUser(username: string): Promise<User> {
	const db = await getDB();
	const user: User = {
		username,
		experimentProgress: {},
		createdAt: new Date(),
		updatedAt: new Date()
	};
	const res = await db.collection<User>(Collections.USERS).insertOne(user);
	user._id = res.insertedId;
	return user;
}

export async function updateUserConsent(username: string, consentData: User['consent']): Promise<void> {
	const db = await getDB();
	await db.collection<User>(Collections.USERS).updateOne(
		{ username },
		{ 
			$set: { 
				consent: consentData,
				updatedAt: new Date()
			} 
		}
	);
}

export async function updateTaskStatus(
	username: string, 
	experimentId: string, 
	taskId: string, 
	status: 'completed' | 'pending', // Allow pending for reset
    resultData?: any
): Promise<void> {
	const db = await getDB();
	const updatePath = `experimentProgress.${experimentId}.tasks.${taskId}`;
	
    const updateQuery: any = {
        $set: { 
            [`${updatePath}.status`]: status,
            [`${updatePath}.completedAt`]: status === 'completed' ? new Date() : null, // Clear date on reset
            updatedAt: new Date()
        } 
    };

    if (resultData !== undefined) {
        // If resultData is explicitly passed (even null), update it
        // If null, it clears the field in the document structure effectively (or sets to null)
        updateQuery.$set[`${updatePath}.result`] = resultData;
    }

    console.log(`Updating task status for ${username}:`, JSON.stringify(updateQuery, null, 2));

	const res = await db.collection<User>(Collections.USERS).updateOne(
		{ username },
		updateQuery
	);
    
    console.log('Update result:', res);
}

export async function updateExperimentStatus(
    username: string,
    experimentId: string,
    status: 'completed'
): Promise<void> {
    const db = await getDB();
    await db.collection<User>(Collections.USERS).updateOne(
        { username },
        {
            $set: {
                [`experimentProgress.${experimentId}.status`]: status,
                updatedAt: new Date()
            }
        }
    );
}

export async function completeSystem(username: string): Promise<void> {
    const db = await getDB();
    await db.collection<User>(Collections.USERS).updateOne(
        { username },
        {
            $set: {
                completedAt: new Date(),
                updatedAt: new Date()
            }
        }
    );
}

import { ObjectId } from 'mongodb';

export function serializeUser(user: any) {
    if (!user) return null;
    const serialized = { ...user };
    if (serialized._id instanceof ObjectId) {
        serialized._id = serialized._id.toString();
    }
    // Also handle dates if needed, but SvelteKit often handles Date objects (devalue)
    // but ObjectId is the main issue.
    // If experimentProgress or others have ObjectIds, handle them too.
    return serialized;
}


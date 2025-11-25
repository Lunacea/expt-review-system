import type { User } from '$lib/server/db/models';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
            // User type in Locals might be the raw DB type or the serialized type.
            // Since we serialize in hooks, let's make sure it matches what we expect in the app.
            // The serialization converts ObjectId to string.
            // If the User interface has _id?: ObjectId, we might need a frontend version or just accept it might be string at runtime if we aren't strict.
            // For now, let's keep it as User but be aware _id is string at runtime in locals.
			user?: User; // In locals it will have string _id
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};

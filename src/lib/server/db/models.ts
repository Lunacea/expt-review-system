// Update Models with optional experimentOrder
import { ObjectId } from 'mongodb';

export interface User {
	_id?: ObjectId;
	username: string; 
	consent?: {
		name: string;
		date: Date;
		signed: boolean;
		pdfPath?: string; 
	};
    experimentOrder?: {
        [experimentId: string]: string[]; 
    };
	experimentProgress: {
		[experimentId: string]: {
			status: 'pending' | 'in_progress' | 'completed';
			tasks: {
				[taskId: string]: {
					status: 'pending' | 'completed';
					completedAt?: Date;
				};
			};
		};
	};
    completedAt?: Date; 
	createdAt: Date;
	updatedAt: Date;
}

export interface Log {
	_id?: ObjectId;
	userId: string; 
	experimentId?: string;
	taskId?: string;
	action: string; 
	data: any; 
	timestamp: Date;
}

export const Collections = {
	USERS: 'users',
	LOGS: 'logs'
} as const;

import type { ExperimentTask } from './types';

export function getTaskPath(experimentId: string, task: ExperimentTask): string {
	const params = new URLSearchParams();
	params.set('type', task.type);
	if (task.productSlug) {
		params.set('product', task.productSlug);
	}
	return `/experiments/${experimentId}/task/${task.id}?${params.toString()}`;
}





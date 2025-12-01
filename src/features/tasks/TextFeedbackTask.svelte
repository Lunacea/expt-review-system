<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import ReviewCard from '../reviews/ReviewCard.svelte';

    const dispatch = createEventDispatcher();
    
    interface Props {
        reviews?: any[];
        product?: string;
    }

    let { reviews = [], product = '' } = $props<Props>();
    let items = $state(reviews.length > 0 ? reviews : [{ id: 'mock', title: 'Review', text: 'Sample' }]);
    
    let feedbacks = $state<Record<string, string>>({});
    
    function updateFeedback(id: string, val: string) {
        feedbacks[id] = val;
        dispatch('change', { feedbacks });
    }
    
    dispatch('change', { feedbacks: {} });
</script>

<div class="space-y-10">
    {#each items as review (review.id)}
        <div class="bg-white p-6 rounded-lg shadow border border-gray-200">
            <ReviewCard {review}>
                <p class="whitespace-pre-wrap">{review.text}</p>
            </ReviewCard>
            
            <div class="mt-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">
                    このレビューへの感想・評価
                    <textarea
                        value={feedbacks[review.id] || ''}
                        oninput={(e) => updateFeedback(review.id, e.currentTarget.value)}
                        rows="3"
                        class="w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3 font-normal"
                        placeholder="コメントを入力..."
                    ></textarea>
                </label>
            </div>
        </div>
    {/each}
</div>

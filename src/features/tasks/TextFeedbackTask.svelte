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
    }

    function submit() {
        dispatch('complete', { feedbacks });
    }
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

    <div class="text-center py-8">
        <button 
            onclick={submit}
            class="w-full sm:w-auto inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
        >
            すべての評価を完了する
        </button>
    </div>
</div>

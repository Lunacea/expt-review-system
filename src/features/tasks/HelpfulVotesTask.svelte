<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import ReviewCard from '../reviews/ReviewCard.svelte';
    
    const dispatch = createEventDispatcher();
    
    interface Props {
        reviews?: any[];
        product?: string;
    }

    let { reviews = [], product = '' } = $props<Props>();
    
    // Normalized list (though reviews are now enriched)
    let items = $state(reviews.length > 0 ? reviews : [{ id: 'mock', title: 'Review', text: 'Sample', rating: 3 }]);
    
    // Store votes: { [reviewId]: 1 (helpful) | 0 (unhelpful/none) }
    let votes = $state<Record<string, number>>({});
    
    function toggleHelpful(id: string) {
        if (votes[id]) {
            delete votes[id];
        } else {
            votes[id] = 1;
        }
        votes = { ...votes };
    }
    
    function submit() {
        dispatch('complete', { votes });
    }
</script>

<div class="space-y-10">
    {#each items as review (review.id)}
        <div class="bg-white p-6 rounded-lg shadow border border-gray-200">
            <ReviewCard {review}>
                <p class="whitespace-pre-wrap">{review.text}</p>
            </ReviewCard>
            
            <!-- Task Interaction Area -->
            <div class="mt-4 pt-4 border-t border-gray-100">
                <button 
                    type="button"
                    onclick={() => toggleHelpful(review.id)}
                    class="inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
                    {votes[review.id] 
                        ? 'bg-gray-100 text-gray-900 border-gray-400 ring-2 ring-gray-400' 
                        : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'}"
                >
                    <svg class="mr-2 h-4 w-4 {votes[review.id] ? 'text-gray-900' : 'text-gray-400'}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                    </svg>
                    役に立った
                </button>
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

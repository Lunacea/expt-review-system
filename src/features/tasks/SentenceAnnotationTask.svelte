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

    // { [reviewId]: { [sentenceId]: [reactionId...] } }
    let allAnnotations = $state<Record<string, Record<number, string[]>>>({});
    
    // Active reaction menu state
    let activeReviewId = $state<string | null>(null);
    let activeSentenceId = $state<number | null>(null);

    const reactions = [
        { id: 'clear', label: 'わかりやすい', color: 'bg-blue-100 text-blue-800' },
        { id: 'empathy', label: '共感できる', color: 'bg-green-100 text-green-800' },
        { id: 'hard', label: '難解/不自然', color: 'bg-yellow-100 text-yellow-800' },
        { id: 'more', label: '詳細希望', color: 'bg-orange-100 text-orange-800' },
        { id: 'bad', label: '不適切', color: 'bg-red-100 text-red-800' },
        { id: 'interesting', label: '興味深い', color: 'bg-purple-100 text-purple-800' }
    ];

    function parseSentences(text: string) {
        if (!text) return [];
        const paragraphs = text.split('\n');
        let globalIndex = 0;
        const result = [];
        
        for (const p of paragraphs) {
            if (!p.trim()) {
                result.push({ type: 'break' });
                continue;
            }
            const sentences = p.split(/(?<=。)/);
            for (let s of sentences) {
                if (s.trim()) {
                    result.push({ type: 'sentence', id: globalIndex++, text: s });
                }
            }
             result.push({ type: 'break' });
        }
        return result;
    }

    const parsedReviews = items.map(r => ({
        ...r,
        sentences: parseSentences(r.text)
    }));

    function selectSentence(reviewId: string, sentenceId: number) {
        activeReviewId = reviewId;
        activeSentenceId = sentenceId;
    }

    function toggleReaction(reactionId: string) {
        if (activeReviewId === null || activeSentenceId === null) return;
        
        if (!allAnnotations[activeReviewId]) allAnnotations[activeReviewId] = {};
        if (!allAnnotations[activeReviewId][activeSentenceId]) allAnnotations[activeReviewId][activeSentenceId] = [];
        
        const list = allAnnotations[activeReviewId][activeSentenceId];
        const idx = list.indexOf(reactionId);
        
        if (idx >= 0) {
            list.splice(idx, 1);
        } else {
            list.push(reactionId);
        }
        
        allAnnotations = { ...allAnnotations }; // trigger reactivity
        dispatch('change', { annotations: allAnnotations });
    }
    
    dispatch('change', { annotations: {} });
</script>

<div class="space-y-10 relative pb-32">
    {#each parsedReviews as review (review.id)}
        <div class="bg-white p-6 rounded-lg shadow border border-gray-200">
            <ReviewCard {review}>
                <div class="text-base leading-loose font-sans text-gray-800">
                    {#each review.sentences as part}
                        {#if part.type === 'break'}
                            <br/>
                        {:else}
                             {@const annots = allAnnotations[review.id]?.[part.id] || []}
                             <!-- svelte-ignore a11y_click_events_have_key_events -->
                             <span
                                role="button"
                                tabindex="0"
                                onclick={(e) => { e.stopPropagation(); selectSentence(review.id, part.id); }}
                                class="cursor-pointer transition-colors px-1 rounded decoration-clone
                                {activeReviewId === review.id && activeSentenceId === part.id ? 'bg-indigo-100 ring-2 ring-indigo-400' : 'hover:bg-gray-100'}
                                {annots.length > 0 && (activeReviewId !== review.id || activeSentenceId !== part.id) ? 'bg-yellow-50 underline decoration-yellow-400 decoration-2' : ''}"
                             >
                                {part.text}
                                {#if annots.length > 0}
                                    <sup class="text-xs font-bold text-indigo-600 ml-0.5">({annots.length})</sup>
                                {/if}
                             </span>
                        {/if}
                    {/each}
                </div>
            </ReviewCard>
        </div>
    {/each}

    <!-- Floating Menu -->
    {#if activeReviewId !== null}
        <div class="fixed bottom-0 left-0 right-0 bg-white border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-4 z-50 animate-in slide-in-from-bottom duration-200">
            <div class="max-w-3xl mx-auto">
                <div class="flex justify-between items-center mb-3">
                    <span class="text-sm font-bold text-gray-700">選択中の文に対する評価:</span>
                    <button onclick={() => { activeReviewId = null; activeSentenceId = null; }} class="text-gray-500 hover:text-gray-700">閉じる</button>
                </div>
                
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                    {#each reactions as r}
                        {@const isSelected = (allAnnotations[activeReviewId]?.[activeSentenceId!] || []).includes(r.id)}
                        <button
                            onclick={() => toggleReaction(r.id)}
                            class="px-3 py-2 text-sm font-medium rounded border transition-all
                            {isSelected ? r.color + ' ring-2 ring-offset-1 ring-indigo-500' : 'bg-white text-gray-700 hover:bg-gray-50'}"
                        >
                            {r.label}
                            {#if isSelected} ✓ {/if}
                        </button>
                    {/each}
                </div>
            </div>
        </div>
    {/if}
</div>

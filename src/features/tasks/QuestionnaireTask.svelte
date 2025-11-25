<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();
    
    interface Props {
        reviews?: any[];
        product?: string;
        formId?: string;
        condition?: string;
    }
    
    // Explicitly destructure to satisfy TS and Svelte
    let { formId = '', product = '', reviews = [], condition = '' } = $props<Props>();
    
    // Mock questions based on formId
    let questions = $state([]);
    
    if (formId === 'q_comparison_numeric') {
        questions = [
            { id: 'q1', text: '数値的評価よりも、選択式評価（提案手法）の方が言いたいことを表現できましたか？', type: 'likert' },
            { id: 'q2', text: '選択式評価の操作は簡単でしたか？', type: 'likert' },
            { id: 'q3', text: 'その他、選択式評価についての感想があれば教えてください。', type: 'text' }
        ];
    } else if (formId === 'q_comparison_text') {
        questions = [
            { id: 'q1', text: 'テキスト評価よりも、選択式評価（提案手法）の方が簡単に入力できましたか？', type: 'likert' },
            { id: 'q2', text: '選択式評価は、テキスト評価と同等以上に言いたいことを表現できましたか？', type: 'likert' },
            { id: 'q3', text: '選択式評価で表現しきれなかった点はありますか？', type: 'text' }
        ];
    } else if (formId === 'q2_reflection') {
        questions = [
            { id: 'q1', text: '数値的評価（★の数）は、あなたの意見を十分に反映できていましたか？', type: 'likert' },
            { id: 'q2', text: 'もし反映できていないとしたら、どのような点が反映できていませんでしたか？', type: 'text' }
        ];
    } else if (formId === 'q3_ui') {
        questions = [
            { id: 'q1', text: '提案手法のハイライト表示は、レビューの内容理解に役立ちましたか？', type: 'likert' },
            { id: 'q2', text: '全体的な画面の見やすさはどうでしたか？', type: 'likert' }
        ];
    } else {
        questions = [{ id: 'q_generic', text: 'コメント', type: 'text' }];
    }
    
    let answers = $state<Record<string, any>>({});
    
    let isValid = $derived(
        questions.every(q => {
            if (q.type === 'likert') return answers[q.id]; 
            return true; 
        })
    );

    function submit() {
        if (isValid) {
            dispatch('complete', { answers });
        }
    }
</script>

<div class="space-y-6">
    <h3 class="text-lg font-medium border-b pb-2">アンケート回答</h3>
    
    {#each questions as q}
        <div class="space-y-2 py-2">
            <label for={q.id} class="block text-sm font-medium text-gray-700">{q.text}</label>
            {#if q.type === 'likert'}
                <div class="flex flex-wrap gap-4 mt-2">
                    {#each [1, 2, 3, 4, 5] as val}
                        <label class="flex items-center cursor-pointer">
                            <input type="radio" name={q.id} value={val} bind:group={answers[q.id]} class="mr-2 h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500">
                            <span>{val}</span>
                        </label>
                    {/each}
                    <span class="text-xs text-gray-500 self-center w-full sm:w-auto">（1: 全くそう思わない ～ 5: 強くそう思う）</span>
                </div>
            {:else}
                <textarea 
                    bind:value={answers[q.id]} 
                    rows="3"
                    class="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2"
                    placeholder="自由記述..."
                ></textarea>
            {/if}
        </div>
    {/each}
    
    <div class="pt-4">
        <button 
            onclick={submit}
            disabled={!isValid}
            class="w-full sm:w-auto inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
            アンケートを送信して完了
        </button>
    </div>
</div>

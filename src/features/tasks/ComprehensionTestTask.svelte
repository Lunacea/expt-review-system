<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();
    
    interface Props {
        reviews?: any[];
        product?: string;
        formId?: string;
        condition?: string;
    }

    let { reviews = [], product = '', condition = '' } = $props<Props>();
    
    const reviewText = "この商品は非常に軽く、持ち運びに便利です。バッテリーの持ちも良く、一日中使えます。ただし、充電時間が少し長いです。";
    
    const quiz = [
        { id: 'q1', text: 'バッテリーの持ちはどうですか？', options: ['良い', '悪い', '書かれていない'] },
        { id: 'q2', text: '充電時間はどうですか？', options: ['短い', '長い', '普通'] }
    ];
    
    let answers = $state<Record<string, string>>({});
    
    // Check if answered
    let isComplete = $derived(quiz.every(q => answers[q.id]));
    
    function submit() {
        if (isComplete) dispatch('complete', { answers });
    }
</script>

<div class="space-y-8">
    <div class="bg-white p-6 rounded shadow border">
        <h3 class="font-bold mb-4">レビュー内容を確認してください ({condition === 'control' ? '通常表示' : '提案手法表示'})</h3>
        
        {#if condition === 'control'}
            <p class="leading-relaxed text-gray-800">{reviewText}</p>
        {:else}
            <!-- Mock Visualized View -->
            <p class="leading-relaxed">
                <span class="bg-green-100 px-1 rounded">この商品は非常に軽く、持ち運びに便利です。</span>
                <span class="bg-green-100 px-1 rounded">バッテリーの持ちも良く、一日中使えます。</span>
                <span class="bg-yellow-100 px-1 rounded">ただし、充電時間が少し長いです。</span>
            </p>
            <div class="mt-2 text-xs text-gray-500">
                <span class="inline-block w-3 h-3 bg-green-100 mr-1"></span>好評
                <span class="inline-block w-3 h-3 bg-yellow-100 ml-2 mr-1"></span>不満
            </div>
        {/if}
    </div>

    <div class="border-t pt-6">
        <h3 class="font-bold mb-4">理解度確認テスト</h3>
        {#each quiz as q}
            <div class="mb-4">
                <p class="mb-2 font-medium">{q.text}</p>
                <div class="space-y-1">
                    {#each q.options as opt}
                        <label class="flex items-center">
                            <input type="radio" name={q.id} value={opt} bind:group={answers[q.id]} class="mr-2">
                            {opt}
                        </label>
                    {/each}
                </div>
            </div>
        {/each}
        
        <div class="pt-4">
             <button 
                onclick={submit}
                disabled={!isComplete}
                class="w-full sm:w-auto inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
                テストを完了する
            </button>
        </div>
    </div>
</div>

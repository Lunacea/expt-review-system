<script lang="ts">
    import { enhance } from '$app/forms';
    let { form } = $props();
    
    let isFinished = $state(false);
    
    $effect(() => {
        if (form?.success) {
            isFinished = true;
        }
    });
</script>

<div class="max-w-2xl mx-auto bg-white shadow rounded-lg p-10 mt-10 text-center">
    {#if !isFinished}
        <h2 class="text-3xl font-bold mb-6 text-gray-900">全実験完了</h2>
        <p class="mb-8 text-lg text-gray-600">
            お疲れ様でした。すべての実験タスクが完了しました。<br>
            以下のボタンを押して、システムを終了してください。
        </p>
        
        <form method="POST" action="?/complete" use:enhance>
            <button type="submit" class="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-lg font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                実験を終了する
            </button>
        </form>
    {:else}
        <h2 class="text-3xl font-bold mb-6 text-green-600">ありがとうございました</h2>
        <p class="mb-8 text-lg text-gray-600">
            ご協力ありがとうございました。<br>
            実験データは保存されました。
        </p>
        
        <a href="/experiments" class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            一覧画面へ戻る（確認用）
        </a>
    {/if}
</div>



<script lang="ts">
    import { enhance } from '$app/forms';
    let { data } = $props();
    const { experiment } = data;
</script>

<div class="max-w-md mx-auto bg-white shadow rounded-lg p-6 mt-10 text-center">
    <h2 class="text-2xl font-bold mb-4">{experiment.title} 完了</h2>
    <p class="mb-6 text-gray-600">この実験のすべてのタスクが終了しました。</p>
    
    <form method="POST" action="?/finish">
        <button type="submit" class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
            実験を完了して一覧に戻る
        </button>
    </form>
</div>


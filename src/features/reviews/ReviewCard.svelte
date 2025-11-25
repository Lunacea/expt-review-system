<script lang="ts">
    import Rating from './Rating.svelte';
    import placeholder from '$lib/assets/favicon.svg'; // Use favicon as placeholder if image fails

    let { review } = $props();
</script>

<div class="border-b border-gray-200 pb-6 mb-6">
    <!-- Product Info Header -->
    <div class="flex items-start mb-4 bg-gray-50 p-3 rounded">
        <div class="flex-shrink-0">
            <!-- Mock Image -->
            <div class="w-12 h-12 bg-white border border-gray-200 flex items-center justify-center rounded">
                <span class="text-xs text-gray-400">IMG</span>
            </div>
        </div>
        <div class="ml-3">
            <h4 class="text-sm font-bold text-gray-900 hover:text-indigo-600 hover:underline cursor-pointer">
                {review.productName}
            </h4>
            <p class="text-xs text-gray-500">価格: ¥{review.productPrice?.toLocaleString()}</p>
        </div>
    </div>

    <!-- Review Header -->
    <div class="flex items-center mb-2">
        <div class="flex-shrink-0 mr-2">
            <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <span class="text-xs text-gray-500">User</span>
            </div>
        </div>
        <span class="text-sm font-medium text-gray-900">{review.author}</span>
    </div>

    <div class="flex items-center mb-1">
        <Rating rating={review.rating || 3} />
        <span class="ml-2 text-sm font-bold text-gray-900">{review.title}</span>
    </div>
    
    <div class="text-xs text-gray-500 mb-4">
        {review.date} に日本でレビュー済み
        {#if review.verifiedPurchase}
            <span class="ml-2 text-orange-600 font-bold">| Amazonで購入</span>
        {/if}
    </div>

    <!-- Review Body (Slot or Text) -->
    <div class="text-sm text-gray-800 leading-relaxed mb-4">
        <slot />
    </div>

    <div class="text-sm text-gray-500">
        {review.helpfulCount}人のお客様がこれが役に立ったと考えています
    </div>
</div>

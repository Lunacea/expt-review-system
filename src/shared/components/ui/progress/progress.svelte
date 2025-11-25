<script lang="ts">
	import { Progress as ProgressPrimitive } from "bits-ui";
	import { cn } from "$shared/utils";
	import { type Props, progressVariants } from "./index.js";

	let {
		class: className,
		value = 0,
		max = 100,
		...restProps
	}: Props = $props();
</script>

<ProgressPrimitive.Root
	class={cn(progressVariants({ className }))}
	{value}
	{max}
	{...restProps}
>
	<div
		class="h-full w-full flex-1 bg-indigo-600 transition-all duration-500 ease-in-out"
		style={`transform: translateX(-${100 - (100 * (value ?? 0)) / (max ?? 100)}%)`}
	></div>
</ProgressPrimitive.Root>


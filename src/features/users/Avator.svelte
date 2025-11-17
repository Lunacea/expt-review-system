<script lang="ts">
	import { Avatar, AvatarImage, AvatarFallback } from '$shared/components/ui/avatar';
	import { getContext } from 'svelte';
	let avator = getContext<{
		src: string;
		alt: string;
		width: number;
		height: number;
		name: string;
	}>('headerAvator') ?? {
		src: 'https://github.com/shadcn.png',
		alt: 'Shadcn',
		width: 32,
		height: 32,
		name: 'test user'
	};
</script>

<div class="flex items-center gap-2">
	<Avatar>
		<AvatarImage src={avator.src} alt={avator.alt} width={avator.width} height={avator.height} />
		<AvatarFallback>
			{avator.alt}
		</AvatarFallback>
	</Avatar>
	<p>{avator.name}</p>
</div>

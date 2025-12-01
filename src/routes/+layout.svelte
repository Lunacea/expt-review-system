<script>
	import '../shared/styles/app.css';
	let { children } = $props();
</script>

<div class="min-h-screen bg-gray-50 text-gray-900 font-sans">
	{@render children()}
</div>



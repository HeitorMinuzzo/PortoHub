<script lang="ts">
	import type { Component, Snippet } from 'svelte';

	let { icon: Icon, title, description, children }: { icon: Component; title: string; description?: string; children?: Snippet } = $props();
</script>

<div class="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
	<div class="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-xl">
		<Icon class="size-6" />
	</div>
	<div class="space-y-1">
		<h2 class="font-semibold">{title}</h2>
		{#if description}<p class="text-muted-foreground max-w-sm text-sm">{description}</p>{/if}
	</div>
	{#if children}<div class="mt-2">{@render children()}</div>{/if}
</div>

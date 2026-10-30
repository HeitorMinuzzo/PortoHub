<script lang="ts">
	import type { Snippet } from 'svelte';

	let { title, description, actions, children }: { title: string; description?: string; actions?: Snippet; children?: Snippet } = $props();
</script>

<div class="mb-6 flex flex-wrap items-start justify-between gap-4">
	<div class="min-w-0">
		<div class="flex flex-wrap items-center gap-2.5">
			<h1 class="text-2xl font-semibold tracking-tight break-words">{title}</h1>
			{@render children?.()}
		</div>
		{#if description}<p class="text-muted-foreground mt-1 text-sm">{description}</p>{/if}
	</div>
	{#if actions}<div class="flex shrink-0 items-center gap-2">{@render actions()}</div>{/if}
</div>

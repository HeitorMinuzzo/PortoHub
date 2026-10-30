<script lang="ts">
	import { Badge } from '#lib/components/ui/badge/index.js';
	import CheckIcon from '@lucide/svelte/icons/check';

	let { closed = false }: { closed?: boolean } = $props();
</script>

{#if closed}
	<Badge variant="secondary" class="text-muted-foreground"><CheckIcon />Encerrado</Badge>
{:else}
	<Badge variant="outline" class="border-success/30 bg-success/10 text-success">
		<span class="bg-success size-1.5 rounded-full" aria-hidden="true"></span>Em aberto
	</Badge>
{/if}

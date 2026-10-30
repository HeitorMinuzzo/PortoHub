<script lang="ts">
	import { Badge } from '#lib/components/ui/badge/index.js';

	let { closed = false }: { closed?: boolean } = $props();
</script>

{#if closed}
	<Badge variant="secondary" class="text-muted-foreground rounded-none">Encerrado</Badge>
{:else}
	<Badge variant="outline" class="border-success/30 bg-success/10 text-success rounded-none">Em aberto</Badge>
{/if}

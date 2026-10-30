<script lang="ts">
	import { Badge } from '#lib/components/ui/badge/index.js';
	import FlameIcon from '@lucide/svelte/icons/flame';

	let { priority }: { priority: 'normal' | 'urgente' } = $props();
</script>

{#if priority === 'urgente'}
	<Badge variant="outline" class="border-warning/30 bg-warning/10 text-warning"><FlameIcon />Urgente</Badge>
{:else}
	<span class="text-muted-foreground text-xs">Normal</span>
{/if}

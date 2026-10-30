<script lang="ts">
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { priorityLabels, type Priority } from '#lib/domain.js';

	let { priority }: { priority: Priority } = $props();

	const cores: Partial<Record<Priority, string>> = {
		media: 'border-primary/25 bg-primary/10 text-primary',
		alta: 'border-warning/30 bg-warning/10 text-warning',
		urgente: 'border-destructive/30 bg-destructive/10 text-destructive'
	};
</script>

{#if cores[priority]}
	<Badge variant="outline" class="rounded-none {cores[priority]}">{priorityLabels[priority]}</Badge>
{:else}
	<span class="text-muted-foreground text-xs">{priorityLabels[priority]}</span>
{/if}

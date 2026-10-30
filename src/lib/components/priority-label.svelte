<script lang="ts">
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { priorityLabels, type Priority } from '#lib/domain.js';

	let { priority }: { priority: Priority } = $props();

	const cores: Record<Priority, string> = {
		normal: 'border-success/50 text-success',
		media: 'border-primary/25 bg-primary/10 text-primary',
		alta: 'border-warning/30 bg-warning/10 text-warning',
		urgente: 'border-destructive/30 bg-destructive/10 text-destructive'
	};
</script>

<Badge variant="outline" class="rounded-none {cores[priority]}">{priorityLabels[priority]}</Badge>

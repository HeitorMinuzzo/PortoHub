<script lang="ts">
	import { Ship, Plane, Truck } from '@lucide/svelte';
	import type { Mode } from '#lib/domain.js';
	let { mode, size = 16 }: { mode: Mode; size?: number } = $props();
</script>
{#if mode === 'maritimo'}<Ship {size} strokeWidth={1.7} aria-hidden="true"/>{:else if mode === 'aereo'}<Plane {size} strokeWidth={1.7} aria-hidden="true"/>{:else}<Truck {size} strokeWidth={1.7} aria-hidden="true"/>{/if}

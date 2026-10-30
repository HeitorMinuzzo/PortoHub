<script lang="ts">
	import ShipIcon from '@lucide/svelte/icons/ship';
	import PlaneIcon from '@lucide/svelte/icons/plane';
	import TruckIcon from '@lucide/svelte/icons/truck';
	import type { Mode } from '#lib/domain.js';

	let { mode, class: className = 'size-4' }: { mode: Mode; class?: string } = $props();
</script>

{#if mode === 'maritimo'}<ShipIcon class={className} aria-hidden="true" />{:else if mode === 'aereo'}<PlaneIcon class={className} aria-hidden="true" />{:else}<TruckIcon class={className} aria-hidden="true" />{/if}

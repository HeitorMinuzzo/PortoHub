<script lang="ts">
	import { Check, Circle } from '@lucide/svelte';
	let { closed = false }: { closed?: boolean } = $props();
</script>
<span class:state-closed={closed} class="process-state">{#if closed}<Check size={12} strokeWidth={2} aria-hidden="true"/>Encerrado{:else}<Circle size={8} fill="currentColor" aria-hidden="true"/>Em aberto{/if}</span>

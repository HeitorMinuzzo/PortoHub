<script lang="ts">
	import { page } from '$app/state';
	import { afterNavigate, replaceState } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import PageHeader from '#lib/components/page-header.svelte';
	import ProcessForm from '#lib/components/process-form.svelte';
	import ProcessState from '#lib/components/process-state.svelte';
	import CloseProcess from '#lib/components/close-process.svelte';
	import LockIcon from '@lucide/svelte/icons/lock';
	import { formatDate } from '#lib/domain.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	// Depois de salvar o servidor redireciona com ?saved=1: avisa e limpa o endereço
	afterNavigate(({ to }) => {
		if (!to?.url.searchParams.has('saved')) return;
		toast.success('Processo salvo');
		const url = new URL(to.url.href);
		url.searchParams.delete('saved');
		replaceState(url, page.state);
	});
</script>

<svelte:head><title>{data.process.number} · PortoHub</title></svelte:head>

<PageHeader title={data.process.number} description={data.process.clientName}>
	<ProcessState closed={Boolean(data.process.closedAt)} />
	{#snippet actions()}
		{#if !data.process.closedAt}<CloseProcess id={data.process.id} number={data.process.number} />{/if}
	{/snippet}
</PageHeader>

{#if data.process.closedAt}
	<div class="bg-muted/50 text-muted-foreground mb-6 flex items-start gap-2.5 rounded-lg border px-4 py-3 text-sm">
		<LockIcon class="mt-0.5 size-4 shrink-0" />
		<span>Processo encerrado em {formatDate(data.process.closedAt)}. Os dados estão disponíveis apenas para consulta.</span>
	</div>
{/if}

{#key data.process.id}
	<ProcessForm clients={data.clients} initial={data.process} feedback={form} action="?/save" closed={Boolean(data.process.closedAt)} />
{/key}

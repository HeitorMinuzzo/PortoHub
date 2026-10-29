<script lang="ts">
	import { ArrowLeft, Check, CheckCheck } from '@lucide/svelte';
	import ProcessForm from '#lib/components/process-form.svelte';
	import ProcessState from '#lib/components/process-state.svelte';
	import CloseProcess from '#lib/components/close-process.svelte';
	import { formatDate } from '#lib/domain.js';
	import type { PageProps } from './$types';
	let { data, form }: PageProps = $props();
</script>
<svelte:head><title>{data.process.number} · PortoHub</title></svelte:head>
<a href="/" class="back-link"><ArrowLeft size={15} aria-hidden="true"/>Processos</a>
<div class="page-heading form-page-heading"><div><div class="detail-title-line"><h1>{data.process.number}</h1><ProcessState closed={Boolean(data.process.closedAt)}/></div><p class="page-description">{data.process.clientName}</p></div>{#if !data.process.closedAt}<CloseProcess id={data.process.id} number={data.process.number}/>{/if}</div>
{#if data.process.closedAt}<div class="closed-message"><CheckCheck size={17} aria-hidden="true"/>Processo encerrado em {formatDate(data.process.closedAt)}. Os dados estão disponíveis para consulta.</div>{:else if data.saved}<div class="success-message" role="status"><Check size={16} aria-hidden="true"/>Processo salvo.</div>{/if}
{#key data.process.id}<ProcessForm clients={data.clients} initial={data.process} feedback={form} action="?/save" closed={Boolean(data.process.closedAt)}/>{/key}

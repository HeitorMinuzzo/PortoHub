<script lang="ts">
	import { enhance } from '$app/forms';
	import { tick, untrack } from 'svelte';
	import { ArrowRight, LoaderCircle, Ship, Plane, Truck, ArrowDownLeft, ArrowUpRight, Check } from '@lucide/svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Label } from '#lib/components/ui/label/index.js';
	import { emptyProcess, type Client, type ProcessInput } from '#lib/domain.js';
	type Feedback = { error?: string; field?: string; values?: Record<string, unknown> } | null | undefined;
	let { clients, initial = emptyProcess(), feedback, action = '', closed = false, create = false }: { clients: Client[]; initial?: ProcessInput; feedback?: Feedback; action?: string; closed?: boolean; create?: boolean } = $props();
	let busy = $state(false);
	let selectedClient = $state(untrack(() => initial.clientId ? String(initial.clientId) : ''));
	const values = $derived({ ...initial, ...feedback?.values } as ProcessInput);
	const invalid = (field: string) => feedback?.field === field || undefined;
</script>
<form method="POST" {action} id="process-form" class="process-form" class:read-only={closed} use:enhance={() => { busy = true; return async ({ result, update }) => { await update({ reset: false }); busy = false; if (result.type === 'failure') { await tick(); document.getElementById(String(result.data?.field))?.focus(); } }; }}>
	{#if feedback?.error}<div class="form-error process-form-error" role="alert" id="process-error">{feedback.error}</div>{/if}
	<fieldset disabled={closed || busy}>
		<section class="form-section"><div class="section-heading"><span class="section-index">01</span><div><h2>Identificação</h2><p>O ponto de partida da operação.</p></div></div>
			<div class="form-grid">
				<div class="field span-2"><Label for="clientId">Cliente <span class="required-mark">*</span></Label><select id="clientId" name="clientId" bind:value={selectedClient} required aria-invalid={invalid('clientId')} aria-describedby={invalid('clientId') ? 'process-error' : undefined}><option value="" disabled>Selecione um cliente</option>{#each clients as client}<option value={String(client.id)}>{client.name}</option>{/each}</select></div>
				<div class="field"><Label for="number">Número do processo <span class="required-mark">*</span></Label><Input id="number" name="number" value={values.number} required maxlength={60} placeholder="Ex.: IMP-2026/001" aria-invalid={invalid('number')}/></div>
				<div class="field"><Label for="openedAt">Data de abertura <span class="required-mark">*</span></Label><Input id="openedAt" name="openedAt" type="date" value={values.openedAt} required aria-invalid={invalid('openedAt')}/></div>
				<div class="field span-2"><Label for="reference">Referência do cliente</Label><Input id="reference" name="reference" value={values.reference} maxlength={200} placeholder="Referência informada pelo cliente" aria-invalid={invalid('reference')}/></div>
			</div>
		</section>
		<section class="form-section"><div class="section-heading"><span class="section-index">02</span><div><h2>Operação</h2><p>Como essa carga vai chegar lá.</p></div></div>
			<div class="operation-grid">
				<fieldset class="choice-field"><legend>Tipo de operação</legend><div class="segmented-control"><label><input type="radio" name="operation" value="importacao" checked={values.operation === 'importacao'}/><span><ArrowDownLeft size={15} aria-hidden="true"/>Importação</span></label><label><input type="radio" name="operation" value="exportacao" checked={values.operation === 'exportacao'}/><span><ArrowUpRight size={15} aria-hidden="true"/>Exportação</span></label></div></fieldset>
				<fieldset class="choice-field"><legend>Modal de transporte</legend><div class="segmented-control"><label><input type="radio" name="mode" value="maritimo" checked={values.mode === 'maritimo'}/><span><Ship size={15} aria-hidden="true"/>Marítimo</span></label><label><input type="radio" name="mode" value="aereo" checked={values.mode === 'aereo'}/><span><Plane size={15} aria-hidden="true"/>Aéreo</span></label><label><input type="radio" name="mode" value="rodoviario" checked={values.mode === 'rodoviario'}/><span><Truck size={15} aria-hidden="true"/>Rodoviário</span></label></div></fieldset>
				<fieldset class="choice-field priority-choice"><legend>Prioridade</legend><div class="segmented-control"><label><input type="radio" name="priority" value="normal" checked={values.priority === 'normal'}/><span><span class="choice-dot"></span>Normal</span></label><label><input type="radio" name="priority" value="urgente" checked={values.priority === 'urgente'}/><span><span class="choice-dot urgent-dot"></span>Urgente</span></label></div></fieldset>
			</div>
		</section>
		<section class="form-section"><div class="section-heading"><span class="section-index">03</span><div><h2>Envolvidos</h2><p>Quem faz parte deste processo.</p></div></div>
			<div class="form-grid">
				{#each [{ key: 'exporter', label: 'Exportador', placeholder: 'Nome do exportador' }, { key: 'agent', label: 'Agente de carga', placeholder: 'Nome do agente' }, { key: 'agentReference', label: 'Processo do agente de carga', placeholder: 'Número do processo do agente' }, { key: 'carrier', label: 'Armador', placeholder: 'Nome do armador' }] as field}
					<div class="field"><Label for={field.key}>{field.label}</Label><Input id={field.key} name={field.key} value={values[field.key as keyof ProcessInput]} maxlength={200} placeholder={field.placeholder} aria-invalid={invalid(field.key)}/></div>
				{/each}
			</div>
		</section>
		<section class="form-section"><div class="section-heading"><span class="section-index">04</span><div><h2>Transporte e datas</h2><p>De onde sai. Onde chega. Quando.</p></div></div>
			<div class="form-grid">
				<div class="field span-2"><Label for="vessel">Nome do navio</Label><Input id="vessel" name="vessel" value={values.vessel} maxlength={200} placeholder="Nome da embarcação" aria-invalid={invalid('vessel')}/></div>
				<div class="route-fields span-2"><div class="field"><Label for="origin">Local de embarque</Label><Input id="origin" name="origin" value={values.origin} maxlength={200} placeholder="Cidade, porto ou aeroporto" aria-invalid={invalid('origin')}/></div><ArrowRight size={16} aria-hidden="true"/><div class="field"><Label for="destination">Local de destino</Label><Input id="destination" name="destination" value={values.destination} maxlength={200} placeholder="Cidade, porto ou aeroporto" aria-invalid={invalid('destination')}/></div></div>
				<div class="field"><Label for="departureDate">Data de embarque</Label><Input id="departureDate" name="departureDate" type="date" value={values.departureDate} aria-invalid={invalid('departureDate')}/></div>
				<div class="field"><Label for="arrivalDate">Data de chegada</Label><Input id="arrivalDate" name="arrivalDate" type="date" value={values.arrivalDate} aria-invalid={invalid('arrivalDate')} aria-describedby={invalid('arrivalDate') ? 'process-error' : undefined}/></div>
			</div>
		</section>
	</fieldset>
	{#if !closed}<div class="form-actions"><span class="required-note"><span class="required-mark">*</span> Campos obrigatórios</span><div><Button href="/" variant="outline" disabled={busy}>Cancelar</Button><Button type="submit" disabled={busy}>{#if busy}<LoaderCircle size={16} class="spin" aria-hidden="true"/>{:else}<Check size={16} aria-hidden="true"/>{/if}{busy ? 'Salvando…' : create ? 'Criar processo' : 'Salvar alterações'}</Button></div></div>{/if}
</form>

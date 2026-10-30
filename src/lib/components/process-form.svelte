<script lang="ts">
	import { enhance } from '$app/forms';
	import { tick, untrack, type Component, type Snippet } from 'svelte';
	import * as Card from '#lib/components/ui/card/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Label } from '#lib/components/ui/label/index.js';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import ArrowDownLeftIcon from '@lucide/svelte/icons/arrow-down-left';
	import ArrowUpRightIcon from '@lucide/svelte/icons/arrow-up-right';
	import ShipIcon from '@lucide/svelte/icons/ship';
	import PlaneIcon from '@lucide/svelte/icons/plane';
	import TruckIcon from '@lucide/svelte/icons/truck';
	import CircleIcon from '@lucide/svelte/icons/circle';
	import FlameIcon from '@lucide/svelte/icons/flame';
	import CheckIcon from '@lucide/svelte/icons/check';
	import LoaderIcon from '@lucide/svelte/icons/loader-circle';
	import { emptyProcess, type Client, type ProcessInput } from '#lib/domain.js';

	type Feedback = { error?: string; field?: string; values?: Record<string, unknown> } | null | undefined;
	type Opcao = { value: string; label: string; icon: Component };

	let {
		clients,
		initial = emptyProcess(),
		feedback,
		action = '',
		closed = false,
		create = false
	}: { clients: Client[]; initial?: ProcessInput; feedback?: Feedback; action?: string; closed?: boolean; create?: boolean } = $props();

	let busy = $state(false);
	let selectedClient = $state(untrack(() => (initial.clientId ? String(initial.clientId) : '')));
	const values = $derived({ ...initial, ...feedback?.values } as ProcessInput);
	const invalid = (field: string) => feedback?.field === field || undefined;

	const envolvidos = [
		{ key: 'exporter', label: 'Exportador', placeholder: 'Nome do exportador' },
		{ key: 'agent', label: 'Agente de carga', placeholder: 'Nome do agente' },
		{ key: 'agentReference', label: 'Processo do agente de carga', placeholder: 'Número do processo do agente' },
		{ key: 'carrier', label: 'Armador', placeholder: 'Nome do armador' }
	] as const;
</script>

{#snippet escolha(name: keyof ProcessInput, legenda: string, opcoes: Opcao[])}
	<fieldset class="grid gap-2">
		<legend class="mb-2 text-sm font-medium">{legenda}</legend>
		<div class="bg-muted inline-flex w-full flex-wrap gap-1 rounded-lg p-1 sm:w-auto">
			{#each opcoes as opcao (opcao.value)}
				<label class="relative flex-1 sm:flex-none">
					<input type="radio" {name} value={opcao.value} checked={values[name] === opcao.value} class="peer sr-only" />
					<span
						class="text-muted-foreground hover:text-foreground peer-checked:bg-background peer-checked:text-foreground dark:peer-checked:bg-input/40 peer-focus-visible:ring-ring/50 flex h-8 items-center justify-center gap-1.5 rounded-md px-3 text-sm font-medium whitespace-nowrap transition-colors peer-checked:shadow-sm peer-focus-visible:ring-3 peer-disabled:cursor-default {closed ? '' : 'cursor-pointer'}"
					>
						<opcao.icon class="size-4" />{opcao.label}
					</span>
				</label>
			{/each}
		</div>
	</fieldset>
{/snippet}

{#snippet secao(titulo: string, descricao: string, conteudo: Snippet)}
	<Card.Root>
		<Card.Header class="border-b">
			<Card.Title>{titulo}</Card.Title>
			<Card.Description>{descricao}</Card.Description>
		</Card.Header>
		<Card.Content>{@render conteudo()}</Card.Content>
	</Card.Root>
{/snippet}

<form
	method="POST"
	{action}
	id="process-form"
	class="grid gap-6"
	use:enhance={() => {
		busy = true;
		return async ({ result, update }) => {
			await update({ reset: false });
			busy = false;
			if (result.type === 'failure') {
				await tick();
				document.getElementById(String(result.data?.field))?.focus();
			}
		};
	}}
>
	{#if feedback?.error}
		<div class="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-4 py-3 text-sm" role="alert" id="process-error">{feedback.error}</div>
	{/if}

	<fieldset disabled={closed || busy} class="grid min-w-0 gap-6">
		{#snippet identificacao()}
			<div class="grid gap-4 sm:grid-cols-2">
				<div class="grid gap-2 sm:col-span-2">
					<Label for="clientId">Cliente</Label>
					<select
						id="clientId"
						name="clientId"
						class="native-select"
						bind:value={selectedClient}
						required
						aria-invalid={invalid('clientId')}
						aria-describedby={invalid('clientId') ? 'process-error' : undefined}
					>
						<option value="" disabled>Selecione um cliente</option>
						{#each clients as client (client.id)}<option value={String(client.id)}>{client.name}</option>{/each}
					</select>
				</div>
				<div class="grid gap-2">
					<Label for="number">Número do processo</Label>
					<Input id="number" name="number" value={values.number} required maxlength={60} placeholder="Ex.: IMP-2026/001" aria-invalid={invalid('number')} />
				</div>
				<div class="grid gap-2">
					<Label for="openedAt">Data de abertura</Label>
					<Input id="openedAt" name="openedAt" type="date" value={values.openedAt} required aria-invalid={invalid('openedAt')} />
				</div>
				<div class="grid gap-2 sm:col-span-2">
					<Label for="reference">Referência do cliente <span class="text-muted-foreground font-normal">(opcional)</span></Label>
					<Input id="reference" name="reference" value={values.reference} maxlength={200} placeholder="Referência informada pelo cliente" aria-invalid={invalid('reference')} />
				</div>
			</div>
		{/snippet}
		{@render secao('Identificação', 'Cliente, número e abertura do processo.', identificacao)}

		{#snippet operacao()}
			<div class="flex flex-wrap gap-x-8 gap-y-5">
				{@render escolha('operation', 'Tipo de operação', [
					{ value: 'importacao', label: 'Importação', icon: ArrowDownLeftIcon },
					{ value: 'exportacao', label: 'Exportação', icon: ArrowUpRightIcon }
				])}
				{@render escolha('mode', 'Modal de transporte', [
					{ value: 'maritimo', label: 'Marítimo', icon: ShipIcon },
					{ value: 'aereo', label: 'Aéreo', icon: PlaneIcon },
					{ value: 'rodoviario', label: 'Rodoviário', icon: TruckIcon }
				])}
				{@render escolha('priority', 'Prioridade', [
					{ value: 'normal', label: 'Normal', icon: CircleIcon },
					{ value: 'urgente', label: 'Urgente', icon: FlameIcon }
				])}
			</div>
		{/snippet}
		{@render secao('Operação', 'Tipo, modal e prioridade da carga.', operacao)}

		{#snippet partes()}
			<div class="grid gap-4 sm:grid-cols-2">
				{#each envolvidos as field (field.key)}
					<div class="grid gap-2">
						<Label for={field.key}>{field.label}</Label>
						<Input id={field.key} name={field.key} value={values[field.key]} maxlength={200} placeholder={field.placeholder} aria-invalid={invalid(field.key)} />
					</div>
				{/each}
			</div>
		{/snippet}
		{@render secao('Envolvidos', 'Empresas e agentes que participam do processo.', partes)}

		{#snippet transporte()}
			<div class="grid gap-4 sm:grid-cols-2">
				<div class="grid gap-2 sm:col-span-2">
					<Label for="vessel">Nome do navio</Label>
					<Input id="vessel" name="vessel" value={values.vessel} maxlength={200} placeholder="Nome da embarcação" aria-invalid={invalid('vessel')} />
				</div>
				<div class="grid items-end gap-4 sm:col-span-2 sm:grid-cols-[1fr_auto_1fr]">
					<div class="grid gap-2">
						<Label for="origin">Local de embarque</Label>
						<Input id="origin" name="origin" value={values.origin} maxlength={200} placeholder="Cidade, porto ou aeroporto" aria-invalid={invalid('origin')} />
					</div>
					<ArrowRightIcon class="text-muted-foreground mb-2.5 hidden size-4 sm:block" aria-hidden="true" />
					<div class="grid gap-2">
						<Label for="destination">Local de destino</Label>
						<Input id="destination" name="destination" value={values.destination} maxlength={200} placeholder="Cidade, porto ou aeroporto" aria-invalid={invalid('destination')} />
					</div>
				</div>
				<div class="grid gap-2">
					<Label for="departureDate">Data de embarque</Label>
					<Input id="departureDate" name="departureDate" type="date" value={values.departureDate} aria-invalid={invalid('departureDate')} />
				</div>
				<div class="grid gap-2">
					<Label for="arrivalDate">Data de chegada</Label>
					<Input
						id="arrivalDate"
						name="arrivalDate"
						type="date"
						value={values.arrivalDate}
						aria-invalid={invalid('arrivalDate')}
						aria-describedby={invalid('arrivalDate') ? 'process-error' : undefined}
					/>
				</div>
			</div>
		{/snippet}
		{@render secao('Transporte e datas', 'De onde sai, para onde vai e quando.', transporte)}
	</fieldset>

	{#if !closed}
		<div class="bg-background/80 sticky bottom-0 -mx-4 flex flex-wrap items-center justify-end gap-2 border-t px-4 py-3 backdrop-blur md:-mx-6 md:px-6 lg:-mx-8 lg:px-8">
			<Button href="/" variant="outline" disabled={busy}>Cancelar</Button>
			<Button type="submit" disabled={busy}>
				{#if busy}<LoaderIcon class="animate-spin" />{:else}<CheckIcon />{/if}
				{busy ? 'Salvando…' : create ? 'Criar processo' : 'Salvar alterações'}
			</Button>
		</div>
	{/if}
</form>

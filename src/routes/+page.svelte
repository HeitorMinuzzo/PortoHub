<script lang="ts">
	import { goto } from '$app/navigation';
	import * as Table from '#lib/components/ui/table/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Label } from '#lib/components/ui/label/index.js';
	import PageHeader from '#lib/components/page-header.svelte';
	import EmptyState from '#lib/components/empty-state.svelte';
	import ProcessState from '#lib/components/process-state.svelte';
	import PriorityLabel from '#lib/components/priority-label.svelte';
	import ModeIcon from '#lib/components/mode-icon.svelte';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import ArrowDownLeftIcon from '@lucide/svelte/icons/arrow-down-left';
	import ArrowUpRightIcon from '@lucide/svelte/icons/arrow-up-right';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import FolderOpenIcon from '@lucide/svelte/icons/folder-open';
	import FilterIcon from '@lucide/svelte/icons/filter';
	import XIcon from '@lucide/svelte/icons/x';
	import { formatDate, operationLabels, modeLabels } from '#lib/domain.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const abas = $derived([
		{ key: 'all', label: 'Todos', count: data.counts.total },
		{ key: 'open', label: 'Em aberto', count: data.counts.open },
		{ key: 'closed', label: 'Encerrados', count: data.counts.closed }
	]);
	const filtrando = $derived(Boolean(data.filters.month || data.filters.arrival));

	function statusUrl(status: string) {
		const query = new URLSearchParams();
		if (status !== 'all') query.set('status', status);
		if (data.filters.month) query.set('month', data.filters.month);
		if (data.filters.arrival) query.set('arrival', data.filters.arrival);
		const qs = query.toString();
		return qs ? `/?${qs}` : '/';
	}
</script>

<svelte:head><title>Processos · PortoHub</title></svelte:head>

<PageHeader title="Processos" description="Consulte e acompanhe suas operações de importação e exportação.">
	{#snippet actions()}
		<Button href="/processos/novo"><PlusIcon />Novo processo</Button>
	{/snippet}
</PageHeader>

<div class="mb-4 flex flex-wrap items-end justify-between gap-3">
	<nav class="bg-muted text-muted-foreground inline-flex h-9 items-center rounded-lg p-[3px]" aria-label="Situação dos processos">
		{#each abas as aba (aba.key)}
			{@const atual = data.filters.status === aba.key}
			<a
				href={statusUrl(aba.key)}
				aria-current={atual ? 'page' : undefined}
				class="inline-flex h-full items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors {atual
					? 'bg-background text-foreground dark:bg-input/30 shadow-sm'
					: 'hover:text-foreground'}"
			>
				{aba.label}
				<span class="text-muted-foreground text-xs tabular-nums">{aba.count}</span>
			</a>
		{/each}
	</nav>

	<form method="GET" class="flex flex-wrap items-end gap-2">
		<input type="hidden" name="status" value={data.filters.status} />
		<div class="grid gap-1.5">
			<Label for="month" class="text-muted-foreground text-xs">Mês de abertura</Label>
			<Input id="month" type="month" name="month" value={data.filters.month} class="w-40" />
		</div>
		<div class="grid gap-1.5">
			<Label for="arrival" class="text-muted-foreground text-xs">Data de chegada</Label>
			<Input id="arrival" type="date" name="arrival" value={data.filters.arrival} class="w-40" />
		</div>
		<Button type="submit" variant="outline"><FilterIcon />Filtrar</Button>
		{#if filtrando}
			<Button variant="ghost" href={data.filters.status === 'all' ? '/' : `/?status=${data.filters.status}`}><XIcon />Limpar</Button>
		{/if}
	</form>
</div>

<section class="overflow-hidden rounded-xl border" aria-label="Lista de processos">
	{#if data.processes.length}
		<!-- Telas largas: tabela -->
		<div class="hidden lg:block">
			<Table.Root>
				<Table.Header class="bg-muted/50">
					<Table.Row class="hover:bg-transparent">
						<Table.Head class="pl-4">Processo</Table.Head>
						<Table.Head>Operação</Table.Head>
						<Table.Head class="hidden xl:table-cell">Trajeto</Table.Head>
						<Table.Head>Chegada</Table.Head>
						<Table.Head>Prioridade</Table.Head>
						<Table.Head>Situação</Table.Head>
						<Table.Head class="w-10"><span class="sr-only">Abrir</span></Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.processes as process (process.id)}
						<Table.Row class="cursor-pointer" onclick={() => goto(`/processos/${process.id}`)}>
							<Table.Cell class="max-w-64 py-3 pl-4">
								<a href={`/processos/${process.id}`} class="font-medium hover:underline hover:underline-offset-4" onclick={(e) => e.stopPropagation()}>{process.number}</a>
								<div class="text-muted-foreground truncate text-xs">{process.clientName}</div>
							</Table.Cell>
							<Table.Cell>
								<div class="flex items-center gap-1.5">
									{#if process.operation === 'importacao'}<ArrowDownLeftIcon class="text-muted-foreground size-3.5" />{:else}<ArrowUpRightIcon class="text-muted-foreground size-3.5" />{/if}
									{operationLabels[process.operation]}
								</div>
								<div class="text-muted-foreground flex items-center gap-1.5 text-xs">
									<ModeIcon mode={process.mode} class="size-3.5" />{modeLabels[process.mode]}
								</div>
							</Table.Cell>
							<Table.Cell class="hidden max-w-72 xl:table-cell">
								<div class="flex min-w-0 items-center gap-1.5">
									<span class="truncate">{process.origin || 'A definir'}</span>
									<ArrowRightIcon class="text-muted-foreground size-3.5 shrink-0" />
									<span class="truncate">{process.destination || 'A definir'}</span>
								</div>
							</Table.Cell>
							<Table.Cell class="tabular-nums">
								{formatDate(process.arrivalDate)}
								{#if process.departureDate}<div class="text-muted-foreground text-xs">Embarque {formatDate(process.departureDate).slice(0, 5)}</div>{/if}
							</Table.Cell>
							<Table.Cell><PriorityLabel priority={process.priority} /></Table.Cell>
							<Table.Cell><ProcessState closed={Boolean(process.closedAt)} /></Table.Cell>
							<Table.Cell class="pr-3">
								<ChevronRightIcon class="text-muted-foreground size-4" aria-hidden="true" />
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>

		<!-- Telas estreitas: lista -->
		<ul class="divide-y lg:hidden">
			{#each data.processes as process (process.id)}
				<li>
					<a href={`/processos/${process.id}`} class="hover:bg-muted/50 flex flex-col gap-2 p-4 transition-colors">
						<div class="flex items-center justify-between gap-3">
							<span class="font-medium">{process.number}</span>
							<ProcessState closed={Boolean(process.closedAt)} />
						</div>
						<span class="text-muted-foreground text-sm">{process.clientName}</span>
						<div class="flex flex-wrap items-center gap-1.5 text-sm">
							<ModeIcon mode={process.mode} class="text-muted-foreground size-3.5" />
							<span>{process.origin || 'A definir'}</span>
							<ArrowRightIcon class="text-muted-foreground size-3.5" />
							<span>{process.destination || 'A definir'}</span>
						</div>
						<div class="flex items-center gap-3 text-xs">
							<span class="text-muted-foreground flex items-center gap-1.5 tabular-nums"><CalendarIcon class="size-3.5" />{formatDate(process.arrivalDate)}</span>
							<PriorityLabel priority={process.priority} />
							<ChevronRightIcon class="text-muted-foreground ml-auto size-4" />
						</div>
					</a>
				</li>
			{/each}
		</ul>

		<footer class="text-muted-foreground bg-muted/30 border-t px-4 py-2.5 text-xs">
			{data.processes.length} {data.processes.length === 1 ? 'processo' : 'processos'}{filtrando ? ' no período filtrado' : ''}
		</footer>
	{:else if data.counts.total}
		<EmptyState icon={FolderOpenIcon} title="Nenhum processo encontrado" description="Não há processos com os filtros selecionados.">
			<Button href="/" variant="outline">Limpar filtros</Button>
		</EmptyState>
	{:else}
		<EmptyState
			icon={FolderOpenIcon}
			title="Seu primeiro processo começa aqui"
			description={data.clientCount ? 'Selecione um cliente e preencha os dados da operação.' : 'Cadastre um cliente para abrir o primeiro processo.'}
		>
			<Button href={data.clientCount ? '/processos/novo' : '/clientes'}><PlusIcon />{data.clientCount ? 'Novo processo' : 'Cadastrar cliente'}</Button>
		</EmptyState>
	{/if}
</section>

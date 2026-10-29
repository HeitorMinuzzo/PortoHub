<script lang="ts">
	import { Plus, ChevronRight, ArrowDownLeft, ArrowUpRight, ArrowRight, CalendarDays, FolderOpen, SlidersHorizontal, X } from '@lucide/svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Table from '#lib/components/ui/table/index.js';
	import ProcessState from '#lib/components/process-state.svelte';
	import ModeIcon from '#lib/components/mode-icon.svelte';
	import { formatDate, operationLabels, modeLabels } from '#lib/domain.js';
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
	function statusUrl(status: string) {
		const query = new URLSearchParams();
		if (status !== 'all') query.set('status', status);
		if (data.filters.month) query.set('month', data.filters.month);
		if (data.filters.arrival) query.set('arrival', data.filters.arrival);
		return `/?${query}`;
	}
</script>
<svelte:head><title>Processos · PortoHub</title></svelte:head>
<div class="page-heading">
	<div><div class="page-kicker">OPERAÇÕES</div><h1>Processos<span class="heading-period">.</span></h1><p class="page-description">Consulte e acompanhe suas operações.</p></div>
	<Button href="/processos/novo" class="primary-action"><Plus size={17} aria-hidden="true"/>Novo processo</Button>
</div>
<section class="records-panel" aria-label="Lista de processos">
	<div class="panel-tabs">
		<nav class="status-tabs" aria-label="Situação dos processos">
			{#each [{ key: 'all', label: 'Todos', count: data.counts.total }, { key: 'open', label: 'Em aberto', count: data.counts.open }, { key: 'closed', label: 'Encerrados', count: data.counts.closed }] as tab}
				<a href={statusUrl(tab.key)} class:current={data.filters.status === tab.key} aria-current={data.filters.status === tab.key ? 'page' : undefined}>{tab.label}<span>{tab.count}</span></a>
			{/each}
		</nav>
	</div>
	<form method="GET" class="filter-bar">
		<input type="hidden" name="status" value={data.filters.status}/>
		<span class="filter-caption"><SlidersHorizontal size={15} aria-hidden="true"/>Filtrar por</span>
		<div class="filter-field"><label for="month">Mês de abertura</label><input id="month" type="month" name="month" value={data.filters.month}/></div>
		<div class="filter-field"><label for="arrival">Data de chegada</label><input id="arrival" type="date" name="arrival" value={data.filters.arrival}/></div>
		<Button type="submit" variant="outline" class="filter-button">Aplicar</Button>
		{#if data.filters.month || data.filters.arrival}<a href={data.filters.status === 'all' ? '/' : `/?status=${data.filters.status}`} class="clear-filter"><X size={14} aria-hidden="true"/>Limpar</a>{/if}
	</form>
	{#if data.processes.length}
		<div class="desktop-table">
		<Table.Root class="process-table">
			<Table.Header><Table.Row><Table.Head>Processo / Cliente</Table.Head><Table.Head>Operação</Table.Head><Table.Head>Trajeto</Table.Head><Table.Head>Chegada</Table.Head><Table.Head>Prioridade</Table.Head><Table.Head>Situação</Table.Head><Table.Head><span class="sr-only">Abrir processo</span></Table.Head></Table.Row></Table.Header>
			<Table.Body>
				{#each data.processes as process}
					<Table.Row>
						<Table.Cell><a class="process-number" href={`/processos/${process.id}`}>{process.number}</a><span class="cell-secondary client-cell">{process.clientName}</span></Table.Cell>
						<Table.Cell><span class="operation-line">{#if process.operation === 'importacao'}<ArrowDownLeft size={13} aria-hidden="true"/>{:else}<ArrowUpRight size={13} aria-hidden="true"/>{/if}{operationLabels[process.operation]}</span><span class="cell-secondary mode-line"><ModeIcon mode={process.mode} size={13}/>{modeLabels[process.mode]}</span></Table.Cell>
						<Table.Cell><span class="route-cell"><span>{process.origin || 'A definir'}</span><span class="route-destination"><ArrowRight size={12} aria-hidden="true"/>{process.destination || 'A definir'}</span></span></Table.Cell>
						<Table.Cell><span class="date-cell">{formatDate(process.arrivalDate)}</span>{#if process.departureDate}<span class="cell-secondary date-caption">Emb. {formatDate(process.departureDate).slice(0, 5)}</span>{/if}</Table.Cell>
						<Table.Cell><span class:urgent={process.priority === 'urgente'} class="priority-label"><span></span>{process.priority === 'urgente' ? 'Urgente' : 'Normal'}</span></Table.Cell>
						<Table.Cell><ProcessState closed={Boolean(process.closedAt)}/></Table.Cell>
						<Table.Cell><a href={`/processos/${process.id}`} class="row-action" aria-label={`Abrir processo ${process.number}`}><ChevronRight size={17} aria-hidden="true"/></a></Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
		</div>
		<div class="mobile-process-list">
			{#each data.processes as process}
				<a class="mobile-process" href={`/processos/${process.id}`}><div class="mobile-process-top"><span class="process-number">{process.number}</span><ProcessState closed={Boolean(process.closedAt)}/></div><strong>{process.clientName}</strong><div class="mobile-route"><ModeIcon mode={process.mode}/><span>{process.origin || 'A definir'}</span><ArrowRight size={13} aria-hidden="true"/><span>{process.destination || 'A definir'}</span></div><div class="mobile-process-bottom"><span><CalendarDays size={13} aria-hidden="true"/>{formatDate(process.arrivalDate)}</span><span class:urgent={process.priority === 'urgente'} class="priority-label"><span></span>{process.priority === 'urgente' ? 'Urgente' : 'Normal'}</span><ChevronRight size={16} aria-hidden="true"/></div></a>
			{/each}
		</div>
		<footer class="table-footer"><span>{data.processes.length} {data.processes.length === 1 ? 'processo' : 'processos'}{data.filters.month || data.filters.arrival ? ' neste período' : ' no total'}</span><span class="table-hint">Selecione um processo para ver os detalhes<ArrowUpRight size={13} aria-hidden="true"/></span></footer>
	{:else}
		<div class="empty-state"><div class="empty-symbol"><FolderOpen size={30} strokeWidth={1.3} aria-hidden="true"/></div><h2>{data.counts.total ? 'Nenhum processo por aqui' : 'Seu primeiro processo começa aqui'}</h2><p>{data.counts.total ? 'Não encontramos processos com os filtros selecionados.' : data.clientCount ? 'Selecione um cliente e preencha os dados da operação.' : 'Cadastre um cliente para abrir o primeiro processo.'}</p>{#if data.counts.total}<Button href="/" variant="outline">Limpar filtros</Button>{:else}<Button href={data.clientCount ? '/processos/novo' : '/clientes'}><Plus size={16} aria-hidden="true"/>{data.clientCount ? 'Novo processo' : 'Cadastrar cliente'}</Button>{/if}</div>
	{/if}
</section>

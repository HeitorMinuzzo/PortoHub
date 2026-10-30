<script lang="ts">
	import { Popover, Command } from 'bits-ui';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import CheckIcon from '@lucide/svelte/icons/check';
	import SearchIcon from '@lucide/svelte/icons/search';
	import { cn } from '#lib/utils.js';
	import { formatDocument, type Client } from '#lib/domain.js';

	let {
		clients,
		value = $bindable(''),
		id,
		name,
		disabled = false,
		invalid,
		describedby
	}: {
		clients: Client[];
		value?: string;
		id: string;
		name: string;
		disabled?: boolean;
		invalid?: boolean;
		describedby?: string;
	} = $props();

	let open = $state(false);
	const selecionado = $derived(clients.find((c) => String(c.id) === value));

	const iniciais = (nome: string) =>
		nome
			.split(/\s+/)
			.filter(Boolean)
			.slice(0, 2)
			.map((p) => p[0])
			.join('')
			.toUpperCase();

	// Busca sem diferenciar acentos e maiúsculas, por nome, CPF ou CNPJ
	const normalizar = (texto: string) => texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
	function filtrar(_value: string, busca: string, keywords: string[] = []) {
		const termo = normalizar(busca.trim());
		return keywords.some((k) => normalizar(k).includes(termo)) ? 1 : 0;
	}

	function escolher(client: Client) {
		value = String(client.id);
		open = false;
		document.getElementById(id)?.focus();
	}
</script>

{#snippet avatar(nome: string, classe = '')}
	<span class={cn('bg-muted text-muted-foreground flex size-7 shrink-0 items-center justify-center rounded-md text-[11px] font-semibold', classe)}>{iniciais(nome)}</span>
{/snippet}

<input type="hidden" {name} {value} />

<Popover.Root bind:open>
	<Popover.Trigger
		{id}
		{disabled}
		aria-invalid={invalid}
		aria-describedby={describedby}
		class="border-input dark:bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 hover:bg-muted/40 data-[state=open]:border-ring data-[state=open]:ring-ring/50 flex h-11 w-full min-w-0 items-center gap-2.5 rounded-md border bg-transparent px-2 text-left text-sm shadow-xs transition-[color,box-shadow,background-color] outline-none focus-visible:ring-3 aria-invalid:ring-3 disabled:cursor-not-allowed disabled:opacity-50 data-[state=open]:ring-3"
	>
		{#if selecionado}
			{@render avatar(selecionado.name, 'bg-primary/10 text-primary')}
			<span class="grid min-w-0 flex-1 leading-tight">
				<span class="truncate font-medium">{selecionado.name}</span>
				<span class="text-muted-foreground truncate text-xs tabular-nums">{formatDocument(selecionado.cnpj)}</span>
			</span>
		{:else}
			<span class="text-muted-foreground flex-1 truncate px-0.5">Selecione um cliente</span>
		{/if}
		<ChevronsUpDownIcon class="text-muted-foreground size-4 shrink-0" />
	</Popover.Trigger>
	<Popover.Portal>
		<Popover.Content
			sideOffset={6}
			align="start"
			class="bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 z-50 w-(--bits-popover-anchor-width) min-w-72 overflow-hidden rounded-lg border shadow-md outline-none"
		>
			<Command.Root filter={filtrar} {value}>
				<div class="flex items-center gap-2 border-b px-3">
					<SearchIcon class="text-muted-foreground size-4 shrink-0" />
					<Command.Input placeholder="Buscar por nome, CPF ou CNPJ…" class="placeholder:text-muted-foreground h-10 w-full bg-transparent text-sm outline-none" />
				</div>
				<Command.List class="max-h-72 overflow-y-auto overscroll-contain p-1">
					<Command.Viewport>
						<Command.Empty class="text-muted-foreground py-6 text-center text-sm">Nenhum cliente encontrado.</Command.Empty>
						{#each clients as client (client.id)}
							<Command.Item
								value={String(client.id)}
								keywords={[client.name, client.cnpj, formatDocument(client.cnpj)]}
								onSelect={() => escolher(client)}
								class="data-selected:bg-accent data-selected:text-accent-foreground flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm outline-none select-none"
							>
								{@render avatar(client.name)}
								<span class="grid min-w-0 flex-1 leading-tight">
									<span class="truncate">{client.name}</span>
									<span class="text-muted-foreground truncate text-xs tabular-nums">{formatDocument(client.cnpj)}</span>
								</span>
								<CheckIcon class={cn('text-primary size-4 shrink-0', String(client.id) !== value && 'invisible')} />
							</Command.Item>
						{/each}
					</Command.Viewport>
				</Command.List>
			</Command.Root>
		</Popover.Content>
	</Popover.Portal>
</Popover.Root>

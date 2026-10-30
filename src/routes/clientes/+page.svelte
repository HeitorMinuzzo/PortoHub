<script lang="ts">
	import { enhance } from '$app/forms';
	import { tick } from 'svelte';
	import { toast } from 'svelte-sonner';
	import * as Table from '#lib/components/ui/table/index.js';
	import * as Dialog from '#lib/components/ui/dialog/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Label } from '#lib/components/ui/label/index.js';
	import PageHeader from '#lib/components/page-header.svelte';
	import EmptyState from '#lib/components/empty-state.svelte';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import SearchIcon from '@lucide/svelte/icons/search';
	import UsersRoundIcon from '@lucide/svelte/icons/users-round';
	import LoaderIcon from '@lucide/svelte/icons/loader-circle';
	import { documentType, formatDocument, maskDocument, type Client } from '#lib/domain.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let open = $state(false);
	let editing = $state<Client | null>(null);
	let busy = $state(false);
	let error = $state('');
	let errorField = $state('');
	let filtro = $state('');
	let documento = $state('');

	const termo = $derived(filtro.trim().toLowerCase());
	const lista = $derived(
		termo
			? data.clients.filter((c) =>
					[c.name, c.cnpj, formatDocument(c.cnpj), c.contact].some((v) => v.toLowerCase().includes(termo))
				)
			: data.clients
	);

	const iniciais = (nome: string) =>
		nome
			.split(/\s+/)
			.filter(Boolean)
			.slice(0, 2)
			.map((p) => p[0])
			.join('')
			.toUpperCase();

	function editar(client: Client | null) {
		editing = client;
		documento = client ? formatDocument(client.cnpj) : '';
		error = '';
		errorField = '';
		open = true;
	}
</script>

<svelte:head><title>Clientes · PortoHub</title></svelte:head>

<PageHeader title="Clientes" description="Nome, CPF/CNPJ e contato dos clientes atendidos.">
	{#snippet actions()}
		<Button onclick={() => editar(null)}><PlusIcon />Novo cliente</Button>
	{/snippet}
</PageHeader>

{#if data.clients.length}
	<div class="relative mb-4 max-w-sm">
		<SearchIcon class="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
		<Input placeholder="Buscar por nome, CPF/CNPJ ou contato…" class="pl-8" bind:value={filtro} aria-label="Buscar clientes" />
	</div>
{/if}

<section class="overflow-hidden rounded-xl border" aria-label="Lista de clientes">
	{#if !data.clients.length}
		<EmptyState icon={UsersRoundIcon} title="Vamos começar pelos clientes" description="Cadastre nome, CPF/CNPJ e contato para abrir processos.">
			<Button onclick={() => editar(null)}><PlusIcon />Cadastrar cliente</Button>
		</EmptyState>
	{:else}
		<Table.Root>
			<Table.Header class="bg-muted/50">
				<Table.Row class="hover:bg-transparent">
					<Table.Head class="w-[45%] pl-4">Nome / Razão social</Table.Head>
					<Table.Head class="hidden sm:table-cell">CPF/CNPJ</Table.Head>
					<Table.Head class="hidden md:table-cell">Contato</Table.Head>
					<Table.Head class="w-12"><span class="sr-only">Ações</span></Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each lista as client (client.id)}
					<Table.Row class="cursor-pointer" onclick={() => editar(client)}>
						<Table.Cell class="max-w-0 py-3 pl-4">
							<div class="flex min-w-0 items-center gap-3">
								<span class="bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-md text-xs font-semibold">{iniciais(client.name)}</span>
								<div class="min-w-0">
									<div class="truncate font-medium">{client.name}</div>
									<div class="text-muted-foreground truncate text-xs tabular-nums sm:hidden">{formatDocument(client.cnpj)}</div>
									<div class="text-muted-foreground truncate text-xs md:hidden">{client.contact}</div>
								</div>
							</div>
						</Table.Cell>
						<Table.Cell class="text-muted-foreground hidden tabular-nums sm:table-cell">{formatDocument(client.cnpj)}</Table.Cell>
						<Table.Cell class="text-muted-foreground hidden max-w-72 truncate md:table-cell">{client.contact}</Table.Cell>
						<Table.Cell class="pr-3">
							<Button
								variant="ghost"
								size="icon-sm"
								aria-label={`Editar ${client.name}`}
								onclick={(e: MouseEvent) => {
									e.stopPropagation();
									editar(client);
								}}
							>
								<PencilIcon />
							</Button>
						</Table.Cell>
					</Table.Row>
				{:else}
					<Table.Row class="hover:bg-transparent">
						<Table.Cell colspan={4} class="text-muted-foreground h-32 text-center">Nenhum cliente encontrado para essa busca.</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
		<footer class="text-muted-foreground bg-muted/30 border-t px-4 py-2.5 text-xs">
			{#if termo}{lista.length} de {data.clients.length} clientes{:else}{data.clients.length} {data.clients.length === 1 ? 'cliente cadastrado' : 'clientes cadastrados'}{/if}
		</footer>
	{/if}
</section>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>{editing ? 'Editar cliente' : 'Novo cliente'}</Dialog.Title>
			<Dialog.Description>{editing ? 'Atualize os dados do cliente.' : 'Preencha os dados do novo cliente.'}</Dialog.Description>
		</Dialog.Header>
		<form
			method="POST"
			action="?/save"
			class="grid gap-4"
			use:enhance={() => {
				busy = true;
				error = '';
				errorField = '';
				return async ({ result, update }) => {
					busy = false;
					await update({ reset: false });
					if (result.type === 'success') {
						open = false;
						toast.success(editing ? 'Cliente atualizado' : 'Cliente cadastrado');
					} else if (result.type === 'failure') {
						error = String(result.data?.error ?? 'Não foi possível salvar.');
						errorField = String(result.data?.field ?? '');
						await tick();
						document.getElementById(errorField)?.focus();
					}
				};
			}}
		>
			{#if editing}<input type="hidden" name="id" value={editing.id} />{/if}
			<div class="grid gap-2">
				<Label for="name">Nome ou razão social</Label>
				<Input id="name" name="name" value={editing?.name ?? ''} placeholder="Nome da pessoa ou da empresa" required maxlength={200} autocomplete="organization" aria-invalid={errorField === 'name' || undefined} />
			</div>
			<div class="grid gap-2">
				<div class="flex items-center justify-between">
					<Label for="cnpj">CPF/CNPJ</Label>
					{#if documento}<span class="text-muted-foreground text-xs" aria-live="polite">{documentType(documento)}</span>{/if}
				</div>
				<Input
					id="cnpj"
					name="cnpj"
					value={documento}
					oninput={(e: Event) => {
						const campo = e.currentTarget as HTMLInputElement;
						documento = maskDocument(campo.value);
						campo.value = documento;
					}}
					placeholder="Digite o CPF ou o CNPJ"
					required
					maxlength={18}
					autocapitalize="characters"
					spellcheck={false}
					class="tabular-nums"
					aria-invalid={errorField === 'cnpj' || undefined}
					aria-describedby={errorField === 'cnpj' ? 'client-error' : undefined}
				/>
			</div>
			<div class="grid gap-2">
				<Label for="contact">Contato</Label>
				<Input id="contact" name="contact" value={editing?.contact ?? ''} placeholder="Telefone, e-mail ou nome do contato" required maxlength={300} aria-invalid={errorField === 'contact' || undefined} />
			</div>
			{#if error}
				<p class="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm" role="alert" id="client-error">{error}</p>
			{/if}
			<Dialog.Footer class="mt-2">
				<Button variant="outline" onclick={() => (open = false)} disabled={busy}>Cancelar</Button>
				<Button type="submit" disabled={busy}>
					{#if busy}<LoaderIcon class="animate-spin" />{/if}
					Salvar cliente
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<script lang="ts">
	import { enhance } from '$app/forms';
	import { tick } from 'svelte';
	import { Plus, ArrowUpRight, UsersRound, LoaderCircle, Check, Building2 } from '@lucide/svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Label } from '#lib/components/ui/label/index.js';
	import * as Dialog from '#lib/components/ui/dialog/index.js';
	import * as Table from '#lib/components/ui/table/index.js';
	import { formatCnpj, type Client } from '#lib/domain.js';
	import type { PageProps } from './$types';
	let { data, form }: PageProps = $props();
	let open = $state(false);
	let editing = $state<Client | null>(null);
	let busy = $state(false);
	let error = $state('');
	let errorField = $state('');
	function edit(client: Client | null) { editing = client; error = ''; errorField = ''; open = true; }
</script>
<svelte:head><title>Clientes · PortoHub</title></svelte:head>
<div class="page-heading"><div><div class="page-kicker">CADASTROS</div><h1>Clientes<span class="heading-period">.</span></h1><p class="page-description">Razão social, CNPJ e contato.</p></div><Button class="primary-action" onclick={() => edit(null)}><Plus size={17} aria-hidden="true"/>Novo cliente</Button></div>
{#if form && 'success' in form}<div class="success-message" role="status"><Check size={16} aria-hidden="true"/>{form.success}</div>{/if}
<section class="records-panel" aria-label="Lista de clientes">
	<div class="client-panel-title"><h2>Todos os clientes <span>{data.clients.length}</span></h2><UsersRound size={18} strokeWidth={1.5} aria-hidden="true"/></div>
	{#if data.clients.length}
		<div class="desktop-table"><Table.Root class="client-table"><Table.Header><Table.Row><Table.Head>Razão social</Table.Head><Table.Head>CNPJ</Table.Head><Table.Head>Contato</Table.Head><Table.Head><span class="sr-only">Editar cliente</span></Table.Head></Table.Row></Table.Header><Table.Body>{#each data.clients as client}<Table.Row><Table.Cell><button class="client-name-button" onclick={() => edit(client)}><span class="client-monogram">{client.name.slice(0, 2).toUpperCase()}</span><strong>{client.name}</strong></button></Table.Cell><Table.Cell class="cnpj-cell">{formatCnpj(client.cnpj)}</Table.Cell><Table.Cell class="contact-cell">{client.contact}</Table.Cell><Table.Cell><button class="row-action" onclick={() => edit(client)} aria-label={`Editar ${client.name}`}><ArrowUpRight size={17} aria-hidden="true"/></button></Table.Cell></Table.Row>{/each}</Table.Body></Table.Root></div>
		<div class="mobile-client-list">{#each data.clients as client}<button class="mobile-client" onclick={() => edit(client)}><span class="client-monogram">{client.name.slice(0, 2).toUpperCase()}</span><span><strong>{client.name}</strong><span class="cell-secondary">{formatCnpj(client.cnpj)}</span><span class="client-contact">{client.contact}</span></span><ArrowUpRight size={16} aria-hidden="true"/></button>{/each}</div>
		<footer class="table-footer"><span>{data.clients.length} {data.clients.length === 1 ? 'cliente cadastrado' : 'clientes cadastrados'}</span><span class="table-hint">Selecione um cliente para editar<ArrowUpRight size={13} aria-hidden="true"/></span></footer>
	{:else}<div class="empty-state"><div class="empty-symbol"><UsersRound size={30} strokeWidth={1.3} aria-hidden="true"/></div><h2>Vamos começar pelos clientes</h2><p>Cadastre razão social, CNPJ e contato. Só isso.</p><Button onclick={() => edit(null)}><Plus size={16} aria-hidden="true"/>Cadastrar cliente</Button></div>{/if}
</section>
<Dialog.Root bind:open><Dialog.Content class="client-dialog"><div class="dialog-symbol"><Building2 size={24} strokeWidth={1.5} aria-hidden="true"/></div><Dialog.Header><Dialog.Title class="dialog-title">{editing ? 'Editar cliente' : 'Novo cliente'}</Dialog.Title><Dialog.Description>Preencha os dados do cliente.</Dialog.Description></Dialog.Header>
	<form method="POST" action="?/save" class="client-form" use:enhance={() => { busy = true; error = ''; errorField = ''; return async ({ result, update }) => { busy = false; await update({ reset: false }); if (result.type === 'success') open = false; else if (result.type === 'failure') { error = String(result.data?.error ?? 'Não foi possível salvar.'); errorField = String(result.data?.field ?? ''); await tick(); document.getElementById(errorField)?.focus(); } }; }}>
		{#if editing}<input type="hidden" name="id" value={editing.id}/>{/if}
		<div class="field"><Label for="name">Razão social <span class="required-mark">*</span></Label><Input id="name" name="name" value={editing?.name ?? ''} placeholder="Nome da empresa" required maxlength={200} autocomplete="organization" aria-invalid={errorField === 'name' || undefined}/></div>
		<div class="field"><Label for="cnpj">CNPJ <span class="required-mark">*</span></Label><Input id="cnpj" name="cnpj" value={editing ? formatCnpj(editing.cnpj) : ''} placeholder="00.000.000/0000-00" required maxlength={18} autocapitalize="characters" spellcheck={false} aria-invalid={errorField === 'cnpj' || undefined} aria-describedby={errorField === 'cnpj' ? 'client-error' : undefined}/></div>
		<div class="field"><Label for="contact">Contato <span class="required-mark">*</span></Label><Input id="contact" name="contact" value={editing?.contact ?? ''} placeholder="Telefone, e-mail ou nome do contato" required maxlength={300} aria-invalid={errorField === 'contact' || undefined}/></div>
		{#if error}<p class="form-error" role="alert" id="client-error">{error}</p>{/if}
		<Dialog.Footer class="client-dialog-footer"><Button variant="outline" onclick={() => open = false} disabled={busy}>Cancelar</Button><Button type="submit" disabled={busy}>{#if busy}<LoaderCircle size={16} class="spin" aria-hidden="true"/>{/if}Salvar cliente</Button></Dialog.Footer>
	</form>
</Dialog.Content></Dialog.Root>

<script lang="ts">
	import { ArrowLeft, UsersRound, Plus } from '@lucide/svelte';
	import ProcessForm from '#lib/components/process-form.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import type { PageProps } from './$types';
	let { data, form }: PageProps = $props();
</script>
<svelte:head><title>Novo processo · PortoHub</title></svelte:head>
<a href="/" class="back-link"><ArrowLeft size={15} aria-hidden="true"/>Processos</a>
<div class="page-heading form-page-heading"><div><h1>Novo processo<span class="heading-period">.</span></h1><p class="page-description">Preencha os dados da operação.</p></div><span class="draft-label">Novo cadastro</span></div>
{#if data.clients.length}<ProcessForm clients={data.clients} feedback={form} create/>{:else}<section class="records-panel"><div class="empty-state"><div class="empty-symbol"><UsersRound size={30} aria-hidden="true"/></div><h2>Primeiro, um cliente</h2><p>Cadastre o cliente para vincular a esta operação.</p><Button href="/clientes"><Plus size={16} aria-hidden="true"/>Cadastrar cliente</Button></div></section>{/if}

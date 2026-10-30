<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import PageHeader from '#lib/components/page-header.svelte';
	import EmptyState from '#lib/components/empty-state.svelte';
	import ProcessForm from '#lib/components/process-form.svelte';
	import UsersRoundIcon from '@lucide/svelte/icons/users-round';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<svelte:head><title>Novo processo · PortoHub</title></svelte:head>

<PageHeader title="Novo processo" description="Preencha os dados da operação." />

{#if data.clients.length}
	<ProcessForm clients={data.clients} feedback={form} create />
{:else}
	<section class="rounded-xl border">
		<EmptyState icon={UsersRoundIcon} title="Primeiro, um cliente" description="Cadastre o cliente que será vinculado a esta operação.">
			<Button href="/clientes"><PlusIcon />Cadastrar cliente</Button>
		</EmptyState>
	</section>
{/if}

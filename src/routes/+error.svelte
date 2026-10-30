<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '#lib/components/ui/button/index.js';
	import EmptyState from '#lib/components/empty-state.svelte';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import FolderSearchIcon from '@lucide/svelte/icons/folder-search';
</script>

<svelte:head><title>{page.status} · PortoHub</title></svelte:head>

<div class="flex min-h-[60dvh] items-center justify-center">
	<EmptyState
		icon={FolderSearchIcon}
		title={page.status === 404 ? 'Não encontramos essa página' : 'Algo saiu do lugar'}
		description={page.status === 404 ? 'O endereço ou processo informado não existe.' : 'Não foi possível carregar os dados. Tente novamente.'}
	>
		<Button href="/"><ArrowLeftIcon />Voltar aos processos</Button>
	</EmptyState>
</div>

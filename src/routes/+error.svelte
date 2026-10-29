<script lang="ts">
	import { page } from '$app/state';
	import { ArrowLeft, FolderSearch } from '@lucide/svelte';
	import { Button } from '#lib/components/ui/button/index.js';
</script>
<svelte:head><title>{page.status} · PortoHub</title></svelte:head>
<div class="empty-state error-page"><div class="empty-symbol"><FolderSearch size={32} aria-hidden="true"/></div><h1>{page.status === 404 ? 'Não encontramos essa página' : 'Algo saiu do lugar'}</h1><p>{page.status === 404 ? 'O endereço ou processo informado não existe.' : 'Não foi possível carregar os dados. Tente novamente.'}</p><Button href="/"><ArrowLeft size={16} aria-hidden="true"/>Voltar aos processos</Button></div>

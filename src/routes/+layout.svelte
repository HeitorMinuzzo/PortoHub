<script lang="ts">
	import './layout.css';
	import { page } from '$app/state';
	import { Files, UsersRound, ArrowUpRight } from '@lucide/svelte';
	import favicon from '#lib/assets/favicon.svg';
	import type { LayoutProps } from './$types';

	let { children, data }: LayoutProps = $props();
	const clientsActive = $derived(page.url.pathname.startsWith('/clientes'));
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="theme-color" content="#173c35" />
	<meta name="description" content="PortoHub. Clientes e processos de comércio exterior em um só lugar." />
</svelte:head>

<a class="skip-link" href="#conteudo">Ir para o conteúdo</a>
<div class="app-shell">
	<aside class="sidebar">
		<a href="/" class="brand" aria-label="PortoHub, início">
			<svg class="brand-symbol" viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M7 25V7h10a7 7 0 0 1 0 14h-3" stroke="currentColor" stroke-width="3.5"/><path d="m14 12 5 4-5 4" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/></svg>
			<span>porto<span class="brand-light">hub</span><span class="brand-period">.</span></span>
		</a>
		<div class="nav-caption">ESPAÇO DE TRABALHO</div>
		<nav aria-label="Navegação principal">
			<a href="/" class:active={!clientsActive} aria-current={!clientsActive ? 'page' : undefined}><Files size={18} strokeWidth={1.7} aria-hidden="true"/><span>Processos</span></a>
			<a href="/clientes" class:active={clientsActive} aria-current={clientsActive ? 'page' : undefined}><UsersRound size={18} strokeWidth={1.7} aria-hidden="true"/><span>Clientes</span></a>
		</nav>
		<div class="sidebar-footer"><span class="footer-mark"><ArrowUpRight size={17} aria-hidden="true"/></span><span>Comércio exterior.<br/><strong>Tudo em ordem.</strong></span></div>
	</aside>
	<div class="workspace">
		<header class="workspace-bar"><span class="workspace-label"><span class="workspace-dot"></span>Gestão de operações</span>{#if data.demo}<span class="demo-label">Demonstração</span>{/if}<span class="app-name">PORTOHUB</span></header>
		<main id="conteudo" class="main-content" tabindex="-1">{@render children()}</main>
	</div>
</div>

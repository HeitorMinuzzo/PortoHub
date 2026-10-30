<script lang="ts">
	import './layout.css';
	import { page } from '$app/state';
	import { ModeWatcher, toggleMode } from 'mode-watcher';
	import * as Sidebar from '#lib/components/ui/sidebar/index.js';
	import { Separator } from '#lib/components/ui/separator/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Toaster } from '#lib/components/ui/sonner/index.js';
	import AppSidebar from '#lib/components/app-sidebar.svelte';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import SunIcon from '@lucide/svelte/icons/sun';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import favicon from '#lib/assets/favicon.svg';
	import type { LayoutProps } from './$types';

	let { children, data }: LayoutProps = $props();

	// Trilha do cabeçalho a partir da rota atual
	const trilha = $derived.by(() => {
		const path = page.url.pathname;
		if (path.startsWith('/clientes')) return [{ label: 'Clientes' }];
		if (path === '/processos/novo') return [{ label: 'Processos', href: '/' }, { label: 'Novo processo' }];
		const process = (page.data as { process?: { number: string } }).process;
		if (process) return [{ label: 'Processos', href: '/' }, { label: process.number }];
		return [{ label: 'Processos' }];
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="description" content="PortoHub. Clientes e processos de comércio exterior em um só lugar." />
</svelte:head>

<ModeWatcher defaultMode="light" />
<Toaster richColors position="top-right" />

<Sidebar.Provider>
	<AppSidebar counts={data.counts} clientCount={data.clientCount} demo={data.demo} />
	<Sidebar.Inset class="min-w-0">
		<header class="bg-background/80 sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b px-4 backdrop-blur">
			<Sidebar.Trigger class="-ml-1" />
			<Separator orientation="vertical" class="mr-2 data-[orientation=vertical]:h-4" />
			<nav aria-label="Trilha" class="flex min-w-0 flex-1 items-center gap-1 text-sm">
				{#each trilha as item, i (i)}
					{#if i > 0}<ChevronRightIcon class="text-muted-foreground size-3.5 shrink-0" />{/if}
					{#if item.href}
						<a href={item.href} class="text-muted-foreground hover:text-foreground truncate transition-colors">{item.label}</a>
					{:else}
						<span class="truncate font-medium" aria-current="page">{item.label}</span>
					{/if}
				{/each}
			</nav>
			<Button variant="ghost" size="icon-sm" onclick={toggleMode} aria-label="Alternar tema" title="Alternar tema">
				<SunIcon class="dark:hidden" />
				<MoonIcon class="hidden dark:block" />
			</Button>
		</header>
		<main id="conteudo" class="mx-auto w-full max-w-7xl flex-1 p-4 md:p-6 lg:p-8" tabindex="-1">
			{@render children()}
		</main>
	</Sidebar.Inset>
</Sidebar.Provider>

<script lang="ts">
	import { page } from '$app/state';
	import * as Sidebar from '#lib/components/ui/sidebar/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import FilesIcon from '@lucide/svelte/icons/files';
	import UsersRoundIcon from '@lucide/svelte/icons/users-round';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import SunIcon from '@lucide/svelte/icons/sun';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import FlaskConicalIcon from '@lucide/svelte/icons/flask-conical';
	import { toggleMode } from 'mode-watcher';

	let { counts, clientCount, demo = false }: { counts: { open: number }; clientCount: number; demo?: boolean } = $props();

	const sidebar = Sidebar.useSidebar();
	const clientesAtivo = $derived(page.url.pathname.startsWith('/clientes'));

	// No celular a barra lateral é um painel: fecha ao navegar
	function fechar() {
		if (sidebar.isMobile) sidebar.setOpenMobile(false);
	}
</script>

<Sidebar.Root>
	<Sidebar.Header>
		<a href="/" class="flex items-center gap-2 rounded-md px-2 py-1.5" onclick={fechar} aria-label="PortoHub, início">
			<div class="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-md">
				<svg class="size-4.5" viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M7 25V7h10a7 7 0 0 1 0 14h-3" stroke="currentColor" stroke-width="3.5" /><path d="m14 12 5 4-5 4" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round" /></svg>
			</div>
			<div class="grid flex-1 leading-tight">
				<span class="truncate text-sm font-semibold">PortoHub</span>
				<span class="text-muted-foreground truncate text-xs">Gestão de comércio exterior</span>
			</div>
		</a>
		<Button variant="outline" class="w-full justify-start" href="/processos/novo" onclick={fechar}>
			<PlusIcon />
			Novo processo
		</Button>
	</Sidebar.Header>

	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupLabel>Operações</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					<Sidebar.MenuItem>
						<Sidebar.MenuButton isActive={!clientesAtivo} tooltipContent="Processos">
							{#snippet child({ props })}
								<a href="/" {...props} onclick={fechar} aria-current={!clientesAtivo ? 'page' : undefined}>
									<FilesIcon />
									<span>Processos</span>
								</a>
							{/snippet}
						</Sidebar.MenuButton>
						<Sidebar.MenuBadge title="Processos em aberto">{counts.open}</Sidebar.MenuBadge>
					</Sidebar.MenuItem>
					<Sidebar.MenuItem>
						<Sidebar.MenuButton isActive={clientesAtivo} tooltipContent="Clientes">
							{#snippet child({ props })}
								<a href="/clientes" {...props} onclick={fechar} aria-current={clientesAtivo ? 'page' : undefined}>
									<UsersRoundIcon />
									<span>Clientes</span>
								</a>
							{/snippet}
						</Sidebar.MenuButton>
						<Sidebar.MenuBadge>{clientCount}</Sidebar.MenuBadge>
					</Sidebar.MenuItem>
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
	</Sidebar.Content>

	<Sidebar.Footer>
		{#if demo}
			<div class="border-warning/30 bg-warning/10 text-warning flex gap-2 rounded-md border p-2 text-xs">
				<FlaskConicalIcon class="mt-0.5 size-3.5 shrink-0" />
				<span>Modo demonstração. Os dados são de exemplo.</span>
			</div>
		{/if}
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton onclick={toggleMode}>
					<SunIcon class="dark:hidden" />
					<MoonIcon class="hidden dark:block" />
					<span>Alternar tema</span>
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Footer>
	<Sidebar.Rail />
</Sidebar.Root>

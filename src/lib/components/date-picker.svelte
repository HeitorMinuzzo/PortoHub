<script lang="ts">
	import { Popover, Calendar } from 'bits-ui';
	import { parseDate, today, getLocalTimeZone, type DateValue } from '@internationalized/date';
	import CalendarIcon from '@lucide/svelte/icons/calendar-days';
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import XIcon from '@lucide/svelte/icons/x';
	import { cn } from '#lib/utils.js';

	type Modo = 'month' | 'date';

	let {
		id,
		name,
		value = $bindable(''),
		mode,
		placeholder,
		clearable = true,
		disabled = false,
		invalid,
		describedby,
		class: className
	}: {
		id: string;
		name: string;
		value?: string;
		mode: Modo;
		placeholder: string;
		clearable?: boolean;
		disabled?: boolean;
		invalid?: boolean;
		describedby?: string;
		class?: string;
	} = $props();

	let open = $state(false);

	const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
	const hoje = today(getLocalTimeZone());

	// Mês: "AAAA-MM"; data: "AAAA-MM-DD"
	const rotulo = $derived.by(() => {
		if (!value) return '';
		const [ano, mes, dia] = value.split('-');
		return mode === 'month' ? `${meses[Number(mes) - 1]} de ${ano}` : `${dia}/${mes}/${ano}`;
	});

	let ano = $state(Number(value.slice(0, 4)) || hoje.year);
	const data = $derived(mode === 'date' && value ? parseDate(value) : undefined);

	function escolherMes(mes: number) {
		value = `${ano}-${String(mes).padStart(2, '0')}`;
		open = false;
	}

	function escolherData(nova: DateValue | undefined) {
		value = nova ? nova.toString() : '';
		open = false;
	}

	function limpar() {
		value = '';
		document.getElementById(id)?.focus();
	}
</script>

<input type="hidden" {name} {value} />

<div class={cn('relative', className)}>
	<Popover.Root bind:open onOpenChange={(aberto) => aberto && value && (ano = Number(value.slice(0, 4)))}>
		<Popover.Trigger
			{id}
			{disabled}
			aria-invalid={invalid}
			aria-describedby={describedby}
			class="aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:ring-3 disabled:cursor-not-allowed disabled:opacity-50 border-input dark:bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 hover:bg-muted/40 data-[state=open]:border-ring data-[state=open]:ring-ring/50 flex h-9 w-full items-center gap-2 rounded-md border bg-transparent pr-8 pl-2.5 text-left text-sm shadow-xs transition-[color,box-shadow,background-color] outline-none focus-visible:ring-3 data-[state=open]:ring-3"
		>
			<CalendarIcon class="text-muted-foreground size-4 shrink-0" />
			{#if rotulo}
				<span class="truncate tabular-nums">{rotulo}</span>
			{:else}
				<span class="text-muted-foreground truncate">{placeholder}</span>
			{/if}
		</Popover.Trigger>
		<Popover.Portal>
			<Popover.Content
				sideOffset={6}
				align="start"
				class="bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 z-50 rounded-lg border p-3 shadow-md outline-none"
			>
				{#if mode === 'month'}
					<div class="w-64">
						<div class="mb-3 flex items-center justify-between">
							<button type="button" class="hover:bg-accent text-muted-foreground hover:text-foreground flex size-7 items-center justify-center rounded-md" onclick={() => ano--} aria-label="Ano anterior">
								<ChevronLeftIcon class="size-4" />
							</button>
							<span class="text-sm font-medium tabular-nums">{ano}</span>
							<button type="button" class="hover:bg-accent text-muted-foreground hover:text-foreground flex size-7 items-center justify-center rounded-md" onclick={() => ano++} aria-label="Próximo ano">
								<ChevronRightIcon class="size-4" />
							</button>
						</div>
						<div class="grid grid-cols-3 gap-1">
							{#each meses as mes, i (mes)}
								{@const chave = `${ano}-${String(i + 1).padStart(2, '0')}`}
								{@const atual = ano === hoje.year && i + 1 === hoje.month}
								<button
									type="button"
									onclick={() => escolherMes(i + 1)}
									aria-pressed={value === chave}
									class={cn(
										'hover:bg-accent h-9 rounded-md text-sm transition-colors',
										atual && 'text-primary font-medium',
										value === chave && 'bg-primary text-primary-foreground hover:bg-primary/90'
									)}
								>
									{mes.slice(0, 3)}
								</button>
							{/each}
						</div>
					</div>
				{:else}
					<Calendar.Root type="single" value={data} onValueChange={escolherData} locale="pt-BR" weekdayFormat="short" fixedWeeks class="w-64">
						{#snippet children({ months, weekdays })}
							<Calendar.Header class="mb-3 flex items-center justify-between">
								<Calendar.PrevButton class="hover:bg-accent text-muted-foreground hover:text-foreground flex size-7 items-center justify-center rounded-md">
									<ChevronLeftIcon class="size-4" />
								</Calendar.PrevButton>
								<Calendar.Heading class="text-sm font-medium first-letter:uppercase" />
								<Calendar.NextButton class="hover:bg-accent text-muted-foreground hover:text-foreground flex size-7 items-center justify-center rounded-md">
									<ChevronRightIcon class="size-4" />
								</Calendar.NextButton>
							</Calendar.Header>
							{#each months as month (month.value.toString())}
								<Calendar.Grid class="w-full border-collapse">
									<Calendar.GridHead>
										<Calendar.GridRow class="flex">
											{#each weekdays as dia, i (i)}
												<Calendar.HeadCell class="text-muted-foreground w-9 pb-1 text-[11px] font-normal capitalize">{dia.slice(0, 3).replace('.', '')}</Calendar.HeadCell>
											{/each}
										</Calendar.GridRow>
									</Calendar.GridHead>
									<Calendar.GridBody>
										{#each month.weeks as semana, i (i)}
											<Calendar.GridRow class="flex">
												{#each semana as dia (dia.toString())}
													<Calendar.Cell date={dia} month={month.value} class="p-0">
														<Calendar.Day
															class="hover:bg-accent data-today:text-primary data-today:font-semibold data-selected:bg-primary data-selected:text-primary-foreground data-selected:hover:bg-primary/90 data-outside-month:text-muted-foreground/50 flex size-9 items-center justify-center rounded-md text-sm tabular-nums transition-colors"
														/>
													</Calendar.Cell>
												{/each}
											</Calendar.GridRow>
										{/each}
									</Calendar.GridBody>
								</Calendar.Grid>
							{/each}
						{/snippet}
					</Calendar.Root>
				{/if}
				<div class="mt-3 flex justify-between border-t pt-3">
					<button type="button" class:invisible={!clearable} class="text-muted-foreground hover:text-foreground text-xs" onclick={() => ((value = ''), (open = false))}>Limpar</button>
					<button
						type="button"
						class="text-primary text-xs font-medium hover:underline"
						onclick={() => (mode === 'month' ? ((ano = hoje.year), escolherMes(hoje.month)) : escolherData(hoje))}
					>
						{mode === 'month' ? 'Este mês' : 'Hoje'}
					</button>
				</div>
			</Popover.Content>
		</Popover.Portal>
	</Popover.Root>
	{#if value && clearable && !disabled}
		<button
			type="button"
			class="text-muted-foreground hover:text-foreground hover:bg-accent absolute top-1/2 right-1.5 flex size-6 -translate-y-1/2 items-center justify-center rounded"
			onclick={limpar}
			aria-label="Limpar filtro"
		>
			<XIcon class="size-3.5" />
		</button>
	{/if}
</div>

<script lang="ts">
	import { Select } from 'bits-ui';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import CheckIcon from '@lucide/svelte/icons/check';
	import XIcon from '@lucide/svelte/icons/x';
	import PriorityLabel from '#lib/components/priority-label.svelte';
	import { cn } from '#lib/utils.js';
	import { priorities, type Priority } from '#lib/domain.js';

	let { id, name, value = $bindable(''), class: className }: { id: string; name: string; value?: string; class?: string } = $props();

	function limpar() {
		value = '';
		document.getElementById(id)?.focus();
	}
</script>

<input type="hidden" {name} {value} />

<div class={cn('relative', className)}>
	<Select.Root type="single" bind:value>
		<Select.Trigger
			{id}
			class="border-input dark:bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 hover:bg-muted/40 data-[state=open]:border-ring data-[state=open]:ring-ring/50 flex h-9 w-full items-center gap-2 rounded-md border bg-transparent pr-8 pl-2.5 text-left text-sm shadow-xs transition-[color,box-shadow,background-color] outline-none focus-visible:ring-3 data-[state=open]:ring-3"
		>
			{#if value}
				<PriorityLabel priority={value as Priority} />
			{:else}
				<span class="text-muted-foreground truncate">Qualquer prioridade</span>
			{/if}
			{#if !value}<ChevronsUpDownIcon class="text-muted-foreground absolute right-2.5 size-4" />{/if}
		</Select.Trigger>
		<Select.Portal>
			<Select.Content
				sideOffset={6}
				align="start"
				class="bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 z-50 w-(--bits-select-anchor-width) min-w-44 rounded-lg border p-1 shadow-md outline-none"
			>
				<Select.Viewport>
					{#each priorities as prioridade (prioridade)}
						<Select.Item
							value={prioridade}
							label={prioridade}
							class="data-highlighted:bg-accent flex h-9 cursor-pointer items-center justify-between gap-2 rounded-md px-2 text-sm outline-none select-none"
						>
							{#snippet children({ selected })}
								<PriorityLabel priority={prioridade} />
								<CheckIcon class={cn('text-primary size-4', !selected && 'invisible')} />
							{/snippet}
						</Select.Item>
					{/each}
				</Select.Viewport>
			</Select.Content>
		</Select.Portal>
	</Select.Root>
	{#if value}
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

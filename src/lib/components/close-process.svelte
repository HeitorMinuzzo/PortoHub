<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import * as Dialog from '#lib/components/ui/dialog/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import CheckCheckIcon from '@lucide/svelte/icons/check-check';
	import LoaderIcon from '@lucide/svelte/icons/loader-circle';

	let { id, number, action = '?/close' }: { id: number; number: string; action?: string } = $props();

	let open = $state(false);
	let busy = $state(false);
	let error = $state('');
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="outline"><CheckCheckIcon />Encerrar processo</Button>
		{/snippet}
	</Dialog.Trigger>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Encerrar processo?</Dialog.Title>
			<Dialog.Description>
				O processo <strong class="text-foreground">{number}</strong> ficará marcado como encerrado e não poderá mais ser editado. Os dados continuam disponíveis para consulta.
			</Dialog.Description>
		</Dialog.Header>
		{#if error}<p class="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm" role="alert">{error}</p>{/if}
		<form
			method="POST"
			{action}
			use:enhance={() => {
				busy = true;
				error = '';
				return async ({ result, update }) => {
					busy = false;
					if (result.type === 'failure') {
						error = String(result.data?.error ?? 'Não foi possível encerrar.');
					} else {
						open = false;
						toast.success(`Processo ${number} encerrado`);
						await update();
					}
				};
			}}
		>
			<input type="hidden" name="id" value={id} />
			<Dialog.Footer>
				<Button variant="outline" onclick={() => (open = false)} disabled={busy}>Cancelar</Button>
				<Button type="submit" disabled={busy}>
					{#if busy}<LoaderIcon class="animate-spin" />{:else}<CheckCheckIcon />{/if}
					Encerrar processo
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

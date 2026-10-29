<script lang="ts">
	import { enhance } from '$app/forms';
	import { CheckCheck, LoaderCircle } from '@lucide/svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Dialog from '#lib/components/ui/dialog/index.js';
	let { id, number, action = '?/close' }: { id: number; number: string; action?: string } = $props();
	let open = $state(false);
	let busy = $state(false);
	let error = $state('');
</script>
<Dialog.Root bind:open>
	<Dialog.Trigger class="close-process-trigger"><CheckCheck size={16} aria-hidden="true"/>Encerrar processo</Dialog.Trigger>
	<Dialog.Content class="confirm-dialog">
		<div class="dialog-symbol"><CheckCheck size={25} strokeWidth={1.5} aria-hidden="true"/></div>
		<Dialog.Header><Dialog.Title class="dialog-title">Encerrar processo?</Dialog.Title><Dialog.Description>O processo <strong>{number}</strong> ficará marcado como encerrado e disponível para consulta.</Dialog.Description></Dialog.Header>
		{#if error}<p class="form-error" role="alert">{error}</p>{/if}
		<form method="POST" {action} use:enhance={() => { busy = true; error = ''; return async ({ result, update }) => { busy = false; if (result.type === 'failure') { error = String(result.data?.error ?? 'Não foi possível encerrar.'); } else { open = false; await update(); } }; }}>
			<input type="hidden" name="id" value={id}/>
			<Dialog.Footer><Button variant="outline" onclick={() => open = false} disabled={busy}>Cancelar</Button><Button type="submit" disabled={busy}>{#if busy}<LoaderCircle size={16} class="spin" aria-hidden="true"/>{/if}Encerrar processo</Button></Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

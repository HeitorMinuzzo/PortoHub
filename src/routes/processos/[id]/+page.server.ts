import { error, redirect } from '@sveltejs/kit';
import { getStore } from '#lib/server/runtime-store.js';
import { parseProcess, id } from '#lib/server/validation.js';
import { actionError } from '#lib/server/action-error.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, platform }) => {
	const store = getStore(platform);
	const processId = Number(params.id);
	const process = Number.isSafeInteger(processId) ? await store.getProcess(processId) : undefined;
	if (!process) error(404, 'Processo não encontrado.');
	return { process, clients: await store.clients() };
};
export const actions: Actions = {
	save: async ({ request, params, platform }) => {
		const store = getStore(platform);
		const data = await request.formData();
		try { await store.saveProcess(parseProcess(data), id(params.id)); }
		catch (error) { return actionError(error, Object.fromEntries(data)); }
		redirect(303, `/processos/${params.id}?saved=1`);
	},
	close: async ({ params, platform }) => {
		const store = getStore(platform);
		try { await store.closeProcess(id(params.id)); }
		catch (error) { return actionError(error, {}); }
		redirect(303, `/processos/${params.id}`);
	}
};

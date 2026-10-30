import { error, redirect } from '@sveltejs/kit';
import { store } from '#lib/server/db.js';
import { parseProcess, id } from '#lib/server/validation.js';
import { actionError } from '#lib/server/action-error.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	const processId = Number(params.id);
	const process = Number.isSafeInteger(processId) ? store.getProcess(processId) : undefined;
	if (!process) error(404, 'Processo não encontrado.');
	return { process, clients: store.clients() };
};
export const actions: Actions = {
	save: async ({ request, params }) => {
		const data = await request.formData();
		try { store.saveProcess(parseProcess(data), id(params.id)); }
		catch (error) { return actionError(error, Object.fromEntries(data)); }
		redirect(303, `/processos/${params.id}?saved=1`);
	},
	close: async ({ params }) => {
		try { store.closeProcess(id(params.id)); }
		catch (error) { return actionError(error, {}); }
		redirect(303, `/processos/${params.id}`);
	}
};

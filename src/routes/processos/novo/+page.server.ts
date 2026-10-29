import { redirect } from '@sveltejs/kit';
import { store } from '#lib/server/db.js';
import { parseProcess } from '#lib/server/validation.js';
import { actionError } from '#lib/server/action-error.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({ clients: store.clients() });
export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		let processId: number;
		try { processId = store.saveProcess(parseProcess(data)); }
		catch (error) { return actionError(error, Object.fromEntries(data)); }
		redirect(303, `/processos/${processId}?saved=1`);
	}
};

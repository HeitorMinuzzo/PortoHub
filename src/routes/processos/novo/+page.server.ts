import { redirect } from '@sveltejs/kit';
import { getStore } from '#lib/server/runtime-store.js';
import { parseProcess } from '#lib/server/validation.js';
import { actionError } from '#lib/server/action-error.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => ({ clients: await getStore(platform).clients() });
export const actions: Actions = {
	default: async ({ request, platform }) => {
		const store = getStore(platform);
		const data = await request.formData();
		let processId: number;
		try { processId = await store.saveProcess(parseProcess(data)); }
		catch (error) { return actionError(error, Object.fromEntries(data)); }
		redirect(303, `/processos/${processId}?saved=1`);
	}
};

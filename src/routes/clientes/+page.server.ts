import { store } from '#lib/server/db.js';
import { parseClient, id } from '#lib/server/validation.js';
import { actionError } from '#lib/server/action-error.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({ clients: store.clients() });
export const actions: Actions = {
	save: async ({ request }) => {
		const data = await request.formData();
		const values = Object.fromEntries(data);
		try {
			store.saveClient(parseClient(data), data.get('id') ? id(data.get('id')) : undefined);
			return { success: 'Cliente salvo.' };
		} catch (error) { return actionError(error, values); }
	}
};

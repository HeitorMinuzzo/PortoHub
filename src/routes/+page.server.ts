import { store } from '#lib/server/db.js';
import { actionError } from '#lib/server/action-error.js';
import { id } from '#lib/server/validation.js';
import { priorities } from '#lib/domain.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ url }) => {
	const status = ['open', 'closed'].includes(url.searchParams.get('status') ?? '') ? url.searchParams.get('status')! : 'all';
	const month = url.searchParams.get('month') ?? '';
	const arrival = url.searchParams.get('arrival') ?? '';
	const priority = (priorities as readonly string[]).includes(url.searchParams.get('priority') ?? '') ? url.searchParams.get('priority')! : '';
	return { processes: store.processes({ status, month, arrival, priority }), counts: store.counts(), clientCount: store.clients().length, filters: { status, month, arrival, priority } };
};
export const actions: Actions = {
	close: async ({ request }) => {
		const data = await request.formData();
		try { store.closeProcess(id(data.get('id'))); return { success: 'Processo encerrado.' }; }
		catch (error) { return actionError(error, {}); }
	}
};

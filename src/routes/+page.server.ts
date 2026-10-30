import { getStore } from '#lib/server/runtime-store.js';
import { actionError } from '#lib/server/action-error.js';
import { id } from '#lib/server/validation.js';
import { priorities } from '#lib/domain.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, platform }) => {
	const store = getStore(platform);
	const status = ['open', 'closed'].includes(url.searchParams.get('status') ?? '') ? url.searchParams.get('status')! : 'all';
	const month = url.searchParams.get('month') ?? '';
	const arrival = url.searchParams.get('arrival') ?? '';
	const priority = (priorities as readonly string[]).includes(url.searchParams.get('priority') ?? '') ? url.searchParams.get('priority')! : '';
	return { processes: await store.processes({ status, month, arrival, priority }), counts: await store.counts(), clientCount: (await store.clients()).length, filters: { status, month, arrival, priority } };
};
export const actions: Actions = {
	close: async ({ request, platform }) => {
		const store = getStore(platform);
		const data = await request.formData();
		try { await store.closeProcess(id(data.get('id'))); return { success: 'Processo encerrado.' }; }
		catch (error) { return actionError(error, {}); }
	}
};

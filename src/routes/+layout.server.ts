import { store } from '#lib/server/db.js';

export function load() {
	return { counts: store.counts(), clientCount: store.clients().length };
}

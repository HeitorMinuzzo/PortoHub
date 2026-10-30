import { store } from '#lib/server/db.js';

export function load() {
	return { demo: process.env.PORTOHUB_DEMO === '1', counts: store.counts(), clientCount: store.clients().length };
}

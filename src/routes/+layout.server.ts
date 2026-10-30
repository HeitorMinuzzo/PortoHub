import { getStore } from '#lib/server/runtime-store.js';

export async function load({ platform }: { platform?: App.Platform }) {
	const store = getStore(platform);
	return { counts: await store.counts(), clientCount: (await store.clients()).length };
}

import { store } from './db.js';

export function getStore(_platform?: App.Platform) {
	return store;
}

import { createD1Store } from './d1-store.js';
import { env } from 'cloudflare:workers';

export function getStore(_platform?: App.Platform) {
	if (!env.DB) throw new Error('O banco de dados da hospedagem não está configurado.');
	return createD1Store(env.DB);
}

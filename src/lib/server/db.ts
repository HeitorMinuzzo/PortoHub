import { resolve } from 'node:path';
import { createStore } from './store.ts';

export const store = createStore(process.env.PORTOHUB_DB_PATH || resolve('data/portohub.sqlite'));

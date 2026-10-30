import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { createD1Store, type D1Database } from '../src/lib/server/d1-store.ts';
import { emptyProcess } from '../src/lib/domain.ts';
import { ValidationError } from '../src/lib/server/validation.ts';

function fixture() {
	const db = new DatabaseSync(':memory:');
	db.exec('PRAGMA foreign_keys = ON');
	db.exec(readFileSync(new URL('../drizzle/0000_portohub.sql', import.meta.url), 'utf8'));
	// A API assíncrona do D1 usa as mesmas consultas e o esquema real da migração.
	const binding: D1Database = {
		prepare(sql) {
			let values: (string | number | null)[] = [];
			return {
				bind(...input) { values = input; return this; },
				async first<T>() { return (db.prepare(sql).get(...values) as T) ?? null; },
				async all<T>() { return { results: db.prepare(sql).all(...values) as T[] }; },
				async run() { const result = db.prepare(sql).run(...values); return { meta: { changes: Number(result.changes), last_row_id: Number(result.lastInsertRowid) } }; }
			};
		}
	};
	return { db, store: createD1Store(binding) };
}

test('D1: cadastro, atualização, filtros e encerramento usam a migração de hospedagem', async () => {
	const { db, store } = fixture();
	try {
		const clientId = await store.saveClient({ name: 'Cliente teste', cnpj: '12345678901', contact: 'teste@example.com' });
		const input = { ...emptyProcess(), number: 'PUB-001', clientId, openedAt: '2026-10-30', arrivalDate: '2026-11-04', priority: 'alta' as const };
		const processId = await store.saveProcess(input);
		await store.saveClient({ name: 'Cliente atualizado', cnpj: '12345678901', contact: 'teste@example.com' }, clientId);
		await store.saveProcess({ ...input, reference: 'REF-001' }, processId);
		assert.equal((await store.getProcess(processId))?.clientName, 'Cliente atualizado');
		assert.equal((await store.getProcess(processId))?.reference, 'REF-001');
		assert.equal((await store.processes({ month: '2026-10', arrival: '2026-11-04', priority: 'alta' })).length, 1);
		assert.equal((await store.processes({ priority: 'media' })).length, 0);
		await store.closeProcess(processId);
		assert.deepEqual({ ...await store.counts() }, { total: 1, open: 0, closed: 1 });
		assert.equal((await store.processes({ status: 'open' })).length, 0);
		assert.equal((await store.processes({ status: 'closed' })).length, 1);
		await assert.rejects(store.saveProcess(input, processId), ValidationError);
		await assert.rejects(store.closeProcess(processId), ValidationError);
	} finally { db.close(); }
});

test('D1: preserva unicidade e valida o vínculo com o cliente', async () => {
	const { db, store } = fixture();
	try {
		const client = { name: 'Cliente', cnpj: '12345678901', contact: 'Teste' };
		const concurrent = await Promise.allSettled([store.saveClient(client), store.saveClient(client)]);
		assert.equal(concurrent.filter(r => r.status === 'fulfilled').length, 1);
		const rejected = concurrent.find(r => r.status === 'rejected');
		assert.ok(rejected?.status === 'rejected' && rejected.reason instanceof ValidationError);
		const input = { ...emptyProcess(), number: 'PUB-002', clientId: (await store.clients())[0].id };
		await store.saveProcess(input);
		await assert.rejects(store.saveProcess({ ...input, number: 'pub-002' }), ValidationError);
		await assert.rejects(store.saveProcess({ ...input, number: 'PUB-003', clientId: 9999 }), ValidationError);
	} finally { db.close(); }
});

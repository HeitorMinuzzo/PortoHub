import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createStore } from '../src/lib/server/store.ts';
import { parseClient, parseProcess, ValidationError } from '../src/lib/server/validation.ts';
import { emptyProcess, formatDate } from '../src/lib/domain.ts';

function fixture() {
	const store = createStore(':memory:');
	const clientId = store.saveClient({ name: 'Empresa de teste', cnpj: '00000000000191', contact: 'Contato de teste' });
	const input = { ...emptyProcess(), number: 'IMP-001', clientId, openedAt: '2026-10-29', departureDate: '2026-10-30', arrivalDate: '2026-11-05' };
	return { store, clientId, input };
}
test('exibe datas de encerramento no fuso de São Paulo e mantém datas sem horário', () => {
	assert.equal(formatDate('2026-10-30T01:00:00Z'), '29/10/2026');
	assert.equal(formatDate('2026-10-30'), '30/10/2026');
});
test('grava clientes e processos e mantém os dados depois de reabrir o banco', () => {
	const directory = mkdtempSync(join(tmpdir(), 'portohub-test-'));
	const filename = join(directory, 'test.sqlite');
	try {
		const first = createStore(filename);
		const clientId = first.saveClient({ name: 'Persistência', cnpj: '00000000000191', contact: 'Teste' });
		const processId = first.saveProcess({ ...emptyProcess(), clientId, number: 'P-001' });
		first.close();
		const second = createStore(filename);
		try { assert.equal(second.getProcess(processId)?.clientName, 'Persistência'); assert.equal(second.clients().length, 1); }
		finally { second.close(); }
	} finally { rmSync(directory, { recursive: true, force: true }); }
});
test('impede CNPJ e número de processo duplicados e aceita editar o próprio registro', () => {
	const { store, input, clientId } = fixture();
	try {
		assert.throws(() => store.saveClient({ name: 'Outra', cnpj: '00000000000191', contact: 'Teste' }), ValidationError);
		store.saveClient({ name: 'Atualizada', cnpj: '00000000000191', contact: 'Novo' }, clientId);
		const processId = store.saveProcess(input);
		assert.throws(() => store.saveProcess({ ...input, number: 'imp-001' }), ValidationError);
		store.saveProcess({ ...input, reference: 'REF-2' }, processId);
		assert.equal(store.getProcess(processId)?.reference, 'REF-2');
	} finally { store.close(); }
});
test('filtra mês de abertura e data de chegada de forma independente e combinada', () => {
	const { store, input } = fixture();
	try {
		store.saveProcess(input);
		store.saveProcess({ ...input, number: 'IMP-002', openedAt: '2026-09-29' });
		assert.equal(store.processes({ month: '2026-10' }).length, 1);
		assert.equal(store.processes({ arrival: '2026-11-05' }).length, 2);
		assert.equal(store.processes({ month: '2026-10', arrival: '2026-11-05' }).length, 1);
		assert.equal(store.processes({ month: "' OR 1=1 --" }).length, 0);
	} finally { store.close(); }
});
test('encerra sem excluir e preserva os dados para consulta', () => {
	const { store, input } = fixture();
	try {
		const processId = store.saveProcess(input);
		store.closeProcess(processId);
		assert.ok(store.getProcess(processId)?.closedAt);
		assert.deepEqual({ ...store.counts() }, { total: 1, open: 0, closed: 1 });
		assert.equal(store.processes({ status: 'closed' }).length, 1);
		assert.equal(store.processes({ status: 'open' }).length, 0);
		assert.throws(() => store.saveProcess(input, processId), ValidationError);
		assert.throws(() => store.closeProcess(processId), ValidationError);
	} finally { store.close(); }
});
test('não aceita processo para cliente inexistente', () => {
	const { store, input } = fixture();
	try { assert.throws(() => store.saveProcess({ ...input, clientId: 999 }), ValidationError); }
	finally { store.close(); }
});
test('normaliza o CNPJ sem descartar caracteres inválidos silenciosamente', () => {
	const data = new FormData();
	data.set('name', ' Empresa '); data.set('cnpj', '00.000.000/0001-91'); data.set('contact', 'Contato');
	assert.equal(parseClient(data).cnpj, '00000000000191');
	data.set('cnpj', '12.ABC.345/01DE-35');
	assert.equal(parseClient(data).cnpj, '12ABC34501DE35');
	data.set('cnpj', '00!000000000191');
	assert.throws(() => parseClient(data), ValidationError);
});
test('valida datas, sequência do transporte e opções recebidas no servidor', () => {
	const { store, input } = fixture();
	try {
		const data = new FormData();
		Object.entries(input).forEach(([key, value]) => data.set(key, String(value)));
		assert.equal(parseProcess(data).number, input.number);
		data.set('arrivalDate', '2026-02-30'); assert.throws(() => parseProcess(data), ValidationError);
		data.set('arrivalDate', '2026-10-01'); assert.throws(() => parseProcess(data), ValidationError);
		data.set('arrivalDate', ''); data.set('departureDate', ''); assert.equal(parseProcess(data).arrivalDate, '');
		data.set('mode', 'inventado'); assert.throws(() => parseProcess(data), ValidationError);
	} finally { store.close(); }
});

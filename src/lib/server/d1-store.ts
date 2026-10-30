import type { Client, ProcessFilters, ProcessInput, ProcessRecord } from '../domain.ts';
import { ValidationError } from './validation.ts';

type Value = string | number | null;
export interface D1Statement {
	bind(...values: Value[]): D1Statement;
	first<T>(): Promise<T | null>;
	all<T>(): Promise<{ results: T[] }>;
	run(): Promise<{ meta: { changes: number; last_row_id: number } }>;
}
export interface D1Database { prepare(sql: string): D1Statement }

/** Usa o banco D1 da hospedagem. O esquema é aplicado pelas migrações, antes da publicação. */
export function createD1Store(db: D1Database) {
	const columns = ['number', 'clientId', 'openedAt', 'reference', 'operation', 'mode', 'priority', 'exporter', 'agent', 'agentReference', 'carrier', 'vessel', 'origin', 'destination', 'departureDate', 'arrivalDate'] as const;
	const select = 'SELECT p.*, c.name AS clientName, c.cnpj AS clientCnpj FROM processes p JOIN clients c ON c.id = p.clientId';
	const statement = (sql: string, ...values: Value[]) => db.prepare(sql).bind(...values);
	const getClient = (clientId: number) => statement('SELECT * FROM clients WHERE id = ?', clientId).first<Client>();
	const getProcess = (processId: number) => statement(`${select} WHERE p.id = ?`, processId).first<ProcessRecord>();
	async function write(sql: string, values: Value[], field: 'cnpj' | 'number') {
		try { return await statement(sql, ...values).run(); }
		catch (error) {
			if (String(error).includes('UNIQUE constraint failed')) {
				throw new ValidationError(field, field === 'cnpj' ? 'Já existe um cliente com este CPF/CNPJ.' : 'Já existe um processo com este número.');
			}
			throw error;
		}
	}
	return {
		async clients() { return (await statement('SELECT * FROM clients ORDER BY name COLLATE NOCASE').all<Client>()).results; },
		getClient,
		async saveClient(input: Omit<Client, 'id'>, clientId?: number) {
			const duplicate = await statement('SELECT id FROM clients WHERE cnpj = ? AND id != ?', input.cnpj, clientId ?? 0).first();
			if (duplicate) throw new ValidationError('cnpj', 'Já existe um cliente com este CPF/CNPJ.');
			if (clientId) {
				if (!await getClient(clientId)) throw new ValidationError('id', 'Cliente não encontrado.');
				await write('UPDATE clients SET name = ?, cnpj = ?, contact = ? WHERE id = ?', [input.name, input.cnpj, input.contact, clientId], 'cnpj');
				return clientId;
			}
			const result = await write('INSERT INTO clients (name, cnpj, contact) VALUES (?, ?, ?)', [input.name, input.cnpj, input.contact], 'cnpj');
			return Number(result.meta.last_row_id);
		},
		getProcess,
		async processes(filters: ProcessFilters = {}) {
			const where: string[] = [];
			const values: string[] = [];
			if (filters.status === 'open') where.push('p.closedAt IS NULL');
			if (filters.status === 'closed') where.push('p.closedAt IS NOT NULL');
			if (filters.month) { where.push('substr(p.openedAt, 1, 7) = ?'); values.push(filters.month); }
			if (filters.arrival) { where.push('p.arrivalDate = ?'); values.push(filters.arrival); }
			if (filters.priority) { where.push('p.priority = ?'); values.push(filters.priority); }
			return (await statement(`${select}${where.length ? ' WHERE ' + where.join(' AND ') : ''} ORDER BY p.openedAt DESC, p.id DESC`, ...values).all<ProcessRecord>()).results;
		},
		async counts() {
			return (await statement('SELECT count(*) AS total, count(*) FILTER (WHERE closedAt IS NULL) AS open, count(*) FILTER (WHERE closedAt IS NOT NULL) AS closed FROM processes').first<{ total: number; open: number; closed: number }>())!;
		},
		async saveProcess(input: ProcessInput, processId?: number) {
			if (!await getClient(input.clientId)) throw new ValidationError('clientId', 'Selecione um cliente cadastrado.');
			const duplicate = await statement('SELECT id FROM processes WHERE number = ? COLLATE NOCASE AND id != ?', input.number, processId ?? 0).first();
			if (duplicate) throw new ValidationError('number', 'Já existe um processo com este número.');
			if (processId) {
				const existing = await getProcess(processId);
				if (!existing) throw new ValidationError('id', 'Processo não encontrado.');
				if (existing.closedAt) throw new ValidationError('id', 'Este processo já está encerrado.');
				const result = await write(`UPDATE processes SET ${columns.map(c => `${c} = ?`).join(', ')} WHERE id = ? AND closedAt IS NULL`, [...columns.map(c => input[c]), processId], 'number');
				if (!result.meta.changes) throw new ValidationError('id', 'Este processo já está encerrado.');
				return processId;
			}
			const result = await write(`INSERT INTO processes (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`, columns.map(c => input[c]), 'number');
			return Number(result.meta.last_row_id);
		},
		async closeProcess(processId: number) {
			const existing = await getProcess(processId);
			if (!existing) throw new ValidationError('id', 'Processo não encontrado.');
			if (existing.closedAt) throw new ValidationError('id', 'Este processo já está encerrado.');
			const result = await statement('UPDATE processes SET closedAt = ? WHERE id = ? AND closedAt IS NULL', new Date().toISOString(), processId).run();
			if (!result.meta.changes) throw new ValidationError('id', 'Este processo já está encerrado.');
		}
	};
}

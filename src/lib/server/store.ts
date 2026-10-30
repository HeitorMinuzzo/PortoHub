import { DatabaseSync } from 'node:sqlite';
import { dirname } from 'node:path';
import { mkdirSync } from 'node:fs';
import type { Client, ProcessFilters, ProcessInput, ProcessRecord } from '../domain.ts';
import { ValidationError } from './validation.ts';

const processesTable = (name: string) => `CREATE TABLE IF NOT EXISTS ${name} (
	id INTEGER PRIMARY KEY, number TEXT NOT NULL COLLATE NOCASE UNIQUE,
	clientId INTEGER NOT NULL REFERENCES clients(id), openedAt TEXT NOT NULL,
	reference TEXT NOT NULL DEFAULT '', operation TEXT NOT NULL CHECK(operation IN ('importacao','exportacao')),
	mode TEXT NOT NULL CHECK(mode IN ('maritimo','aereo','rodoviario')),
	priority TEXT NOT NULL CHECK(priority IN ('normal','media','alta','urgente')),
	exporter TEXT NOT NULL DEFAULT '', agent TEXT NOT NULL DEFAULT '', agentReference TEXT NOT NULL DEFAULT '',
	carrier TEXT NOT NULL DEFAULT '', vessel TEXT NOT NULL DEFAULT '', origin TEXT NOT NULL DEFAULT '',
	destination TEXT NOT NULL DEFAULT '', departureDate TEXT NOT NULL DEFAULT '', arrivalDate TEXT NOT NULL DEFAULT '',
	closedAt TEXT
) STRICT;`;

export function createStore(filename: string) {
	if (filename !== ':memory:') mkdirSync(dirname(filename), { recursive: true });
	const db = new DatabaseSync(filename);
	db.exec(`
		PRAGMA foreign_keys = ON;
		PRAGMA journal_mode = WAL;
		PRAGMA busy_timeout = 5000;
		CREATE TABLE IF NOT EXISTS clients (
			id INTEGER PRIMARY KEY, name TEXT NOT NULL, cnpj TEXT NOT NULL UNIQUE, contact TEXT NOT NULL
		) STRICT;
		${processesTable('processes')}
		CREATE INDEX IF NOT EXISTS processes_opened ON processes(openedAt);
		CREATE INDEX IF NOT EXISTS processes_arrival ON processes(arrivalDate);
	`);
	// Bancos antigos só aceitavam normal/urgente: recria a tabela com as novas prioridades
	const atual = db.prepare("SELECT sql FROM sqlite_master WHERE name = 'processes'").get() as { sql: string };
	if (!atual.sql.includes("'media'")) {
		db.exec(`
			PRAGMA foreign_keys = OFF;
			BEGIN;
			${processesTable('processes_new')}
			INSERT INTO processes_new SELECT * FROM processes;
			DROP TABLE processes;
			ALTER TABLE processes_new RENAME TO processes;
			CREATE INDEX processes_opened ON processes(openedAt);
			CREATE INDEX processes_arrival ON processes(arrivalDate);
			COMMIT;
			PRAGMA foreign_keys = ON;
		`);
	}
	const columns = ['number','clientId','openedAt','reference','operation','mode','priority','exporter','agent','agentReference','carrier','vessel','origin','destination','departureDate','arrivalDate'] as const;
	const select = 'SELECT p.*, c.name AS clientName, c.cnpj AS clientCnpj FROM processes p JOIN clients c ON c.id = p.clientId';
	function getClient(clientId: number) {
		return db.prepare('SELECT * FROM clients WHERE id = ?').get(clientId) as Client | undefined;
	}
	function getProcess(processId: number) {
		return db.prepare(`${select} WHERE p.id = ?`).get(processId) as ProcessRecord | undefined;
	}
	return {
		close: () => db.close(),
		clients: () => db.prepare('SELECT * FROM clients ORDER BY name COLLATE NOCASE').all() as Client[],
		getClient,
		saveClient(input: Omit<Client, 'id'>, clientId?: number) {
			const duplicate = db.prepare('SELECT id FROM clients WHERE cnpj = ? AND id != ?').get(input.cnpj, clientId ?? 0);
			if (duplicate) throw new ValidationError('cnpj', 'Já existe um cliente com este CNPJ.');
			if (clientId) {
				if (!getClient(clientId)) throw new ValidationError('id', 'Cliente não encontrado.');
				db.prepare('UPDATE clients SET name = ?, cnpj = ?, contact = ? WHERE id = ?').run(input.name, input.cnpj, input.contact, clientId);
				return clientId;
			}
			return Number(db.prepare('INSERT INTO clients (name, cnpj, contact) VALUES (?, ?, ?)').run(input.name, input.cnpj, input.contact).lastInsertRowid);
		},
		getProcess,
		processes(filters: ProcessFilters = {}) {
			const where: string[] = [];
			const values: string[] = [];
			if (filters.status === 'open') where.push('p.closedAt IS NULL');
			if (filters.status === 'closed') where.push('p.closedAt IS NOT NULL');
			if (filters.month) { where.push('substr(p.openedAt, 1, 7) = ?'); values.push(filters.month); }
			if (filters.arrival) { where.push('p.arrivalDate = ?'); values.push(filters.arrival); }
			if (filters.priority) { where.push('p.priority = ?'); values.push(filters.priority); }
			return db.prepare(`${select}${where.length ? ' WHERE ' + where.join(' AND ') : ''} ORDER BY p.openedAt DESC, p.id DESC`).all(...values) as ProcessRecord[];
		},
		counts() {
			return db.prepare('SELECT count(*) AS total, count(*) FILTER (WHERE closedAt IS NULL) AS open, count(*) FILTER (WHERE closedAt IS NOT NULL) AS closed FROM processes').get() as { total: number; open: number; closed: number };
		},
		saveProcess(input: ProcessInput, processId?: number) {
			if (!getClient(input.clientId)) throw new ValidationError('clientId', 'Selecione um cliente cadastrado.');
			const duplicate = db.prepare('SELECT id FROM processes WHERE number = ? COLLATE NOCASE AND id != ?').get(input.number, processId ?? 0);
			if (duplicate) throw new ValidationError('number', 'Já existe um processo com este número.');
			if (processId) {
				const existing = getProcess(processId);
				if (!existing) throw new ValidationError('id', 'Processo não encontrado.');
				if (existing.closedAt) throw new ValidationError('id', 'Este processo já está encerrado.');
				db.prepare(`UPDATE processes SET ${columns.map(c => `${c} = ?`).join(', ')} WHERE id = ?`).run(...columns.map(c => input[c]), processId);
				return processId;
			}
			return Number(db.prepare(`INSERT INTO processes (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`).run(...columns.map(c => input[c])).lastInsertRowid);
		},
		closeProcess(processId: number) {
			const existing = getProcess(processId);
			if (!existing) throw new ValidationError('id', 'Processo não encontrado.');
			if (existing.closedAt) throw new ValidationError('id', 'Este processo já está encerrado.');
			db.prepare('UPDATE processes SET closedAt = ? WHERE id = ? AND closedAt IS NULL').run(new Date().toISOString(), processId);
		}
	};
}

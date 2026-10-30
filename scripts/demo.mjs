import { resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { createStore } from '../src/lib/server/store.ts';
import { emptyProcess, today } from '../src/lib/domain.ts';

const filename = resolve('data/demo.sqlite');
const store = createStore(filename);
if (!store.clients().length) {
	const clients = [
		['Aurora Comércio Internacional', '00000000000191', 'Marina · contato@aurora.example'],
		['Vértice Equipamentos', '00000000000272', 'Rafael · (47) 0000-0000'],
		['Costa Sul Alimentos', '00000000000353', 'Fernanda · operacoes@costasul.example'],
		['Orbe Tecnologia', '00000000000434', 'Lucas · contato@orbe.example'],
		['Brava Têxtil', '00000000000515', 'Camila · (47) 0000-0001']
	].map(([name, cnpj, contact]) => store.saveClient({ name, cnpj, contact }));
	const now = today();
	const at = (offset) => { const date = new Date(`${now}T12:00:00Z`); date.setUTCDate(date.getUTCDate() + offset); return date.toISOString().slice(0, 10); };
	const records = [
		{ client: 0, operation: 'importacao', mode: 'maritimo', origin: 'Shanghai, CN', destination: 'Itajaí, BR', departure: -20, arrival: 5, priority: 'urgente', vessel: 'MSC Isabella', carrier: 'MSC' },
		{ client: 1, operation: 'importacao', mode: 'aereo', origin: 'Frankfurt, DE', destination: 'Guarulhos, BR', departure: -2, arrival: 1, priority: 'alta' },
		{ client: 2, operation: 'exportacao', mode: 'maritimo', origin: 'Navegantes, BR', destination: 'Rotterdam, NL', departure: -5, arrival: 15, vessel: 'CMA CGM Marco Polo', carrier: 'CMA CGM' },
		{ client: 3, operation: 'importacao', mode: 'aereo', origin: 'Miami, US', destination: 'Viracopos, BR', departure: -1, arrival: 2, priority: 'urgente' },
		{ client: 4, operation: 'exportacao', mode: 'rodoviario', origin: 'Blumenau, BR', destination: 'Buenos Aires, AR', departure: -3, arrival: 3, priority: 'media' },
		{ client: 0, operation: 'importacao', mode: 'maritimo', origin: 'Ningbo, CN', destination: 'Santos, BR', departure: -12, arrival: 12, vessel: 'Maersk Emerald', carrier: 'Maersk', priority: 'media' },
		{ client: 1, operation: 'importacao', mode: 'maritimo', origin: 'Hamburgo, DE', destination: 'Itajaí, BR', departure: -35, arrival: -3, vessel: 'Hapag-Lloyd Berlin', carrier: 'Hapag-Lloyd', closed: true },
		{ client: 2, operation: 'exportacao', mode: 'rodoviario', origin: 'Joinville, BR', destination: 'Montevidéu, UY', departure: -12, arrival: -8, closed: true }
	];
	records.forEach((record, index) => {
		const prefix = record.operation === 'importacao' ? 'IMP' : 'EXP';
		const processId = store.saveProcess({ ...emptyProcess(), number: `${prefix}-${now.slice(0,4)}/${String(148 - index).padStart(3, '0')}`, clientId: clients[record.client], openedAt: at(-index - 1), reference: `PED-${3100 + index}`, operation: record.operation, mode: record.mode, priority: record.priority ?? 'normal', origin: record.origin, destination: record.destination, departureDate: at(record.departure), arrivalDate: at(record.arrival), vessel: record.vessel ?? '', carrier: record.carrier ?? '', exporter: record.operation === 'exportacao' ? ['Aurora Comércio Internacional', 'Vértice Equipamentos', 'Costa Sul Alimentos', 'Orbe Tecnologia', 'Brava Têxtil'][record.client] : 'Global Trading Co.', agent: 'Atlas Cargo', agentReference: `AT-${7400 + index}` });
		if (record.closed) store.closeProcess(processId);
	});
}
store.close();
console.log('PortoHub · prévia com dados fictícios. Base separada: data/demo.sqlite');
const child = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', ...process.argv.slice(2)], { stdio: 'inherit', env: { ...process.env, PORTOHUB_DB_PATH: filename, PORTOHUB_DEMO: '1' } });
process.on('SIGINT', () => child.kill('SIGINT'));
process.on('SIGTERM', () => child.kill('SIGTERM'));
child.on('exit', code => process.exit(code ?? 0));

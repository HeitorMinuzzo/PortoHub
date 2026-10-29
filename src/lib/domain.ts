export const operations = ['importacao', 'exportacao'] as const;
export const modes = ['maritimo', 'aereo', 'rodoviario'] as const;
export type Operation = (typeof operations)[number];
export type Mode = (typeof modes)[number];
export type Client = { id: number; name: string; cnpj: string; contact: string };
export type ProcessInput = {
	number: string;
	clientId: number;
	openedAt: string;
	reference: string;
	operation: Operation;
	mode: Mode;
	priority: 'normal' | 'urgente';
	exporter: string;
	agent: string;
	agentReference: string;
	carrier: string;
	vessel: string;
	origin: string;
	destination: string;
	departureDate: string;
	arrivalDate: string;
};
export type ProcessRecord = ProcessInput & {
	id: number;
	closedAt: string | null;
	clientName: string;
	clientCnpj: string;
};
export type ProcessFilters = { status?: string; month?: string; arrival?: string };
export const operationLabels: Record<Operation, string> = {
	importacao: 'Importação', exportacao: 'Exportação'
};
export const modeLabels: Record<Mode, string> = {
	maritimo: 'Marítimo', aereo: 'Aéreo', rodoviario: 'Rodoviário'
};
export function formatDate(value: string | null | undefined) {
	if (!value) return '—';
	if (value.includes('T')) return new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo' }).format(new Date(value));
	const [year, month, day] = value.slice(0, 10).split('-');
	return `${day}/${month}/${year}`;
}
export function today() {
	return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
}
export function formatCnpj(value: string) {
	const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
	if (clean.length !== 14) return value;
	return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 8)}/${clean.slice(8, 12)}-${clean.slice(12)}`;
}
export function emptyProcess(): ProcessInput {
	return {
		number: '', clientId: 0, openedAt: today(), reference: '',
		operation: 'importacao', mode: 'maritimo', priority: 'normal',
		exporter: '', agent: '', agentReference: '', carrier: '', vessel: '',
		origin: '', destination: '', departureDate: '', arrivalDate: ''
	};
}

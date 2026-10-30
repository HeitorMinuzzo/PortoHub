import { modes, operations, priorities, type ProcessInput } from '../domain.ts';

export class ValidationError extends Error {
	field: string;
	constructor(field: string, message: string) {
		super(message);
		this.field = field;
	}
}
export function text(data: FormData, key: string, required = false, max = 200) {
	const raw = data.get(key);
	const value = typeof raw === 'string' ? raw.trim() : '';
	if (required && !value) throw new ValidationError(key, 'Preencha este campo.');
	if (value.length > max) throw new ValidationError(key, `Use até ${max} caracteres.`);
	return value;
}
export function id(value: unknown, field = 'id') {
	const parsed = Number(value);
	if (!Number.isSafeInteger(parsed) || parsed < 1) throw new ValidationError(field, 'Selecione um registro válido.');
	return parsed;
}
export function validDate(value: string) {
	return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}
function date(data: FormData, key: string, required = false) {
	const value = text(data, key, required);
	if (value && !validDate(value)) throw new ValidationError(key, 'Informe uma data válida.');
	return value;
}
function choice<T extends string>(data: FormData, key: string, choices: readonly T[]): T {
	const value = text(data, key, true);
	if (!choices.includes(value as T)) throw new ValidationError(key, 'Selecione uma opção válida.');
	return value as T;
}
export function parseClient(data: FormData) {
	const name = text(data, 'name', true);
	const cnpj = text(data, 'cnpj', true).toUpperCase().replace(/[.\s/\-]/g, '');
	if (!/^\d{11}$/.test(cnpj) && !/^[A-Z0-9]{12}\d{2}$/.test(cnpj)) throw new ValidationError('cnpj', 'Informe o CPF (11 dígitos) ou o CNPJ (14 caracteres) completo.');
	const contact = text(data, 'contact', true, 300);
	return { name, cnpj, contact };
}
export function parseProcess(data: FormData): ProcessInput {
	const input: ProcessInput = {
		number: text(data, 'number', true, 60),
		clientId: id(data.get('clientId'), 'clientId'),
		openedAt: date(data, 'openedAt', true),
		reference: text(data, 'reference'),
		operation: choice(data, 'operation', operations),
		mode: choice(data, 'mode', modes),
		priority: choice(data, 'priority', priorities),
		exporter: text(data, 'exporter'), agent: text(data, 'agent'),
		agentReference: text(data, 'agentReference'), carrier: text(data, 'carrier'),
		vessel: text(data, 'vessel'), origin: text(data, 'origin'), destination: text(data, 'destination'),
		departureDate: date(data, 'departureDate'), arrivalDate: date(data, 'arrivalDate')
	};
	if (input.departureDate && input.arrivalDate && input.arrivalDate < input.departureDate) {
		throw new ValidationError('arrivalDate', 'A chegada deve ser na data do embarque ou depois.');
	}
	return input;
}

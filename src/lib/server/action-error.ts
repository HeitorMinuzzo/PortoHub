import { fail } from '@sveltejs/kit';
import { ValidationError } from './validation.ts';

export function actionError(error: unknown, values: Record<string, unknown>) {
	if (error instanceof ValidationError) return fail(400, { error: error.message, field: error.field, values });
	console.error('Não foi possível salvar o registro:', error);
	return fail(500, { error: 'Não foi possível salvar. Tente novamente.', field: '', values });
}

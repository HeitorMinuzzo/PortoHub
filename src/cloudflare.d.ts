declare module 'cloudflare:workers' {
	export const env: { DB?: import('./lib/server/d1-store.ts').D1Database };
}

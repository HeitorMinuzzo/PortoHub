import adapter from '@sveltejs/adapter-node';
import cloudflare from '@sveltejs/adapter-cloudflare';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

const hosted = process.env.PORTOHUB_TARGET === 'cloudflare';

export default defineConfig({
	resolve: {
		alias: hosted ? [{ find: '#lib/server/runtime-store.js', replacement: fileURLToPath(new URL('./src/lib/server/runtime-cloudflare.ts', import.meta.url)) }] : []
	},
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			adapter: hosted ? cloudflare({ config: 'wrangler.jsonc' }) : adapter()
		})
	]
});

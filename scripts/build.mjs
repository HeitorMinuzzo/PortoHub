import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { build } from 'esbuild';

for (const target of process.argv.includes('--hosted-only') ? ['cloudflare'] : ['node', 'cloudflare']) {
	const result = spawnSync(process.execPath, ['node_modules/vite/bin/vite.js', 'build'], {
		stdio: 'inherit', env: { ...process.env, PORTOHUB_TARGET: target }
	});
	if (result.status !== 0) process.exit(result.status ?? 1);
}
await build({
	entryPoints: ['.svelte-kit/cloudflare/_worker.js'], outfile: 'dist/server/index.js',
	bundle: true, format: 'esm', platform: 'neutral', target: 'es2022',
	conditions: ['workerd', 'worker', 'browser'], mainFields: ['module', 'main'],
	external: ['cloudflare:*', 'node:*'], minify: true
});
const worker = readFileSync('dist/server/index.js', 'utf8');
if (worker.includes('node:sqlite')) throw new Error('O Worker não pode incluir o banco local.');
mkdirSync('dist/.openai', { recursive: true });
writeFileSync('dist/.openai/hosting.json', readFileSync('.openai/hosting.json'));
writeFileSync('dist/server/wrangler.json', JSON.stringify({
	name: 'portohub', main: 'index.js', compatibility_date: '2026-05-15',
	compatibility_flags: ['nodejs_compat'], assets: { directory: '../client', binding: 'ASSETS' }
}, null, 2));
console.log('PortoHub: build local em build/ e hospedagem em dist/.');

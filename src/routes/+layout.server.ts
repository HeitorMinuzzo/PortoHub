export function load() {
	return { demo: process.env.PORTOHUB_DEMO === '1' };
}

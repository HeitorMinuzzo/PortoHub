import { createServer } from 'node:http';

// O adapter-node 6 assume HTTPS quando não há uma origem canônica.
// Este servidor local informa o protocolo real por um cabeçalho interno,
// sobrescrito em todas as requisições, sem confiar no valor enviado pelo cliente.
process.env.PROTOCOL_HEADER = 'x-portohub-local-protocol';
const { handler } = await import('../build/handler.js');
const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || 3000);
const server = createServer((request, response) => {
	request.headers['x-portohub-local-protocol'] = 'http';
	handler(request, response);
});
server.listen(port, host, () => console.log(`PortoHub disponível em http://${host}:${port}`));

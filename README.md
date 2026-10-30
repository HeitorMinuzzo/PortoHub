# PortoHub

Controle direto de clientes e processos de importação e exportação.

## Funcionalidades

- Clientes com nome ou razão social, CPF ou CNPJ e contato; cadastro e edição.
- Processos vinculados a clientes, com todos os campos solicitados: número manual, abertura, referência do cliente, operação, modal, prioridade, exportador, agente de carga, processo do agente, armador, navio, locais e datas de embarque e chegada.
- Filtros combináveis por mês de abertura, data exata de chegada, prioridade e situação.
- Encerramento com data registrada e consulta dos dados encerrados.
- Banco SQLite no servidor, com persistência entre execuções.
- Layout adaptado para computador e celular.

## Executar

Requer Node.js 24 ou superior e npm.

```sh
npm ci
npm run dev
```

O aplicativo começa vazio. O banco é criado automaticamente em `data/portohub.sqlite` e nunca é versionado.

## Verificação

```sh
npm run check
npm test
npm run build
```

Os testes verificam persistência, duplicidade, vínculo com o cliente, filtros, encerramento e validação dos dados recebidos no servidor. Usam bancos isolados, sem alterar cadastros reais.

## Executar o build

```sh
npm run build
npm start
```

O build usa o adapter-node. `npm start` inicia o servidor HTTP local em `http://127.0.0.1:3000`, com `HOST` e `PORT` configuráveis. `PORTOHUB_DB_PATH` permite informar outro caminho para o banco. O inicializador informa o protocolo HTTP real ao adapter e preserva a proteção de origem dos formulários. Para uma futura hospedagem com HTTPS/proxy, configure a origem e o proxy conforme o adapter-node 6. A hospedagem deve manter armazenamento persistente para a pasta do banco.

Esta versão foi preparada para execução local/interna e não inclui login. Não houve publicação em hospedagem externa.

## Dados e regras

- Número do processo único, sem diferenciar maiúsculas e minúsculas.
- CPF (11 dígitos) ou CNPJ (14 caracteres, numérico ou alfanumérico), formatado automaticamente ao digitar, normalizado e único. Confere o formato, sem consulta cadastral externa ou validação dos dígitos verificadores.
- Para abrir um processo, são obrigatórios cliente, número e data de abertura. Operação, modal e prioridade têm opções iniciais. As demais informações podem ser complementadas depois.
- Datas de transporte são opcionais. Quando ambas são preenchidas, a chegada deve ocorrer no embarque ou depois.
- Encerrar mantém o processo disponível para consulta e impede alterações; não existe exclusão nem reabertura nesta versão.
- O filtro de mês considera a data de abertura, com mês e ano; o filtro de chegada considera a data exata.
- Para backup, pare o servidor e copie a pasta `data` inteira, incluindo eventuais arquivos auxiliares do SQLite.

## Tecnologia

SvelteKit, Svelte, TypeScript, shadcn-svelte/Bits UI, Tailwind CSS, Lucide e SQLite nativo do Node.js. Fonte DM Sans incluída no projeto, sem requisições a serviços de fontes externos.

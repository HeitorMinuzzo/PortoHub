# PortoHub · direção visual

Aplicação interna com duas áreas: Processos e Clientes. A lista de processos é a página inicial. O formulário usa uma página única, com os campos agrupados em cartões: identificação, operação, envolvidos e transporte.

A interface segue o mesmo padrão do Assistente da TI: shadcn-svelte (estilo Vega, base zinc), fonte Inter, azul como cor primária e barra lateral recolhível (`Sidebar`) com cabeçalho mostrando a trilha da página. Os componentes de `src/lib/components/ui` foram trazidos de lá; ao adicionar novos, use o CLI do shadcn-svelte.

O tema claro é o padrão; o escuro fica disponível pelo botão de alternar tema (mode-watcher, salvo no navegador). Cores de estado (`success`, `warning`) são tokens próprios em `layout.css`, definidos para os dois temas. Classes do Tailwind direto nos componentes; CSS próprio só para o select nativo (`.native-select`).

Tabelas nas telas largas e listas nas estreitas. Seletores de data e cliente nativos; operação, modal e prioridade em grupos de rádio segmentados. Confirmações e cadastros em `Dialog`, avisos de sucesso em toasts (svelte-sonner). Movimento reduzido respeita a configuração do dispositivo.

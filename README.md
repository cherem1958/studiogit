# Essencial — painel pessoal diário

O site está inteiramente em `index.html`, com HTML, CSS e JavaScript no mesmo arquivo. Abra-o diretamente no navegador: não é necessário instalar dependências, executar um servidor ou configurar uma chave de API.

## Conteúdo

- Hora e data no fuso de Belo Horizonte e clima consultado no Open-Meteo.
- Pendências de BPO financeiro, estudos e tarefas pessoais, com data e prioridade.
- Ancord e CPA, Introdução a Aristóteles, Confissões de Santo Agostinho, Cálculo II e C++.
- Reflexões autorais inspiradas em Aristóteles, Santo Tomás, Santo Anselmo, Kierkegaard, Olavo de Carvalho e Wolfgang Smith. As reflexões não são citações literais.
- Layout escuro e responsivo para computador e celular.

## Tarefas e dados

As tarefas são salvas no armazenamento local do navegador. As tarefas iniciais são sugestões; novas tarefas podem ser adicionadas, concluídas e excluídas. Limpar os dados do navegador pode removê-las.

Cada navegador, aparelho e endereço de abertura tem seu próprio armazenamento. Use **Exportar tarefas** para criar um backup JSON e **Importar tarefas** para adicionar as tarefas do arquivo em outro navegador. A importação mantém a versão local de tarefas com o mesmo identificador. Não há sincronização automática entre dispositivos.

O site e a lista de tarefas funcionam sem internet depois de abrir o arquivo local. O clima precisa de internet e mostra “Indisponível” quando a consulta falha. Não há dados meteorológicos simulados.

## Versão anterior

Os arquivos React em `src/`, o `server.ts` e as configurações exportadas do Google AI Studio foram preservados como referência. O novo `index.html` é independente deles. O histórico Git preserva a entrada HTML da versão anterior.

O repositório contém o código do site; enviar o HTML ao GitHub não ativa hospedagem automaticamente. Para abrir no celular, transfira o arquivo ou utilize uma hospedagem estática.

# Base de conhecimento do portfólio

Esta pasta é a fonte de conteúdo do site. A interface não precisa ser alterada para cadastrar projetos, experiências, artigos ou certificações.

## Organização

| Arquivo                | Responsabilidade                                                       |
| ---------------------- | ---------------------------------------------------------------------- |
| `types.ts`             | Contratos de projeto, imagem, experiência, publicação e certificação   |
| `profile.ts`           | Perfil, links, currículo, trajetória, formação, competências e artigos |
| `projects/featured.ts` | Sete cases com documentação técnica aprofundada                        |
| `projects/catalog.ts`  | Demais entregas, estudos e pesquisas do inventário                     |
| `index.ts`             | Catálogo consolidado, ordenado por `rank`                              |
| `docs/<id>/`           | Guia e manual em Markdown dos projetos com página própria              |
| `SOURCES.md`           | Fontes, divergências e decisões editoriais                             |

## Adicionar um projeto

1. Crie um objeto que satisfaça `Project` em um dos arrays existentes ou em um novo arquivo importado por `index.ts`.
2. Use um `id` único em kebab-case. O link direto será `/?project=seu-id#projetos`.
3. Defina `rank` único: números menores aparecem primeiro em cada grupo. `featured: true` coloca o case no grupo principal; `false`, no catálogo complementar. O MailWorks recebe a apresentação de destaque pelo seu ID.
4. Preencha `summary` com uma descrição curta. Detalhes ficam em `problem`, `solution`, `role`, `highlights`, `architecture`, `outcomes` e `tradeoffs`.
5. `highlights` é a seção de realizações técnicas mais relevantes para backend e arquitetura. Explique a decisão, seu motivo e a contribuição pessoal.
6. Adicione arquivos em `public/images/projects/<id>/` e referencie-os por `/images/projects/<id>/arquivo.webp` em `images`.
7. Cadastre links reais. Para código privado, deixe `links` vazio e informe isso em `context`. Nunca use `#` como repositório fictício.
8. Registre as evidências em `sources`; esse campo é para manutenção editorial.

`images: []` produz um placeholder. Cada imagem aceita `kind: "logo" | "screenshot" | "architecture"`, `src`, `alt` e `caption`. O modal exibe toda a galeria; o primeiro arquivo ilustra o cartão principal. Os diagramas de fluxo são renderizados a partir de `architecture.steps`, sem depender de imagens externas.

O helper `entry()` no catálogo preenche valores vazios para casos cuja documentação é breve. Ele não inventa detalhes técnicos. Novos cases com documentação completa devem preencher o contrato integral, como os sete projetos principais.

## Página própria de um projeto (guia + docs)

Um projeto com o campo `docs` ganha duas páginas e um modal resumido:

| URL                        | Conteúdo                          | Arquivo                               |
| -------------------------- | --------------------------------- | ------------------------------------- |
| `/projetos/<id>`           | Guia: como o projeto funciona     | `docs/<id>/guide.<idioma>.md`         |
| `/projetos/<id>/docs`      | Documentação: manual de uso       | `docs/<id>/manual.<idioma>.md`        |
| `/projetos/<id>/en[/docs]` | As mesmas páginas em outro idioma | Mesmo padrão, com o idioma no arquivo |

Para habilitar em outro projeto:

1. Crie `knowledge-base/docs/<id>/` com `guide.pt-BR.md` e `manual.pt-BR.md` (e os equivalentes `.en.md`, se houver tradução).
2. Adicione `docs: { locales: ["pt-BR", "en"] }` ao projeto. O primeiro idioma é o padrão e não aparece na URL; cada idioma listado precisa dos dois arquivos, ou o build falha.

Nada mais precisa mudar: as rotas, o seletor de idioma, o índice lateral (títulos `##`) e as chamadas entre guia e docs são gerados a partir desse campo. O `# título` de cada arquivo vira o cabeçalho da página. O Markdown aceita tabelas, blocos de código e âncoras internas no formato do GitHub.

**Só "Como funciona".** Para um projeto sem manual, declare `pages: ["guide"]` (como o Jarvis: `docs: { locales: ["pt-BR", "en"], pages: ["guide"] }`). Só o `guide.<idioma>.md` é exigido; a rota `/docs`, as abas e os links para a documentação deixam de existir.

**Diagramas e imagens.** Use a sintaxe de imagem do Markdown com caminho absoluto: `![Descrição](/images/projects/<id>/docs/arquivo.webp)`. Guarde os arquivos em `public/images/projects/<id>/docs/` e, quando a imagem tiver texto, uma versão por idioma em uma subpasta (`docs/en/`). HTML cru (`<img>`, `<p align>`) não é renderizado. Cada imagem abre em tamanho real ao clicar.

No modal, um projeto com `docs` exibe apenas a visão geral, sem abas, com o botão **Ver com detalhes** e links para o guia e para a documentação. `highlights`, `architecture` e `tradeoffs` continuam obrigatórios no contrato, mas só aparecem no modal dos projetos sem página própria.

Um novo idioma exige uma entrada em `DocLocale` (`types.ts`), em `docLocaleSegments` (`docs/routes.ts`) e nos textos de interface de `app/ui/project-doc.tsx`.

## Ranking editorial

1. **MailWorks** — eventos, AWS, multi-tenancy e tratamento de falhas, com trade-offs documentados.
2. **Care Copilot** — áudio no navegador, filas, contratos de IA e transações.
3. **Grau Técnico** — entrega integral, legado, RPA e consistência financeira.
4. **Jarvis** — integração de domínios, ferramentas para IA e recorrências.
5. **Fala Comigo** — contribuição autoral documentada em criptografia, autenticação e IA.
6. **PixelPhone** — produto entregue, voz, faturamento e integrações resilientes.
7. **vibe-git** — ferramenta de desenvolvimento com adoção relatada e arquitetura extensível.

O ranking mede relevância para apresentar backend e arquitetura, não maturidade de produção ou qualidade absoluta. `rankingReason` preserva a justificativa em cada registro.

## Trocar o currículo

Substitua **`public/cv/igor-albuquerque.pdf`** mantendo o nome. Todos os botões usam `profile.cv.url`, e o download usa `profile.cv.filename`. Não é necessário alterar código. O arquivo em `about-me/` é uma fonte de pesquisa, não o arquivo publicado. Em um site hospedado, publique novamente o projeto para distribuir o PDF atualizado.

## Artigos, experiências e formação

Edite os arrays de `profile.ts`. PDFs públicos de pesquisa ficam em `public/documents/research/`. O tipo e o texto do link devem refletir o arquivo: artigo, apresentação, certificado ou documento institucional.

## Habilitar certificações

Adicione objetos a `certifications.items` e altere `enabled` para `true`. A seção só aparece quando ambas as condições são atendidas; hoje permanece desabilitada.

## Validar alterações

```bash
npm run typecheck
npm run lint
npm run build
npm run test:e2e
```

Os testes de navegador verificam os 20 registros atuais, filtros, busca, estados vazios, modais, foco, Escape, links diretos, PDFs e responsividade. Ao cadastrar um projeto, os totais esperados vêm do catálogo, não de números fixos.

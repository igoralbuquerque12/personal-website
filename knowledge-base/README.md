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

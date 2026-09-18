# Igor Albuquerque · Portfólio

Portfólio em português com apresentação profissional, linha do tempo, 20 projetos e frentes de trabalho, cases de arquitetura, formação, artigos e contato. Construído com Next.js, React e TypeScript.

## Executar

```bash
npm ci
npm run dev
```

Abra `http://localhost:3000`. O portfólio não precisa de variáveis de ambiente, banco ou serviço externo para funcionar. `next/font` baixa as fontes durante a primeira compilação e as serve junto ao site.

## Manter o conteúdo

O guia completo está em **[knowledge-base/README.md](knowledge-base/README.md)**.

| Alteração                | Onde fazer                                                    |
| ------------------------ | ------------------------------------------------------------- |
| Trocar CV                | Substituir `public/cv/igor-albuquerque.pdf`, mantendo o nome  |
| Perfil, redes e formação | `knowledge-base/profile.ts`                                   |
| Experiências e artigos   | Arrays em `knowledge-base/profile.ts`                         |
| Projetos principais      | `knowledge-base/projects/featured.ts`                         |
| Mais projetos            | `knowledge-base/projects/catalog.ts`                          |
| Campos e tipagem         | `knowledge-base/types.ts`                                     |
| Ranking                  | Campo `rank` de cada projeto; menor aparece primeiro no grupo |
| Fotos e figuras          | `public/images/projects/<id>/` e campo `images`               |
| Certificações            | Preencher `certifications.items` e habilitar `enabled`        |

Cada projeto tem descrição curta, stack, contribuição, problema, solução, destaques técnicos, fluxo de arquitetura, resultados, trade-offs, galeria, links e fontes. Busca e filtros são derivados dos dados. Imagens ausentes recebem um placeholder; repositórios só aparecem quando há uma URL real.

Os modais podem ser compartilhados por `/?project=mailworks#projetos`, por exemplo. Oferecem navegação por teclado, fechamento por Escape ou pelo fundo, contenção de foco e retorno ao elemento que os abriu.

`about-me/` contém os originais fornecidos e não é publicado como conteúdo estático. Apenas os arquivos selecionados de `public/` são servidos ao visitante. As decisões de curadoria estão em [knowledge-base/SOURCES.md](knowledge-base/SOURCES.md).

## Estrutura

```text
app/
  page.tsx                 Seções da home (Server Component)
  layout.tsx               Fontes e metadados
  globals.css              Tokens e estilos globais
  portfolio.css            Componentes visuais
  responsive.css           Adaptações para tablet e celular
  ui/                      Navegação, projetos, modal, ícones e diagramas
knowledge-base/             Conteúdo tipado, fontes e guia de manutenção
public/
  brand/                   Identidade do site
  cv/                      Um caminho estável para o currículo publicado
  documents/research/      PDFs de pesquisa
  images/profile/          Retrato otimizado
  images/projects/         Assets organizados por projeto
tests/                     Validação de interação, conteúdo e responsividade
```

## Qualidade e produção

```bash
npm run typecheck
npm run lint
npm run build
npm start
```

Para os testes de navegador, instale o Chromium do Playwright uma vez:

```bash
npx playwright install chromium
npm run test:e2e
```

É possível usar o Chrome instalado no Windows:

```powershell
$env:PLAYWRIGHT_CHROME = '1'
npm run test:e2e
```

Os testes executam em desktop e mobile; reutilizam um servidor em `localhost:3000` ou iniciam o servidor de desenvolvimento. Para validar a versão de produção, rode `npm run build` e `npm start` antes dos testes. `npm run format` formata o código e a documentação editável.

O build gera a home estaticamente. A busca e os modais são interativos no cliente; as imagens são otimizadas pelo Next.js. Para hospedar, use uma plataforma compatível com Next.js ou um servidor Node com `npm start`.

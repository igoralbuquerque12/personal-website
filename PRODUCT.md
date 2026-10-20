# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Recrutadores e tech leads avaliando Igor Albuquerque para uma vaga de engenharia de software (backend, cloud, IA). Chegam por LinkedIn, currículo ou indicação, com pouco tempo, e precisam julgar senioridade, profundidade técnica e estilo de trabalho em poucos minutos. A ação desejada é contatar Igor (e-mail, LinkedIn, GitHub). Idioma: português do Brasil.

## Product Purpose

Portfólio pessoal de engenharia (Next.js, site em `igoralbuquerque.site`). Existe para provar, com projetos reais e decisões de arquitetura documentadas, que Igor constrói e opera sistemas ponta a ponta. Sucesso: o visitante entende em segundos quem ele é, explora pelo menos um case técnico a fundo e entra em contato.

## Positioning

Igor não lista tecnologias: mostra um ecossistema de produtos próprios que dependem uns dos outros (MailWorks atende os produtos, o Jarvis recebe os alertas de erro, o vibe-git versiona todos), mais cases de freelance e da Nocorp. Um concorrente não pode copiar o fato de que os próprios serviços de Igor se usam entre si.

## Operating Context

Visitante em desktop (recrutador no trabalho) e em celular (link aberto pelo LinkedIn). Os cases têm páginas de documentação própria (`/projetos/[slug]`, guias e manuais em PT-BR e EN) e diagramas de system design. O CV em PDF existe, mas o botão de download está desativado no momento.

## Capabilities and Constraints

- Site em Next.js 16 / React 19, CSS próprio (sem Tailwind), fontes via next/font.
- Conteúdo vem de `knowledge-base/` (perfil, experiências, projetos, ecossistema). Texto, estrutura de seções e a numeração 01–05 ficam como estão: o redesign é apenas de estilo.
- Mapa interativo do ecossistema (`app/ui/ecosystem-map.tsx`), navegador de projetos com filtro e busca, diálogo de projeto, páginas de documentação com sumário.
- Testes e2e e de acessibilidade em `tests/portfolio.spec.ts` (Playwright + axe) devem continuar passando.
- Certificações: seção desativada; não inventar.

## Brand Commitments

Nenhuma obrigatória. O usuário autorizou trocar cores, fontes e até o monograma "ia↗". O nome "Igor Albuquerque" e o domínio permanecem.

## Evidence on Hand

Foto de Igor (`public/images/profile/igor.webp`), logo da Unimontes, capturas e marcas de projetos em `public/images/projects/`, diagramas de system design, PDFs de pesquisa em `public/documents/research/`. Ausência a respeitar: não há depoimentos, métricas de uso nem logos de clientes; não fabricar.

## Product Principles

1. Prova antes de promessa: cada afirmação aponta para um projeto, diagrama ou documento real.
2. Profundidade sob demanda: leitura rápida na superfície, detalhe técnico a um clique.
3. Engenharia visível: filas, idempotência e isolamento por tenant são o tema, não enfeite.
4. Respeitar o tempo de quem avalia: o essencial (quem, o quê, como contatar) nunca fica escondido.

## Accessibility & Inclusion

WCAG AA como piso (contraste 4.5:1 no texto, foco visível, navegação por teclado, `prefers-reduced-motion`). O site já tem skip-link e testes axe; manter.

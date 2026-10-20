---
name: Igor Albuquerque, Portfólio
description: Parede de cartazes de rua: tipo de madeira condensado, amarelo-táxi, papel e tinta preta, com uma única faixa vermelho-laranja para a ação.
colors:
  taxi: "#f7c600"
  taxi-soft: "#fff2b0"
  paper: "#fbfbf6"
  white: "#ffffff"
  ink: "#0d0d0d"
  ink-soft: "#3a3a34"
  signal: "#d4380f"
typography:
  display:
    fontFamily: "League Gothic, Arial Narrow, Impact, sans-serif"
    fontSize: "clamp(3.5rem, 8.5vw, 7rem)"
    fontWeight: 400
    lineHeight: 0.9
    letterSpacing: "0.005em"
  display-xl:
    fontFamily: "League Gothic, Arial Narrow, Impact, sans-serif"
    fontSize: "clamp(5rem, 15vw, 13rem)"
    fontWeight: 400
    lineHeight: 0.88
    letterSpacing: "0.005em"
  headline:
    fontFamily: "League Gothic, Arial Narrow, Impact, sans-serif"
    fontSize: "clamp(2.5rem, 4.5vw, 4rem)"
    fontWeight: 400
    lineHeight: 0.95
  title:
    fontFamily: "Schibsted Grotesk, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Schibsted Grotesk, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "Schibsted Grotesk, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "0.1em"
rounded:
  none: "0px"
spacing:
  gutter: "48px"
  section: "112px"
  rule: "3px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.taxi}"
    rounded: "{rounded.none}"
    padding: "12px 24px"
    height: "52px"
  button-primary-hover:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.white}"
  button-cta:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.white}"
    rounded: "{rounded.none}"
    padding: "18px 26px"
  chip-filter:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "10px 16px"
  chip-filter-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.taxi}"
  tag:
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "3px 9px"
  card-project:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "24px"
  section-label:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.taxi}"
    padding: "0.4em 0.8em"
---

# Design System: Igor Albuquerque, Portfólio

## Overview

**Creative North Star: "A Parede de Cartazes"**

O site é uma parede de rua onde cada seção grita o próprio nome. Os títulos são tipo de madeira condensado em caixa alta, em escala de letreiro, levemente inclinados, e o conteúdo é o cartaz colado embaixo. A referência é a tipografia de rua de teatro de Paula Scher: palavras grandes demais para caber quietas, tinta preta densa, e um amarelo que ocupa regiões inteiras da página em vez de aparecer como detalhe.

Cada tom tem um trabalho: amarelo-táxi é a parede (abertura e projetos), preto é a noite e a ênfase (menu, experiência, contato), papel é onde se lê. O único vermelho-laranja da página é a ação: o botão do menu e o e-mail de contato. Tudo é chapado, com costuras pretas de 3px, sem sombra e sem canto arredondado.

**Key Characteristics:**
- Títulos em League Gothic caixa alta, 4,5 a 13rem, inclinados entre -1,2° e -1,5°.
- Três terrenos em ritmo: amarelo, papel, preto; nunca cinza-esverdeado.
- Bordas de 3px em tinta no lugar de sombra, cantos retos.
- Vermelho-laranja reservado à ação.
- Rótulos e dados em grotesca caixa alta com tracking, nunca em mono (mono só em código).

## Colors

Paleta de três terrenos e uma ação.

### Primary
- **Amarelo-táxi** (#f7c600): a parede. Fundo da abertura e da seção de projetos, números e marcadores sobre preto, fundo do estado selecionado. Texto preto sobre ele dá 12:1.

### Secondary
- **Vermelho-laranja de ação** (#d4380f): só a ação. Botão "Vamos conversar", e-mail de contato e hover do botão principal. Texto branco sobre ele dá 4,8:1.

### Neutral
- **Tinta densa** (#0d0d0d): texto, bordas, menu, seção de experiência e contato.
- **Tinta suave** (#3a3a34): texto secundário sobre papel. Nunca mais claro que isso.
- **Papel** (#fbfbf6): terreno de leitura, um pouco frio, sem cair para creme.
- **Amarelo-suave** (#fff2b0): destaque de bloco (observações, hover de card, callouts).
- **Branco** (#ffffff): logos e cartões de formação, onde a marca precisa de fundo limpo.

### Named Rules
**A Regra da Ação Única.** O vermelho-laranja só marca uma ação ou o botão ativo. Estado, alerta e status usam amarelo ou tinta, com texto ou padrão de traço, nunca só cor.
**A Regra dos Três Terrenos.** Cada seção ocupa inteira um terreno (amarelo, papel ou preto). Não existe cinza intermediário nem fundo esverdeado.

## Typography

**Display Font:** League Gothic (com Arial Narrow, Impact)
**Body Font:** Schibsted Grotesk (com Helvetica Neue, Arial)
**Label/Mono Font:** Schibsted Grotesk em caixa alta; DM Mono apenas em blocos de código.

**Character:** O par é madeira e jornal: um tipo condensado que grita, uma grotesca de redação que informa. O contraste de largura entre os dois é a hierarquia.

### Hierarchy
- **Display XL** (400, clamp(5rem, 15vw, 13rem), 0,88): só o título da abertura.
- **Display** (400, clamp(3.5rem, 8.5vw, 7rem), 0,9): títulos de seção e de diálogo.
- **Headline** (400, clamp(2.5rem, 4.5vw, 4rem), 0,95): empresa na trajetória, curso, "Mais problemas resolvidos".
- **Title** (800, 1.25rem, 1,1): subtítulos dentro de diálogo e documentação.
- **Body** (400, 1,0625rem, 1,7): texto corrido, medida de 62 a 72ch.
- **Label** (700, 0,8125rem, 0,1em, caixa alta): numeração de seção, filtros, rótulos de dado. Nunca abaixo de 12px.

### Named Rules
**A Regra da Madeira.** Display sempre em caixa alta, tracking entre 0 e 0,01em, nunca abaixo de -0,04em. Texto corrido nunca em League Gothic.
**A Regra do Piso.** Nenhum texto HTML abaixo de 12px.

## Layout

Coluna central de até 1240px, com gutter de 48px (36 em 1100, 25 em 800, 20 em 560). Seções de terreno cheio (abertura, trajetória, projetos, contato, rodapé) sangram de borda a borda e mantêm o conteúdo na coluna. Ritmo vertical de 112px entre seções (80 em tablet, 64 em celular), com mais espaço acima do título do que abaixo. O menu colapsa em 980px.

Título de seção em duas linhas à esquerda e texto de apoio à direita, alinhado à base. Um numeral de parede (02 a 05) em League Gothic de 12 a 24rem, a 10% de opacidade, sangra pela borda direita atrás do cabeçalho.

## Elevation & Depth

Sem sombras. A profundidade vem de três coisas: borda preta de 3px, troca de terreno (amarelo, papel, preto) e inclinação de alguns graus em títulos e cartazes colados. Qualquer elemento clicável mantém sua posição em repouso e no hover: o destaque é troca de fundo, não deslocamento.

### Named Rules
**A Regra da Costura.** Elevação se declara uma vez, e é borda. Sombra, brilho e blur não entram.

## Shapes

Retos. Raio zero em botões, cards, tags, campos e diálogo. Costura de 3px (`--rule`) em contornos principais, 2px em tags e divisórias internas, 8px em filete de topo de artigo. Os nós do mapa e o cartaz do MailWorks podem girar -1° a -3° como cartazes colados; nada além disso gira em repouso.

## Components

### Buttons
- **Shape:** retângulo reto, borda de 3px (0px de raio), 52px de altura mínima.
- **Primary:** tinta com texto amarelo, caixa alta 15px, tracking 0,02em.
- **Hover / Focus:** vira vermelho-laranja com texto branco e gira -1,5°. Foco com contorno de 3px (tinta, ou amarelo sobre preto) a 3px de distância.
- **CTA de contato:** vermelho-laranja, texto branco 20px em 800.

### Chips (filtros)
- **Style:** contorno de 3px em tinta, caixa alta 13px, contador com contorno de 2px.
- **State:** selecionado inverte para tinta com texto amarelo; hover gira -2° sobre papel.

### Cards / Containers
- **Corner Style:** reto.
- **Background:** papel; hover vira amarelo-suave, sem mover.
- **Border:** 3px em tinta. Miniaturas passam por tons de cinza multiplicados sobre amarelo e voltam à cor no hover.
- **Internal Padding:** 24px. Título em League Gothic 2,625rem, rótulo de contexto abaixo do título.

### Inputs / Fields
- **Style:** papel com borda de 3px em tinta, 15px.
- **Focus:** contorno de 3px com 5px de distância; cursor vermelho-laranja.

### Navigation
- Barra preta fixa de 76px. Links em caixa alta 13px com tracking; hover vira bloco amarelo com texto preto e gira -2,5°. "Vamos conversar" é o único bloco vermelho-laranja. No celular vira lista de League Gothic 2,25rem.

### Mapa do ecossistema (componente-assinatura)
Cartazes colados em um painel de papel com borda de 3px. Nós em papel (código aberto) ou preto (integrados), com nome em League Gothic. Ligações em três traços que se distinguem sem cor: tracejado longo, curto e pontilhado. Rótulos em caixinhas de papel com contorno do traço.

## Do's and Don'ts

### Do:
- **Do** deixar o título anunciar a seção, em League Gothic caixa alta no maior tamanho que a coluna aguenta.
- **Do** manter texto corrido em Schibsted Grotesk, 16–17px, com 62 a 72 caracteres por linha.
- **Do** usar o vermelho-laranja (#d4380f) apenas para ação, sempre com texto branco.
- **Do** distinguir estados por texto, padrão de traço ou posição, não só por cor.
- **Do** trocar o foco de tinta para amarelo (`--focus`) quando o fundo for preto.

### Don't:
- **Don't** usar sombra, blur, vidro, degradê ou canto arredondado.
- **Don't** pôr cinza esverdeado, creme ou qualquer terreno fora de amarelo, papel e preto.
- **Don't** usar texto HTML abaixo de 12px nem tracking abaixo de -0,04em.
- **Don't** mover um alvo de clique no hover; mude o fundo.
- **Don't** usar monoespaçada como estilo de rótulo; ela é só para código.

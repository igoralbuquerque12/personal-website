import type { Ecosystem } from "./types";

/**
 * Mapa da abertura do site: quais projetos aparecem, onde, e como se integram.
 * Nome, selo (open source ou freelance) e modal vêm do projeto pelo `id`.
 */
export const ecosystem = {
  nodes: [
    {
      id: "mailworks",
      role: "integrated",
      subtitle: "E-mail e 2FA por API",
      caption: {
        text: "minha API de e-mails assíncrona e multi-tenant na AWS.",
        highlight:
          "Permite enviar e-mails singulares ou disparos, além de gerenciar 2FA. Atende diversos provedores dada arquitetura adapter.",
      },
      desktop: { x: 0.7, y: 0.1, r: -2.5 },
      mobile: { x: 0.62, y: 0.09, r: -2 },
    },
    {
      id: "fala-comigo",
      role: "product",
      subtitle: "Idiomas em chat com IA",
      caption: {
        text: "prática de idiomas em chat, com correções por IA.",
        highlight: "Websocket, criptografia de mensagens e IA integrada.",
      },
      desktop: { x: 0.13, y: 0.42, r: 2 },
      mobile: { x: 0.24, y: 0.25, r: 2 },
    },
    {
      id: "pixelphone",
      role: "product",
      subtitle: "Chamadas viram indicadores",
      caption: {
        text: "controle de chamadas e gestão de call-center.",
        highlight: "Ouvir chamadas longas? Não, uma IA transcreve e metrifíca o desempenho.",
      },
      desktop: { x: 0.87, y: 0.34, r: -1.5 },
      mobile: { x: 0.76, y: 0.31, r: -1.5 },
    },
    {
      id: "care-copilot",
      role: "product",
      subtitle: "Consulta vira anamnese",
      caption: {
        text: "gestão de consulta, paciente e anamnese com automações pra facilitar o processo do médico.",
        highlight:
          "Desde o preenchimento da anamnese só pelo diálogo com o paciente, até análise de risco cirurgico e geração de sugestões da conduta, diagnóstico e prescrição.",
      },
      desktop: { x: 0.43, y: 0.5, r: 1.5 },
      mobile: { x: 0.3, y: 0.49, r: 1.5 },
    },
    {
      id: "grau-tecnico",
      role: "product",
      subtitle: "Gestor de cobranças",
      caption: {
        text: "gestão de milhares de cobranças de alunos de escolas de curso técnico.",
        highlight:
          "Cobranças tratadas de maneira idempotente e com mensageria assíncrona.",
      },
      desktop: { x: 0.8, y: 0.64, r: -2 },
      mobile: { x: 0.74, y: 0.58, r: -2 },
    },
    {
      id: "vibe-git",
      role: "integrated",
      subtitle: "Versiona tudo via CLI",
      caption: {
        text: "CLI no npm que transforma o diff em commits, branches e PRs.",
        highlight: "É por ele que todos meus projetos são versionados.",
      },
      desktop: { x: 0.17, y: 0.84, r: -1.5 },
      mobile: { x: 0.27, y: 0.77, r: -1.5 },
    },
    {
      id: "jarvis",
      role: "integrated",
      subtitle: "Alertas no WhatsApp",
      caption: {
        text: "meu assistente no WhatsApp, com lembretes, rotinas e controle financeiro.",
        highlight:
          "Também está integrado aos outros projetos pela API pública, para envio de mensagens e alertas.",
      },
      desktop: { x: 0.6, y: 0.89, r: 2 },
      mobile: { x: 0.7, y: 0.91, r: 2 },
    },
  ],
  connections: [
    {
      from: "mailworks",
      to: "care-copilot",
      kind: "mail",
      label: "Envia e-mails e gerencia 2FA",
      event: "código 2FA enviado",
      bend: 30,
    },
    {
      from: "mailworks",
      to: "grau-tecnico",
      kind: "mail",
      label: "Envia e-mails e gerencia 2FA",
      event: "e-mail de cobrança enviado",
      bend: 30,
    },
    {
      from: "care-copilot",
      to: "jarvis",
      kind: "alert",
      label: "Envia mensagens alertando erros",
      event: "lote de áudio falhou, aviso no WhatsApp",
      bend: -35,
    },
    {
      from: "grau-tecnico",
      to: "jarvis",
      kind: "alert",
      label: "Envia mensagens alertando erros",
      event: "coleta RPA falhou, aviso no WhatsApp",
      bend: 30,
    },
    {
      from: "vibe-git",
      to: "fala-comigo",
      kind: "git",
      label: "Versiona commits, branches e PRs",
      event: "PR aberto com commits atômicos",
      bend: 35,
    },
    {
      from: "vibe-git",
      to: "pixelphone",
      kind: "git",
      label: "Versiona commits, branches e PRs",
      event: "PR aberto com commits atômicos",
      bend: -50,
    },
    {
      from: "vibe-git",
      to: "care-copilot",
      kind: "git",
      label: "Versiona commits, branches e PRs",
      event: "PR aberto com commits atômicos",
      bend: -25,
    },
    {
      from: "vibe-git",
      to: "grau-tecnico",
      kind: "git",
      label: "Versiona commits, branches e PRs",
      event: "PR aberto com commits atômicos",
      bend: 40,
    },
  ],
} satisfies Ecosystem;

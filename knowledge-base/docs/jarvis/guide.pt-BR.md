# Como o Jarvis funciona por dentro

Este guia percorre a arquitetura e o system design do **Jarvis**, um assistente pessoal por WhatsApp com lembretes, rotinas, gestão financeira, painel web e API pública. Ele apresenta cada visão do sistema, cada fluxo e cada decisão, com os trade-offs assumidos pelo caminho.

O código está em [github.com/igoralbuquerque12/jarvis](https://github.com/igoralbuquerque12/jarvis).

## 1. Objetivos e princípios de design

O Jarvis nasceu de uma pergunta simples: *e se a interface do assistente fosse o aplicativo que a pessoa já abre cinquenta vezes por dia?* O WhatsApp é o canal, não um canal. Isso define quase tudo que vem depois: não existe chat na web, a latência percebida é a de uma conversa, e a resposta precisa caber em uma bolha de mensagem.

Cinco princípios guiaram as decisões e aparecem repetidamente ao longo deste documento:

| Princípio | O que significa na prática |
|---|---|
| **WhatsApp-first** | O core recebe e envia mensagens por um socket Baileys persistente. O painel web é complementar: onboarding, visualização e configuração. |
| **O modelo é um detalhe de implementação** | O backend não conhece nenhum SDK de LLM. Ele produz um contrato (prompt + catálogo de ferramentas + contexto) e consome outro (`{ response }`). Quem roda o modelo é o n8n. |
| **Contrato tipado entre humano, modelo e código** | Tudo que o modelo pode fazer está declarado em TypeScript, é validado por DTOs no backend e coberto por testes. Erros de validação são parte do protocolo, não exceções. |
| **Isolamento por usuário em todas as camadas** | `Profile` é a unidade de isolamento: histórico, eventos, chaves de API, e um usuário dedicado (com workspace próprio) no motor financeiro. O `profileId` vem sempre do servidor, nunca do cliente. |
| **Custo e simplicidade operacional** | Uma VPS, um `docker compose`, um banco gerenciado gratuito, um Redis. Cache para não martelar o banco, cron em vez de fila, sem Kubernetes. |

---

## 2. Visão de contexto

![Diagrama de contexto](/images/projects/jarvis/docs/01-context.webp)

O sistema tem dois tipos de usuário humano (a pessoa que conversa e a mesma pessoa usando o painel), um tipo de cliente máquina (sistemas do próprio usuário autenticados por API key) e quatro sistemas externos: os servidores do WhatsApp, o provedor de LLM (Groq), o banco gerenciado (Neon) e, num grau intermediário, o Securo e o n8n, que rodam na mesma VPS mas são processos com ciclo de vida próprio.

As fronteiras importantes:

- **Entre o usuário e o Jarvis** só existem dois caminhos: WhatsApp (mensagens) e HTTPS (painel). O painel nunca envia mensagens ao assistente; ele lê e edita dados.
- **Entre o Jarvis e a IA** o contrato é um webhook HTTP síncrono, protegido por chave, e um conjunto de callbacks HTTP também protegidos por chave. O n8n não acessa o banco.
- **Entre o Jarvis e o Securo** o contrato é a API REST do Securo, autenticada com JWT por usuário e cabeçalho de workspace. O Securo não sabe que o Jarvis existe; ele vê apenas usuários com e-mails `profile-<uuid>@jarvis.internal`.

---

## 3. Visão de containers e deploy

![Diagrama de containers](/images/projects/jarvis/docs/02-containers.webp)

| Serviço (`compose.yml`) | Imagem / build | Função | Depende de |
|---|---|---|---|
| `migrate` | `server/Dockerfile` (target `builder`) | `npx prisma migrate deploy` e termina. | — |
| `server` | `server/Dockerfile` (target `production`) | API NestJS, socket WhatsApp, scheduler. | `migrate` (exit 0), `redis` (healthy), `securo-backend` (started) |
| `web` | `web/Dockerfile` | nginx servindo o build estático do Vite. | `server` |
| `redis` | `redis:7-alpine` | Cache do Jarvis (db 0) e broker/cache do Securo (db 1). AOF ligado. | — |
| `securo-db` | `pgvector/pgvector:pg16` | Postgres do Securo, volume `securo-pgdata`. | — |
| `securo-migrate` | `securo/backend` | `alembic upgrade head` e termina. | `securo-db` (healthy), `redis` (healthy) |
| `securo-backend` | `securo/backend` | API FastAPI do Securo em `:8000`. | `securo-migrate` (exit 0) |
| `securo-celery-worker` | `securo/backend` | Jobs em background do Securo. | idem |
| `securo-celery-beat` | `securo/backend` | Agendador: materializa recorrências e aplica regras de ativos a cada hora. | idem |
| `n8n` | `docker.n8n.io/n8nio/n8n` (fora do compose) | Orquestrador do agente. Conectado à rede por `docker network connect`. | — |

---

## 4. Visão de componentes do backend

![Grafo de módulos NestJS](/images/projects/jarvis/docs/10-modules.webp)

### 4.1 Módulos e responsabilidades

| Módulo | Responsabilidade | Principais peças |
|---|---|---|
| `PrismaModule` (global) | Conexão com o Postgres via driver adapter. | `PrismaService extends PrismaClient` com `PrismaPg`. |
| `RedisModule` (global) | Cliente Redis único, conectado no boot. | `RedisService.getClient()`. |
| `AuthModule` | Instância do better-auth, sessão, hooks de criação de usuário. | `BetterAuthService` (`instance`, `getSession`, `requireSession`). |
| `ProfileModule` | O `Profile`: criação a partir do usuário autenticado, token de pareamento, view para a web. | `ProfileService.ensureAuthProfile`, `toProfileMeView`. |
| `SubscriptionModule` | Planos. Garante o Free Tier. | `SubscriptionService.ensureDefaultSubscription`. |
| `MessagesModule` | Histórico de conversa por perfil. | `MessagesService.findAll({ userId, take })`. |
| `WhatsappModule` | Socket Baileys, recepção, envio, credenciais cifradas, guard administrativo. | `WhatsappConnectionService`, `WhatsappReceiverService`, `WhatsappSenderService`, `BaileysAuthStore`, `WhatsappAuthCryptoService`, `WhatsappAdminGuard`. |
| `AssistantModule` | O loop de mensagens, o prompt, o catálogo de ferramentas, o cliente do n8n e o pareamento. | `AssistantMainService`, `AssistantWorkflowService`, `AssistantConnectionService`, `ASSISTANT_TOOLS`, `buildDirective`. |
| `EventsModule` | Séries e execuções, scheduler, endpoints M2M e web. | `EventsSchedule` (`@Cron`), `EventsM2mService`, `EventSeriesService`, `EventExecutionService`. |
| `FinanceModule` | Cliente do Securo, provisioning, contexto por perfil, 7 submódulos de domínio, fachada M2M. | `SecuroApiService`, `SecuroProvisioningService`, `SecuroContextService`, `FinanceM2mController`, `*Service` por área. |
| `ApiKeysModule` | Ciclo de vida das chaves e o guard de API key. | `ApiKeysService`, `ApiKeyGuard`, `@ApiKeyProfile()`. |
| `PublicApiModule` | Rotas públicas `/v1/*`. | `PublicApiController`, `PublicApiService`. |

### 4.2 Dependências e o ciclo WhatsApp ⇄ Assistant

O grafo tem uma dependência circular legítima: o `WhatsappModule` precisa do `AssistantMainService` (para entregar mensagens recebidas) e o `AssistantModule` precisa do `WhatsappSenderService` (para responder). Ela é resolvida com `forwardRef()` nos dois lados e, dentro do `WhatsappSenderService`, com `@Inject(forwardRef(() => WhatsappConnectionService))`.

Os outros `forwardRef` (`Auth ⇄ Profile`, `Auth → Finance`) existem porque o hook de criação de usuário do better-auth precisa do `ProfileService` e do `SecuroProvisioningService`, enquanto os controllers desses módulos precisam do `BetterAuthService` para validar sessão.

### 4.3 Convenções que sustentam a modularidade

- Cada módulo segue `controllers/ services/ dto/ entities/ utils/ schedules/ tests/`. Testes ficam colocados no módulo (`rootDir` do Jest é `src`).
- **Duas fachadas por capacidade.** Eventos e finanças expõem um controller M2M (`/*-m2m/:profileId/execute`, guard administrativo, `profileId` na rota) e um controller web (`/*/me/*`, sessão, `profileId` resolvido da sessão). Ambos chamam os mesmos services.
- **RPC nos M2M.** Em vez de um endpoint REST por operação, os M2M recebem `{ operation, data }` (`ExecuteOperationDto`) e fazem `switch` para o DTO certo, validando com `validateDto()` (`plainToInstance` + `validateOrReject`). Isso reduziu dezenas de nós no n8n a quatro.
- **Validação em duas famílias.** DTOs internos usam class-validator (integrados ao `ValidationPipe` global com `whitelist`, `forbidNonWhitelisted`, `transform`). Payloads externos (a resposta do n8n, as respostas críticas do Securo) usam Zod. A regra: *o que entra de fora é parseado, o que trafega dentro é declarado.*
- **Idioma.** Strings para o usuário, prompts e docs de módulo em pt-BR; identificadores, comentários novos e commits em inglês.

---

## 5. O loop de mensagens

Este é o caminho crítico do produto: da mensagem que chega no WhatsApp à resposta que volta.

1. **Recepção.** O `WhatsappReceiverService` filtra o que o Baileys entrega: ignora histórico sincronizado, mensagens enviadas pelo próprio assistente e tudo que não tem texto. O restante segue para o `AssistantMainService` sem aguardar, para nunca bloquear o socket.
2. **Perfil.** O remetente é resolvido pelo `jid`. Um número desconhecido só recebe resposta se a mensagem trouxer um token de pareamento válido; qualquer outra coisa é ignorada, para o Jarvis não virar um bot que responde a qualquer número.
3. **Contexto.** As 10 últimas mensagens são carregadas antes de a atual ser gravada, para que ela não apareça duplicada no histórico.
4. **Agente.** O backend envia ao n8n o prompt, o catálogo de ferramentas, o texto livre do perfil, o histórico e a data e hora no fuso do usuário. A resposta é validada com Zod.
5. **Resposta.** O texto é gravado e enviado pelo `WhatsappSenderService`. Não há retry: uma falha resulta em silêncio para o usuário, que naturalmente reenvia.

O loop é stateless por mensagem: todo o contexto vem do banco, então reiniciar o server não perde conversa. A latência é dominada pelo modelo (1 a 3 iterações típicas) e pelos callbacks HTTP; o backend acrescenta duas leituras e duas escritas no Postgres.

---

## 6. A camada de IA: n8n como orquestrador

![Montagem do prompt e workflow do n8n](/images/projects/jarvis/docs/11-agent-prompt.webp)

### 6.1 Por que n8n

Rodar o modelo dentro do NestJS seria mais direto. A escolha pelo n8n foi deliberada por três razões:

1. **Troca de modelo sem deploy.** O nó `Groq Chat Model` pode ser substituído por OpenAI, Anthropic, Ollama ou qualquer outro com function calling, editando o workflow. O contrato com o backend não muda.
2. **Observabilidade do agente de graça.** Cada execução no n8n mostra o prompt montado, cada tool call, cada resposta do backend e o texto final. Depurar comportamento do modelo vira olhar uma tela, não instrumentar código.
3. **Separação de responsabilidades.** O backend é dono do *contrato* (o que o agente pode fazer, com que dados, sob que regras). O n8n é dono da *execução* (qual modelo, com que temperatura, quantas iterações).

O custo é um salto de rede a mais por mensagem e a dependência de um serviço adicional. A [seção 16](#16-decisões-de-arquitetura-e-trade-offs) discute a alternativa.

### 6.2 O workflow

O arquivo [`n8n.json`](https://github.com/igoralbuquerque12/jarvis/blob/main/n8n.json) é versionado e importável. Nós, em ordem:

| Nó | Tipo | O que faz |
|---|---|---|
| **Webhook** | `webhook` v2.1, `POST /webhook/assistant`, Header Auth | Recebe o payload. Responde pelo nó *Respond to Webhook* (`responseMode: responseNode`). |
| **Validate input** | `code` | Checa tipos dos campos obrigatórios e normaliza defaults. Produz `valid: boolean`. |
| **If** | `if` | `valid` → *Build prompt*; senão → *Respond invalid* (`"Não foi possível processar a mensagem agora."`). |
| **Build prompt** | `code` | Ordena o histórico por `createdAt`, escapa `<` e `>` do conteúdo do usuário (troca por `‹` `›`), e concatena: `directive` + `# Contexto desta conversa` com `<data_e_hora_atual>`, `<perfil_do_usuario>`, `<historico_recente>` + `# Lembrete final`. |
| **AI Agent** | `@n8n/n8n-nodes-langchain.agent` v3.1 | `text = currentMessage`, `systemMessage = systemPrompt`, `maxIterations = 8`, `onError: continueRegularOutput`. |
| **Groq Chat Model** | `lmChatGroq` | `openai/gpt-oss-120b`, `temperature 0.2`. |
| **create_event**, **find_active_events**, **delete_event** | `httpRequestTool` v4.2 | Uma tool por operação de eventos, com parâmetros tipados via `$fromAI(...)`. |
| **finance** | `httpRequestTool` v4.2 | Uma tool única com `operation` (string) e `data` (JSON serializado em string). |
| **Format response** | `code` | Pega `output` (ou `text`), faz `trim`, e cai num texto de desculpas se vier vazio. |
| **Respond to Webhook** | `respondToWebhook` | `{ response }`. |

Todas as tools apontam para `http://server:3000/...` (nome de serviço na rede interna), usam a credencial Header Auth e têm `neverError: true`, o que faz um `400` do backend virar *resultado* da tool em vez de erro do workflow. É esse detalhe que fecha o laço de correção: o modelo lê `"recurrenceMode must be one of HOUR, DAY, WEEK, MONTH"` e tenta de novo.

### 6.3 O system prompt em camadas

O prompt final tem três autores e é montado em três momentos:

```
┌───────────────────────────────────────────────────────────────┐
│ 1. DEFAULT_DIRECTIVE           (backend, estático, versionado)│
│    # Papel e objetivo                                         │
│    # Instruções (conversa, quando usar tools, dados           │
│      obrigatórios, depois da tool, datas e valores)           │
│    # Como raciocinar antes de responder                       │
│    # Formato da resposta                                      │
│    # Exemplos                                                 │
├───────────────────────────────────────────────────────────────┤
│ 2. renderToolsReference(ASSISTANT_TOOLS)  (backend, por boot) │
│    # Ferramentas disponíveis                                  │
│    ## Módulo events: ...    (uma tool por operação)           │
│    ### create_event · Quando usar · Campos · Exemplo · Obs.   │
│    ## Módulo finance: ...   (tool única "finance")            │
│    ### list_accounts ... ### delete_asset (27 operações)      │
├───────────────────────────────────────────────────────────────┤
│ 3. Contexto desta conversa            (n8n, por mensagem)     │
│    <data_e_hora_atual> ... </data_e_hora_atual>               │
│    <perfil_do_usuario> ... </perfil_do_usuario>               │
│    <historico_recente> <mensagem autor="usuario">...          │
│    # Lembrete final                                           │
└───────────────────────────────────────────────────────────────┘
```

A estrutura segue o esqueleto recomendado pelo guia de prompting do GPT-4.1 e incorpora os três "lembretes agênticos" (persistência, uso de ferramentas sem inventar dados, planejamento antes de cada chamada). Instruções essenciais aparecem no início e no fim (a técnica de *sandwich* para contextos longos). Markdown delimita instruções, XML delimita contexto e dados; JSON não é usado como conteúdo de prompt. O histórico é apresentado como demonstração implícita, por isso o escape de tags: uma mensagem do usuário nunca consegue fechar `</historico_recente>` e injetar instruções.

O [`ASSISTANT.md`](https://github.com/igoralbuquerque12/jarvis/blob/main/ASSISTANT.md) na raiz do repositório documenta o diagnóstico que levou a este desenho (o agente respondia "significado de bom dia" porque recebia um JSON de configuração como fala do usuário e tinha tools sem descrição e sem parâmetros) e cada técnica aplicada, com referências.

### 6.4 O catálogo de ferramentas como contrato

`assistant/tools/*.ts` declara `AssistantTool → AssistantToolEndpoint → AssistantToolOperation`:

```ts
{
  name: 'create_event',
  whenToUse: 'Criar um lembrete único ("me lembra amanhã às 9h de...") ou uma rotina recorrente ...',
  params: [
    'type (string, obrigatório): "UNIQUE" para um único envio ou "RECURRENCE" para repetição.',
    'startAt (string, obrigatório): data e hora ... em ISO-8601 com offset ... arredondado para 10 minutos.',
    ...
  ],
  example: { type: 'RECURRENCE', startAt: '2026-09-11T08:00:00-03:00', content: '...', recurrenceInterval: 1, recurrenceMode: 'DAY' },
  notes: 'Nunca envie recurrenceInterval ou recurrenceMode em eventos UNIQUE. ...',
}
```

Duas estratégias de exposição, escolhidas por módulo com o campo `rpcToolName`:

| Estratégia | Onde | Por quê |
|---|---|---|
| **Uma tool por operação, campos tipados** | events (3 operações) | O modelo vê um JSON Schema real para cada função e erra muito menos em campos e enums. Poucas operações, vale o nó extra no n8n. |
| **Tool única RPC (`operation` + `data`)** | finance (27 operações) | Trinta nós no n8n seriam inviáveis de manter. A precisão vem da referência detalhada no prompt e do feedback de validação do backend. `data` vai como string JSON porque o tipo `json` do `$fromAI` rejeita objetos vazios, e várias operações não têm parâmetros. |

O backend aceita `data` como objeto ou string (`ExecuteOperationDto` faz o parse com `@Transform`), e uma string inválida produz um `400` legível pelo modelo. `main.tools.spec.ts` garante que todo módulo aponta para `/*-m2m/:profileId` e que a forma do catálogo não regrediu.

### 6.5 Regras de comportamento do agente

Do prompt, as que mais influenciam a experiência:

- Cumprimento é cumprimento, não texto para analisar. O primeiro exemplo do prompt é exatamente `bom dia`.
- Um pedido claro de ação é autorização suficiente. Confirmação só antes de excluir ou quando há ambiguidade real.
- Se faltar um campo obrigatório, **não chama a ferramenta**: faz uma única pergunta objetiva.
- Se a ação depende de uma consulta (achar o id de um lembrete para cancelar), faz as duas na mesma rodada.
- Nunca menciona `profileId`, nomes de tools, JSON ou erros técnicos.
- Formato WhatsApp: 1 a 4 linhas, sem títulos, sem tabelas, `*negrito*` com moderação.

---

## 7. Identidade, onboarding e pareamento

![Sequência de cadastro, provisioning e pareamento](/images/projects/jarvis/docs/04-onboarding.webp)

### 7.1 better-auth fora do pipeline do Nest

`main.ts` cria o app com `bodyParser: false`, registra `toNodeHandler(authService.instance)` em `/api/auth` e **só depois** monta `express.json()` e `express.urlencoded()`. O better-auth precisa ler o corpo bruto; um parser global antes dele quebraria login e cadastro. Essa ordem é a única coisa "frágil" do bootstrap e está documentada no código.

Configuração relevante do `BetterAuthService`:

- `prismaAdapter` sobre o mesmo `PrismaService` (tabelas `user`, `session`, `account`, `verification`).
- E-mail/senha com `minPasswordLength: 8`, `autoSignIn`. Google opcional, ligado só se `GOOGLE_CLIENT_ID/SECRET` existem; `accountLinking` habilitado.
- `trustedOrigins: [WEB_ORIGIN]` e CORS com `credentials: true` no Nest, para o cookie de sessão funcionar entre `app.` e `api.`.
- `sendResetPassword` apenas **loga** a URL (não há provedor de e-mail).

Não existe guard global de sessão. Cada controller web chama `BetterAuthService.requireSession(request.headers)` explicitamente e, em seguida, `ProfileService.ensureAuthProfile(session.user)`. A escolha por chamadas explícitas em vez de um guard mantém o `main.ts` simples e deixa visível, em cada handler, que ele é autenticado.

### 7.2 O Profile nasce no hook

`databaseHooks.user.create.after` chama `ProfileService.ensureAuthProfile(user)`, que cria:

```
Profile {
  userId:          user.id
  name:            user.name ou a parte local do e-mail
  token:           10 caracteres [A-Z0-9], gerados com randomBytes
  jid:             user.email          ← placeholder, único
  about:           ''
  timezone:        'America/Sao_Paulo'
  subscriptionId:  Free Tier (criado se não existir)
}
```

e, em seguida, dispara `SecuroProvisioningService.provisionInBackground(profile)` sem `await`. O cadastro nunca espera nem falha por causa do Securo.

`ensureAuthProfile` é idempotente e é chamado em todo endpoint web autenticado. Isso cobre usuários criados antes do hook existir e torna o sistema autocorretivo.

### 7.3 Pareamento pelo WhatsApp

O `jid` provisório (o e-mail) satisfaz a constraint de unicidade sem colidir com números reais. O painel mostra o token e, se `VITE_WHATSAPP_NUMBER` estiver configurado, um botão `wa.me/<número>?text=Oi Jarvis! Este é o meu token de conexão: <token>`.

Quando uma mensagem chega de um `jid` desconhecido, `AssistantConnectionService` procura o token e, ao encontrar, sobrescreve o `jid` do perfil pelo `jid` real (`5511999999999@s.whatsapp.net`). `isWhatsappLinked(profile)` é simplesmente `jid.endsWith('@s.whatsapp.net')`, e a view `/profile/me` devolve o número mascarado (`5511*******99`).

Trocar de número é enviar o mesmo token do novo número: o `jid` é sobrescrito de novo.

### 7.4 Planos

`Subscription { name, price, limit }` com o Free Tier (`limit: 100`) criado sob demanda. O painel exibe os planos (`GET /subscriptions`) e o plano atual; a troca de plano e a aplicação do limite ainda não existem.

---

## 8. Gateway de WhatsApp

### 8.1 Uma sessão para toda a plataforma

O Jarvis usa **um único número** de WhatsApp. O multi-tenant acontece no mapeamento `jid → Profile`. O `WhatsappConnectionService` é um singleton `OnModuleInit` que abre o socket Baileys no boot e o mantém vivo pelo tempo de vida do processo.

### 8.2 Ciclo de vida da conexão

```
boot ──► connect()
          ├─ createAuthenticationState()  (carrega creds cifradas do Postgres)
          ├─ makeWASocket({ auth, printQRInTerminal: false, logger: silent })
          └─ handlers: creds.update, connection.update, messages.upsert

connection.update
  ├─ qr           → guarda o QR (exposto em GET /whatsapp/qr como data URL PNG)
  ├─ open         → connected = true, QR limpo
  └─ close
       ├─ loggedOut → clearAuth() (apaga whatsapp_auth) e reconecta (vai gerar QR novo)
       └─ outros    → reconecta após 3 s (flag reconnecting evita corrida)

onModuleDestroy → shuttingDown = true, fecha o socket sem reconectar
```

O Baileys é importado dinamicamente (`await import('@whiskeysockets/baileys')`) porque o pacote é ESM e o backend compila para CommonJS.

### 8.3 Credenciais cifradas no banco

O Baileys espera um `AuthenticationState` com `creds` e um `keys` store (`get`/`set` por tipo e id). `BaileysAuthStore` implementa isso sobre a tabela `whatsapp_auth (key, value json)`:

- `creds` fica na chave literal `creds`; as chaves de sinal ficam em `<tipo>:<id>` (ex. `pre-key:12`, `session:5511…`).
- Todo `value` passa por `WhatsappAuthCryptoService.encrypt` antes de ir para o banco: **AES-256-GCM**, IV aleatório de 12 bytes, auth tag, tudo em base64 num envelope `{ version: 1, algorithm, iv, authTag, ciphertext }`. A chave vem de `WHATSAPP_AUTH_ENCRYPTION_KEY` (32 bytes em base64, validado no construtor).
- Serialização usa `BufferJSON.replacer/reviver` do Baileys para preservar `Buffer`s, e `app-state-sync-key` é reidratado via protobuf.

Consequências: um dump do banco não expõe a sessão do WhatsApp; perder a chave de cifra obriga a escanear o QR de novo, mas não expõe nada.

### 8.4 Envio

`WhatsappSenderService.sendMessage(jid, text)` é o único ponto de saída, usado pelo loop de mensagens, pelo scheduler de eventos, pela API pública e pelo endpoint administrativo `POST /whatsapp/send`. Ele falha rápido (`503`) se o socket não está `open`.

### 8.5 Endpoints administrativos

`/whatsapp/qr`, `/whatsapp/status` e `/whatsapp/send` ficam atrás do `WhatsappAdminGuard`. O guard aceita a chave em `x-admin-key`, `x-whatsapp-admin-key`, `x-api-key` ou `Authorization: Bearer`, e compara com `timingSafeEqual` após checar o tamanho. O mesmo guard protege os controllers M2M, o que permite que a credencial Header Auth do n8n (que envia `x-api-key`) seja reutilizada.

---

## 9. Eventos: o motor de agendamento

### 9.1 Modelo em duas tabelas

| `EventSeries` (a regra) | `EventExecution` (o disparo) |
|---|---|
| `type: UNIQUE \| RECURRENCE` | `scheduledAt` (UTC, múltiplo de 10 min) |
| `startAt` | `content` (o texto que será enviado) |
| `recurrenceInterval`, `recurrenceMode: HOUR \| DAY \| WEEK \| MONTH` | `status: PENDING → PROCESSING → COMPLETED \| FAILED \| CANCELLED` |
| `active` | `observabilitys` (motivo da falha) |
| `profileId` | `@@unique([eventSeriesId, scheduledAt])`, `@@index([status, scheduledAt])` |

Separar regra de disparo permite que uma rotina tenha histórico (cada envio é uma linha com seu próprio estado), que cancelar seja desativar a série e marcar as pendentes, e que a próxima ocorrência seja gerada *depois* que a anterior terminou, sem gerar ocorrências infinitas antecipadamente.

O fuso horário fica no `Profile`, não na série. "Todo dia às 8h" significa 8h no fuso do usuário mesmo em mudanças de horário de verão, e mudar o fuso no perfil afeta as próximas ocorrências de todas as séries.

![Máquina de estados de EventExecution](/images/projects/jarvis/docs/06-events-states.webp)

### 9.2 Normalização para 10 minutos

`normalizeScheduledAt` arredonda qualquer instante para o múltiplo de 10 minutos mais próximo dentro da hora, com empate (xx:x5:00) arredondando **para frente**. Isso alinha todo disparo ao tick do cron: se o usuário pede 9:03, o lembrete sai às 9:00; se pede 9:07, às 9:10. O prompt avisa o modelo dessa regra e a confirmação ao usuário usa o horário já arredondado.

`getNextScheduledAt(scheduledAt, mode, interval, timezone)` converte para o fuso do perfil, soma `interval` unidades de `mode` com Luxon (que lida com meses de tamanhos diferentes e DST), normaliza, e **repete enquanto o resultado não for estritamente futuro**. Isso importa quando o server ficou fora do ar: uma rotina diária não gera 5 execuções atrasadas; ela pula para a próxima ocorrência válida.

### 9.3 O tick do scheduler

![Fluxo do scheduler de eventos](/images/projects/jarvis/docs/05-events-scheduler.webp)

`EventsSchedule.processDueEvents` roda com `@Cron(EVERY_10_MINUTES)`:

1. **Cache de janela no Redis.** A chave `events:schedule:pending-cache` guarda `[{ id, scheduledAt }]` das execuções `PENDING` de séries ativas com `scheduledAt ≤ agora + 2h`, com TTL de 2h. Se a chave existe, o banco **não é consultado** neste tick. Se não existe, uma única query a repopula. Na prática, o Postgres é lido uma vez a cada 2 horas, e não a cada 10 minutos.
2. **Seleção dos vencidos** em memória (`scheduledAt ≤ agora`). Se não há nenhum, o tick termina sem tocar em nada.
3. **Reescrita do cache** só com os futuros, preservando o TTL (`KEEPTTL`), para que um vencido nunca seja processado duas vezes.
4. **Claim atômico.** Carrega as execuções por id (com série e perfil) e faz `updateMany({ id IN ids, status: PENDING, série ativa }) → PROCESSING`. O predicado `status: PENDING` no `WHERE` garante que só quem ainda estava pendente é reservado.
5. **Envio sequencial.** Para cada execução: `sendMessage(profile.jid, content)`; sucesso → `COMPLETED`, erro → `FAILED` com a mensagem em `observabilitys`.
6. **Próxima ocorrência.** `UNIQUE` → desativa a série. `RECURRENCE` → calcula o próximo instante e faz `INSERT`; um `P2002` (violação da unique) é capturado e ignorado, porque significa que aquela ocorrência já existe.

### 9.4 Invalidação do cache

`EventsM2mService.createEvent` compara o `startAt` normalizado com `agora + 2h`: se cair na janela, faz `DEL` da chave. O próximo tick repopula e enxerga o evento novo. Eventos fora da janela entram naturalmente na próxima repopulação. `deleteEvent` não invalida: as execuções canceladas são filtradas no `findManyByIdsForProcessing` (que exige `status: PENDING` e série ativa), então um id cancelado que ainda está no cache simplesmente não é reservado.

### 9.5 Endpoints

| Rota | Auth | Operações |
|---|---|---|
| `POST /events-m2m/:profileId/execute` | admin key | `create_event`, `find_active_events` (filtros `scheduledAt=YYYY-MM-DD` no fuso do perfil, `type`), `delete_event`, `get_guideline` |
| `GET /events/me` | sessão | Execuções `PENDING`/`PROCESSING` de séries ativas do perfil logado |
| `DELETE /events/me/series/:id` | sessão | Desativa a série se ela pertencer ao perfil (`404` caso contrário, sem revelar existência) |

---

## 10. Finanças: o Securo como motor invisível

### 10.1 Por que vendorizar um gestor financeiro

Construir contas, transações, categorias, regras, metas, recorrências e investimentos do zero seria o maior módulo do projeto. O [Securo](https://docs.usesecuro.com/docs) já resolve tudo isso com um modelo de dados maduro, API REST, multi-workspace e um Celery Beat que materializa recorrências (salário no dia 5, assinatura no dia 10) sem que o Jarvis precise de mais um scheduler. O frontend do Securo não é usado; o Jarvis é a única interface.

### 10.2 Um usuário do Securo por perfil

![Provisioning e autenticação no Securo](/images/projects/jarvis/docs/07-finance-provisioning.webp)

Cada `Profile` tem um `SecuroAccount` (1:1) com `email`, `securoUserId`, `workspaceId`, `defaultAccountId` e `status: PENDING | ACTIVE | FAILED`. A criação:

1. **Credenciais determinísticas.** `email = profile-<profileId>@jarvis.internal`, `senha = HMAC-SHA256(SECURO_PROVISION_SECRET, profileId)`. Nenhuma senha é armazenada; qualquer instância do backend com o mesmo segredo consegue logar como qualquer perfil. Trocar o segredo invalida todas as senhas (por isso essa variável nunca deve ser rotacionada sem um plano de migração).
2. **Admin de serviço.** No primeiro contato com uma instância vazia (`GET /api/setup/status → has_users: false`), o backend chama `POST /api/setup/create-admin` com `SECURO_ADMIN_*`, moeda BRL e idioma pt-BR. Depois disso, é login normal. O token admin é cacheado no Redis.
3. **Criação via admin.** `POST /api/admin/users` (o registro público do Securo tem rate limit de 3 por hora por IP, inviável para um servidor). O Securo cria sozinho o workspace "Pessoal", a conta "Carteira", 16 categorias em pt-BR e regras universais. Um `already exists` é tratado como sucesso (reprovisioning).
4. **Descoberta.** Login como o perfil, `GET /api/workspaces` (pega o primeiro), `GET /api/accounts` (pega o primeiro ou cria "Carteira"). Tudo gravado, status `ACTIVE`.

Qualquer falha marca `FAILED` com o motivo em `observabilitys` e **não** lança para quem chamou o cadastro. Na próxima operação financeira, `SecuroContextService.contextFor(profileId)` chama `ensureSecuroAccount` de novo, que só faz curto-circuito se o status for `ACTIVE` com ids preenchidos. É o mecanismo de autocorreção: um Securo fora do ar na hora do cadastro se resolve sozinho no primeiro "gastei 50 no mercado".

### 10.3 Tokens e cache

O Securo emite JWTs de 24h sem refresh, e o login tem rate limit de 5 por minuto por IP. Os tokens (admin e por perfil) são cacheados no Redis por **23h** (`finance:securo:user-token:<profileId>`, `finance:securo:admin-token`). Cada perfil loga no máximo uma vez por dia. Toda chamada de domínio leva `Authorization: Bearer` e `X-Workspace-Id`.

### 10.4 Tradução de contratos

`SecuroApiService` é o cliente HTTP mínimo (`fetch`, query string, form ou JSON, cabeçalhos) e traduz erros: `400/409/422 → BadRequestException` com o `detail` do Securo, `404 → NotFoundException`, resto → `Error`. Como o `detail` chega ao modelo via `neverError`, a validação do Securo também participa do laço de correção.

Os services de domínio (`AccountsService`, `TransactionsService`, ...) aplicam as regras de tradução, todas cobertas por testes:

| Regra | Motivo |
|---|---|
| Valores sempre positivos; direção em `type: debit \| credit` | O Securo não valida esses enums (string livre). Os DTOs validam com `@IsIn` antes de enviar. |
| Dinheiro como string com 2 casas (`"50.00"`) | O Securo usa `Numeric(15,2)`; evita ruído de float. |
| Datas `YYYY-MM-DD` sem hora | Modelo do Securo. |
| `camelCase → snake_case`, campos `undefined` omitidos | `PATCH` do Securo é `exclude_unset`: omitido significa "não mexe". |
| `accountId` omitido → `defaultAccountId` ("Carteira") | O usuário raramente diz de qual conta saiu o dinheiro. |
| Moeda default BRL; em transações, a moeda da conta | |
| Enums (tipos de conta, frequências, tipos de ativo, operadores de regra) centralizados em `securo-vocab.constant.ts` | Fonte única para DTOs e para o catálogo de tools. |

### 10.5 Duas fachadas, um serviço

| Fachada | Rota | Auth | Quem usa |
|---|---|---|---|
| M2M (RPC) | `POST /finance-m2m/:profileId/execute` com `{ operation, data }` | admin key | n8n |
| Web (REST) | `/finance/me/accounts`, `/finance/me/transactions[/:id]`, `/finance/me/categories`, `/rules`, `/goals`, `/recurring-transactions`, `/assets[/:id/values|trades]` | sessão | frontend |

As 27 operações do RPC mapeiam 1:1 para os métodos dos services. `GET .../transactions` aceita `from`, `to`, `type`, `categoryId`, `accountId`, `q`, `page`, `limit` e devolve o envelope do Securo `{ items, total, page, limit, summary: { income, expense, net } }`. O `summary` é o que responde "quanto gastei esse mês" sem somar no cliente.

Decisões de segurança de produto: o endpoint destrutivo `apply-all` de regras do Securo não foi exposto; metas têm progresso manual (o modelo consulta e soma); vender mais unidades de um ativo do que se tem é rejeitado pelo próprio Securo (`422`).

---

## 11. API pública e chaves de API

### 11.1 Chaves

`ApiKey { profileId, name, prefix, hash, active, lastUsedAt }`. Geração:

```
secret = 'jrv_' + base64url(randomBytes(24))          // ex. jrv_k9Xw...  (36 chars)
prefix = secret.slice(0, 12)                          // jrv_k9Xw1a2b   (exibido na UI)
hash   = sha256(secret)                               // única coisa persistida do segredo
```

O `secret` é devolvido **uma única vez** na resposta do `POST /api-keys/me`. Limite de 10 chaves por perfil. `active: false` pausa sem apagar. `lastUsedAt` é atualizado a cada uso de forma best-effort (a promessa não é aguardada e erros são engolidos), para nunca adicionar latência ou falha à requisição do cliente.

### 11.2 Guard

`ApiKeyGuard` lê `Authorization: Bearer <chave>` (preferido) ou `x-api-key`, rejeita cedo o que não parece uma chave (`looksLikeApiKey`), calcula o hash, busca `ApiKey` + `Profile` por `hash` (coluna `@unique`, índice por construção) e recusa com `401` se a chave não existe, está inativa ou o perfil está inativo. Ao passar, grava `request.apiKeyProfile`, exposto por `@ApiKeyProfile()`.

### 11.3 Superfície pública

Tudo vive em `/v1` com `@UseGuards(ApiKeyGuard)` na classe. Hoje: `POST /v1/messages { message }` envia texto para o WhatsApp **do dono da chave** (`409` se ainda não pareou, `503` se o socket está fora). O cliente nunca informa destinatário: uma chave só consegue falar com quem a criou, o que elimina spam por design.

Adicionar um endpoint público é: DTO em `dto/`, método no service, rota no controller, documentar no README do módulo e na página `/configuracoes/documentacao` do frontend.

---

## 12. Modelo de dados

![Diagrama entidade-relacionamento](/images/projects/jarvis/docs/08-data-model.webp)

### 12.1 Entidades

| Tabela | Dono | Notas de design |
|---|---|---|
| `user`, `session`, `account`, `verification` | better-auth | Esquema do better-auth mapeado no Prisma. `account.password` guarda o hash para o provedor de credenciais. |
| `profiles` | Jarvis | Pivô do domínio. `userId` é `unique` e **nullable** para permitir perfis criados por seed (sem usuário web). `token` e `jid` são `unique`. `about` alimenta o prompt. `timezone` é IANA. |
| `subscriptions` | Jarvis | `price Decimal(10,2)`, `limit Int`. |
| `messages` | Jarvis | `userId` (na verdade `profile.id`) indexado, sem FK. Só as 10 últimas são lidas por mensagem; a tabela cresce linearmente com o uso. |
| `event_series`, `event_executions` | Jarvis | Ver [seção 9](#9-eventos-o-motor-de-agendamento). `onDelete: Cascade` a partir do perfil. Índice composto `(status, scheduledAt)` serve a query de janela do scheduler. |
| `securo_accounts` | Jarvis | 1:1 com o perfil. Guarda ids do Securo e estado do provisioning. |
| `api_keys` | Jarvis | `hash unique`, índice em `profileId`. |
| `whatsapp_auth` | Jarvis | Key-value cifrado da sessão Baileys. Uma sessão por instalação. |

### 12.2 Migrations

Dez migrations versionadas em `server/prisma/migrations`, aplicadas por `prisma migrate deploy` no container `migrate`. O Prisma 7 lê schema, caminho de migrations, comando de seed e `DATABASE_URL` de `prisma.config.ts`; o bloco `datasource` do schema não tem `url`. Após qualquer mudança no schema: `npx prisma migrate dev --name <nome>` e `npx prisma generate`.

### 12.3 Dados fora do Postgres do Jarvis

- **Securo** tem seu próprio Postgres 16 com todo o domínio financeiro (workspaces, contas, transações, categorias, regras, metas, recorrências, ativos, anexos em volume). O Jarvis guarda apenas os ponteiros (`securo_accounts`).
- **Redis**: `events:schedule:pending-cache` (TTL 2h), `finance:securo:admin-token` e `finance:securo:user-token:<profileId>` (TTL 23h). Tudo é reconstruível; um `FLUSHDB` só causa uma query e alguns logins a mais.
- **n8n**: workflows e credenciais no volume `n8n_data`; o workflow está versionado em `n8n.json`.

---

## 13. Persistência e infraestrutura

### 13.1 Prisma 7 com driver adapter

`PrismaService` estende `PrismaClient` e passa `new PrismaPg({ connectionString })` como `adapter`. O Neon expõe um *pooler* (PgBouncer em modo transação) que não é compatível com o protocolo do engine padrão do Prisma; o driver adapter sobre `pg` resolve isso e também funciona com qualquer Postgres local. `$connect` no `onModuleInit`, `$disconnect` no `onModuleDestroy`.

### 13.2 Redis

Cliente `redis` v6, conectado no `onModuleInit` e fechado com `quit` no destroy. Módulo `@Global()` porque três módulos distintos o consomem (events, finance, e potencialmente outros). O compose liga `--appendonly yes`; o cache é descartável, mas o Securo usa o mesmo Redis como broker do Celery e como rate limiter de login, e aí a durabilidade importa.

### 13.3 Configuração

`ConfigModule.forRoot({ isGlobal: true })` carrega `server/.env`. Serviços que dependem de segredos validam a presença no construtor e falham o boot com mensagem clara (`WHATSAPP_AUTH_ENCRYPTION_KEY must decode to exactly 32 bytes`, `REDIS_URL environment variable is required`). Falhar cedo é preferível a um server que sobe e quebra na primeira mensagem.

---

## 14. Frontend

### 14.1 Stack e organização

React 19 + Vite 8 + TypeScript 6, React Router 7, Recharts para gráficos. Sem UI kit: o design system é CSS puro com tokens (`--bg #faf5ec`, `--accent #f4690f`, Michroma/Orbitron/Space Grotesk) e componentes próprios em `components/ui` (`Card`, `Stat`, `Badge`, `Modal`, `Segmented`, `EmptyState`, `Wordmark`...).

```
src/
├── features/
│   ├── auth/         login, reset de senha, AuthLayout
│   ├── dashboard/    KPIs do mês, próximos lembretes, gráfico, metas, card de conexão do WhatsApp, plano
│   ├── finance/      overview, lançamentos, recorrências, metas, investimentos, configurações (contas, categorias, regras)
│   ├── plans/        planos
│   ├── profile/      nome, "sobre você" (alimenta o prompt), fuso horário
│   └── settings/     chaves de API e documentação da API
├── components/layout AppShell (sidebar), RequireAuth
├── hooks/            use-my-profile, use-my-events, use-my-transactions, use-finance-summary, ...
├── services/         um cliente por recurso, sobre apiFetch
└── lib/              apiFetch (credentials: include, ApiError), authClient (better-auth/react), config, dates, format
```

### 14.2 Sessão e proteção de rotas

`authClient = createAuthClient({ baseURL: <api>/api/auth })` do `better-auth/react`. `RequireAuth` usa `authClient.useSession()`: spinner enquanto carrega, redirect para `/login` sem sessão. Toda chamada à API vai com `credentials: 'include'`; o cookie é o único estado de autenticação, sem tokens no `localStorage`.

### 14.3 Padrões de dados

Cada recurso tem um hook `use-my-*` que encapsula loading, erro e `reload`, e um service que conhece as rotas. Os componentes recebem dados prontos. Erros da API (`{ message }` string ou array do `ValidationPipe`) são normalizados em `ApiError` com o texto para exibir.

O modo privacidade (`privacy-context`) oculta valores monetários na tela inteira com um toggle, persistido localmente.

---

## 15. Estratégia de testes

Testes unitários com Jest 30 e ts-jest, colocados em `tests/` dentro de cada módulo. O foco é **regra de negócio e contrato**, com serviços de infraestrutura mockados:

| Suíte | O que protege |
|---|---|
| `get-next-scheduled-at.spec` | Arredondamento (empate para frente), avanço por modo e intervalo, resultado sempre no futuro, fuso horário. |
| `events-m2m.service.spec` | Validação de recorrência (UNIQUE sem campos, RECURRENCE com ambos), normalização, invalidação do cache dentro da janela, filtros de dia no fuso do perfil. |
| `events.schedule.spec` | Repopulação e uso do cache, claim, transições de estado, `FAILED` com motivo, criação da próxima ocorrência, tolerância a `P2002`. |
| `build-system-prompt.spec` | Contexto temporal com offset, fallback de fuso, todas as operações renderizadas, ordem das seções. |
| `main.tools.spec` | Forma do catálogo; todo módulo aponta para `/*-m2m/:profileId`. |
| 7 suítes de finanças | Tradução DTO → Securo por área (conta padrão, dinheiro como string, snake_case, `PATCH` parcial, defaults). |
| `securo-provisioning.service.spec` | Curto-circuito de `ACTIVE`, fluxo completo, `FAILED`, cache de token. |
| `api-keys.service.spec`, `api-key.guard.spec`, `generate-api-key.spec`, `extract-api-key.spec` | Formato, hash, limite, recusas, `lastUsedAt` best-effort. |
| `public-api.service.spec` | `409` sem WhatsApp pareado. |
| `whatsapp-admin.guard.spec` | Headers aceitos e rejeições. |

Resultado atual: **19 suítes, 78 testes, todos passando**. O `test/` na raiz do server tem a estrutura de e2e (`jest-e2e.json`, supertest) pronta para crescer.

Além dos testes automatizados, o `ASSISTANT.md` define um conjunto de casos de conversa (cumprimento sem tool, lembrete único, lembrete sem horário que deve gerar pergunta, rotina diária, listagem, cancelamento em duas etapas, gasto, total do mês) para reteste manual a cada mudança de prompt ou de modelo.

---

## 16. Decisões de arquitetura e trade-offs

| Decisão | O que se ganha | O que custa |
|---|---|---|
| Monólito modular com n8n e Securo como serviços satélites, não microserviços | Deploy simples e transações locais; trocar modelo ou motor financeiro não toca o core. | Uma falha do Securo ou do n8n é sentida sincronamente. |
| O modelo roda no n8n, não no backend | Troca de modelo sem deploy e execuções do agente inspecionáveis. | Um salto de rede a mais; o comportamento do agente fica em dois lugares, mitigado versionando o `n8n.json`. |
| Catálogo de ferramentas declarado em TypeScript e renderizado no prompt | Fonte única e testada; uma capacidade nova é um `case` no controller e uma entrada no catálogo. | O prompt cresce com o catálogo. |
| Cron de 10 minutos com cache de janela, em vez de fila | Uma query no banco a cada 2h e zero infraestrutura extra. | Sem retry e sem paralelismo entre instâncias. |
| Vendorizar o Securo em vez de construir o domínio financeiro | Meses de trabalho evitados e isolamento real por usuário. | Dois bancos e um domínio que o Jarvis não controla. |
| Uma sessão de WhatsApp, uma instância de server | Simplicidade máxima e custo mínimo. | Escalar horizontalmente exige extrair o gateway e coordenar o cron. |
| better-auth antes do body parser, sem guard global | Autenticação visível em cada handler. | Lembrar da ordem no `main.ts` e do `requireSession` em cada rota nova. |
| Zod na fronteira externa, class-validator dentro | Cada biblioteca onde é mais forte. | Duas bibliotecas de validação. |

---

## 17. Glossário

| Termo | Significado |
|---|---|
| **jid** | Identificador do WhatsApp (`5511999999999@s.whatsapp.net`). Chave de roteamento entre mensagens e perfis. |
| **Profile** | Unidade de isolamento do Jarvis: uma pessoa, um número, um fuso, um usuário no Securo. |
| **Token de pareamento** | 10 caracteres `[A-Z0-9]` gerados no cadastro; enviados pelo WhatsApp para vincular o número ao perfil. |
| **M2M** | *Machine to machine*. Endpoints usados pelo n8n, protegidos por chave estática e pela rede privada. |
| **RPC (`execute`)** | Endpoint único por módulo que recebe `{ operation, data }`. |
| **Catálogo de tools (`ASSISTANT_TOOLS`)** | Declaração tipada do que o agente pode fazer, renderizada no prompt. |
| **Directive** | Prompt estático + catálogo renderizado; parte do payload para o n8n. |
| **Série / Execução** | Regra de um evento / um disparo concreto com estado. |
| **Janela do scheduler** | 2 horas de execuções pendentes cacheadas no Redis. |
| **Securo** | Gestor financeiro open source vendorizado como motor interno. |
| **Provisioning** | Criação do usuário, workspace e conta padrão de um perfil no Securo. |
| **Baileys** | Biblioteca que implementa o protocolo do WhatsApp Web em Node. |
| **better-auth** | Biblioteca de autenticação usada para sessão, e-mail/senha e Google. |
| **`$fromAI`** | Mecanismo do n8n para declarar, num parâmetro de nó, um argumento que o modelo preenche. |
| **`neverError`** | Opção do nó HTTP do n8n que transforma respostas 4xx/5xx em resultado da tool. |

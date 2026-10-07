# How Jarvis works under the hood

This guide walks through the architecture and system design of **Jarvis**, a personal assistant on WhatsApp with reminders, routines, personal finance, a web dashboard and a public API. It covers each view of the system, each flow and each decision, along with the trade-offs accepted along the way.

The code is at [github.com/igoralbuquerque12/jarvis](https://github.com/igoralbuquerque12/jarvis).

## 1. Goals and design principles

Jarvis started from a simple question: *what if the assistant's interface were the app people already open fifty times a day?* WhatsApp is the channel, not one channel among others. That shapes almost everything that follows: there is no web chat, perceived latency is that of a conversation, and the answer has to fit in a message bubble.

Five principles guided the decisions and show up repeatedly throughout this document:

| Principle | What it means in practice |
|---|---|
| **WhatsApp-first** | The core receives and sends messages over a persistent Baileys socket. The web dashboard is complementary: onboarding, visualization and configuration. |
| **The model is an implementation detail** | The backend knows no LLM SDK. It produces one contract (prompt + tool catalog + context) and consumes another (`{ response }`). The model itself runs in n8n. |
| **A typed contract between human, model and code** | Everything the model can do is declared in TypeScript, validated by DTOs in the backend and covered by tests. Validation errors are part of the protocol, not exceptions. |
| **Per-user isolation at every layer** | `Profile` is the unit of isolation: history, events, API keys, and a dedicated user (with its own workspace) in the finance engine. The `profileId` always comes from the server, never from the client. |
| **Cost and operational simplicity** | One VPS, one `docker compose`, one free managed database, one Redis. A cache to avoid hammering the database, cron instead of a queue, no Kubernetes. |

---

## 2. Context view

![Context diagram](/images/projects/jarvis/docs/en/01-context.webp)

The system has two kinds of human user (the person chatting and that same person using the dashboard), one kind of machine client (the user's own systems, authenticated by API key) and four external systems: the WhatsApp servers, the LLM provider (Groq), the managed database (Neon) and, somewhere in between, Securo and n8n, which run on the same VPS but are processes with their own lifecycle.

The boundaries that matter:

- **Between the user and Jarvis** there are only two paths: WhatsApp (messages) and HTTPS (dashboard). The dashboard never sends messages to the assistant; it reads and edits data.
- **Between Jarvis and the AI** the contract is a synchronous HTTP webhook, protected by a key, plus a set of HTTP callbacks also protected by a key. n8n does not access the database.
- **Between Jarvis and Securo** the contract is Securo's REST API, authenticated with a per-user JWT and a workspace header. Securo does not know Jarvis exists; it only sees users with `profile-<uuid>@jarvis.internal` emails.

---

## 3. Container and deployment view

![Container diagram](/images/projects/jarvis/docs/en/02-containers.webp)

| Service (`compose.yml`) | Image / build | Role | Depends on |
|---|---|---|---|
| `migrate` | `server/Dockerfile` (target `builder`) | Runs `npx prisma migrate deploy` and exits. | — |
| `server` | `server/Dockerfile` (target `production`) | NestJS API, WhatsApp socket, scheduler. | `migrate` (exit 0), `redis` (healthy), `securo-backend` (started) |
| `web` | `web/Dockerfile` | nginx serving the static Vite build. | `server` |
| `redis` | `redis:7-alpine` | Jarvis cache (db 0) and Securo broker/cache (db 1). AOF enabled. | — |
| `securo-db` | `pgvector/pgvector:pg16` | Securo's Postgres, volume `securo-pgdata`. | — |
| `securo-migrate` | `securo/backend` | Runs `alembic upgrade head` and exits. | `securo-db` (healthy), `redis` (healthy) |
| `securo-backend` | `securo/backend` | Securo's FastAPI API on `:8000`. | `securo-migrate` (exit 0) |
| `securo-celery-worker` | `securo/backend` | Securo's background jobs. | same |
| `securo-celery-beat` | `securo/backend` | Scheduler: materializes recurrences and applies asset rules every hour. | same |
| `n8n` | `docker.n8n.io/n8nio/n8n` (outside the compose file) | Agent orchestrator. Attached to the network with `docker network connect`. | — |

---

## 4. Backend component view

![NestJS module graph](/images/projects/jarvis/docs/en/10-modules.webp)

### 4.1 Modules and responsibilities

| Module | Responsibility | Main pieces |
|---|---|---|
| `PrismaModule` (global) | Connection to Postgres through a driver adapter. | `PrismaService extends PrismaClient` with `PrismaPg`. |
| `RedisModule` (global) | A single Redis client, connected at boot. | `RedisService.getClient()`. |
| `AuthModule` | The better-auth instance, sessions, user creation hooks. | `BetterAuthService` (`instance`, `getSession`, `requireSession`). |
| `ProfileModule` | The `Profile`: creation from the authenticated user, pairing token, view for the web. | `ProfileService.ensureAuthProfile`, `toProfileMeView`. |
| `SubscriptionModule` | Plans. Guarantees the Free Tier exists. | `SubscriptionService.ensureDefaultSubscription`. |
| `MessagesModule` | Conversation history per profile. | `MessagesService.findAll({ userId, take })`. |
| `WhatsappModule` | Baileys socket, receiving, sending, encrypted credentials, admin guard. | `WhatsappConnectionService`, `WhatsappReceiverService`, `WhatsappSenderService`, `BaileysAuthStore`, `WhatsappAuthCryptoService`, `WhatsappAdminGuard`. |
| `AssistantModule` | The message loop, the prompt, the tool catalog, the n8n client and pairing. | `AssistantMainService`, `AssistantWorkflowService`, `AssistantConnectionService`, `ASSISTANT_TOOLS`, `buildDirective`. |
| `EventsModule` | Series and executions, scheduler, M2M and web endpoints. | `EventsSchedule` (`@Cron`), `EventsM2mService`, `EventSeriesService`, `EventExecutionService`. |
| `FinanceModule` | Securo client, provisioning, per-profile context, 7 domain submodules, M2M facade. | `SecuroApiService`, `SecuroProvisioningService`, `SecuroContextService`, `FinanceM2mController`, one `*Service` per area. |
| `ApiKeysModule` | Key lifecycle and the API key guard. | `ApiKeysService`, `ApiKeyGuard`, `@ApiKeyProfile()`. |
| `PublicApiModule` | Public `/v1/*` routes. | `PublicApiController`, `PublicApiService`. |

### 4.2 Dependencies and the WhatsApp ⇄ Assistant cycle

The graph has one legitimate circular dependency: `WhatsappModule` needs `AssistantMainService` (to deliver incoming messages) and `AssistantModule` needs `WhatsappSenderService` (to reply). It is resolved with `forwardRef()` on both sides and, inside `WhatsappSenderService`, with `@Inject(forwardRef(() => WhatsappConnectionService))`.

The other `forwardRef`s (`Auth ⇄ Profile`, `Auth → Finance`) exist because better-auth's user creation hook needs `ProfileService` and `SecuroProvisioningService`, while the controllers of those modules need `BetterAuthService` to validate the session.

### 4.3 Conventions that keep it modular

- Every module follows `controllers/ services/ dto/ entities/ utils/ schedules/ tests/`. Tests are colocated with the module (Jest's `rootDir` is `src`).
- **Two facades per capability.** Events and finance each expose an M2M controller (`/*-m2m/:profileId/execute`, admin guard, `profileId` in the route) and a web controller (`/*/me/*`, session, `profileId` resolved from the session). Both call the same services.
- **RPC on the M2M side.** Instead of one REST endpoint per operation, the M2M controllers receive `{ operation, data }` (`ExecuteOperationDto`) and `switch` to the right DTO, validating with `validateDto()` (`plainToInstance` + `validateOrReject`). This cut dozens of n8n nodes down to four.
- **Two families of validation.** Internal DTOs use class-validator (wired into the global `ValidationPipe` with `whitelist`, `forbidNonWhitelisted`, `transform`). External payloads (the n8n response, the critical Securo responses) use Zod. The rule: *what comes in from outside is parsed, what travels inside is declared.*
- **Language.** User-facing strings, prompts and module docs are in pt-BR; identifiers, new comments and commits are in English.

---

## 5. The message loop

This is the product's critical path: from the message arriving on WhatsApp to the reply going back.

1. **Receiving.** `WhatsappReceiverService` filters what Baileys delivers: it ignores synced history, messages sent by the assistant itself and anything without text. The rest goes to `AssistantMainService` without awaiting, so the socket is never blocked.
2. **Profile.** The sender is resolved by `jid`. An unknown number only gets a reply if the message carries a valid pairing token; anything else is ignored, so Jarvis does not become a bot that answers any number.
3. **Context.** The last 10 messages are loaded before the current one is saved, so it does not show up twice in the history.
4. **Agent.** The backend sends n8n the prompt, the tool catalog, the profile's free text, the history and the date and time in the user's time zone. The response is validated with Zod.
5. **Reply.** The text is saved and sent through `WhatsappSenderService`. There is no retry: a failure means silence for the user, who naturally sends the message again.

The loop is stateless per message: all context comes from the database, so restarting the server loses no conversation. Latency is dominated by the model (1 to 3 iterations is typical) and by the HTTP callbacks; the backend adds two reads and two writes on Postgres.

---

## 6. The AI layer: n8n as the orchestrator

![Prompt assembly and the n8n workflow](/images/projects/jarvis/docs/en/11-agent-prompt.webp)

### 6.1 Why n8n

Running the model inside NestJS would be more direct. Choosing n8n was deliberate, for three reasons:

1. **Swapping models without a deploy.** The `Groq Chat Model` node can be replaced with OpenAI, Anthropic, Ollama or anything else that supports function calling, just by editing the workflow. The contract with the backend does not change.
2. **Agent observability for free.** Every n8n execution shows the assembled prompt, each tool call, each backend response and the final text. Debugging model behavior becomes a matter of looking at a screen, not instrumenting code.
3. **Separation of responsibilities.** The backend owns the *contract* (what the agent can do, with which data, under which rules). n8n owns the *execution* (which model, at what temperature, how many iterations).

The cost is one extra network hop per message and a dependency on an additional service. [Section 16](#16-architecture-decisions-and-trade-offs) discusses the alternative.

### 6.2 The workflow

The [`n8n.json`](https://github.com/igoralbuquerque12/jarvis/blob/main/n8n.json) file is versioned and importable. Nodes, in order:

| Node | Type | What it does |
|---|---|---|
| **Webhook** | `webhook` v2.1, `POST /webhook/assistant`, Header Auth | Receives the payload. Responds through the *Respond to Webhook* node (`responseMode: responseNode`). |
| **Validate input** | `code` | Checks the types of the required fields and normalizes defaults. Produces `valid: boolean`. |
| **If** | `if` | `valid` → *Build prompt*; otherwise → *Respond invalid* (`"Não foi possível processar a mensagem agora."`, i.e. "The message could not be processed right now."). |
| **Build prompt** | `code` | Sorts the history by `createdAt`, escapes `<` and `>` in user content (replacing them with `‹` `›`), and concatenates: `directive` + `# Contexto desta conversa` (context of this conversation) with `<data_e_hora_atual>`, `<perfil_do_usuario>`, `<historico_recente>` + `# Lembrete final` (final reminder). |
| **AI Agent** | `@n8n/n8n-nodes-langchain.agent` v3.1 | `text = currentMessage`, `systemMessage = systemPrompt`, `maxIterations = 8`, `onError: continueRegularOutput`. |
| **Groq Chat Model** | `lmChatGroq` | `openai/gpt-oss-120b`, `temperature 0.2`. |
| **create_event**, **find_active_events**, **delete_event** | `httpRequestTool` v4.2 | One tool per event operation, with typed parameters via `$fromAI(...)`. |
| **finance** | `httpRequestTool` v4.2 | A single tool with `operation` (string) and `data` (JSON serialized as a string). |
| **Format response** | `code` | Takes `output` (or `text`), calls `trim`, and falls back to an apology text if it comes back empty. |
| **Respond to Webhook** | `respondToWebhook` | `{ response }`. |

All tools point to `http://server:3000/...` (the service name on the internal network), use the Header Auth credential and have `neverError: true`, which turns a `400` from the backend into the tool's *result* instead of a workflow error. That detail is what closes the correction loop: the model reads `"recurrenceMode must be one of HOUR, DAY, WEEK, MONTH"` and tries again.

### 6.3 The layered system prompt

The final prompt has three authors and is assembled at three points in time:

```
┌───────────────────────────────────────────────────────────────┐
│ 1. DEFAULT_DIRECTIVE             (backend, static, versioned) │
│    # Papel e objetivo                                         │
│    # Instruções (conversation, when to use tools, required    │
│      data, after the tool, dates and amounts)                 │
│    # Como raciocinar antes de responder                       │
│    # Formato da resposta                                      │
│    # Exemplos                                                 │
├───────────────────────────────────────────────────────────────┤
│ 2. renderToolsReference(ASSISTANT_TOOLS)  (backend, per boot) │
│    # Ferramentas disponíveis                                  │
│    ## Módulo events: ...    (one tool per operation)          │
│    ### create_event · Quando usar · Campos · Exemplo · Obs.   │
│    ## Módulo finance: ...   (single "finance" tool)           │
│    ### list_accounts ... ### delete_asset (27 operations)     │
├───────────────────────────────────────────────────────────────┤
│ 3. Contexto desta conversa            (n8n, per message)      │
│    <data_e_hora_atual> ... </data_e_hora_atual>               │
│    <perfil_do_usuario> ... </perfil_do_usuario>               │
│    <historico_recente> <mensagem autor="usuario">...          │
│    # Lembrete final                                           │
└───────────────────────────────────────────────────────────────┘
```

The structure follows the skeleton recommended by the GPT-4.1 prompting guide and incorporates the three "agentic reminders" (persistence, using tools instead of making up data, planning before each call). Essential instructions appear at the beginning and at the end (the *sandwich* technique for long contexts). Markdown delimits instructions, XML delimits context and data; JSON is not used as prompt content. The history is presented as an implicit demonstration, hence the tag escaping: a user message can never close `</historico_recente>` and inject instructions.

[`ASSISTANT.md`](https://github.com/igoralbuquerque12/jarvis/blob/main/ASSISTANT.md) at the repository root documents the diagnosis that led to this design (the agent used to answer with the "meaning of bom dia" (good morning) because it received a configuration JSON as if it were the user's message and had tools with no description and no parameters) and each technique applied, with references.

### 6.4 The tool catalog as a contract

`assistant/tools/*.ts` declares `AssistantTool → AssistantToolEndpoint → AssistantToolOperation`:

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

Two exposure strategies, chosen per module through the `rpcToolName` field:

| Strategy | Where | Why |
|---|---|---|
| **One tool per operation, typed fields** | events (3 operations) | The model sees a real JSON Schema for each function and makes far fewer mistakes on fields and enums. With so few operations, the extra n8n node is worth it. |
| **Single RPC tool (`operation` + `data`)** | finance (27 operations) | Thirty nodes in n8n would be unmaintainable. Precision comes from the detailed reference in the prompt and from the backend's validation feedback. `data` travels as a JSON string because `$fromAI`'s `json` type rejects empty objects, and several operations take no parameters. |

The backend accepts `data` as an object or a string (`ExecuteOperationDto` parses it with `@Transform`), and an invalid string produces a `400` the model can read. `main.tools.spec.ts` guarantees that every module points to `/*-m2m/:profileId` and that the shape of the catalog has not regressed.

### 6.5 Agent behavior rules

From the prompt, the ones that shape the experience the most:

- A greeting is a greeting, not text to be analyzed. The very first example in the prompt is `bom dia` (good morning).
- A clear request for action is authorization enough. Confirmation only before deleting or when there is real ambiguity.
- If a required field is missing, it **does not call the tool**: it asks a single, direct question.
- If the action depends on a lookup (finding the id of a reminder in order to cancel it), it does both in the same turn.
- It never mentions `profileId`, tool names, JSON or technical errors.
- WhatsApp format: 1 to 4 lines, no headings, no tables, `*bold*` used sparingly.

---

## 7. Identity, onboarding and pairing

![Sequence of sign-up, provisioning and pairing](/images/projects/jarvis/docs/en/04-onboarding.webp)

### 7.1 better-auth outside the Nest pipeline

`main.ts` creates the app with `bodyParser: false`, registers `toNodeHandler(authService.instance)` on `/api/auth` and **only then** mounts `express.json()` and `express.urlencoded()`. better-auth needs to read the raw body; a global parser in front of it would break login and sign-up. This ordering is the only "fragile" thing in the bootstrap, and it is documented in the code.

Relevant `BetterAuthService` configuration:

- `prismaAdapter` on top of the same `PrismaService` (tables `user`, `session`, `account`, `verification`).
- Email/password with `minPasswordLength: 8`, `autoSignIn`. Google is optional, enabled only if `GOOGLE_CLIENT_ID/SECRET` exist; `accountLinking` is on.
- `trustedOrigins: [WEB_ORIGIN]` and CORS with `credentials: true` in Nest, so the session cookie works between `app.` and `api.`.
- `sendResetPassword` only **logs** the URL (there is no email provider).

There is no global session guard. Each web controller explicitly calls `BetterAuthService.requireSession(request.headers)` and then `ProfileService.ensureAuthProfile(session.user)`. Choosing explicit calls over a guard keeps `main.ts` simple and makes it visible, in each handler, that it is authenticated.

### 7.2 The Profile is born in the hook

`databaseHooks.user.create.after` calls `ProfileService.ensureAuthProfile(user)`, which creates:

```
Profile {
  userId:          user.id
  name:            user.name or the local part of the email
  token:           10 characters [A-Z0-9], generated with randomBytes
  jid:             user.email          ← placeholder, unique
  about:           ''
  timezone:        'America/Sao_Paulo'
  subscriptionId:  Free Tier (created if it does not exist)
}
```

and then fires `SecuroProvisioningService.provisionInBackground(profile)` without `await`. Sign-up never waits for Securo and never fails because of it.

`ensureAuthProfile` is idempotent and is called on every authenticated web endpoint. That covers users created before the hook existed and makes the system self-healing.

### 7.3 Pairing over WhatsApp

The provisional `jid` (the email) satisfies the uniqueness constraint without colliding with real numbers. The dashboard shows the token and, if `VITE_WHATSAPP_NUMBER` is set, a `wa.me/<número>?text=Oi Jarvis! Este é o meu token de conexão: <token>` button (the prefilled text reads "Hi Jarvis! This is my connection token: <token>").

When a message arrives from an unknown `jid`, `AssistantConnectionService` looks for the token and, on a match, overwrites the profile's `jid` with the real one (`5511999999999@s.whatsapp.net`). `isWhatsappLinked(profile)` is simply `jid.endsWith('@s.whatsapp.net')`, and the `/profile/me` view returns the masked number (`5511*******99`).

Changing numbers means sending the same token from the new number: the `jid` is overwritten again.

### 7.4 Plans

`Subscription { name, price, limit }`, with the Free Tier (`limit: 100`) created on demand. The dashboard shows the plans (`GET /subscriptions`) and the current plan; switching plans and enforcing the limit do not exist yet.

---

## 8. WhatsApp gateway

### 8.1 One session for the whole platform

Jarvis uses **a single** WhatsApp **number**. Multi-tenancy happens in the `jid → Profile` mapping. `WhatsappConnectionService` is an `OnModuleInit` singleton that opens the Baileys socket at boot and keeps it alive for the lifetime of the process.

### 8.2 Connection lifecycle

```
boot ──► connect()
          ├─ createAuthenticationState()  (loads encrypted creds from Postgres)
          ├─ makeWASocket({ auth, printQRInTerminal: false, logger: silent })
          └─ handlers: creds.update, connection.update, messages.upsert

connection.update
  ├─ qr           → stores the QR (exposed at GET /whatsapp/qr as a PNG data URL)
  ├─ open         → connected = true, QR cleared
  └─ close
       ├─ loggedOut → clearAuth() (wipes whatsapp_auth) and reconnects (a new QR will be generated)
       └─ others    → reconnects after 3 s (the reconnecting flag prevents a race)

onModuleDestroy → shuttingDown = true, closes the socket without reconnecting
```

Baileys is imported dynamically (`await import('@whiskeysockets/baileys')`) because the package is ESM and the backend compiles to CommonJS.

### 8.3 Encrypted credentials in the database

Baileys expects an `AuthenticationState` with `creds` and a `keys` store (`get`/`set` by type and id). `BaileysAuthStore` implements that on top of the `whatsapp_auth (key, value json)` table:

- `creds` lives under the literal key `creds`; the signal keys live under `<type>:<id>` (e.g. `pre-key:12`, `session:5511…`).
- Every `value` goes through `WhatsappAuthCryptoService.encrypt` before it reaches the database: **AES-256-GCM**, a random 12-byte IV, an auth tag, all base64-encoded in a `{ version: 1, algorithm, iv, authTag, ciphertext }` envelope. The key comes from `WHATSAPP_AUTH_ENCRYPTION_KEY` (32 bytes in base64, validated in the constructor).
- Serialization uses Baileys' `BufferJSON.replacer/reviver` to preserve `Buffer`s, and `app-state-sync-key` is rehydrated via protobuf.

Consequences: a database dump does not expose the WhatsApp session; losing the encryption key forces a new QR scan, but exposes nothing.

### 8.4 Sending

`WhatsappSenderService.sendMessage(jid, text)` is the single exit point, used by the message loop, the event scheduler, the public API and the admin endpoint `POST /whatsapp/send`. It fails fast (`503`) if the socket is not `open`.

### 8.5 Admin endpoints

`/whatsapp/qr`, `/whatsapp/status` and `/whatsapp/send` sit behind `WhatsappAdminGuard`. The guard accepts the key in `x-admin-key`, `x-whatsapp-admin-key`, `x-api-key` or `Authorization: Bearer`, and compares it with `timingSafeEqual` after checking the length. The same guard protects the M2M controllers, which lets n8n's Header Auth credential (which sends `x-api-key`) be reused.

---

## 9. Events: the scheduling engine

### 9.1 A two-table model

| `EventSeries` (the rule) | `EventExecution` (the firing) |
|---|---|
| `type: UNIQUE \| RECURRENCE` | `scheduledAt` (UTC, a multiple of 10 min) |
| `startAt` | `content` (the text that will be sent) |
| `recurrenceInterval`, `recurrenceMode: HOUR \| DAY \| WEEK \| MONTH` | `status: PENDING → PROCESSING → COMPLETED \| FAILED \| CANCELLED` |
| `active` | `observabilitys` (failure reason) |
| `profileId` | `@@unique([eventSeriesId, scheduledAt])`, `@@index([status, scheduledAt])` |

Separating the rule from the firing lets a routine have a history (each send is a row with its own state), makes cancelling a matter of deactivating the series and marking the pending rows, and lets the next occurrence be generated *after* the previous one has finished, without generating infinite occurrences up front.

The time zone lives on the `Profile`, not on the series. "Todo dia às 8h" (every day at 8 a.m.) means 8 a.m. in the user's time zone even across daylight saving changes, and changing the time zone on the profile affects the upcoming occurrences of every series.

![EventExecution state machine](/images/projects/jarvis/docs/en/06-events-states.webp)

### 9.2 Normalizing to 10 minutes

`normalizeScheduledAt` rounds any instant to the nearest multiple of 10 minutes within the hour, with ties (xx:x5:00) rounding **forward**. This aligns every firing with the cron tick: if the user asks for 9:03, the reminder goes out at 9:00; if they ask for 9:07, at 9:10. The prompt tells the model about this rule, and the confirmation sent to the user uses the already rounded time.

`getNextScheduledAt(scheduledAt, mode, interval, timezone)` converts to the profile's time zone, adds `interval` units of `mode` with Luxon (which handles months of different lengths and DST), normalizes, and **repeats until the result is strictly in the future**. This matters when the server has been down: a daily routine does not produce 5 late executions; it jumps to the next valid occurrence.

### 9.3 The scheduler tick

![Event scheduler flow](/images/projects/jarvis/docs/en/05-events-scheduler.webp)

`EventsSchedule.processDueEvents` runs with `@Cron(EVERY_10_MINUTES)`:

1. **Window cache in Redis.** The key `events:schedule:pending-cache` holds `[{ id, scheduledAt }]` for the `PENDING` executions of active series with `scheduledAt ≤ now + 2h`, with a 2h TTL. If the key exists, the database is **not queried** on this tick. If it does not, a single query repopulates it. In practice, Postgres is read once every 2 hours rather than every 10 minutes.
2. **Selecting the due ones** in memory (`scheduledAt ≤ now`). If there are none, the tick ends without touching anything.
3. **Rewriting the cache** with only the future ones, preserving the TTL (`KEEPTTL`), so that a due execution is never processed twice.
4. **Atomic claim.** It loads the executions by id (with series and profile) and runs `updateMany({ id IN ids, status: PENDING, active series }) → PROCESSING`. The `status: PENDING` predicate in the `WHERE` guarantees that only rows that were still pending get claimed.
5. **Sequential sending.** For each execution: `sendMessage(profile.jid, content)`; success → `COMPLETED`, error → `FAILED` with the message in `observabilitys`.
6. **Next occurrence.** `UNIQUE` → deactivates the series. `RECURRENCE` → computes the next instant and does an `INSERT`; a `P2002` (unique violation) is caught and ignored, because it means that occurrence already exists.

### 9.4 Cache invalidation

`EventsM2mService.createEvent` compares the normalized `startAt` with `now + 2h`: if it falls inside the window, it runs a `DEL` on the key. The next tick repopulates it and sees the new event. Events outside the window come in naturally with the next repopulation. `deleteEvent` does not invalidate: cancelled executions are filtered out in `findManyByIdsForProcessing` (which requires `status: PENDING` and an active series), so a cancelled id that is still in the cache simply does not get claimed.

### 9.5 Endpoints

| Route | Auth | Operations |
|---|---|---|
| `POST /events-m2m/:profileId/execute` | admin key | `create_event`, `find_active_events` (filters `scheduledAt=YYYY-MM-DD` in the profile's time zone, `type`), `delete_event`, `get_guideline` |
| `GET /events/me` | session | `PENDING`/`PROCESSING` executions of active series for the logged-in profile |
| `DELETE /events/me/series/:id` | session | Deactivates the series if it belongs to the profile (`404` otherwise, without revealing that it exists) |

---

## 10. Finance: Securo as the invisible engine

### 10.1 Why vendor a finance manager

Building accounts, transactions, categories, rules, goals, recurrences and investments from scratch would be the largest module in the project. [Securo](https://docs.usesecuro.com/docs) already solves all of that with a mature data model, a REST API, multi-workspace support and a Celery Beat that materializes recurrences (salary on the 5th, subscription on the 10th) without Jarvis needing yet another scheduler. Securo's frontend is not used; Jarvis is the only interface.

### 10.2 One Securo user per profile

![Provisioning and authentication in Securo](/images/projects/jarvis/docs/en/07-finance-provisioning.webp)

Each `Profile` has a `SecuroAccount` (1:1) with `email`, `securoUserId`, `workspaceId`, `defaultAccountId` and `status: PENDING | ACTIVE | FAILED`. How it gets created:

1. **Deterministic credentials.** `email = profile-<profileId>@jarvis.internal`, `senha = HMAC-SHA256(SECURO_PROVISION_SECRET, profileId)` (`senha` being the password). No password is stored; any backend instance with the same secret can log in as any profile. Changing the secret invalidates every password (which is why this variable must never be rotated without a migration plan).
2. **Service admin.** On first contact with an empty instance (`GET /api/setup/status → has_users: false`), the backend calls `POST /api/setup/create-admin` with `SECURO_ADMIN_*`, BRL as the currency and pt-BR as the language. After that, it is a regular login. The admin token is cached in Redis.
3. **Creation through the admin.** `POST /api/admin/users` (Securo's public registration is rate limited to 3 per hour per IP, unworkable for a server). Securo creates on its own the "Pessoal" (Personal) workspace, the "Carteira" (Wallet) account, 16 categories in pt-BR and the universal rules. An `already exists` is treated as success (reprovisioning).
4. **Discovery.** Log in as the profile, `GET /api/workspaces` (take the first one), `GET /api/accounts` (take the first one or create "Carteira"). Everything is stored, status `ACTIVE`.

Any failure marks it `FAILED` with the reason in `observabilitys` and does **not** throw to whoever called sign-up. On the next finance operation, `SecuroContextService.contextFor(profileId)` calls `ensureSecuroAccount` again, which only short-circuits if the status is `ACTIVE` with the ids filled in. That is the self-healing mechanism: a Securo that was down at sign-up time fixes itself on the first "gastei 50 no mercado" (I spent 50 at the grocery store).

### 10.3 Tokens and cache

Securo issues 24h JWTs with no refresh, and login is rate limited to 5 per minute per IP. The tokens (admin and per profile) are cached in Redis for **23h** (`finance:securo:user-token:<profileId>`, `finance:securo:admin-token`). Each profile logs in at most once a day. Every domain call carries `Authorization: Bearer` and `X-Workspace-Id`.

### 10.4 Contract translation

`SecuroApiService` is the minimal HTTP client (`fetch`, query string, form or JSON, headers) and translates errors: `400/409/422 → BadRequestException` with Securo's `detail`, `404 → NotFoundException`, anything else → `Error`. Since the `detail` reaches the model via `neverError`, Securo's validation also takes part in the correction loop.

The domain services (`AccountsService`, `TransactionsService`, ...) apply the translation rules, all covered by tests:

| Rule | Reason |
|---|---|
| Amounts always positive; direction in `type: debit \| credit` | Securo does not validate these enums (free-form string). The DTOs validate with `@IsIn` before sending. |
| Money as a string with 2 decimal places (`"50.00"`) | Securo uses `Numeric(15,2)`; avoids float noise. |
| `YYYY-MM-DD` dates with no time | Securo's model. |
| `camelCase → snake_case`, `undefined` fields omitted | Securo's `PATCH` is `exclude_unset`: omitted means "leave it alone". |
| `accountId` omitted → `defaultAccountId` ("Carteira") | The user rarely says which account the money came out of. |
| Default currency BRL; on transactions, the account's currency | |
| Enums (account types, frequencies, asset types, rule operators) centralized in `securo-vocab.constant.ts` | Single source for the DTOs and for the tool catalog. |

### 10.5 Two facades, one service

| Facade | Route | Auth | Used by |
|---|---|---|---|
| M2M (RPC) | `POST /finance-m2m/:profileId/execute` with `{ operation, data }` | admin key | n8n |
| Web (REST) | `/finance/me/accounts`, `/finance/me/transactions[/:id]`, `/finance/me/categories`, `/rules`, `/goals`, `/recurring-transactions`, `/assets[/:id/values|trades]` | session | frontend |

The 27 RPC operations map 1:1 to the service methods. `GET .../transactions` accepts `from`, `to`, `type`, `categoryId`, `accountId`, `q`, `page`, `limit` and returns Securo's envelope `{ items, total, page, limit, summary: { income, expense, net } }`. The `summary` is what answers "quanto gastei esse mês" (how much did I spend this month) without summing on the client.

Product safety decisions: Securo's destructive `apply-all` rules endpoint was not exposed; goals have manual progress (the model looks it up and adds); selling more units of an asset than you hold is rejected by Securo itself (`422`).

---

## 11. Public API and API keys

### 11.1 Keys

`ApiKey { profileId, name, prefix, hash, active, lastUsedAt }`. Generation:

```
secret = 'jrv_' + base64url(randomBytes(24))          // e.g. jrv_k9Xw...  (36 chars)
prefix = secret.slice(0, 12)                          // jrv_k9Xw1a2b   (shown in the UI)
hash   = sha256(secret)                               // the only part of the secret that is persisted
```

The `secret` is returned **exactly once**, in the response to `POST /api-keys/me`. There is a limit of 10 keys per profile. `active: false` pauses a key without deleting it. `lastUsedAt` is updated on every use on a best-effort basis (the promise is not awaited and errors are swallowed), so it never adds latency or failure to the client's request.

### 11.2 Guard

`ApiKeyGuard` reads `Authorization: Bearer <key>` (preferred) or `x-api-key`, rejects early anything that does not look like a key (`looksLikeApiKey`), computes the hash, looks up `ApiKey` + `Profile` by `hash` (an `@unique` column, indexed by construction) and refuses with `401` if the key does not exist, is inactive or the profile is inactive. On success, it sets `request.apiKeyProfile`, exposed through `@ApiKeyProfile()`.

### 11.3 Public surface

Everything lives under `/v1` with `@UseGuards(ApiKeyGuard)` on the class. Today: `POST /v1/messages { message }` sends text to the WhatsApp **of the key's owner** (`409` if they have not paired yet, `503` if the socket is down). The client never specifies a recipient: a key can only talk to whoever created it, which rules out spam by design.

Adding a public endpoint means: a DTO in `dto/`, a method in the service, a route in the controller, and documentation in the module README and on the frontend's `/configuracoes/documentacao` page.

---

## 12. Data model

![Entity-relationship diagram](/images/projects/jarvis/docs/en/08-data-model.webp)

### 12.1 Entities

| Table | Owner | Design notes |
|---|---|---|
| `user`, `session`, `account`, `verification` | better-auth | The better-auth schema mapped in Prisma. `account.password` holds the hash for the credentials provider. |
| `profiles` | Jarvis | The pivot of the domain. `userId` is `unique` and **nullable** to allow profiles created by seed (with no web user). `token` and `jid` are `unique`. `about` feeds the prompt. `timezone` is IANA. |
| `subscriptions` | Jarvis | `price Decimal(10,2)`, `limit Int`. |
| `messages` | Jarvis | `userId` (actually `profile.id`) indexed, no FK. Only the last 10 are read per message; the table grows linearly with usage. |
| `event_series`, `event_executions` | Jarvis | See [section 9](#9-events-the-scheduling-engine). `onDelete: Cascade` from the profile. The composite index `(status, scheduledAt)` serves the scheduler's window query. |
| `securo_accounts` | Jarvis | 1:1 with the profile. Holds the Securo ids and the provisioning state. |
| `api_keys` | Jarvis | `hash unique`, index on `profileId`. |
| `whatsapp_auth` | Jarvis | Encrypted key-value store for the Baileys session. One session per installation. |

### 12.2 Migrations

Ten versioned migrations in `server/prisma/migrations`, applied by `prisma migrate deploy` in the `migrate` container. Prisma 7 reads the schema, the migrations path, the seed command and `DATABASE_URL` from `prisma.config.ts`; the schema's `datasource` block has no `url`. After any schema change: `npx prisma migrate dev --name <name>` and `npx prisma generate`.

### 12.3 Data outside Jarvis's Postgres

- **Securo** has its own Postgres 16 with the entire finance domain (workspaces, accounts, transactions, categories, rules, goals, recurrences, assets, attachments on a volume). Jarvis keeps only the pointers (`securo_accounts`).
- **Redis**: `events:schedule:pending-cache` (2h TTL), `finance:securo:admin-token` and `finance:securo:user-token:<profileId>` (23h TTL). Everything can be rebuilt; a `FLUSHDB` only costs one query and a few extra logins.
- **n8n**: workflows and credentials in the `n8n_data` volume; the workflow is versioned in `n8n.json`.

---

## 13. Persistence and infrastructure

### 13.1 Prisma 7 with a driver adapter

`PrismaService` extends `PrismaClient` and passes `new PrismaPg({ connectionString })` as the `adapter`. Neon exposes a *pooler* (PgBouncer in transaction mode) that is not compatible with the protocol of Prisma's default engine; the driver adapter on top of `pg` solves that and also works with any local Postgres. `$connect` in `onModuleInit`, `$disconnect` in `onModuleDestroy`.

### 13.2 Redis

`redis` v6 client, connected in `onModuleInit` and closed with `quit` on destroy. The module is `@Global()` because three different modules consume it (events, finance, and potentially others). The compose file turns on `--appendonly yes`; the cache is disposable, but Securo uses the same Redis as the Celery broker and as the login rate limiter, and there durability matters.

### 13.3 Configuration

`ConfigModule.forRoot({ isGlobal: true })` loads `server/.env`. Services that depend on secrets validate their presence in the constructor and fail the boot with a clear message (`WHATSAPP_AUTH_ENCRYPTION_KEY must decode to exactly 32 bytes`, `REDIS_URL environment variable is required`). Failing early is preferable to a server that comes up and breaks on the first message.

---

## 14. Frontend

### 14.1 Stack and organization

React 19 + Vite 8 + TypeScript 6, React Router 7, Recharts for charts. No UI kit: the design system is plain CSS with tokens (`--bg #faf5ec`, `--accent #f4690f`, Michroma/Orbitron/Space Grotesk) and in-house components in `components/ui` (`Card`, `Stat`, `Badge`, `Modal`, `Segmented`, `EmptyState`, `Wordmark`...).

```
src/
├── features/
│   ├── auth/         login, password reset, AuthLayout
│   ├── dashboard/    monthly KPIs, upcoming reminders, chart, goals, WhatsApp connection card, plan
│   ├── finance/      overview, transactions, recurrences, goals, investments, settings (accounts, categories, rules)
│   ├── plans/        plans
│   ├── profile/      name, "about you" (feeds the prompt), time zone
│   └── settings/     API keys and API documentation
├── components/layout AppShell (sidebar), RequireAuth
├── hooks/            use-my-profile, use-my-events, use-my-transactions, use-finance-summary, ...
├── services/         one client per resource, on top of apiFetch
└── lib/              apiFetch (credentials: include, ApiError), authClient (better-auth/react), config, dates, format
```

### 14.2 Session and route protection

`authClient = createAuthClient({ baseURL: <api>/api/auth })` from `better-auth/react`. `RequireAuth` uses `authClient.useSession()`: a spinner while loading, a redirect to `/login` when there is no session. Every API call goes out with `credentials: 'include'`; the cookie is the only authentication state, with no tokens in `localStorage`.

### 14.3 Data patterns

Each resource has a `use-my-*` hook that encapsulates loading, error and `reload`, and a service that knows the routes. Components receive ready-to-use data. API errors (`{ message }` as a string or as an array from the `ValidationPipe`) are normalized into an `ApiError` carrying the text to display.

Privacy mode (`privacy-context`) hides monetary values across the whole screen with a toggle, persisted locally.

---

## 15. Testing strategy

Unit tests with Jest 30 and ts-jest, colocated in `tests/` inside each module. The focus is on **business rules and contracts**, with infrastructure services mocked:

| Suite | What it protects |
|---|---|
| `get-next-scheduled-at.spec` | Rounding (ties forward), advancing by mode and interval, result always in the future, time zone. |
| `events-m2m.service.spec` | Recurrence validation (UNIQUE without the fields, RECURRENCE with both), normalization, cache invalidation inside the window, day filters in the profile's time zone. |
| `events.schedule.spec` | Cache repopulation and use, claim, state transitions, `FAILED` with a reason, creation of the next occurrence, tolerance to `P2002`. |
| `build-system-prompt.spec` | Temporal context with offset, time zone fallback, every operation rendered, section order. |
| `main.tools.spec` | Shape of the catalog; every module points to `/*-m2m/:profileId`. |
| 7 finance suites | DTO → Securo translation per area (default account, money as a string, snake_case, partial `PATCH`, defaults). |
| `securo-provisioning.service.spec` | `ACTIVE` short-circuit, full flow, `FAILED`, token cache. |
| `api-keys.service.spec`, `api-key.guard.spec`, `generate-api-key.spec`, `extract-api-key.spec` | Format, hash, limit, rejections, best-effort `lastUsedAt`. |
| `public-api.service.spec` | `409` when WhatsApp is not paired. |
| `whatsapp-admin.guard.spec` | Accepted headers and rejections. |

Current result: **19 suites, 78 tests, all passing**. The `test/` directory at the server root has the e2e scaffolding (`jest-e2e.json`, supertest) ready to grow.

Beyond the automated tests, `ASSISTANT.md` defines a set of conversation cases (greeting with no tool, one-off reminder, reminder with no time that must trigger a question, daily routine, listing, two-step cancellation, expense, monthly total) to be retested manually on every prompt or model change.

---

## 16. Architecture decisions and trade-offs

| Decision | What it buys | What it costs |
|---|---|---|
| Modular monolith with n8n and Securo as satellite services, not microservices | Simple deploys and local transactions; swapping the model or the finance engine does not touch the core. | A Securo or n8n failure is felt synchronously. |
| The model runs in n8n, not in the backend | Model swaps without a deploy and inspectable agent executions. | One extra network hop; agent behavior lives in two places, mitigated by versioning `n8n.json`. |
| Tool catalog declared in TypeScript and rendered into the prompt | A single, tested source; a new capability is one `case` in the controller and one catalog entry. | The prompt grows with the catalog. |
| 10-minute cron with a window cache, instead of a queue | One database query every 2h and zero extra infrastructure. | No retry and no parallelism across instances. |
| Vendoring Securo instead of building the finance domain | Months of work avoided and real per-user isolation. | Two databases and a domain Jarvis does not control. |
| One WhatsApp session, one server instance | Maximum simplicity and minimum cost. | Scaling horizontally means extracting the gateway and coordinating the cron. |
| better-auth before the body parser, with no global guard | Authentication visible in every handler. | Remembering the order in `main.ts` and `requireSession` on every new route. |
| Zod at the external boundary, class-validator inside | Each library where it is strongest. | Two validation libraries. |

---

## 17. Glossary

| Term | Meaning |
|---|---|
| **jid** | WhatsApp identifier (`5511999999999@s.whatsapp.net`). The routing key between messages and profiles. |
| **Profile** | Jarvis's unit of isolation: one person, one number, one time zone, one Securo user. |
| **Pairing token** | 10 `[A-Z0-9]` characters generated at sign-up; sent over WhatsApp to link the number to the profile. |
| **M2M** | *Machine to machine*. Endpoints used by n8n, protected by a static key and by the private network. |
| **RPC (`execute`)** | A single endpoint per module that receives `{ operation, data }`. |
| **Tool catalog (`ASSISTANT_TOOLS`)** | A typed declaration of what the agent can do, rendered into the prompt. |
| **Directive** | Static prompt + rendered catalog; part of the payload sent to n8n. |
| **Series / Execution** | An event's rule / one concrete firing with its own state. |
| **Scheduler window** | 2 hours of pending executions cached in Redis. |
| **Securo** | Open source finance manager vendored as the internal engine. |
| **Provisioning** | Creating a profile's user, workspace and default account in Securo. |
| **Baileys** | A library that implements the WhatsApp Web protocol in Node. |
| **better-auth** | The authentication library used for sessions, email/password and Google. |
| **`$fromAI`** | n8n's mechanism for declaring, in a node parameter, an argument that the model fills in. |
| **`neverError`** | An option on n8n's HTTP node that turns 4xx/5xx responses into the tool's result. |

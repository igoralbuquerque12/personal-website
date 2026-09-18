import { Icon } from "./icons";

export function SystemSketch({
  variant = "hero",
}: {
  variant?: "hero" | "mail";
}) {
  const mail = variant === "mail";
  return (
    <div
      className={`system-sketch ${mail ? "mail-sketch" : ""}`}
      role="img"
      aria-label={
        mail
          ? "MailWorks: API Gateway, Lambda API, SQS, worker e SES, com persistência PostgreSQL e falhas em DLQ."
          : "Ilustração de arquitetura: cliente, API, fila e workers, com persistência de estado."
      }
    >
      <div className="sketch-heading">
        <span className="mono">
          {mail ? "MAILWORKS / SYSTEM DESIGN" : "DA IDEIA À PRODUÇÃO"}
        </span>
        <span className="sketch-status">
          <i /> {mail ? "event-driven" : "visão de sistema"}
        </span>
      </div>
      <div className="sketch-canvas" aria-hidden="true">
        <svg
          className="sketch-wires"
          viewBox="0 0 500 260"
          preserveAspectRatio="none"
        >
          <path d="M150 82H187M312 82H350M250 115V145H172V167M412 115V195H390M235 200H275" />
          <path className="wire-active" d="M150 82H187M312 82H350" />
        </svg>
        <div className="diagram-node node-client">
          <Icon name="globe" />
          <strong>{mail ? "API Gateway" : "Client"}</strong>
          <span>{mail ? "HTTP request" : "web / mobile"}</span>
        </div>
        <div className="diagram-node node-api">
          <Icon name="server" />
          <strong>{mail ? "Lambda API" : "API / Core"}</strong>
          <span>{mail ? "NestJS · tenant" : "regras de negócio"}</span>
        </div>
        <div className="diagram-node node-queue">
          <Icon name="layers" />
          <strong>{mail ? "SQS" : "Event queue"}</strong>
          <span>{mail ? "async delivery" : "async processing"}</span>
        </div>
        <div className="diagram-node node-db">
          <span className="db-symbol">≋</span>
          <strong>{mail ? "PostgreSQL" : "Data layer"}</strong>
          <span>{mail ? "job lifecycle" : "estado consistente"}</span>
        </div>
        <div className="diagram-node node-worker">
          <Icon name="code" />
          <strong>{mail ? "Worker → SES" : "Workers"}</strong>
          <span>{mail ? "retry / DLQ" : "trabalho em paralelo"}</span>
        </div>
        <span className="wire-label">
          {mail ? "202 Accepted" : "event-driven"}
        </span>
      </div>
      <div className="sketch-code">
        <span className="code-line-number">01</span>
        <code>
          <em>const</em> approach = {"{"}
        </code>
        <br />
        <span className="code-line-number">02</span>
        <code>
          &nbsp; design:{" "}
          <b>&apos;{mail ? "built for retries" : "built with purpose"}&apos;</b>
          ,
        </code>
        <br />
        <span className="code-line-number">03</span>
        <code>
          &nbsp; mindset:{" "}
          <b>&apos;{mail ? "trace every job" : "think in systems"}&apos;</b>
        </code>
        <br />
        <span className="code-line-number">04</span>
        <code>{"}"};</code>
        <span className="code-language">TypeScript</span>
      </div>
      <div className="sketch-footer">
        <span>
          <i />{" "}
          {mail
            ? "Falhas fazem parte do desenho."
            : "Boas decisões antes de mais código."}
        </span>
        <span>↳ {mail ? "01" : "IA"}</span>
      </div>
    </div>
  );
}

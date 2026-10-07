"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import {
  ecosystem,
  projects,
  type EcosystemConnection,
  type EcosystemKind,
} from "@/knowledge-base";

type Point = [number, number];
type Rect = { l: number; r: number; t: number; b: number };

const SVG_NS = "http://www.w3.org/2000/svg";
/** Voltas por segundo das partículas; o tracejado acompanha. O git é o mais lento. */
const SPEED: Record<EcosystemKind, number> = {
  mail: 0.22,
  alert: 0.17,
  git: 0.12,
};
const LEGEND: { kind: EcosystemKind; text: string }[] = [
  { kind: "mail", text: "MailWorks · API key" },
  { kind: "alert", text: "Jarvis · API key" },
  { kind: "git", text: "vibe-git · CLI" },
];
/** Pontos da curva testados, em ordem, até o rótulo não encostar em nada. */
const LABEL_STOPS = [0.5, 0.42, 0.58, 0.34, 0.66, 0.26, 0.74];
const FIRST_CAPTION = "jarvis";
const CAPTION_INTERVAL = 6000;
const PACKET_INTERVAL = 2300;
const PACKET_TRAVEL = 1500;
const PING = 450;
const DRAG_THRESHOLD = 4;

const { nodes, connections } = ecosystem;
const projectById = new Map(projects.map((project) => [project.id, project]));
const nodeById = new Map(nodes.map((node) => [node.id, node]));
const nameOf = (id: string) => projectById.get(id)?.name ?? id;
const originOf = (id: string) => projectById.get(id)?.origin ?? "open-source";
const touches = (connection: EcosystemConnection, id: string) =>
  connection.from === id || connection.to === id;
const captionRotation = [
  FIRST_CAPTION,
  ...nodes
    .filter((node) => node.role === "integrated" && node.id !== FIRST_CAPTION)
    .map((node) => node.id),
];

/** Cor do marcador da legenda: a da integração ou, nos produtos, a do selo. */
function toneOf(id: string) {
  if (nodeById.get(id)?.role !== "integrated") return originOf(id);
  return (
    connections.find((item) => item.from === id) ??
    connections.find((item) => item.to === id)
  )?.kind;
}

const lowerFirst = (text: string) => text[0].toLowerCase() + text.slice(1);
const listNames = (ids: string[]) =>
  new Intl.ListFormat("pt-BR", { type: "conjunction" }).format(ids.map(nameOf));

/** "Care Copilot, open source. MailWorks envia e-mails e gerencia 2FA; …" */
function accessibleName(id: string) {
  const node = nodeById.get(id)!;
  const outgoing = new Map<string, string[]>();
  for (const item of connections.filter((item) => item.from === id))
    outgoing.set(item.label, [...(outgoing.get(item.label) ?? []), item.to]);
  const parts = [
    ...connections
      .filter((item) => item.to === id)
      .map((item) => `${nameOf(item.from)} ${lowerFirst(item.label)}`),
    ...[...outgoing].map(
      ([label, targets]) => `${lowerFirst(label)} para ${listNames(targets)}`,
    ),
  ];
  const origin = originOf(id) === "freelance" ? "freelance" : "open source";
  const role = node.role === "integrated" ? ", integrado aos outros" : "";
  const detail = parts.join("; ");
  return `${nameOf(id)}, ${origin}${role}. ${detail[0].toUpperCase()}${detail.slice(1)}.`;
}

function useMedia(query: string) {
  return useSyncExternalStore(
    (notify) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", notify);
      return () => media.removeEventListener("change", notify);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

const bezier = (a: Point, c: Point, b: Point, t: number): Point => {
  const u = 1 - t;
  return [
    u * u * a[0] + 2 * u * t * c[0] + t * t * b[0],
    u * u * a[1] + 2 * u * t * c[1] + t * t * b[1],
  ];
};
const overlap = (a: Rect, b: Rect) => {
  const x = Math.min(a.r, b.r) - Math.max(a.l, b.l);
  const y = Math.min(a.b, b.b) - Math.max(a.t, b.t);
  return x > 0 && y > 0 ? x * y : 0;
};
const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

function openProject(id: string) {
  const url = new URL(window.location.href);
  url.searchParams.set("project", id);
  window.history.pushState({ portfolioProject: true }, "", url);
  // O ProjectBrowser abre o modal a partir da URL quando recebe popstate.
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export function EcosystemMap() {
  const still = useMedia("(prefers-reduced-motion: reduce)");
  const mobile = useMedia("(max-width: 800px)");
  const [hovered, setHovered] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const [captionId, setCaptionId] = useState(FIRST_CAPTION);
  const [fading, setFading] = useState(false);
  const [feed, setFeed] = useState<
    { key: number; kind: EcosystemKind; text: string }[]
  >([]);
  const focus = hovered ?? focused;
  /** Em telas pequenas só aparecem os rótulos do card em foco (ou o da legenda). */
  const labelsOf = mobile ? (focus ?? captionId) : null;

  const mapRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const packetsRef = useRef<SVGGElement>(null);
  const live = useRef({ labelsOf });
  const scene = useRef<{
    redraw: () => void;
    grab: (id: string, clientX: number, clientY: number) => void;
    drag: (id: string, clientX: number, clientY: number) => void;
  } | null>(null);
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const skipClick = useRef(false);
  const captionTarget = useRef(FIRST_CAPTION);
  const captionTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const rotation = useRef(0);

  const showCaption = useCallback(
    (id: string) => {
      if (captionTarget.current === id) return;
      captionTarget.current = id;
      clearTimeout(captionTimer.current);
      if (still) return setCaptionId(id);
      setFading(true);
      captionTimer.current = setTimeout(() => {
        setCaptionId(id);
        setFading(false);
      }, 200);
    },
    [still],
  );
  useEffect(() => () => clearTimeout(captionTimer.current), []);

  useEffect(() => {
    if (still || focus) return;
    const timer = setInterval(() => {
      rotation.current = (rotation.current + 1) % captionRotation.length;
      showCaption(captionRotation[rotation.current]);
    }, CAPTION_INTERVAL);
    return () => clearInterval(timer);
  }, [still, focus, showCaption]);

  // Um único loop anima cards, curvas, partículas e a posição dos rótulos.
  useEffect(() => {
    const map = mapRef.current;
    const caption = captionRef.current;
    const packetLayer = packetsRef.current;
    if (!map || !caption || !packetLayer) return;
    const layout = mobile ? "mobile" : "desktop";
    const items = nodes.map((node) => ({
      id: node.id,
      el: map.querySelector<HTMLElement>(`[data-node="${node.id}"]`)!,
      x: node[layout].x,
      y: node[layout].y,
      r: node[layout].r,
      phase: Math.random() * 6,
      ping: 0,
      w: 0,
      h: 0,
      cx: 0,
      cy: 0,
    }));
    const itemById = new Map(items.map((item) => [item.id, item]));
    const lines = connections.map((connection, index) => {
      const group = map.querySelector<SVGGElement>(`[data-line="${index}"]`)!;
      const chip = map.querySelector<HTMLElement>(`[data-chip="${index}"]`)!;
      chip.style.left = chip.style.top = "0";
      return {
        connection,
        from: itemById.get(connection.from)!,
        to: itemById.get(connection.to)!,
        paths: [...group.querySelectorAll("path")],
        dots: [...group.querySelectorAll("circle")],
        chip,
        /** Ponto escolhido na curva e ponto exibido, que desliza até ele. */
        target: 0.5,
        shown: 0.5,
        w: 0,
        h: 0,
        length: 0,
        geo: [
          [0, 0],
          [0, 0],
          [0, 0],
        ] as [Point, Point, Point],
      };
    });
    let width = 0;
    let height = 0;
    let captionBox: Rect = { l: 0, r: 0, t: 0, b: 0 };
    let clock = 0;
    let lastPacket = 0;
    let grip: Point = [0, 0];
    let packets: {
      line: (typeof lines)[number];
      start: number;
      el: SVGCircleElement;
    }[] = [];

    const measure = () => {
      width = map.clientWidth;
      height = map.clientHeight;
      for (const item of items) {
        item.w = item.el.offsetWidth;
        item.h = item.el.offsetHeight;
      }
      for (const line of lines) {
        line.w = line.chip.offsetWidth;
        line.h = line.chip.offsetHeight;
      }
      const origin = map.getBoundingClientRect();
      const box = caption.getBoundingClientRect();
      captionBox = {
        l: box.left - origin.left - 6,
        r: box.right - origin.left + 6,
        t: box.top - origin.top - 6,
        b: box.bottom - origin.top + 6,
      };
    };

    const draw = (elapsed: number) => {
      const t = clock / 1000;
      const obstacles = [captionBox];
      for (const item of items) {
        const dx = still ? 0 : Math.sin(t * 0.55 + item.phase) * 5;
        const dy = still ? 0 : Math.cos(t * 0.45 + item.phase * 1.3) * 7;
        const rotate =
          item.r + (still ? 0 : Math.sin(t * 0.4 + item.phase) * 0.8);
        const pulse = Math.max(0, (item.ping - clock) / PING);
        const scale = 1 + 0.06 * Math.sin(Math.PI * pulse);
        if (item.ping && !pulse) {
          item.ping = 0;
          delete item.el.dataset.ping;
        }
        item.cx = item.x * width + dx;
        item.cy = item.y * height + dy;
        item.el.style.transform = `translate(-50%,-50%) translate(${dx.toFixed(2)}px,${dy.toFixed(2)}px) rotate(${rotate.toFixed(3)}deg) scale(${scale.toFixed(4)})`;
        // Caixa que envolve o card já girado, com folga.
        const angle = (Math.abs(rotate) * Math.PI) / 180;
        const halfW =
          ((item.w * Math.cos(angle) + item.h * Math.sin(angle)) / 2) * scale +
          6;
        const halfH =
          ((item.w * Math.sin(angle) + item.h * Math.cos(angle)) / 2) * scale +
          6;
        obstacles.push({
          l: item.cx - halfW,
          r: item.cx + halfW,
          t: item.cy - halfH,
          b: item.cy + halfH,
        });
      }
      lines.forEach((line, index) => {
        const a: Point = [line.from.cx, line.from.cy];
        const b: Point = [line.to.cx, line.to.cy];
        const length = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
        const bend =
          line.connection.bend + (still ? 0 : Math.sin(t * 0.7 + index) * 8);
        const c: Point = [
          (a[0] + b[0]) / 2 - ((b[1] - a[1]) / length) * bend,
          (a[1] + b[1]) / 2 + ((b[0] - a[0]) / length) * bend,
        ];
        line.geo = [a, c, b];
        line.length = length;
        const d = `M${a[0].toFixed(1)} ${a[1].toFixed(1)} Q${c[0].toFixed(1)} ${c[1].toFixed(1)} ${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
        for (const path of line.paths) path.setAttribute("d", d);
        line.dots.forEach((dot, k) => {
          const at =
            (t * SPEED[line.connection.kind] + k / 2 + index * 0.13) % 1;
          const point = bezier(a, c, b, at);
          dot.setAttribute("cx", point[0].toFixed(1));
          dot.setAttribute("cy", point[1].toFixed(1));
        });
      });
      // As curvas mais curtas têm menos opções, então escolhem o lugar primeiro.
      const { labelsOf } = live.current;
      for (const line of [...lines].sort((a, b) => a.length - b.length)) {
        if (labelsOf && !touches(line.connection, labelsOf)) continue;
        const [a, c, b] = line.geo;
        const score = (at: number) => {
          const point = bezier(a, c, b, at);
          const rect = {
            l: point[0] - line.w / 2 - 3,
            r: point[0] + line.w / 2 + 3,
            t: point[1] - line.h / 2 - 3,
            b: point[1] + line.h / 2 + 3,
          };
          let area = 0;
          for (const obstacle of obstacles) area += overlap(rect, obstacle);
          return { area, rect };
        };
        // Se o ponto atual segue livre, ele fica: evita tremer com a flutuação.
        let best = score(line.target);
        if (best.area > 0)
          for (const at of LABEL_STOPS) {
            const candidate = score(at);
            if (candidate.area < best.area) {
              best = candidate;
              line.target = at;
            }
            if (candidate.area === 0) break;
          }
        obstacles.push(best.rect);
        line.shown +=
          (line.target - line.shown) *
          (elapsed ? Math.min(1, elapsed / 110) : 1);
        const point = bezier(a, c, b, line.shown);
        line.chip.style.transform = `translate(${point[0].toFixed(1)}px,${point[1].toFixed(1)}px) translate(-50%,-50%)`;
      }
      if (still) return;
      if (clock - lastPacket > PACKET_INTERVAL) {
        lastPacket = clock;
        const line = lines[Math.floor(Math.random() * lines.length)];
        const el = document.createElementNS(SVG_NS, "circle");
        el.setAttribute("r", "5.5");
        el.setAttribute("class", `eco-packet kind-${line.connection.kind}`);
        packetLayer.appendChild(el);
        packets.push({ line, start: clock, el });
      }
      packets = packets.filter((packet) => {
        const progress = (clock - packet.start) / PACKET_TRAVEL;
        const { connection, to } = packet.line;
        if (progress >= 1) {
          packet.el.remove();
          to.ping = clock + PING;
          to.el.dataset.ping = connection.kind;
          setFeed((current) =>
            [
              {
                key: packet.start,
                kind: connection.kind,
                text: `${nameOf(connection.from)} → ${nameOf(connection.to)} · ${connection.event}`,
              },
              ...current,
            ].slice(0, 3),
          );
          return false;
        }
        const point = bezier(...packet.line.geo, progress);
        packet.el.setAttribute("cx", point[0].toFixed(1));
        packet.el.setAttribute("cy", point[1].toFixed(1));
        return true;
      });
    };

    let frame = 0;
    let previous = 0;
    const tick = (now: number) => {
      const elapsed = Math.min(64, now - previous);
      previous = now;
      clock += elapsed;
      draw(elapsed);
      frame = requestAnimationFrame(tick);
    };
    // Parado (reduced motion), o mapa só é redesenhado quando algo muda.
    let pending = 0;
    const redraw = () => {
      if (!still || pending) return;
      pending = requestAnimationFrame(() => {
        pending = 0;
        draw(0);
      });
    };
    let onScreen = true;
    const sync = () => {
      const run = !still && onScreen && !document.hidden;
      map.toggleAttribute("data-paused", !run);
      if (run && !frame) {
        previous = performance.now();
        frame = requestAnimationFrame(tick);
      } else if (!run && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    };
    const sizes = new ResizeObserver(() => {
      measure();
      redraw();
    });
    for (const el of [map, caption, ...items.map((item) => item.el)])
      sizes.observe(el);
    for (const line of lines) sizes.observe(line.chip);
    const visibility = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      sync();
    });
    visibility.observe(map);
    document.addEventListener("visibilitychange", sync);
    scene.current = {
      redraw,
      // O card é arrastado pelo ponto em que foi pego, sem saltar para o cursor.
      grab(id, clientX, clientY) {
        const item = itemById.get(id)!;
        const origin = map.getBoundingClientRect();
        grip = [
          clientX - origin.left - item.x * width,
          clientY - origin.top - item.y * height,
        ];
      },
      drag(id, clientX, clientY) {
        const item = itemById.get(id)!;
        const origin = map.getBoundingClientRect();
        const marginX = (item.w / 2 + 4) / width;
        const marginY = (item.h / 2 + 4) / height;
        item.x = clamp(
          (clientX - origin.left - grip[0]) / width,
          marginX,
          1 - marginX,
        );
        item.y = clamp(
          (clientY - origin.top - grip[1]) / height,
          marginY,
          1 - marginY,
        );
        item.el.style.setProperty("--x", String(item.x));
        item.el.style.setProperty("--y", String(item.y));
        redraw();
      },
    };
    measure();
    draw(0);
    sync();
    return () => {
      scene.current = null;
      cancelAnimationFrame(frame);
      cancelAnimationFrame(pending);
      sizes.disconnect();
      visibility.disconnect();
      document.removeEventListener("visibilitychange", sync);
      for (const packet of packets) packet.el.remove();
      for (const item of items) {
        for (const property of ["transform", "--x", "--y"])
          item.el.style.removeProperty(property);
        delete item.el.dataset.ping;
      }
      for (const line of lines)
        for (const property of ["transform", "left", "top"])
          line.chip.style.removeProperty(property);
    };
  }, [still, mobile]);

  useEffect(() => {
    live.current = { labelsOf };
    scene.current?.redraw();
  }, [labelsOf]);

  const captionNode = nodeById.get(captionId)!;
  return (
    <div className="eco">
      <div className="eco-stage">
        <div
          className={`eco-caption${fading ? " is-fading" : ""}`}
          ref={captionRef}
          aria-hidden="true"
        >
          <span className={`eco-caption-kind mono tone-${toneOf(captionId)}`}>
            <i />
            {captionNode.role === "integrated"
              ? "PROJETO INTEGRADO"
              : "PROJETO"}
          </span>
          <p>
            <b>{nameOf(captionId)}:</b> {captionNode.caption.text}{" "}
            <b>{captionNode.caption.highlight}</b>
          </p>
        </div>
        <div className="eco-map" ref={mapRef}>
          <svg className="eco-wires" aria-hidden="true">
            {connections.map((connection, index) => (
              <g
                key={index}
                data-line={index}
                className={`eco-line kind-${connection.kind}${
                  focus && !touches(connection, focus) ? " is-off" : ""
                }${focus && touches(connection, focus) ? " is-on" : ""}`}
              >
                <path className="eco-track" />
                <path
                  className="eco-flow"
                  style={{
                    animationDuration: `${(0.25 / SPEED[connection.kind]).toFixed(2)}s`,
                  }}
                />
                {!still && (
                  <>
                    <circle className="eco-particle" r="2.6" />
                    <circle className="eco-particle" r="2.6" />
                  </>
                )}
              </g>
            ))}
            <g ref={packetsRef} />
          </svg>
          <div aria-hidden="true">
            {connections.map((connection, index) => {
              const from = nodeById.get(connection.from)!;
              const to = nodeById.get(connection.to)!;
              const hidden = labelsOf && !touches(connection, labelsOf);
              const off = focus && !touches(connection, focus);
              return (
                <span
                  key={index}
                  data-chip={index}
                  className={`eco-chip kind-${connection.kind}${
                    hidden ? " is-hidden" : off ? " is-off" : ""
                  }`}
                  style={
                    {
                      "--dx": (from.desktop.x + to.desktop.x) / 2,
                      "--dy": (from.desktop.y + to.desktop.y) / 2,
                      "--mx": (from.mobile.x + to.mobile.x) / 2,
                      "--my": (from.mobile.y + to.mobile.y) / 2,
                    } as CSSProperties
                  }
                >
                  {connection.label}
                </span>
              );
            })}
          </div>
          {nodes.map((node) => {
            const related =
              !focus ||
              node.id === focus ||
              connections.some(
                (item) => touches(item, focus) && touches(item, node.id),
              );
            const freelance = originOf(node.id) === "freelance";
            return (
              <button
                key={node.id}
                type="button"
                data-node={node.id}
                className={`eco-node${node.role === "integrated" ? " eco-node-integrated" : ""}${
                  related ? "" : " is-off"
                }`}
                aria-label={accessibleName(node.id)}
                style={
                  {
                    "--dx": node.desktop.x,
                    "--dy": node.desktop.y,
                    "--dr": `${node.desktop.r}deg`,
                    "--mx": node.mobile.x,
                    "--my": node.mobile.y,
                    "--mr": `${node.mobile.r}deg`,
                  } as CSSProperties
                }
                onPointerEnter={() => {
                  setHovered(node.id);
                  showCaption(node.id);
                }}
                onPointerLeave={() => {
                  if (!drag.current) setHovered(null);
                }}
                onPointerDown={(event) => {
                  skipClick.current = false;
                  // No toque o arraste fica desligado: a página rola normalmente.
                  if (event.pointerType === "touch" || event.button !== 0)
                    return;
                  drag.current = {
                    x: event.clientX,
                    y: event.clientY,
                    moved: false,
                  };
                  scene.current?.grab(node.id, event.clientX, event.clientY);
                  event.currentTarget.setPointerCapture(event.pointerId);
                }}
                onPointerMove={(event) => {
                  const state = drag.current;
                  if (!state) return;
                  if (
                    Math.hypot(
                      event.clientX - state.x,
                      event.clientY - state.y,
                    ) > DRAG_THRESHOLD
                  )
                    state.moved = skipClick.current = true;
                  if (state.moved)
                    scene.current?.drag(node.id, event.clientX, event.clientY);
                }}
                onPointerUp={() => {
                  drag.current = null;
                }}
                onPointerCancel={() => {
                  drag.current = null;
                }}
                onKeyDown={() => {
                  skipClick.current = false;
                }}
                onFocus={(event) => {
                  if (!event.currentTarget.matches(":focus-visible")) return;
                  setFocused(node.id);
                  showCaption(node.id);
                }}
                onBlur={() => setFocused(null)}
                onClick={() => {
                  if (skipClick.current)
                    return void (skipClick.current = false);
                  openProject(node.id);
                }}
              >
                <span className="eco-tags">
                  <span
                    className={`eco-tag ${freelance ? "eco-tag-freelance" : "eco-tag-open"}`}
                  >
                    {freelance ? "FREELANCE" : "OPEN SOURCE"}
                  </span>
                  {node.role === "integrated" && (
                    <span className="eco-tag eco-tag-integrated">
                      INTEGRADO
                    </span>
                  )}
                </span>
                <strong>{nameOf(node.id)}</strong>
                <span className="eco-subtitle">{node.subtitle}</span>
              </button>
            );
          })}
        </div>
      </div>
      <ul className="sr-only">
        {connections.map((connection, index) => (
          <li key={index}>
            {nameOf(connection.from)} → {nameOf(connection.to)}:{" "}
            {connection.label}
          </li>
        ))}
      </ul>
      <div className="eco-legend" aria-hidden="true">
        {LEGEND.map((item) => (
          <span key={item.kind} className={`kind-${item.kind}`}>
            <i />
            {item.text}
          </span>
        ))}
      </div>
      <div className="eco-activity" aria-hidden="true">
        <div className="eco-feed">
          {feed.map((item) => (
            <div key={item.key} className={`kind-${item.kind}`}>
              <i />
              {item.text}
            </div>
          ))}
        </div>
        <span className="mono">
          {still ? "" : "ATIVIDADE SIMULADA · "}
          {mobile ? "TOQUE" : "ARRASTE · CLIQUE"}
        </span>
      </div>
    </div>
  );
}

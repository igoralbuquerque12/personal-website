"use client";

import { useState } from "react";
import { profile } from "@/knowledge-base";
import { Icon } from "./icons";

const links = [
  { href: "#sobre", text: "Sobre" },
  { href: "#experiencia", text: "Trajetória" },
  { href: "#projetos", text: "Projetos" },
  { href: "#formacao", text: "Formação" },
  { href: "#artigos", text: "Artigos" },
];

export function Navigation() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="header-inner">
        <a
          href="#inicio"
          className="brand"
          aria-label="Igor Albuquerque, início"
          onClick={() => setOpen(false)}
        >
          <span className="brand-mark">
            ia<span>↗</span>
          </span>
          <span>
            igor<span className="brand-surname">.albuquerque</span>
            <span className="brand-dot">.</span>
          </span>
        </a>
        <nav className="desktop-nav" aria-label="Navegação principal">
          {links.map((link) => (
            <a key={link.href} href={link.href}>
              {link.text}
            </a>
          ))}
        </nav>
        <a className="header-contact" href="#contato">
          Vamos conversar <Icon name="arrow" size={16} />
        </a>
        <button
          className="menu-toggle"
          type="button"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => setOpen(!open)}
        >
          <Icon name={open ? "close" : "menu"} />
        </button>
      </div>
      {open && (
        <nav
          className="mobile-nav"
          id="mobile-navigation"
          aria-label="Navegação mobile"
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
          }}
        >
          {links.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
              {link.text}
              <Icon name="arrow" size={16} />
            </a>
          ))}
          <a
            href={profile.cv.url}
            target="_blank"
            rel="noreferrer"
            onClick={() => setOpen(false)}
          >
            Currículo em PDF <Icon name="file" size={16} />
          </a>
          <a href="#contato" onClick={() => setOpen(false)}>
            Vamos conversar <Icon name="arrow" size={16} />
          </a>
        </nav>
      )}
    </header>
  );
}

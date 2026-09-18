import Image from "next/image";
import {
  certifications,
  experiences,
  expertise,
  profile,
  publications,
} from "@/knowledge-base";
import { Navigation } from "./ui/navigation";
import { Icon } from "./ui/icons";
import { SystemSketch } from "./ui/system-sketch";
import { ProjectBrowser } from "./ui/project-browser";

function SectionHeading({
  index,
  label,
  title,
  text,
}: {
  index: string;
  label: string;
  title: string;
  text?: string;
}) {
  return (
    <div className="section-heading">
      <div>
        <p className="eyebrow">
          <span>{index} /</span> {label}
        </p>
        <h2>
          {title}
          <span className="accent-dot">.</span>
        </h2>
      </div>
      {text && <p className="section-intro">{text}</p>}
    </div>
  );
}

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <Navigation />
      <main id="conteudo">
        <section
          className="hero section-shell"
          id="inicio"
          aria-labelledby="hero-title"
        >
          <div className="hero-topline">
            <span className="eyebrow">
              <span className="status-dot" /> ENGENHEIRO DE SOFTWARE
            </span>
            <span className="mono hero-location">MONTES CLAROS, BR ↗</span>
          </div>
          <div className="hero-grid">
            <div className="hero-copy">
              <p className="hero-greeting">Olá, sou o Igor.</p>
              <h1 id="hero-title">
                Software que
                <br />
                resolve.
                <br />
                <span>
                  Arquitetura
                  <br />
                  que sustenta.
                </span>
              </h1>
              <p className="hero-description">{profile.introduction}</p>
              <div className="hero-actions">
                <a className="button button-dark" href="#projetos">
                  Explore meus projetos <Icon name="arrow" size={18} />
                </a>
                <a
                  className="button button-outline"
                  href={profile.cv.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Ver currículo <Icon name="file" size={17} />
                </a>
              </div>
              <div className="hero-socials">
                <a href={profile.github} target="_blank" rel="noreferrer">
                  <Icon name="github" size={16} />
                  GitHub <Icon name="arrow" size={12} />
                </a>
                <a href={profile.linkedin} target="_blank" rel="noreferrer">
                  <Icon name="linkedin" size={16} />
                  LinkedIn <Icon name="arrow" size={12} />
                </a>
                <span className="hero-social-divider" />
                <span>Backend. Cloud. IA.</span>
              </div>
            </div>
            <div className="hero-visual">
              <div className="visual-corner mono">
                PENSAR EM SISTEMAS.
                <br />
                CONSTRUIR COM PROPÓSITO.
              </div>
              <SystemSketch />
              <div className="hero-note">
                <span className="note-star">✳</span>
                <p>
                  O que acontece por trás da tela
                  <br />
                  <strong>é o que me move.</strong>
                </p>
                <span className="note-line" />
              </div>
            </div>
          </div>
          <div className="hero-bottom mono">
            <span>DA REGRA DE NEGÓCIO AO DEPLOY</span>
            <a href="#sobre">
              CONHEÇA MEU TRABALHO <Icon name="down" size={15} />
            </a>
          </div>
        </section>
        <section id="sobre" className="about-section section-shell">
          <div className="about-person">
            <div className="portrait-wrap">
              <Image
                src={profile.portrait}
                alt="Igor Albuquerque"
                fill
                sizes="168px"
                priority
              />
              <span className="portrait-caption mono">PRAZER, IGOR ↗</span>
            </div>
            <div className="about-location">
              <Icon name="globe" size={16} />
              <span>
                De Montes Claros
                <br />
                para problemas reais.
              </span>
            </div>
          </div>
          <div className="about-copy">
            <p className="eyebrow">01 / UM POUCO SOBRE MIM</p>
            <h2>
              Curiosidade para entender.
              <br />
              Engenharia para resolver<span className="accent-dot">.</span>
            </h2>
            <p>{profile.about}</p>
            <p className="about-secondary">
              Comecei entre pesquisa e desenvolvimento web. Hoje, construo
              produtos SaaS, automações e aplicações com IA. Gosto especialmente
              dos pontos em que os sistemas ficam interessantes: concorrência,
              integrações, dados e falhas.
            </p>
            <span className="languages mono">{profile.languages}</span>
          </div>
        </section>
        <div className="metrics-strip">
          <div className="section-shell metrics-grid">
            <div>
              <strong>
                5<span> concessionárias</span>
              </strong>
              <p>atendidas pelo CRM na Nocorp</p>
            </div>
            <div>
              <strong>
                ~100<span> vendedores</span>
              </strong>
              <p>na operação do mesmo ecossistema</p>
            </div>
            <div>
              <strong>
                10<span> pessoas</span>
              </strong>
              <p>usando o vibe-git diariamente</p>
            </div>
            <div className="metrics-note">
              <Icon name="layers" size={25} />
              <p>
                Software com contexto.
                <br />
                <strong>Impacto no trabalho real.</strong>
              </p>
            </div>
          </div>
        </div>
        <section
          id="experiencia"
          className="experience-section section-shell section-space"
        >
          <SectionHeading
            index="02"
            label="TRAJETÓRIA"
            title="Experiência que vira repertório"
            text="Da pesquisa acadêmica à operação de produtos. Cada contexto trouxe um problema diferente para resolver."
          />
          <div className="timeline">
            {experiences.map((experience) => (
              <article
                key={experience.id}
                className={`timeline-item ${experience.current ? "timeline-current" : ""}`}
              >
                <div className="timeline-period mono">
                  <span className="timeline-dot" />
                  {experience.period}
                  {experience.current && (
                    <span className="current-badge">ATUALMENTE</span>
                  )}
                </div>
                <div className="timeline-content">
                  <div className="timeline-title">
                    <div>
                      <h3>{experience.company}</h3>
                      <p>{experience.role}</p>
                    </div>
                    <Icon name="arrow" size={24} />
                  </div>
                  <p className="experience-description">
                    {experience.description}
                  </p>
                  <ul>
                    {experience.highlights.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <div className="tags">
                    {experience.stack.map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="expertise-panel">
            <div className="expertise-heading">
              <Icon name="code" size={23} />
              <span className="eyebrow">
                AS FERRAMENTAS MUDAM.
                <br />
                OS FUNDAMENTOS FICAM.
              </span>
            </div>
            <div className="expertise-grid">
              {expertise.map((item) => (
                <div key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section id="projetos" className="projects-section section-space">
          <div className="section-shell">
            <SectionHeading
              index="03"
              label="PROJETOS & SYSTEM DESIGN"
              title="Por dentro do que eu construo"
              text="O produto é o começo da conversa. Explore as decisões, os fluxos e a engenharia por trás de cada entrega."
            />
            <ProjectBrowser />
          </div>
        </section>
        <section
          id="formacao"
          className="education-section section-shell section-space"
        >
          <SectionHeading
            index="04"
            label="FORMAÇÃO"
            title="Uma base para ir além"
          />
          <article className="education-card">
            <div className="university-mark" aria-hidden="true">
              <span>UNI</span>
              <span>MONTES</span>
              <Icon name="arrow" size={25} />
            </div>
            <div className="education-copy">
              <div className="education-meta">
                <span className="mono">{profile.education.period}</span>
                <span className="education-status">
                  <span className="status-dot" />
                  {profile.education.status}
                </span>
              </div>
              <h3>{profile.education.degree}</h3>
              <p className="university-name">{profile.education.institution}</p>
              <p>{profile.education.description}</p>
            </div>
          </article>
          {certifications.enabled && certifications.items.length > 0 && (
            <div className="certifications">
              <h3>Certificações</h3>
              {certifications.items.map((item) => (
                <article key={item.id}>
                  <h4>{item.name}</h4>
                  <p>
                    {item.issuer} · {item.year}
                  </p>
                  {item.url && (
                    <a href={item.url} target="_blank" rel="noreferrer">
                      Ver credencial <Icon name="arrow" size={16} />
                    </a>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
        <section
          id="artigos"
          className="articles-section section-shell section-space"
        >
          <SectionHeading
            index="05"
            label="ARTIGOS & PESQUISA"
            title="Investigar também é construir"
            text="Perguntas, experimentos e contribuições que conectam computação a problemas fora do código."
          />
          <div className="articles-grid">
            {publications.map((publication, index) => (
              <article className="article-card" key={publication.id}>
                <div className="article-top">
                  <span className="mono">{publication.type}</span>
                  <span className="article-number">0{index + 1}</span>
                </div>
                <div className="article-tags">
                  {publication.tags.join(" / ")}
                </div>
                <h3>{publication.title}</h3>
                <p>{publication.description}</p>
                <span className="article-venue">{publication.venue}</span>
                <a href={publication.url} target="_blank" rel="noreferrer">
                  {publication.linkLabel}
                  <Icon name="arrow" size={18} />
                </a>
              </article>
            ))}
          </div>
        </section>
        <section id="contato" className="contact-section">
          <div className="section-shell contact-inner">
            <div>
              <p className="eyebrow">
                <span className="status-dot" /> VAMOS CONVERSAR
              </p>
              <h2>
                Um bom problema
                <br />
                merece uma <span>boa solução.</span>
              </h2>
              <p>
                Procurando alguém que conecte arquitetura, código e negócio?
                <br />
                Quero conhecer o que você está construindo.
              </p>
              <a className="contact-email" href={`mailto:${profile.email}`}>
                {profile.email}
                <Icon name="arrow" size={25} />
              </a>
            </div>
            <div className="contact-links">
              <a href={profile.linkedin} target="_blank" rel="noreferrer">
                <Icon name="linkedin" />
                LinkedIn
                <Icon name="arrow" />
              </a>
              <a href={profile.github} target="_blank" rel="noreferrer">
                <Icon name="github" />
                GitHub
                <Icon name="arrow" />
              </a>
              <a href={profile.cv.url} download={profile.cv.filename}>
                <Icon name="file" />
                Baixar currículo
                <Icon name="down" />
              </a>
              <span className="mono">MONTES CLAROS, MG · BRASIL</span>
            </div>
          </div>
        </section>
      </main>
      <footer className="site-footer section-shell">
        <a className="brand" href="#inicio">
          <span className="brand-mark">
            ia<span>↗</span>
          </span>
          <span>Igor Albuquerque</span>
        </a>
        <span>Feito com intenção. Do desenho ao código.</span>
        <a className="mono" href="#inicio">
          VOLTAR AO TOPO <Icon name="arrow" size={15} />
        </a>
      </footer>
    </>
  );
}

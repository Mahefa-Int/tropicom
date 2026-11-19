"use client";

import { useEffect, useState } from "react";
import CtaIcon from "./CtaIcon";
import type { CaseData } from "@/lib/cases";

/**
 * Étude de cas (page « single » d'une réalisation, /realisations/[slug]). Maquette 1440 × 6291, barre de menu comprise.
 * Contenu géré dans l'admin (Réalisations) ; voir lib/cases.ts. Une section vide est masquée, avec son entrée du sommaire.
 */
const SECTIONS = [
  { id: "contexte", label: "Contexte" },
  { id: "enjeu", label: "L’enjeu" },
  { id: "reponse", label: "Notre réponse" },
  { id: "resultats", label: "Résultats" },
  { id: "verbatim", label: "Verbatim" },
];

const splitLines = (text: string) =>
  text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

/** texte saisi dans l'admin : chaque retour à la ligne devient un <br> (masqué sur mobile) */
function br(text: string) {
  const lines = splitLines(text);
  return lines.map((l, i) => (
    <span key={i}>
      {l}
      {i < lines.length - 1 && (
        <>
          {" "}
          <br />
        </>
      )}
    </span>
  ));
}
const has = (t: string) => t.trim().length > 0;
const nn = (i: number) => String(i + 1).padStart(2, "0");

export default function CaseStudy({ data }: { data: CaseData }) {
  const d = data.details;
  const show: Record<string, boolean> = {
    contexte: has(d.context),
    enjeu: has(d.stake),
    reponse: has(d.answerLead) || has(d.answerHighlight) || d.levers.some((l) => has(l.title)),
    resultats: d.results.some((r) => has(r.value)) || has(d.highlight.strong),
    verbatim: has(d.quote.text),
  };
  const sections = SECTIONS.filter((s) => show[s.id]);
  const ids = sections.map((s) => s.id).join();
  const [active, setActive] = useState(sections[0]?.id ?? "");

  // sommaire : la dernière section passée au-dessus du tiers de l'écran est mise en avant
  useEffect(() => {
    const els = ids
      .split(",")
      .map((id) => document.getElementById("cs-" + id))
      .filter(Boolean) as HTMLElement[];
    const onScroll = () => {
      const line = window.innerHeight * 0.35;
      let cur = els[0]?.id.slice(3) ?? "";
      for (const el of els) if (el.getBoundingClientRect().top <= line) cur = el.id.slice(3);
      // tout en bas de la page : la dernière section, même si elle n'atteint pas la ligne
      if (els.length && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) cur = els[els.length - 1].id.slice(3);
      setActive(cur);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [ids]);

  const go = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    document.getElementById("cs-" + id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", "#" + id);
  };

  const meta = d.meta.filter((m) => has(m.label) || has(m.value));
  const levers = d.levers.filter((l) => has(l.title) || has(l.text));
  const gallery = d.gallery.filter((g) => g.src);
  const results = d.results.filter((r) => has(r.value) || has(r.label));

  return (
    <article className="cs">
      {/* ---------- en-tête ---------- */}
      <header className="cs-head" data-reveal>
        <nav className="cs-crumb" aria-label="Fil d’Ariane">
          <a href="/realisations">
            <svg viewBox="0 0 12 12" aria-hidden="true">
              <path d="M10 6H2.5M5.5 3 2.5 6l3 3" />
            </svg>
            Réalisations
          </a>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{data.name}</span>
        </nav>
        <h1 className="cs-title">
          <span className="cs-l">
            <span className="cs-gold">{d.titleLead}</span>
          </span>
          {splitLines(d.titleRest).map((l, i) => (
            <span className="cs-l" key={i}>
              <span>{l}</span>
            </span>
          ))}
        </h1>
        {meta.length > 0 && (
          <dl className="cs-meta">
            {meta.map((m, i) => (
              <div key={i}>
                <dt>{m.label}</dt>
                <dd>{m.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </header>

      {/* ---------- photo ---------- */}
      {data.heroSrc && (
        <figure className="cs-hero" data-reveal>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={data.heroSrc} alt={d.hero.alt} fetchPriority="high" />
          {has(d.hero.caption) && (
            <figcaption className="cs-caption">
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <rect x="2" y="2.5" width="12" height="11" rx="2" />
                <circle cx="6" cy="6.5" r="1.2" />
                <path d="m14 11-3.2-3.2L5 13.5" />
              </svg>
              <span>{d.hero.caption}</span>
            </figcaption>
          )}
          {has(d.hero.stat) && (
            <p className="cs-hero-stat">
              <b>{d.hero.stat}</b>
              <span>{d.hero.statText}</span>
            </p>
          )}
        </figure>
      )}

      {/* ---------- sommaire · contexte · enjeu · réponse ---------- */}
      {sections.length > 0 && (
        <div className="cs-body">
          <nav className="cs-toc" aria-label="Sommaire de l’étude">
            <ol>
              {sections.map((s, i) => (
                <li key={s.id}>
                  <a href={"#" + s.id} className={active === s.id ? "is-on" : undefined} onClick={(e) => go(e, s.id)}>
                    {nn(i)} {s.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="cs-main">
            {show.contexte && (
              <section id="cs-contexte" className="cs-sec cs-ctx" data-reveal aria-labelledby="cs-ctx-l">
                <p className="cs-label" id="cs-ctx-l">Contexte</p>
                <p className="cs-ctx-t">{br(d.context)}</p>
              </section>
            )}

            {show.enjeu && (
              <section id="cs-enjeu" className="cs-sec cs-stake" data-reveal aria-labelledby="cs-stake-l">
                <p className="cs-label" id="cs-stake-l">L’enjeu</p>
                <h2 className="cs-stake-t">{br(d.stake)}</h2>
              </section>
            )}

            {show.reponse && (
              <section id="cs-reponse" className="cs-sec cs-answer" data-reveal aria-labelledby="cs-answer-l">
                <p className="cs-label" id="cs-answer-l">Notre réponse</p>
                {(has(d.answerLead) || has(d.answerHighlight)) && (
                  <p className="cs-answer-t">
                    {d.answerLead} <em>{br(d.answerHighlight)}</em>
                  </p>
                )}
                {levers.length > 0 && (
                  <ol className="cs-levers">
                    {levers.map((l, i) => (
                      <li key={i} className="cs-lever">
                        <span className="cs-lever-n">Levier {nn(i)}</span>
                        <h3>{l.title}</h3>
                        <p>{br(l.text)}</p>
                      </li>
                    ))}
                  </ol>
                )}
              </section>
            )}
          </div>
        </div>
      )}

      {/* ---------- visuels ---------- */}
      {gallery.length > 0 && (
        <div className="cs-gallery">
          {gallery.map((g, i) => (
            <figure key={i} className="cs-shot" data-reveal style={g.w && g.h ? { aspectRatio: `${g.w} / ${g.h}` } : undefined}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={g.src} alt={g.alt} width={g.w} height={g.h} loading="lazy" />
            </figure>
          ))}
        </div>
      )}

      {/* ---------- résultats ---------- */}
      {show.resultats && (
        <section id="cs-resultats" className="cs-results" data-reveal aria-labelledby="cs-results-t">
          <p className="cs-label">Résultats</p>
          <div className="cs-results-head">
            <h2 id="cs-results-t">{d.resultsTitle}</h2>
            {has(d.resultsNote) && <p>{d.resultsNote}</p>}
          </div>
          {results.length > 0 && (
            <ol className="cs-kpis" style={{ "--n": Math.min(results.length, 3) } as React.CSSProperties}>
              {results.map((r, i) => (
                <li key={i} className="cs-kpi">
                  <span className="cs-kpi-n">{nn(i)}</span>
                  <b>{r.value}</b>
                  <span className="cs-kpi-l">{r.label}</span>
                  {has(r.note) && <small>{r.note}</small>}
                </li>
              ))}
            </ol>
          )}
          {has(d.highlight.strong) && (
            <p className="cs-highlight">
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <circle cx="10" cy="10" r="9" />
                <path d="M8.2 6.6v6.8l5.3-3.4z" />
              </svg>
              <span>
                <strong>{d.highlight.strong}</strong> {d.highlight.text}
              </span>
            </p>
          )}
        </section>
      )}

      {/* ---------- verbatim ---------- */}
      {show.verbatim && (
        <section id="cs-verbatim" className="cs-quote" data-reveal aria-label="Verbatim">
          <svg className="cs-quote-mark" viewBox="0 0 73 50" aria-hidden="true">
            <path d="M14 0h22L22 50H0zM51 0h22L59 50H37z" />
          </svg>
          <figure>
            <blockquote>« {d.quote.text.trim()} »</blockquote>
            {(has(d.quote.name) || has(d.quote.role)) && (
              <figcaption>
                <span className="cs-avatar" aria-hidden="true">
                  {d.quote.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={d.quote.avatar} alt="" />
                  ) : (
                    <svg viewBox="0 0 16 16">
                      <rect x="2" y="2.5" width="12" height="11" rx="2" />
                      <circle cx="6" cy="6.5" r="1.2" />
                      <path d="m14 11-3.2-3.2L5 13.5" />
                    </svg>
                  )}
                </span>
                <span>
                  <b>{d.quote.name}</b>
                  <small>{d.quote.role}</small>
                </span>
              </figcaption>
            )}
          </figure>
        </section>
      )}

      {/* ---------- appel à l'action (identique sur toutes les réalisations) · projet suivant ---------- */}
      <div className={"cs-end" + (data.next ? "" : " is-solo")}>
        <section className="cs-cta" data-reveal aria-labelledby="cs-cta-t">
          <h2 id="cs-cta-t">Un enjeu comparable ?</h2>
          <p>Le diagnostic est offert.</p>
          <a href="/#contact" className="cta cs-cta-btn">
            <CtaIcon />
            <span className="cta-label">Demander un diagnostic</span>
          </a>
        </section>
        {data.next && (
          <a className="cs-next" href={data.next.href} data-reveal>
            <span className="cs-next-media">
              {data.next.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="cs-next-img" src={data.next.image} alt="" loading="lazy" />
              )}
              <span className="cs-next-pill">Projet suivant</span>
              <span className="cs-next-arrow" aria-hidden="true">
                <svg viewBox="0 0 16 16">
                  <path d="M5 11 11 5M6 5h5v5" />
                </svg>
              </span>
              {has(data.next.stat) && (
                <span className="cs-next-stat">
                  <b>{data.next.stat}</b>
                  <span>{data.next.statText}</span>
                </span>
              )}
            </span>
            <span className="cs-next-body">
              <span className="cs-next-client">{data.next.client}</span>
              <span className="cs-next-title">{data.next.title}</span>
              <span className="cs-next-tags">{data.next.tags}</span>
            </span>
          </a>
        )}
      </div>
    </article>
  );
}

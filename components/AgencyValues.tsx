/**
 * Page « L'Agence » — « 05 — Nos valeurs » : « Quatre mots, tenus. »
 * Maquette 1440 × 580 : intitulé en (64, 83), titre DM Sans 600 50 px, traits jaunes en haut à droite ;
 * 4 cartes 244 × 254 (#171616, coins 24) en x 64 / 420 / 776 / 1132, y 246 : mot 45,5 px, texte 16,3 / 19 #a19d93,
 * numéro 001…004, icône jaune doré (trait) en bas à droite.
 * Au survol : la carte monte légèrement, l'icône s'anime.
 */
const VALUES = [
  {
    word: "Exigence.",
    text: "Nous livrons ce que nous\naccepterions de signer\nde notre nom. C'est le\ncas.",
    icon: (
      <>
        <line x1="2" x2="5" y1="12" y2="12" />
        <line x1="19" x2="22" y1="12" y2="12" />
        <line x1="12" x2="12" y1="2" y2="5" />
        <line x1="12" x2="12" y1="19" y2="22" />
        <circle cx="12" cy="12" r="7" />
        <circle cx="12" cy="12" r="2.2" fill="currentColor" />
      </>
    ),
  },
  {
    word: "Franchise.",
    text: "Nous disons ce qui ne\nmarche pas, y compris\nquand c'est notre\nrecommandation de l'an\ndernier.",
    icon: (
      <>
        <path d="M21 15a2 2 0 0 1-2 2H9l-4 4v-4H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <path d="M12 6.5v4.5" />
        <path d="M12 14h.01" />
      </>
    ),
  },
  {
    word: "Ancrage.",
    text: "Nous vivons ici. Nos\nimages sont prises ici.\nNos équipes sont d'ici.",
    icon: (
      <>
        <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
        <circle cx="12" cy="10" r="3" />
      </>
    ),
  },
  {
    word: "Preuve.",
    text: "Une idée qui ne se\nmesure pas reste une\nidée.",
    icon: (
      <>
        <path d="M3 21h19" />
        <path d="M5 21v-5h3v5" />
        <path d="M10.5 21v-8h3v8" fill="currentColor" />
        <path d="M16 21V9h3v12" fill="currentColor" />
        <path d="M3 13 10 7l3 2 8-6" />
        <path d="M17 3h4v4" />
      </>
    ),
  },
];

export default function AgencyValues() {
  return (
    <section className="agv" data-reveal aria-labelledby="agv-title">
      <p className="ags-label agv-label">
        <span className="ags-n">05</span>
        <span className="ags-bar" aria-hidden="true"></span>
        Nos valeurs
      </p>
      <h2 className="agv-title" id="agv-title">
        Quatre mots, tenus.
      </h2>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="agv-traits" src="/images/agence/traits-jaunes-2.webp" alt="" aria-hidden="true" width={118} height={50} />

      <ul className="agv-cards">
        {VALUES.map((v, i) => (
          <li key={v.word} className="agv-card" style={{ "--k": i } as React.CSSProperties}>
            <h3 className="agv-word">{v.word}</h3>
            <p className="agv-text">
              {v.text.split("\n").map((l, j, all) => (
                <span key={j}>
                  {l}
                  {j < all.length - 1 && <br />}
                </span>
              ))}
            </p>
            <span className="agv-num">{String(i + 1).padStart(3, "0")}</span>
            <svg
              className={"agv-icon agv-icon--" + (i + 1)}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {v.icon}
            </svg>
          </li>
        ))}
      </ul>
    </section>
  );
}

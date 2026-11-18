/** petits éléments d'interface partagés (rendus côté serveur) */
import Link from "next/link";

export function PageHead({ title, text, crumb, children }: { title: string; text?: string; crumb?: { href: string; label: string }; children?: React.ReactNode }) {
  return (
    <header className="adm-head">
      <div>
        {crumb && (
          <p className="adm-crumb">
            <Link href={crumb.href}>← {crumb.label}</Link>
          </p>
        )}
        <h1>{title}</h1>
        {text && <p>{text}</p>}
      </div>
      {children && <div className="adm-actions">{children}</div>}
    </header>
  );
}

export function StatusBadge({ status }: { status: "draft" | "published" }) {
  return status === "published" ? <span className="adm-badge adm-badge--green">Publié</span> : <span className="adm-badge adm-badge--yellow">Brouillon</span>;
}

export function Empty({ title, text, children }: { title: string; text?: string; children?: React.ReactNode }) {
  return (
    <div className="adm-empty">
      <b>{title}</b>
      {text}
      {children && <div style={{ marginTop: 14 }}>{children}</div>}
    </div>
  );
}

/** courbe simple en SVG (clics Search Console, etc.) */
export function LineChart({ points, color = "#f7c227" }: { points: { label: string; value: number }[]; color?: string }) {
  const W = 600, H = 200, P = 8;
  const max = Math.max(1, ...points.map((p) => p.value));
  const xy = points.map((p, i) => [P + (i * (W - 2 * P)) / Math.max(1, points.length - 1), H - P - (p.value / max) * (H - 2 * P)] as const);
  const line = xy.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  return (
    <svg className="adm-chart" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label="Évolution">
      <defs>
        <linearGradient id="admArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.35" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1="0" x2={W} y1={H * f} y2={H * f} stroke="#2c2b2b" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      ))}
      {xy.length > 1 && (
        <>
          <path d={`${line} L${xy[xy.length - 1][0]} ${H} L${xy[0][0]} ${H} Z`} fill="url(#admArea)" />
          <path d={line} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
        </>
      )}
    </svg>
  );
}

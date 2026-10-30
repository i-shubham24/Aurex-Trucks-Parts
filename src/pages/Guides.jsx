import { Link, useParams } from "react-router-dom";
import { GUIDES, guideFor } from "../data/guides";

const updatedOn = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });

function Block({ b }) {
  if (b.h) return <h2 className="pt-3 text-xl font-extrabold tracking-tight">{b.h}</h2>;
  if (b.p) return <p className="text-[15px] leading-7 text-steel">{b.p}</p>;
  if (b.list) {
    return (
      <ul className="list-disc space-y-1.5 pl-5 text-[15px] leading-7 text-steel">
        {b.list.map((li) => <li key={li}>{li}</li>)}
      </ul>
    );
  }
  if (b.table) {
    return (
      <div className="overflow-x-auto rounded-md border border-line">
        <table className="w-full min-w-[520px] border-collapse text-left text-sm">
          <thead className="bg-mist text-ink">
            <tr>{b.table.head.map((h) => <th key={h} scope="col" className="px-3 py-2 font-bold">{h}</th>)}</tr>
          </thead>
          <tbody>
            {b.table.rows.map((row) => (
              <tr key={row.join("|")} className="border-t border-line align-top">
                {row.map((cell, i) => i === 0
                  ? <th key={i} scope="row" className="px-3 py-2 font-bold text-ink">{cell}</th>
                  : <td key={i} className="px-3 py-2 text-steel">{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  if (b.note) return <aside className="rounded-md border-l-4 border-gold bg-gold/10 px-4 py-3 text-sm leading-6 text-ink">{b.note}</aside>;
  if (b.links) {
    return (
      <ul className="flex flex-wrap gap-2">
        {b.links.map((l) => (
          <li key={l.to}>
            <Link to={l.to} className="inline-block rounded-md border border-line-dark bg-white px-3 py-1.5 text-sm font-bold text-ink transition-colors hover:border-navy hover:text-navy">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    );
  }
  return null;
}

export default function Guide() {
  const { slug } = useParams();
  const guide = guideFor(slug);

  if (!guide) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-extrabold">Guide not found</h1>
        <Link to="/guides" className="mt-4 inline-block rounded bg-gold px-6 py-2.5 text-sm font-bold text-ink">All guides</Link>
      </main>
    );
  }

  const others = GUIDES.filter((g) => g.slug !== guide.slug);

  return (
    <main>
      <article className="mx-auto max-w-3xl px-4 pt-6">
        <p className="text-[12px] text-faint">
          <Link to="/" className="hover:text-navy hover:underline">Home</Link> /{" "}
          <Link to="/guides" className="hover:text-navy hover:underline">Guides</Link> /{" "}
          <span className="font-semibold text-ink">{guide.title}</span>
        </p>
        <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight md:text-[40px]">{guide.title}</h1>
        <p className="mt-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-faint">
          Updated {updatedOn(guide.updated)} · Aurex trade counter, Campbellfield VIC
        </p>
        <div className="mt-6 space-y-4">
          {guide.body.map((b, k) => <Block key={k} b={b} />)}
        </div>
        {guide.sources.length > 0 && (
          <div className="mt-8 border-t border-line pt-4 text-sm text-steel">
            <h2 className="font-extrabold text-ink">Source</h2>
            <ul className="mt-1 space-y-1">
              {guide.sources.map((s) => (
                <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer" className="text-navy underline">{s.label}</a></li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-faint">This guide summarises the source document. Where they differ, the source document applies.</p>
          </div>
        )}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-md bg-ink p-5 text-white">
          <p className="text-[15px] font-extrabold">Not sure which part fits?</p>
          <Link to="/contact" className="rounded bg-gold px-5 py-2.5 text-sm font-bold text-ink transition-colors hover:bg-white">
            Ask the counter
          </Link>
        </div>
      </article>
      <section className="mx-auto max-w-3xl px-4 pb-12 pt-10">
        <h2 className="text-xl font-extrabold tracking-tight">More guides</h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {others.map((g) => (
            <li key={g.slug}>
              <Link to={`/guides/${g.slug}`} className="block h-full rounded-md border border-line bg-white p-4 transition-colors hover:border-navy">
                <span className="block font-bold text-ink">{g.title}</span>
                <span className="mt-1 block text-sm text-steel">{g.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

export function GuidesIndex() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <p className="text-[12px] text-faint">
        <Link to="/" className="hover:text-navy hover:underline">Home</Link> / <span className="font-semibold text-ink">Guides</span>
      </p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight md:text-4xl">Truck &amp; Trailer Parts Guides</h1>
      <p className="mt-1 max-w-2xl text-sm text-steel">
        Plain-English guides from our Campbellfield trade counter: compliance basics, how parts work and what to measure before you order.
      </p>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {GUIDES.map((g) => (
          <li key={g.slug}>
            <Link to={`/guides/${g.slug}`} className="block h-full rounded-md border border-line bg-white p-5 transition-colors hover:border-navy">
              <span className="block text-lg font-extrabold leading-snug text-ink">{g.title}</span>
              <span className="mt-2 block text-sm leading-6 text-steel">{g.description}</span>
              <span className="mt-3 block font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-faint">Updated {updatedOn(g.updated)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Palette, ArrowRight, Play, Pause } from 'lucide-react';
import { allTemplates, formatsOf, type Template } from '../templates/registry';
import { CATEGORIES, CATEGORY_MAP, FORMATS, type CategoryId, type FormatId } from '../templates/catalog';
import { TemplateCard } from '../ui/TemplateCard';
import { CATEGORY_ICONS } from '../ui/categoryIcons';
import { href, navigate, type Route } from '../lib/router';
import { useBrand, useUI } from '../lib/store';

type Sort = 'popular' | 'new' | 'az';
const FORMAT_FILTERS: (FormatId | 'all')[] = ['all', 'square', 'portrait', 'story', 'landscape', 'carousel'];

function matches(t: Template, q: string) {
  if (!q) return true;
  const hay = [t.name, t.variantName, t.recipe.description ?? '', CATEGORY_MAP[t.category].name, ...t.tags].join(' ').toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((w) => hay.includes(w));
}

function sortList(list: Template[], sort: Sort) {
  const l = [...list];
  if (sort === 'popular') l.sort((a, b) => b.popularity - a.popularity);
  else if (sort === 'new') l.sort((a, b) => Number(b.isNew) - Number(a.isNew) || b.popularity - a.popularity);
  else l.sort((a, b) => a.name.localeCompare(b.name) || a.variantIndex - b.variantIndex);
  return l;
}

function useCounts() {
  return useMemo(() => {
    const c: Record<string, number> = { all: allTemplates().length };
    for (const t of allTemplates()) c[t.category] = (c[t.category] ?? 0) + 1;
    return c;
  }, []);
}

function Grid({ list, format }: { list: Template[]; format?: FormatId }) {
  const [limit, setLimit] = useState(36);
  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => setLimit(36), [list]);
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setLimit((l) => l + 36), { rootMargin: '1200px' });
    io.observe(el);
    return () => io.disconnect();
  }, [list]);
  if (!list.length)
    return (
      <div className="empty">
        <h3 style={{ margin: '0 0 6px', color: 'var(--ink)' }}>No templates match</h3>
        Try another word, or clear the filters.
      </div>
    );
  return (
    <>
      <div className="masonry">
        {list.slice(0, limit).map((t) => (
          <TemplateCard key={t.id + (format ?? '')} t={t} format={format && formatsOf(t.recipe).includes(format) ? format : undefined} />
        ))}
      </div>
      {limit < list.length && <div ref={sentinel} style={{ height: 1 }} />}
    </>
  );
}

function Featured({ cat, list }: { cat: CategoryId; list: Template[] }) {
  const c = CATEGORY_MAP[cat];
  const Icon = CATEGORY_ICONS[cat];
  return (
    <section>
      <div className="section-head">
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon size={24} color="var(--blue)" /> {c.name}
          </h2>
          <p>{c.blurb}</p>
        </div>
        <a className="btn btn-soft" href={href(`/templates/${cat}`)}>
          View all {list.length} <ArrowRight />
        </a>
      </div>
      <div className="hscroll" style={{ gridAutoColumns: cat === 'carousel' ? 'minmax(420px, 1fr)' : 'minmax(220px, 1fr)', alignItems: 'end' }}>
        {list.slice(0, cat === 'carousel' ? 6 : 10).map((t) => (
          <TemplateCard key={t.id} t={t} format={cat === 'carousel' ? undefined : 'square'} />
        ))}
      </div>
    </section>
  );
}

export function TemplatesPage({ route }: { route: Route }) {
  const category = (route.parts[1] as CategoryId | 'favorites' | undefined) ?? 'all';
  const [q, setQ] = useState(route.query.get('q') ?? '');
  const [format, setFormat] = useState<FormatId | 'all'>((route.query.get('format') as FormatId) ?? 'all');
  const [sort, setSort] = useState<Sort>('popular');
  const brand = useBrand((s) => s.brand);
  const setBrand = useBrand((s) => s.setBrand);
  const { favorites, autoplay, setAutoplay, setBrandOpen } = useUI();
  const counts = useCounts();

  useEffect(() => setQ(route.query.get('q') ?? ''), [route.query]);

  const list = useMemo(() => {
    let l = allTemplates();
    if (category === 'favorites') l = l.filter((t) => favorites.includes(t.id));
    else if (category !== 'all') l = l.filter((t) => t.category === category);
    if (format !== 'all') l = l.filter((t) => formatsOf(t.recipe).includes(format));
    l = l.filter((t) => matches(t, q));
    return sortList(l, sort);
  }, [category, format, q, sort, favorites]);

  const showFeatured = category === 'all' && !q && format === 'all';
  const catInfo = category !== 'all' && category !== 'favorites' ? CATEGORY_MAP[category] : null;

  return (
    <div>
      <div className="container gallery-hero">
        <span className="eyebrow">{catInfo ? 'Templates' : `${counts.all} templates · new every week`}</span>
        <h1 className="display">{catInfo ? catInfo.name : category === 'favorites' ? 'Your favourites' : 'Start with motion that works'}</h1>
        <p>{catInfo ? catInfo.blurb : 'Every template is fully editable, resizes to any format, and can preview in your own brand before you open it.'}</p>
        <div className="cat-rail" role="toolbar" aria-label="Categories">
          {(['all', 'logo', 'carousel', ...CATEGORIES.filter((c) => !c.featured).map((c) => c.id), 'favorites'] as const).map((id) => {
            const Icon = CATEGORY_ICONS[id];
            const name = id === 'all' ? 'All' : id === 'favorites' ? 'Favourites' : CATEGORY_MAP[id].name;
            const count = id === 'favorites' ? favorites.length : counts[id] ?? 0;
            return (
              <button key={id} className="cat-tile" aria-pressed={category === id} onClick={() => navigate(id === 'all' ? '/templates' : `/templates/${id}`)}>
                <span className="ico">
                  <Icon />
                </span>
                {name}
                <span className="count">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="filter-bar">
        <div className="container">
          <label className="search">
            <Search />
            <span className="sr-only">Search templates</span>
            <input className="input" placeholder="Search templates: logo, sale, quote, stats…" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
          <div className="format-chips">
            {FORMAT_FILTERS.map((f) => (
              <button key={f} className="chip" aria-pressed={format === f} onClick={() => setFormat(f)}>
                {f === 'all' ? 'All sizes' : `${FORMATS[f].label} ${f === 'carousel' ? '' : FORMATS[f].ratio}`}
              </button>
            ))}
          </div>
          <div className="filter-spacer" />
          <select className="input" style={{ width: 'auto', height: 36 }} value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort">
            <option value="popular">Popular</option>
            <option value="new">Newest</option>
            <option value="az">A–Z</option>
          </select>
          <button className="btn btn-icon btn-outline" title={autoplay ? 'Pause previews' : 'Play previews'} aria-label={autoplay ? 'Pause previews' : 'Play previews'} onClick={() => setAutoplay(!autoplay)}>
            {autoplay ? <Pause /> : <Play />}
          </button>
          <div className="brand-toggle">
            <Palette size={16} color="var(--blue)" />
            <button style={{ fontWeight: 600 }} onClick={() => setBrandOpen(true)}>
              My brand
            </button>
            <span className="brand-swatches" aria-hidden="true">
              {[brand.primary, brand.secondary, brand.dark].map((c, i) => (
                <i key={i} style={{ background: c }} />
              ))}
            </span>
            <button className="toggle" role="switch" aria-checked={brand.enabled} aria-label="Preview in my brand" onClick={() => setBrand({ enabled: !brand.enabled })} />
          </div>
        </div>
      </div>

      <div className="container">
        {format !== 'all' && format !== 'carousel' && (
          <p className="muted" style={{ margin: '-4px 0 18px' }}>
            Showing every template that supports {FORMATS[format].label} {FORMATS[format].ratio}, already resized for you.
          </p>
        )}
        {showFeatured ? (
          <>
            <Featured cat="logo" list={sortList(allTemplates().filter((t) => t.category === 'logo' && t.variantIndex < 2), 'popular')} />
            <Featured cat="carousel" list={sortList(allTemplates().filter((t) => t.category === 'carousel'), 'popular')} />
            <div className="section-head">
              <div>
                <h2>All templates</h2>
                <p>{list.length} ready-to-edit animations</p>
              </div>
            </div>
            <Grid list={list} />
          </>
        ) : (
          <Grid list={list} format={format === 'all' ? undefined : format} />
        )}
      </div>
    </div>
  );
}

import { useMemo } from 'react';
import {
  ArrowRight,
  Check,
  Minus,
  Palette,
  Scaling,
  Download,
  Type,
  SlidersHorizontal,
  Shield,
  Sparkles,
  Zap,
  Globe,
  Hexagon,
  GalleryHorizontalEnd,
} from 'lucide-react';
import { allTemplates, type Template } from '../templates/registry';
import { FORMATS } from '../templates/catalog';
import { TemplateCard } from '../ui/TemplateCard';
import { href } from '../lib/router';
import { useUI } from '../lib/store';

function pickWall(): Template[] {
  const all = allTemplates();
  const byCat = new Map<string, Template[]>();
  for (const t of all) if (t.variantIndex === 0 || t.variantIndex === 1) byCat.set(t.category, [...(byCat.get(t.category) ?? []), t]);
  const out: Template[] = [];
  for (let round = 0; out.length < 16 && round < 4; round++) {
    for (const [, list] of byCat) {
      const t = list[round];
      if (t && t.params.format !== 'carousel' && out.length < 16) out.push(t);
    }
  }
  return out;
}

function WallItem({ t }: { t: Template }) {
  const f = FORMATS[t.params.format];
  const h = 300;
  return (
    <div className="wall-item" style={{ width: Math.round((h * f.w) / f.h), height: h }}>
      <TemplateCard t={t} alwaysPlay compact />
    </div>
  );
}

const FEATURES = [
  {
    icon: Palette,
    title: 'Brand kit, applied everywhere',
    body: 'Upload your logo, pick your colours and fonts once. Flip a switch and the entire gallery re-renders in your brand, so you choose templates that already look like you.',
    cls: 'wide blue',
  },
  { icon: Scaling, title: 'Magic resize', body: 'Every template adapts to square, portrait, story and landscape with one click. The layout reflows, it doesn’t just crop.' },
  { icon: GalleryHorizontalEnd, title: 'Seamless carousels', body: 'Multi-slide posts where motion flows across the seams. Export each slide as its own video, ready for Instagram and LinkedIn.' },
  { icon: Download, title: 'Pro exports', body: 'MP4, WebM, GIF, PNG and PNG sequences, up to 4K at 60fps. Transparent backgrounds for overlays.' },
  { icon: Type, title: 'Kinetic typography', body: 'Per-letter, per-word and per-line animation with masks, blur, bounce and typewriter effects built in.' },
  { icon: SlidersHorizontal, title: 'A real timeline', body: 'Move, retime and restyle any layer. Drag clips on the timeline, scrub frame by frame, undo anything.' },
  { icon: Shield, title: 'Private by design', body: 'Rendering happens on your device. Your logo and drafts never leave your computer unless you share them.' },
];

const compareRows = (total: number): [string, boolean | string, boolean | string][] => [
  ['Learn it in minutes', true, false],
  ['Runs in the browser, nothing to install', true, false],
  [`${total}+ editable motion templates`, true, 'Buy separately'],
  ['Preview every template in your brand', true, false],
  ['One-click resize to any format', true, 'Manual'],
  ['Animated multi-slide carousels', true, 'Manual'],
  ['MP4 · WebM · GIF · PNG up to 4K/60fps', true, true],
];

const FAQ = [
  ['Do I need motion design experience?', 'No. Pick a template, change the words, colours and logo, and export. When you want more control, the timeline lets you move and retime any layer.'],
  ['Can I use my own logo and fonts?', 'Yes. Upload a PNG or SVG logo in the brand kit or straight into a template. Choose from 15 professionally paired font sets, with custom font upload on the roadmap.'],
  ['Which formats can I export?', 'MP4 (H.264), WebM (VP9, optionally transparent), GIF, single PNG frames and zipped PNG sequences, from 720p up to 4K at 24, 30 or 60fps.'],
  ['How do animated carousels work?', 'A carousel is one wide canvas split into slides. Motion can flow across the seams, and export gives you one video per slide in a ZIP, in the right order to upload.'],
  ['Can I use the exports commercially?', 'Yes. Everything you make is yours to use in ads, client work and social posts.'],
  ['Where are my projects saved?', 'Projects autosave in your browser. Cloud sync across devices and team workspaces are coming with Pro and Team plans.'],
];

export function HomePage() {
  const wall = useMemo(pickWall, []);
  const logos = useMemo(() => allTemplates().filter((t) => t.category === 'logo' && t.variantIndex === 0).slice(0, 3), []);
  const carousels = useMemo(() => allTemplates().filter((t) => t.category === 'carousel' && t.variantIndex === 0).slice(0, 2), []);
  const total = allTemplates().length;
  const setBrandOpen = useUI((s) => s.setBrandOpen);

  return (
    <div>
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-grid-lines" />
        <div className="container">
          <span className="eyebrow">
            <Sparkles size={15} /> Motion design for every brand
          </span>
          <h1 className="display">
            Make it move.
            <br />
            Make it <span className="accent">yours.</span>
          </h1>
          <p className="lead">
            Animate It turns your logo, ideas and posts into scroll-stopping motion. {total}+ pro templates, your brand applied in one click, and exports up to 4K, right in your browser.
          </p>
          <div className="hero-cta">
            <a className="btn btn-primary btn-lg" href={href('/templates')}>
              Browse {total}+ templates <ArrowRight />
            </a>
            <a className="btn btn-outline btn-lg" href={href('/templates/logo')}>
              <Hexagon /> Animate my logo
            </a>
          </div>
          <div className="hero-proof">
            <span>
              <Check /> Free to start
            </span>
            <span>
              <Zap /> No install, no plugins
            </span>
            <span>
              <Globe /> MP4 · GIF · WebM · PNG up to 4K
            </span>
          </div>
        </div>
        <div className="wall" aria-label="Template previews">
          <div className="wall-track">
            {[...wall, ...wall].map((t, i) => (
              <WallItem key={t.id + i} t={t} />
            ))}
          </div>
        </div>
      </section>

      <section className="band">
        <div className="container">
          <div className="showcase">
            <div className="showcase-card ink">
              <div>
                <span className="eyebrow" style={{ color: '#8fb0ff' }}>
                  <Hexagon size={15} /> Logo animations
                </span>
                <h3>Your logo, alive in seconds</h3>
                <p>Reveals, stings and intros made for brands. Upload your mark and watch every one of them play with it.</p>
              </div>
              <div className="showcase-previews">
                {logos.map((t) => (
                  <div key={t.id} style={{ aspectRatio: '1 / 1' }}>
                    <TemplateCard t={t} format="square" alwaysPlay compact />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <a className="btn btn-primary" href={href('/templates/logo')}>
                  Explore logo animations <ArrowRight />
                </a>
                <button className="btn btn-ghost" style={{ color: '#fff' }} onClick={() => setBrandOpen(true)}>
                  Upload my logo
                </button>
              </div>
            </div>
            <div className="showcase-card">
              <div>
                <span className="eyebrow">
                  <GalleryHorizontalEnd size={15} /> Animated carousels
                </span>
                <h3>Carousels that keep people swiping</h3>
                <p>Motion flows from one slide into the next. Export every slide as its own video, ready for Instagram and LinkedIn.</p>
              </div>
              <div style={{ display: 'grid', gap: 12 }}>
                {carousels.map((t) => (
                  <TemplateCard key={t.id} t={t} alwaysPlay compact />
                ))}
              </div>
              <div>
                <a className="btn btn-dark" href={href('/templates/carousel')}>
                  Explore carousels <ArrowRight />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="container">
          <div className="band-head">
            <span className="eyebrow">Why Animate It</span>
            <h2>Studio-grade motion without the studio</h2>
            <p>Everything you need to go from idea to a polished animation in minutes.</p>
          </div>
          <div className="feature-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className={`feature ${f.cls ?? ''}`}>
                <div className="ico">
                  <f.icon />
                </div>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="band">
        <div className="container">
          <div className="band-head">
            <span className="eyebrow">How it works</span>
            <h2>Three steps to motion</h2>
          </div>
          <div className="steps">
            <div className="step">
              <h3>Pick a template</h3>
              <p>Browse {total}+ animations across 15 categories, filter by size, and preview them in your brand.</p>
            </div>
            <div className="step">
              <h3>Make it yours</h3>
              <p>Edit the words, swap your logo and images, change colours and fonts, and fine-tune timing on the timeline.</p>
            </div>
            <div className="step">
              <h3>Export anywhere</h3>
              <p>Download MP4, GIF, WebM or PNG for every platform, or resize to a new format in one click.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="container" style={{ maxWidth: 900 }}>
          <div className="band-head">
            <span className="eyebrow">The difference</span>
            <h2>Built for speed, not for render queues</h2>
          </div>
          <table className="compare">
            <thead>
              <tr>
                <th></th>
                <th className="us">Animate It</th>
                <th>Traditional motion software</th>
              </tr>
            </thead>
            <tbody>
              {compareRows(total).map(([label, a, b]) => (
                <tr key={label}>
                  <td>{label}</td>
                  <td className="us">{a === true ? <Check className="yes" /> : a}</td>
                  <td>{b === true ? <Check className="yes" /> : b === false ? <Minus className="no" /> : <span className="muted">{b}</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="band" id="faq">
        <div className="container">
          <div className="band-head">
            <span className="eyebrow">FAQ</span>
            <h2>Questions, answered</h2>
          </div>
          <div className="faq">
            {FAQ.map(([q, a]) => (
              <details key={q}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <div className="container">
        <div className="cta-band">
          <div>
            <h2>Your next post deserves to move.</h2>
            <p>Start free. No credit card, no install.</p>
          </div>
          <a className="btn btn-lg btn-light" href={href('/templates')}>
            Start creating <ArrowRight />
          </a>
        </div>
      </div>
    </div>
  );
}

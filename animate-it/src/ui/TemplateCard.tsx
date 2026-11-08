import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Heart } from 'lucide-react';
import type { Template } from '../templates/registry';
import { FORMATS, type FormatId } from '../templates/catalog';
import { templateScene } from '../lib/scenes';
import { useBrand, useUI } from '../lib/store';
import { SceneCanvas } from './SceneCanvas';
import { href } from '../lib/router';

function useInView<T extends Element>(rootMargin = '200px') {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);
  return [ref, inView] as const;
}

interface Props {
  t: Template;
  format?: FormatId;
  /** Force autoplay regardless of the user setting (hero walls). */
  alwaysPlay?: boolean;
  compact?: boolean;
}

export const TemplateCard = memo(function TemplateCard({ t, format, alwaysPlay, compact }: Props) {
  const brand = useBrand((s) => s.brand);
  const autoplay = useUI((s) => s.autoplay);
  const fav = useUI((s) => s.favorites.includes(t.id));
  const toggleFavorite = useUI((s) => s.toggleFavorite);
  const [hover, setHover] = useState(false);
  const [ref, inView] = useInView<HTMLAnchorElement>();
  const scene = useMemo(() => (inView ? templateScene(t, brand, format) : null), [inView, t, brand, format]);
  const f = scene ? (scene.slides ? 'carousel' : null) : null;
  const fmt = format ?? t.params.format;
  const ratio = fmt === 'carousel' ? `${(t.recipe.slides ?? 5) * FORMATS.carousel.w} / ${FORMATS.carousel.h}` : `${FORMATS[fmt].w} / ${FORMATS[fmt].h}`;
  const playing = !!scene && inView && (hover || autoplay || !!alwaysPlay);

  return (
    <a
      ref={ref}
      className="tcard"
      href={href(`/template/${t.id}`)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label={`${t.name}, ${t.variantName}`}
    >
      <div className="tcard-media" style={{ aspectRatio: ratio }}>
        {scene && <SceneCanvas scene={scene} playing={playing} fps={hover ? 60 : 30} maxDpr={1.5} restartKey={hover} />}
        {f === 'carousel' && scene?.slides && (
          <div className="slide-seams">
            {Array.from({ length: scene.slides }, (_, i) => (
              <span key={i} />
            ))}
          </div>
        )}
        {!compact && (
          <div className="tcard-tags">
            {t.isNew && <span className="badge badge-new">New</span>}
            {fmt === 'carousel' && <span className="badge tcard-format">{t.recipe.slides} slides</span>}
          </div>
        )}
        <div className="tcard-overlay">
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <button
              className="tcard-fav"
              aria-pressed={fav}
              aria-label={fav ? 'Remove from favourites' : 'Save to favourites'}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFavorite(t.id);
              }}
            >
              <Heart fill={fav ? 'currentColor' : 'none'} />
            </button>
          </div>
          <div className="row">
            <span className="btn btn-sm btn-primary">Customize</span>
            <span className="badge tcard-format">{FORMATS[fmt].ratio}</span>
          </div>
        </div>
      </div>
      {!compact && (
        <div className="tcard-info">
          <span className="tcard-name">{t.name}</span>
          <span className="tcard-sub">{brand.enabled ? 'Your brand' : t.variantName}</span>
        </div>
      )}
    </a>
  );
});

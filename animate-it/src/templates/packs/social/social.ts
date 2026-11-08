/** Social posts: launch announcement, tip of the day, giveaway, hiring. */
import type { Layer } from '../../../engine/types';
import { type Recipe, k, rect, circle, ellipse, group, path, image, browser, radial, ta, alpha, shade, readableOn, ICONS } from '../../kit';
import { type TS, txt, wrap, fit, tw, chip, flow, avatar, confetti, glow, brandRow, icon, ICON, burstD, to, balance } from './util';

// ------------------------------------------------------------------ Launch Drop

const launchDrop: Recipe = {
  id: 'launch-drop',
  name: 'Launch Drop',
  category: 'social',
  tags: ['launch', 'announcement', 'product', 'feature', 'saas', 'release'],
  description: 'Feature launch post: the headline rises, your screenshot glides up in a browser frame and a "new" sticker pops on.',
  duration: 5.5,
  usesLogo: true,
  fields: [
    { key: 'brand', label: 'Brand name', default: 'Kitepath' },
    { key: 'eyebrow', label: 'Eyebrow', default: 'Introducing' },
    { key: 'headline', label: 'Headline', default: 'Smart Scheduling', multiline: true },
    { key: 'sub', label: 'Supporting line', default: 'Plan a whole month of posts in one click.', multiline: true },
    { key: 'cta', label: 'Call to action', default: 'Available today' },
    { key: 'badge', label: 'Sticker', default: 'New' },
  ],
  images: [{ key: 'shot', label: 'Feature screenshot', art: 'blobs' }],
  variants: [
    { name: 'Azure', palette: 'azure', fonts: 'grotesk', format: 'portrait', logo: 'orbit' },
    {
      name: 'Midnight',
      palette: 'midnight',
      fonts: 'sora',
      format: 'square',
      logo: 'prism',
      copy: { brand: 'Orbitly', eyebrow: 'Just shipped', headline: 'Dark mode is here', sub: 'Easier on the eyes. Sharper on every screen.', cta: 'Update now' },
    },
    {
      name: 'Cobalt',
      palette: 'cobalt',
      fonts: 'archivo',
      format: 'story',
      logo: 'bolt',
      copy: { brand: 'Snacklab', eyebrow: 'New drop', headline: 'Mango Chili Crunch', sub: 'Sweet heat in every bite. Small batch only.', cta: 'Shop the drop', badge: 'Hot' },
    },
    {
      name: 'Lilac',
      palette: 'lilac',
      fonts: 'outfit',
      format: 'landscape',
      logo: 'petal',
      copy: { brand: 'Notewise', eyebrow: 'Feature launch', headline: 'AI Meeting Summaries', sub: 'Turn any call into five clear bullet points.', cta: 'Try it free' },
    },
  ],
  build(x) {
    const { u, W, H, p } = x;
    const L = x.isLandscape;
    const centered = x.tall;
    const m = x.pick({ landscape: 9 * u, story: 8 * u, default: 7 * u });
    const colW = L ? 76 * u : W - m * 2;
    const dark = readableOn(p.bg) === '#ffffff';

    const hSt = fit(x, x.c.headline, { role: 'title', size: x.pick({ landscape: 10.5 * u, story: 13.5 * u, portrait: 12 * u, default: 10.5 * u }), lh: 1.0 }, colW, 2);
    const sSt = fit(x, x.c.sub, { role: 'body', size: x.pick({ landscape: 3.4 * u, story: 4.3 * u, portrait: 3.8 * u, default: 3.5 * u }) }, centered ? colW * 0.86 : colW, 2);
    const eSt: TS = { role: 'body', size: x.pick({ story: 3.3 * u, default: 2.9 * u }), weight: 700, uppercase: true, tracking: 0.12 };
    const cSt: TS = { role: 'body', size: x.pick({ story: 3.7 * u, default: 3.2 * u }), weight: 700 };
    const bSt: TS = { role: 'body', size: x.pick({ story: 4 * u, default: 3.5 * u }), weight: 700 };
    const logoS = x.pick({ story: 6.5 * u, default: 5.5 * u });

    const hBW = balance(x, x.c.headline, hSt, colW);
    const hW = wrap(x, x.c.headline, hSt, hBW);
    const sBW = balance(x, x.c.sub, sSt, centered ? colW * 0.86 : colW);
    const sW = wrap(x, x.c.sub, sSt, sBW);
    const eyeH = eSt.size * 2.5;
    const ctaH = cSt.size * 2.6;

    // Vertical flow.
    const gapBrand = x.pick({ story: 7 * u, landscape: 7 * u, default: 5 * u });
    const blockH = logoS + gapBrand + eyeH + 3.5 * u + hW.h + 2.6 * u + sW.h + (x.isSquare ? 0 : 4.5 * u + ctaH);
    const top = L ? (H - blockH) / 2 : x.pick({ story: 15 * u, default: m });
    const yEye = top + logoS + gapBrand;
    const yHead = yEye + eyeH + 3.5 * u;
    const ySub = yHead + hW.h + 2.6 * u;
    const yCta = ySub + sW.h + 4.5 * u;
    const ax = centered ? 0.5 : 0;
    const tx = centered ? W / 2 : m;
    const align = centered ? 'center' : 'left';

    // Feature card geometry.
    let cardX: number, cardY: number, cardW: number, cardH: number;
    if (L) {
      cardX = 97 * u;
      cardY = 16 * u;
      cardW = W - cardX + 12 * u;
      cardH = H - cardY + 10 * u;
    } else if (x.isSquare) {
      cardY = ySub + sW.h + 7 * u;
      cardX = 21 * u;
      cardW = W - cardX + 10 * u;
      cardH = H - cardY + 10 * u;
    } else {
      cardY = yCta + ctaH + x.pick({ story: 9 * u, default: 7 * u });
      cardW = W - m * 2 - x.pick({ story: 2 * u, default: 6 * u });
      cardX = (W - cardW) / 2;
      cardH = H - cardY + 10 * u;
    }
    const cardCx = cardX + Math.min(cardW, W - cardX) / 2;
    const stickerD = x.pick({ story: 21 * u, landscape: 19 * u, default: 17 * u });
    const stickerX = L ? cardX + 1 * u : x.isSquare ? W - 17 * u : cardX + cardW - 3 * u;
    const stickerY = cardY + (L ? 1 * u : x.isSquare ? 4 * u : 0.5 * u);

    const brand = brandRow(x, 'brand', x.c.brand, {
      x: centered ? W / 2 : m,
      y: top,
      ax: centered ? 0.5 : 0,
      ay: 0,
      logo: logoS,
      st: bSt,
      color: p.fg,
      logoColor: p.accent,
      g: { opacity: to(0, 1, 0.15, 0.6, 'outCubic') },
    });
    brand.layer.y = to(top - 3 * u, top, 0.15, 0.9, 'outExpo');

    const eyebrow = chip(x, 'eyebrow', x.c.eyebrow, {
      x: tx,
      y: yEye,
      ax,
      ay: 0,
      st: eSt,
      h: eyeH,
      fill: alpha(p.accent, dark ? 0.2 : 0.1),
      color: p.accent,
      icon: ICONS.sparkle,
      iconSW: 2,
      anim: ta.type(0.55, { stagger: 0.03 }),
      g: { sx: to(0, 1, 0.3, 0.8, 'outExpo'), opacity: to(0, 1, 0.3, 0.3, 'outCubic') },
    });

    const cta = chip(x, 'cta', x.c.cta, {
      x: x.isSquare ? W - m : tx,
      y: x.isSquare ? top + logoS / 2 : yCta,
      ax: x.isSquare ? 1 : ax,
      ay: x.isSquare ? 0.5 : 0,
      st: cSt,
      h: ctaH,
      fill: p.fg,
      color: p.bg,
      icon: ICONS.arrowRight,
      iconRight: true,
      g: { scale: to(0, 1, 1.5, 0.7, 'spring'), opacity: to(0, 1, 1.5, 0.2, 'outCubic') },
    });

    const rings: Layer[] = [0, 1, 2].map((i) =>
      ellipse(`ring-${i}`, {
        x: cardCx,
        y: cardY + Math.min(cardH, H - cardY) * 0.45,
        w: (60 + i * 32) * u,
        h: (60 + i * 32) * u,
        stroke: alpha(p.fg, 0.07),
        strokeWidth: 0.25 * u,
        scale: to(0.6, 1, 0.1 + i * 0.12, 1.6, 'outExpo'),
        opacity: to(0, 1, 0.1 + i * 0.12, 0.8, 'outCubic'),
      }),
    );

    const sparkles: Layer[] = [
      [cardX + (L ? 6 : 4) * u, cardY - 6 * u, 4.2 * u, 2.1],
      [Math.min(W - 6 * u, cardX + cardW * 0.62), cardY - 4.5 * u, 2.8 * u, 2.4],
      [L ? cardX - 4 * u : cardX - 2 * u, cardY + 16 * u, 2.6 * u, 2.7],
    ].map(([sx, sy, s, t0], i) =>
      path(`spark-${i}`, ICONS.sparkle, 24, 24, {
        x: sx,
        y: sy,
        w: s,
        h: s,
        fill: i === 1 ? p.accent2 : p.accent,
        scale: k([t0, 0], [t0 + 0.6, 1, 'outBack'], [t0 + 1.4, 0.75, 'inOutSine'], [t0 + 2.2, 1, 'inOutSine'], [t0 + 3, 0.8, 'inOutSine']),
        rotation: to(-90, 0, t0, 1.2, 'outCubic'),
      }),
    );

    const card = browser(
      'card',
      {
        x: cardX,
        y: k([0.75, cardY + 45 * u], [2.0, cardY, 'outExpo'], [3.6, cardY - 0.8 * u, 'inOutSine'], [5.5, cardY, 'inOutSine']),
        w: cardW,
        h: cardH,
        ax: 0,
        ay: 0,
        dark,
        rotation: to(L ? 6 : 4, 0, 0.75, 1.4, 'outExpo'),
        opacity: to(0, 1, 0.75, 0.3, 'outCubic'),
      },
      (cw, ch) => [image('shot', x.img[0], { x: cw / 2, y: ch / 2, w: cw, h: ch, scale: k([0.75, 1.25], [3.2, 1, 'outCubic']) })],
    );

    const stickerT: TS = { role: 'title', size: stickerD * 0.3 };

    // Floating UI callouts: a notification card and a toggle switching on.
    const nW = x.pick({ story: 40 * u, default: 34 * u });
    const nH = nW * 0.3;
    const nX = L ? cardX - 9 * u : cardX - x.pick({ square: 8 * u, default: 4 * u });
    const nY = L ? cardY + 52 * u : cardY + x.pick({ square: 16 * u, story: 22 * u, default: 18 * u });
    const notif = group(
      'notif',
      [
        rect('notif-bg', { x: 0, y: 0, ax: 0, ay: 0, w: nW, h: nH, radius: nH * 0.28, fill: p.surface, shadow: { color: alpha('#0A1633', 0.18), blur: 3 * u, y: 1.2 * u } }),
        circle('notif-dot', nH * 0.3, { x: nH * 0.5, y: nH / 2, fill: p.accent, scale: to(0, 1, 2.35, 0.5, 'outBack') }),
        icon('notif-check', ICONS.check, { x: nH * 0.5, y: nH / 2, s: nH * 0.36, color: p.onAccent, sw: 3, trimEnd: to(0, 1, 2.5, 0.4, 'outCubic') }),
        rect('notif-l1', { x: nH * 0.98, y: nH * 0.36, ax: 0, h: nH * 0.13, radius: nH * 0.065, fill: alpha(p.fg, 0.75), w: to(0, nW * 0.48, 2.4, 0.6, 'outExpo') }),
        rect('notif-l2', { x: nH * 0.98, y: nH * 0.64, ax: 0, h: nH * 0.11, radius: nH * 0.055, fill: alpha(p.fg, 0.25), w: to(0, nW * 0.34, 2.5, 0.6, 'outExpo') }),
      ],
      {
        x: k([2.15, nX - 4 * u], [2.9, nX, 'outExpo'], [4.2, nX, 'linear']),
        y: k([2.15, nY], [3.8, nY - 1.2 * u, 'inOutSine'], [5.5, nY, 'inOutSine']),
        w: nW,
        h: nH,
        ax: 0,
        ay: 0,
        opacity: to(0, 1, 2.15, 0.3, 'outCubic'),
        scale: to(0.7, 1, 2.15, 0.7, 'spring'),
      },
    );
    const tgH = x.pick({ story: 9 * u, default: 7.5 * u });
    const tgW = tgH * 1.8;
    const tgX = L ? W - 22 * u : x.isSquare ? W - 14 * u : cardX + cardW + 1 * u;
    const tgY = L ? cardY + 74 * u : cardY + x.pick({ square: 30 * u, story: 46 * u, default: 38 * u });
    const toggle = group(
      'toggle',
      [
        rect('toggle-track', {
          x: 0,
          y: 0,
          ax: 0,
          ay: 0,
          w: tgW,
          h: tgH,
          radius: tgH / 2,
          fill: k<string>([2.9, shade(p.muted, 0.35)], [3.3, p.accent, 'outCubic']),
          shadow: { color: alpha('#0A1633', 0.18), blur: 2.5 * u, y: 1 * u },
        }),
        circle('toggle-knob', tgH * 0.38, { x: k([2.9, tgH / 2], [3.3, tgW - tgH / 2, 'outBack']), y: tgH / 2, fill: p.onAccent }),
      ],
      { x: tgX, y: tgY, w: tgW, h: tgH, ax: 1, scale: to(0, 1, 2.45, 0.6, 'spring') },
    );
    const sticker = group(
      'sticker',
      [
        path('sticker-burst', burstD(14, 0.84), 100, 100, { x: stickerD / 2, y: stickerD / 2, w: stickerD, h: stickerD, fill: p.accent }),
        txt(x, 'sticker-t', x.c.badge, fit(x, x.c.badge, { ...stickerT, uppercase: true, tracking: 0.02 }, stickerD * 0.62, 1), {
          x: stickerD / 2,
          y: stickerD / 2,
          fill: p.onAccent,
        }),
      ],
      {
        x: stickerX,
        y: stickerY,
        w: stickerD,
        h: stickerD,
        scale: to(0, 1, 1.75, 0.8, 'spring'),
        rotation: k([1.75, -60], [2.6, 8, 'outBack'], [5.5, -6, 'inOutSine']),
      },
    );

    return {
      background: dark ? radial(0.5, 0.9, 1, p.bg2, p.bg) : x.grad(180, p.bg, p.bg2),
      layers: [
        glow('glow', { x: cardCx, y: cardY + 10 * u, r: 60 * u, color: p.accent, a: dark ? 0.35 : 0.22, scale: to(0.5, 1, 0.2, 1.8, 'outExpo') }),
        ...rings,
        brand.layer,
        eyebrow.layer,
        txt(x, 'headline', x.c.headline, hSt, {
          x: tx,
          y: yHead,
          w: hBW,
          ax,
          ay: 0,
          align,
          anim: ta.rise(0.65, { stagger: 0.09, dur: 0.9 }),
        }),
        txt(x, 'sub', x.c.sub, sSt, {
          x: tx,
          y: ySub,
          w: sBW,
          ax,
          ay: 0,
          align,
          fill: p.muted,
          anim: ta.blur(1.1, { stagger: 0.05 }),
        }),
        card,
        cta.layer,
        ...sparkles,
        notif,
        toggle,
        sticker,
      ],
    };
  },
};

// ------------------------------------------------------------------ Tip of the Day

const BULB_RAYS = 'M12 .8v1.6M4.2 3.9l1.1 1.1M19.8 3.9l-1.1 1.1M1.2 11h1.6M21.2 11h1.6';

const dailyTip: Recipe = {
  id: 'daily-tip',
  name: 'Tip of the Day',
  category: 'social',
  tags: ['tip', 'educational', 'advice', 'carousel', 'creator', 'how-to'],
  description: 'A note card with a lighting-up bulb, a numbered tip and a save prompt.',
  duration: 5,
  fields: [
    { key: 'label', label: 'Label', default: 'Tip of the day' },
    { key: 'num', label: 'Tip number', default: '12' },
    { key: 'headline', label: 'Tip', default: 'Batch your content on Mondays', multiline: true },
    { key: 'body', label: 'Explanation', default: 'Block two hours, write a week of posts and schedule them in one go.', multiline: true },
    { key: 'handle', label: 'Handle', default: '@kitepath' },
    { key: 'save', label: 'Save prompt', default: 'Save for later' },
  ],
  variants: [
    { name: 'Mint', palette: 'mint', fonts: 'manrope', format: 'square' },
    {
      name: 'Graphite',
      palette: 'graphite',
      fonts: 'space',
      format: 'portrait',
      copy: { label: 'Writing tip', num: '07', headline: 'Write the hook last', body: 'Draft the whole post first, then pick the one line that makes people stop scrolling.', handle: '@wordsmithlab' },
    },
    {
      name: 'Peach',
      palette: 'peach',
      fonts: 'fraunces',
      format: 'story',
      copy: { label: 'Photo tip', num: '03', headline: 'Light from the side, not the front', body: 'Window light at 45° gives products depth and soft, natural shadows.', handle: '@studiofern' },
    },
    {
      name: 'Electric',
      palette: 'electric',
      fonts: 'unbounded',
      format: 'landscape',
      copy: { label: 'Dev tip', num: '21', headline: 'Name things for the reader', body: 'Code is read far more often than it is written. Optimise for the next person.', handle: '@byteforge' },
    },
  ],
  build(x) {
    const { u, W, p } = x;
    const L = x.isLandscape;
    const cardW = L ? 128 * u : W - x.pick({ square: 12 * u, default: 14 * u });
    const cardX = (W - cardW) / 2;
    const cardTop = x.pick({ square: 6 * u, portrait: 8 * u, story: 17 * u, landscape: 8 * u, default: 7 * u });
    const cardBot = x.pick({ square: 94 * u, portrait: 117 * u, story: 152 * u, landscape: 92 * u, default: 93 * u });
    const pad = x.pick({ square: 7 * u, landscape: 8 * u, default: 8 * u });
    const inner = cardW - pad * 2;
    const tile = x.pick({ story: 15 * u, default: 13 * u });
    const footH = x.pick({ story: 5 * u, default: 4.4 * u });

    // Fit the middle block between header and footer.
    const avail = cardBot - cardTop - pad * 2 - tile - footH - x.pick({ story: 18 * u, default: 14 * u });
    let hSt: TS = { role: 'title', size: x.pick({ square: 10 * u, portrait: 11.5 * u, story: 13 * u, landscape: 10.5 * u, default: 10 * u }), lh: 1.04 };
    let bSt: TS = { role: 'body', size: x.pick({ square: 3.8 * u, portrait: 4.2 * u, story: 4.7 * u, landscape: 3.8 * u, default: 3.8 * u }) };
    const bodyW = Math.min(inner, x.pick({ landscape: 96 * u, default: inner }));
    let hW = wrap(x, x.c.headline, hSt, inner);
    let bW = wrap(x, x.c.body, bSt, bodyW);
    const midGap = 4 * u + 1 * u + 4.5 * u;
    for (let i = 0; i < 12 && hW.h + midGap + bW.h > avail; i++) {
      hSt = { ...hSt, size: hSt.size * 0.94 };
      bSt = { ...bSt, size: bSt.size * 0.96 };
      hW = wrap(x, x.c.headline, hSt, inner);
      bW = wrap(x, x.c.body, bSt, bodyW);
    }
    const midH = hW.h + midGap + bW.h;
    const hBW = balance(x, x.c.headline, hSt, inner);
    const contentH = tile + midH + footH + x.pick({ story: 18 * u, default: 14 * u }) + pad * 2;
    const cardH = x.pick({ square: cardBot - cardTop, landscape: cardBot - cardTop, default: Math.min(cardBot - cardTop, Math.max(contentH + 6 * u, (cardBot - cardTop) * 0.86)) });
    const cTop = x.pick({ square: cardTop, landscape: cardTop, default: cardTop + (cardBot - cardTop - cardH) / 2 });
    const ix = cardX + pad;
    const headerY = cTop + pad;
    const footY = cTop + cardH - pad - footH / 2;
    const midTop = headerY + tile + (footY - footH / 2 - (headerY + tile) - midH) / 2;
    const yBar = midTop + hW.h + 4 * u;
    const yBody = yBar + 1 * u + 4.5 * u;

    const labelSt: TS = { role: 'body', size: x.pick({ story: 3.3 * u, default: 2.9 * u }), weight: 700, uppercase: true, tracking: 0.14 };
    const numSt: TS = { role: 'title', size: x.pick({ story: 6.6 * u, default: 5.8 * u }) };
    const handleSt: TS = { role: 'body', size: x.pick({ story: 3.7 * u, default: 3.3 * u }), weight: 700 };
    const saveSt: TS = { role: 'body', size: x.pick({ story: 3.7 * u, default: 3.3 * u }), weight: 500 };
    // Dot texture in the card's top-right corner.
    const dots: Layer[] = [];
    const dg = x.pick({ story: 4.2 * u, default: 3.6 * u });
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 5; c++)
        dots.push(
          circle(`dot-${r}-${c}`, 0.45 * u, {
            x: cardX + cardW - pad - c * dg,
            y: cTop + pad + tile * 0.5 + (r - 1) * dg,
            fill: alpha(p.accent, 0.35),
            scale: to(0, 1, 0.6 + (r + c) * 0.05, 0.5, 'outBack'),
          }),
        );
    const saveW = tw(x, x.c.save, saveSt);
    const bmS = saveSt.size * 1.4;

    const enter = { opacity: to(0, 1, 0, 0.4, 'outCubic') };
    return {
      background: x.grad(160, p.bg, p.bg2),
      layers: [
        // Back card peeking out for a stacked-notes feel.
        rect('card-back', {
          x: W / 2,
          y: cTop + cardH / 2,
          w: cardW,
          h: cardH,
          radius: 4 * u,
          fill: alpha(p.accent, 0.22),
          rotation: to(0, x.pick({ landscape: -2.2, default: -3.5 }), 0.35, 1.2, 'outExpo'),
          ...enter,
        }),
        rect('card', {
          x: W / 2,
          y: to(cTop + cardH / 2 + 14 * u, cTop + cardH / 2, 0, 1.1, 'outExpo'),
          w: cardW,
          h: cardH,
          radius: 4 * u,
          fill: p.surface,
          stroke: alpha(p.fg, 0.08),
          strokeWidth: 0.2 * u,
          shadow: { color: alpha('#0A1633', 0.12), blur: 4 * u, y: 1.5 * u },
          ...enter,
        }),
        ...dots,
        group(
          'tile',
          [
            rect('tile-bg', { x: tile / 2, y: tile / 2, w: tile, h: tile, radius: tile * 0.28, fill: p.accent }),
            path('tile-glow', BULB_RAYS, 24, 24, {
              x: tile / 2,
              y: tile / 2,
              w: tile * 0.8,
              h: tile * 0.8,
              stroke: p.onAccent,
              strokeWidth: 1.8,
              trimEnd: to(0, 1, 1.25, 0.5, 'outCubic'),
              scale: to(0.6, 1, 1.25, 0.6, 'outBack'),
            }),
            icon('tile-bulb', ICON.bulb, {
              x: tile / 2,
              y: tile / 2 + tile * 0.04,
              s: tile * 0.56,
              color: p.onAccent,
              sw: 1.9,
              trimEnd: to(0, 1, 0.55, 0.8, 'inOutCubic'),
            }),
          ],
          { x: ix, y: headerY, w: tile, h: tile, ax: 0, ay: 0, scale: to(0, 1, 0.3, 0.7, 'spring'), rotation: to(-25, 0, 0.3, 0.8, 'outBack') },
        ),
        txt(x, 'label', x.c.label, labelSt, {
          x: ix + tile + 3.6 * u,
          y: headerY + tile * 0.3,
          ax: 0,
          align: 'left',
          fill: p.accent,
          anim: ta.slide(0.5, { by: 'char', stagger: 0.02, from: { x: -0.4, opacity: 0 } }),
        }),
        txt(x, 'num', `No. ${x.c.num}`, numSt, {
          x: ix + tile + 3.6 * u,
          y: headerY + tile * 0.72,
          ax: 0,
          align: 'left',
          anim: ta.rise(0.65, { by: 'char', stagger: 0.05 }),
        }),
        txt(x, 'headline', x.c.headline, hSt, {
          x: ix,
          y: midTop,
          w: hBW,
          ax: 0,
          ay: 0,
          align: 'left',
          anim: ta.rise(0.85, { stagger: 0.07 }),
        }),
        rect('bar', { x: ix, y: yBar, ax: 0, ay: 0, h: 1 * u, radius: 0.5 * u, fill: p.accent, w: to(0, 16 * u, 1.45, 0.9, 'outExpo') }),
        txt(x, 'body', x.c.body, bSt, {
          x: ix,
          y: yBody,
          w: bodyW,
          ax: 0,
          ay: 0,
          align: 'left',
          fill: p.muted,
          anim: ta.blur(1.6, { stagger: 0.03 }),
        }),
        rect('rule', { x: ix, y: footY - footH / 2 - 3.2 * u, ax: 0, h: Math.max(1, 0.18 * u), fill: alpha(p.fg, 0.12), w: to(0, inner, 1.9, 1, 'outExpo') }),
        txt(x, 'handle', x.c.handle, handleSt, { x: ix, y: footY, ax: 0, align: 'left', anim: ta.chars(2.1, { stagger: 0.02 }) }),
        txt(x, 'save', x.c.save, saveSt, { x: ix + inner, y: footY, ax: 1, align: 'left', fill: p.muted, opacity: to(0, 1, 2.3, 0.6, 'outCubic') }),
        icon('save-icon', ICONS.bookmark, {
          x: ix + inner - saveW - bmS * 0.85,
          y: footY,
          s: bmS,
          color: p.accent,
          sw: 2,
          trimEnd: to(0, 1, 2.3, 0.7, 'inOutCubic'),
        }),
      ],
    };
  },
};

// ------------------------------------------------------------------ Giveaway

const giveaway: Recipe = {
  id: 'giveaway-burst',
  name: 'Giveaway Burst',
  category: 'social',
  tags: ['giveaway', 'contest', 'win', 'confetti', 'prize', 'engagement'],
  description: 'Confetti rains down on a spinning prize badge while three entry steps slide in.',
  duration: 6,
  fields: [
    { key: 'title', label: 'Title', default: 'Giveaway' },
    { key: 'prize', label: 'Prize', default: 'Win a creator kit worth $250', multiline: true },
    { key: 'handle', label: 'Handle', default: '@kitepath' },
    { key: 'step1', label: 'Step 1 (shown before your handle)', default: 'Follow' },
    { key: 'step2', label: 'Step 2', default: 'Like this post' },
    { key: 'step3', label: 'Step 3', default: 'Tag two friends' },
    { key: 'ends', label: 'Deadline', default: 'Ends Friday · 8 PM' },
  ],
  images: [{ key: 'prize', label: 'Prize photo', art: 'product' }],
  variants: [
    { name: 'Electric', palette: 'electric', fonts: 'archivo', format: 'square' },
    {
      name: 'Blush',
      palette: 'blush',
      fonts: 'poppins',
      format: 'portrait',
      copy: { prize: 'Win our full skincare ritual set', handle: '@glowhaus', step1: 'Follow', step2: 'Like this post', step3: 'Tag a friend who needs it', ends: 'Ends Sunday at midnight' },
    },
    {
      name: 'Cyber',
      palette: 'cyber',
      fonts: 'unbounded',
      format: 'story',
      copy: { title: 'Win it', prize: 'A custom desk setup worth $900', handle: '@pixelpit', step1: 'Follow', step2: 'Share to your story', step3: 'Comment your dream game', ends: 'Winner drawn Dec 1' },
    },
    {
      name: 'Sunset',
      palette: 'sunset',
      fonts: 'syne',
      format: 'landscape',
      copy: { prize: 'Two weekend passes to Solstice Fest', handle: '@solsticefest', step1: 'Follow', step2: 'Like and save this post', step3: 'Tag who you’re bringing', ends: 'Closes June 30' },
    },
  ],
  build(x) {
    const { u, W, H, p } = x;
    const L = x.isLandscape;
    const S = x.isSquare;
    const P = x.isPortrait;
    const split = L || S;
    const m = x.pick({ landscape: 9 * u, default: 7 * u });

    // Column geometry
    const colX = L ? 92 * u : S ? 50 * u : m;
    const colW = split ? W - colX - m : W - m * 2;
    const titleW = L ? colW : W - m * 2;
    const tSt = fit(x, x.c.title, { role: 'title', size: x.pick({ landscape: 15 * u, story: 19 * u, portrait: 16 * u, square: 14 * u, default: 15 * u }), uppercase: true, lh: 1 }, titleW, 1);
    const tW = wrap(x, x.c.title, tSt, titleW);
    const prizeW = L ? colW : W - m * 2.5;
    const pSt = fit(x, x.c.prize, { role: 'body', size: x.pick({ landscape: 3.8 * u, story: 4.7 * u, portrait: 4.1 * u, default: 3.8 * u }), weight: 600 }, prizeW, 2);
    const pBW = balance(x, x.c.prize, pSt, prizeW);
    const pW = wrap(x, x.c.prize, pSt, pBW);
    const sSt: TS = { role: 'body', size: x.pick({ landscape: 3.5 * u, story: 4.5 * u, portrait: 3.5 * u, default: 3.3 * u }), weight: 600 };
    const badge = sSt.size * 2.1;
    const stepGap = x.pick({ story: 3 * u, portrait: 3 * u, default: 2.2 * u });
    // Portrait lays the three steps out as columns; everything else as a list.
    const colStepW = (W - m * 2 - stepGap * 2) / 3;
    const stepTextW = P ? colStepW : (split ? colW : W - m * 4) - badge - 2.6 * u;
    const step1 = [x.c.step1, x.c.handle].filter((v) => v.trim()).join(' ');
    const steps = [step1, x.c.step2, x.c.step3].map((s) => wrap(x, s, sSt, stepTextW));
    const rowH = P ? steps.map(() => badge + 2 * u + Math.max(...steps.map((s) => s.h))) : steps.map((s) => Math.max(badge, s.h));
    const stepsH = P ? rowH[0] : rowH.reduce((a, b) => a + b, 0) + stepGap * 2;
    const stepsW = P ? W - m * 2 : badge + 2.6 * u + Math.max(...steps.map((s) => s.w));
    const eSt: TS = { role: 'body', size: x.pick({ story: 3.6 * u, default: 3 * u }), weight: 700 };
    const eH = eSt.size * 2.5;

    // Prize disc
    let d = x.pick({ landscape: 50 * u, square: 35 * u, default: 40 * u });
    let discX: number, discY: number, titleY: number, prizeY: number, stepsX: number, stepsY: number, endsX: number, endsY: number;
    const tAx = L ? 0 : 0.5;
    const tX = L ? colX : W / 2;
    if (L) {
      const block = tW.h + 3 * u + pW.h + 6 * u + stepsH + 6 * u + eH;
      titleY = (H - block) / 2;
      prizeY = titleY + tW.h + 3 * u;
      stepsY = prizeY + pW.h + 6 * u;
      stepsX = colX;
      endsY = stepsY + stepsH + 6 * u;
      endsX = colX;
      discX = 46 * u;
      discY = H / 2;
    } else if (split) {
      titleY = 7 * u;
      prizeY = titleY + tW.h + 2.4 * u;
      const below = prizeY + pW.h + 2 * u;
      discX = colX / 2 + 1 * u;
      discY = below + (H - below) / 2;
      const blk = stepsH + 5 * u + eH;
      stepsY = discY - blk / 2;
      stepsX = colX;
      endsY = stepsY + stepsH + 5 * u;
      endsX = colX;
    } else {
      // Portrait / story: stack, sizing the disc to the room that is left.
      const top = x.pick({ story: 16 * u, default: 6.5 * u });
      const bottom = x.pick({ story: H - 14 * u, default: H - 6 * u });
      const gaps = x.pick({ story: [2.6 * u, 7 * u, 7 * u, 6 * u], default: [2.2 * u, 4 * u, 4 * u, 4.5 * u] });
      const fixed = tW.h + pW.h + stepsH + eH + gaps.reduce((a, b) => a + b, 0);
      d = Math.max(28 * u, Math.min(x.pick({ story: 56 * u, default: 44 * u }), (bottom - top - fixed) / 1.42));
      const spare = Math.max(0, bottom - top - fixed - d * 1.42) / 4;
      titleY = top + spare;
      prizeY = titleY + tW.h + gaps[0];
      discY = prizeY + pW.h + gaps[1] + spare + d * 0.71;
      discX = W / 2;
      stepsY = discY + d * 0.71 + gaps[2] + spare;
      stepsX = (W - stepsW) / 2;
      endsY = stepsY + stepsH + gaps[3];
      endsX = W / 2;
    }

    const burstD2 = d * 1.42;
    const tLeft = L ? colX : W / 2 - tW.w / 2;
    const pLeft = L ? colX : W / 2 - pW.w / 2;
    const avoid: [number, number, number, number][] = [
      [tLeft, titleY, tLeft + tW.w, titleY + tW.h],
      [pLeft, prizeY, pLeft + pW.w, prizeY + pW.h],
      [stepsX, stepsY, stepsX + stepsW, stepsY + stepsH],
      [endsX - (split ? 0 : 30 * u), endsY, endsX + 40 * u, endsY + eH],
      [discX - d / 2, discY - d / 2, discX + d / 2, discY + d / 2],
    ];
    const conf = confetti(x, 'conf', {
      n: x.pick({ story: 40, landscape: 38, default: 32 }),
      t0: 0.15,
      colors: [p.accent, p.accent2, shade(p.accent, 0.45), alpha(p.fg, 0.85)],
      x0: 2 * u,
      x1: W - 2 * u,
      y0: 2 * u,
      y1: H - 2 * u,
      s: 1.5 * u,
      dur: 2.6,
      avoid,
    });

    const stepLayers: Layer[] = [];
    let yy = stepsY;
    steps.forEach((s, i) => {
      const rh = rowH[i];
      const t0 = 1.6 + i * 0.18;
      const gx = P ? stepsX + i * (colStepW + stepGap) : stepsX;
      const gw = P ? colStepW : stepsW;
      stepLayers.push(
        group(
          `step-${i}`,
          [
            circle(`step-${i}-dot`, badge / 2, { x: P ? gw / 2 : badge / 2, y: P ? badge / 2 : rh / 2, fill: p.accent }),
            txt(x, `step-${i}-n`, String(i + 1), { role: 'body', size: badge * 0.5, weight: 800 }, { x: P ? gw / 2 : badge / 2, y: P ? badge / 2 : rh / 2, fill: p.onAccent }),
            P
              ? txt(x, `step-${i}-t`, s.lines.join('\n'), sSt, { x: gw / 2, y: badge + 2 * u, ay: 0, align: 'center', fill: p.fg })
              : txt(x, `step-${i}-t`, s.lines.join('\n'), sSt, { x: badge + 2.6 * u, y: rh / 2, ax: 0, align: 'left', fill: p.fg }),
          ],
          {
            x: P ? gx : to(stepsX - 6 * u, stepsX, t0, 0.8, 'outExpo'),
            y: P ? to(yy + 4 * u, yy, t0, 0.8, 'outExpo') : yy,
            w: gw,
            h: rh,
            ax: 0,
            ay: 0,
            opacity: to(0, 1, t0, 0.4, 'outCubic'),
          },
        ),
      );
      if (!P) yy += rh + stepGap;
    });

    const ends = chip(x, 'ends', x.c.ends, {
      x: endsX,
      y: endsY,
      ax: split ? 0 : 0.5,
      ay: 0,
      st: eSt,
      h: eH,
      stroke: alpha(p.fg, 0.35),
      strokeWidth: 0.25 * u,
      color: p.fg,
      icon: ICONS.clock,
      g: { scale: to(0, 1, 2.3, 0.7, 'spring'), opacity: to(0, 1, 2.3, 0.2) },
    });

    return {
      background: radial(0.5, 0.45, 1, p.bg2, p.bg),
      layers: [
        ...conf,
        path('burst', burstD(22, 0.86), 100, 100, {
          x: discX,
          y: discY,
          w: burstD2,
          h: burstD2,
          fill: p.accent,
          scale: to(0, 1, 0.5, 1, 'outBack'),
          rotation: k([0.5, -40], [6, 50, 'linear']),
        }),
        circle('burst-ring', d * 0.6, { x: discX, y: discY, stroke: alpha(p.onAccent, 0.5), strokeWidth: 0.3 * u, scale: to(0, 1, 0.7, 1, 'outExpo') }),
        avatar('prize', x.img[0], {
          x: discX,
          y: discY,
          d,
          ring: p.surface,
          ringW: d * 0.035,
          gap: 0,
          imgScale: to(1.3, 1, 0.8, 2, 'outCubic'),
          g: { scale: to(0, 1, 0.75, 0.9, 'spring') },
        }).layer,
        group(
          'gift',
          [
            circle('gift-bg', d * 0.14, { x: d * 0.14, y: d * 0.14, fill: p.fg }),
            icon('gift-i', ICONS.gift, { x: d * 0.14, y: d * 0.14, s: d * 0.15, color: p.bg, sw: 2 }),
          ],
          {
            x: discX + d * 0.36,
            y: discY - d * 0.36,
            w: d * 0.28,
            h: d * 0.28,
            scale: to(0, 1, 1.3, 0.7, 'spring'),
            rotation: k([1.3, -30], [2, 0, 'outBack'], [6, 10, 'inOutSine']),
          },
        ),
        txt(x, 'title-shadow', x.c.title, tSt, {
          x: tX + tW.size * 0.045,
          y: titleY + tW.size * 0.05,
          ax: tAx,
          ay: 0,
          align: L ? 'left' : 'center',
          fill: p.accent,
          anim: ta.pop(0.12, { stagger: 0.05 }),
        }),
        txt(x, 'title', x.c.title, tSt, {
          x: tX,
          y: titleY,
          ax: tAx,
          ay: 0,
          align: L ? 'left' : 'center',
          anim: ta.pop(0.1, { stagger: 0.05 }),
        }),
        txt(x, 'prize-t', x.c.prize, pSt, {
          x: tX,
          y: prizeY,
          w: pBW,
          ax: tAx,
          ay: 0,
          align: L ? 'left' : 'center',
          anim: ta.rise(0.8, { stagger: 0.05 }),
        }),
        ...stepLayers,
        ends.layer,
      ],
    };
  },
};

// ------------------------------------------------------------------ We're Hiring

const SWOOSH = 'M2 14C30 6 70 3 98 8';

const hiring: Recipe = {
  id: 'were-hiring',
  name: 'We’re Hiring',
  category: 'social',
  tags: ['hiring', 'jobs', 'careers', 'recruiting', 'team', 'linkedin'],
  description: 'Bold hiring post: the headline flips in, a brush stroke underlines it and open roles pop in as chips.',
  duration: 5.5,
  usesLogo: true,
  fields: [
    { key: 'brand', label: 'Company', default: 'Kitepath' },
    { key: 'title', label: 'Headline', default: 'We’re hiring' },
    { key: 'sub', label: 'Supporting line', default: 'Join a small team building tools creators love.', multiline: true },
    { key: 'role1', label: 'Role 1', default: 'Product Designer' },
    { key: 'role2', label: 'Role 2', default: 'Frontend Engineer' },
    { key: 'role3', label: 'Role 3', default: 'Growth Marketer' },
    { key: 'role4', label: 'Role 4', default: 'Customer Success' },
    { key: 'cta', label: 'Apply link', default: 'kitepath.com/careers' },
  ],
  variants: [
    { name: 'Azure', palette: 'azure', fonts: 'grotesk', format: 'portrait', logo: 'orbit' },
    {
      name: 'Noir',
      palette: 'noir',
      fonts: 'space',
      format: 'square',
      logo: 'knot',
      copy: { brand: 'Byteforge', title: 'Now hiring', sub: 'Remote-first. Async by default. Shipping weekly.', role1: 'Backend Engineer', role2: 'DevOps Lead', role3: 'Data Scientist', role4: 'QA Engineer', cta: 'byteforge.dev/jobs' },
    },
    {
      name: 'Sand',
      palette: 'sand',
      fonts: 'dmserif',
      format: 'landscape',
      logo: 'arc',
      copy: { brand: 'Hearth & Co', title: 'Join our kitchen', sub: 'Seasonal menus, fair hours and a team that eats together.', role1: 'Sous Chef', role2: 'Pastry Cook', role3: 'Server', role4: 'Host', cta: 'hearthandco.com/jobs' },
    },
    {
      name: 'Ocean',
      palette: 'ocean',
      fonts: 'sora',
      format: 'story',
      logo: 'wave',
      copy: { brand: 'Tidewater', title: 'We’re hiring', sub: 'Help us map and protect 10,000 km of coastline.', role1: 'Marine Biologist', role2: 'Field Technician', role3: 'GIS Analyst', role4: 'Grant Writer', cta: 'tidewater.org/careers' },
    },
  ],
  build(x) {
    const { u, W, H, p } = x;
    const L = x.isLandscape;
    const m = x.pick({ landscape: 9 * u, default: 7 * u });
    const colW = L ? 86 * u : W - m * 2;
    const dark = readableOn(p.bg) === '#ffffff';
    let tSt = fit(x, x.c.title, { role: 'title', size: x.pick({ landscape: 13 * u, story: 17 * u, portrait: 15.5 * u, square: 13.5 * u, default: 14 * u }), lh: 1 }, colW, 2);
    let tBW = balance(x, x.c.title, tSt, colW);
    let tW = wrap(x, x.c.title, tSt, tBW);
    const sSt = fit(x, x.c.sub, { role: 'body', size: x.pick({ landscape: 3.4 * u, story: 4.4 * u, portrait: 3.9 * u, default: 3.5 * u }) }, colW * (L ? 1 : 0.84), 3);
    const sBW = balance(x, x.c.sub, sSt, colW * (L ? 1 : 0.84));
    const sW = wrap(x, x.c.sub, sSt, sBW);
    let rSt: TS = { role: 'body', size: x.pick({ landscape: 3.8 * u, story: 4.5 * u, portrait: 4 * u, default: 3.6 * u }), weight: 600 };
    const cSt: TS = { role: 'body', size: x.pick({ story: 3.9 * u, default: 3.3 * u }), weight: 700 };
    const cH = cSt.size * 2.7;
    const bSt: TS = { role: 'body', size: x.pick({ story: 4 * u, default: 3.5 * u }), weight: 700 };
    const logoS = x.pick({ story: 6.5 * u, default: 5.5 * u });

    const roles = [x.c.role1, x.c.role2, x.c.role3, x.c.role4].filter((r) => r.trim().length > 0);
    const gapR = x.pick({ story: 2.4 * u, default: 2 * u });
    const rowsMaxW = L ? 64 * u : colW;
    const layoutRoles = () => {
      const rH0 = rSt.size * 2.5;
      const widths = roles.map((r) => tw(x, r, rSt) + rSt.size * 0.55 + rSt.size * 0.55 + rH0 * 0.9);
      const f = x.isSquare ? flow(widths, rowsMaxW, gapR) : { rows: roles.map((_, i) => [i]), rowW: widths };
      return { rH: rH0, roleW: widths, fl: f, rowsH: f.rows.length * rH0 + (f.rows.length - 1) * gapR };
    };
    let rl = layoutRoles();

    // Vertical layout
    const gapSub = 7 * u;
    const gapChips = x.pick({ story: 9 * u, default: 7 * u });
    let top: number, yTitle: number;
    let ctaY: number;
    if (L) {
      const leftBlock = logoS + 7 * u + tW.h + gapSub + sW.h + 7 * u + cH;
      top = (H - leftBlock) / 2;
      yTitle = top + logoS + 7 * u;
      ctaY = yTitle + tW.h + gapSub + sW.h + 7 * u;
    } else {
      top = x.pick({ story: 17 * u, default: m });
      ctaY = x.pick({ story: H - 24 * u, default: H - m - cH });
      const free = ctaY - (top + logoS) - 10 * u;
      // Long role names or a two-line headline: shrink chips, then the headline, until it all fits.
      for (let i = 0; i < 16 && tW.h + gapSub + sW.h + gapChips + rl.rowsH > free; i++) {
        if (rSt.size > 2.7 * u) {
          rSt = { ...rSt, size: rSt.size * 0.93 };
          rl = layoutRoles();
        } else {
          tSt = { ...tSt, size: tSt.size * 0.93 };
          tBW = balance(x, x.c.title, tSt, colW);
          tW = wrap(x, x.c.title, tSt, tBW);
        }
      }
      const block = tW.h + gapSub + sW.h + gapChips + rl.rowsH;
      yTitle = top + logoS + Math.max(5 * u, (free + 10 * u - block) / 2);
    }
    const { rH, roleW, fl, rowsH } = rl;
    const ySub = yTitle + tW.h + gapSub;
    const rowsTop = L ? (H - rowsH) / 2 : ySub + sW.h + gapChips;
    const tx = L ? m : W / 2;
    const tax = L ? 0 : 0.5;
    const align = L ? 'left' : 'center';

    // Brush stroke under the last line of the title.
    const lastW = tW.widths[tW.widths.length - 1];
    const lastLeft = L ? m : W / 2 - lastW / 2;
    const swY = yTitle + tW.h + 0.5 * u;

    const chips: Layer[] = [];
    fl.rows.forEach((row, ri) => {
      const rowLeft = L ? 108 * u : W / 2 - fl.rowW[ri] / 2;
      let cx0 = rowLeft;
      row.forEach((idx) => {
        const first = idx === 0;
        const c = chip(x, `role-${idx}`, roles[idx], {
          x: cx0,
          y: rowsTop + ri * (rH + gapR),
          ax: 0,
          ay: 0,
          st: rSt,
          h: rH,
          padX: rH * 0.45,
          fill: first ? p.accent : dark ? alpha(p.fg, 0.08) : p.surface,
          stroke: first ? undefined : alpha(p.fg, 0.14),
          strokeWidth: 0.2 * u,
          color: first ? p.onAccent : p.fg,
          dot: first ? p.onAccent : p.accent,
          g: {
            scale: to(0, 1, 1.55 + idx * 0.13, 0.7, 'spring'),
            rotation: to(idx % 2 ? 8 : -8, 0, 1.55 + idx * 0.13, 0.8, 'outBack'),
          },
        });
        chips.push(c.layer);
        cx0 += roleW[idx] + gapR;
      });
    });

    const cta = chip(x, 'cta', x.c.cta, {
      x: tx,
      y: ctaY,
      ax: tax,
      ay: 0,
      st: cSt,
      h: cH,
      fill: p.fg,
      color: p.bg,
      icon: ICONS.arrowRight,
      iconRight: true,
      g: { opacity: to(0, 1, 2.3, 0.4, 'outCubic'), y: to(ctaY + 3 * u, ctaY, 2.3, 0.8, 'outExpo') },
    });

    const decoA = x.pick({ landscape: 46 * u, default: 40 * u });
    return {
      background: p.bg,
      layers: [
        circle('deco-a', decoA, {
          x: W - x.pick({ landscape: 2 * u, default: 0 }),
          y: x.pick({ landscape: H, default: 2 * u }),
          fill: alpha(p.accent, dark ? 0.16 : 0.09),
          scale: to(0, 1, 0, 1.4, 'outExpo'),
        }),
        circle('deco-b', decoA * 0.62, {
          x: W - x.pick({ landscape: 2 * u, default: 0 }),
          y: x.pick({ landscape: H, default: 2 * u }),
          stroke: alpha(p.accent, 0.35),
          strokeWidth: 0.3 * u,
          scale: to(0, 1, 0.15, 1.4, 'outExpo'),
        }),
        rect('deco-c', {
          x: x.pick({ landscape: 4 * u, default: 1 * u }),
          y: x.pick({ landscape: 6 * u, story: H * 0.7, default: H * 0.78 }),
          w: 18 * u,
          h: 18 * u,
          radius: 4 * u,
          fill: alpha(p.accent2, dark ? 0.2 : 0.16),
          scale: to(0, 1, 0.2, 1.2, 'outExpo'),
          rotation: k([0.2, -30], [5.5, 25, 'outCubic']),
        }),
        brandRow(x, 'brand', x.c.brand, {
          x: tx,
          y: top,
          ax: tax,
          ay: 0,
          logo: logoS,
          st: bSt,
          color: p.fg,
          logoColor: p.accent,
          g: { opacity: to(0, 1, 0.15, 0.6, 'outCubic') },
        }).layer,
        path('swoosh', SWOOSH, 100, 16, {
          x: lastLeft - lastW * 0.02,
          y: swY,
          ax: 0,
          ay: 0,
          w: lastW * 1.04,
          h: Math.min(3.4 * u, Math.max(2 * u, lastW * 0.06)),
          stroke: p.accent2 === p.fg ? p.accent : p.accent2,
          strokeWidth: 3.6,
          trimEnd: to(0, 1, 1.15, 0.7, 'inOutCubic'),
        }),
        txt(x, 'title', x.c.title, tSt, {
          x: tx,
          y: yTitle,
          w: tBW,
          ax: tax,
          ay: 0,
          align,
          anim: ta.flip(0.35, { stagger: 0.035 }),
        }),
        txt(x, 'sub', x.c.sub, sSt, {
          x: tx,
          y: ySub,
          w: sBW,
          ax: tax,
          ay: 0,
          align,
          fill: p.muted,
          anim: ta.blur(1.2, { stagger: 0.04 }),
        }),
        ...chips,
        cta.layer,
      ],
    };
  },
};

export const socialRecipes: Recipe[] = [launchDrop, dailyTip, giveaway, hiring];

/** Ads & sales: flash sale, product spotlight, promo code, app install. */
import type { Layer } from '../../../engine/types';
import { type Recipe, k, rect, circle, group, path, image, phone, radial, linear, ta, alpha, shade, readableOn, ICONS } from '../../kit';
import { type TS, txt, wrap, fit, tw, chip, flow, stars, glow, brandRow, icon, ICON, CURSOR, to, pulse, splitNum, vivid, balance } from './util';

// ------------------------------------------------------------------ Flash Sale

const flashSale: Recipe = {
  id: 'flash-sale',
  name: 'Flash Sale',
  category: 'ads',
  tags: ['sale', 'discount', 'promo', 'ecommerce', 'percent off', 'countdown', 'marquee'],
  description: 'High-energy sale: scrolling marquee bands, a discount that counts up and a price that gets slashed.',
  duration: 5.5,
  fields: [
    { key: 'title', label: 'Marquee text', default: 'Flash sale' },
    { key: 'kicker', label: 'Kicker', default: 'Up to' },
    { key: 'percent', label: 'Discount %', default: '50' },
    { key: 'off', label: 'Discount word', default: 'Off' },
    { key: 'oldPrice', label: 'Old price', default: '$120' },
    { key: 'newPrice', label: 'New price', default: '$60' },
    { key: 'ends', label: 'Deadline', default: 'Ends tonight' },
    { key: 'cta', label: 'Button', default: 'Shop now' },
  ],
  variants: [
    { name: 'Electric', palette: 'electric', fonts: 'anton', format: 'portrait' },
    {
      name: 'Noir',
      palette: 'noir',
      fonts: 'archivo',
      format: 'story',
      copy: { title: 'Black week', percent: '70', oldPrice: '$249', newPrice: '$75', ends: 'Ends Sunday', cta: 'Grab the deal' },
    },
    {
      name: 'Sunset',
      palette: 'sunset',
      fonts: 'unbounded',
      format: 'square',
      copy: { title: 'Summer sale', percent: '30', oldPrice: '$90', newPrice: '$63', ends: '48 hours only', cta: 'Shop summer' },
    },
    {
      name: 'Cyber',
      palette: 'cyber',
      fonts: 'syne',
      format: 'landscape',
      copy: { title: 'Cyber deals', kicker: 'Save', percent: '40', oldPrice: '$199', newPrice: '$119', ends: 'Midnight drop', cta: 'Unlock deal' },
    },
  ],
  build(x) {
    const { u, W, H, p } = x;
    const tall = x.tall;
    const m = x.pick({ landscape: 10 * u, default: 8 * u });
    const hot = vivid(p);

    // Marquee bands
    const bandH = x.pick({ story: 11 * u, default: 9.5 * u });
    const mSt: TS = { role: 'title', size: bandH * 0.5, uppercase: true, tracking: 0.04 };
    const seg = `${x.c.title}  •  `;
    const segW = tw(x, seg, mSt);
    const bandW = Math.hypot(W, H) * 1.05;
    const reps = Math.max(2, Math.ceil((bandW + segW * 3) / Math.max(1, segW)) + 1);
    const bandsY = x.pick({ story: [21 * u, H - 22 * u], portrait: [10 * u, H - 10 * u], landscape: [6.5 * u, H - 6.5 * u], default: [8 * u, H - 8 * u] });
    const tilt = x.isLandscape ? 0.6 : 1;
    const band = (id: string, y: number, rot: number, dir: number, t0: number, fill: string, color: string) =>
      group(
        id,
        [
          rect(id + '-bg', { x: 0, y: 0, ax: 0, ay: 0, w: bandW, h: bandH, fill }),
          txt(x, id + '-t', seg.repeat(reps), mSt, {
            x: dir > 0 ? k([0, -segW * 2], [5.5, 0, 'linear']) : k([0, 0], [5.5, -segW * 2, 'linear']),
            y: bandH / 2,
            ax: 0,
            align: 'left',
            fill: color,
          }),
        ],
        {
          x: W / 2,
          y,
          w: bandW,
          h: bandH,
          clip: true,
          rotation: rot,
          sx: to(0, 1, t0, 0.9, 'outExpo'),
        },
      );

    // Content sizes
    const kSt: TS = { role: 'body', size: x.pick({ story: 4.4 * u, default: 3.6 * u }), weight: 800, uppercase: true, tracking: 0.3 };
    const numText = `${x.c.percent}%`;
    const pct = splitNum(x.c.percent);
    const maxNumW = W - m * 2;
    let nSt: TS = { role: 'title', size: x.pick({ story: 44 * u, portrait: 34 * u, landscape: 31 * u, default: 28 * u }), lh: 0.95 };
    let oSt: TS = { role: 'title', size: nSt.size * (tall ? 0.5 : 0.42), uppercase: true, lh: 0.95, tracking: 0.04 };
    const fitNum = () => {
      const nw = tw(x, numText, nSt);
      const ow = tw(x, x.c.off, oSt);
      return { nw, ow, total: tall ? Math.max(nw, ow) : nw + 2.5 * u + ow };
    };
    let nm = fitNum();
    if (nm.total > maxNumW) {
      const s = maxNumW / nm.total;
      nSt = { ...nSt, size: nSt.size * s };
      oSt = { ...oSt, size: oSt.size * s };
      nm = fitNum();
    }
    // Everything between the bands must fit: shrink the hero number if needed.
    {
      const regionH = bandsY[1] - bandsY[0] - bandH * 2 - 6 * u;
      const fixedH = x.pick({ story: 4.4 * u, default: 3.6 * u }) * 1.35 + x.pick({ story: 18 * u, default: 13 * u }) + x.pick({ story: 12 * u, default: 9 * u }) * x.f.displayScale * 1.05 + x.pick({ story: 3.9 * u, default: 3.2 * u }) * 2.7;
      const numH = (nSt.size + (tall ? oSt.size : 0)) * x.f.displayScale * 0.95;
      if (fixedH + numH > regionH) {
        const s = Math.max(0.6, (regionH - fixedH) / numH);
        nSt = { ...nSt, size: nSt.size * s };
        oSt = { ...oSt, size: oSt.size * s };
        nm = fitNum();
      }
    }
    const nH = wrap(x, numText, nSt).h;
    const oH = wrap(x, x.c.off, oSt).h;
    const npSt: TS = { role: 'title', size: x.pick({ story: 12 * u, default: 9 * u }) };
    const opSt: TS = { role: 'body', size: npSt.size * 0.5, weight: 600 };
    const npW = tw(x, x.c.newPrice, npSt);
    const opW = tw(x, x.c.oldPrice, opSt);
    const priceH = npSt.size * x.f.displayScale * 1.05;
    const cSt: TS = { role: 'body', size: x.pick({ story: 3.9 * u, default: 3.2 * u }), weight: 700 };
    const cH = cSt.size * 2.7;

    // Vertical stack between the bands
    const gK = x.pick({ story: 4 * u, default: 3 * u });
    const gP = x.pick({ story: 7 * u, default: 5 * u });
    const gC = x.pick({ story: 7 * u, default: 5 * u });
    const numBlockH = tall ? nH + oH : nH;
    const blockH = kSt.size * 1.35 + gK + numBlockH + gP + priceH + gC + cH;
    const regionTop = bandsY[0] + bandH;
    const regionBot = bandsY[1] - bandH;
    const top = regionTop + (regionBot - regionTop - blockH) / 2;
    const yKick = top;
    const yNum = yKick + kSt.size * 1.35 + gK;
    const yOff = yNum + nH;
    const yPrice = yNum + numBlockH + gP;
    const yChips = yPrice + priceH + gC;

    const numCx = W / 2;
    const numRight = tall ? numCx + nm.nw / 2 : numCx - nm.total / 2 + nm.nw;

    const priceGap = 3 * u;
    const priceLeft = W / 2 - (opW + priceGap + npW) / 2;
    const ends = chip(x, 'ends', x.c.ends, {
      x: 0,
      y: yChips,
      ax: 0,
      ay: 0,
      st: cSt,
      h: cH,
      stroke: alpha(p.fg, 0.4),
      strokeWidth: 0.25 * u,
      color: p.fg,
      icon: ICONS.clock,
      g: { scale: to(0, 1, 2.35, 0.6, 'spring'), opacity: to(0, 1, 2.35, 0.2) },
    });
    const cta = chip(x, 'cta', x.c.cta, {
      x: 0,
      y: yChips,
      ax: 0,
      ay: 0,
      st: cSt,
      h: cH,
      fill: hot,
      color: hot === p.accent ? p.onAccent : readableOn(hot, p.fg, p.bg),
      icon: ICONS.arrowRight,
      iconRight: true,
      g: { scale: k([2.5, 0], [3.1, 1, 'spring'], [4.2, 1], [4.45, 1.06, 'inOutSine'], [4.7, 1, 'inOutSine']), opacity: to(0, 1, 2.5, 0.2) },
    });
    const chipsW = ends.w + 2.4 * u + cta.w;
    ends.layer.x = W / 2 - chipsW / 2;
    cta.layer.x = W / 2 - chipsW / 2 + ends.w + 2.4 * u;

    const bolts: Layer[] = [
      [numCx - nm.total / 2 - 4.5 * u, yNum + nH * 0.2, 7 * u, -14, 1.2],
      [numCx + nm.total / 2 + 5 * u, yNum + numBlockH * 0.82, 5.5 * u, 12, 1.4],
    ].map(([bx, by, s, r, t0], i) =>
      path(`bolt-${i}`, ICONS.bolt, 24, 24, {
        x: Math.max(s / 2 + 1 * u, Math.min(W - s / 2 - 1 * u, bx)),
        y: by,
        w: s,
        h: s,
        fill: p.accent,
        stroke: p.accent,
        strokeWidth: 1.5,
        rotation: r,
        scale: to(0, 1, t0, 0.6, 'outBack'),
        opacity: k([t0, 1], [t0 + 1.6, 1], [t0 + 1.7, 0.2], [t0 + 1.8, 1], [t0 + 1.9, 0.3], [t0 + 2.0, 1]),
      }),
    );

    return {
      background: radial(0.5, 0.5, 0.9, shade(p.bg, 0.08), p.bg),
      layers: [
        glow('glow', { x: W / 2, y: yNum + numBlockH / 2, r: 55 * u, color: p.accent, a: 0.28, scale: pulse(0.8, 5.5, 1.6, 1, 1.08) }),
        band('band-a', bandsY[0], -5 * tilt, 1, 0.05, p.accent, p.onAccent),
        band('band-b', bandsY[1], 4 * tilt, -1, 0.2, p.fg, p.bg),
        txt(x, 'kicker', x.c.kicker, kSt, { x: W / 2, y: yKick, ay: 0, fill: p.fg, anim: ta.center(0.35, { stagger: 0.03 }) }),
        txt(x, 'num', numText, nSt, {
          x: numRight,
          y: yNum,
          ax: 1,
          ay: 0,
          align: 'right',
          fill: p.fg,
          ...(pct ? { counter: { from: 0, to: pct.v, start: 0.45, dur: 1.4, ease: 'outExpo', decimals: pct.dec, prefix: pct.pre, suffix: pct.suf + '%' } } : {}),
          scale: k([0.45, 0.6], [1.0, 1.06, 'outCubic'], [1.4, 1, 'spring']),
          opacity: to(0, 1, 0.45, 0.2),
        }),
        txt(x, 'off', x.c.off, oSt, {
          x: tall ? W / 2 : numRight + 2.5 * u,
          y: tall ? yOff : yNum + nH - (nSt.size - oSt.size) * x.f.displayScale * 0.12,
          ax: tall ? 0.5 : 0,
          ay: tall ? 0 : 1,
          align: tall ? 'center' : 'left',
          fill: 'transparent',
          stroke: p.accent,
          strokeWidth: Math.max(2, oSt.size * 0.035),
          anim: ta.rise(0.9, { by: 'char', stagger: 0.05 }),
        }),
        ...bolts,
        txt(x, 'old', x.c.oldPrice, opSt, {
          x: priceLeft,
          y: yPrice + priceH / 2,
          ax: 0,
          align: 'left',
          fill: p.muted,
          opacity: to(0, 1, 1.5, 0.4, 'outCubic'),
        }),
        rect('strike', {
          x: priceLeft - 0.6 * u,
          y: yPrice + priceH / 2,
          ax: 0,
          h: Math.max(2, opSt.size * 0.11),
          radius: opSt.size * 0.05,
          rotation: -10,
          fill: hot,
          w: to(0, opW + 1.2 * u, 1.85, 0.45, 'inOutCubic'),
        }),
        txt(x, 'new', x.c.newPrice, npSt, {
          x: priceLeft + opW + priceGap,
          y: yPrice + priceH / 2,
          ax: 0,
          align: 'left',
          fill: p.accent,
          anim: ta.pop(2.05, { stagger: 0.05 }),
        }),
        ends.layer,
        cta.layer,
      ],
    };
  },
};

// ------------------------------------------------------------------ Product Spotlight

function tagD(w: number, h: number): string {
  const n = h * 0.42; // nose length
  const r = h * 0.16;
  return `M${n} 0 H${w - r} Q${w} 0 ${w} ${r} V${h - r} Q${w} ${h} ${w - r} ${h} H${n} L0 ${h / 2} Z`;
}

const productSpotlight: Recipe = {
  id: 'product-spotlight',
  name: 'Product Spotlight',
  category: 'ads',
  tags: ['product', 'ecommerce', 'price', 'shop', 'ad', 'features'],
  description: 'Product ad: the shot glides in, a price tag swings onto it and key features pop in before the button.',
  duration: 5.5,
  usesLogo: true,
  fields: [
    { key: 'brand', label: 'Brand', default: 'Aerolab' },
    { key: 'product', label: 'Product name', default: 'Aero Bottle' },
    { key: 'desc', label: 'Description', default: 'Keeps drinks ice-cold for 24 hours.', multiline: true },
    { key: 'price', label: 'Price', default: '$34' },
    { key: 'f1', label: 'Feature 1', default: 'Leak-proof' },
    { key: 'f2', label: 'Feature 2', default: 'BPA-free' },
    { key: 'f3', label: 'Feature 3', default: '750 ml' },
    { key: 'cta', label: 'Button', default: 'Shop now' },
  ],
  images: [{ key: 'product', label: 'Product photo', art: 'product' }],
  variants: [
    { name: 'Cobalt', palette: 'cobalt', fonts: 'grotesk', format: 'square', logo: 'wave' },
    {
      name: 'Mint',
      palette: 'mint',
      fonts: 'outfit',
      format: 'portrait',
      logo: 'petal',
      copy: { brand: 'Verdant', product: 'Daily Greens', desc: 'Twelve superfoods in one tasty scoop.', price: '$42', f1: 'Vegan', f2: '30 servings', f3: 'No added sugar', cta: 'Order now' },
    },
    {
      name: 'Royal',
      palette: 'royal',
      fonts: 'editorial',
      format: 'story',
      logo: 'arc',
      copy: { brand: 'Maison Ore', product: 'Nuit Parfum', desc: 'Amber, fig and smoked vanilla. Made in small batches.', price: '€89', f1: '50 ml', f2: 'Vegan', f3: 'Refillable', cta: 'Discover' },
    },
    {
      name: 'Peach',
      palette: 'peach',
      fonts: 'poppins',
      format: 'landscape',
      logo: 'orbit',
      copy: { brand: 'Glowhaus', product: 'Dew Serum', desc: 'Hyaluronic hydration for a glass-skin finish.', price: '$28', f1: 'Fragrance-free', f2: 'Dermatologist tested', f3: '30 ml', cta: 'Shop now' },
    },
  ],
  build(x) {
    const { u, W, H, p } = x;
    const L = x.isLandscape;
    const S = x.isSquare;
    const split = L || S;
    const dark = readableOn(p.bg) === '#ffffff';
    const m = x.pick({ landscape: 9 * u, default: 7 * u });

    // Image card geometry
    let imgW: number, imgH: number, imgX: number, imgY: number;
    let colX: number, colW: number;
    if (L) {
      imgW = 74 * u;
      imgH = 84 * u;
      imgX = m;
      imgY = (H - imgH) / 2;
      colX = imgX + imgW + 12 * u;
      colW = W - colX - m;
    } else if (S) {
      imgW = 46 * u;
      imgH = 72 * u;
      imgX = m;
      imgY = 15 * u;
      colX = imgX + imgW + 7 * u;
      colW = W - colX - m;
    } else {
      imgW = W - m * 2;
      imgH = x.pick({ story: 82 * u, default: 56 * u });
      imgX = m;
      imgY = x.pick({ story: 17 * u, default: 15 * u });
      colX = m;
      colW = W - m * 2;
    }

    const logoS = x.pick({ story: 6 * u, default: 5 * u });
    const bSt: TS = { role: 'body', size: x.pick({ story: 3.8 * u, default: 3.3 * u }), weight: 700 };
    const nSt = fit(x, x.c.product, { role: 'title', size: x.pick({ landscape: 11 * u, story: 12 * u, portrait: 10 * u, square: 8 * u, default: 10 * u }), lh: 1 }, colW, 2);
    const nBW = balance(x, x.c.product, nSt, colW);
    const nWr = wrap(x, x.c.product, nSt, nBW);
    const dSt = fit(x, x.c.desc, { role: 'body', size: x.pick({ landscape: 3.6 * u, story: 4.4 * u, portrait: 3.7 * u, square: 3.3 * u, default: 3.6 * u }) }, colW, 3);
    const dBW = balance(x, x.c.desc, dSt, colW);
    const dWr = wrap(x, x.c.desc, dSt, dBW);
    let fSt: TS = { role: 'body', size: x.pick({ story: 3.6 * u, landscape: 3.2 * u, default: 3 * u }), weight: 600 };
    const feats = [x.c.f1, x.c.f2, x.c.f3].filter((f) => f.trim());
    // Each feature chip must fit the text column on its own.
    const widest = feats.reduce((a, f) => (tw(x, f, fSt) > tw(x, a, fSt) ? f : a), '');
    fSt = fit(x, widest, fSt, colW - fSt.size * 1.8 - fSt.size * 2.4 * 0.9, 1, 0.7);
    const fH = fSt.size * 2.4;
    const featW = feats.map((f) => tw(x, f, fSt) + fSt.size * 1.3 + fSt.size * 0.5 + fH * 0.9);
    const fGap = 1.6 * u;
    const fl = split ? { rows: feats.map((_, i) => [i]), rowW: featW } : flow(featW, colW, fGap);
    const featsH = fl.rows.length * fH + (fl.rows.length - 1) * fGap;
    const cSt: TS = { role: 'body', size: x.pick({ story: 4 * u, default: 3.3 * u }), weight: 700 };
    const cH = cSt.size * 2.8;

    // Text flow
    const g1 = x.pick({ story: 4 * u, default: 3 * u });
    const g2 = x.pick({ story: 6 * u, default: 4.5 * u });
    const g3 = x.pick({ story: 7 * u, default: 5 * u });
    let yName: number, yBrand: number;
    if (split) {
      const blk = logoS + 5 * u + nWr.h + g1 + dWr.h + g2 + featsH + g3 + cH;
      yBrand = (H - blk) / 2;
      yName = yBrand + logoS + 5 * u;
    } else {
      yBrand = x.pick({ story: 6 * u + 2 * u, default: 4.5 * u });
      yName = imgY + imgH + x.pick({ story: 7 * u, default: 5 * u });
      if (x.isStory) yBrand = imgY - logoS - 4 * u;
    }
    const yDesc = yName + nWr.h + g1;
    const yFeat = yDesc + dWr.h + g2;
    const yCta = yFeat + featsH + g3;
    const tax = split ? 0 : 0.5;
    const tx = split ? colX : W / 2;
    const align = split ? 'left' : 'center';
    // Portrait: if the stack would overflow, shorten the image.
    if (!split) {
      const over = yCta + cH - (H - x.pick({ story: 20 * u, default: 5 * u }));
      if (over > 0) {
        imgH -= over;
        yName -= over;
      }
    }
    const yD = !split ? yName + nWr.h + g1 : yDesc;
    const yF = yD + dWr.h + g2;
    const yC = yF + featsH + g3;

    // Price tag
    const pSt: TS = { role: 'title', size: x.pick({ story: 7.5 * u, default: 6 * u }) };
    const pW = tw(x, x.c.price, pSt);
    const tagH = pSt.size * x.f.displayScale * 1.75;
    const tagW = pW + tagH * 0.42 + tagH * 0.75;
    const tagX = imgX + imgW - tagW - 3 * u;
    const tagY = imgY + x.pick({ story: 8 * u, default: 6 * u });

    const featLayers: Layer[] = [];
    fl.rows.forEach((row, ri) => {
      let fx = split ? colX : W / 2 - fl.rowW[ri] / 2;
      row.forEach((idx) => {
        const t0 = 1.7 + idx * 0.12;
        featLayers.push(
          chip(x, `feat-${idx}`, feats[idx], {
            x: fx,
            y: yF + ri * (fH + fGap),
            ax: 0,
            ay: 0,
            st: fSt,
            h: fH,
            fill: dark ? alpha(p.fg, 0.08) : p.surface,
            stroke: alpha(p.fg, dark ? 0.12 : 0.08),
            strokeWidth: 0.2 * u,
            color: p.fg,
            icon: ICONS.check,
            iconColor: p.accent,
            iconSW: 3,
            g: { scale: to(0, 1, t0, 0.6, 'spring'), opacity: to(0, 1, t0, 0.2) },
          }).layer,
        );
        fx += featW[idx] + fGap;
      });
    });

    const cta = chip(x, 'cta', x.c.cta, {
      x: tx,
      y: yC,
      ax: tax,
      ay: 0,
      st: cSt,
      h: cH,
      padX: cH * 0.7,
      fill: p.fg,
      color: p.bg,
      icon: ICONS.arrowRight,
      iconRight: true,
      g: { scale: to(0, 1, 2.2, 0.7, 'spring'), opacity: to(0, 1, 2.2, 0.2) },
    });

    const imgCy = imgY + imgH / 2;
    return {
      background: x.grad(160, p.bg, p.bg2),
      layers: [
        circle('halo', Math.max(imgW, imgH) * 0.62, {
          x: imgX + imgW / 2,
          y: imgCy,
          fill: radial(0.5, 0.5, 0.7, alpha(p.accent2 === p.fg ? p.accent : p.accent2, 0.35), alpha(p.accent, 0)),
          scale: to(0.4, 1, 0, 1.6, 'outExpo'),
        }),
        group(
          'shot',
          [image('shot-img', x.img[0], { x: imgW / 2, y: imgH / 2, w: imgW, h: imgH, scale: k([0.1, 1.3], [2.4, 1, 'outCubic'], [5.5, 1.04, 'linear']) })],
          {
            x: imgX + imgW / 2,
            y: k([0.1, imgCy + 18 * u], [1.3, imgCy, 'outExpo'], [3.4, imgCy - 0.8 * u, 'inOutSine'], [5.5, imgCy, 'inOutSine']),
            w: imgW,
            h: imgH,
            clip: true,
            clipRadius: 4.5 * u,
            opacity: to(0, 1, 0.1, 0.4, 'outCubic'),
            scale: to(0.92, 1, 0.1, 1.2, 'outExpo'),
          },
        ),
        brandRow(x, 'brand', x.c.brand, {
          x: split ? colX : x.isStory ? W / 2 : m,
          y: yBrand,
          ax: split || !x.isStory ? 0 : 0.5,
          ay: 0,
          logo: logoS,
          st: bSt,
          color: p.fg,
          logoColor: p.accent,
          g: { opacity: to(0, 1, 0.3, 0.6, 'outCubic') },
        }).layer,
        group(
          'tag',
          [
            path('tag-shape', tagD(tagW, tagH), tagW, tagH, { x: 0, y: 0, ax: 0, ay: 0, w: tagW, h: tagH, fill: p.accent, shadow: { color: alpha('#000000', 0.18), blur: 2 * u, y: 1 * u } }),
            circle('tag-hole', tagH * 0.09, { x: tagH * 0.36, y: tagH / 2, fill: p.bg }),
            txt(x, 'tag-price', x.c.price, pSt, { x: tagH * 0.42 + (tagW - tagH * 0.42) / 2, y: tagH / 2, fill: p.onAccent }),
          ],
          {
            x: tagX + tagH * 0.36,
            y: tagY + tagH / 2,
            w: tagW,
            h: tagH,
            ax: (tagH * 0.36) / tagW,
            ay: 0.5,
            rotation: k([1.25, -70], [1.75, 14, 'outCubic'], [2.3, -8, 'inOutSine'], [2.8, 4, 'inOutSine'], [3.3, -2, 'inOutSine'], [3.8, 0, 'inOutSine']),
            scale: to(0, 1, 1.25, 0.35, 'outBack'),
          },
        ),
        txt(x, 'name', x.c.product, nSt, { x: tx, y: yName, w: nBW, ax: tax, ay: 0, align, anim: ta.rise(0.6, { stagger: 0.08 }) }),
        txt(x, 'desc', x.c.desc, dSt, { x: tx, y: yD, w: dBW, ax: tax, ay: 0, align, fill: p.muted, anim: ta.blur(1.0, { stagger: 0.04 }) }),
        ...featLayers,
        cta.layer,
      ],
    };
  },
};

// ------------------------------------------------------------------ Promo Code

const promoCode: Recipe = {
  id: 'promo-code',
  name: 'Promo Code',
  category: 'ads',
  tags: ['promo code', 'coupon', 'free shipping', 'discount', 'ecommerce', 'offer'],
  description: 'A delivery truck rolls in, then a cursor taps the dashed code box and it flips to “copied”.',
  duration: 6,
  usesLogo: true,
  fields: [
    { key: 'brand', label: 'Brand', default: 'Parcelly' },
    { key: 'title', label: 'Offer', default: 'Free shipping' },
    { key: 'sub', label: 'Details', default: 'On every order this weekend', multiline: true },
    { key: 'code', label: 'Code', default: 'SHIPFREE' },
    { key: 'copied', label: 'Copied message', default: 'Code copied' },
    { key: 'note', label: 'Small print', default: 'Apply at checkout · Ends Sunday' },
  ],
  variants: [
    { name: 'Mint', palette: 'mint', fonts: 'sora', format: 'square', logo: 'stack' },
    {
      name: 'Royal',
      palette: 'royal',
      fonts: 'manrope',
      format: 'portrait',
      logo: 'knot',
      copy: { brand: 'Atelier Nine', title: 'Extra 20% off', sub: 'Members-only pricing on the whole store', code: 'VIP20', note: 'One use per customer' },
    },
    {
      name: 'Citrus',
      palette: 'citrus',
      fonts: 'space',
      format: 'story',
      logo: 'bolt',
      copy: { brand: 'Dashbite', title: 'Free delivery', sub: 'On orders over $25 all week', code: 'FREEDASH', note: 'Valid until Friday, 11 PM' },
    },
    {
      name: 'Ocean',
      palette: 'ocean',
      fonts: 'mono',
      format: 'landscape',
      logo: 'wave',
      copy: { brand: 'Tidal Supply', title: 'Welcome gift', sub: '15% off your first order', code: 'HELLO15', note: 'New customers only' },
    },
  ],
  build(x) {
    const { u, W, H, p } = x;
    const dark = readableOn(p.bg) === '#ffffff';
    const m = x.pick({ landscape: 10 * u, default: 8 * u });
    const logoS = x.pick({ story: 6 * u, default: 5 * u });
    const bSt: TS = { role: 'body', size: x.pick({ story: 3.8 * u, default: 3.3 * u }), weight: 700 };
    const tSt = fit(x, x.c.title, { role: 'title', size: x.pick({ landscape: 12 * u, story: 15 * u, portrait: 13 * u, default: 11.5 * u }), lh: 1 }, W - m * 2, 2);
    const tBW = balance(x, x.c.title, tSt, W - m * 2);
    const tWr = wrap(x, x.c.title, tSt, tBW);
    const sSt = fit(x, x.c.sub, { role: 'body', size: x.pick({ story: 5 * u, default: 3.8 * u }) }, W - m * 3, 2);
    const sBW = balance(x, x.c.sub, sSt, W - m * 3);
    const sWr = wrap(x, x.c.sub, sSt, sBW);
    const codeSt: TS = { role: 'title', size: x.pick({ story: 9.5 * u, default: 7 * u }), tracking: 0.12, uppercase: true };
    const codeW = tw(x, x.c.code, codeSt);
    const boxH = codeSt.size * x.f.displayScale * 2.1;
    const iconS = boxH * 0.34;
    const boxW = Math.min(W - m * 2, codeW + boxH * 0.9 + iconS + boxH * 0.55);
    const toastSt: TS = { role: 'body', size: x.pick({ story: 4.2 * u, default: 3 * u }), weight: 700 };
    const toastH = toastSt.size * 2.5;
    const nSt = fit(x, x.c.note, { role: 'body', size: x.pick({ story: 4.2 * u, default: 3 * u }) }, W - m * 2, 1);
    const truckD = x.pick({ story: 19 * u, default: 13 * u });

    const gaps = x.pick({ story: [8, 4, 3, 5, 4, 5], default: [5, 3, 2.5, 4, 3, 4] }).map((g) => g * u);
    const blk = logoS + gaps[0] + truckD + gaps[1] + tWr.h + gaps[2] + sWr.h + gaps[3] + toastH + gaps[4] + boxH + gaps[5] + nSt.size * 1.35;
    const top = Math.max(x.pick({ story: 15 * u, default: 5 * u }), (H - blk) / 2 - x.pick({ story: 5 * u, default: 0 }));
    const yBrand = top;
    const yTruck = yBrand + logoS + gaps[0] + truckD / 2;
    const yTitle = yTruck + truckD / 2 + gaps[1];
    const ySub = yTitle + tWr.h + gaps[2];
    const yToast = ySub + sWr.h + gaps[3] + toastH / 2;
    const yBox = yToast + toastH / 2 + gaps[4] + boxH / 2;
    const yNote = yBox + boxH / 2 + gaps[5];

    const cx = W / 2;
    const boxL = cx - boxW / 2;
    const iconX = boxL + boxW - boxH * 0.5;
    const TAP = 2.9;
    const hot = vivid(p);

    const speed: Layer[] = [0, 1, 2].map((i) =>
      rect(`speed-${i}`, {
        x: cx - truckD * 0.62 - i * 1.2 * u,
        y: yTruck - truckD * 0.18 + i * truckD * 0.18,
        ax: 1,
        h: 0.7 * u,
        radius: 0.35 * u,
        fill: alpha(p.fg, 0.35),
        w: k([0.3, 0], [0.7, (9 - i * 2) * u, 'outCubic'], [1.3, 0, 'inCubic']),
        end: 1.3,
      }),
    );

    const ripple = circle('tap-ripple', boxH * 0.4, {
      x: iconX,
      y: yBox,
      stroke: hot,
      strokeWidth: 0.4 * u,
      scale: to(0.3, 2.2, TAP, 0.7, 'outCubic'),
      opacity: k([TAP, 0], [TAP + 0.05, 0.9], [TAP + 0.7, 0, 'inCubic']),
      start: TAP,
      end: TAP + 0.71,
    });

    const toastW = tw(x, x.c.copied, toastSt) + toastSt.size * 1.3 + toastSt.size * 0.5 + toastH * 0.9;
    const toast = chip(x, 'toast', x.c.copied, {
      x: cx,
      y: yToast,
      st: toastSt,
      h: toastH,
      fill: p.fg,
      color: p.bg,
      icon: ICONS.check,
      iconColor: hot === p.bg ? p.bg : readableOn(p.fg) === '#ffffff' ? shade(hot, 0.2) : hot,
      iconSW: 3,
      g: { scale: to(0, 1, TAP + 0.15, 0.6, 'spring'), y: to(yToast + 3 * u, yToast, TAP + 0.15, 0.6, 'outExpo') },
    });
    void toastW;

    return {
      background: dark ? radial(0.5, 0.35, 1, p.bg2, p.bg) : x.grad(170, p.bg, p.bg2),
      layers: [
        glow('glow', { x: cx, y: yBox, r: 55 * u, color: p.accent, a: dark ? 0.25 : 0.18 }),
        brandRow(x, 'brand', x.c.brand, { x: cx, y: yBrand, ay: 0, logo: logoS, st: bSt, color: p.fg, logoColor: p.accent, g: { opacity: to(0, 1, 0.1, 0.5) } }).layer,
        ...speed,
        group(
          'truck',
          [
            circle('truck-bg', truckD / 2, { x: truckD / 2, y: truckD / 2, fill: p.accent }),
            icon('truck-i', ICON.truck, { x: truckD / 2, y: truckD / 2, s: truckD * 0.56, color: p.onAccent, sw: 1.8 }),
          ],
          {
            x: k([0.2, -truckD], [1.0, cx + 2 * u, 'outCubic'], [1.35, cx, 'outBack']),
            y: yTruck,
            w: truckD,
            h: truckD,
            rotation: k([0.2, 0], [0.95, -6, 'outCubic'], [1.25, 4, 'inOutSine'], [1.6, 0, 'outBack']),
          },
        ),
        txt(x, 'title', x.c.title, tSt, { x: cx, y: yTitle, w: tBW, ay: 0, anim: ta.rise(0.6, { stagger: 0.08 }) }),
        txt(x, 'sub', x.c.sub, sSt, { x: cx, y: ySub, w: sBW, ay: 0, fill: p.muted, anim: ta.blur(1.0, { stagger: 0.04 }) }),
        group(
          'box',
          [
            rect('box-fill', {
              x: 0,
              y: 0,
              ax: 0,
              ay: 0,
              w: boxW,
              h: boxH,
              radius: boxH * 0.24,
              fill: k<string>([0, alpha(p.accent, 0.06)], [TAP, alpha(p.accent, 0.06)], [TAP + 0.12, alpha(p.accent, 0.3)], [TAP + 0.8, alpha(p.accent, 0.12), 'outCubic']),
            }),
            rect('box-dash', {
              x: 0,
              y: 0,
              ax: 0,
              ay: 0,
              w: boxW,
              h: boxH,
              radius: boxH * 0.24,
              stroke: p.accent,
              strokeWidth: Math.max(2, 0.45 * u),
              dash: [1.6 * u, 1.1 * u],
              opacity: k([TAP, 1], [TAP + 0.25, 0]),
            }),
            rect('box-solid', {
              x: 0,
              y: 0,
              ax: 0,
              ay: 0,
              w: boxW,
              h: boxH,
              radius: boxH * 0.24,
              stroke: p.accent,
              strokeWidth: Math.max(2, 0.45 * u),
              opacity: k([TAP, 0], [TAP + 0.25, 1]),
            }),
            txt(x, 'code', x.c.code, codeSt, {
              x: (boxW - iconS - boxH * 0.4) / 2 + boxH * 0.05,
              y: boxH / 2,
              fill: p.fg,
              anim: ta.flip(1.45, { stagger: 0.05 }),
            }),
            rect('box-div', { x: iconX - boxL - boxH * 0.5, y: boxH * 0.22, ax: 0, ay: 0, w: Math.max(1, 0.2 * u), h: boxH * 0.56, fill: alpha(p.accent, 0.4) }),
            icon('copy-i', ICON.copy, { x: iconX - boxL, y: boxH / 2, s: iconS, color: p.accent, sw: 2, opacity: k([TAP, 1], [TAP + 0.15, 0]) }),
            icon('copied-i', ICONS.check, {
              x: iconX - boxL,
              y: boxH / 2,
              s: iconS,
              color: p.accent,
              sw: 2.8,
              trimEnd: to(0, 1, TAP + 0.1, 0.4, 'outCubic'),
            }),
          ],
          {
            x: cx,
            y: yBox,
            w: boxW,
            h: boxH,
            scale: k([1.2, 0.6], [1.8, 1, 'spring'], [TAP, 1], [TAP + 0.1, 0.96, 'outQuad'], [TAP + 0.5, 1, 'spring']),
            opacity: to(0, 1, 1.2, 0.3),
          },
        ),
        toast.layer,
        txt(x, 'note', x.c.note, nSt, { x: cx, y: yNote, ay: 0, fill: p.muted, opacity: to(0, 1, 1.9, 0.6, 'outCubic') }),
        ripple,
        path('cursor', CURSOR, 24, 24, {
          x: k([1.9, W + 6 * u], [2.8, iconX + 0.6 * u, 'inOutCubic'], [5.0, iconX + 0.6 * u], [6, iconX + 1.6 * u, 'inOutSine']),
          y: k([1.9, H * 0.92], [2.8, yBox + 0.8 * u, 'inOutCubic'], [5.0, yBox + 0.8 * u], [6, yBox + 2.4 * u, 'inOutSine']),
          ax: 0.22,
          ay: 0.14,
          w: 7 * u,
          h: 7 * u,
          fill: p.fg,
          stroke: p.bg,
          strokeWidth: 1.4,
          scale: k([2.8, 1], [TAP, 0.82, 'outQuad'], [TAP + 0.25, 1, 'outBack']),
          start: 1.9,
        }),
      ],
    };
  },
};

// ------------------------------------------------------------------ App Install

const appInstall: Recipe = {
  id: 'app-install',
  name: 'App Install',
  category: 'ads',
  tags: ['app', 'mobile', 'download', 'install', 'phone', 'mockup', 'rating'],
  description: 'App install ad: a phone glides in with a live UI, next to your icon, star rating and a Download button.',
  duration: 6,
  usesLogo: true,
  fields: [
    { key: 'brand', label: 'App name', default: 'Kitepath' },
    { key: 'headline', label: 'Headline', default: 'Plan smarter. Post faster.', multiline: true },
    { key: 'rating', label: 'Rating', default: '4.8' },
    { key: 'reviews', label: 'Ratings count', default: '12K ratings' },
    { key: 'cta', label: 'Button', default: 'Download' },
    { key: 'note', label: 'Small print', default: 'Free on mobile and tablet' },
    { key: 'screenTitle', label: 'In-app title', default: 'Your week' },
    { key: 'stat', label: 'In-app number', default: '24' },
  ],
  variants: [
    { name: 'Azure', palette: 'azure', fonts: 'sora', format: 'story', logo: 'orbit' },
    {
      name: 'Midnight',
      palette: 'midnight',
      fonts: 'grotesk',
      format: 'square',
      logo: 'bolt',
      copy: { brand: 'Pulsefit', headline: 'Your coach, in your pocket.', rating: '4.9', reviews: '38K ratings', note: 'Free 14-day trial', screenTitle: 'Today', stat: '8,420' },
    },
    {
      name: 'Mint',
      palette: 'mint',
      fonts: 'manrope',
      format: 'portrait',
      logo: 'petal',
      copy: { brand: 'Sprout', headline: 'Grow your savings on autopilot.', rating: '4.7', reviews: '9K ratings', cta: 'Get the app', note: 'No fees. Cancel anytime.', screenTitle: 'Savings', stat: '1,250' },
    },
    {
      name: 'Electric',
      palette: 'electric',
      fonts: 'outfit',
      format: 'landscape',
      logo: 'stack',
      copy: { brand: 'Stackly', headline: 'Every task. One calm list.', rating: '4.8', reviews: '21K ratings', cta: 'Install free', note: 'Works offline', screenTitle: 'Tasks', stat: '12' },
    },
  ],
  build(x) {
    const { u, W, H, p } = x;
    const L = x.isLandscape;
    const story = x.isStory;
    const dark = readableOn(p.bg) === '#ffffff';
    const m = x.pick({ landscape: 10 * u, default: 7 * u });
    const hot = vivid(p);

    // Phone
    let phH = x.pick({ landscape: 88 * u, story: 84 * u, portrait: 92 * u, default: 82 * u });
    let phW = phH * 0.49;
    const phX = x.pick({ landscape: W - m - 6 * u - phW / 2, story: W / 2, portrait: W - m - phW / 2 + 8 * u, default: W - m - phW / 2 + 3 * u });
    let phY = x.pick({ landscape: H / 2 + 2 * u, story: 41 * u + phH / 2, portrait: H / 2 + 3 * u, default: H / 2 + 4 * u });

    // Text column
    const colX = story ? m : m;
    const colW = story ? W - m * 2 : L ? phX - phW / 2 - m - 14 * u : phX - phW / 2 - m - 6 * u;
    const tax = story ? 0.5 : 0;
    const tx = story ? W / 2 : colX;
    const align = story ? 'center' : 'left';
    const hSt = fit(x, x.c.headline, { role: 'title', size: x.pick({ landscape: 10 * u, story: 11 * u, portrait: 7.6 * u, default: 7 * u }), lh: 1.02 }, colW, story ? 2 : 4);
    const hBW = balance(x, x.c.headline, hSt, colW);
    const hWr = wrap(x, x.c.headline, hSt, hBW);
    const tile = x.pick({ story: 15 * u, landscape: 15 * u, default: 13.5 * u });
    const nameSt: TS = { role: 'title', size: x.pick({ story: 5.4 * u, landscape: 5.2 * u, default: 4.6 * u }) };
    const starS = x.pick({ story: 3.8 * u, default: 3.2 * u });
    const rSt: TS = { role: 'body', size: x.pick({ story: 3.2 * u, default: 2.8 * u }), weight: 600 };
    const cSt: TS = { role: 'body', size: x.pick({ story: 4.2 * u, default: 3.4 * u }), weight: 700 };
    const cH = cSt.size * 2.8;
    const nSt: TS = { role: 'body', size: x.pick({ story: 3.4 * u, default: 2.8 * u }) };
    const ratingNum = Math.max(0, Math.min(5, parseFloat(x.c.rating) || 5));
    const nameW = tw(x, x.c.brand, nameSt);
    const ratingText = `${x.c.rating} · ${x.c.reviews}`;
    const appRowW = tile + 3 * u + Math.max(nameW, starS * 5.8, tw(x, ratingText, rSt));

    let yHead: number, yApp: number, yCta: number, yNote: number;
    if (story) {
      // App row, headline, phone, then the button — the phone takes whatever height is left.
      yApp = 14 * u;
      yHead = yApp + tile + 6 * u;
      const phTop = yHead + hWr.h + 6 * u;
      const bottom = H - 12 * u;
      phH = Math.max(60 * u, Math.min(96 * u, bottom - phTop - 6 * u - cH - 2.6 * u - nSt.size * 1.35));
      phW = phH * 0.49;
      phY = phTop + phH / 2;
      yCta = phTop + phH + 6 * u;
      yNote = yCta + cH + 2.6 * u;
    } else {
      const blk = tile + 7 * u + hWr.h + 7 * u + cH + 3 * u + nSt.size * 1.35;
      yApp = (H - blk) / 2;
      yHead = yApp + tile + 7 * u;
      yCta = yHead + hWr.h + 7 * u;
      yNote = yCta + cH + 3 * u;
    }
    const appX = story ? W / 2 - appRowW / 2 : colX;

    // Phone screen UI
    const screen = (sw: number, sh: number): Layer[] => {
      const s = sw / 100; // screen unit
      const scrBg = dark ? shade(p.bg, 0.04) : p.surface;
      const ink = p.fg;
      const soft = dark ? alpha(p.fg, 0.08) : alpha(p.accent, 0.07);
      const out: Layer[] = [
        rect('scr-bg', { x: 0, y: 0, ax: 0, ay: 0, w: sw, h: sh, fill: scrBg }),
        text9('scr-time', '9:41', 6 * s, 6.5 * s, 4.2 * s, ink),
        rect('scr-batt', { x: sw - 8 * s, y: 6.5 * s, w: 7 * s, h: 3.4 * s, radius: 1 * s, fill: ink }),
        txt(x, 'scr-hello', 'Good morning', { role: 'body', size: 4.2 * s }, { x: 7 * s, y: 18 * s, ax: 0, align: 'left', fill: p.muted }),
        txt(x, 'scr-title', x.c.screenTitle, { role: 'title', size: 8.5 * s }, { x: 7 * s, y: 27 * s, ax: 0, align: 'left', fill: ink }),
        circle('scr-av', 5 * s, { x: sw - 12 * s, y: 22 * s, fill: linear(135, p.accent2 === ink ? p.accent : p.accent2, p.accent) }),
      ];
      // Hero card
      const cw = sw - 14 * s;
      const chH = 48 * s;
      const heroKids: Layer[] = [
        rect('hero-bg', { x: 0, y: 0, ax: 0, ay: 0, w: cw, h: chH, radius: 6 * s, fill: linear(135, p.accent, shade(p.accent, -0.25)) }),
        txt(x, 'hero-label', 'This week', { role: 'body', size: 3.8 * s, weight: 600 }, { x: 6 * s, y: 9 * s, ax: 0, align: 'left', fill: alpha(p.onAccent, 0.8) }),
      ];
      const statN = splitNum(x.c.stat);
      heroKids.push(
        txt(x, 'hero-num', x.c.stat, { role: 'title', size: 13 * s }, {
          x: 6 * s,
          y: 22 * s,
          ax: 0,
          align: 'left',
          fill: p.onAccent,
          ...(statN ? { counter: { from: 0, to: statN.v, start: 1.3, dur: 1.6, ease: 'outCubic', decimals: statN.dec, prefix: statN.pre, suffix: statN.suf } } : {}),
        }),
      );
      const bars = [0.45, 0.7, 0.55, 0.9, 0.65, 1, 0.8];
      const bw = (cw - 12 * s) / bars.length;
      bars.forEach((b, i) =>
        heroKids.push(
          rect(`hero-bar-${i}`, {
            x: 6 * s + i * bw + bw * 0.5,
            y: chH - 5 * s,
            ay: 1,
            w: bw * 0.55,
            h: to(0, b * 14 * s, 1.4 + i * 0.07, 0.8, 'outBack'),
            radius: bw * 0.27,
            fill: i === 5 ? p.onAccent : alpha(p.onAccent, 0.45),
          }),
        ),
      );
      out.push(group('hero', heroKids, { x: 7 * s, y: 34 * s, ax: 0, ay: 0, w: cw, h: chH, scale: to(0.9, 1, 1.0, 0.8, 'outExpo'), opacity: to(0, 1, 1.0, 0.4) }));
      // List rows
      for (let i = 0; i < 4; i++) {
        const ry = 90 * s + i * 17 * s;
        const t0 = 1.6 + i * 0.12;
        out.push(
          group(
            `row-${i}`,
            [
              rect(`row-${i}-bg`, { x: 0, y: 0, ax: 0, ay: 0, w: cw, h: 14 * s, radius: 4 * s, fill: soft }),
              circle(`row-${i}-ic`, 3.6 * s, { x: 7.5 * s, y: 7 * s, fill: i % 2 ? alpha(p.accent, 0.5) : p.accent }),
              rect(`row-${i}-l1`, { x: 14.5 * s, y: 5.2 * s, ax: 0, w: cw * (0.42 - i * 0.04), h: 2.4 * s, radius: 1.2 * s, fill: alpha(ink, 0.7) }),
              rect(`row-${i}-l2`, { x: 14.5 * s, y: 9.4 * s, ax: 0, w: cw * 0.28, h: 2 * s, radius: 1 * s, fill: alpha(ink, 0.25) }),
              rect(`row-${i}-pill`, { x: cw - 5 * s, y: 7 * s, ax: 1, w: 12 * s, h: 5 * s, radius: 2.5 * s, fill: alpha(p.accent, 0.15) }),
            ],
            { x: k([t0, 7 * s + 10 * s], [t0 + 0.7, 7 * s, 'outExpo']), y: ry, ax: 0, ay: 0, w: cw, h: 14 * s, opacity: to(0, 1, t0, 0.35) },
          ),
        );
      }
      // Tab bar
      out.push(rect('tab-bg', { x: 0, y: sh, ax: 0, ay: 1, w: sw, h: 20 * s, fill: dark ? shade(p.bg, 0.08) : shade(p.surface, -0.035) }));
      const tabs = [ICONS.star, ICONS.calendar, ICONS.chat, ICONS.user];
      tabs.forEach((d, i) =>
        out.push(icon(`tab-${i}`, d, { x: sw * (0.14 + i * 0.24), y: sh - 12 * s, s: 6.5 * s, color: i === 0 ? p.accent : alpha(ink, 0.35), sw: 2 })),
      );
      return out;
    };
    function text9(id: string, s: string, xx: number, yy: number, size: number, fill: string) {
      return txt(x, id, s, { role: 'body', size, weight: 700 }, { x: xx, y: yy, ax: 0, align: 'left', fill });
    }

    const phoneLayer = phone(
      'phone',
      {
        x: phX,
        y: k([0.2, phY + 40 * u], [1.4, phY, 'outExpo'], [3.7, phY - 1.2 * u, 'inOutSine'], [6, phY, 'inOutSine']),
        h: phH,
        body: dark ? shade(p.bg, -0.6) : shade(p.fg, -0.35),
        rotation: k([0.2, 10], [1.5, story ? 0 : -4, 'outExpo'], [6, story ? 0 : -2, 'inOutSine']),
        opacity: to(0, 1, 0.2, 0.3),
      },
      screen,
    );

    const appTile = group(
      'app',
      [
        rect('app-tile', { x: tile / 2, y: tile / 2, w: tile, h: tile, radius: tile * 0.26, fill: linear(135, shade(p.accent, 0.15), shade(p.accent, -0.2)), shadow: { color: alpha(p.accent, 0.35), blur: 2.5 * u, y: 1 * u } }),
        x.logo('app-logo', { size: tile * 0.56, x: tile / 2, y: tile / 2, color: p.onAccent }),
      ],
      { x: appX, y: yApp, ax: 0, ay: 0, w: tile, h: tile, scale: to(0, 1, 0.5, 0.7, 'spring'), rotation: to(-20, 0, 0.5, 0.8, 'outBack') },
    );
    const st = stars('rating', {
      x: appX + tile + 3 * u,
      y: yApp + tile * 0.55,
      ax: 0,
      size: starS,
      gap: starS * 0.16,
      rating: ratingNum,
      color: hot,
      empty: alpha(p.fg, 0.15),
      t0: 0.95,
      stagger: 0.07,
    });

    const cta = chip(x, 'cta', x.c.cta, {
      x: tx,
      y: yCta,
      ax: tax,
      ay: 0,
      st: cSt,
      h: cH,
      padX: cH * 0.65,
      fill: p.fg,
      color: p.bg,
      icon: ICON.download,
      iconSW: 2.4,
      g: { scale: k([1.9, 0], [2.5, 1, 'spring'], [3.6, 1], [3.75, 0.94, 'outQuad'], [4.1, 1, 'spring']), opacity: to(0, 1, 1.9, 0.2) },
    });
    const ctaCx = story ? W / 2 : colX + cta.w / 2;

    return {
      background: dark ? radial(0.75, 0.5, 1, p.bg2, p.bg) : x.grad(150, p.bg, p.bg2),
      layers: [
        glow('glow', { x: phX, y: phY, r: phH * 0.62, color: p.accent, a: dark ? 0.4 : 0.25, scale: to(0.5, 1, 0.2, 1.8, 'outExpo') }),
        circle('orbit', phH * 0.42, { x: phX, y: phY, stroke: alpha(p.accent, 0.25), strokeWidth: 0.25 * u, scale: to(0.6, 1, 0.3, 1.6, 'outExpo') }),
        phoneLayer,
        appTile,
        txt(x, 'app-name', x.c.brand, nameSt, { x: appX + tile + 3 * u, y: yApp + tile * 0.2, ax: 0, align: 'left', anim: ta.slide(0.7, { stagger: 0.05 }) }),
        st.layer,
        txt(x, 'app-rating', ratingText, rSt, {
          x: appX + tile + 3 * u,
          y: yApp + tile * 0.86,
          ax: 0,
          align: 'left',
          fill: p.muted,
          opacity: to(0, 1, 1.4, 0.5),
        }),
        txt(x, 'headline', x.c.headline, hSt, { x: tx, y: yHead, w: hBW, ax: tax, ay: 0, align, anim: ta.rise(0.45, { stagger: 0.07 }) }),
        rect('cta-ripple', {
          x: ctaCx,
          y: yCta + cH / 2,
          w: cta.w,
          h: cH,
          radius: cH / 2,
          stroke: p.fg,
          strokeWidth: 0.3 * u,
          scale: to(1, 1.18, 3.75, 0.8, 'outCubic'),
          opacity: k([3.75, 0], [3.8, 0.6], [4.55, 0, 'inCubic']),
          start: 3.75,
          end: 4.56,
        }),
        cta.layer,
        txt(x, 'note', x.c.note, nSt, { x: tx, y: yNote, ax: tax, ay: 0, align, fill: p.muted, opacity: to(0, 1, 2.3, 0.6) }),
      ],
    };
  },
};

export const adRecipes: Recipe[] = [flashSale, productSpotlight, promoCode, appInstall];

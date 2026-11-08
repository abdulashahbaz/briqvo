/** Motion pack — kinetic typography recipes. */
import type { Layer } from '../../../engine/types';
import { type Recipe, k, rect, circle, group, path, linear, radial, ta, tween, fadeIn, alpha, shade, ICONS } from '../../kit';
import {
  type FontRef,
  fitTitle,
  fitBody,
  displayFont,
  bodyFont,
  runWidth,
  spaceWidth,
  charEdges,
  capShift,
  vmetrics,
  steps,
  isLight,
} from './shared';

/** Right edge of every non-space character of left-aligned wrapped lines (engine typewriter order). */
function caretStops(f: FontRef, lines: string[], px: number, tr: number): { x: number; line: number }[] {
  const out: { x: number; line: number }[] = [];
  const sp = spaceWidth(f, px, tr);
  lines.forEach((ln, li) => {
    let wx = 0;
    for (const w of ln.split(' ').filter(Boolean)) {
      for (const e of charEdges(f, w, px, tr)) out.push({ x: wx + e, line: li });
      wx += runWidth(f, w, px, tr) + sp;
    }
  });
  return out;
}

const nonSpace = (s: string) => Array.from(s.replace(/\s+/g, '')).length;

// ------------------------------------------------------------------ Word by Word

const wordByWord: Recipe = {
  id: 'word-by-word',
  name: 'Word by Word',
  category: 'text',
  tags: ['text', 'kinetic', 'words', 'statement', 'bold', 'reels', 'new'],
  description: 'Each word punches in centre stage with a zoom-and-focus beat, then the full statement locks into a stacked poster.',
  duration: 5.6,
  fields: [
    { key: 'phrase', label: 'Statement (one word per beat)', default: 'Think. Build. Ship. Repeat.' },
    { key: 'handle', label: 'Handle', default: '@northlab' },
  ],
  variants: [
    { name: 'Electric', palette: 'electric', fonts: 'archivo', format: 'story' },
    { name: 'Noir', palette: 'noir', fonts: 'anton', format: 'square', copy: { phrase: 'Less noise. More signal.', handle: '@quietco' } },
    { name: 'Paper', palette: 'paper', fonts: 'editorial', format: 'portrait', copy: { phrase: 'Read. Pause. Reflect. Begin.', handle: '@slowpages' } },
    { name: 'Cyber', palette: 'cyber', fonts: 'unbounded', format: 'landscape', copy: { phrase: 'Dream it. Code it. Ship it.', handle: '@nightshift.dev' } },
  ],
  build(x) {
    const { u, W, H, p, cx, cy } = x;
    const words = x.c.phrase.split(/\s+/).filter(Boolean).slice(0, 8);
    if (!words.length) words.push('Hello.');
    const N = words.length;
    const T0 = 0.15;
    const s = Math.min(0.66, Math.max(0.36, 2.8 / N));
    const tS = T0 + N * s;
    const m = x.pick({ landscape: 7 * u, default: 6.5 * u });
    const beats = [
      { bg: p.bg, fg: p.fg, mute: p.muted },
      { bg: p.accent, fg: p.onAccent, mute: alpha(p.onAccent, 0.7) },
      { bg: p.fg, fg: p.bg, mute: alpha(p.bg, 0.65) },
    ];
    const beat = (i: number) => beats[i % 3];
    const byBeat = (pick: (b: (typeof beats)[number]) => string, final: string) =>
      steps<string>(pick(beat(0)), ...words.map((_, i) => [T0 + i * s, pick(beat(i))] as [number, string]), [tS, final]);

    const layers: Layer[] = [];

    // Solo beats: each word owns the stage for one beat.
    words.forEach((w, i) => {
      const a = T0 + i * s;
      const b = a + s;
      const bt = beat(i);
      if (i % 3 !== 0) layers.push(rect(`beat-${i}`, { x: 0, y: 0, ax: 0, ay: 0, w: W, h: H, fill: bt.bg, start: a, end: b }));
      const fit = fitTitle(x, w, { maxW: W - m * 3.4, max: x.pick({ landscape: 30 * u, story: 30 * u, default: 27 * u }), wrap: false });
      const fromBig = i % 2 === 0;
      layers.push(
        x.title(`solo-${i}`, w, {
          size: fit.size,
          x: cx,
          y: cy,
          fill: bt.fg,
          start: a,
          end: b,
          scale: k([a, fromBig ? 1.55 : 0.62], [a + 0.42, 1, 'outExpo'], [b, fromBig ? 0.965 : 1.035, 'linear']),
          blur: k([a, 14], [a + 0.26, 0, 'outCubic']),
          opacity: k([a, 0], [a + 0.07, 1, 'linear']),
        }),
      );
    });

    // Final stacked statement, one layer per word so the last word can carry the accent.
    const f = displayFont(x);
    const lh = 1.0;
    const top0 = m + 8 * u;
    const bot0 = H - m - 9 * u;
    const fit = fitTitle(x, words.join(' '), {
      maxW: W - 2 * m - 2 * u,
      maxH: bot0 - top0,
      max: x.pick({ landscape: 15 * u, story: 22 * u, default: 17 * u }),
      lineHeight: lh,
    });
    const tr = x.f.displayTracking;
    const sp = spaceWidth(f, fit.px, tr);
    const lineH = fit.px * lh;
    const blockTop = top0 + (bot0 - top0 - fit.h) / 2;
    let idx = 0;
    let lastX = m;
    let lastW = 0;
    let lastTop = blockTop;
    fit.lines.forEach((ln, li) => {
      let ox = 0;
      for (const w of ln.split(' ').filter(Boolean)) {
        const ww = runWidth(f, w, fit.px, tr);
        const isLast = idx === N - 1;
        layers.push(
          x.title(`stack-${idx}`, w, {
            size: fit.size,
            x: m + ox,
            y: blockTop + li * lineH,
            ax: 0,
            ay: 0,
            align: 'left',
            lineHeight: lh,
            fill: isLast ? p.accent : p.fg,
            start: tS,
            anim: ta.rise(tS + 0.04 + idx * 0.07, { by: 'char', stagger: 0.022, dur: 0.8 }),
          }),
        );
        if (isLast) {
          lastX = m + ox;
          lastW = ww;
          lastTop = blockTop + li * lineH;
        }
        ox += ww + sp;
        idx++;
      }
    });
    layers.push(
      rect('underline', {
        x: lastX,
        y: lastTop + lineH + 0.8 * u,
        ax: 0,
        ay: 0,
        w: tween(0, lastW, tS + 0.45 + N * 0.07, 0.8, 'outExpo'),
        h: Math.max(0.7 * u, fit.px * 0.055),
        radius: 0.4 * u,
        fill: p.accent,
        start: tS,
      }),
    );

    // Chrome: handle, beat counter and progress — colours follow each beat.
    const chromeY = m + 1.2 * u;
    layers.push(
      x.body('handle', x.c.handle, {
        size: 2.6 * u,
        weight: 700,
        x: m,
        y: chromeY,
        ax: 0,
        align: 'left',
        fill: byBeat((b) => b.fg, p.fg),
        opacity: fadeIn(0.05, 0.4),
      }),
      x.body('count', '', {
        size: 2.6 * u,
        weight: 600,
        x: W - m,
        y: chromeY,
        ax: 1,
        align: 'right',
        tracking: 0.06,
        fill: byBeat((b) => b.mute, p.muted),
        counter: { from: 0.5, to: N + 0.49, start: T0, dur: N * s, ease: 'linear', decimals: 0, prefix: '0', suffix: ` / 0${N}`, separator: false },
        opacity: fadeIn(0.05, 0.4),
      }),
      rect('track', { x: m, y: H - m, ax: 0, w: W - 2 * m, h: 0.45 * u, radius: 0.22 * u, fill: byBeat((b) => alpha(b.fg, 0.2), alpha(p.fg, 0.14)) }),
      rect('progress', { x: m, y: H - m, ax: 0, w: k([T0, 0], [tS, W - 2 * m, 'linear']), h: 0.45 * u, radius: 0.22 * u, fill: byBeat((b) => b.fg, p.accent) }),
    );
    return { layers };
  },
};

// ------------------------------------------------------------------ Echo Stack

const echoStack: Recipe = {
  id: 'echo-stack',
  name: 'Echo Stack',
  category: 'text',
  tags: ['text', 'outline', 'repeat', 'stack', 'marquee', 'bold', 'poster'],
  description: 'One word echoed across five outline rows that glide in alternate directions; the centre row fills solid.',
  duration: 5,
  fields: [
    { key: 'word', label: 'Word', default: 'FOCUS' },
    { key: 'caption', label: 'Caption', default: 'Deep work season · 2027' },
  ],
  variants: [
    { name: 'Noir', palette: 'noir', fonts: 'anton', format: 'square' },
    { name: 'Sunset', palette: 'sunset', fonts: 'archivo', format: 'story', copy: { word: 'SUMMER', caption: 'Drop 03 · Out Friday' } },
    { name: 'Midnight', palette: 'midnight', fonts: 'unbounded', format: 'landscape', copy: { word: 'FUTURE', caption: 'Tech summit · Lisbon' } },
    { name: 'Citrus', palette: 'citrus', fonts: 'syne', format: 'portrait', copy: { word: 'LOUDER', caption: 'New album · out now' } },
  ],
  build(x) {
    const { u, W, H, p, cx, cy } = x;
    const word = (x.c.word.trim() || 'FOCUS').toUpperCase().slice(0, 16);
    const f = displayFont(x);
    const ds = x.f.displayScale;
    const tr = Math.max(0.01, x.f.displayTracking + 0.03);
    const vm = vmetrics(f);
    const wEm = runWidth(f, word, 1, tr);
    const maxCopyW = x.pick({ landscape: W * 0.5, story: W * 0.9, default: W * 0.84 });
    const stackH = x.pick({ landscape: H * 0.72, story: H * 0.7, portrait: H * 0.7, default: H * 0.7 });
    const pitchK = vm.cap + 0.17;
    const px = Math.min(maxCopyW / wEm, stackH / (4 * pitchK + vm.cap), 40 * u);
    const pitch = Math.min(px * pitchK * (x.isStory ? 2.1 : 1.6), Math.max(px * pitchK, (stackH - vm.cap * px) / 4));
    const copyW = wEm * px;
    const pitchX = copyW + spaceWidth(f, px, tr);
    const shift = pitchX * 1.5;
    const reps = 2 * Math.ceil((W / 2 + shift) / pitchX + 0.5) + 1;
    const rowText = Array(reps).fill(word).join(' ');
    const capOff = capShift(f, px);
    const capY = x.pick({ landscape: H - 7 * u, default: H - 8 * u });
    const stackCy = Math.min(cy - 2 * u, capY - 7 * u - 2 * pitch - (vm.cap * px) / 2);
    const sw = Math.max(1.4, px * 0.016);
    const ease: [number, number, number, number] = [0.12, 0.85, 0.2, 1];

    const layers: Layer[] = [];
    const rowX = (r: number) => {
      const d = r % 2 === 0 ? -1 : 1;
      const delay = Math.abs(r - 2) * 0.09;
      return k([0, cx + d * shift], [3.9 + delay, cx, ease]);
    };
    // Outline = double-width stroke underneath + background-coloured fill on top. This keeps the
    // outline clean on variable fonts whose glyphs have overlapping contours.
    for (let r = 0; r < 5; r++) {
      const dist = Math.abs(r - 2);
      const common = {
        size: px / ds,
        x: rowX(r),
        y: stackCy + (r - 2) * pitch - capOff,
        tracking: tr,
        lineHeight: 1.02,
        opacity: fadeIn(dist * 0.06, 0.5),
      };
      layers.push(
        x.title(`row-${r}`, rowText, {
          ...common,
          fill: 'transparent',
          stroke: dist === 0 ? p.accent : alpha(p.fg, dist === 1 ? 0.8 : 0.38),
          strokeWidth: sw * 2,
        }),
        x.title(`row-${r}-cut`, rowText, { ...common, fill: p.bg }),
      );
    }
    const wipeT = 1.45;
    const wipeD = 1.0;
    const wipeE: [number, number, number, number] = [0.65, 0, 0.35, 1];
    layers.push(
      group(
        'mid-solid',
        [
          x.title('row-solid', rowText, {
            size: px / ds,
            x: rowX(2),
            y: stackCy - capOff,
            tracking: tr,
            lineHeight: 1.02,
            fill: p.accent,
          }),
        ],
        {
          x: 0,
          y: 0,
          w: W,
          h: H,
          ax: 0,
          ay: 0,
          mask: { shape: 'rect', x: 0, y: stackCy - pitch / 2, w: k([wipeT, 0], [wipeT + wipeD, W, wipeE]), h: pitch },
        },
      ),
      rect('wipe-line', {
        x: k([wipeT, 0], [wipeT + wipeD, W, wipeE]),
        y: stackCy,
        w: 0.45 * u,
        h: Math.min(pitch * 1.25, vm.cap * px * 1.5),
        fill: p.fg,
        opacity: k([wipeT - 0.05, 0], [wipeT + 0.1, 1], [wipeT + wipeD - 0.15, 1], [wipeT + wipeD + 0.1, 0]),
      }),
    );

    const capFit = fitBody(x, x.c.caption, { maxW: W - 2 * 8 * u - 18 * u, max: x.isStory ? 3.2 * u : 2.7 * u, weight: 700, tracking: 0.2, upper: true, maxLines: 1 });
    const capW = capFit.w;
    layers.push(
      x.body('caption', x.c.caption, {
        size: capFit.size,
        weight: 700,
        uppercase: true,
        tracking: 0.2,
        y: capY,
        fill: p.fg,
        anim: ta.blur(1.9, { stagger: 0.07 }),
      }),
      rect('cap-l', { x: cx - capW / 2 - 2.5 * u, y: capY, ax: 1, w: tween(0, 6 * u, 2.1, 0.8), h: 0.3 * u, fill: p.accent }),
      rect('cap-r', { x: cx + capW / 2 + 2.5 * u, y: capY, ax: 0, w: tween(0, 6 * u, 2.1, 0.8), h: 0.3 * u, fill: p.accent }),
    );
    return { layers };
  },
};

// ------------------------------------------------------------------ Terminal Type

const terminalType: Recipe = {
  id: 'terminal-type',
  name: 'Terminal Type',
  category: 'text',
  tags: ['text', 'typewriter', 'terminal', 'code', 'developer', 'launch', 'tech'],
  description: 'A command types into a terminal with a live caret, the build runs, and your headline types itself out.',
  duration: 6.5,
  fields: [
    { key: 'headline', label: 'Headline', default: 'Shipped.' },
    { key: 'prompt', label: 'Folder', default: '~/studio' },
    { key: 'command', label: 'Command', default: 'npm run launch' },
    { key: 'out1', label: 'Output line 1', default: 'Built 128 modules in 1.4s' },
    { key: 'out2', label: 'Output line 2', default: 'Live in 3 regions' },
  ],
  variants: [
    { name: 'Noir', palette: 'noir', fonts: 'mono', format: 'landscape' },
    {
      name: 'Midnight',
      palette: 'midnight',
      fonts: 'space',
      format: 'story',
      copy: { headline: 'Deploy on a Friday? Sure.', prompt: '~/app', command: 'git push origin main', out1: 'All 214 tests passed', out2: 'Preview ready in 9s' },
    },
    {
      name: 'Arctic',
      palette: 'arctic',
      fonts: 'manrope',
      format: 'square',
      copy: { headline: 'Hello, world.', prompt: '~', command: 'create studio --fast', out1: 'Workspace ready', out2: 'Invites sent to 4 people' },
    },
    {
      name: 'Forest',
      palette: 'forest',
      fonts: 'sora',
      format: 'portrait',
      copy: { headline: 'Your build is green.', prompt: '~/core', command: 'make release', out1: 'Signed and notarised', out2: 'v2.4.0 published' },
    },
  ],
  build(x) {
    const { u, W, H, p, cx, cy } = x;
    const light = isLight(p.bg);
    const win = light ? p.fg : p.surface;
    const ink = light ? p.bg : p.fg;
    const inkMuted = alpha(ink, 0.55);
    const acc = light ? shade(p.accent, 0.3) : p.accent;
    const L = x.isLandscape;
    const m = x.pick({ landscape: 8 * u, default: 7 * u });
    const ww = x.pick({ landscape: 98 * u, story: 88 * u, default: 86 * u });

    // Code size, shrunk if any line would overflow the window.
    const bf = bodyFont(x);
    let cs = x.pick({ landscape: 3.3 * u, story: 4.3 * u, portrait: 3.9 * u, default: 3.5 * u });
    const promptStr = `${x.c.prompt} $`;
    const measureNeed = (sz: number) =>
      Math.max(
        runWidth(bf, promptStr, sz) + spaceWidth(bf, sz) + runWidth(bf, x.c.command, sz) + sz * 0.9,
        sz * 1.9 + runWidth(bf, x.c.out1, sz),
        sz * 1.9 + runWidth(bf, x.c.out2, sz),
      );
    const padX = cs * 1.5;
    const need = measureNeed(cs);
    if (need > ww - padX * 2) cs *= (ww - padX * 2) / need;
    const lineH = cs * 1.9;
    const barH = cs * 2.3;
    const wh = barH + cs * 1.0 + 4 * lineH + cs * 0.6;

    // Headline (typed, display face).
    const df = displayFont(x);
    const hlW = L ? W - ww - m * 2 - 6 * u : ww;
    const hFit = fitTitle(x, x.c.headline, {
      maxW: hlW,
      maxLines: L ? 3 : 3,
      maxH: L ? H * 0.6 : x.pick({ story: H * 0.3, portrait: H * 0.27, default: H * 0.22 }),
      max: x.pick({ landscape: 15 * u, story: 16 * u, portrait: 13 * u, default: 11 * u }),
      lineHeight: 1.04,
      balance: !L,
    });
    const gap = x.pick({ landscape: 0, story: 8 * u, default: 6 * u });
    const winLeft = L ? W - m - ww : cx - ww / 2;
    const winTop = L ? cy - wh / 2 : cy - (hFit.h + gap + wh) / 2 + hFit.h + gap + x.pick({ story: 2 * u, default: 0 });
    const hx = L ? m : winLeft;
    const hy = L ? cy - hFit.h / 2 : winTop - gap - hFit.h;

    // Timeline
    const ncCmd = Math.max(1, nonSpace(x.c.command));
    const tc0 = 0.95;
    const tc1 = tc0 + Math.min(1.3, Math.max(0.5, ncCmd * 0.055));
    const tC = tc1 + 0.25;
    const tB0 = tC + 0.05;
    const tB1 = tB0 + 0.9;
    const tO1 = tB1 + 0.1;
    const tO2 = tO1 + 0.28;
    const ncH = Math.max(1, nonSpace(x.c.headline));
    const tH0 = tO2 + 0.45;
    const tH1 = tH0 + Math.min(1.3, Math.max(0.45, ncH * 0.06));

    // Window content (window-box space).
    const rowY = (i: number) => barH + cs * 1.0 + lineH * (i + 0.5);
    const promptW = runWidth(bf, promptStr, cs);
    const cmdX = padX + promptW + spaceWidth(bf, cs);
    const cmdStops = caretStops(bf, [x.c.command], cs, 0);
    const caretX = steps<number>(cmdX + cs * 0.12, ...cmdStops.map((st, j) => [tc0 + ((j + 1) / ncCmd) * (tc1 - tc0), cmdX + st.x + cs * 0.12] as [number, number]));
    const caretOn: [number, number][] = [];
    for (let t = 0.75, on = false; t < tc0; t += 0.36, on = !on) caretOn.push([t, on ? 1 : 0]);
    const trackW = (ww - padX * 2) * 0.58;
    const outRow = (i: number, id: string, s: string, t: number): Layer[] => [
      path(`${id}-icon`, ICONS.check, 24, 24, {
        x: padX + cs * 0.6,
        y: rowY(i),
        w: cs * 1.15,
        h: cs * 1.15,
        stroke: acc,
        strokeWidth: 2.8,
        trimEnd: k([t, 0], [t + 0.35, 1, 'outCubic']),
      }),
      x.body(`${id}-text`, s, {
        size: cs,
        x: k([t, padX + cs * 1.9 - 1.2 * u], [t + 0.4, padX + cs * 1.9, 'outExpo']),
        y: rowY(i),
        ax: 0,
        align: 'left',
        fill: alpha(ink, 0.92),
        opacity: fadeIn(t, 0.25),
      }),
    ];
    const winChildren: Layer[] = [
      rect('win-bg', {
        x: 0,
        y: 0,
        ax: 0,
        ay: 0,
        w: ww,
        h: wh,
        radius: 1.8 * u,
        fill: win,
        stroke: alpha(ink, 0.1),
        strokeWidth: 0.15 * u,
        shadow: { color: alpha(shade(win, -0.6), light ? 0.28 : 0.55), blur: 6 * u, y: 2.5 * u },
      }),
      rect('win-rule', { x: 0, y: barH, ax: 0, ay: 0, w: ww, h: Math.max(1, 0.12 * u), fill: alpha(ink, 0.08) }),
      ...[0, 1, 2].map((i) => circle(`win-dot-${i}`, cs * 0.32, { x: padX * 0.75 + i * cs * 1.05, y: barH / 2, fill: alpha(ink, 0.22) })),
      x.body('win-title', `${x.c.prompt} — zsh`, { size: cs * 0.78, x: ww / 2, y: barH / 2, fill: alpha(ink, 0.4) }),
      x.body('prompt', promptStr, { size: cs, x: padX, y: rowY(0), ax: 0, align: 'left', fill: acc, opacity: fadeIn(0.55, 0.2) }),
      x.body('cmd', x.c.command, { size: cs, x: cmdX, y: rowY(0), ax: 0, align: 'left', fill: ink, reveal: k([tc0, 0], [tc1, 1, 'linear']) }),
      rect('caret', {
        x: caretX,
        y: rowY(0),
        ax: 0,
        w: cs * 0.55,
        h: cs * 1.2,
        radius: cs * 0.06,
        fill: acc,
        start: 0.6,
        end: tC,
        opacity: steps<number>(1, ...caretOn, [tc0, 1]),
      }),
      rect('bar-track', { x: padX, y: rowY(1), ax: 0, w: trackW, h: cs * 0.55, radius: cs * 0.275, fill: alpha(ink, 0.12), opacity: fadeIn(tB0 - 0.1, 0.2) }),
      rect('bar-fill', { x: padX, y: rowY(1), ax: 0, w: k([tB0, 0], [tB1, trackW, 'inOutCubic']), h: cs * 0.55, radius: cs * 0.275, fill: acc }),
      x.body('pct', '', {
        size: cs,
        x: padX + trackW + cs * 1.2,
        y: rowY(1),
        ax: 0,
        align: 'left',
        fill: inkMuted,
        counter: { from: 0, to: 100, start: tB0, dur: tB1 - tB0, ease: 'inOutCubic', suffix: '%' },
        opacity: fadeIn(tB0 - 0.1, 0.2),
      }),
      ...outRow(2, 'out1', x.c.out1, tO1),
      ...outRow(3, 'out2', x.c.out2, tO2),
    ];

    // Headline caret follows the typed characters across wrapped lines.
    const tr = x.f.displayTracking;
    const lh = hFit.px * 1.04;
    const hStops = caretStops(df, hFit.lines, hFit.px, tr);
    const capC = (li: number) => hy + li * lh + lh / 2 + capShift(df, hFit.px);
    const hCaretX = steps<number>(hx, ...hStops.map((st, j) => [tH0 + ((j + 1) / ncH) * (tH1 - tH0), hx + st.x + hFit.px * 0.06] as [number, number]));
    const hCaretY = steps<number>(capC(0), ...hStops.map((st, j) => [tH0 + ((j + 1) / ncH) * (tH1 - tH0), capC(st.line)] as [number, number]));
    const hOn: [number, number][] = [];
    for (let t = tH1 + 0.3, on = false; t < 9; t += 0.42, on = !on) hOn.push([t, on ? 1 : 0]);

    return {
      background: radial(0.5, 0.5, 0.9, p.bg, light ? p.bg2 : shade(p.bg, -0.2)),
      layers: [
        circle('glow', x.pick({ landscape: 60 * u, default: 70 * u }), {
          x: winLeft + ww / 2,
          y: winTop + wh / 2,
          fill: radial(0.5, 0.5, 0.7, alpha(p.accent, light ? 0.16 : 0.13), alpha(p.accent, 0)),
          opacity: fadeIn(0.1, 1.2),
        }),
        group('window', winChildren, {
          x: winLeft + ww / 2,
          y: winTop + wh / 2,
          w: ww,
          h: wh,
          scale: k([0.05, 0.94], [0.75, 1, 'outExpo']),
          opacity: fadeIn(0.05, 0.35),
        }),
        x.title('headline', x.c.headline, {
          size: hFit.size,
          x: hx,
          y: hy,
          ax: 0,
          ay: 0,
          w: hFit.wrapW,
          align: 'left',
          lineHeight: 1.04,
          reveal: k([tH0, 0], [tH1, 1, 'linear']),
        }),
        rect('hcaret', {
          x: hCaretX,
          y: hCaretY,
          ax: 0,
          w: Math.max(0.5 * u, hFit.px * 0.07),
          h: vmetrics(df).cap * hFit.px * 1.3,
          fill: p.accent,
          start: tH0 - 0.15,
          opacity: steps<number>(1, ...hOn),
        }),
      ],
    };
  },
};

// ------------------------------------------------------------------ Number Window

const numberWindow: Recipe = {
  id: 'number-window',
  name: 'Number Window',
  category: 'text',
  tags: ['text', 'number', 'mask', 'countdown', 'big type', 'stat', 'poster'],
  description: 'A colour block slides in and becomes a window: the giant number turns solid inside it and stays an outline outside.',
  duration: 5,
  fields: [
    { key: 'big', label: 'Big number / word', default: '07' },
    { key: 'eyebrow', label: 'Eyebrow', default: 'Only' },
    { key: 'label', label: 'Label', default: 'days until launch' },
    { key: 'brand', label: 'Brand', default: 'Northwind Studio' },
  ],
  variants: [
    { name: 'Electric', palette: 'electric', fonts: 'grotesk', format: 'story' },
    { name: 'Royal', palette: 'royal', fonts: 'fraunces', format: 'square', copy: { big: '24', eyebrow: 'Open', label: 'hours, every day', brand: 'Common Room' } },
    { name: 'Mint', palette: 'mint', fonts: 'outfit', format: 'portrait', copy: { big: '50%', eyebrow: 'Up to', label: 'off everything green', brand: 'Leaf & Loam' } },
    { name: 'Graphite', palette: 'graphite', fonts: 'space', format: 'landscape', copy: { big: '2027', eyebrow: 'Roadmap', label: 'what we’re building next', brand: 'Fieldwork' } },
  ],
  build(x) {
    const { u, W, H, p, cx, cy } = x;
    const big = (x.c.big.trim() || '07').toUpperCase().slice(0, 10);
    const f = displayFont(x);
    const ds = x.f.displayScale;
    const tr = x.f.displayTracking;
    const vm = vmetrics(f);
    const wEm = runWidth(f, big, 1, tr);
    // The card hugs the number horizontally and crops it top and bottom.
    const cwMax = x.pick({ landscape: 104 * u, story: 86 * u, portrait: 82 * u, square: 74 * u, default: 78 * u });
    const chMax = x.pick({ landscape: 46 * u, story: 64 * u, portrait: 52 * u, square: 40 * u, default: 46 * u });
    const crop = 0.78;
    const padK = 0.08;
    const px = Math.min(cwMax / (wEm + padK * 2), chMax / (vm.cap * crop), 90 * u);
    const cw = (wEm + padK * 2) * px;
    const ch = vm.cap * px * crop;
    const rad = 1.6 * u;

    const labelW = Math.max(cw, 64 * u);
    const labelFit = fitTitle(x, x.c.label, {
      maxW: labelW,
      maxLines: 2,
      max: x.pick({ landscape: 6 * u, story: 8.5 * u, default: 7 * u }),
      lineHeight: 1.05,
      balance: true,
    });
    const eyeSize = x.pick({ story: 3.4 * u, default: 2.8 * u });
    const eyeH = eyeSize * 1.2;
    const g1 = x.pick({ story: 6 * u, default: 4.5 * u });
    const g2 = x.pick({ story: 6.5 * u, default: 5 * u });
    const total = eyeH + g1 + ch + g2 + labelFit.h;
    const brandY = H - x.pick({ landscape: 6 * u, default: 7 * u });
    const top = Math.min(cy - total / 2 - x.pick({ story: 4 * u, default: 0 }), brandY - 7 * u - total);
    const cardTop = top + eyeH + g1;
    const cardY = cardTop + ch / 2;
    const cardLeft = cx - cw / 2;
    const numY = cardY - capShift(f, px);
    const numX = k([0, cx + 6 * u], [2.8, cx, [0.2, 0.9, 0.3, 1]]);
    const inE: [number, number, number, number] = [0.7, 0, 0.2, 1];
    const t0 = 0.3;
    const t1 = 1.4;
    const leftT = k([t0, -cw - 6 * u], [t1, cardLeft, inE]);
    const off = 1.6 * u;

    return {
      background: p.bg,
      layers: [
        circle('halo', Math.max(cw, ch) * 0.75, {
          x: cx,
          y: cardY,
          fill: radial(0.5, 0.5, 0.7, alpha(p.bg2, 0.9), alpha(p.bg2, 0)),
          scale: k([0, 0.6], [2.2, 1, 'outCubic']),
        }),
        // Faint ghost: shows the number outside the sliding window, then dissolves once the card lands.
        x.title('num-ghost', big, {
          size: px / ds,
          x: numX,
          y: numY,
          fill: alpha(p.fg, 0.1),
          opacity: k([0, 0], [0.45, 1, 'outCubic'], [t1 + 0.1, 1], [t1 + 0.7, 0, 'inOutSine']),
        }),
        rect('frame', {
          x: k([t0 + 0.12, -cw - 6 * u + off], [t1 + 0.16, cardLeft + off, inE]),
          y: cardTop + off,
          ax: 0,
          ay: 0,
          w: cw,
          h: ch,
          radius: rad,
          stroke: alpha(p.fg, 0.6),
          strokeWidth: Math.max(1.2, 0.16 * u),
        }),
        group(
          'card',
          [
            rect('card-fill', { x: 0, y: 0, ax: 0, ay: 0, w: W, h: H, fill: linear(115, p.accent, shade(p.accent, -0.12)) }),
            x.title('num-solid', big, { size: px / ds, x: numX, y: numY, fill: p.onAccent }),
          ],
          { x: 0, y: 0, w: W, h: H, ax: 0, ay: 0, mask: { shape: 'rect', x: leftT, y: cardTop, w: cw, h: ch, r: rad } },
        ),
        x.body('eyebrow', x.c.eyebrow, {
          size: eyeSize,
          weight: 700,
          uppercase: true,
          tracking: 0.24,
          y: top + eyeH / 2,
          fill: p.accent,
          anim: ta.chars(1.2, { stagger: 0.035 }),
        }),
        x.title('label', x.c.label, {
          size: labelFit.size,
          y: cardTop + ch + g2,
          ay: 0,
          w: labelFit.wrapW,
          lineHeight: 1.05,
          anim: ta.rise(1.45, { stagger: 0.06 }),
        }),
        x.body('brand', x.c.brand, { size: 2.4 * u, weight: 600, uppercase: true, tracking: 0.2, y: brandY, fill: p.muted, opacity: fadeIn(2.0, 0.6) }),
      ],
    };
  },
};

// ------------------------------------------------------------------ Split Tone Headline

const splitTone: Recipe = {
  id: 'split-tone',
  name: 'Split Tone Headline',
  category: 'text',
  tags: ['text', 'headline', 'invert', 'mask', 'panel', 'editorial', 'contrast'],
  description: 'A colour panel sweeps across the headline, inverting the type as it passes, and settles into a two-tone split.',
  duration: 5.5,
  fields: [
    { key: 'eyebrow', label: 'Eyebrow', default: 'Opinion' },
    { key: 'headline', label: 'Headline', default: 'Two sides to every story.', multiline: true },
    { key: 'sub', label: 'Supporting line', default: 'Read the full essay · link in bio' },
  ],
  variants: [
    { name: 'Azure', palette: 'azure', fonts: 'grotesk', format: 'portrait' },
    { name: 'Blush', palette: 'blush', fonts: 'dmserif', format: 'story', copy: { eyebrow: 'Rebrand', headline: 'Same brand. New energy.', sub: 'Our 2027 refresh, explained' } },
    { name: 'Ocean', palette: 'ocean', fonts: 'sora', format: 'landscape', copy: { eyebrow: 'Case study', headline: 'From chaos to clarity in 30 days.', sub: 'How one team rebuilt its workflow' } },
    { name: 'Lilac', palette: 'lilac', fonts: 'poppins', format: 'square', copy: { eyebrow: 'Hot take', headline: 'Fewer meetings. More making.', sub: 'Agree or disagree?' } },
  ],
  build(x) {
    const { u, W, H, p, cx, cy } = x;
    const m = x.pick({ landscape: 12 * u, default: 8 * u });
    const lh = 1.0;
    const fit = fitTitle(x, x.c.headline, {
      maxW: W - 2 * m,
      maxLines: x.pick({ landscape: 3, story: 5, default: 4 }),
      maxH: x.pick({ landscape: H * 0.52, story: H * 0.5, default: H * 0.56 }),
      max: x.pick({ landscape: 12.5 * u, story: 16 * u, default: 13 * u }),
      lineHeight: lh,
      balance: true,
    });
    const subFit = fitBody(x, x.c.sub, { maxW: W - 2 * m, max: x.pick({ landscape: 3.2 * u, story: 4 * u, default: 3.5 * u }), maxLines: 2 });
    const eyeY = cy - fit.h / 2 - 7 * u;
    const subY = cy + fit.h / 2 + 5 * u;
    const copyOf = (id: string, c: { eye: string; head: string; sub: string; dot: string }): Layer[] => [
      rect(`${id}-dot`, { x: cx, y: eyeY - 4.2 * u, w: 1.2 * u, h: 1.2 * u, radius: 0.6 * u, fill: c.dot, scale: k([0.1, 0], [0.6, 1, 'outBack']) }),
      x.body(`${id}-eyebrow`, x.c.eyebrow, {
        size: 2.8 * u,
        weight: 700,
        uppercase: true,
        tracking: 0.22,
        y: eyeY,
        fill: c.eye,
        anim: ta.chars(0.15, { stagger: 0.03 }),
      }),
      x.title(`${id}-headline`, x.c.headline, {
        size: fit.size,
        y: cy,
        w: fit.wrapW,
        lineHeight: lh,
        fill: c.head,
        anim: ta.riseLines(0.3, { stagger: 0.12, dur: 1.0 }),
      }),
      x.body(`${id}-sub`, x.c.sub, {
        size: subFit.size,
        y: subY,
        ay: 0,
        w: W - 2 * m,
        fill: c.sub,
        anim: ta.blur(0.9, { stagger: 0.04 }),
      }),
    ];

    const e1: [number, number, number, number] = [0.76, 0, 0.24, 1];
    const a0 = 1.25;
    const a1 = 2.05;
    const b0 = 2.45;
    const b1 = 3.35;
    // The panel sweeps in from the left, covers the frame, then its leading edge retreats to the centre
    // so the headline ends split down the middle.
    const mask = { shape: 'rect' as const, x: k([b0, 0], [b1, cx, e1]), y: 0, w: k([a0, 0], [a1, W, e1], [b0, W], [b1, W - cx, e1]), h: H };
    const edge = rect('edge', {
      x: k([a0, 0], [a1, W, e1], [b0, 0], [b1, cx, e1]),
      y: cy,
      w: 0.35 * u,
      h: H,
      fill: p.accent2,
      opacity: k([a0, 0], [a0 + 0.1, 1], [a1, 1], [a1 + 0.05, 0], [b0, 0], [b0 + 0.1, 1], [b1 - 0.1, 1], [b1 + 0.4, 0]),
    });

    return {
      layers: [
        ...copyOf('a', { eye: p.accent, head: p.fg, sub: p.muted, dot: p.accent }),
        group(
          'panel',
          [
            rect('panel-fill', { x: 0, y: 0, ax: 0, ay: 0, w: W, h: H, fill: linear(0, p.accent, shade(p.accent, -0.12)) }),
            ...copyOf('b', { eye: alpha(p.onAccent, 0.8), head: p.onAccent, sub: alpha(p.onAccent, 0.78), dot: p.onAccent }),
          ],
          { x: 0, y: 0, w: W, h: H, ax: 0, ay: 0, mask },
        ),
        edge,
      ],
    };
  },
};

export const textRecipes: Recipe[] = [wordByWord, echoStack, terminalType, numberWindow, splitTone];

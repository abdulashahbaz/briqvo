import type { Layer } from '../../../engine/types';
import type { Ctx } from '../../kit';
import { type Recipe, rect, circle, group, k, tween, fadeIn, pop, ta, alpha, lerpColor, linear } from '../../kit';
import { chip, chipW, dots, fadeUp, glow, icon, seamLine, shadowCol, slideX, swipeCue } from './shared';

/** Mock web page used on the before/after slides (card-local layers). */
function mockPage(x: Ctx, id: string, w: number, state: 'before' | 'after'): Layer[] {
  const { u, p } = x;
  const L: Layer[] = [];
  if (state === 'before') {
    L.push(
      rect(`${id}-logo`, { x: 5 * u, y: 14 * u, ax: 0, w: 3.6 * u, h: 3.6 * u, radius: 0.8 * u, fill: alpha(p.fg, 0.16) }),
      ...[0, 1, 2].map((j) => rect(`${id}-nav${j}`, { x: w - 5 * u - j * 8 * u, y: 14 * u, ax: 1, w: 5.6 * u, h: 1.2 * u, radius: 0.6 * u, fill: alpha(p.fg, 0.13) })),
      x.body(`${id}-hl`, x.c.before, {
        size: 4.3 * u,
        x: 5 * u,
        y: 21 * u,
        w: w - 14 * u,
        ax: 0,
        ay: 0,
        align: 'left',
        lineHeight: 1.28,
        weight: 500,
        fill: lerpColor(p.fg, p.muted, 0.55),
      }),
      rect(`${id}-p1`, { x: 5 * u, y: 41.5 * u, ax: 0, w: w * 0.62, h: 1.2 * u, radius: 0.6 * u, fill: alpha(p.fg, 0.09) }),
      rect(`${id}-p2`, { x: 5 * u, y: 44.6 * u, ax: 0, w: w * 0.46, h: 1.2 * u, radius: 0.6 * u, fill: alpha(p.fg, 0.09) }),
      rect(`${id}-btn`, { x: 5 * u, y: 48.5 * u, ax: 0, ay: 0, w: 17 * u, h: 4.4 * u, radius: 0.8 * u, fill: alpha(p.fg, 0.12) }),
      x.body(`${id}-btnt`, 'Learn more', { size: 1.9 * u, x: 13.5 * u, y: 50.7 * u, weight: 600, fill: p.muted, lineHeight: 1 }),
    );
  } else {
    const bl = x.c.afterBtn;
    const bw = Math.max(18 * u, chipW(bl, 2.1 * u, { padX: 1.4 }));
    L.push(
      rect(`${id}-logo`, { x: 5 * u, y: 14 * u, ax: 0, w: 3.6 * u, h: 3.6 * u, radius: 1.8 * u, fill: p.accent }),
      ...[0, 1, 2].map((j) => rect(`${id}-nav${j}`, { x: w - 5 * u - j * 8 * u, y: 14 * u, ax: 1, w: 5.6 * u, h: 1.2 * u, radius: 0.6 * u, fill: alpha(p.fg, 0.2) })),
      x.title(`${id}-hl`, x.c.after, {
        size: 5.2 * u,
        x: 5 * u,
        y: 19.5 * u,
        w: w - 12 * u,
        ax: 0,
        ay: 0,
        align: 'left',
        lineHeight: 1.06,
      }),
      rect(`${id}-hi`, { x: 5 * u, y: 40 * u, ax: 0, w: 14 * u, h: 0.9 * u, radius: 0.45 * u, fill: p.accent }),
      chip(x, `${id}-btn`, bl, { x: 5 * u, y: 48.3 * u, size: 2.1 * u, fill: p.accent, color: p.onAccent, padX: 1.4, minW: bw }),
      x.body(`${id}-note`, 'No card needed', { size: 1.9 * u, x: 5 * u + bw + 2.6 * u, y: 48.3 * u, ax: 0, align: 'left', weight: 500, fill: p.muted, lineHeight: 1 }),
    );
  }
  return L;
}

function chrome(x: Ctx, id: string, w: number, h: number): Layer[] {
  const { u, p } = x;
  return [
    rect(`${id}-bg`, { x: 0, y: 0, ax: 0, ay: 0, w, h, radius: 3 * u, fill: p.surface, stroke: alpha(p.fg, 0.08), strokeWidth: 0.2 * u, shadow: { color: shadowCol(p, 0.22), blur: 6 * u, y: 2 * u } }),
    ...[0, 1, 2].map((j) => circle(`${id}-dot${j}`, 0.75 * u, { x: 4 * u + j * 2.6 * u, y: 4.2 * u, fill: alpha(p.fg, 0.18) })),
    rect(`${id}-url`, { x: w / 2, y: 4.2 * u, w: 28 * u, h: 2.8 * u, radius: 1.4 * u, fill: alpha(p.fg, 0.06) }),
    rect(`${id}-div`, { x: 0, y: 8.4 * u, ax: 0, w, h: 0.2 * u, fill: alpha(p.fg, 0.08) }),
  ];
}

export const beforeAfter: Recipe = {
  id: 'carousel-before-after',
  name: 'Before / After Rewrite',
  category: 'carousel',
  tags: ['carousel', 'before after', 'makeover', 'copywriting', 'transformation', 'educational'],
  description: 'A before slide and an after slide joined by an arrow across the seam, with a live wipe that rewrites the page.',
  duration: 5.5,
  slides: 5,
  fields: [
    { key: 'brand', label: 'Brand name', default: 'Copy Clinic' },
    { key: 'handle', label: 'Handle', default: '@copyclinic' },
    { key: 'kicker', label: 'Cover kicker', default: 'Headline makeover' },
    { key: 'title', label: 'Cover title', default: 'From vague to vivid in one rewrite', multiline: true },
    { key: 'before', label: 'Before copy', default: 'We leverage innovative solutions to empower your business growth.', multiline: true },
    { key: 'after', label: 'After copy', default: 'Send invoices in 30 seconds. Get paid twice as fast.', multiline: true },
    { key: 'afterBtn', label: 'After button', default: 'Start free trial' },
    { key: 'bad1', label: 'Problem 1', default: 'Jargon nobody searches for' },
    { key: 'bad2', label: 'Problem 2', default: 'No clear benefit' },
    { key: 'bad3', label: 'Problem 3', default: 'Could be any company' },
    { key: 'good1', label: 'Win 1', default: 'Plain words people actually use' },
    { key: 'good2', label: 'Win 2', default: 'A concrete, measurable result' },
    { key: 'good3', label: 'Win 3', default: 'Only this product can say it' },
    { key: 'fixTitle', label: 'Fixes title', default: '3 changes that did the heavy lifting', multiline: true },
    { key: 'fix1h', label: 'Fix 1', default: 'Name the task' },
    { key: 'fix1b', label: 'Fix 1 detail', default: 'Say what the product does in the reader’s own words.' },
    { key: 'fix2h', label: 'Fix 2', default: 'Quantify the win' },
    { key: 'fix2b', label: 'Fix 2 detail', default: 'A number turns a vague promise into one people can check.' },
    { key: 'fix3h', label: 'Fix 3', default: 'Cut every buzzword' },
    { key: 'fix3b', label: 'Fix 3 detail', default: 'If a competitor could say it too, it is not your headline.' },
    { key: 'cta', label: 'Final slide title', default: 'Want a rewrite like this?', multiline: true },
    { key: 'ctaSub', label: 'Final slide line', default: 'Send us your headline. We rewrite three every Friday.', multiline: true },
    { key: 'ctaBtn', label: 'Final slide button', default: 'Send your headline' },
  ],
  variants: [
    { name: 'Arctic', palette: 'arctic', fonts: 'manrope' },
    {
      name: 'Graphite README',
      palette: 'graphite',
      fonts: 'mono',
      copy: {
        brand: 'Ship Notes',
        handle: '@shipnotes.dev',
        kicker: 'README makeover',
        title: 'Fix the first line of your README',
        before: 'This repository contains the source code for the project and related files.',
        after: 'Typed API clients in 5 minutes. Zero config.',
        afterBtn: 'npm install',
        bad1: 'Describes the repo, not the value',
        bad2: 'Zero reason to keep reading',
        bad3: 'True for every repo on earth',
        good1: 'Leads with the outcome',
        good2: 'A time-to-value you can test',
        good3: 'Removes the setup worry',
        fixTitle: '3 rules for a README that converts',
        fix1h: 'Outcome first',
        fix1b: 'Tell devs what they get before how it works.',
        fix2h: 'Promise a time',
        fix2b: '“In 5 minutes” sets an expectation you can keep.',
        fix3h: 'Kill the fear',
        fix3b: 'Answer the top objection right in the headline.',
        cta: 'Want feedback on your README?',
        ctaSub: 'Drop the repo link in the comments. We review five a week.',
        ctaBtn: 'Comment your repo',
      },
    },
    {
      name: 'Blush Bio',
      palette: 'blush',
      fonts: 'poppins',
      copy: {
        brand: 'Bio Doctor',
        handle: '@thebiodoctor',
        kicker: 'Bio makeover',
        title: 'Turn your bio into a follow magnet',
        before: 'Coffee lover. Dreamer. Mom of two. Living my best life every single day.',
        after: 'I help busy moms get dinner on the table in 20 minutes.',
        afterBtn: 'Free recipe pack',
        bad1: 'About you, not your reader',
        bad2: 'No reason to hit follow',
        bad3: 'Sounds like a million bios',
        good1: 'Names exactly who it is for',
        good2: 'Promises one clear result',
        good3: 'A freebie that earns the click',
        fixTitle: '3 tweaks that doubled my follows',
        fix1h: 'Pick one person',
        fix1b: 'Write to one reader, not to everyone at once.',
        fix2h: 'Sell the outcome',
        fix2b: 'Say what changes for them after following you.',
        fix3h: 'Add a next step',
        fix3b: 'A free download turns a visit into a subscriber.',
        cta: 'Want me to rewrite your bio?',
        ctaSub: 'Comment “BIO” and I will pick three to fix live on Friday.',
        ctaBtn: 'Comment BIO',
      },
    },
    {
      name: 'Mint Subject Lines',
      palette: 'mint',
      fonts: 'syne',
      copy: {
        brand: 'Inbox Lab',
        handle: '@inboxlab',
        kicker: 'Subject line makeover',
        title: 'Emails people actually open',
        before: 'Our March newsletter is here: news, updates and more from the team.',
        after: 'The 3-minute fix that cut our energy bill by 18%',
        afterBtn: 'Read the story',
        bad1: 'Announces, never promises',
        bad2: 'Nothing to be curious about',
        bad3: 'Looks like every other email',
        good1: 'Opens a curiosity gap',
        good2: 'A specific, believable number',
        good3: 'Time cost is crystal clear',
        fixTitle: '3 moves that lifted opens by 41%',
        fix1h: 'Tease the payoff',
        fix1b: 'Hint at the result, save the how for the email.',
        fix2h: 'Be oddly specific',
        fix2b: '18% feels researched. “Lower bills” feels like spam.',
        fix3h: 'Show the effort',
        fix3b: '“3-minute” tells readers this is worth it right now.',
        cta: 'Want 30 more subject lines?',
        ctaSub: 'Grab our swipe file free. Link is in the bio.',
        ctaBtn: 'Get the swipe file',
      },
    },
  ],
  build(x) {
    const { u, H, p, slideW: S, slides: N } = x;
    const dur = 5.5;
    const m = 9 * u;
    const L: Layer[] = [];
    const wash = lerpColor(p.bg, p.muted, 0.12);
    const cw = S - 2 * m;
    const ch = 56 * u;
    const cardY = 22 * u;

    // wash behind BEFORE that clears into AFTER across the seam
    L.push(rect('ba-wash', { x: S, y: 0, ax: 0, ay: 0, w: 2 * S, h: H, fill: linear(0, wash, wash, p.bg, p.bg), opacity: fadeIn(0, 0.6) }));

    for (let i = 0; i < N; i++) L.push(...dots(x, i, { y: 118 * u, on: p.accent, off: alpha(p.fg, 0.16) }));

    // ---------------------------------------------------------------- cover
    {
      const X = 0;
      const mw = 44 * u;
      const mh = 30 * u;
      L.push(
        glow('cv-glow', 44 * u, { x: X + S / 2, y: 36 * u, color: p.accent, a: 0.16, opacity: fadeIn(0, 1) }),
        group(
          'cv-before',
          [
            rect('cv-before-bg', { x: 0, y: 0, ax: 0, ay: 0, w: mw, h: mh, radius: 2.4 * u, fill: p.surface, stroke: alpha(p.fg, 0.1), strokeWidth: 0.2 * u, shadow: { color: shadowCol(p, 0.18), blur: 4 * u, y: 1.4 * u } }),
            x.body('cv-before-l', 'Before', { size: 2.5 * u, x: 4 * u, y: 5 * u, ax: 0, align: 'left', weight: 700, fill: p.muted, uppercase: true, tracking: 0.12, lineHeight: 1 }),
            ...[34, 30, 22].map((lw, j) => rect(`cv-before-p${j}`, { x: 4 * u, y: (11 + j * 4) * u, ax: 0, w: lw * u, h: 1.5 * u, radius: 0.75 * u, fill: alpha(p.fg, 0.12) })),
            rect('cv-before-b', { x: 4 * u, y: 24 * u, ax: 0, w: 12 * u, h: 3.4 * u, radius: 0.6 * u, fill: alpha(p.fg, 0.1) }),
          ],
          {
            x: X + S * 0.39,
            y: k([0.1, 44 * u], [0.9, 32 * u, 'outExpo']),
            w: mw,
            h: mh,
            rotation: -7,
            opacity: fadeIn(0.1, 0.4),
          },
        ),
        group(
          'cv-after',
          [
            rect('cv-after-bg', { x: 0, y: 0, ax: 0, ay: 0, w: mw, h: mh, radius: 2.4 * u, fill: p.accent, shadow: { color: shadowCol(p, 0.3), blur: 5 * u, y: 2 * u } }),
            x.body('cv-after-l', 'After', { size: 2.5 * u, x: 4 * u, y: 5 * u, ax: 0, align: 'left', weight: 700, fill: p.onAccent, uppercase: true, tracking: 0.12, lineHeight: 1 }),
            rect('cv-after-p0', { x: 4 * u, y: 11.5 * u, ax: 0, w: 32 * u, h: 2.6 * u, radius: 1.3 * u, fill: alpha(p.onAccent, 0.9) }),
            rect('cv-after-p1', { x: 4 * u, y: 16.5 * u, ax: 0, w: 22 * u, h: 2.6 * u, radius: 1.3 * u, fill: alpha(p.onAccent, 0.9) }),
            rect('cv-after-b', { x: 4 * u, y: 24 * u, ax: 0, w: 14 * u, h: 3.8 * u, radius: 1.9 * u, fill: p.onAccent }),
          ],
          {
            x: k([0.45, X + S * 0.8], [1.35, X + S * 0.61, 'outExpo']),
            y: 39 * u,
            w: mw,
            h: mh,
            rotation: k([0.45, 18], [1.45, 5, 'outBack']),
            opacity: fadeIn(0.45, 0.3),
          },
        ),
        chip(x, 'cv-kicker', x.c.kicker, {
          x: X + m,
          y: 61 * u,
          size: 2.9 * u,
          fill: alpha(p.accent, 0.12),
          color: p.accent,
          upper: true,
          tracking: 0.1,
          scale: k([0.3, 0.7], [0.9, 1, 'outBack']),
          opacity: fadeIn(0.3, 0.3),
        }),
        x.title('cv-title', x.c.title, {
          size: 10.6 * u,
          x: X + m,
          y: 66.5 * u,
          w: S - 2 * m,
          ax: 0,
          ay: 0,
          align: 'left',
          lineHeight: 1.0,
          anim: ta.riseLines(0.4, { stagger: 0.12 }),
        }),
        x.body('cv-handle', x.c.handle, { size: 3 * u, x: X + m, y: 108 * u, ax: 0, align: 'left', weight: 600, fill: p.muted, opacity: fadeIn(1.0, 0.5) }),
        swipeCue(x, 'cv-swipe', { x: X + S - m, y: 108 * u, bg: p.fg, fg: p.bg, t0: 1.0, dur }),
      );
    }

    // ---------------------------------------------------------------- BEFORE
    {
      const i = 1;
      const X = slideX(x, i);
      const lbl = 'Before';
      const bw = chipW(lbl, 2.8 * u, { upper: true, tracking: 0.12, icon: true });
      L.push(
        chip(x, 'bf-chip', lbl, {
          x: X + m,
          y: 13 * u,
          size: 2.8 * u,
          fill: alpha(p.fg, 0.08),
          color: p.muted,
          upper: true,
          tracking: 0.12,
          icon: 'close',
          opacity: fadeIn(0.1, 0.4),
          scale: k([0.1, 0.8], [0.6, 1, 'outBack']),
        }),
        // arrow from BEFORE to AFTER, crossing the seam
        ...seamLine(x, 'ba-arrow', () => 13 * u, { from: X + m + bw + 3 * u, to: X + S + m - 3.2 * u, stroke: p.accent, width: 0.5 * u, t0: 0.3, dur: 1.0 }),
        icon('ba-head', 'chev', {
          x: X + S + m - 3.6 * u,
          y: 13 * u,
          size: 4 * u,
          color: p.accent,
          sw: 2.6,
          opacity: fadeIn(1.05, 0.2),
          scale: k([1.05, 0.4], [1.4, 1, 'outBack']),
        }),
        group('bf-card', [...chrome(x, 'bf-cc', cw, ch), ...mockPage(x, 'bf-pg', cw, 'before')], {
          x: X + m,
          y: k([0.15, cardY + 8 * u], [1.0, cardY, 'outExpo']),
          w: cw,
          h: ch,
          ax: 0,
          ay: 0,
          opacity: fadeIn(0.15, 0.4),
        }),
        x.body('bf-label', 'What is wrong', { size: 2.6 * u, x: X + m, y: 85 * u, ax: 0, align: 'left', weight: 700, fill: p.muted, uppercase: true, tracking: 0.14, opacity: fadeIn(0.5, 0.4) }),
      );
      [x.c.bad1, x.c.bad2, x.c.bad3].forEach((t, r) => {
        const y = 92 * u + r * 8.6 * u;
        const t0 = 0.6 + r * 0.12;
        L.push(
          circle(`bf-ic-${r}`, 2.5 * u, { x: X + m + 2.5 * u, y, fill: alpha(p.fg, 0.08), scale: pop(t0, 0.5) }),
          icon(`bf-x-${r}`, 'close', { x: X + m + 2.5 * u, y, size: 2.8 * u, color: p.muted, sw: 2.6, scale: pop(t0 + 0.05, 0.5) }),
          x.body(`bf-t-${r}`, t, { size: 3.9 * u, x: X + m + 8 * u, y, ax: 0, align: 'left', weight: 500, fill: p.fg, anim: ta.slide(t0 + 0.05, { stagger: 0.03 }) }),
        );
      });
    }

    // ---------------------------------------------------------------- AFTER
    {
      const i = 2;
      const X = slideX(x, i);
      const wipe0 = 0.55;
      const wipe1 = 1.65;
      L.push(
        glow('af-glow', 56 * u, { x: X + S / 2, y: 50 * u, color: p.accent, a: 0.16, scale: tween(0.6, 1, 0, 1.6, 'outCubic') }),
        chip(x, 'af-chip', 'After', {
          x: X + m,
          y: 13 * u,
          size: 2.8 * u,
          fill: p.accent,
          color: p.onAccent,
          upper: true,
          tracking: 0.12,
          icon: 'check',
          opacity: fadeIn(0.1, 0.4),
          scale: k([0.1, 0.8], [0.6, 1, 'outBack']),
        }),
        group(
          'af-card',
          [
            ...chrome(x, 'af-cc', cw, ch),
            ...mockPage(x, 'af-old', cw, 'before'),
            group(
              'af-new',
              [rect('af-new-bg', { x: 0, y: 8.6 * u, ax: 0, ay: 0, w: cw, h: ch - 8.6 * u - 3 * u, fill: p.surface }), ...mockPage(x, 'af-pg', cw, 'after')],
              {
                x: 0,
                y: 0,
                ax: 0,
                ay: 0,
                w: cw,
                h: ch,
                mask: { shape: 'rect', x: 0, y: 0, w: k([wipe0, 0.01], [wipe1, cw, 'inOutCubic']), h: ch },
              },
            ),
            rect('af-div', {
              x: k([wipe0, 0], [wipe1, cw, 'inOutCubic']),
              y: 8.6 * u,
              ay: 0,
              w: 0.45 * u,
              h: ch - 8.6 * u,
              fill: p.accent,
              opacity: k([wipe0, 0], [wipe0 + 0.1, 1], [wipe1 - 0.05, 1], [wipe1 + 0.25, 0]),
            }),
            circle('af-knob', 3.2 * u, {
              x: k([wipe0, 0], [wipe1, cw, 'inOutCubic']),
              y: 32 * u,
              fill: p.accent,
              opacity: k([wipe0, 0], [wipe0 + 0.1, 1], [wipe1 - 0.05, 1], [wipe1 + 0.25, 0]),
            }),
            icon('af-knob-ic', 'swap', {
              x: k([wipe0, 0], [wipe1, cw, 'inOutCubic']),
              y: 32 * u,
              size: 3.4 * u,
              color: p.onAccent,
              sw: 2.4,
              opacity: k([wipe0, 0], [wipe0 + 0.1, 1], [wipe1 - 0.05, 1], [wipe1 + 0.25, 0]),
            }),
          ],
          {
            x: X + m,
            y: k([0.15, cardY + 8 * u], [1.0, cardY, 'outExpo']),
            w: cw,
            h: ch,
            ax: 0,
            ay: 0,
            opacity: fadeIn(0.15, 0.4),
          },
        ),
        x.body('af-label', 'What works', { size: 2.6 * u, x: X + m, y: 85 * u, ax: 0, align: 'left', weight: 700, fill: p.accent, uppercase: true, tracking: 0.14, opacity: fadeIn(0.5, 0.4) }),
      );
      [x.c.good1, x.c.good2, x.c.good3].forEach((t, r) => {
        const y = 92 * u + r * 8.6 * u;
        const t0 = 0.75 + r * 0.14;
        L.push(
          circle(`af-ic-${r}`, 2.5 * u, { x: X + m + 2.5 * u, y, fill: p.accent, scale: pop(t0, 0.5) }),
          icon(`af-ck-${r}`, 'check', { x: X + m + 2.5 * u, y, size: 3 * u, color: p.onAccent, sw: 2.8, trimEnd: k([t0 + 0.15, 0], [t0 + 0.5, 1, 'outCubic']) }),
          x.body(`af-t-${r}`, t, { size: 3.9 * u, x: X + m + 8 * u, y, ax: 0, align: 'left', weight: 600, fill: p.fg, anim: ta.slide(t0 + 0.05, { stagger: 0.03 }) }),
        );
      });
    }

    // ---------------------------------------------------------------- What changed
    {
      const i = 3;
      const X = slideX(x, i);
      L.push(
        chip(x, 'fx-chip', 'The fix', {
          x: X + m,
          y: 13 * u,
          size: 2.8 * u,
          fill: alpha(p.accent, 0.12),
          color: p.accent,
          upper: true,
          tracking: 0.12,
          icon: 'sparkle',
          opacity: fadeIn(0.1, 0.4),
        }),
        x.title('fx-title', x.c.fixTitle, {
          size: 8.2 * u,
          x: X + m,
          y: 46 * u,
          w: S - 2 * m,
          ax: 0,
          ay: 1,
          align: 'left',
          lineHeight: 1.04,
          anim: ta.rise(0.2, { stagger: 0.05 }),
        }),
      );
      const fixes: [string, string][] = [
        [x.c.fix1h, x.c.fix1b],
        [x.c.fix2h, x.c.fix2b],
        [x.c.fix3h, x.c.fix3b],
      ];
      fixes.forEach(([h, b], r) => {
        const y0 = 54 * u + r * 20.5 * u;
        const t0 = 0.5 + r * 0.15;
        L.push(
          circle(`fx-n-${r}`, 3.8 * u, { x: X + m + 3.8 * u, y: y0 + 3.4 * u, fill: p.accent, scale: pop(t0, 0.55) }),
          x.title(`fx-nt-${r}`, String(r + 1), { size: 3.8 * u, x: X + m + 3.8 * u, y: y0 + 3.4 * u, fill: p.onAccent, lineHeight: 1, opacity: fadeIn(t0 + 0.15, 0.3) }),
          x.title(`fx-h-${r}`, h, { size: 5.2 * u, x: X + m + 12 * u, y: y0, w: S - 2 * m - 12 * u, ax: 0, ay: 0, align: 'left', anim: ta.slide(t0 + 0.05, { stagger: 0.04 }) }),
          x.body(`fx-b-${r}`, b, {
            size: 3.5 * u,
            x: X + m + 12 * u,
            y: y0 + 7 * u,
            w: S - 2 * m - 12 * u,
            ax: 0,
            ay: 0,
            align: 'left',
            lineHeight: 1.35,
            fill: p.muted,
            anim: fadeUp(t0 + 0.2, { stagger: 0.015 }),
          }),
        );
        if (r < 2)
          L.push(rect(`fx-div-${r}`, { x: X + m + 12 * u, y: y0 + 18 * u, ax: 0, w: tween(0, S - 2 * m - 12 * u, t0 + 0.2, 0.8), h: 0.2 * u, fill: alpha(p.fg, 0.1) }));
      });
    }

    // ---------------------------------------------------------------- CTA
    {
      const i = N - 1;
      const X = slideX(x, i);
      const cx = X + S / 2;
      L.push(
        glow('ct-glow', 34 * u, { x: cx, y: 34 * u, color: p.accent, a: 0.22, scale: tween(0.4, 1, 0.1, 1.4, 'outCubic') }),
        circle('ct-badge', 11 * u, { x: cx, y: 34 * u, fill: p.accent, scale: pop(0.15, 0.8, 'spring') }),
        icon('ct-pen', 'pen', { x: cx, y: 34 * u, size: 10 * u, color: p.onAccent, sw: 1.8, trimEnd: k([0.5, 0], [1.3, 1, 'inOutCubic']) }),
        x.title('ct-title', x.c.cta, { size: 8.6 * u, x: cx, y: 67 * u, w: S - 2 * m - 12 * u, ay: 1, lineHeight: 1.04, anim: ta.rise(0.4, { stagger: 0.06 }) }),
        x.body('ct-sub', x.c.ctaSub, { size: 4 * u, x: cx, y: 71.5 * u, w: S - 2 * m - 4 * u, ay: 0, fill: p.muted, anim: fadeUp(0.75) }),
        chip(x, 'ct-btn', x.c.ctaBtn, {
          x: cx,
          y: 93 * u,
          ax: 0.5,
          size: 3.3 * u,
          fill: p.accent,
          color: p.onAccent,
          icon: 'send',
          scale: k([1.0, 0.6], [1.6, 1, 'outBack']),
          opacity: fadeIn(1.0, 0.25),
        }),
        x.body('ct-handle', x.c.handle, { size: 3.1 * u, x: cx, y: 104 * u, weight: 600, fill: p.muted, anim: ta.chars(1.25, { stagger: 0.02 }) }),
      );
    }

    return { layers: L };
  },
};

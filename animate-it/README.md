# Animate It

Professional motion design in the browser: hundreds of editable animated templates, logo animations, animated carousels, a brand kit that re-skins the whole gallery, one-click resizing, a timeline editor, and client-side export to MP4, WebM, GIF and PNG up to 4K at 60fps.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # static site in dist/ (deploy anywhere: Vercel, Netlify, Cloudflare Pages, S3)
```

The build uses a relative base path, so `dist/` works from any URL or sub-folder.

## What's inside

| Area | Where | Notes |
| --- | --- | --- |
| Motion engine | `src/engine/` | Pure `renderFrame(ctx, scene, t)`. Layers: rect, ellipse (arcs), text (per char/word/line animation, masks, counters, typewriter), image (tinting), path (draw-on trim), group (clip, animated masks, isolated compositing). Keyframes with 30 easings, springs and cubic-bezier. |
| Scene format | `src/engine/types.ts` | Plain JSON. The same scene drives previews, scrubbing and export, so exports are frame-accurate. It is also simple enough for an LLM to generate (see roadmap). |
| Templates | `src/templates/` | A **recipe** is a responsive factory (format × palette × fonts × copy → layers). Recipes × variants = gallery templates. Every non-carousel recipe renders in square, portrait, story and landscape. |
| Template packs | `src/templates/packs/*` | One folder per pack; register in `packs/index.ts`. |
| Gallery & site | `src/pages/`, `src/ui/` | Landing, templates gallery (categories, search, format filter, brand preview, favourites), template detail with live magic resize, pricing, projects. |
| Editor | `src/editor/` | Canvas stage with select/drag, layers, content/style panels, inspector, timeline (scrub, retime by dragging, speed, loop), undo/redo, autosave to IndexedDB, keyboard shortcuts. |
| Export | `src/lib/export.ts` | WebCodecs + mp4-muxer/webm-muxer for video, gifenc for GIF, fflate for ZIPs. Carousels export one video per slide in a ZIP. Nothing is uploaded, so export costs nothing to serve. |

## Adding templates

1. Create or open a pack in `src/templates/packs/<pack>/index.ts` and export `recipes: Recipe[]`.
2. Build with the kit (`src/templates/kit.ts`): size everything in `x.u`, colours from `x.p`, text through `x.title` / `x.body`, logo through `x.logo`.
3. Give the recipe 4–5 `variants` (palette + fonts + copy + default format).
4. Review it: with `npm run dev` running, `node scripts/sheet.mjs "recipe=<id>&variants=all" sheet.png` renders a contact sheet. Add `&format=story` or `&format=landscape` to check resizing.

Other dev scripts: `scripts/shot.mjs` (screenshot a route), `scripts/editor-check.mjs` (drives the editor), `scripts/export-check.mjs` (encodes every export format in headless Chromium).

## Not built yet (needed before charging money)

- **Accounts & cloud projects.** Projects currently live in the browser (IndexedDB). Add auth (Clerk or Supabase Auth) and a projects API with object storage for uploads.
- **Payments & plan gating.** `src/lib/plans.ts` holds the proposed plans. Wire Stripe or Paddle (Paddle handles global VAT as merchant of record) and gate 4K/60fps, watermark-free exports and project limits per plan.
- **Watermark** for the free tier (draw it in `exportScene` when the plan is Free).
- **Custom font upload**, audio tracks, video layers, Lottie export, SVG logo import as editable paths.
- **AI**: "describe your animation" → scene JSON via the Claude API, plus auto-copywriting for templates.
- **Analytics** (PostHog) to replace the placeholder popularity ranking with real usage.
- **SEO**: pre-render one landing page per template and category (hash routing is fine for the app; marketing pages should be static).

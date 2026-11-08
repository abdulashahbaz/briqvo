/** Formats, palettes, font pairs and categories shared by every template. */

export type FormatId = 'square' | 'portrait' | 'story' | 'landscape' | 'carousel';

export interface FormatSpec {
  id: FormatId;
  w: number;
  h: number;
  label: string;
  ratio: string;
  hint: string;
}

export const FORMATS: Record<FormatId, FormatSpec> = {
  square: { id: 'square', w: 1080, h: 1080, label: 'Square', ratio: '1:1', hint: 'Instagram, LinkedIn feed' },
  portrait: { id: 'portrait', w: 1080, h: 1350, label: 'Portrait', ratio: '4:5', hint: 'Instagram, Facebook feed' },
  story: { id: 'story', w: 1080, h: 1920, label: 'Story', ratio: '9:16', hint: 'Reels, TikTok, Shorts' },
  landscape: { id: 'landscape', w: 1920, h: 1080, label: 'Landscape', ratio: '16:9', hint: 'YouTube, slides, web' },
  carousel: { id: 'carousel', w: 1080, h: 1350, label: 'Carousel', ratio: '4:5 × N', hint: 'Instagram & LinkedIn carousels' },
};

export const RESIZABLE_FORMATS: FormatId[] = ['square', 'portrait', 'story', 'landscape'];

export interface Palette {
  id: string;
  name: string;
  bg: string; // main background
  bg2: string; // secondary background / gradient partner
  surface: string; // cards, panels
  fg: string; // primary text
  muted: string; // secondary text
  accent: string; // brand / highlight
  accent2: string; // secondary highlight
  onAccent: string; // text on accent
}

export const PALETTES: Record<string, Palette> = {
  azure: { id: 'azure', name: 'Azure', bg: '#FFFFFF', bg2: '#EAF1FF', surface: '#F3F7FF', fg: '#0A1633', muted: '#5B6B8C', accent: '#1F5BFF', accent2: '#5FA8FF', onAccent: '#FFFFFF' },
  midnight: { id: 'midnight', name: 'Midnight', bg: '#060B1C', bg2: '#0F1C40', surface: '#121E3D', fg: '#F2F6FF', muted: '#8C9BC2', accent: '#4D7CFF', accent2: '#2DD4F5', onAccent: '#FFFFFF' },
  electric: { id: 'electric', name: 'Electric', bg: '#1F5BFF', bg2: '#0B36C7', surface: '#3A6FFF', fg: '#FFFFFF', muted: '#C9D8FF', accent: '#FFE14D', accent2: '#FFFFFF', onAccent: '#0A1633' },
  paper: { id: 'paper', name: 'Paper', bg: '#F5F0E6', bg2: '#EAE2D2', surface: '#FFFFFF', fg: '#1B1712', muted: '#76695A', accent: '#E4572E', accent2: '#2D5BD8', onAccent: '#FFFFFF' },
  mint: { id: 'mint', name: 'Mint', bg: '#E3F7EC', bg2: '#C6EED8', surface: '#FFFFFF', fg: '#0C2A1E', muted: '#4F7564', accent: '#0FA968', accent2: '#0C2A1E', onAccent: '#FFFFFF' },
  sunset: { id: 'sunset', name: 'Sunset', bg: '#FF6A3D', bg2: '#FF9466', surface: '#FFB38F', fg: '#1C0A04', muted: '#5A2614', accent: '#FFF1E6', accent2: '#1C0A04', onAccent: '#1C0A04' },
  noir: { id: 'noir', name: 'Noir', bg: '#0A0A0B', bg2: '#18181B', surface: '#1F1F23', fg: '#FAFAFA', muted: '#9A9AA3', accent: '#D7FF3A', accent2: '#FFFFFF', onAccent: '#0A0A0B' },
  lilac: { id: 'lilac', name: 'Lilac', bg: '#EEEAFF', bg2: '#DCD3FF', surface: '#FFFFFF', fg: '#1A1340', muted: '#625A8A', accent: '#6B4CF6', accent2: '#FF7AB6', onAccent: '#FFFFFF' },
  ocean: { id: 'ocean', name: 'Ocean', bg: '#032A3B', bg2: '#06455E', surface: '#0A3F55', fg: '#EAFBFF', muted: '#86B7C9', accent: '#00C2FF', accent2: '#7CF5D3', onAccent: '#032A3B' },
  blush: { id: 'blush', name: 'Blush', bg: '#FFE6E8', bg2: '#FFCDD3', surface: '#FFFFFF', fg: '#3A0A15', muted: '#8C4A57', accent: '#F23D5E', accent2: '#3A0A15', onAccent: '#FFFFFF' },
  forest: { id: 'forest', name: 'Forest', bg: '#0E2A1C', bg2: '#16402B', surface: '#1B4A33', fg: '#ECF8EF', muted: '#93B9A1', accent: '#B4F05A', accent2: '#F5E7C6', onAccent: '#0E2A1C' },
  sand: { id: 'sand', name: 'Sand', bg: '#EBDDC9', bg2: '#DCC8AC', surface: '#F7EEE1', fg: '#2A2017', muted: '#7A6650', accent: '#9A5B2E', accent2: '#2A2017', onAccent: '#FFFFFF' },
  cobalt: { id: 'cobalt', name: 'Cobalt Cream', bg: '#FFF8EC', bg2: '#F6EAD3', surface: '#FFFFFF', fg: '#10215C', muted: '#56618A', accent: '#2346E8', accent2: '#FF8A3D', onAccent: '#FFFFFF' },
  cyber: { id: 'cyber', name: 'Cyber', bg: '#0B0420', bg2: '#1C0B45', surface: '#1E1048', fg: '#F6F0FF', muted: '#A796D6', accent: '#FF3DF2', accent2: '#3DF5FF', onAccent: '#0B0420' },
  citrus: { id: 'citrus', name: 'Citrus', bg: '#FFF06B', bg2: '#FFE03D', surface: '#FFFFFF', fg: '#121212', muted: '#4A4520', accent: '#FF5A1F', accent2: '#121212', onAccent: '#FFFFFF' },
  arctic: { id: 'arctic', name: 'Arctic', bg: '#EAF4FF', bg2: '#D3E7FF', surface: '#FFFFFF', fg: '#0B2545', muted: '#56708F', accent: '#2E7CF6', accent2: '#13315C', onAccent: '#FFFFFF' },
  graphite: { id: 'graphite', name: 'Graphite', bg: '#16191F', bg2: '#22262F', surface: '#262B35', fg: '#E9EDF3', muted: '#8C95A6', accent: '#7AA2FF', accent2: '#FFB86B', onAccent: '#0B0F18' },
  peach: { id: 'peach', name: 'Peach', bg: '#FFE3D3', bg2: '#FFC9AE', surface: '#FFF4EE', fg: '#3B1D10', muted: '#8A5A44', accent: '#FF6B4A', accent2: '#3B1D10', onAccent: '#FFFFFF' },
  royal: { id: 'royal', name: 'Royal', bg: '#0D1240', bg2: '#1B2370', surface: '#1A2163', fg: '#FFFFFF', muted: '#A5ACE0', accent: '#F5C451', accent2: '#7C8CFF', onAccent: '#0D1240' },
  slate: { id: 'slate', name: 'Slate', bg: '#F1F3F7', bg2: '#E1E5EE', surface: '#FFFFFF', fg: '#111827', muted: '#6B7280', accent: '#111827', accent2: '#1F5BFF', onAccent: '#FFFFFF' },
};

export const PALETTE_LIST = Object.values(PALETTES);

export interface FontPair {
  id: string;
  name: string;
  display: string;
  displayWeight: number;
  body: string;
  bodyWeight: number;
  /** Tracking (em) that suits the display face. */
  displayTracking: number;
  /** Visual size correction for the display face (1 = neutral). */
  displayScale: number;
}

export const FONTS: Record<string, FontPair> = {
  grotesk: { id: 'grotesk', name: 'Bricolage', display: 'Bricolage Grotesque', displayWeight: 800, body: 'Inter', bodyWeight: 500, displayTracking: -0.035, displayScale: 1 },
  sora: { id: 'sora', name: 'Sora', display: 'Sora', displayWeight: 700, body: 'Inter', bodyWeight: 500, displayTracking: -0.04, displayScale: 0.96 },
  serif: { id: 'serif', name: 'Instrument', display: 'Instrument Serif', displayWeight: 400, body: 'Inter', bodyWeight: 500, displayTracking: -0.02, displayScale: 1.18 },
  editorial: { id: 'editorial', name: 'Playfair', display: 'Playfair Display', displayWeight: 700, body: 'Inter', bodyWeight: 500, displayTracking: -0.02, displayScale: 1 },
  space: { id: 'space', name: 'Space', display: 'Space Grotesk', displayWeight: 700, body: 'Space Grotesk', bodyWeight: 500, displayTracking: -0.04, displayScale: 1 },
  mono: { id: 'mono', name: 'Mono', display: 'JetBrains Mono', displayWeight: 800, body: 'JetBrains Mono', bodyWeight: 500, displayTracking: -0.05, displayScale: 0.86 },
  syne: { id: 'syne', name: 'Syne', display: 'Syne', displayWeight: 800, body: 'Inter', bodyWeight: 500, displayTracking: -0.03, displayScale: 0.95 },
  archivo: { id: 'archivo', name: 'Archivo', display: 'Archivo Black', displayWeight: 400, body: 'Archivo', bodyWeight: 500, displayTracking: -0.03, displayScale: 0.92 },
  outfit: { id: 'outfit', name: 'Outfit', display: 'Outfit', displayWeight: 800, body: 'Outfit', bodyWeight: 400, displayTracking: -0.035, displayScale: 1 },
  dmserif: { id: 'dmserif', name: 'DM Serif', display: 'DM Serif Display', displayWeight: 400, body: 'DM Sans', bodyWeight: 500, displayTracking: -0.02, displayScale: 1.04 },
  manrope: { id: 'manrope', name: 'Manrope', display: 'Manrope', displayWeight: 800, body: 'Manrope', bodyWeight: 500, displayTracking: -0.04, displayScale: 1 },
  unbounded: { id: 'unbounded', name: 'Unbounded', display: 'Unbounded', displayWeight: 800, body: 'Inter', bodyWeight: 500, displayTracking: -0.04, displayScale: 0.82 },
  anton: { id: 'anton', name: 'Anton', display: 'Anton', displayWeight: 400, body: 'Inter', bodyWeight: 600, displayTracking: 0, displayScale: 1.12 },
  fraunces: { id: 'fraunces', name: 'Fraunces', display: 'Fraunces', displayWeight: 800, body: 'Inter', bodyWeight: 500, displayTracking: -0.03, displayScale: 1 },
  poppins: { id: 'poppins', name: 'Poppins', display: 'Poppins', displayWeight: 700, body: 'Poppins', bodyWeight: 400, displayTracking: -0.03, displayScale: 0.95 },
};

export const FONT_LIST = Object.values(FONTS);

/** Google Fonts stylesheet covering every family and weight above. */
export const GOOGLE_FONTS_HREF =
  'https://fonts.googleapis.com/css2?' +
  [
    'family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800',
    'family=Inter:wght@400;500;600;700;800',
    'family=Sora:wght@400;600;700;800',
    'family=Instrument+Serif:ital@0;1',
    'family=Playfair+Display:ital,wght@0,500;0,700;0,800;1,500;1,700',
    'family=Space+Grotesk:wght@400;500;700',
    'family=JetBrains+Mono:wght@400;500;800',
    'family=Syne:wght@600;800',
    'family=Archivo+Black',
    'family=Archivo:wght@400;500;700',
    'family=Outfit:wght@300;400;600;800',
    'family=DM+Serif+Display:ital@0;1',
    'family=DM+Sans:wght@400;500;700',
    'family=Manrope:wght@400;500;700;800',
    'family=Unbounded:wght@500;800',
    'family=Anton',
    'family=Fraunces:ital,wght@0,600;0,800;1,600',
    'family=Poppins:wght@400;600;700;800',
  ].join('&') +
  '&display=swap';

export type CategoryId =
  | 'logo'
  | 'carousel'
  | 'social'
  | 'text'
  | 'product'
  | 'devices'
  | 'ads'
  | 'intros'
  | 'backgrounds'
  | 'charts'
  | 'icons'
  | 'transitions'
  | 'creator'
  | 'events'
  | 'quotes';

export interface Category {
  id: CategoryId;
  name: string;
  blurb: string;
  featured?: boolean;
}

export const CATEGORIES: Category[] = [
  { id: 'logo', name: 'Logo Animations', blurb: 'Bring your mark to life: reveals, stings and intros.', featured: true },
  { id: 'carousel', name: 'Animated Carousels', blurb: 'Multi-slide posts that move and flow from slide to slide.', featured: true },
  { id: 'social', name: 'Social Posts', blurb: 'Announcements, launches, tips and promos for feeds.' },
  { id: 'text', name: 'Text Animations', blurb: 'Kinetic typography that stops the scroll.' },
  { id: 'product', name: 'Product & App', blurb: 'Feature reveals, launch videos and UI motion.' },
  { id: 'devices', name: 'Device Mockups', blurb: 'Phones, laptops and browsers in motion.' },
  { id: 'ads', name: 'Ads & Sales', blurb: 'Discounts, offers and performance ad creatives.' },
  { id: 'intros', name: 'Intros & Titles', blurb: 'Openers, title cards and presentation headers.' },
  { id: 'backgrounds', name: 'Backgrounds & Loops', blurb: 'Seamless gradients, patterns and ambient loops.' },
  { id: 'charts', name: 'Charts & Data', blurb: 'Animated stats, bars, rings and growth stories.' },
  { id: 'icons', name: 'Icons & Stickers', blurb: 'Micro-animations, badges and reactions.' },
  { id: 'transitions', name: 'Transitions', blurb: 'Wipes, swipes and shape transitions.' },
  { id: 'creator', name: 'Creator & YouTube', blurb: 'Subscribe prompts, lower thirds and end screens.' },
  { id: 'events', name: 'Events & Countdowns', blurb: 'Webinars, launches, countdowns and save-the-dates.' },
  { id: 'quotes', name: 'Quotes & Reviews', blurb: 'Testimonials, reviews and quote cards.' },
];

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<CategoryId, Category>;

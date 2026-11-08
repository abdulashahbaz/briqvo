/**
 * Plans shown on the pricing page. Prices are a starting proposal and live in
 * one place so they can be tuned without touching UI code. Checkout is not
 * wired yet (see README: payments).
 */
export interface Plan {
  id: 'free' | 'pro' | 'team' | 'business';
  name: string;
  monthly: number | null; // USD per month when billed monthly
  yearly: number | null; // USD per month when billed yearly
  unit?: string;
  blurb: string;
  cta: string;
  featured?: boolean;
  features: string[];
}

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    monthly: 0,
    yearly: 0,
    blurb: 'Everything you need to try motion.',
    cta: 'Start free',
    features: ['All templates', 'Brand kit preview', 'MP4 & GIF export up to 1080p', 'Small Animate It watermark', '3 saved projects'],
  },
  {
    id: 'pro',
    name: 'Pro',
    monthly: 15,
    yearly: 12,
    unit: 'per month',
    blurb: 'For creators and freelancers shipping every week.',
    cta: 'Go Pro',
    featured: true,
    features: ['No watermark', '4K & 60fps exports', 'WebM, transparent video & PNG sequences', 'Unlimited projects & cloud sync', 'Upload custom fonts', 'Priority new templates'],
  },
  {
    id: 'team',
    name: 'Team',
    monthly: 29,
    yearly: 24,
    unit: 'per editor / month',
    blurb: 'Shared brand kits and libraries for marketing teams.',
    cta: 'Start a team trial',
    features: ['Everything in Pro', 'Multiple brand kits', 'Shared team templates', 'Comments & review links', 'Roles & permissions'],
  },
  {
    id: 'business',
    name: 'Business',
    monthly: null,
    yearly: null,
    blurb: 'For agencies and enterprises at scale.',
    cta: 'Talk to sales',
    features: ['Everything in Team', 'SSO & audit logs', 'Custom template production', 'API & bulk rendering', 'Dedicated success manager'],
  },
];

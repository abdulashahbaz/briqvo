import { useEffect, useState } from 'react';
import { Menu, X, Palette, FolderOpen } from 'lucide-react';
import { Wordmark } from './Brand';
import { href, useRoute } from '../lib/router';
import { useBrand, useUI } from '../lib/store';
import { CATEGORIES } from '../templates/catalog';

const NAV = [
  { to: '/templates', label: 'Templates' },
  { to: '/templates/logo', label: 'Logo Animations' },
  { to: '/templates/carousel', label: 'Carousels' },
  { to: '/pricing', label: 'Pricing' },
];

export function Header() {
  const { path } = useRoute();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const setBrandOpen = useUI((s) => s.setBrandOpen);
  const brand = useBrand((s) => s.brand);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 4);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  useEffect(() => setOpen(false), [path]);

  return (
    <>
      <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <a href={href('/')} aria-label="Animate It home">
            <Wordmark />
          </a>
          <nav className="nav" aria-label="Main">
            {NAV.map((n) => (
              <a key={n.to} href={href(n.to)} aria-current={path === n.to ? 'page' : undefined}>
                {n.label}
              </a>
            ))}
          </nav>
          <div className="header-actions">
            <button className="btn btn-ghost hide-sm" onClick={() => setBrandOpen(true)}>
              <Palette />
              Brand kit
              {brand.enabled && <span className="badge">On</span>}
            </button>
            <a className="btn btn-ghost hide-sm" href={href('/projects')}>
              <FolderOpen />
              My projects
            </a>
            <a className="btn btn-primary hide-sm" href={href('/templates')}>
              Start creating
            </a>
            <button className="btn btn-icon btn-ghost menu-btn" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>
      {open && (
        <nav className="mobile-nav" aria-label="Mobile">
          {NAV.map((n) => (
            <a key={n.to} href={href(n.to)}>
              {n.label}
            </a>
          ))}
          <a href={href('/projects')}>My projects</a>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setOpen(false);
              setBrandOpen(true);
            }}
          >
            Brand kit
          </a>
        </nav>
      )}
    </>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Wordmark />
            <p className="muted" style={{ maxWidth: 320, marginTop: 14 }}>
              Professional motion design in your browser. Hundreds of templates, your brand applied in one click, and exports up to 4K.
            </p>
          </div>
          <div>
            <h4>Templates</h4>
            {CATEGORIES.slice(0, 6).map((c) => (
              <a key={c.id} href={href(`/templates/${c.id}`)}>
                {c.name}
              </a>
            ))}
          </div>
          <div>
            <h4>More templates</h4>
            {CATEGORIES.slice(6, 12).map((c) => (
              <a key={c.id} href={href(`/templates/${c.id}`)}>
                {c.name}
              </a>
            ))}
          </div>
          <div>
            <h4>Product</h4>
            <a href={href('/pricing')}>Pricing</a>
            <a href={href('/projects')}>My projects</a>
            <a href={href('/editor/new?t=orbit-reveal--midnight')}>Open the editor</a>
            <a href={href('/#faq')}>FAQ</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Animate It. All rights reserved.</span>
          <span>Made for creators, marketers and brands everywhere.</span>
        </div>
      </div>
    </footer>
  );
}

export function Toast() {
  const toast = useUI((s) => s.toast);
  if (!toast) return null;
  return (
    <div className="toast" role="status" key={toast.id}>
      {toast.text}
    </div>
  );
}

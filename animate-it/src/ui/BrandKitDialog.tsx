import { Upload, Trash2 } from 'lucide-react';
import { Modal } from './Modal';
import { useBrand, useUI } from '../lib/store';
import { FONT_LIST } from '../templates/catalog';
import { pickFile, readImage } from '../lib/files';
import { toHex } from '../engine/color';
import type { BrandKit } from '../templates/registry';

export function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const hex = toHex(value);
  return (
    <label className="field" style={{ display: 'block' }}>
      <span className="label">{label}</span>
      <span className="swatch-input">
        <input type="color" value={hex} onChange={(e) => onChange(e.target.value)} aria-label={label} />
        <input
          type="text"
          defaultValue={hex}
          key={hex}
          onBlur={(e) => /^#?[0-9a-f]{6}$/i.test(e.target.value.trim()) && onChange('#' + e.target.value.trim().replace('#', ''))}
          aria-label={`${label} hex`}
        />
      </span>
    </label>
  );
}

const PRESETS: Partial<BrandKit>[] = [
  { primary: '#1F5BFF', secondary: '#5FA8FF', dark: '#0A1633', light: '#FFFFFF' },
  { primary: '#FF5A1F', secondary: '#FFC145', dark: '#1B1712', light: '#FFF8EE' },
  { primary: '#0FA968', secondary: '#B4F05A', dark: '#0C2A1E', light: '#F2FBF6' },
  { primary: '#6B4CF6', secondary: '#FF7AB6', dark: '#1A1340', light: '#FAF8FF' },
  { primary: '#E11D48', secondary: '#111827', dark: '#111827', light: '#FFFFFF' },
  { primary: '#111111', secondary: '#D7FF3A', dark: '#0A0A0B', light: '#F5F5F2' },
];

export function BrandKitDialog() {
  const open = useUI((s) => s.brandOpen);
  const setOpen = useUI((s) => s.setBrandOpen);
  const notify = useUI((s) => s.notify);
  const { brand, setBrand } = useBrand();
  if (!open) return null;

  const upload = async () => {
    const f = await pickFile('image/png,image/svg+xml,image/jpeg,image/webp');
    if (!f) return;
    try {
      const src = await readImage(f, 1024);
      setBrand({ logoSrc: src, enabled: true });
    } catch (e) {
      notify((e as Error).message);
    }
  };

  return (
    <Modal onClose={() => setOpen(false)} className="modal-sm" label="Brand kit">
      <div style={{ padding: '28px 28px 24px' }}>
        <span className="eyebrow">Brand kit</span>
        <h2 className="display" style={{ fontSize: 30, margin: '8px 0 6px' }}>
          Every template, in your brand
        </h2>
        <p className="muted" style={{ margin: '0 0 20px' }}>
          Set your colours, fonts and logo once. Turn it on and the whole gallery re-renders in your brand before you open a single template.
        </p>

        <div className="field">
          <span className="label">Logo</span>
          <div className="logo-drop">
            <div className="preview">{brand.logoSrc ? <img src={brand.logoSrc} alt="Your logo" /> : <Upload size={22} color="#8a96b0" />}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button className="btn btn-sm btn-outline" onClick={upload}>
                  <Upload /> {brand.logoSrc ? 'Replace' : 'Upload logo'}
                </button>
                {brand.logoSrc && (
                  <button className="btn btn-sm btn-ghost" onClick={() => setBrand({ logoSrc: '' })}>
                    <Trash2 /> Remove
                  </button>
                )}
              </div>
              <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 10, fontSize: 13 }}>
                <button className="toggle" role="switch" aria-checked={brand.logoTint} onClick={() => setBrand({ logoTint: !brand.logoTint })} />
                Single-colour logo: recolour it to fit each template
              </label>
            </div>
          </div>
        </div>

        <label className="field" style={{ display: 'block' }}>
          <span className="label">Brand name</span>
          <input className="input" value={brand.name} onChange={(e) => setBrand({ name: e.target.value })} />
        </label>

        <span className="label">Quick palettes</span>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
          {PRESETS.map((p, i) => (
            <button
              key={i}
              className="variant-dot"
              aria-label={`Palette ${i + 1}`}
              onClick={() => setBrand(p)}
              style={{ background: `linear-gradient(135deg, ${p.primary} 50%, ${p.secondary} 50%)` }}
            />
          ))}
        </div>
        <div className="grid-2">
          <ColorField label="Primary" value={brand.primary} onChange={(v) => setBrand({ primary: v })} />
          <ColorField label="Secondary" value={brand.secondary} onChange={(v) => setBrand({ secondary: v })} />
          <ColorField label="Dark" value={brand.dark} onChange={(v) => setBrand({ dark: v })} />
          <ColorField label="Light" value={brand.light} onChange={(v) => setBrand({ light: v })} />
        </div>

        <label className="field" style={{ display: 'block' }}>
          <span className="label">Fonts</span>
          <select className="input" value={brand.fonts} onChange={(e) => setBrand({ fonts: e.target.value })}>
            {FONT_LIST.map((f) => (
              <option key={f.id} value={f.id}>
                {f.display} + {f.body}
              </option>
            ))}
          </select>
        </label>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginTop: 20 }}>
          <label style={{ display: 'flex', gap: 10, alignItems: 'center', fontWeight: 600, fontSize: 14 }}>
            <button className="toggle" role="switch" aria-checked={brand.enabled} onClick={() => setBrand({ enabled: !brand.enabled })} />
            Preview templates in my brand
          </label>
          <button
            className="btn btn-primary"
            onClick={() => {
              setBrand({ enabled: true });
              setOpen(false);
              notify('Brand kit applied to every template');
            }}
          >
            Apply brand
          </button>
        </div>
      </div>
    </Modal>
  );
}

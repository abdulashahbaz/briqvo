/** Animate It brand mark: a play glyph leaving motion trails, on an azure tile. */
export function BrandMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <defs>
        <linearGradient id="ai-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4F7FFF" />
          <stop offset="1" stopColor="#1546D9" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#ai-g)" />
      <path d="M17.5 11.6 L29.2 18.6 a1.6 1.6 0 0 1 0 2.8 L17.5 28.4 a1.6 1.6 0 0 1 -2.4 -1.4 V13 a1.6 1.6 0 0 1 2.4 -1.4z" fill="#fff" />
      <rect x="6.5" y="15.2" width="6" height="2.6" rx="1.3" fill="#fff" opacity=".55" />
      <rect x="8.5" y="22.2" width="4" height="2.6" rx="1.3" fill="#fff" opacity=".35" />
    </svg>
  );
}

export function Wordmark({ size = 30 }: { size?: number }) {
  return (
    <span className="brand">
      <BrandMark size={size} />
      <span>
        Animate <em>It</em>
      </span>
    </span>
  );
}

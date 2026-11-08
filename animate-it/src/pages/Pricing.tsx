import { useState } from 'react';
import { Check } from 'lucide-react';
import { PLANS } from '../lib/plans';
import { href } from '../lib/router';
import { useUI } from '../lib/store';

export function PricingPage() {
  const [yearly, setYearly] = useState(true);
  const notify = useUI((s) => s.notify);
  return (
    <div className="container">
      <div className="page-head">
        <span className="eyebrow">Pricing</span>
        <h1 className="display">Simple plans that grow with you</h1>
        <p>Start free with every template. Upgrade when you need 4K, no watermark and your whole team on board.</p>
        <div className="seg" style={{ marginTop: 24 }}>
          <button aria-pressed={!yearly} onClick={() => setYearly(false)}>
            Monthly
          </button>
          <button aria-pressed={yearly} onClick={() => setYearly(true)}>
            Yearly <span className="badge" style={{ marginLeft: 6 }}>−20%</span>
          </button>
        </div>
      </div>
      <div className="plans">
        {PLANS.map((p) => {
          const price = yearly ? p.yearly : p.monthly;
          return (
            <div key={p.id} className={`plan ${p.featured ? 'featured' : ''}`}>
              {p.featured && <span className="badge badge-new tag">Most popular</span>}
              <h3>{p.name}</h3>
              <div className="price">
                {price === null ? 'Custom' : `$${price}`} {price !== null && price > 0 && <small>{p.unit}</small>}
              </div>
              <p className="muted" style={{ margin: 0, fontSize: 14 }}>
                {p.blurb}
              </p>
              {p.id === 'free' ? (
                <a className="btn btn-outline" href={href('/templates')}>
                  {p.cta}
                </a>
              ) : (
                <button className={`btn ${p.featured ? 'btn-primary' : 'btn-outline'}`} onClick={() => notify('Checkout opens with our public launch. Everything is free until then.')}>
                  {p.cta}
                </button>
              )}
              <ul>
                {p.features.map((f) => (
                  <li key={f}>
                    <Check /> {f}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      <p className="muted" style={{ textAlign: 'center', marginTop: 28, fontSize: 14 }}>
        Prices in USD. Taxes may apply. Education and non-profit discounts available.
      </p>
    </div>
  );
}

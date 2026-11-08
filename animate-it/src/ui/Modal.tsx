import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

export function Modal({ onClose, children, className = '', label }: { onClose: () => void; children: ReactNode; className?: string; label: string }) {
  useEffect(() => {
    const on = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', on);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', on);
      document.body.style.overflow = prev;
    };
  }, [onClose]);
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${className}`} role="dialog" aria-modal="true" aria-label={label}>
        <button className="btn btn-icon btn-ghost modal-close" aria-label="Close" onClick={onClose}>
          <X />
        </button>
        {children}
      </div>
    </div>
  );
}

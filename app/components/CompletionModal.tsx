"use client";

import { useEffect } from 'react';
import type { PromptLang } from '@/lib/types';

type Props = {
  onClose: () => void;
  respondentName?: string | null;
  lang?: PromptLang;
};

export function CompletionModal({ onClose, respondentName, lang = 'en' }: Props) {
  // Close on Escape, prevent background scroll while open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const heading = lang === 'hi' ? 'धन्यवाद!' : 'Dhanyavaad!';
  const body =
    lang === 'hi'
      ? `${respondentName ? `${respondentName}, ` : ''}aapne form complete kar liya. Aapka samay aur knowledge LD Brain mein save ho gaya. Mahesh ya Aditya aapse jaldi contact karenge.`
      : `${respondentName ? `${respondentName}, ` : ''}aapne form complete kar liya. Aapka samay aur knowledge LD Brain mein save ho gaya. Mahesh ya Aditya aapse jaldi contact karenge.`;
  const doneLabel = lang === 'hi' ? 'Band karo' : 'Done';

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="completion-modal-title"
    >
      <div className="modal-card">
        <div className="modal-mark" aria-hidden="true">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 id="completion-modal-title" className="modal-title">{heading}</h2>
        <p className="modal-body">{body}</p>
        <div className="modal-actions">
          <button type="button" className="btn" onClick={onClose} autoFocus>
            {doneLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * @file Facts.tsx
 * @description A soft group of label and value rows (paper-2, hairline rows, the label left in ink-2, the value right). A Fact's value may be any node: a word, a tag, a gauge.
 * Used by: detail panels.
 */
import type { ReactNode } from 'react';

export function Facts({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <dl className={`fr-facts ${className}`}>{children}</dl>;
}

export function Fact({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div className="fr-fact-row">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

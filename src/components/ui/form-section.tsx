import type { ReactNode } from 'react';

/** Compact Venova-style section; input styles inherit shared app theme tokens. */
export function FormSection({ title, description, children, action }: {
  title: string; description?: string; children: ReactNode; action?: ReactNode;
}) {
  return <section className="record-panel">
    <div className="record-panel-heading"><div><h2>{title}</h2>{description && <p>{description}</p>}</div>{action}</div>
    {children}
  </section>;
}

export function FormGrid({ children }: { children: ReactNode }) {
  return <div className="record-form-grid">{children}</div>;
}

import type { ReactNode } from 'react';

export function MinimalTable({ headings, children, empty, isEmpty }: {
  headings: string[]; children: ReactNode; empty: string; isEmpty: boolean;
}) {
  if (isEmpty) return <p className="record-empty">{empty}</p>;
  return <div className="record-table-scroll"><table className="record-table">
    <thead><tr>{headings.map((heading) => <th key={heading}>{heading}</th>)}</tr></thead>
    <tbody>{children}</tbody>
  </table></div>;
}

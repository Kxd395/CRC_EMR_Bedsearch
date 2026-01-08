import React from 'react';

type Crumb = { label: string; href?: string };

export const Breadcrumbs: React.FC<{ items: Crumb[] }> = ({ items }) => {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="breadcrumbs">
        {items.map((c, i) => (
          <li key={i} data-testid={`crumb-${i}`}>
            {c.href ? <a href={c.href}>{c.label}</a> : <span aria-current="page">{c.label}</span>}
            {i < items.length - 1 ? ' › ' : ''}
          </li>
        ))}
      </ol>
    </nav>
  );
};

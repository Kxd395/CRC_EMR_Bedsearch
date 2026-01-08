import React from 'react';

export const SyncBadge: React.FC<{ state: 'synced'|'pending'|'error' }>= ({ state }) => {
  const label = state === 'synced' ? 'Synced' : state === 'pending' ? 'Pending' : 'Error';
  return <span data-testid="sync-badge" data-sync-state={state} aria-live="polite">{label}</span>;
};

import React, { useState } from 'react';
import { SearchMultiAddModal } from './SearchMultiAddModal';

export const AddSearchButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="add-search-group">
      <button className="btn primary" onClick={() => setOpen(true)}>Add Search</button>
      <button className="btn">Add Multiple…</button>
      <button className="btn">Paste list</button>
      {open && <SearchMultiAddModal onClose={() => setOpen(false)} />}
    </div>
  );
};

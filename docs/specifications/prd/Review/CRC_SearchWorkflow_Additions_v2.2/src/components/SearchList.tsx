import React, { useMemo, useState } from 'react';
import data from '../data/searchList.sample.json';

type Row = (typeof data)[number];
type Status = Row['status'];

const CHIP_ORDER: Status[] = ['Accepted','Denied','PendingReview','NoBeds','PacketSent','Searching','Canceled'];

export const SearchList: React.FC = () => {
  const [q, setQ] = useState('');
  const [chips, setChips] = useState<Set<Status>>(new Set());
  const [rows, setRows] = useState<Row[]>(data as Row[]);
  const [detail, setDetail] = useState<Row | null>(null);

  const counts = useMemo(() => {
    const res: Record<Status, number> = { Accepted:0,Denied:0,PendingReview:0,NoBeds:0,PacketSent:0,Searching:0,Canceled:0 };
    rows.forEach(r => res[r.status] = (res[r.status]||0)+1);
    return res;
  }, [rows]);

  const filtered = useMemo(() => {
    return rows.filter(r => {
      const matchQ = !q || r.facility_name.toLowerCase().includes(q.toLowerCase()) || (r.notes||'').toLowerCase().includes(q.toLowerCase());
      const matchChip = chips.size ? chips.has(r.status) : true;
      return matchQ && matchChip;
    });
  }, [rows, q, chips]);

  const toggleChip = (s: Status) => {
    setChips(cur => {
      const next = new Set(cur);
      if (next.has(s)) next.delete(s); else next.add(s);
      return next;
    });
  };

  const inlineUpdate = (idx: number, patch: Partial<Row>) => {
    setRows(cur => cur.map((r,i)=> i===idx ? { ...r, ...patch, updated_ts: new Date().toISOString() } : r));
  };

  return (
    <div className="search-list">
      <div className="toolbar">
        {CHIP_ORDER.map(s => (
          <button key={s} className={`chip ${chips.has(s) ? 'active' : ''}`} onClick={() => toggleChip(s)}>
            {s} <span className="count">{counts[s]||0}</span>
          </button>
        ))}
        <input className="search" placeholder="Search facility or notes…" value={q} onChange={e=>setQ(e.target.value)} />
      </div>

      <table className="grid">
        <thead>
          <tr><th>Created</th><th>Facility</th><th>Channels</th><th>Docs</th><th>Status</th><th>Notes</th><th>Added by</th><th>Next</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {filtered.map((r, i) => (
            <tr key={r.search_id}>
              <td>{new Date(r.created_ts).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</td>
              <td>{r.facility_name}</td>
              <td>{r.channels.join(', ')}</td>
              <td>{r.documents.slice(0,2).join(', ')}{r.documents.length>2?'…':''}</td>
              <td>
                <select value={r.status} onChange={(e)=>inlineUpdate(i,{ status: e.target.value as Status })}>
                  {['Searching','PendingReview','PacketSent','Accepted','Denied','NoBeds','Canceled'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
              <td>
                <input value={r.notes||''} onChange={(e)=>inlineUpdate(i,{ notes: e.target.value })} />
              </td>
              <td title={r.created_by.display}>{r.created_by.display.split(' (')[0]}</td>
              <td>{r.next_action||''} {r.next_at? new Date(r.next_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : ''}</td>
              <td>
                <button onClick={()=>setDetail(r)}>Full screen</button>
                <button>Send</button>
                <button onClick={()=>window.print()}>Print</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {detail && <SearchDetailDialog row={detail} onClose={()=>setDetail(null)} />}
    </div>
  );
};

const SearchDetailDialog: React.FC<{ row: Row; onClose: () => void }> = ({ row, onClose }) => {
  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label="Search Details">
      <div className="modal-card modal-lg">
        <div className="modal-header">
          <h3>{row.facility_name} — Search {row.search_id}</h3>
          <button className="icon" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="modal-body">
          <dl className="details">
            <dt>Channels</dt><dd>{row.channels.join(', ')}</dd>
            <dt>Documents</dt><dd>{row.documents.join(', ')}</dd>
            <dt>Status</dt><dd>{row.status}</dd>
            <dt>Notes</dt><dd>{row.notes || '—'}</dd>
            <dt>Added by</dt><dd>{row.created_by.display}</dd>
            <dt>Created</dt><dd>{new Date(row.created_ts).toLocaleString()}</dd>
            <dt>Last updated</dt><dd>{new Date(row.updated_ts).toLocaleString()}</dd>
          </dl>
          <hr/>
          <div className="actions">
            <button>Send</button>
            <button onClick={()=>window.print()}>Print packet</button>
            <button>Copy link</button>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

import React, { useMemo, useState } from 'react';
import type { OutcomeStatus } from '../data/enums';
import { STATUS_META } from '../data/enums';
import logData from '../data/sampleContactLog.json';

type LogRow = (typeof logData)[number];

const STATUS_ORDER: OutcomeStatus[] = [
  'Accepted','Denied','PendingReview','NoBeds','LeftVoicemail','AwaitingFax','PacketSent','AuthRequired','Unknown'
];

export const ContactPlanner: React.FC = () => {
  const [filters, setFilters] = useState<Set<OutcomeStatus>>(new Set());
  const [query, setQuery] = useState('');

  const counts = useMemo(() => {
    const c: Record<OutcomeStatus, number> = {
      Accepted:0,Denied:0,PendingReview:0,NoBeds:0,LeftVoicemail:0,AwaitingFax:0,PacketSent:0,AuthRequired:0,Unknown:0
    };
    (logData as LogRow[]).forEach(r => { c[r.outcome_status as OutcomeStatus]++; });
    return c;
  }, []);

  const filtered = useMemo(() => {
    return (logData as LogRow[]).filter(r => {
      const matchStatus = filters.size ? filters.has(r.outcome_status as OutcomeStatus) : true;
      const q = query.toLowerCase();
      const matchQ = !q || r.facility_name.toLowerCase().includes(q) || r.user_display.toLowerCase().includes(q) || (r.note||'').toLowerCase().includes(q);
      return matchStatus && matchQ;
    });
  }, [filters, query]);

  const toggleFilter = (s: OutcomeStatus) => {
    setFilters(cur => {
      const next = new Set(cur);
      if (next.has(s)) next.delete(s); else next.add(s);
      return next;
    });
  };

  return (
    <div className="contact-planner">
      <div className="cp-filters">
        {STATUS_ORDER.map(s => (
          <button
            key={s}
            className={`chip ${filters.has(s) ? 'active' : ''}`}
            onClick={() => toggleFilter(s)}
            aria-pressed={filters.has(s)}
            title={`${STATUS_META[s].label} (${counts[s]})`}
          >
            <span className="icon">{STATUS_META[s].icon}</span>
            {STATUS_META[s].label} <span className="count">{counts[s]}</span>
          </button>
        ))}
        <input
          className="cp-search"
          type="search"
          placeholder="Search facility, user, notes…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search contact log"
        />
      </div>

      <table className="cp-table" role="grid" aria-label="Contact Planner Timeline">
        <thead>
          <tr>
            <th>Time</th><th>Facility</th><th>Action</th><th>Status</th><th>Notes</th><th>Added by</th><th>Next</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((r, idx) => (
            <tr key={idx} tabIndex={0} onClick={() => alert(`Open popover for ${r.facility_name} at ${r.timestamp}`)}>
              <td>{new Date(r.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</td>
              <td>{r.facility_name}</td>
              <td>{r.action}</td>
              <td><span className="status" data-status={r.outcome_status}>{STATUS_META[r.outcome_status as OutcomeStatus].label}</span></td>
              <td title={r.note}>{(r.note||'').slice(0,60)}{(r.note||'').length>60?'…':''}</td>
              <td title={r.user_display}>{r.user_display.split(' (')[0]}</td>
              <td>{r.next_action} {r.next_at ? new Date(r.next_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

import React, { useEffect, useMemo, useState } from 'react';
import { PACKET_OPTIONS } from '../data/packetTemplates';

type Facility = { id: string; name: string; fax?: string; direct?: string; emrSiteId?: string; };
const DEMO_FACILITIES: Facility[] = [
  { id: 'HOPERIDGE', name: 'Hope Ridge Recovery', fax:'215-555-0199', direct:'intake@hoperidge.direct' },
  { id: 'RIVERVIEW', name: 'Riverview Detox', fax:'267-555-0114' },
  { id: 'CITY-ACUTE', name: 'City Acute BH', fax:'215-555-0102' },
];

export const SearchMultiAddModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [applyToAll, setApplyToAll] = useState({ fax: true, email: false, emr: false, packets: true });
  const [channels, setChannels] = useState<Record<string, { fax: boolean; email: boolean; emr: boolean }>>({});
  const [packets, setPackets] = useState<Record<string, Set<string>>>({});
  const [generatePackets, setGeneratePackets] = useState(true);

  useEffect(() => {
    // initialize channels/packets for selected
    selected.forEach(id => {
      if (!channels[id]) {
        setChannels(prev => ({ ...prev, [id]: { fax: applyToAll.fax, email: applyToAll.email, emr: applyToAll.emr } }));
      }
      if (!packets[id]) {
        setPackets(prev => ({ ...prev, [id]: new Set(PACKET_OPTIONS.filter(p => !p.gated).map(p => p.code)) }));
      }
    });
  }, [selected]);

  const filtered = useMemo(
    () => DEMO_FACILITIES.filter(f => f.name.toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  const toggleSelect = (id: string) => {
    setSelected(s => (s.includes(id) ? s.filter(x => x !== id) : [...s, id]));
  };

  const togglePacket = (fid: string, code: string) => {
    setPackets(prev => {
      const next = new Set(prev[fid] || []);
      if (next.has(code)) next.delete(code); else next.add(code);
      return { ...prev, [fid]: next };
    });
  };

  const submit = () => {
    // In the prototype, just log to console
    const payload = selected.map(fid => ({
      facility_id: fid,
      channels: channels[fid],
      packets: Array.from(packets[fid] || []),
      generatePackets,
    }));
    console.log('Create searches:', payload);
    alert(`${payload.length} search(es) created.`);
    onClose();
  };

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label="Add Searches">
      <div className="modal-card">
        <div className="modal-header">
          <h3>Add Searches</h3>
          <button className="icon" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="modal-body">
          <div className="grid">
            <div className="col">
              <input
                type="search"
                placeholder="Search facilities…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="search"
              />
              <div className="list">
                {filtered.map(f => (
                  <label key={f.id} className={`row ${selected.includes(f.id) ? 'selected' : ''}`}>
                    <input type="checkbox" checked={selected.includes(f.id)} onChange={() => toggleSelect(f.id)} />
                    <span className="name">{f.name}</span>
                    <span className="meta">{f.fax || ''}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="col">
              <h4>Channels</h4>
              <label><input type="checkbox" checked={applyToAll.fax} onChange={(e)=>setApplyToAll({...applyToAll, fax:e.target.checked})}/> Apply Fax to all</label>
              <label><input type="checkbox" checked={applyToAll.email} onChange={(e)=>setApplyToAll({...applyToAll, email:e.target.checked})}/> Apply Secure Email to all</label>
              <label><input type="checkbox" checked={applyToAll.emr} onChange={(e)=>setApplyToAll({...applyToAll, emr:e.target.checked})}/> Apply EMR Clinicals to all</label>

              {selected.map(fid => (
                <div className="card" key={fid}>
                  <div className="card-title">{fid}</div>
                  <label><input type="checkbox" checked={(channels[fid]?.fax) ?? applyToAll.fax} onChange={(e)=>setChannels(prev=>({...prev,[fid]:{...(prev[fid]||{}), fax:e.target.checked}}))}/> Fax</label>
                  <label><input type="checkbox" checked={(channels[fid]?.email) ?? applyToAll.email} onChange={(e)=>setChannels(prev=>({...prev,[fid]:{...(prev[fid]||{}), email:e.target.checked}}))}/> Secure Email</label>
                  <label><input type="checkbox" checked={(channels[fid]?.emr) ?? applyToAll.emr} onChange={(e)=>setChannels(prev=>({...prev,[fid]:{...(prev[fid]||{}), emr:e.target.checked}}))}/> EMR Clinicals</label>
                </div>
              ))}
            </div>

            <div className="col">
              <h4>Packet documents</h4>
              <label><input type="checkbox" checked={generatePackets} onChange={(e)=>setGeneratePackets(e.target.checked)} /> Generate packets now</label>
              <div className="packet-list">
                {PACKET_OPTIONS.map(p => (
                  <div key={p.code} className="packet-option">
                    <span className="pkt-label">{p.label}{p.gated ? ` (${p.gated})` : ''}</span>
                    {selected.map(fid => (
                      <label key={fid} className="pkt-check">
                        <input
                          type="checkbox"
                          checked={packets[fid]?.has(p.code) || false}
                          onChange={() => togglePacket(fid, p.code)}
                          disabled={p.gated ? true : false /* prototype gating demo */}
                        />
                        <span className="pkt-fid">{fid}</span>
                      </label>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={submit} disabled={!selected.length}>Create {selected.length || ''} search(es)</button>
        </div>
      </div>
    </div>
  );
};

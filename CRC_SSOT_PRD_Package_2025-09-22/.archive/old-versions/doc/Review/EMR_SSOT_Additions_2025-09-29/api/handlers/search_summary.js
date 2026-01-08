// Server-derived search summary (skeleton)
async function deriveStatusFromEvents(events) {
  // deterministic reduce
  let status = 'DRAFT';
  let selected = null;
  for (const e of events.sort((a,b) => new Date(a.ts)-new Date(b.ts))) {
    switch (e.type) {
      case 'SEARCH_OPENED': status = 'OPEN'; break;
      case 'OUTREACH_SENT': status = 'SEARCHING'; break;
      case 'FACILITY_OFFER_RECORDED': if (status==='SEARCHING') status='OFFER_RECEIVED'; break;
      case 'FACILITY_SELECTED_FOR_TRANSFER': status='SELECTED_FOR_TRANSFER'; selected = e.payload.facilityId; break;
      case 'TRANSFER_SCHEDULED': status='TRANSFER_SCHEDULED'; break;
      case 'TRANSFER_COMPLETED': status='TRANSFERRED'; break;
      case 'SEARCH_CLOSED': status='CLOSED'; break;
      case 'SEARCH_CANCELLED': status='CANCELLED'; break;
      default: break;
    }
  }
  return { status, selectedFacilityId: selected };
}

module.exports = async function getSearchSummary(req, res, db) {
  const id = req.params.id;
  const events = await db.any('select * from bed_search_event where search_id=$1 order by occurred_at asc', [id]);
  const derived = await deriveStatusFromEvents(events.map(e => ({
    ts: e.occurred_at, type: e.event_type, payload: e.payload || {}
  })));

  const version = await db.one('select version from bed_search where id=$1', [id]);
  res.json({
    searchId: id,
    version: version.version,
    status: derived.status,
    selectedFacilityId: derived.selectedFacilityId,
    offers: [],
    lastChangedAt: new Date().toISOString()
  });
};

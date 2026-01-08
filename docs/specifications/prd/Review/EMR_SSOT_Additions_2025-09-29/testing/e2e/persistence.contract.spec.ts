import { test, expect, request } from '@playwright/test';

test('PUT /api/patients/:id persists searches and history', async ({ request }) => {
  const id = 'pt_contract_001';
  const idem = 'contract-' + Date.now();
  const version = 0;

  const payload = {
    id,
    firstName: 'Jordan',
    lastName: 'Quinn',
    mrn: 'MQ-001',
    asamLevel: '3.7',
    searches: [{
      id: 'search_' + Date.now(),
      facilityId: 'FAC_001',
      facilityName: 'CRC',
      status: 'CONTACTED',
      history: [{ ts: new Date().toISOString(), event: 'status_change', user: 'tester' }]
    }],
    searchHistory: [{ ts: new Date().toISOString(), event: 'created', user: 'tester' }]
  };

  const res = await request.put(`/api/patients/${id}`, {
    headers: { 'Idempotency-Key': idem, 'If-Match': String(version), 'Content-Type': 'application/json' },
    data: payload
  });
  expect(res.ok()).toBeTruthy();

  const get = await request.get(`/api/patients/${id}`);
  const body = await get.json();
  expect(body.data?.id).toBe(id);
  expect(Array.isArray(body.data?.searches)).toBeTruthy();
});

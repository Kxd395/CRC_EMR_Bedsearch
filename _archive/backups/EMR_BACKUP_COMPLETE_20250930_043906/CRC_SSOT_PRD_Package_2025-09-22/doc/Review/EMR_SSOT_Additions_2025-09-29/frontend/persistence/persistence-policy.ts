// Persistence policy gate for local caching (default off)
export const CRC_ENABLE_LOCAL_CACHE = (import.meta as any).env?.CRC_ENABLE_LOCAL_CACHE === '1';

// WebCrypto-based AES-GCM encrypt/decrypt helpers (key management external)
export async function encryptJson(json: unknown, cryptoKey: CryptoKey): Promise<{ iv: Uint8Array; data: Uint8Array }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder().encode(JSON.stringify(json));
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, cryptoKey, enc);
  return { iv, data: new Uint8Array(cipher) };
}

export async function decryptJson(payload: { iv: Uint8Array; data: Uint8Array }, cryptoKey: CryptoKey): Promise<unknown> {
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: payload.iv }, cryptoKey, payload.data);
  return JSON.parse(new TextDecoder().decode(new Uint8Array(plain)));
}

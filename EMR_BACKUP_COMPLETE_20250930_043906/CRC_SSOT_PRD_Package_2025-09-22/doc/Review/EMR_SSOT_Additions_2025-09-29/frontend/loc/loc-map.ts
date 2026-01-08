// Canonical LOC mapping (server should source of truth; UI reference only)
export const LOC_MAP: Record<string, string[]> = {
  '3.1': ['OP', 'IOP', 'PHP'],
  '3.5': ['RES', 'RTF', 'LTRES'],
  '3.7': ['IP', 'ACUTE', 'PSY'],
  '3.7WM': ['3.7A'],
  '4.0': ['ICU', 'MICU', 'ACUTE+']
};

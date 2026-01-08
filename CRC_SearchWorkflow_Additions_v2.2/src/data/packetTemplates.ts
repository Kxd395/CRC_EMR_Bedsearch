export type PacketCode =
  | 'CoreSummary'
  | 'ASAM'
  | 'Meds'
  | 'LastDose'
  | 'Vitals24h'
  | 'LabsNonSensitive'
  | 'LabsSUD'
  | 'BHDocs302'
  | 'Demographics'
  | 'ROIForms'
  | 'CoverSheet';

export const PACKET_OPTIONS: { code: PacketCode; label: string; gated?: 'SUD' | 'ROI' | '302' }[] = [
  { code: 'CoreSummary', label: 'Core Clinical Summary' },
  { code: 'ASAM', label: 'ASAM / LOC summary' },
  { code: 'Meds', label: 'Medication list' },
  { code: 'LastDose', label: 'Last methadone / bupe dose' },
  { code: 'Vitals24h', label: 'Vitals (24h)' },
  { code: 'LabsNonSensitive', label: 'Labs — Non-sensitive' },
  { code: 'LabsSUD', label: 'Labs — SUD (screen/confirm)', gated: 'SUD' },
  { code: 'BHDocs302', label: '302 documents', gated: '302' },
  { code: 'Demographics', label: 'Demographics & Insurance' },
  { code: 'ROIForms', label: 'ROI forms', gated: 'ROI' },
  { code: 'CoverSheet', label: 'Facility cover sheet' },
];

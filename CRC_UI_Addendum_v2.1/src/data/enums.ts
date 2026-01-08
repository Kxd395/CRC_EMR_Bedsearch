export type ContactAction =
  | 'Call'
  | 'Fax'
  | 'PacketSent'
  | 'BedSearch'
  | 'Acceptance'
  | 'Denial'
  | 'LeftVoicemail'
  | 'AuthRequest'
  | 'Other';

export type OutcomeStatus =
  | 'Accepted'
  | 'Denied'
  | 'PendingReview'
  | 'NoBeds'
  | 'LeftVoicemail'
  | 'AwaitingFax'
  | 'PacketSent'
  | 'AuthRequired'
  | 'Unknown';

export const STATUS_META: Record<OutcomeStatus, { label: string; color: string; icon: string }> = {
  Accepted: { label: 'Accepted', color: 'var(--ok)', icon: '✓' },
  Denied: { label: 'Denied', color: 'var(--danger)', icon: '⨯' },
  PendingReview: { label: 'Pending Review', color: 'var(--warn)', icon: '⧗' },
  NoBeds: { label: 'No Beds', color: 'var(--muted)', icon: '∅' },
  LeftVoicemail: { label: 'Left VM', color: 'var(--muted-blue)', icon: '☎︎' },
  AwaitingFax: { label: 'Awaiting Fax', color: 'var(--purple)', icon: '🖨' },
  PacketSent: { label: 'Packet Sent', color: 'var(--indigo)', icon: '✉︎' },
  AuthRequired: { label: 'Auth Required', color: 'var(--orange)', icon: '📝' },
  Unknown: { label: 'Unknown', color: 'var(--muted)', icon: '?' },
};

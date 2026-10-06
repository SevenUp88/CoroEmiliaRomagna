export type VoiceSection = 'Soprano' | 'Contralto' | 'Tenore' | 'Baritono' | 'Basso';

export type EventType = 'PROVA' | 'CONCERTO' | 'PROVA_E_CONCERTO' | 'MASTERCLASS';

export type AttendanceStatus = 'SI' | 'NO' | 'FORSE' | 'NON_INDICATO';

export interface AttendanceRecord {
  memberId: string;
  status: AttendanceStatus;
  note?: string;
  updatedAt: string;
}

export interface ChoirMember {
  id: string;
  name: string;
  section: VoiceSection;
  email?: string;
  phone?: string;
  city?: string;
  isSectionLeader?: boolean;
}

export interface ChoirEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "10:00 - 18:00"
  city: string;
  location: string;
  address?: string;
  type: EventType;
  program: string[];
  notes?: string;
  dressCode?: string;
  originalDate?: string; // in case rescheduled
  isRescheduled?: boolean;
}

export interface ScorePiece {
  id: string;
  title: string;
  composer: string;
  period?: string;
  key?: string;
  difficulty?: 'Facile' | 'Medio' | 'Avanzato';
  sectionsAvailable: (VoiceSection | 'TUTTI')[];
  pdfUrl: string;
  driveUrl?: string;
  previewUrl?: string;
  pageCount?: number;
  previewPages?: string[];
  repertoireCategory?: string;
  audioPracticeTracks?: {
    voice: VoiceSection | 'TUTTI';
    label: string;
    duration: string;
    fileUrl: string;
  }[];
  rehearsalNotes?: string;
}

export interface PushNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'urgent' | 'reschedule' | 'score' | 'info';
  targetSection: VoiceSection | 'ALL';
  author: string;
  eventId?: string;
}

export interface AccessibilitySettings {
  fontSize: 'normal' | 'large' | 'extra-large';
  highContrast: boolean;
  hapticFeedback: boolean;
  theme?: 'light' | 'dark';
}

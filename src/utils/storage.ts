import { AttendanceRecord, ChoirEvent, ChoirMember, PushNotification, AccessibilitySettings, ScorePiece } from '../types';
import { INITIAL_EVENTS, INITIAL_MEMBERS, generateInitialAttendance, INITIAL_NOTIFICATIONS, INITIAL_SCORES } from '../data/initialData';

const KEYS = {
  CURRENT_USER: 'crer_current_user_id_v3',
  MEMBERS: 'crer_members_list_v5',
  ATTENDANCE: 'crer_attendance_records_v6',
  EVENTS: 'crer_events_list_v6',
  NOTIFICATIONS: 'crer_notifications_v5',
  ACCESSIBILITY: 'crer_accessibility_settings',
  SCORES: 'crer_scores_list_v3'
};

export const getStoredCurrentUser = (): string => {
  return localStorage.getItem(KEYS.CURRENT_USER) || '';
};

export const setStoredCurrentUser = (userId: string): void => {
  localStorage.setItem(KEYS.CURRENT_USER, userId);
};

export const getStoredMembers = (): ChoirMember[] => {
  try {
    const data = localStorage.getItem(KEYS.MEMBERS);
    if (data) {
      const parsed: ChoirMember[] = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge with INITIAL_MEMBERS and ensure no fictitious phone numbers persist
        const map = new Map<string, ChoirMember>();
        INITIAL_MEMBERS.forEach((m) => map.set(m.id, m));
        parsed.forEach((m) => {
          // If phone was from original mock generation, omit it
          if (m.phone && (
            m.phone.includes('1234567') ||
            m.phone.includes('2345678') ||
            m.phone.includes('3456789') ||
            m.phone.includes('4567890') ||
            m.phone.includes('5678901') ||
            m.phone.includes('1122334') ||
            m.phone.includes('2233445') ||
            m.phone.includes('3344556') ||
            m.phone.includes('4455667') ||
            m.phone.includes('5566778') ||
            m.phone.includes('6677889') ||
            m.phone.includes('7788990') ||
            m.phone.includes('8899001') ||
            m.phone.includes('1010101') ||
            m.phone.includes('1212121') ||
            m.phone.includes('1313131') ||
            m.phone.includes('1414141') ||
            m.phone.includes('1515151') ||
            m.phone.includes('1616161') ||
            m.phone.includes('1717171') ||
            m.phone.includes('1818181') ||
            m.phone.includes('1919191') ||
            m.phone.includes('2020202') ||
            m.phone.includes('2121212') ||
            m.phone.includes('2222222') ||
            m.phone.includes('2323232') ||
            m.phone.includes('2424242') ||
            m.phone.includes('2525252') ||
            m.phone.includes('2626262') ||
            m.phone.includes('2727272') ||
            m.phone.includes('2828282') ||
            m.phone.includes('2929292') ||
            m.phone.includes('3030303') ||
            m.phone.includes('3131313') ||
            m.phone.includes('3232323') ||
            m.phone.includes('3333333') ||
            m.phone.includes('3434343') ||
            m.phone.includes('3535353') ||
            m.phone.includes('40404') ||
            m.phone.includes('50505')
          )) {
            const { phone, ...cleanMember } = m;
            map.set(m.id, cleanMember as ChoirMember);
          } else {
            map.set(m.id, m);
          }
        });
        return Array.from(map.values());
      }
    }
  } catch (e) {
    console.error('Failed reading stored members', e);
  }
  return INITIAL_MEMBERS;
};

export const saveStoredMembers = (members: ChoirMember[]): void => {
  localStorage.setItem(KEYS.MEMBERS, JSON.stringify(members));
};

export const getStoredAttendance = (): Record<string, Record<string, AttendanceRecord>> => {
  try {
    const data = localStorage.getItem(KEYS.ATTENDANCE);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed reading stored attendance', e);
  }
  const initial = generateInitialAttendance();
  localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(initial));
  return initial;
};

export const saveStoredAttendance = (attendance: Record<string, Record<string, AttendanceRecord>>): void => {
  localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(attendance));
};

export const clearStoredAttendance = (
  members: ChoirMember[],
  events: ChoirEvent[]
): Record<string, Record<string, AttendanceRecord>> => {
  const clean: Record<string, Record<string, AttendanceRecord>> = {};
  events.forEach((ev) => {
    clean[ev.id] = {};
    members.forEach((m) => {
      clean[ev.id][m.id] = {
        memberId: m.id,
        status: 'NON_INDICATO',
        updatedAt: new Date().toISOString()
      };
    });
  });
  localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(clean));
  return clean;
};

export const getStoredScores = (): ScorePiece[] => {
  try {
    const data = localStorage.getItem(KEYS.SCORES);
    if (data) {
      const parsed: ScorePiece[] = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Strip any old fictitious demo scores
        const cleaned = parsed.filter(
          (s) => !['score-1', 'score-2', 'score-3', 'score-4', 'score-5'].includes(s.id)
        );
        const map = new Map<string, ScorePiece>();
        INITIAL_SCORES.forEach((s) => map.set(s.id, s));
        cleaned.forEach((s) => {
          const initial = map.get(s.id);
          if (initial) {
            map.set(s.id, { ...initial, ...s, previewUrl: s.previewUrl || initial.previewUrl });
          } else {
            map.set(s.id, s);
          }
        });
        const merged = Array.from(map.values());
        localStorage.setItem(KEYS.SCORES, JSON.stringify(merged));
        return merged;
      }
    }
  } catch (e) {
    console.error('Failed reading stored scores', e);
  }
  localStorage.setItem(KEYS.SCORES, JSON.stringify(INITIAL_SCORES));
  return INITIAL_SCORES;
};

export const saveStoredScores = (scores: ScorePiece[]): void => {
  localStorage.setItem(KEYS.SCORES, JSON.stringify(scores));
};

export const getStoredEvents = (): ChoirEvent[] => {
  try {
    const data = localStorage.getItem(KEYS.EVENTS) || localStorage.getItem('crer_events_list_v4');
    if (data) {
      const parsed: ChoirEvent[] = JSON.parse(data);
      // Strip any past September rehearsals or obsolete events
      const validEvents = parsed.filter(
        (ev) => ev.date >= '2026-10-01' && ev.id !== 'ev-11' && ev.city !== 'Ferrara' && ev.id !== 'ev-13'
      );

      // Ensure new October Misa Tango events exist
      const hasOct24 = validEvents.some((ev) => ev.id === 'ev-13-masterclass' || ev.date === '2026-10-24');
      const baseEvents = hasOct24
        ? validEvents
        : [
            ...validEvents,
            ...INITIAL_EVENTS.filter((ev) => ev.id === 'ev-13-masterclass' || ev.id === 'ev-13-concerto')
          ];

      // Standardize rehearsal names strictly as requested by user:
      // "le prove si chiamano tutte 'Prove d'insieme'... qualora dovesse essere prova + concerto nello stesso giorno le puoi chiamare 'prove generali'"
      const standardized = baseEvents.map((ev) => {
        let title = ev.title;
        let program = ev.program;
        let notes = ev.notes;

        if (ev.type === 'PROVA') {
          title = "Prove d'insieme";
        } else if (ev.type === 'PROVA_E_CONCERTO') {
          title = 'Prove generali';
        }

        // 1 Novembre: Requiem di Mozart
        if (ev.date === '2026-11-01' || ev.id === 'ev-14') {
          program = ['Wolfgang Amadeus Mozart: Requiem in Re minore K 626'];
          notes = 'Concerto Commemorativo: Esecuzione integrale del Requiem in Re minore K 626 di W. A. Mozart. Prove generali alle 15:30 e concerto alle 20:30.';
        }

        return { ...ev, title, program, notes };
      }).sort((a, b) => a.date.localeCompare(b.date));

      if (standardized.length > 0) {
        localStorage.setItem(KEYS.EVENTS, JSON.stringify(standardized));
        return standardized;
      }
    }
  } catch (e) {
    console.error('Failed reading stored events', e);
  }
  localStorage.setItem(KEYS.EVENTS, JSON.stringify(INITIAL_EVENTS));
  return INITIAL_EVENTS;
};

export const saveStoredEvents = (events: ChoirEvent[]): void => {
  localStorage.setItem(KEYS.EVENTS, JSON.stringify(events));
};

export const getStoredNotifications = (): PushNotification[] => {
  try {
    const data = localStorage.getItem(KEYS.NOTIFICATIONS);
    if (data) {
      const parsed: PushNotification[] = JSON.parse(data);
      if (Array.isArray(parsed)) {
        // Ensure new initial notification exists
        const hasMisaNotif = parsed.some((n) => n.id === 'notif-misa-tango-24-25');
        if (!hasMisaNotif) {
          const updated = [INITIAL_NOTIFICATIONS[0], ...parsed];
          localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(updated));
          return updated;
        }
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed reading stored notifications', e);
  }
  localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
  return INITIAL_NOTIFICATIONS;
};

export const saveStoredNotifications = (notifications: PushNotification[]): void => {
  localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(notifications));
};

export const getStoredAccessibility = (): AccessibilitySettings => {
  try {
    const data = localStorage.getItem(KEYS.ACCESSIBILITY);
    if (data) {
      const parsed = JSON.parse(data);
      return {
        fontSize: 'normal',
        highContrast: false,
        hapticFeedback: true,
        theme: 'light',
        ...parsed
      };
    }
  } catch (e) {
    console.error('Failed reading accessibility settings', e);
  }
  return {
    fontSize: 'normal',
    highContrast: false,
    hapticFeedback: true,
    theme: 'light'
  };
};

export const saveStoredAccessibility = (settings: AccessibilitySettings): void => {
  localStorage.setItem(KEYS.ACCESSIBILITY, JSON.stringify(settings));
};

/**
 * Exports attendance matrix directly to Excel-friendly CSV with proper UTF-8 BOM
 */
export function exportAttendanceToCSV(
  members: ChoirMember[],
  events: ChoirEvent[],
  attendance: Record<string, Record<string, AttendanceRecord>>
): void {
  // Build header row: Sezione, Nome, Città, [Event 1 Date & Title], [Event 2 Date & Title]...
  const headers = ['Sezione', 'Nome Corista', 'Città', 'Telefono'];
  events.forEach((ev) => {
    headers.push(`"${ev.date} - ${ev.city} (${ev.type})"`);
  });

  const rows: string[] = [];
  rows.push(headers.join(';'));

  // Group by voice section
  const sections: Array<'Soprano' | 'Contralto' | 'Tenore' | 'Baritono' | 'Basso'> = [
    'Soprano',
    'Contralto',
    'Tenore',
    'Baritono',
    'Basso'
  ];

  sections.forEach((section) => {
    const sectionMembers = members.filter((m) => m.section === section);
    sectionMembers.forEach((member) => {
      const row = [
        `"${member.section}"`,
        `"${member.name}"`,
        `"${member.city || ''}"`,
        `"${member.phone || ''}"`
      ];

      events.forEach((ev) => {
        const record = attendance[ev.id]?.[member.id];
        let val = 'NON INDICATO';
        if (record?.status === 'SI') val = 'SI' + (record.note ? ` (${record.note})` : '');
        else if (record?.status === 'NO') val = 'NO' + (record.note ? ` (${record.note})` : '');
        else if (record?.status === 'FORSE') val = 'FORSE' + (record.note ? ` (${record.note})` : '');
        row.push(`"${val}"`);
      });

      rows.push(row.join(';'));
    });
  });

  // Add summary rows at the bottom
  rows.push('');
  const summaryHeader = ['"RIEPILOGO PRESENZE PRESENTI (SI)"', '""', '""', '""'];
  events.forEach((ev) => {
    let presentCount = 0;
    members.forEach((m) => {
      if (attendance[ev.id]?.[m.id]?.status === 'SI') presentCount++;
    });
    summaryHeader.push(`"Totale: ${presentCount}/${members.length}"`);
  });
  rows.push(summaryHeader.join(';'));

  // CSV content with UTF-8 BOM for Microsoft Excel compatibility
  const csvContent = '\uFEFF' + rows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `CRER_Presenze_Coro_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generates an iCalendar (.ics) file for an event
 */
export function generateICalendar(event: ChoirEvent): void {
  const cleanDate = event.date.replace(/-/g, '');
  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Coro Regionale Emilia-Romagna//Calendario Prove//IT',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:crer-event-${event.id}@cororegionale-er.it`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`,
    `DTSTART;VALUE=DATE:${cleanDate}`,
    `SUMMARY:CRER: ${event.title} (${event.type})`,
    `DESCRIPTION:${event.type} del Coro Regionale Emilia-Romagna\\nOrario: ${event.time}\\nProgramma: ${event.program.join(', ')}\\n${event.notes || ''}`,
    `LOCATION:${event.location}, ${event.address || event.city}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ];

  const blob = new Blob([icsLines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `CRER_${event.city}_${event.date}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

import { ChoirEvent } from '../types';

export interface CalendarTimeData {
  startISO: string;
  endISO: string;
  startGoogle: string;
  endGoogle: string;
  cleanDate: string;
}

/**
 * Parses event date and complex time strings (e.g. "10:00 - 17:30", "15:30 (Prova) - 20:30 (Concerto)")
 */
export function parseEventTime(dateStr: string, timeStr: string): CalendarTimeData {
  const cleanDate = dateStr.replace(/-/g, ''); // "20260927"
  const timeMatches = Array.from(timeStr.matchAll(/(\d{1,2})[:.](\d{2})/g));

  let startHour = 10;
  let startMinute = 0;
  let endHour = 18;
  let endMinute = 0;

  if (timeMatches.length >= 1) {
    startHour = parseInt(timeMatches[0][1], 10);
    startMinute = parseInt(timeMatches[0][2], 10);
    endHour = Math.min(23, startHour + 3);
    endMinute = startMinute;
  }
  if (timeMatches.length >= 2) {
    endHour = parseInt(timeMatches[1][1], 10);
    endMinute = parseInt(timeMatches[1][2], 10);
  }

  const pad = (n: number) => n.toString().padStart(2, '0');

  const startGoogle = `${cleanDate}T${pad(startHour)}${pad(startMinute)}00`;
  const endGoogle = `${cleanDate}T${pad(endHour)}${pad(endMinute)}00`;
  const startISO = `${dateStr}T${pad(startHour)}:${pad(startMinute)}:00`;
  const endISO = `${dateStr}T${pad(endHour)}:${pad(endMinute)}:00`;

  return { startISO, endISO, startGoogle, endGoogle, cleanDate };
}

/**
 * Builds direct 1-click Google Calendar creation URL
 */
export function buildGoogleCalendarUrl(event: ChoirEvent): string {
  const { startGoogle, endGoogle } = parseEventTime(event.date, event.time);
  const typeLabel = event.type.replace(/_/g, ' ');
  const title = `CRER: ${event.city} - ${event.title} (${typeLabel})`;

  const detailsList = [
    `🎵 Coro Regionale dell'Emilia-Romagna`,
    `Evento: ${event.title} (${typeLabel})`,
    `Data e Orario: ${event.date} · ${event.time}`,
    `Sede: ${event.location}`,
    event.address ? `Indirizzo: ${event.address}` : '',
    event.dressCode ? `Abbigliamento / Divisa: ${event.dressCode}` : '',
    event.program && event.program.length > 0 ? `Programma: ${event.program.join(' · ')}` : '',
    event.notes ? `Note per i Coristi: ${event.notes}` : ''
  ].filter(Boolean);

  const location = event.address
    ? `${event.location}, ${event.address}`
    : `${event.location}, ${event.city}`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${startGoogle}/${endGoogle}`,
    ctz: 'Europe/Rome',
    details: detailsList.join('\n\n'),
    location: location
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Builds direct 1-click Outlook / Microsoft 365 URL
 */
export function buildOutlookCalendarUrl(event: ChoirEvent): string {
  const { startISO, endISO } = parseEventTime(event.date, event.time);
  const typeLabel = event.type.replace(/_/g, ' ');
  const title = `CRER: ${event.city} - ${event.title} (${typeLabel})`;
  const location = event.address
    ? `${event.location}, ${event.address}`
    : `${event.location}, ${event.city}`;

  const detailsList = [
    `Coro Regionale dell'Emilia-Romagna`,
    `Evento: ${event.title} (${typeLabel})`,
    `Orario: ${event.time}`,
    `Sede: ${event.location}`,
    event.program && event.program.length > 0 ? `Programma: ${event.program.join(' · ')}` : '',
    event.notes ? `Note: ${event.notes}` : ''
  ].filter(Boolean);

  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    startdt: startISO,
    enddt: endISO,
    subject: title,
    body: detailsList.join('\n'),
    location: location
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/**
 * Builds direct 1-click Yahoo Calendar URL
 */
export function buildYahooCalendarUrl(event: ChoirEvent): string {
  const { startGoogle, endGoogle } = parseEventTime(event.date, event.time);
  const typeLabel = event.type.replace(/_/g, ' ');
  const title = `CRER: ${event.city} - ${event.title} (${typeLabel})`;
  const location = event.address
    ? `${event.location}, ${event.address}`
    : `${event.location}, ${event.city}`;

  const params = new URLSearchParams({
    v: '60',
    title: title,
    st: startGoogle,
    et: endGoogle,
    desc: `Coro Regionale Emilia-Romagna - ${event.time} - ${event.program.join(', ')}`,
    in_loc: location
  });

  return `https://calendar.yahoo.com/?${params.toString()}`;
}

/**
 * Direct Apple Calendar / iOS / macOS calendar invocation
 */
export function openAppleCalendarDirect(event: ChoirEvent): void {
  const { startGoogle, endGoogle } = parseEventTime(event.date, event.time);
  const typeLabel = event.type.replace(/_/g, ' ');
  const title = `CRER: ${event.city} - ${event.title} (${typeLabel})`;
  const location = event.address
    ? `${event.location}, ${event.address}`
    : `${event.location}, ${event.city}`;

  const description = [
    `Coro Regionale dell'Emilia-Romagna`,
    `Orario: ${event.time}`,
    event.program && event.program.length > 0 ? `Programma: ${event.program.join(', ')}` : '',
    event.notes || ''
  ].filter(Boolean).join('\\n');

  const icsData = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Coro Regionale Emilia-Romagna//Calendario Direct//IT',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:crer-${event.id}-${Date.now()}@cororegionale-er.it`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`,
    `DTSTART;TZID=Europe/Rome:${startGoogle}`,
    `DTEND;TZID=Europe/Rome:${endGoogle}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.setAttribute('download', `CRER_${event.city}_${event.date}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Returns current date formatted as YYYY-MM-DD in local time
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Finds the next upcoming event chronologically from today.
 * If all events are in the past, returns the most recent one or the first.
 */
export function getNextUpcomingEvent(events: ChoirEvent[]): ChoirEvent | undefined {
  if (events.length === 0) return undefined;
  const sorted = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const todayStr = getTodayDateString();
  const upcoming = sorted.find((e) => e.date >= todayStr);
  return upcoming || sorted[sorted.length - 1] || sorted[0];
}

import React, { useState } from 'react';
import { ChoirEvent, ChoirMember, AttendanceRecord, AttendanceStatus } from '../types';
import {
  buildGoogleCalendarUrl,
  buildOutlookCalendarUrl,
  buildYahooCalendarUrl,
  openAppleCalendarDirect,
  getTodayDateString,
  getNextUpcomingEvent
} from '../utils/calendar';
import {
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Download,
  Music,
  ExternalLink,
  ChevronRight,
  Info,
  Sparkles,
  CalendarCheck,
  CalendarPlus,
  AlertCircle,
  UserPlus,
  Plus,
  Edit3
} from 'lucide-react';
import { LocationNavigatorModal } from './LocationNavigatorModal';
import { AddToCalendarModal } from './AddToCalendarModal';
import { MonthCalendarView } from './MonthCalendarView';

interface CalendarViewProps {
  events: ChoirEvent[];
  currentUser: ChoirMember | null;
  attendance: Record<string, Record<string, AttendanceRecord>>;
  onUpdateAttendance: (eventId: string, status: AttendanceStatus, note?: string) => void;
  onOpenIdentityModal: () => void;
  isDirector: boolean;
  isAdmin?: boolean;
  onSelectEventForDirector?: (eventId: string) => void;
  onOpenEventEditor?: (eventToEdit: ChoirEvent | null) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  currentUser,
  attendance,
  onUpdateAttendance,
  onOpenIdentityModal,
  isDirector,
  isAdmin = false,
  onSelectEventForDirector,
  onOpenEventEditor
}) => {
  const isPrivilegedUser = isDirector || isAdmin;
  const [viewMode, setViewMode] = useState<'list' | 'month'>('list');
  const [filterType, setFilterType] = useState<'ALL' | 'UPCOMING' | 'PROVA' | 'CONCERTO' | 'MY_YES'>('ALL');
  const [activeNoteModalEvent, setActiveNoteModalEvent] = useState<ChoirEvent | null>(null);
  const [customNote, setCustomNote] = useState('');
  const [selectedEventDetails, setSelectedEventDetails] = useState<ChoirEvent | null>(null);
  const [selectedNavEvent, setSelectedNavEvent] = useState<ChoirEvent | null>(null);
  const [selectedCalendarEvent, setSelectedCalendarEvent] = useState<ChoirEvent | null>(null);
  const [calendarToast, setCalendarToast] = useState<string | null>(null);

  const showCalendarFeedback = (serviceName: string) => {
    setCalendarToast(`Apertura diretta in ${serviceName}... Premi Salva per confermare.`);
    setTimeout(() => {
      setCalendarToast(null);
    }, 4000);
  };

  const handleAddEventToCalendar = (event: ChoirEvent) => {
    const remember = localStorage.getItem('crer_remember_calendar_pref') === 'true';
    const pref = localStorage.getItem('crer_preferred_calendar');

    if (remember && pref) {
      if (pref === 'google') {
        window.open(buildGoogleCalendarUrl(event), '_blank', 'noopener,noreferrer');
        showCalendarFeedback('Google Calendar');
        return;
      }
      if (pref === 'outlook') {
        window.open(buildOutlookCalendarUrl(event), '_blank', 'noopener,noreferrer');
        showCalendarFeedback('Outlook');
        return;
      }
      if (pref === 'yahoo') {
        window.open(buildYahooCalendarUrl(event), '_blank', 'noopener,noreferrer');
        showCalendarFeedback('Yahoo');
        return;
      }
      if (pref === 'apple') {
        openAppleCalendarDirect(event);
        showCalendarFeedback('Apple Calendar');
        return;
      }
    }

    setSelectedCalendarEvent(event);
  };

  // Sort events chronologically
  const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Real current date and next upcoming event (dynamically calculated)
  const todayStr = getTodayDateString();
  const nextEvent = getNextUpcomingEvent(events);
  const upcomingEventsCount = sortedEvents.filter((ev) => ev.date >= todayStr).length;

  // Calculate attendees for nextEvent
  let nextPresentCount = 0;
  let nextAbsentCount = 0;
  let nextMaybeCount = 0;
  if (nextEvent) {
    Object.values(attendance[nextEvent.id] || {}).forEach((rec) => {
      if (rec.status === 'SI') nextPresentCount++;
      else if (rec.status === 'NO') nextAbsentCount++;
      else if (rec.status === 'FORSE') nextMaybeCount++;
    });
  }

  const handlePresenceClick = (eventId: string, status: AttendanceStatus, noteText?: string) => {
    if (!currentUser && !isDirector) {
      onOpenIdentityModal();
      return;
    }

    if (status === 'FORSE' || noteText !== undefined) {
      const existing = currentUser ? attendance[eventId]?.[currentUser.id]?.note : '';
      setCustomNote(noteText || existing || '');
      const ev = events.find((e) => e.id === eventId);
      if (ev) setActiveNoteModalEvent(ev);
      return;
    }

    onUpdateAttendance(eventId, status);
  };

  const saveCustomNote = () => {
    if (activeNoteModalEvent) {
      onUpdateAttendance(activeNoteModalEvent.id, 'FORSE', customNote);
      setActiveNoteModalEvent(null);
      setCustomNote('');
    }
  };

  // Filter events
  const filteredEvents = sortedEvents.filter((ev) => {
    if (filterType === 'UPCOMING') return ev.date >= todayStr;
    if (filterType === 'PROVA') return ev.type === 'PROVA';
    if (filterType === 'CONCERTO') return ev.type === 'CONCERTO' || ev.type === 'PROVA_E_CONCERTO';
    if (filterType === 'MY_YES' && currentUser) {
      return attendance[ev.id]?.[currentUser.id]?.status === 'SI';
    }
    return true;
  });

  // Calculate my stats
  let myYesCount = 0;
  let myNoCount = 0;
  if (currentUser) {
    events.forEach((ev) => {
      const st = attendance[ev.id]?.[currentUser.id]?.status;
      if (st === 'SI') myYesCount++;
      if (st === 'NO') myNoCount++;
    });
  }

  const formatEventDate = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split('-');
      const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return d.toLocaleDateString('it-IT', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Avviso Primo Accesso (solo per coristi che non hanno ancora impostato il profilo) */}
      {!currentUser && !isPrivilegedUser && (
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border-2 border-teal-600/40 rounded-2xl p-5 text-teal-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-teal-700 text-white flex items-center justify-center shrink-0 mt-0.5">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-teal-950 leading-snug">Primo Accesso al Portale CRER</h2>
              <p className="text-sm text-teal-800 mt-0.5 max-w-2xl">
                Inserisci <strong>Nome, Cognome, Città di Residenza e Sezione Vocale</strong> per iniziare a confermare la tua presenza. I tuoi dati resteranno salvati automaticamente su questo dispositivo.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenIdentityModal}
            className="w-full sm:w-auto px-6 py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm sm:text-base rounded-xl transition-all shadow-sm hover:shadow-md shrink-0 flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Inserisci i tuoi Dati</span>
          </button>
        </div>
      )}

      {/* Prossimo Appuntamento in Evidenza (Hero Card) */}
      {nextEvent && (
        <div className="bg-gradient-to-br from-teal-900 via-teal-800 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-teal-700/50 relative overflow-hidden">
          {/* Subtle decorative glow */}
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-teal-600/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-bold tracking-wider uppercase text-teal-200 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                {nextEvent.date === todayStr
                  ? '🔴 Oggi in Programma'
                  : nextEvent.date > todayStr
                  ? 'Prossimo Appuntamento in Calendario'
                  : 'Ultimo Appuntamento del Calendario'}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
              {nextEvent.city.toUpperCase()}: {nextEvent.title}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm text-teal-100 my-4 py-3 border-y border-white/15">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-teal-300 shrink-0" />
                <span className="capitalize font-semibold text-white">
                  {formatEventDate(nextEvent.date)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal-300 shrink-0" />
                <span>Orario: {nextEvent.time}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNavEvent(nextEvent)}
                className="flex items-center gap-2 text-white hover:text-teal-200 transition-colors text-left group cursor-pointer"
                title="Apri itinerario e posizione con Google Maps, Apple Maps o Waze"
              >
                <MapPin className="w-5 h-5 text-teal-300 group-hover:scale-110 transition-transform shrink-0" />
                <span className="truncate font-semibold text-xs sm:text-sm underline decoration-teal-400/50 underline-offset-2">
                  {nextEvent.location}
                </span>
                <span className="text-[10px] bg-teal-800/80 border border-teal-600/50 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-teal-200 shrink-0">
                  Navigatore
                </span>
              </button>
            </div>

            {/* SEZIONE PRESENZA: Coristi vedono la richiesta di presenza; Direttore e Admin vedono il riepilogo coro */}
            {!isPrivilegedUser ? (
              <div className="mt-5 bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/20">
                <div className="text-sm font-bold text-white mb-3 flex items-center justify-between">
                  <span>
                    {currentUser ? `Conferma la tua presenza, ${currentUser.name.split(' ')[0]}:` : 'Indica se ci sarai:'}
                  </span>
                  {currentUser && attendance[nextEvent.id]?.[currentUser.id]?.status && (
                    <span className="text-xs bg-white/20 px-2.5 py-1 rounded-lg">
                      Stato attuale: {attendance[nextEvent.id][currentUser.id].status === 'SI' ? '✅ SARÒ PRESENTE' : attendance[nextEvent.id][currentUser.id].status === 'NO' ? '❌ NON CI SARÒ' : '⚠️ FORSE'}
                      {attendance[nextEvent.id][currentUser.id].note ? ` ("${attendance[nextEvent.id][currentUser.id].note}")` : ''}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* SARÒ PRESENTE */}
                  <button
                    onClick={() => handlePresenceClick(nextEvent.id, 'SI')}
                    className={`min-h-[52px] sm:min-h-[58px] px-4 py-3 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2.5 shadow-sm active:scale-98 ${
                      currentUser && attendance[nextEvent.id]?.[currentUser.id]?.status === 'SI'
                        ? 'bg-emerald-500 text-white ring-4 ring-emerald-300 font-extrabold shadow-lg'
                        : 'bg-emerald-600/90 hover:bg-emerald-600 text-white hover:shadow-md'
                    }`}
                  >
                    <CheckCircle2 className="w-6 h-6 shrink-0" />
                    <span>SARÒ PRESENTE</span>
                  </button>

                  {/* NON CI SARÒ */}
                  <button
                    onClick={() => handlePresenceClick(nextEvent.id, 'NO')}
                    className={`min-h-[52px] sm:min-h-[58px] px-4 py-3 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2.5 shadow-sm active:scale-98 ${
                      currentUser && attendance[nextEvent.id]?.[currentUser.id]?.status === 'NO'
                        ? 'bg-rose-600 text-white ring-4 ring-rose-300 font-extrabold shadow-lg'
                        : 'bg-white/20 hover:bg-rose-700/80 text-white'
                    }`}
                  >
                    <XCircle className="w-6 h-6 shrink-0" />
                    <span>NON CI SARÒ</span>
                  </button>

                  {/* FORSE / NOTA */}
                  <button
                    onClick={() => handlePresenceClick(nextEvent.id, 'FORSE')}
                    className={`min-h-[52px] sm:min-h-[58px] px-4 py-3 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2.5 shadow-sm active:scale-98 ${
                      currentUser && attendance[nextEvent.id]?.[currentUser.id]?.status === 'FORSE'
                        ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-300 font-extrabold shadow-lg'
                        : 'bg-white/20 hover:bg-amber-600/80 text-white'
                    }`}
                  >
                    <HelpCircle className="w-6 h-6 shrink-0" />
                    <span>FORSE / NOTA</span>
                  </button>
                </div>

                {/* Azioni rapide corista: aggiungi al calendario & dettagli */}
                <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-white/10 text-xs text-teal-200">
                  <button
                    onClick={() => handleAddEventToCalendar(nextEvent)}
                    className="hover:text-white flex items-center gap-1.5 font-semibold underline decoration-teal-400 underline-offset-4 cursor-pointer"
                    title="Aggiungi direttamente al tuo calendario Google, Apple o Outlook"
                  >
                    <CalendarPlus className="w-4 h-4 text-teal-300" />
                    Aggiungi al mio calendario
                  </button>

                  <button
                    onClick={() => setSelectedEventDetails(nextEvent)}
                    className="hover:text-white flex items-center gap-1 font-semibold"
                  >
                    Vedi programma brani & note complete
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* Pannello Direttore / Admin: visualizzazione riepilogo presenze coristi (senza richiesta presenza) */
              <div className="mt-5 bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-white">
                      Riepilogo Presenze Coristi
                    </span>
                  </div>
                  <div className="text-xs text-teal-200">
                    {nextPresentCount} coristi hanno già confermato la presenza
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <div className="bg-emerald-950/40 border border-emerald-400/30 rounded-xl p-3 text-center">
                    <div className="text-xl sm:text-2xl font-black text-emerald-300">{nextPresentCount}</div>
                    <div className="text-[11px] sm:text-xs text-emerald-100 font-semibold">Presenti (SI)</div>
                  </div>

                  <div className="bg-rose-950/40 border border-rose-400/30 rounded-xl p-3 text-center">
                    <div className="text-xl sm:text-2xl font-black text-rose-300">{nextAbsentCount}</div>
                    <div className="text-[11px] sm:text-xs text-rose-100 font-semibold">Assenti (NO)</div>
                  </div>

                  <div className="bg-amber-950/40 border border-amber-400/30 rounded-xl p-3 text-center">
                    <div className="text-xl sm:text-2xl font-black text-amber-300">{nextMaybeCount}</div>
                    <div className="text-[11px] sm:text-xs text-amber-100 font-semibold">Note / In dubbio</div>
                  </div>
                </div>

                {/* Azioni rapide per Direzione & Amministrazione */}
                <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-white/10 text-xs text-teal-200">
                  <button
                    onClick={() => handleAddEventToCalendar(nextEvent)}
                    className="hover:text-white flex items-center gap-1.5 font-semibold underline decoration-teal-400 underline-offset-4 cursor-pointer"
                    title="Aggiungi direttamente al tuo calendario Google, Apple o Outlook"
                  >
                    <CalendarPlus className="w-4 h-4 text-teal-300" />
                    Aggiungi al calendario
                  </button>

                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    {onOpenEventEditor && (
                      <button
                        onClick={() => onOpenEventEditor(nextEvent)}
                        className="text-teal-950 bg-teal-200 hover:bg-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-xs"
                        title="Modifica scaletta brani e orari"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Modifica Scaletta Prova</span>
                      </button>
                    )}

                    {onSelectEventForDirector && (
                      <button
                        onClick={() => onSelectEventForDirector(nextEvent.id)}
                        className="text-teal-950 bg-white hover:bg-teal-100 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-xs"
                        title="Visualizza analisi presenze per sezione vocale"
                      >
                        <span>Analizza Sezioni →</span>
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedEventDetails(nextEvent)}
                      className="hover:text-white flex items-center gap-1 font-semibold"
                    >
                      Programma e note complete
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Barra Filtri Calendario & Tasto Nuovo Impegno Direttore */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${
              filterType === 'ALL'
                ? 'bg-teal-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Tutti gli Appuntamenti ({events.length})
          </button>
          <button
            onClick={() => setFilterType('UPCOMING')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${
              filterType === 'UPCOMING'
                ? 'bg-teal-800 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            Prossimi ({upcomingEventsCount})
          </button>
          <button
            onClick={() => setFilterType('PROVA')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${
              filterType === 'PROVA'
                ? 'bg-teal-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Prove d'insieme
          </button>
          <button
            onClick={() => setFilterType('CONCERTO')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${
              filterType === 'CONCERTO'
                ? 'bg-teal-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Prove generali & Concerti
          </button>
          {currentUser && !isPrivilegedUser && (
            <button
              onClick={() => setFilterType('MY_YES')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${
                filterType === 'MY_YES'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              Confermati da me ({myYesCount})
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-teal-950 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Elenco
            </button>
            <button
              type="button"
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'month'
                  ? 'bg-teal-800 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Calendario</span>
            </button>
          </div>

          {isDirector && onOpenEventEditor && (
            <button
              onClick={() => onOpenEventEditor(null)}
              className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              title="Inserisci una nuova prova o concerto nel calendario"
            >
              <Plus className="w-4 h-4" />
              <span>+ Nuovo Impegno</span>
            </button>
          )}

          <div className="text-xs text-slate-500 hidden lg:flex items-center gap-1 font-medium ml-1">
            <span>Stagione 2026</span>
          </div>
        </div>
      </div>

      {/* Vista Calendario Mensile oppure Vista Elenco */}
      {viewMode === 'month' ? (
        <MonthCalendarView
          events={events}
          currentUser={currentUser}
          attendance={attendance}
          isDirector={isDirector}
          isAdmin={isAdmin}
          onSelectEvent={(ev) => setSelectedEventDetails(ev)}
          onSelectNavEvent={(ev) => setSelectedNavEvent(ev)}
          onUpdateAttendance={onUpdateAttendance}
          onOpenEventEditor={onOpenEventEditor}
          onSelectEventForDirector={onSelectEventForDirector}
          onAddEventToCalendar={handleAddEventToCalendar}
          onSwitchToList={() => setViewMode('list')}
        />
      ) : (
        /* Elenco Completo Eventi */
        <div className="space-y-4">
          {filteredEvents.map((ev, index) => {
          const userStatus = currentUser ? attendance[ev.id]?.[currentUser.id]?.status : null;
          const userNote = currentUser ? attendance[ev.id]?.[currentUser.id]?.note : null;
          const isPast = ev.date < todayStr;
          const isNextUpcoming = nextEvent?.id === ev.id && !isPast;

          // Count overall attendees for this event
          let presentCount = 0;
          let absentCount = 0;
          let maybeCount = 0;
          Object.values(attendance[ev.id] || {}).forEach((rec) => {
            if (rec.status === 'SI') presentCount++;
            else if (rec.status === 'NO') absentCount++;
            else if (rec.status === 'FORSE') maybeCount++;
          });

          return (
            <div
              key={ev.id}
              className={`bg-white rounded-2xl border transition-all p-4 sm:p-6 shadow-xs hover:shadow-md ${
                isNextUpcoming
                  ? 'ring-2 ring-emerald-500/80 border-emerald-400 bg-emerald-50/15'
                  : isPast
                  ? 'border-slate-200 bg-slate-50/60 opacity-90'
                  : ev.isRescheduled
                  ? 'border-amber-400 bg-amber-50/20'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                
                {/* Dettaglio Sinistro Evento */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-md">
                      #{index + 1}
                    </span>
                    {isNextUpcoming && (
                      <span className="text-xs font-extrabold bg-emerald-700 text-white px-2.5 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                        ★ PROSSIMO
                      </span>
                    )}
                    {isPast && (
                      <span className="text-xs font-semibold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md">
                        Concluso
                      </span>
                    )}
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-md uppercase ${
                        ev.type === 'MASTERCLASS'
                          ? 'bg-purple-100 text-purple-900 border border-purple-200'
                          : ev.type === 'PROVA_E_CONCERTO'
                          ? 'bg-rose-100 text-rose-900 border border-rose-200'
                          : ev.type === 'CONCERTO'
                          ? 'bg-red-100 text-red-900 border border-red-200'
                          : 'bg-teal-100 text-teal-900 border border-teal-200'
                      }`}
                    >
                      {ev.type === 'PROVA'
                        ? "Prove d'insieme"
                        : ev.type === 'PROVA_E_CONCERTO'
                        ? 'Prove generali'
                        : ev.type === 'MASTERCLASS'
                        ? 'Masterclass'
                        : 'Concerto'}
                    </span>
                    {ev.isRescheduled && (
                      <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-md border border-amber-300">
                        DATA MODIFICATA
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                    <span className="text-teal-800">{ev.city}:</span> {ev.title}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs sm:text-sm text-slate-600">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <CalendarIcon className="w-4 h-4 text-teal-700" />
                      <span>{formatEventDate(ev.date)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{ev.time}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedNavEvent(ev)}
                      className="flex items-center gap-1.5 text-slate-700 hover:text-teal-800 text-left group transition-colors cursor-pointer"
                      title="Apri navigatore (Google Maps / Apple Maps / Waze)"
                    >
                      <MapPin className="w-4 h-4 text-teal-700 shrink-0 group-hover:scale-110 transition-transform" />
                      <span className="truncate font-medium underline decoration-slate-300 group-hover:decoration-teal-700 underline-offset-2">
                        {ev.location}
                      </span>
                    </button>
                  </div>

                  {/* Programma brani sintetico */}
                  {ev.program && ev.program.length > 0 && (
                    <div className="text-xs text-slate-600 pt-1 flex items-start gap-1.5">
                      <Music className="w-3.5 h-3.5 text-teal-700 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">
                        <strong>Programma:</strong> {ev.program.join(' · ')}
                      </span>
                    </div>
                  )}

                  {/* Summary contatore partecipanti */}
                  <div className="text-xs text-slate-500 pt-1 flex items-center gap-3">
                    <span className="font-semibold text-emerald-700">
                      {presentCount} Presenti
                    </span>
                    <span>·</span>
                    <span className="text-rose-700">{absentCount} Assenti</span>
                    {maybeCount > 0 && (
                      <>
                        <span>·</span>
                        <span className="text-amber-700">{maybeCount} In dubbio / parziali</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Dettaglio Destro: Selezione Presenza (solo Coristi) oppure Azioni Gestione (Direttore/Admin) */}
                <div className="shrink-0 flex flex-col items-stretch sm:items-end justify-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  {!isPrivilegedUser ? (
                    <>
                      <div className="flex items-center gap-2">
                        {/* Tasto SI */}
                        <button
                          onClick={() => handlePresenceClick(ev.id, 'SI')}
                          title="Indica che sarai presente"
                          className={`min-h-[46px] px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                            userStatus === 'SI'
                              ? 'bg-emerald-600 text-white ring-2 ring-emerald-500 shadow-sm'
                              : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Ci sarò</span>
                        </button>

                        {/* Tasto NO */}
                        <button
                          onClick={() => handlePresenceClick(ev.id, 'NO')}
                          title="Indica che non sarai presente"
                          className={`min-h-[46px] px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                            userStatus === 'NO'
                              ? 'bg-rose-600 text-white ring-2 ring-rose-500 shadow-sm'
                              : 'bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-800'
                          }`}
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Assente</span>
                        </button>

                        {/* Tasto FORSE / NOTA */}
                        <button
                          onClick={() => handlePresenceClick(ev.id, 'FORSE')}
                          title="Indica presenza parziale o nota (es. solo mattina)"
                          className={`min-h-[46px] px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-1.5 ${
                            userStatus === 'FORSE'
                              ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400 font-extrabold shadow-sm'
                              : 'bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-800'
                          }`}
                        >
                          <HelpCircle className="w-4 h-4" />
                          <span>Nota</span>
                        </button>
                      </div>

                      {userNote && (
                        <div className="text-xs text-amber-800 font-medium bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                          Nota: "{userNote}"
                        </div>
                      )}

                      <div className="flex items-center gap-2 self-end">
                        <button
                          onClick={() => handleAddEventToCalendar(ev)}
                          title="Aggiungi direttamente al tuo calendario (Google, Apple, Outlook)"
                          className="text-xs text-slate-600 hover:text-teal-800 flex items-center gap-1 py-1 font-semibold cursor-pointer"
                        >
                          <CalendarPlus className="w-3.5 h-3.5 text-teal-700" />
                          <span>Aggiungi al Calendario</span>
                        </button>
                        <span className="text-slate-300">·</span>
                        <button
                          onClick={() => setSelectedEventDetails(ev)}
                          className="text-xs text-teal-800 font-semibold hover:underline"
                        >
                          Scheda & Dettagli
                        </button>
                      </div>
                    </>
                  ) : (
                    /* Vista esclusiva per Direttore o Amministratore: niente bottoni di presenza corista */
                    <div className="flex flex-col items-stretch sm:items-end gap-2">
                      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                        {onOpenEventEditor && (
                          <button
                            onClick={() => onOpenEventEditor(ev)}
                            className="px-3.5 py-2 bg-slate-100 hover:bg-teal-50 hover:text-teal-900 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 border border-slate-200 cursor-pointer"
                            title="Modifica scaletta brani e orari"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-teal-700" />
                            <span>Modifica Scaletta</span>
                          </button>
                        )}

                        {onSelectEventForDirector && (
                          <button
                            onClick={() => onSelectEventForDirector(ev.id)}
                            className="px-3.5 py-2 bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                            title="Visualizza presenze coristi per sezione vocale"
                          >
                            <span>Dettaglio Sezioni →</span>
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-3 self-end text-xs text-slate-500 pt-0.5">
                        <button
                          onClick={() => setSelectedEventDetails(ev)}
                          className="text-slate-600 hover:text-teal-800 font-medium"
                        >
                          Programma completo
                        </button>
                        <span className="text-slate-300">·</span>
                        <button
                          onClick={() => handleAddEventToCalendar(ev)}
                          title="Aggiungi direttamente al tuo calendario (Google, Apple, Outlook)"
                          className="hover:text-teal-800 flex items-center gap-1 font-medium cursor-pointer"
                        >
                          <CalendarPlus className="w-3.5 h-3.5 text-teal-700" />
                          <span>Aggiungi al Calendario</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          );
        })}
        </div>
      )}

      {/* Modal Inserimento Nota Presenza (per anziani: campo grande, opzioni rapide) */}
      {activeNoteModalEvent && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in"
        >
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <div>
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">
                Nota di Presenza / Orario Parziale
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                {activeNoteModalEvent.city}: {activeNoteModalEvent.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Specifica se puoi partecipare solo a una parte della prova o hai una nota per la presenza.
              </p>
            </div>

            {/* Quick Chips for elderly singers */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-700">Seleziona una motivazione rapida:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Solo mattina (fino alle 13:00)',
                  'Solo pomeriggio (dalle 14:30)',
                  'Ritardo 30 minuti',
                  'In attesa turni lavorativi',
                  'Problema di salute'
                ].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setCustomNote(preset)}
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-teal-50 hover:text-teal-800 border border-slate-200 transition-colors"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Oppure scrivi la tua nota:
              </label>
              <textarea
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="es. Arriverò alle 11:00 per treno..."
                rows={3}
                className="w-full p-3 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveNoteModalEvent(null)}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
              >
                Annulla
              </button>
              <button
                onClick={saveCustomNote}
                className="px-5 py-2.5 bg-teal-800 hover:bg-teal-900 text-white font-bold text-sm rounded-xl shadow-xs"
              >
                Salva Risposta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dettagli Completi Evento */}
      {selectedEventDetails && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in"
        >
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-teal-800 uppercase tracking-wide">
                  Scheda Tecnica Appuntamento
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  {selectedEventDetails.city}: {selectedEventDetails.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEventDetails(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm text-slate-700 divide-y divide-slate-100">
              <div className="pt-2">
                <span className="font-semibold text-slate-900 block">Data e Orari:</span>
                <p>{formatEventDate(selectedEventDetails.date)} · Orario: {selectedEventDetails.time}</p>
              </div>

              <div className="pt-2 flex items-start justify-between gap-3">
                <div>
                  <span className="font-semibold text-slate-900 block">Sede e Indirizzo:</span>
                  <p className="font-semibold text-slate-800">{selectedEventDetails.location}</p>
                  {selectedEventDetails.address && (
                    <p className="text-xs text-slate-500 mt-0.5">{selectedEventDetails.address}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedNavEvent(selectedEventDetails)}
                  className="shrink-0 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-850 font-bold text-xs rounded-xl border border-teal-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Apri navigatore con itinerario"
                >
                  <MapPin className="w-3.5 h-3.5 text-teal-700" />
                  <span>Navigatore</span>
                </button>
              </div>

              {selectedEventDetails.program && (
                <div className="pt-2">
                  <span className="font-semibold text-slate-900 block">Programma di Studio / Esecuzione:</span>
                  <ul className="list-disc pl-5 text-xs space-y-1 mt-1 text-slate-600">
                    {selectedEventDetails.program.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedEventDetails.dressCode && (
                <div className="pt-2">
                  <span className="font-semibold text-slate-900 block">Abbigliamento / Divisa:</span>
                  <p className="text-xs text-slate-600">{selectedEventDetails.dressCode}</p>
                </div>
              )}

              {selectedEventDetails.notes && (
                <div className="pt-2">
                  <span className="font-semibold text-slate-900 block">Note per i Coristi:</span>
                  <p className="text-xs text-slate-600">{selectedEventDetails.notes}</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
              <button
                onClick={() => {
                  const ev = selectedEventDetails;
                  setSelectedEventDetails(null);
                  handleAddEventToCalendar(ev);
                }}
                className="px-4 py-2.5 bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 font-bold text-xs rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                title="Aggiungi direttamente al tuo calendario (Google, Apple, Outlook)"
              >
                <CalendarPlus className="w-4 h-4 text-teal-700" />
                <span>Aggiungi al Calendario</span>
              </button>
              <button
                onClick={() => setSelectedEventDetails(null)}
                className="px-5 py-2.5 bg-teal-800 text-white font-bold text-xs rounded-xl hover:bg-teal-900 cursor-pointer"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Navigatore GPS (Google Maps, Apple Maps, Waze) */}
      <LocationNavigatorModal
        isOpen={!!selectedNavEvent}
        event={selectedNavEvent}
        onClose={() => setSelectedNavEvent(null)}
      />

      {/* Modal Aggiungi al Calendario Direttamente (Google Calendar, Apple, Outlook, Yahoo) */}
      <AddToCalendarModal
        isOpen={!!selectedCalendarEvent}
        event={selectedCalendarEvent}
        onClose={() => setSelectedCalendarEvent(null)}
        onCalendarAdded={(serviceName) => {
          showCalendarFeedback(serviceName);
        }}
      />

      {/* Toast Feedback per apertura calendario */}
      {calendarToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-teal-950 text-white px-5 py-3 rounded-2xl shadow-2xl border border-teal-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs sm:text-sm font-semibold">{calendarToast}</span>
        </div>
      )}
    </div>
  );
};

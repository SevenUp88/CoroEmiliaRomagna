import React, { useState, useMemo } from 'react';
import { ChoirEvent, ChoirMember, AttendanceRecord, AttendanceStatus } from '../types';
import { getTodayDateString, getNextUpcomingEvent } from '../utils/calendar';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Music,
  CalendarPlus,
  ExternalLink,
  Edit3,
  Users,
  Sparkles
} from 'lucide-react';

interface MonthCalendarViewProps {
  events: ChoirEvent[];
  currentUser: ChoirMember | null;
  attendance: Record<string, Record<string, AttendanceRecord>>;
  isDirector: boolean;
  isAdmin?: boolean;
  onSelectEvent: (event: ChoirEvent) => void;
  onSelectNavEvent?: (event: ChoirEvent) => void;
  onUpdateAttendance?: (eventId: string, status: AttendanceStatus, note?: string) => void;
  onOpenEventEditor?: (eventToEdit: ChoirEvent | null) => void;
  onSelectEventForDirector?: (eventId: string) => void;
  onAddEventToCalendar?: (event: ChoirEvent) => void;
  onSwitchToList?: () => void;
}

const MONTH_NAMES_IT = [
  'Gennaio',
  'Febbraio',
  'Marzo',
  'Aprile',
  'Maggio',
  'Giugno',
  'Luglio',
  'Agosto',
  'Settembre',
  'Ottobre',
  'Novembre',
  'Dicembre'
];

const DAYS_OF_WEEK_IT = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

export const MonthCalendarView: React.FC<MonthCalendarViewProps> = ({
  events,
  currentUser,
  attendance,
  isDirector,
  isAdmin = false,
  onSelectEvent,
  onSelectNavEvent,
  onUpdateAttendance,
  onOpenEventEditor,
  onSelectEventForDirector,
  onAddEventToCalendar,
  onSwitchToList
}) => {
  const isPrivilegedUser = isDirector || isAdmin;
  const todayStr = getTodayDateString();

  // Determine initial month from next upcoming event or fallback to first event
  const initialYearMonth = useMemo(() => {
    const upcoming = getNextUpcomingEvent(events);
    if (upcoming) {
      const [y, m] = upcoming.date.split('-').map(Number);
      return { year: y, month: m - 1, defaultDayDate: upcoming.date };
    }
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth(), defaultDayDate: getTodayDateString() };
  }, [events]);

  const [currentYear, setCurrentYear] = useState(initialYearMonth.year);
  const [currentMonth, setCurrentMonth] = useState(initialYearMonth.month);
  const [selectedDayDate, setSelectedDayDate] = useState<string | null>(() => {
    return initialYearMonth.defaultDayDate || events[0]?.date || null;
  });

  // Extract distinct months with events in current season for quick jumping
  const seasonMonthsWithEvents = useMemo(() => {
    const map = new Map<string, { year: number; month: number; label: string; count: number }>();
    events.forEach((ev) => {
      const [y, m] = ev.date.split('-').map(Number);
      const key = `${y}-${m - 1}`;
      if (!map.has(key)) {
        map.set(key, {
          year: y,
          month: m - 1,
          label: `${MONTH_NAMES_IT[m - 1]} ${y}`,
          count: 1
        });
      } else {
        map.get(key)!.count += 1;
      }
    });
    return Array.from(map.values()).sort(
      (a, b) => a.year * 12 + a.month - (b.year * 12 + b.month)
    );
  }, [events]);

  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [slideAnim, setSlideAnim] = useState<'slide-left' | 'slide-right' | null>(null);

  const handlePrevMonth = () => {
    setSlideAnim('slide-right');
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
    setTimeout(() => setSlideAnim(null), 250);
  };

  const handleNextMonth = () => {
    setSlideAnim('slide-left');
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setTimeout(() => setSlideAnim(null), 250);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || touchStartY === null) return;
    const diffX = e.changedTouches[0].clientX - touchStartX;
    const diffY = e.changedTouches[0].clientY - touchStartY;

    // Trigger if horizontal movement is at least 25px and more horizontal than vertical
    if (Math.abs(diffX) > 25 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX < 0) {
        // Swiped Left -> go to NEXT month
        handleNextMonth();
      } else {
        // Swiped Right -> go to PREVIOUS month
        handlePrevMonth();
      }
    }
    setTouchStartX(null);
    setTouchStartY(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    // If predominantly horizontal delta from trackpad
    if (Math.abs(e.deltaX) > 40 && Math.abs(e.deltaX) > Math.abs(e.deltaY) * 2) {
      if (e.deltaX > 0) {
        handleNextMonth();
      } else {
        handlePrevMonth();
      }
    }
  };

  // Build calendar matrix
  const { calendarDays, eventsThisMonth } = useMemo(() => {
    // 0 = Monday ... 6 = Sunday
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;
    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const days: {
      dayNumber: number;
      dateString: string;
      isCurrentMonth: boolean;
      events: ChoirEvent[];
    }[] = [];

    // Events in this month
    const thisMonthEvents = events.filter((e) => {
      const [y, m] = e.date.split('-').map(Number);
      return y === currentYear && m - 1 === currentMonth;
    });

    // Previous month padding
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateString = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      const dayEvs = events.filter((e) => e.date === dateString);
      days.push({
        dayNumber: dayNum,
        dateString,
        isCurrentMonth: false,
        events: dayEvs
      });
    }

    // Current month days
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvs = events.filter((e) => e.date === dateString);
      days.push({
        dayNumber: day,
        dateString,
        isCurrentMonth: true,
        events: dayEvs
      });
    }

    // Next month padding (complete grid up to multiple of 7)
    const totalSlots = Math.ceil(days.length / 7) * 7;
    const remainingSlots = totalSlots - days.length;
    for (let day = 1; day <= remainingSlots; day++) {
      const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateString = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvs = events.filter((e) => e.date === dateString);
      days.push({
        dayNumber: day,
        dateString,
        isCurrentMonth: false,
        events: dayEvs
      });
    }

    return { calendarDays: days, eventsThisMonth: thisMonthEvents };
  }, [currentYear, currentMonth, events]);

  // Selected day events
  const selectedDayEvents = useMemo(() => {
    if (!selectedDayDate) {
      return eventsThisMonth.length > 0 ? [eventsThisMonth[0]] : [];
    }
    const found = events.filter((e) => e.date === selectedDayDate);
    if (found.length > 0) return found;
    return eventsThisMonth.length > 0 ? [eventsThisMonth[0]] : [];
  }, [selectedDayDate, events, eventsThisMonth]);

  const formatItalianDay = (dateStr: string) => {
    try {
      const date = new Date(dateStr + 'T12:00:00');
      return date.toLocaleDateString('it-IT', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const getEventBadgeStyle = (ev: ChoirEvent) => {
    if (ev.date < todayStr) {
      return 'bg-slate-100 text-slate-500 border-slate-200 opacity-75';
    }
    if (ev.type === 'MASTERCLASS') {
      return 'bg-purple-100 text-purple-900 border-purple-300';
    }
    if (ev.type === 'CONCERTO' || ev.type === 'PROVA_E_CONCERTO') {
      return 'bg-rose-100 text-rose-900 border-rose-300';
    }
    return 'bg-teal-100 text-teal-900 border-teal-300';
  };

  const getEventTypeLabel = (type: string) => {
    if (type === 'PROVA_E_CONCERTO') return 'Prove generali';
    if (type === 'MASTERCLASS') return 'Masterclass';
    if (type === 'CONCERTO') return 'Concerto';
    return "Prove d'insieme";
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Header Card: Navigation & Quick Jump */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          {/* Month / Year Navigator */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
              <button
                type="button"
                onClick={handlePrevMonth}
                aria-label="Mese precedente"
                className="p-2 hover:bg-white text-slate-700 hover:text-teal-900 rounded-xl transition-all cursor-pointer shadow-2xs"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                aria-label="Mese successivo"
                className="p-2 hover:bg-white text-slate-700 hover:text-teal-900 rounded-xl transition-all cursor-pointer shadow-2xs"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight capitalize">
                {MONTH_NAMES_IT[currentMonth]} {currentYear}
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {eventsThisMonth.length === 0
                  ? 'Nessun impegno in questo mese'
                  : eventsThisMonth.length === 1
                  ? '1 appuntamento programmato'
                  : `${eventsThisMonth.length} appuntamenti programmati`}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            {isDirector && onOpenEventEditor && (
              <button
                type="button"
                onClick={() => onOpenEventEditor(null)}
                className="px-3.5 py-2 bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>+ Nuovo Impegno</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Month Jump Chips - Horizontal Scrollable Strip */}
        {seasonMonthsWithEvents.length > 0 && (
          <div className="pt-3.5 pb-1">
            <div className="text-[11px] font-semibold text-slate-500 mb-1.5 flex items-center justify-between">
              <span>Mesi stagione (scorri in orizzontale ↔️):</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-0.5 scrollbar-none touch-pan-x">
              {seasonMonthsWithEvents.map((m) => {
                const isSelected = m.year === currentYear && m.month === currentMonth;
                return (
                  <button
                    key={`${m.year}-${m.month}`}
                    type="button"
                    onClick={() => {
                      setCurrentYear(m.year);
                      setCurrentMonth(m.month);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-teal-800 text-white shadow-md ring-2 ring-teal-700/30'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    }`}
                  >
                    <span>{m.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {m.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Calendar Grid Container with Horizontal Scroll / Swipe between months on Mobile */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden touch-pan-y"
      >
        {/* Mobile Month Switch & Swipe Bar */}
        <div className="sm:hidden flex items-center justify-between px-3 py-2 bg-teal-50 border-b border-teal-100 text-xs text-teal-900 font-semibold select-none">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="flex items-center gap-1 font-bold text-teal-800 hover:text-teal-950 px-2 py-1 rounded-lg active:bg-teal-100 cursor-pointer"
            aria-label="Mese precedente"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-[11px]">Prec</span>
          </button>
          <span className="text-[10px] font-bold text-teal-800 bg-white px-2 py-0.5 rounded-full border border-teal-200 shadow-2xs flex items-center gap-1">
            <span>👈</span>
            <span>Scorri per cambiare mese</span>
            <span>👉</span>
          </span>
          <button
            type="button"
            onClick={handleNextMonth}
            className="flex items-center gap-1 font-bold text-teal-800 hover:text-teal-950 px-2 py-1 rounded-lg active:bg-teal-100 cursor-pointer"
            aria-label="Mese successivo"
          >
            <span className="text-[11px]">Succ</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 bg-slate-50/80 border-b border-slate-200 text-center py-2">
          {DAYS_OF_WEEK_IT.map((d, index) => (
            <div
              key={d}
              className={`text-[10px] sm:text-xs font-extrabold uppercase tracking-wider ${
                index >= 5 ? 'text-teal-800' : 'text-slate-600'
              }`}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Days Grid with smooth slide animation */}
        <div
          key={`${currentYear}-${currentMonth}`}
          className={`grid grid-cols-7 divide-x divide-y divide-slate-100 transition-all duration-200 ${
            slideAnim === 'slide-left'
              ? 'animate-in fade-in slide-in-from-right-4'
              : slideAnim === 'slide-right'
              ? 'animate-in fade-in slide-in-from-left-4'
              : ''
          }`}
        >
          {calendarDays.map((cell) => {
            const hasEvents = cell.events.length > 0;
            const isSelectedDay = selectedDayDate === cell.dateString;

            return (
              <div
                key={cell.dateString}
                onClick={() => {
                  setSelectedDayDate(cell.dateString);
                  if (hasEvents) {
                    onSelectEvent(cell.events[0]);
                  }
                }}
                className={`min-h-[64px] sm:min-h-[110px] p-1 sm:p-2.5 transition-all flex flex-col justify-between cursor-pointer select-none relative ${
                  !cell.isCurrentMonth
                    ? 'bg-slate-50/40 text-slate-400'
                    : hasEvents
                    ? 'bg-teal-50/30 hover:bg-teal-50/80'
                    : 'bg-white hover:bg-slate-50/80 text-slate-700'
                } ${isSelectedDay ? 'ring-2 ring-teal-700 bg-teal-50/60 z-10' : ''}`}
              >
                {/* Day Number Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span
                      className={`text-[11px] sm:text-sm font-bold w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-lg ${
                        hasEvents
                          ? 'bg-teal-800 text-white font-black shadow-2xs'
                          : isSelectedDay
                          ? 'bg-teal-700 text-white font-black'
                          : cell.dateString === todayStr
                          ? 'bg-amber-500 text-white font-black ring-2 ring-amber-300'
                          : cell.isCurrentMonth
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>
                    {cell.dateString === todayStr && (
                      <span className="text-[8px] sm:text-[9px] font-black uppercase text-amber-700 bg-amber-100 px-1 py-0.2 rounded border border-amber-300 leading-none">
                        Oggi
                      </span>
                    )}
                  </div>

                  {/* Dot indicator for mobile */}
                  {hasEvents && (
                    <span className="sm:hidden flex items-center gap-0.5">
                      {cell.events.map((ev) => (
                        <span
                          key={ev.id}
                          className={`w-1.5 h-1.5 rounded-full ${
                            ev.type === 'MASTERCLASS'
                              ? 'bg-purple-600'
                              : ev.type === 'CONCERTO' || ev.type === 'PROVA_E_CONCERTO'
                              ? 'bg-rose-600'
                              : 'bg-teal-600'
                          }`}
                        />
                      ))}
                    </span>
                  )}
                </div>

                {/* Event Chips (Desktop / Tablet) */}
                <div className="space-y-1 my-1 flex-1 hidden sm:block">
                  {cell.events.map((ev) => {
                    const userStatus = currentUser ? attendance[ev.id]?.[currentUser.id]?.status : null;
                    return (
                      <button
                        key={ev.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDayDate(cell.dateString);
                          onSelectEvent(ev);
                        }}
                        title={`${ev.city}: ${ev.title} (${ev.time}) - Clicca per aprire la scheda`}
                        className={`w-full text-left p-1 sm:p-1.5 rounded-lg border text-[11px] font-bold transition-all shadow-2xs hover:shadow hover:scale-[1.02] cursor-pointer block ${getEventBadgeStyle(
                          ev
                        )}`}
                      >
                        <div className="flex items-center justify-between gap-1 leading-tight">
                          <span className="font-extrabold uppercase text-[10px] tracking-wide truncate">
                            {ev.city}
                          </span>
                          {currentUser && userStatus && (
                            <span className="text-[10px] shrink-0">
                              {userStatus === 'SI' ? '✅' : userStatus === 'NO' ? '❌' : '⚠️'}
                            </span>
                          )}
                        </div>
                        <div className="truncate text-[10px] opacity-90 font-medium">
                          {ev.title}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Mobile text indicator for date with event */}
                {hasEvents && (
                  <div className="sm:hidden mt-0.5">
                    <div className="text-[8px] leading-tight font-extrabold text-teal-900 bg-teal-100/90 px-1 py-0.5 rounded truncate">
                      {cell.events[0].city}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 font-medium">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-800">Legenda:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
              <span>Prove d'insieme</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
              <span>Masterclass</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
              <span>Prove generali & Concerti</span>
            </div>
          </div>

          <div className="text-slate-500 text-[11px]">
            💡 Clicca su un giorno per entrare nei dettagli e confermare la presenza
          </div>
        </div>
      </div>

      {/* Selected Day Event Detailed View */}
      {selectedDayEvents.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-teal-700" />
              <span>Dettaglio Appuntamenti del Giorno</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              {formatItalianDay(selectedDayEvents[0].date)}
            </span>
          </div>

          {selectedDayEvents.map((ev) => {
            const userStatus = currentUser ? attendance[ev.id]?.[currentUser.id]?.status : null;
            const userNote = currentUser ? attendance[ev.id]?.[currentUser.id]?.note : null;

            // Counts
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
                className="bg-white rounded-3xl p-5 sm:p-6 border border-teal-200 shadow-sm space-y-4 hover:border-teal-400 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Event Infos */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-teal-800 text-white">
                        {ev.city}
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                        {getEventTypeLabel(ev.type)}
                      </span>
                      {ev.isRescheduled && (
                        <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md border border-amber-300">
                          DATA MODIFICATA
                        </span>
                      )}
                    </div>

                    <h4 className="text-lg sm:text-xl font-black text-slate-900">
                      {ev.title}
                    </h4>

                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-slate-600 pt-1">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                        <Clock className="w-4 h-4 text-teal-700" />
                        <span>Orario: {ev.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span>{ev.location}</span>
                      </div>
                    </div>

                    {/* Programma sintetico */}
                    {ev.program && ev.program.length > 0 && (
                      <div className="text-xs text-slate-600 pt-1 flex items-start gap-1.5">
                        <Music className="w-3.5 h-3.5 text-teal-700 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">
                          <strong>Programma:</strong> {ev.program.join(' · ')}
                        </span>
                      </div>
                    )}

                    {/* Riepilogo partecipanti */}
                    <div className="text-xs text-slate-500 pt-1 flex items-center gap-2 font-medium">
                      <span className="text-emerald-700 font-bold">{presentCount} Presenti</span>
                      <span>·</span>
                      <span className="text-rose-700">{absentCount} Assenti</span>
                      {maybeCount > 0 && (
                        <>
                          <span>·</span>
                          <span className="text-amber-700">{maybeCount} Note / In dubbio</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions & Presence Confirmation */}
                  <div className="shrink-0 flex flex-col items-stretch sm:items-end justify-center gap-2.5 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    {!isPrivilegedUser ? (
                      <div className="flex flex-wrap items-center gap-2">
                        {onUpdateAttendance && (
                          <>
                            <button
                              type="button"
                              onClick={() => onUpdateAttendance(ev.id, 'SI')}
                              className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer ${
                                userStatus === 'SI'
                                  ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-500'
                                  : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800'
                              }`}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Ci sarò</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => onUpdateAttendance(ev.id, 'NO')}
                              className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer ${
                                userStatus === 'NO'
                                  ? 'bg-rose-600 text-white shadow-xs ring-2 ring-rose-500'
                                  : 'bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-800'
                              }`}
                            >
                              <XCircle className="w-4 h-4" />
                              <span>Assente</span>
                            </button>
                          </>
                        )}

                        <button
                          type="button"
                          onClick={() => onSelectEvent(ev)}
                          className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>Entra nell'evento →</span>
                        </button>
                      </div>
                    ) : (
                      /* Director / Admin Actions */
                      <div className="flex flex-wrap items-center gap-2">
                        {onOpenEventEditor && (
                          <button
                            type="button"
                            onClick={() => onOpenEventEditor(ev)}
                            className="px-3.5 py-2 bg-slate-100 hover:bg-teal-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 flex items-center gap-1.5 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-teal-700" />
                            <span>Modifica Scaletta</span>
                          </button>
                        )}

                        {onSelectEventForDirector && (
                          <button
                            type="button"
                            onClick={() => onSelectEventForDirector(ev.id)}
                            className="px-3.5 py-2 bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-2xs cursor-pointer"
                          >
                            <Users className="w-3.5 h-3.5" />
                            <span>Dettaglio Sezioni →</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onSelectEvent(ev)}
                          className="px-3.5 py-2 bg-teal-900 text-white font-bold text-xs rounded-xl hover:bg-slate-900 transition-colors cursor-pointer"
                        >
                          <span>Entra nell'evento →</span>
                        </button>
                      </div>
                    )}

                    {/* Secondary actions: Navigatore & Calendario */}
                    <div className="flex items-center gap-3 text-xs text-slate-500 pt-0.5">
                      {onSelectNavEvent && (
                        <button
                          type="button"
                          onClick={() => onSelectNavEvent(ev)}
                          className="text-slate-600 hover:text-teal-800 flex items-center gap-1 font-semibold cursor-pointer"
                        >
                          <MapPin className="w-3.5 h-3.5 text-teal-700" />
                          <span>Navigatore</span>
                        </button>
                      )}
                      <span>·</span>
                      {onAddEventToCalendar && (
                        <button
                          type="button"
                          onClick={() => onAddEventToCalendar(ev)}
                          className="text-slate-600 hover:text-teal-800 flex items-center gap-1 font-semibold cursor-pointer"
                        >
                          <CalendarPlus className="w-3.5 h-3.5 text-teal-700" />
                          <span>Aggiungi al Calendario</span>
                        </button>
                      )}
                      <span>·</span>
                      <button
                        type="button"
                        onClick={() => onSelectEvent(ev)}
                        className="text-teal-800 font-bold hover:underline"
                      >
                        Scheda completa
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

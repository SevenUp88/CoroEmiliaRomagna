import React, { useState, useEffect, useMemo } from 'react';
import { ChoirEvent, ChoirMember, AttendanceRecord, VoiceSection, PushNotification, AttendanceStatus } from '../types';
import { exportAttendanceToCSV } from '../utils/storage';
import { getNextUpcomingEvent, getTodayDateString } from '../utils/calendar';
import { AddMemberModal } from './AddMemberModal';
import {
  Calendar,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  HelpCircle,
  Clock,
  MapPin,
  CalendarClock,
  Download,
  Send,
  Check,
  ChevronDown,
  Sparkles,
  ArrowRight,
  Music,
  Plus,
  Edit3,
  Trash2,
  UserPlus,
  MessageCircle
} from 'lucide-react';

interface DirectorDashboardProps {
  events: ChoirEvent[];
  members: ChoirMember[];
  attendance: Record<string, Record<string, AttendanceRecord>>;
  onUpdateEvent: (updatedEvent: ChoirEvent) => void;
  onSendNotification: (notification: Omit<PushNotification, 'id' | 'timestamp' | 'read'>) => void;
  selectedEventId?: string;
  onOpenEventEditor?: (eventToEdit: ChoirEvent | null) => void;
  onAddMember?: (data: { name: string; section: VoiceSection; city: string; phone?: string }) => void;
  onDeleteMember?: (memberId: string) => void;
  isAdmin?: boolean;
  onUpdateAttendanceRecord?: (eventId: string, memberId: string, status: AttendanceStatus) => void;
}

export const DirectorDashboard: React.FC<DirectorDashboardProps> = ({
  events,
  members,
  attendance,
  onUpdateEvent,
  onSendNotification,
  selectedEventId,
  onOpenEventEditor,
  onAddMember,
  onDeleteMember,
  isAdmin = false,
  onUpdateAttendanceRecord
}) => {
  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [events]
  );
  const todayStr = getTodayDateString();
  const nextUpcomingEvent = useMemo(() => getNextUpcomingEvent(events), [events]);

  const [activeEventId, setActiveEventId] = useState<string>(
    selectedEventId || nextUpcomingEvent?.id || events[0]?.id || ''
  );

  useEffect(() => {
    if (selectedEventId) {
      setActiveEventId(selectedEventId);
    }
  }, [selectedEventId]);
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>('ALL');
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showReminderSuccess, setShowReminderSuccess] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<ChoirMember | null>(null);

  // Form state for rescheduling
  const currentEvent = events.find((e) => e.id === activeEventId) || events[0];
  const [newDate, setNewDate] = useState(currentEvent?.date || '');
  const [newTime, setNewTime] = useState(currentEvent?.time || '');
  const [newCity, setNewCity] = useState(currentEvent?.city || '');
  const [newLocation, setNewLocation] = useState(currentEvent?.location || '');
  const [rescheduleReason, setRescheduleReason] = useState('Spostamento per massimizzare la presenza dei coristi');
  const [notifySingers, setNotifySingers] = useState(true);

  if (!currentEvent) {
    return <div className="p-8 text-center text-slate-500">Nessun evento disponibile nel calendario.</div>;
  }

  // Unified Categories: Soprani, Contralti, Tenori & Baritoni (same category as requested!), Bassi
  const categories = [
    { id: 'Soprano', label: 'Soprani', filter: (m: ChoirMember) => m.section === 'Soprano' },
    { id: 'Contralto', label: 'Contralti', filter: (m: ChoirMember) => m.section === 'Contralto' },
    { id: 'Tenori & Baritoni', label: 'Tenori & Baritoni', filter: (m: ChoirMember) => m.section === 'Tenore' || m.section === 'Baritono' },
    { id: 'Basso', label: 'Bassi', filter: (m: ChoirMember) => m.section === 'Basso' }
  ];

  // Section Breakdown calculations for active event
  const eventAttendance = attendance[currentEvent.id] || {};

  const categoryStats = categories.map((cat) => {
    const catMembers = members.filter(cat.filter);
    let yes = 0;
    let no = 0;
    let maybe = 0;
    let pending = 0;

    catMembers.forEach((m) => {
      const rec = eventAttendance[m.id];
      if (!rec || rec.status === 'NON_INDICATO') pending++;
      else if (rec.status === 'SI') yes++;
      else if (rec.status === 'NO') no++;
      else if (rec.status === 'FORSE') maybe++;
    });

    const total = catMembers.length;
    const percentage = total > 0 ? Math.round((yes / total) * 100) : 0;

    return {
      id: cat.id,
      label: cat.label,
      yes,
      no,
      maybe,
      pending,
      total,
      percentage,
      membersList: catMembers
    };
  });

  const totalMembers = members.length;
  let totalYes = 0;
  let totalNo = 0;
  let totalMaybe = 0;
  let totalPending = 0;

  categoryStats.forEach((s) => {
    totalYes += s.yes;
    totalNo += s.no;
    totalMaybe += s.maybe;
    totalPending += s.pending;
  });

  const overallPercentage = totalMembers > 0 ? Math.round((totalYes / totalMembers) * 100) : 0;

  // Polyphonic Vocal Balance Evaluation
  const sopranoStat = categoryStats.find((s) => s.id === 'Soprano');
  const tenorBaritoneStat = categoryStats.find((s) => s.id === 'Tenori & Baritoni');
  const bassStat = categoryStats.find((s) => s.id === 'Basso');
  const contraltoStat = categoryStats.find((s) => s.id === 'Contralto');

  let balanceMessage = 'Buon equilibrio vocale per le sezioni.';
  let balanceType: 'good' | 'warning' | 'critical' = 'good';

  if ((tenorBaritoneStat?.yes || 0) < 6) {
    balanceMessage = `Attenzione M°: Presenza Tenori & Baritoni sotto la soglia ideale (${tenorBaritoneStat?.yes || 0}/${tenorBaritoneStat?.total}). Consigliabile verificare disponibilità.`;
    balanceType = 'warning';
  } else if ((sopranoStat?.yes || 0) < 12) {
    balanceMessage = `Attenzione M°: I Soprani sono sotto la soglia ideale (${sopranoStat?.yes || 0}/${sopranoStat?.total}).`;
    balanceType = 'warning';
  } else if (overallPercentage >= 75) {
    balanceMessage = `Quorum eccellente (${totalYes}/${totalMembers} coristi, ${overallPercentage}%). Prova confermata a pieno organico!`;
    balanceType = 'good';
  }

  // Handle Event Reschedule
  const handleSaveReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: ChoirEvent = {
      ...currentEvent,
      date: newDate,
      time: newTime,
      city: newCity,
      location: newLocation,
      isRescheduled: true,
      originalDate: currentEvent.originalDate || currentEvent.date,
      notes: `${currentEvent.notes || ''} [Nota: ${rescheduleReason}]`.trim()
    };

    onUpdateEvent(updated);
    setShowRescheduleModal(false);

    if (notifySingers) {
      onSendNotification({
        title: `Variazione Data Prova: ${currentEvent.city} spostata al ${newDate}`,
        message: `La prova di ${currentEvent.city} è stata riprogrammata per ${newDate} (Orario: ${newTime}). Motivo: ${rescheduleReason}. Si prega di aggiornare la propria presenza sull'app.`,
        type: 'reschedule',
        targetSection: 'ALL',
        author: 'Daniele',
        eventId: updated.id
      });
    }
  };

  const handleSendReminder = () => {
    onSendNotification({
      title: `Sollecito Presenza: ${currentEvent.city} (${currentEvent.date})`,
      message: `Gentili coristi, mancano pochi giorni alla prova di ${currentEvent.city}. Chiediamo a chi non ha ancora espresso la presenza (${totalPending} coristi) di confermare al più presto sull'app per consentire di organizzare al meglio la prova.`,
      type: 'urgent',
      targetSection: 'ALL',
      author: 'Daniele',
      eventId: currentEvent.id
    });
    setShowReminderSuccess(true);
    setTimeout(() => setShowReminderSuccess(false), 4000);
  };

  // Filtered members for inspector table
  const displayedMembers = members.filter((m) => {
    if (selectedSectionFilter === 'ALL') return true;
    if (selectedSectionFilter === 'Tenori & Baritoni') return m.section === 'Tenore' || m.section === 'Baritono';
    return m.section === selectedSectionFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Direzione */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Benvenuto Daniele
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {onOpenEventEditor && (
              <button
                onClick={() => onOpenEventEditor(null)}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                title="Aggiungi una nuova prova o concerto nel calendario"
              >
                <Plus className="w-4 h-4" />
                <span>+ Nuovo Impegno</span>
              </button>
            )}

            {onOpenEventEditor && (
              <button
                onClick={() => onOpenEventEditor(currentEvent)}
                className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                title="Modifica appuntamento"
              >
                <Edit3 className="w-4 h-4" />
                <span>MODIFICA</span>
              </button>
            )}

            <button
              onClick={() => {
                const el = document.getElementById('sezione-dettaglio-coristi');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm rounded-xl border border-slate-700 transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
              title="Visualizza registro dettagliato coristi"
            >
              <Users className="w-4 h-4 text-teal-400" />
              <span>DETTAGLIO SEZIONI</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => exportAttendanceToCSV(members, events, attendance)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm rounded-xl border border-slate-700 transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
                title="Riservato Admin: Esporta il foglio presenze completo per Excel"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Esporta Excel (.csv)</span>
              </button>
            )}
          </div>
        </div>

        {/* Selettore Prova Attiva */}
        <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide shrink-0">
              Seleziona Appuntamento:
            </span>
            <div className="relative flex-1 sm:w-80">
              <select
                value={activeEventId}
                onChange={(e) => setActiveEventId(e.target.value)}
                className="w-full appearance-none bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-teal-500 pr-10"
              >
                {sortedEvents.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.id === nextUpcomingEvent?.id ? '★ ' : ev.date >= todayStr ? '▶ ' : '✓ '} {ev.date} · {ev.city} ({ev.type}) {ev.id === nextUpcomingEvent?.id ? '— Prossimo' : ev.date < todayStr ? '— Concluso' : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="text-xs text-slate-300 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-teal-400 shrink-0" />
            <span className="font-semibold text-white">{currentEvent.location}</span>
            <span>({currentEvent.time})</span>
          </div>
        </div>
      </div>

      {/* RIEPILOGO PRESENZE E QUANTITÀ DELLE SEZIONI */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Presenze Prova · {currentEvent.city} ({currentEvent.date})</span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {totalYes} Presenti
              </span>
              <span className="text-sm font-semibold text-slate-500">
                su {totalMembers} coristi ({overallPercentage}%)
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-2 font-medium">
              <span className="text-rose-600 font-bold">{totalNo} assenti</span>
              <span>·</span>
              <span className="text-amber-600 font-bold">{totalMaybe} in dubbio</span>
              {totalPending > 0 && (
                <>
                  <span>·</span>
                  <span className="text-slate-400">{totalPending} in attesa</span>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {onOpenEventEditor && (
              <button
                onClick={() => onOpenEventEditor(currentEvent)}
                className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                title="Modifica appuntamento"
              >
                <Edit3 className="w-4 h-4" />
                <span>MODIFICA</span>
              </button>
            )}

            <button
              onClick={() => {
                const el = document.getElementById('sezione-dettaglio-coristi');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              title="Visualizza registro dettagliato dei coristi"
            >
              <Users className="w-4 h-4 text-teal-400" />
              <span>DETTAGLIO SEZIONI</span>
            </button>
          </div>
        </div>

        {/* Quantità delle Sezioni Sotto ai Presenti */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {categoryStats.map((stat) => {
            const isSelected = selectedSectionFilter === stat.id;
            return (
              <button
                key={stat.id}
                onClick={() => setSelectedSectionFilter(isSelected ? 'ALL' : stat.id)}
                className={`p-4 rounded-2xl border text-left transition-all relative cursor-pointer ${
                  isSelected
                    ? 'bg-teal-900 text-white border-teal-700 shadow-md ring-2 ring-teal-500'
                    : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    isSelected ? 'text-teal-200' : 'text-slate-600'
                  }`}>
                    {stat.label}
                  </span>
                  <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                    isSelected
                      ? 'bg-white/10 text-emerald-300'
                      : stat.percentage >= 70
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {stat.percentage}%
                  </span>
                </div>

                {/* Numero Presenti Grande */}
                <div className="flex items-baseline gap-1 my-1.5">
                  <span className="text-2xl sm:text-3xl font-black tabular-nums tracking-tight">
                    {stat.yes} Presenti
                  </span>
                  <span className={`text-xs sm:text-sm font-semibold ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                    / {stat.total}
                  </span>
                </div>

                {/* Barra di avanzamento */}
                <div className="w-full bg-slate-200 rounded-full h-1.5 my-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      stat.percentage >= 70 ? 'bg-emerald-600' : stat.percentage >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${stat.percentage}%` }}
                  />
                </div>

                {/* Più in piccolo: Numero degli Assenti e In Dubbio */}
                <div className={`text-[11px] font-medium pt-1 border-t ${
                  isSelected ? 'border-teal-800/80 text-teal-200' : 'border-slate-200 text-slate-500'
                }`}>
                  <span className={isSelected ? 'text-rose-300 font-semibold' : 'text-rose-600 font-semibold'}>
                    {stat.no} assenti
                  </span>
                  <span className="mx-1">·</span>
                  <span className={isSelected ? 'text-amber-300 font-semibold' : 'text-amber-600 font-semibold'}>
                    {stat.maybe} in dubbio
                  </span>
                  {stat.pending > 0 && (
                    <>
                      <span className="mx-1">·</span>
                      <span className={isSelected ? 'text-slate-300' : 'text-slate-400'}>
                        {stat.pending} in attesa
                      </span>
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Avviso Equilibrio Polifonico & Azioni Rapide */}
      <div className={`rounded-2xl p-4 sm:p-5 border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        balanceType === 'warning'
          ? 'bg-amber-50/80 border-amber-300 text-amber-950'
          : 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
      }`}>
        <div className="flex items-start sm:items-center gap-3">
          {balanceType === 'warning' ? (
            <AlertTriangle className="w-6 h-6 text-amber-700 shrink-0 mt-0.5 sm:mt-0" />
          ) : (
            <CheckCircle className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5 sm:mt-0" />
          )}
          <div>
            <div className="font-bold text-sm sm:text-base">Valutazione Equilibrio Voci</div>
            <div className="text-xs sm:text-sm mt-0.5">{balanceMessage}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          {totalPending > 0 && (
            <button
              onClick={handleSendReminder}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Invia Sollecito Push ({totalPending} coristi)
            </button>
          )}

          <button
            onClick={() => {
              setNewDate(currentEvent.date);
              setNewTime(currentEvent.time);
              setNewCity(currentEvent.city);
              setNewLocation(currentEvent.location);
              setShowRescheduleModal(true);
            }}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            Sposta Data
          </button>
        </div>
      </div>

      {showReminderSuccess && (
        <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-semibold rounded-xl flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-700" />
          Sollecito push inviato con successo a tutti i coristi in attesa di risposta!
        </div>
      )}

      {/* Scaletta Brani & Programma della Prova */}
      <div className="bg-gradient-to-r from-teal-900/90 to-slate-900 text-white rounded-2xl p-5 border border-teal-700/50 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2 text-teal-300">
            <Music className="w-5 h-5 text-teal-400" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Scaletta Brani in Programma: {currentEvent.city} ({currentEvent.date})
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2 pt-1">
            {currentEvent.program && currentEvent.program.length > 0 ? (
              currentEvent.program.map((piece, i) => (
                <div
                  key={i}
                  className="bg-white/10 hover:bg-white/15 border border-teal-500/30 px-3 py-1.5 rounded-xl text-xs font-semibold text-teal-100 flex items-center gap-2"
                >
                  <span className="w-4 h-4 rounded-full bg-teal-400 text-slate-950 font-black text-[10px] flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span>{piece}</span>
                </div>
              ))
            ) : (
              <span className="text-xs text-slate-400 italic">Nessun brano specificato in scaletta.</span>
            )}
          </div>

          {currentEvent.notes && (
            <p className="text-xs text-teal-200/90 pt-1 italic">
              <strong>Note per i coristi:</strong> {currentEvent.notes}
            </p>
          )}
        </div>

        {onOpenEventEditor && (
          <button
            onClick={() => onOpenEventEditor(currentEvent)}
            className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center gap-2 shrink-0 cursor-pointer self-start md:self-center"
          >
            <Edit3 className="w-4 h-4" />
            <span>MODIFICA</span>
          </button>
        )}
      </div>

      {/* Tabella Ispettore Coristi per Sezione */}
      <div id="sezione-dettaglio-coristi" className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">
              Registro Dettagliato Coristi per la Prova di {currentEvent.city}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Visualizzazione: {selectedSectionFilter === 'ALL' ? 'Tutte le sezioni' : `Solo ${selectedSectionFilter}`} ({displayedMembers.length} cantanti)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onAddMember && (
              <button
                onClick={() => setIsAddMemberModalOpen(true)}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                title="Aggiungi un nuovo cantante nell'organico del Coro"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Nuovo Corista</span>
              </button>
            )}

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                onClick={() => setSelectedSectionFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedSectionFilter === 'ALL'
                    ? 'bg-teal-800 text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Tutti ({members.length})
              </button>
              {categories.map((cat) => {
                const stat = categoryStats.find((s) => s.id === cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedSectionFilter(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      selectedSectionFilter === cat.id
                        ? 'bg-teal-800 text-white'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {cat.label} ({stat?.total || 0})
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100/70 text-slate-700 text-xs uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Sezione</th>
                <th className="py-3 px-4">Nome e Cognome</th>
                <th className="py-3 px-4">Città</th>
                <th className="py-3 px-4 text-center">Stato Presenza</th>
                <th className="py-3 px-4">Note / Orari</th>
                <th className="py-3 px-4 text-right">WhatsApp / Tel</th>
                <th className="py-3 px-4 text-center">Gestione</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedMembers.map((member) => {
                const record = eventAttendance[member.id];
                const status = record?.status || 'NON_INDICATO';
                const note = record?.note;

                return (
                  <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-bold text-xs text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                        {member.section}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span>{member.name}</span>
                        {member.isSectionLeader && (
                          <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-bold">
                            Caposezione
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600">
                      {member.city || '—'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {status === 'SI' && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                          <CheckCircle className="w-3.5 h-3.5" />
                          PRESENTE
                        </span>
                      )}
                      {status === 'NO' && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-800 bg-rose-100 px-2.5 py-1 rounded-full">
                          <XCircle className="w-3.5 h-3.5" />
                          ASSENTE
                        </span>
                      )}
                      {status === 'FORSE' && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-1 rounded-full">
                          <HelpCircle className="w-3.5 h-3.5" />
                          IN DUBBIO
                        </span>
                      )}
                      {status === 'NON_INDICATO' && (
                        <span className="text-xs text-slate-400 italic">
                          Non risposto
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600">
                      {note ? (
                        <span className="font-medium text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {note}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right text-xs">
                      {member.phone ? (
                        <a
                          href={`https://wa.me/${member.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Ciao ${member.name.split(' ')[0]}, ti contatto dal Coro Regionale Emilia-Romagna`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg font-mono font-bold transition-all shadow-2xs hover:shadow cursor-pointer"
                          title={`Invia messaggio WhatsApp a ${member.name} (${member.phone})`}
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{member.phone}</span>
                        </a>
                      ) : (
                        <span className="text-slate-300 font-mono">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {onDeleteMember && (
                        <button
                          type="button"
                          onClick={() => setMemberToDelete(member)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title={`Rimuovi ${member.name} dall'organico corale`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL SPOSTA PROVA */}
      {showRescheduleModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in"
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
                  Riprogrammazione Appuntamento
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  Sposta o Modifica: {currentEvent.city}
                </h3>
              </div>
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveReschedule} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nuova Data:</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-teal-700"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nuovo Orario:</label>
                <input
                  type="text"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  placeholder="es. 10:30 - 18:00"
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-teal-700"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Città:</label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Sede / Sala:</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-slate-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Motivo dello spostamento (visibile a tutti i coristi):
                </label>
                <textarea
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-slate-900"
                  placeholder="es. Spostata di comune accordo per garantire il quorum di Soprani e Tenori..."
                />
              </div>

              <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="notify"
                  checked={notifySingers}
                  onChange={(e) => setNotifySingers(e.target.checked)}
                  className="w-4 h-4 text-teal-700 rounded border-slate-300"
                />
                <label htmlFor="notify" className="text-xs text-teal-950 font-medium cursor-pointer">
                  Invia notifica push immediata a tutto il coro e avviso sulla bacheca
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRescheduleModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-bold"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Conferma e Sposta Prova
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Conferma Eliminazione Corista */}
      {memberToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="p-5 bg-rose-600 text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-rose-100 block">
                  Conferma Rimozione
                </span>
                <h3 className="text-base font-black text-white">
                  Rimuovere Corista dall'Organico?
                </h3>
              </div>
            </div>

            <div className="p-5 space-y-3">
              <p className="text-sm text-slate-700">
                Sei sicuro di voler rimuovere definitivamente{' '}
                <strong className="text-slate-900 font-bold">{memberToDelete.name}</strong>{' '}
                ({memberToDelete.section} · {memberToDelete.city || 'Emilia-Romagna'}) dall'organico del Coro Regionale?
              </p>
              <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                ⚠️ Il nominativo non comparirà più nel registro presenze e nei conteggi ufficiali.
              </p>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setMemberToDelete(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onDeleteMember) {
                      onDeleteMember(memberToDelete.id);
                    }
                    setMemberToDelete(null);
                  }}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Rimuovi Definitivamente</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Aggiunta Nuovo Corista */}
      {onAddMember && (
        <AddMemberModal
          isOpen={isAddMemberModalOpen}
          onClose={() => setIsAddMemberModalOpen(false)}
          onAddMember={(data) => {
            onAddMember(data);
            setIsAddMemberModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

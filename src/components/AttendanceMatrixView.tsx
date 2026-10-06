import React, { useState } from 'react';
import { ChoirEvent, ChoirMember, AttendanceRecord, VoiceSection, AttendanceStatus } from '../types';
import { exportAttendanceToCSV } from '../utils/storage';
import { getTodayDateString, getNextUpcomingEvent } from '../utils/calendar';
import { OFFICIAL_LINKS } from '../data/initialData';
import { Search, Download, Check, X, HelpCircle, FileSpreadsheet, Eye, ExternalLink, Lock, RotateCcw } from 'lucide-react';

interface AttendanceMatrixViewProps {
  events: ChoirEvent[];
  members: ChoirMember[];
  attendance: Record<string, Record<string, AttendanceRecord>>;
  onUpdateAttendance: (eventId: string, memberId: string, status: AttendanceStatus) => void;
  onResetAttendance?: () => void;
  isDirector: boolean;
  isAdmin?: boolean;
  onOpenAdminModal?: () => void;
}

export const AttendanceMatrixView: React.FC<AttendanceMatrixViewProps> = ({
  events,
  members,
  attendance,
  onUpdateAttendance,
  onResetAttendance,
  isDirector,
  isAdmin = false,
  onOpenAdminModal
}) => {
  const [search, setSearch] = useState('');
  const [selectedSection, setSelectedSection] = useState<VoiceSection | 'ALL'>('ALL');
  const [selectedCellInfo, setSelectedCellInfo] = useState<{
    member: ChoirMember;
    event: ChoirEvent;
    record?: AttendanceRecord;
  } | null>(null);

  const sections: VoiceSection[] = ['Soprano', 'Contralto', 'Tenore', 'Baritono', 'Basso'];

  const filteredMembers = members.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchesSection = selectedSection === 'ALL' || m.section === selectedSection;
    return matchesSearch && matchesSection;
  });

  const cycleStatus = (currentStatus?: AttendanceStatus): AttendanceStatus => {
    if (!currentStatus || currentStatus === 'NON_INDICATO') return 'SI';
    if (currentStatus === 'SI') return 'NO';
    if (currentStatus === 'NO') return 'FORSE';
    return 'SI';
  };

  return (
    <div className="space-y-4">
      {/* Top Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-teal-700" />
            <h2 className="text-xl font-bold text-slate-900">
              Foglio Presenze Generale (Stile Excel Ufficiale)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Griglia interattiva con tutte le {events.length} date del calendario 2026. Clicca su una casella per visualizzare o aggiornare la presenza.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href={OFFICIAL_LINKS.GOOGLE_SHEET_ATTENDANCE}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-teal-50 hover:bg-teal-100 text-teal-900 font-bold text-xs sm:text-sm rounded-xl border border-teal-200 transition-colors flex items-center gap-2"
            title="Apri il foglio Google Drive condiviso ufficiale"
          >
            <span>Foglio Google Ufficiale</span>
            <ExternalLink className="w-3.5 h-3.5 text-teal-700" />
          </a>

          {onResetAttendance && (isDirector || isAdmin) && (
            <button
              onClick={() => {
                if (
                  window.confirm(
                    'Vuoi azzerare tutte le presenze simulate? Tutte le caselle verranno reimpostate su "Da confermare" (·) così da raccogliere esclusivamente le reali presenze compilate dai coristi.'
                  )
                ) {
                  onResetAttendance();
                }
              }}
              className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs sm:text-sm rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Azzera le presenze simulate per partire da un registro vuoto"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
              <span>Azzera Presenze Simulate</span>
            </button>
          )}

          {isAdmin ? (
            <button
              onClick={() => exportAttendanceToCSV(members, events, attendance)}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              title="Riservato Admin: Scarica il foglio presenze in formato Excel/CSV"
            >
              <Download className="w-4 h-4" />
              <span>Scarica Excel (.csv)</span>
            </button>
          ) : (
            onOpenAdminModal && (
              <button
                onClick={onOpenAdminModal}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-200"
                title="Sblocca l'esportazione Excel inserendo la password Amministratore"
              >
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Scarica Excel (Admin)</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cerca corista..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-700"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedSection('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
              selectedSection === 'ALL'
                ? 'bg-teal-800 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Tutte ({members.length})
          </button>
          {sections.map((sec) => {
            const count = members.filter((m) => m.section === sec).length;
            return (
              <button
                key={sec}
                onClick={() => setSelectedSection(sec)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                  selectedSection === sec
                    ? 'bg-teal-800 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {sec} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Matrice Presenze con scroll orizzontale e colonne sticky */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] scrollbar-thin">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-800 text-white sticky top-0 z-20 select-none">
              <tr>
                <th className="p-3 sticky left-0 z-30 bg-slate-900 border-r border-slate-700 font-bold min-w-[180px]">
                  Corista & Sezione
                </th>
                {events.map((ev) => {
                  const todayStr = getTodayDateString();
                  const nextUpcoming = getNextUpcomingEvent(events);
                  const isNext = ev.id === nextUpcoming?.id;
                  const isPast = ev.date < todayStr;

                  return (
                    <th
                      key={ev.id}
                      className={`p-2 border-r border-slate-700 text-center min-w-[90px] max-w-[120px] ${
                        isNext ? 'bg-teal-950 ring-2 ring-emerald-400' : isPast ? 'bg-slate-900/80 opacity-80' : ''
                      }`}
                      title={`${ev.date} - ${ev.city} (${ev.type})`}
                    >
                      <div className="font-extrabold text-teal-300 truncate flex items-center justify-center gap-1">
                        {isNext && <span className="text-[10px] text-emerald-400">★</span>}
                        <span>{ev.city}</span>
                      </div>
                      <div className="text-[10px] text-slate-300 font-mono">
                        {ev.date.slice(5)}
                      </div>
                      <div className="text-[9px] text-slate-400 truncate">
                        {isNext ? 'PROSSIMO' : isPast ? 'Concluso' : ev.type === 'PROVA_E_CONCERTO' ? 'Prv Generali' : ev.type === 'PROVA' ? "Prv d'Insieme" : ev.type}
                      </div>
                    </th>
                  );
                })}
                <th className="p-2 text-center bg-slate-900 font-bold min-w-[70px]">
                  Tot SI
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredMembers.map((member) => {
                let memberYesCount = 0;
                return (
                  <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                    {/* Sticky Name column */}
                    <td className="p-2.5 font-semibold text-slate-900 sticky left-0 z-10 bg-white border-r border-slate-200 shadow-xs flex items-center justify-between gap-1">
                      <div className="truncate">
                        <span className="block truncate text-xs">{member.name}</span>
                        <span className="text-[10px] text-teal-800 font-bold">
                          {member.section}
                        </span>
                      </div>
                    </td>

                    {/* Cells for each event */}
                    {events.map((ev) => {
                      const record = attendance[ev.id]?.[member.id];
                      const status = record?.status;
                      const hasNote = !!record?.note;

                      if (status === 'SI') memberYesCount++;

                      return (
                        <td
                          key={ev.id}
                          className="p-1 text-center border-r border-slate-100 hover:bg-teal-50/50 cursor-pointer"
                          onClick={() => {
                            if (isDirector) {
                              const next = cycleStatus(status);
                              onUpdateAttendance(ev.id, member.id, next);
                            } else {
                              setSelectedCellInfo({ member, event: ev, record });
                            }
                          }}
                          title={`${member.name} - ${ev.city}: ${status || 'Non indicato'}${
                            hasNote ? ` (${record?.note})` : ''
                          }${isDirector ? ' (Clicca per modificare)' : ''}`}
                        >
                          <div className="flex items-center justify-center">
                            {status === 'SI' && (
                              <span
                                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                                  hasNote
                                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-400'
                                    : 'bg-emerald-600 text-white'
                                }`}
                              >
                                {hasNote ? 'SI*' : 'X'}
                              </span>
                            )}
                            {status === 'NO' && (
                              <span className="w-7 h-7 rounded-lg flex items-center justify-center bg-rose-100 text-rose-800 font-bold text-xs">
                                —
                              </span>
                            )}
                            {status === 'FORSE' && (
                              <span className="w-7 h-7 rounded-lg flex items-center justify-center bg-amber-100 text-amber-900 font-bold text-xs border border-amber-300">
                                ?
                              </span>
                            )}
                            {(!status || status === 'NON_INDICATO') && (
                              <span className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 text-xs">
                                ·
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}

                    {/* Member total attendance */}
                    <td className="p-2 text-center font-bold tabular-nums text-slate-900 bg-slate-50">
                      {memberYesCount}
                    </td>
                  </tr>
                );
              })}

              {/* RIGA TOTALE PER EVENTO */}
              <tr className="bg-slate-100/90 font-extrabold text-slate-900 sticky bottom-0 z-10 border-t-2 border-slate-300">
                <td className="p-2.5 sticky left-0 z-20 bg-slate-200 border-r border-slate-300 text-slate-900">
                  TOTALE PRESENTI (SI)
                </td>
                {events.map((ev) => {
                  let count = 0;
                  members.forEach((m) => {
                    if (attendance[ev.id]?.[m.id]?.status === 'SI') count++;
                  });
                  return (
                    <td key={ev.id} className="p-2 text-center border-r border-slate-300 tabular-nums">
                      <span className="text-teal-900 font-black text-xs">{count}</span>
                    </td>
                  );
                })}
                <td className="p-2 text-center text-slate-700 text-xs">
                  —
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal ispezione singola cella */}
      {selectedCellInfo && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in"
        >
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-5 space-y-3 border border-slate-200">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-teal-800 uppercase tracking-wide">
                  Scheda Presenza Corista
                </span>
                <h3 className="font-bold text-base text-slate-900">
                  {selectedCellInfo.member.name}
                </h3>
                <div className="text-xs text-slate-500">
                  {selectedCellInfo.member.section} · {selectedCellInfo.member.city}
                </div>
              </div>
              <button
                onClick={() => setSelectedCellInfo(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-700">
              <div>
                <strong>Evento:</strong> {selectedCellInfo.event.city} ({selectedCellInfo.event.date})
              </div>
              <div>
                <strong>Stato Presenza:</strong>{' '}
                <span className="font-bold text-teal-800">
                  {selectedCellInfo.record?.status || 'Non ancora indicato'}
                </span>
              </div>
              {selectedCellInfo.record?.note && (
                <div>
                  <strong>Nota personale:</strong> "{selectedCellInfo.record.note}"
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedCellInfo(null)}
              className="w-full py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
            >
              Chiudi
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

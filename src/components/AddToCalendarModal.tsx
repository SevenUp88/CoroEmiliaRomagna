import React, { useState } from 'react';
import { ChoirEvent } from '../types';
import {
  buildGoogleCalendarUrl,
  buildOutlookCalendarUrl,
  buildYahooCalendarUrl,
  openAppleCalendarDirect
} from '../utils/calendar';
import { Calendar, CalendarPlus, ExternalLink, X, Check, Sparkles } from 'lucide-react';

interface AddToCalendarModalProps {
  isOpen: boolean;
  event: ChoirEvent | null;
  onClose: () => void;
  onCalendarAdded?: (serviceName: string) => void;
}

export const AddToCalendarModal: React.FC<AddToCalendarModalProps> = ({
  isOpen,
  event,
  onClose,
  onCalendarAdded
}) => {
  const [rememberPreference, setRememberPreference] = useState(() => {
    return localStorage.getItem('crer_remember_calendar_pref') === 'true';
  });

  if (!isOpen || !event) return null;

  const handleOpenGoogle = () => {
    if (rememberPreference) {
      localStorage.setItem('crer_preferred_calendar', 'google');
      localStorage.setItem('crer_remember_calendar_pref', 'true');
    }
    const url = buildGoogleCalendarUrl(event);
    window.open(url, '_blank', 'noopener,noreferrer');
    onCalendarAdded?.('Google Calendar');
    onClose();
  };

  const handleOpenOutlook = () => {
    if (rememberPreference) {
      localStorage.setItem('crer_preferred_calendar', 'outlook');
      localStorage.setItem('crer_remember_calendar_pref', 'true');
    }
    const url = buildOutlookCalendarUrl(event);
    window.open(url, '_blank', 'noopener,noreferrer');
    onCalendarAdded?.('Outlook');
    onClose();
  };

  const handleOpenYahoo = () => {
    if (rememberPreference) {
      localStorage.setItem('crer_preferred_calendar', 'yahoo');
      localStorage.setItem('crer_remember_calendar_pref', 'true');
    }
    const url = buildYahooCalendarUrl(event);
    window.open(url, '_blank', 'noopener,noreferrer');
    onCalendarAdded?.('Yahoo Calendar');
    onClose();
  };

  const handleOpenApple = () => {
    if (rememberPreference) {
      localStorage.setItem('crer_preferred_calendar', 'apple');
      localStorage.setItem('crer_remember_calendar_pref', 'true');
    }
    openAppleCalendarDirect(event);
    onCalendarAdded?.('Apple Calendar');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-900 p-5 text-white flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
              <CalendarPlus className="w-6 h-6 text-teal-300" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-300">
                Aggiungi al tuo Calendario
              </span>
              <h3 className="text-lg font-bold text-white leading-tight">
                {event.city}: {event.title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Chiudi finestra"
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Event Preview Info Box */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 text-xs text-slate-700 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900">📅 Data e Orario:</span>
            <span className="font-semibold text-teal-800">{event.date} · {event.time}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900">📍 Sede:</span>
            <span className="text-slate-600 truncate max-w-[260px]">{event.location} ({event.city})</span>
          </div>
        </div>

        {/* Choice List */}
        <div className="p-5 space-y-3">
          <p className="text-xs text-slate-600 mb-1 font-medium">
            Seleziona il calendario che utilizzi: l'evento verrà <strong>aperto e precompilato direttamente</strong> nel tuo account o app, senza dover scaricare né importare file:
          </p>

          {/* Google Calendar - Highlighted / Recommended */}
          <button
            onClick={handleOpenGoogle}
            className="w-full p-4 rounded-2xl border-2 border-teal-600 bg-teal-50/70 hover:bg-teal-100/80 transition-all flex items-center justify-between text-left group cursor-pointer shadow-xs active:scale-98"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white border border-teal-200 flex items-center justify-center shadow-xs shrink-0">
                {/* Google Calendar Icon stylized */}
                <span className="text-base font-black text-blue-600">31</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">Google Calendar</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-teal-700 text-white uppercase tracking-wider">
                    Consigliato
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Apre subito Google Calendar su telefono o PC con data, orari e sede già pronti.
                </p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-teal-700 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </button>

          {/* Apple Calendar (iPhone / iPad / Mac) */}
          <button
            onClick={handleOpenApple}
            className="w-full p-3.5 rounded-2xl border border-slate-200 hover:border-slate-400 bg-white hover:bg-slate-50 transition-all flex items-center justify-between text-left group cursor-pointer active:scale-98"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs shrink-0 font-bold text-sm">
                
              </div>
              <div>
                <span className="font-bold text-sm text-slate-900">Apple Calendar (iPhone, iPad, Mac)</span>
                <p className="text-xs text-slate-500 mt-0.5">
                  Apre l'app Calendario di iOS o macOS per confermare l'evento.
                </p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-slate-700 shrink-0" />
          </button>

          {/* Microsoft Outlook / Office 365 */}
          <button
            onClick={handleOpenOutlook}
            className="w-full p-3.5 rounded-2xl border border-slate-200 hover:border-slate-400 bg-white hover:bg-slate-50 transition-all flex items-center justify-between text-left group cursor-pointer active:scale-98"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center shadow-xs shrink-0 font-bold text-xs">
                O
              </div>
              <div>
                <span className="font-bold text-sm text-slate-900">Microsoft Outlook / Office 365</span>
                <p className="text-xs text-slate-500 mt-0.5">
                  Apre direttamente la schermata di composizione del calendario Outlook.
                </p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-slate-700 shrink-0" />
          </button>

          {/* Yahoo Calendar */}
          <button
            onClick={handleOpenYahoo}
            className="w-full p-3.5 rounded-2xl border border-slate-200 hover:border-slate-400 bg-white hover:bg-slate-50 transition-all flex items-center justify-between text-left group cursor-pointer active:scale-98"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-700 text-white flex items-center justify-center shadow-xs shrink-0 font-bold text-xs">
                Y!
              </div>
              <div>
                <span className="font-bold text-sm text-slate-900">Yahoo Calendar</span>
                <p className="text-xs text-slate-500 mt-0.5">
                  Aggiungi direttamente al tuo account Yahoo.
                </p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-slate-700 shrink-0" />
          </button>
        </div>

        {/* Footer with preference checkbox */}
        <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 select-none">
            <input
              type="checkbox"
              checked={rememberPreference}
              onChange={(e) => {
                const val = e.target.checked;
                setRememberPreference(val);
                localStorage.setItem('crer_remember_calendar_pref', val ? 'true' : 'false');
                if (!val) {
                  localStorage.removeItem('crer_preferred_calendar');
                }
              }}
              className="rounded border-slate-300 text-teal-700 focus:ring-teal-600 w-4 h-4 cursor-pointer"
            />
            <span>Ricorda la mia scelta per i prossimi appuntamenti</span>
          </label>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer text-center"
          >
            Annulla
          </button>
        </div>

      </div>
    </div>
  );
};

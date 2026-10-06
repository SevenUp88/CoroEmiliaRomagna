import React, { useState, useEffect } from 'react';
import { PushNotification, VoiceSection } from '../types';
import {
  Bell,
  BellRing,
  Send,
  AlertTriangle,
  Calendar,
  BookOpen,
  Info,
  CheckCheck,
  Shield,
  Clock,
  Check,
  Share2,
  HelpCircle,
  Smartphone,
  CalendarDays,
  MessageCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface NotificationCenterProps {
  notifications: PushNotification[];
  onMarkAllAsRead: () => void;
  onSendNotification: (notification: Omit<PushNotification, 'id' | 'timestamp' | 'read'>) => void;
  isDirector: boolean;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onMarkAllAsRead,
  onSendNotification,
  isDirector
}) => {
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>('default');
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [showNotificationGuide, setShowNotificationGuide] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [notifType, setNotifType] = useState<'urgent' | 'reschedule' | 'score' | 'info'>('info');
  const [targetSection, setTargetSection] = useState<VoiceSection | 'ALL'>('ALL');
  const [sentSuccess, setSentSuccess] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setBrowserPermission(Notification.permission);
    }
  }, []);

  const requestBrowserPush = async () => {
    if (!('Notification' in window)) {
      alert('Il tuo browser non supporta le notifiche push native, ma le trovi comunque in questa bacheca.');
      return;
    }

    try {
      const perm = await Notification.requestPermission();
      setBrowserPermission(perm);
      if (perm === 'granted') {
        new Notification('CRER - Coro Regionale Emilia-Romagna', {
          body: 'Notifiche push attivate con successo! Riceverai qui gli avvisi e le comunicazioni del coro.',
          icon: '/favicon.ico'
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleComposeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    onSendNotification({
      title,
      message,
      type: notifType,
      targetSection,
      author: isDirector ? 'Daniele' : 'Coordinamento Coro'
    });

    // Also trigger native browser notification if granted
    if (browserPermission === 'granted') {
      try {
        new Notification(`CRER: ${title}`, {
          body: message,
          tag: 'crer-notice'
        });
      } catch {
        // safe fallback
      }
    }

    setTitle('');
    setMessage('');
    setShowComposeModal(false);
    setSentSuccess(true);
    setTimeout(() => setSentSuccess(false), 4000);
  };

  const shareToWhatsApp = (notif: PushNotification) => {
    const text = `📢 *CRER - Avviso Ufficiale Coro*\n\n*${notif.title}*\n${notif.message}\n\n👤 _Da: ${notif.author}_\n🔗 _Apri l'app_: ${window.location.href}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const formatTimestamp = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('it-IT', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Bacheca */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-teal-50 text-teal-800 rounded-lg">
              <BellRing className="w-5 h-5 text-teal-700" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
              Comunicazioni Ufficiali & Notifiche Push
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Bacheca Avvisi & Notifiche Coro
          </h2>
          <p className="text-sm text-slate-600 max-w-2xl">
            Tutti gli aggiornamenti su orari, cambi sala, spartiti caricati e comunicazioni del direttore del coro sempre a portata di mano.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setShowNotificationGuide(!showNotificationGuide)}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
            title="Come funzionano le notifiche per questa app da link"
          >
            <HelpCircle className="w-4 h-4 text-teal-700" />
            <span>Come funzionano le notifiche?</span>
            {showNotificationGuide ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
          </button>

          {browserPermission !== 'granted' && (
            <button
              onClick={requestBrowserPush}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-colors shadow-xs flex items-center gap-2"
            >
              <Bell className="w-4 h-4" />
              Abilita Notifiche sul Telefono
            </button>
          )}

          <button
            onClick={() => setShowComposeModal(true)}
            className="px-4 py-2.5 bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors shadow-xs flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Invia Nuovo Avviso
          </button>
        </div>
      </div>

      {/* Guida esplicativa: Come avvengono le notifiche in un'app online da link */}
      {showNotificationGuide && (
        <div className="bg-gradient-to-br from-teal-900 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-7 border border-teal-800/40 shadow-lg space-y-5 animate-in fade-in duration-200">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-teal-500/20 text-teal-300 rounded-xl">
                <Smartphone className="w-6 h-6 text-teal-400" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Come avvengono le notifiche se questa è un’app online da link?
                </h3>
                <p className="text-xs text-teal-200/80">
                  Questa applicazione è una Web App moderna (PWA) fruibile via link senza dover passare dall’App Store o Play Store.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowNotificationGuide(false)}
              className="text-slate-400 hover:text-white p-1 text-sm cursor-pointer"
            >
              ✕ Chiudi
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-teal-300 font-bold">
                <BellRing className="w-4 h-4 text-teal-400" />
                <span>1. Bacheca & Pallino Rosso</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Appena apri l’app da link, il campanellino mostra il <strong>pallino rosso</strong> con il conteggio degli avvisi non ancora letti.
              </p>
            </div>

            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-emerald-300 font-bold">
                <CalendarDays className="w-4 h-4 text-emerald-400" />
                <span>2. Promemoria nel Telefono</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Aggiungendo prove e concerti a <strong>Google Calendar</strong> o <strong>Calendario Apple (iPhone)</strong> con 1 tocco, lo smartphone invia la notifica automatica prima di ogni data, anche ad app chiusa!
              </p>
            </div>

            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <Bell className="w-4 h-4 text-amber-400" />
                <span>3. Notifiche Browser (Web Push)</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Premendo <em>"Abilita Notifiche"</em>, il browser (Chrome, Edge, Safari iOS 16.4+ aggiungendo l’app alla schermata Home) mostra le notifiche popup di sistema.
              </p>
            </div>

            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-green-300 font-bold">
                <MessageCircle className="w-4 h-4 text-green-400" />
                <span>4. Inoltro Diretto WhatsApp</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Su ogni avviso c’è il pulsante <strong>"Invia su WhatsApp"</strong>: puoi inoltrare l'avviso con il link dell'app istantaneamente nella chat di gruppo del coro.
              </p>
            </div>
          </div>
        </div>
      )}

      {sentSuccess && (
        <div className="p-4 bg-emerald-100 border border-emerald-300 rounded-2xl text-emerald-900 font-bold text-sm flex items-center gap-2 animate-in fade-in">
          <Check className="w-5 h-5 text-emerald-700" />
          Avviso inviato con successo alla bacheca del coro!
        </div>
      )}

      {/* Control bar */}
      <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
          Avvisi Recenti ({notifications.length})
        </span>

        <button
          onClick={onMarkAllAsRead}
          className="text-xs font-semibold text-teal-800 hover:underline flex items-center gap-1"
        >
          <CheckCheck className="w-4 h-4" />
          Segna tutti come letti
        </button>
      </div>

      {/* Lista Notifiche */}
      <div className="space-y-3">
        {notifications.map((notif) => {
          return (
            <div
              key={notif.id}
              className={`p-5 rounded-2xl border transition-all shadow-xs ${
                notif.read
                  ? 'bg-white border-slate-200'
                  : 'bg-teal-50/40 border-teal-300 ring-1 ring-teal-200'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    notif.type === 'urgent'
                      ? 'bg-red-100 text-red-700'
                      : notif.type === 'reschedule'
                      ? 'bg-amber-100 text-amber-800'
                      : notif.type === 'score'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-teal-100 text-teal-800'
                  }`}
                >
                  {notif.type === 'urgent' && <AlertTriangle className="w-5 h-5" />}
                  {notif.type === 'reschedule' && <Calendar className="w-5 h-5" />}
                  {notif.type === 'score' && <BookOpen className="w-5 h-5" />}
                  {notif.type === 'info' && <Info className="w-5 h-5" />}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-slate-900">{notif.title}</h3>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-red-600 inline-block" />
                      )}
                    </div>
                    <span className="text-xs text-slate-400 font-mono">
                      {formatTimestamp(notif.timestamp)}
                    </span>
                  </div>

                  <p className="text-sm text-slate-700 leading-relaxed pt-1">
                    {notif.message}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-1 border-t border-slate-100 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-700">Da: {notif.author}</span>
                      <span>·</span>
                      <span>
                        Destinatari:{' '}
                        <strong className="text-teal-800">
                          {notif.targetSection === 'ALL' ? 'Tutto il Coro' : `Solo ${notif.targetSection}`}
                        </strong>
                      </span>
                    </div>

                    <button
                      onClick={() => shareToWhatsApp(notif)}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Inoltra questo avviso nella chat WhatsApp del coro"
                    >
                      <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Invia su WhatsApp</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Invia Nuovo Avviso */}
      {showComposeModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in"
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-teal-800 uppercase tracking-wide">
                  Comunicazione Ufficiale
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  Scrivi un Avviso per il Coro
                </h3>
              </div>
              <button
                onClick={() => setShowComposeModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleComposeSubmit} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tipologia Avviso:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'info', label: '📢 Comunicazione' },
                    { id: 'urgent', label: '🚨 Urgente / Importante' },
                    { id: 'reschedule', label: '📅 Spostamento Prova' },
                    { id: 'score', label: '🎼 Nuovo Spartito' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setNotifType(t.id as any)}
                      className={`p-2 rounded-xl text-xs font-bold border transition-colors ${
                        notifType === t.id
                          ? 'bg-teal-800 text-white border-teal-900 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Destinatari:
                </label>
                <select
                  value={targetSection}
                  onChange={(e) => setTargetSection(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs font-bold"
                >
                  <option value="ALL">Tutto il Coro (Tutte le sezioni)</option>
                  <option value="Soprano">Solo Sezione Soprani</option>
                  <option value="Contralto">Solo Sezione Contralti</option>
                  <option value="Tenore">Solo Sezione Tenori</option>
                  <option value="Baritono">Solo Sezione Baritoni</option>
                  <option value="Basso">Solo Sezione Bassi</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Oggetto / Titolo Avviso:
                </label>
                <input
                  type="text"
                  placeholder="es. Anticipo orario ritrovo a Parma"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-teal-700"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Messaggio:
                </label>
                <textarea
                  placeholder="Scrivi qui il testo dell'avviso in modo chiaro..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-teal-700"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowComposeModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-bold"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Pubblica ed Invia Notifica
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

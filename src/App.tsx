/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ChoirMember,
  ChoirEvent,
  AttendanceRecord,
  PushNotification,
  AccessibilitySettings,
  AttendanceStatus,
  VoiceSection
} from './types';
import { INITIAL_MEMBERS, OFFICIAL_LINKS } from './data/initialData';
import {
  getStoredCurrentUser,
  setStoredCurrentUser,
  getStoredMembers,
  saveStoredMembers,
  getStoredAttendance,
  saveStoredAttendance,
  clearStoredAttendance,
  getStoredEvents,
  saveStoredEvents,
  getStoredNotifications,
  saveStoredNotifications,
  getStoredAccessibility,
  saveStoredAccessibility
} from './utils/storage';

import { Header } from './components/Header';
import { CalendarView } from './components/CalendarView';
import { DirectorDashboard } from './components/DirectorDashboard';
import { AttendanceMatrixView } from './components/AttendanceMatrixView';
import { getWelcomeGreeting } from './utils/formatGreeting';
import { ScoreLibrary } from './components/ScoreLibrary';
import { NotificationCenter } from './components/NotificationCenter';
import { IdentitySelectorModal } from './components/IdentitySelectorModal';
import { EventEditorModal } from './components/EventEditorModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { BottomNavBar } from './components/BottomNavBar';
import { CrerLogo } from './components/CrerLogo';
import { ExternalLink, CheckCircle2, MessageCircle, FileSpreadsheet, FolderOpen } from 'lucide-react';

export default function App() {
  const [members, setMembers] = useState<ChoirMember[]>(getStoredMembers());
  const [currentUserId, setCurrentUserId] = useState<string>(getStoredCurrentUser());
  const [events, setEvents] = useState<ChoirEvent[]>(getStoredEvents());
  const [attendance, setAttendance] = useState<Record<string, Record<string, AttendanceRecord>>>(getStoredAttendance());
  const [notifications, setNotifications] = useState<PushNotification[]>(getStoredNotifications());
  const [accessibility, setAccessibility] = useState<AccessibilitySettings>(getStoredAccessibility());

  const [currentTab, setCurrentTab] = useState<'calendar' | 'scores' | 'director' | 'matrix' | 'notifications'>('calendar');
  const [isIdentityModalOpen, setIsIdentityModalOpen] = useState(false);
  const [isEventEditorOpen, setIsEventEditorOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('crer_admin_authenticated') === 'true';
  });
  const [eventToEdit, setEventToEdit] = useState<ChoirEvent | null>(null);
  const [selectedEventForDirector, setSelectedEventForDirector] = useState<string | undefined>(undefined);
  const [fontToast, setFontToast] = useState<string | null>(null);

  // Auto-open identity modal on first visit if user has not yet set their profile and is not admin
  useEffect(() => {
    if (!currentUserId && !isAdmin) {
      setIsIdentityModalOpen(true);
    }
  }, []);

  // Determine current active user
  const isDirector = currentUserId === 'director';
  const currentUser = isDirector ? null : members.find((m) => m.id === currentUserId) || null;

  // Real Root HTML Font-Size Scaler for Senior Accessibility
  useEffect(() => {
    const root = document.documentElement;
    if (accessibility.fontSize === 'extra-large') {
      root.style.fontSize = '20.5px'; // ~128% standard size
      setFontToast('Dimensione testo: Molto Grande (A++)');
    } else if (accessibility.fontSize === 'large') {
      root.style.fontSize = '18px'; // ~112% standard size
      setFontToast('Dimensione testo: Ingrandito (A+)');
    } else {
      root.style.fontSize = '16px'; // standard 100%
      setFontToast('Dimensione testo: Standard (A)');
    }

    const timer = setTimeout(() => {
      setFontToast(null);
    }, 2400);

    return () => clearTimeout(timer);
  }, [accessibility.fontSize]);

  // Dark / Light Theme Applier
  useEffect(() => {
    const root = document.documentElement;
    if (accessibility.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [accessibility.theme]);

  // Persist state changes
  useEffect(() => {
    setStoredCurrentUser(currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    saveStoredAttendance(attendance);
  }, [attendance]);

  useEffect(() => {
    saveStoredEvents(events);
  }, [events]);

  useEffect(() => {
    saveStoredNotifications(notifications);
  }, [notifications]);

  useEffect(() => {
    saveStoredAccessibility(accessibility);
  }, [accessibility]);

  // Handler for saving or updating member (Nome, Cognome, Città, Sezione Vocale)
  const handleSaveMember = (memberData: { name: string; city: string; section: VoiceSection }) => {
    const trimmedName = memberData.name.trim();
    const trimmedCity = memberData.city.trim();

    const existingIndex = members.findIndex(
      (m) =>
        m.name.toLowerCase() === trimmedName.toLowerCase() ||
        (currentUser && m.id === currentUser.id)
    );

    let targetId = '';
    let updatedList: ChoirMember[] = [];

    if (existingIndex >= 0) {
      targetId = members[existingIndex].id;
      updatedList = [...members];
      updatedList[existingIndex] = {
        ...updatedList[existingIndex],
        name: trimmedName,
        city: trimmedCity || updatedList[existingIndex].city,
        section: memberData.section
      };
    } else {
      targetId = `crer-singer-${Date.now()}`;
      const newMember: ChoirMember = {
        id: targetId,
        name: trimmedName,
        city: trimmedCity,
        section: memberData.section
      };
      updatedList = [newMember, ...members];
    }

    setMembers(updatedList);
    saveStoredMembers(updatedList);
    setCurrentUserId(targetId);
    setStoredCurrentUser(targetId);
  };

  // Attendance update handler for a single singer & event
  const handleUpdateAttendance = (eventId: string, status: AttendanceStatus, note?: string) => {
    if (!currentUser && !isDirector) {
      setIsIdentityModalOpen(true);
      return;
    }

    const memberId = currentUser ? currentUser.id : 'dir-mock';

    setAttendance((prev) => {
      const eventMap = { ...(prev[eventId] || {}) };
      eventMap[memberId] = {
        memberId,
        status,
        note: note !== undefined ? note : eventMap[memberId]?.note,
        updatedAt: new Date().toISOString()
      };
      return {
        ...prev,
        [eventId]: eventMap
      };
    });
  };

  // Matrix inline update (for director or specific member)
  const handleMatrixCellUpdate = (eventId: string, memberId: string, status: AttendanceStatus) => {
    setAttendance((prev) => {
      const eventMap = { ...(prev[eventId] || {}) };
      eventMap[memberId] = {
        memberId,
        status,
        note: eventMap[memberId]?.note,
        updatedAt: new Date().toISOString()
      };
      return {
        ...prev,
        [eventId]: eventMap
      };
    });
  };

  // Reset simulated attendance to empty/unanswered
  const handleResetAttendance = () => {
    const clean = clearStoredAttendance(members, events);
    setAttendance(clean);
  };

  // Event update handler (rescheduling by director)
  const handleUpdateEvent = (updatedEvent: ChoirEvent) => {
    setEvents((prev) => prev.map((ev) => (ev.id === updatedEvent.id ? updatedEvent : ev)));
  };

  const handleOpenEventEditor = (event: ChoirEvent | null) => {
    setEventToEdit(event);
    setIsEventEditorOpen(true);
  };

  const handleSaveEvent = (
    savedEvent: ChoirEvent,
    isNew: boolean,
    notifyChoir: boolean,
    customNotificationMsg?: string
  ) => {
    if (isNew) {
      setEvents((prev) =>
        [savedEvent, ...prev].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        )
      );

      // Initialize attendance records for all members
      setAttendance((prev) => {
        const eventAttendance: Record<string, AttendanceRecord> = {};
        members.forEach((m) => {
          eventAttendance[m.id] = {
            memberId: m.id,
            status: 'NON_INDICATO',
            updatedAt: new Date().toISOString()
          };
        });
        return {
          ...prev,
          [savedEvent.id]: eventAttendance
        };
      });

      if (notifyChoir) {
        handleSendNotification({
          title: `Nuovo Appuntamento: ${savedEvent.city} (${savedEvent.date})`,
          message:
            customNotificationMsg ||
            `Nuovo impegno in calendario: "${savedEvent.title}" a ${savedEvent.city} il ${savedEvent.date} (Orario: ${savedEvent.time}). Scaletta brani: ${savedEvent.program.join(', ')}. Si prega di confermare la propria presenza!`,
          type: 'info',
          targetSection: 'ALL',
          author: 'Daniele',
          eventId: savedEvent.id
        });
      }
    } else {
      setEvents((prev) =>
        prev
          .map((e) => (e.id === savedEvent.id ? savedEvent : e))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      );

      if (notifyChoir) {
        handleSendNotification({
          title: `Aggiornamento Scaletta & Dati: ${savedEvent.city} (${savedEvent.date})`,
          message:
            customNotificationMsg ||
            `Aggiornata la scaletta dei brani e le indicazioni per la data di ${savedEvent.city}. Brani in programma: ${savedEvent.program.join(', ')}.`,
          type: 'score',
          targetSection: 'ALL',
          author: 'Daniele',
          eventId: savedEvent.id
        });
      }
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
    setAttendance((prev) => {
      const copy = { ...prev };
      delete copy[eventId];
      return copy;
    });
  };

  // Notification send handler
  const handleSendNotification = (newNotifData: Omit<PushNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: PushNotification = {
      ...newNotifData,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const handleSelectEventForDirector = (eventId: string) => {
    setSelectedEventForDirector(eventId);
    setCurrentTab('director');
  };

  const handleAdminLoginSuccess = () => {
    setIsAdmin(true);
    localStorage.setItem('crer_admin_authenticated', 'true');
    setFontToast('Accesso Amministratore attivato: funzioni avanzate ed export sbloccati');
    setTimeout(() => setFontToast(null), 3500);
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('crer_admin_authenticated');
    setFontToast('Sessione Amministratore terminata');
    setTimeout(() => setFontToast(null), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col pb-20 md:pb-12">
      {/* Toast Notifica Dimensione Caratteri */}
      {fontToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="bg-slate-900/90 text-white px-4 py-2 rounded-full shadow-lg text-xs font-bold flex items-center gap-2 border border-slate-700">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
            <span>{fontToast}</span>
          </div>
        </div>
      )}

      {/* Official Top Navigation Bar */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        isDirector={isDirector}
        isAdmin={isAdmin}
        onOpenIdentityModal={() => setIsIdentityModalOpen(true)}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        unreadNotificationsCount={unreadNotificationsCount}
        accessibility={accessibility}
        setAccessibility={setAccessibility}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'calendar' && (
          <CalendarView
            events={events}
            currentUser={currentUser}
            attendance={attendance}
            onUpdateAttendance={handleUpdateAttendance}
            onOpenIdentityModal={() => setIsIdentityModalOpen(true)}
            isDirector={isDirector}
            isAdmin={isAdmin}
            onSelectEventForDirector={handleSelectEventForDirector}
            onOpenEventEditor={handleOpenEventEditor}
          />
        )}

        {currentTab === 'director' && (
          <DirectorDashboard
            events={events}
            members={members}
            attendance={attendance}
            onUpdateEvent={handleUpdateEvent}
            onSendNotification={handleSendNotification}
            selectedEventId={selectedEventForDirector}
            onOpenEventEditor={handleOpenEventEditor}
            onUpdateAttendanceRecord={handleMatrixCellUpdate}
            isAdmin={isAdmin}
          />
        )}

        {currentTab === 'matrix' && (
          <AttendanceMatrixView
            events={events}
            members={members}
            attendance={attendance}
            onUpdateAttendance={handleMatrixCellUpdate}
            onResetAttendance={handleResetAttendance}
            isDirector={isDirector}
            isAdmin={isAdmin}
            onOpenAdminModal={() => setIsAdminModalOpen(true)}
          />
        )}

        {currentTab === 'scores' && (
          <ScoreLibrary
            userSection={currentUser?.section}
            isDirector={isDirector}
            isAdmin={isAdmin}
          />
        )}

        {currentTab === 'notifications' && (
          <NotificationCenter
            notifications={notifications}
            onMarkAllAsRead={handleMarkAllNotificationsAsRead}
            onSendNotification={handleSendNotification}
            isDirector={isDirector}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar for rapid thumb access */}
      <BottomNavBar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        unreadCount={unreadNotificationsCount}
      />

      {/* Modals */}
      <IdentitySelectorModal
        isOpen={isIdentityModalOpen}
        onClose={() => setIsIdentityModalOpen(false)}
        members={members}
        currentUserId={currentUserId}
        onSelectUser={(userId) => {
          setCurrentUserId(userId);
          setStoredCurrentUser(userId);
          if (userId === 'director') {
            setFontToast('Benvenuto Daniele');
            setTimeout(() => setFontToast(null), 3000);
            setCurrentTab('director');
          } else if (userId) {
            const selectedMember = members.find(m => m.id === userId);
            if (selectedMember) {
              setFontToast(getWelcomeGreeting(selectedMember));
              setTimeout(() => setFontToast(null), 3000);
            }
          }
        }}
        onSaveMember={handleSaveMember}
      />

      <EventEditorModal
        isOpen={isEventEditorOpen}
        onClose={() => {
          setIsEventEditorOpen(false);
          setEventToEdit(null);
        }}
        eventToEdit={eventToEdit}
        onSaveEvent={handleSaveEvent}
        onDeleteEvent={handleDeleteEvent}
      />

      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        isAdmin={isAdmin}
        onLoginSuccess={handleAdminLoginSuccess}
        onLogout={handleAdminLogout}
      />

      {/* Institutional Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <CrerLogo size="sm" showSubtitle={false} />
            <div>
              <span className="font-bold text-slate-800">Coro Regionale dell’Emilia-Romagna</span>
              <p className="text-[11px] text-slate-400">Associazione Emiliano-Romagnola Cori · AERCO</p>
            </div>
          </div>

          {/* Quick Official Links */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-semibold">
            <a
              href={OFFICIAL_LINKS.GOOGLE_SHEET_ATTENDANCE}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-800 hover:text-teal-950 flex items-center gap-1 hover:underline"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Foglio Google Ufficiale</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>

            <a
              href={OFFICIAL_LINKS.GOOGLE_DRIVE_SCORES}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-800 hover:text-teal-950 flex items-center gap-1 hover:underline"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Drive Spartiti</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>

            <a
              href={OFFICIAL_LINKS.COMMUNITY_ADMIN.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 hover:text-emerald-900 flex items-center gap-1 hover:underline bg-emerald-50 px-2.5 py-0.5 rounded-full"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{isDirector || isAdmin ? `WhatsApp (${OFFICIAL_LINKS.COMMUNITY_ADMIN.phone})` : 'WhatsApp Coordinamento'}</span>
            </a>
          </div>

          <div className="text-center sm:text-right">
            <span>Stagione Corale 2026 · Piattaforma Gestione Prove & Spartiti</span>
            <div className="text-[11px] text-teal-800 font-medium mt-0.5">
              Accessibilità per smartphone, tablet e PC
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

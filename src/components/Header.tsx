import React from 'react';
import { CrerLogo } from './CrerLogo';
import { ChoirMember, AccessibilitySettings } from '../types';
import { Shield } from 'lucide-react';
import { getWelcomeGreeting } from '../utils/formatGreeting';

interface HeaderProps {
  currentTab: 'calendar' | 'scores' | 'director' | 'matrix' | 'notifications';
  setCurrentTab: (tab: 'calendar' | 'scores' | 'director' | 'matrix' | 'notifications') => void;
  currentUser: ChoirMember | null;
  isDirector: boolean;
  isAdmin?: boolean;
  onOpenIdentityModal: () => void;
  onOpenAdminModal?: () => void;
  unreadNotificationsCount?: number;
  accessibility?: AccessibilitySettings;
  setAccessibility?: React.Dispatch<React.SetStateAction<AccessibilitySettings>>;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  isDirector,
  isAdmin = false,
  onOpenIdentityModal,
  onOpenAdminModal
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Bar 3-Zone Contract */}
        <div className="flex items-center justify-between min-h-[76px] sm:min-h-[88px] py-2 gap-2 sm:gap-4">
          
          {/* Zone 1: Brand Wordmark & Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setCurrentTab('calendar')}
              className="flex items-center gap-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 rounded-lg p-0.5"
              aria-label="Torna al calendario prove del Coro Regionale Emilia-Romagna"
            >
              <CrerLogo size="lg" />
            </button>
          </div>

          {/* Zone 2: 4-5 Clean Text Nav Links */}
          <nav
            aria-label="Navigazione principale"
            className="hidden md:flex items-center gap-1 lg:gap-2 text-sm font-semibold text-slate-700"
          >
            <button
              onClick={() => setCurrentTab('calendar')}
              className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                currentTab === 'calendar'
                  ? 'text-teal-900 bg-teal-50 font-bold border-b-2 border-teal-700'
                  : 'hover:text-teal-800 hover:bg-slate-50'
              }`}
            >
              Prove & Concerti
            </button>

            <button
              onClick={() => setCurrentTab('scores')}
              className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                currentTab === 'scores'
                  ? 'text-teal-900 bg-teal-50 font-bold border-b-2 border-teal-700'
                  : 'hover:text-teal-800 hover:bg-slate-50'
              }`}
            >
              Spartiti & Basi
            </button>

            <button
              onClick={() => setCurrentTab('matrix')}
              className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                currentTab === 'matrix'
                  ? 'text-teal-900 bg-teal-50 font-bold border-b-2 border-teal-700'
                  : 'hover:text-teal-800 hover:bg-slate-50'
              }`}
            >
              Registro Presenze
            </button>

            <button
              onClick={() => setCurrentTab('director')}
              className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                currentTab === 'director'
                  ? 'text-teal-900 bg-teal-50 font-bold border-b-2 border-teal-700'
                  : 'hover:text-teal-800 hover:bg-slate-50'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-teal-700" />
              Pannello Direttore
            </button>
          </nav>

          {/* Zone 3: Profilo & Admin */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* User Profile Switcher - mostrato solo se l'utente ha inserito i suoi dati o è direttore */}
            {(currentUser || isDirector) && (
              <button
                onClick={onOpenIdentityModal}
                aria-label="Profilo corista, modifica dati o accedi come direttore"
                className={`flex items-center gap-2 pl-2 sm:pl-3 pr-2.5 sm:pr-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                  isDirector
                    ? 'bg-slate-900 text-white border-slate-700 shadow-sm hover:bg-slate-800'
                    : 'bg-teal-50 border-teal-200 text-teal-950 hover:bg-teal-100 hover:border-teal-300'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${
                    isDirector ? 'bg-teal-700 text-white shadow-xs' : 'bg-teal-700 text-white'
                  }`}
                >
                  {isDirector ? (
                    <Shield className="w-3.5 h-3.5 text-white" />
                  ) : (
                    currentUser?.name.slice(0, 2).toUpperCase() || 'CR'
                  )}
                </div>
                <div className="text-left max-w-[140px] sm:max-w-[210px] truncate">
                  <div
                    className={`text-xs font-black truncate leading-tight ${
                      isDirector ? 'text-white' : 'text-teal-950'
                    }`}
                  >
                    {getWelcomeGreeting(currentUser, isDirector)}
                  </div>
                  {!isDirector && (
                    <div className="text-[10px] truncate leading-tight text-teal-800 font-semibold">
                      {currentUser
                        ? `${currentUser.section}${currentUser.city ? ` · ${currentUser.city}` : ''}`
                        : 'Coro Regionale'}
                    </div>
                  )}
                </div>
              </button>
            )}

            {/* Admin Session Button / Access */}
            {isAdmin ? (
              <button
                onClick={onOpenAdminModal}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/50 text-amber-900 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                title="Sessione Amministratore attiva (Clicca per gestire o disconnettere)"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>Admin</span>
              </button>
            ) : (
              onOpenAdminModal && (
                <button
                  onClick={onOpenAdminModal}
                  title="Accesso Amministratore Coro (Password protetta)"
                  aria-label="Accesso Amministratore"
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                </button>
              )
            )}

          </div>
        </div>
      </div>
    </header>
  );
};

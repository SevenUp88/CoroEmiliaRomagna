import React, { useState, useEffect } from 'react';
import { ChoirMember, VoiceSection } from '../types';
import { getWelcomeGreeting } from '../utils/formatGreeting';
import { CrerLogo } from './CrerLogo';
import { Shield, Check, X, MapPin, User, CheckCircle2, Sparkles, ArrowRight, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface IdentitySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: ChoirMember[];
  currentUserId: string;
  onSelectUser: (userId: string) => void;
  onSaveMember: (memberData: { name: string; city: string; section: VoiceSection }) => void;
}

const DIRECTOR_PASSWORD = 'Sconosciuto26';

export const IdentitySelectorModal: React.FC<IdentitySelectorModalProps> = ({
  isOpen,
  onClose,
  members,
  currentUserId,
  onSelectUser,
  onSaveMember
}) => {
  const currentMember = members.find((m) => m.id === currentUserId);
  const isDirector = currentUserId === 'director';

  // Form State
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [section, setSection] = useState<VoiceSection>('Soprano');

  // Director Password Protection State
  const [isDirectorAuthOpen, setIsDirectorAuthOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Prefill when opened
  useEffect(() => {
    if (currentMember) {
      setName(currentMember.name);
      setCity(currentMember.city || '');
      setSection(currentMember.section);
    } else {
      setName('');
      setCity('');
      setSection('Soprano');
    }
    setIsDirectorAuthOpen(false);
    setPasswordInput('');
    setPasswordError(false);
    setShowPassword(false);
  }, [currentMember, isOpen]);

  if (!isOpen) return null;

  const sections: VoiceSection[] = ['Soprano', 'Contralto', 'Tenore', 'Baritono', 'Basso'];
  const commonCities = [
    'Bologna',
    'Modena',
    'Reggio Emilia',
    'Parma',
    'Ferrara',
    'Ravenna',
    'Forlì',
    'Cesena',
    'Rimini',
    'Piacenza'
  ];

  // Smart suggestions from existing member list
  const matchingMembers =
    name.trim().length >= 2
      ? members.filter((m) => m.name.toLowerCase().includes(name.trim().toLowerCase())).slice(0, 3)
      : [];

  const handlePickSuggestedMember = (m: ChoirMember) => {
    setName(m.name);
    setCity(m.city || '');
    setSection(m.section);
    onSelectUser(m.id);
    onClose();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSaveMember({
      name: name.trim(),
      city: city.trim(),
      section
    });
    onClose();
  };

  const handleDirectorPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === DIRECTOR_PASSWORD) {
      setPasswordError(false);
      onSelectUser('director');
      onClose();
    } else {
      setPasswordError(true);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="identity-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header Modal with Official CRER Logo */}
        <div className="p-5 sm:p-6 border-b border-slate-200/90 bg-gradient-to-b from-teal-50/70 via-white to-white relative text-center flex flex-col items-center">
          <button
            onClick={onClose}
            aria-label="Chiudi finestra"
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Logo Ufficiale del Coro - Grande e Nitido */}
          <div className="mb-2">
            <CrerLogo size="lg" className="drop-shadow-xs" />
          </div>

          <div className="inline-flex items-center gap-1.5 bg-teal-100/70 border border-teal-200 text-teal-900 px-3 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase mb-1.5">
            <span>Stagione Corale 2026</span>
          </div>

          <h2 id="identity-modal-title" className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {currentMember ? getWelcomeGreeting(currentMember) : 'Portale CRER'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-md">
            {currentMember
              ? 'Aggiorna nominativo, città di residenza o sezione vocale.'
              : 'Inserisci i tuoi dati una sola volta: resteranno salvati per tutte le prossime volte su questo dispositivo.'}
          </p>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-6">

          {/* 1. SEZIONE DIRETTORE IN EVIDENZA (PROTETTA DA PASSWORD: Sconosciuto26) */}
          <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-teal-700/60 shadow-xs space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center shrink-0 text-teal-300">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-sm text-white flex items-center gap-2">
                    <span>
                      {isDirector ? 'Accesso Direttore Attivo' : 'Accesso Direttore'}
                    </span>
                    {isDirector && (
                      <span className="text-[10px] bg-emerald-500 text-white font-bold px-2 py-0.5 rounded-full">
                        ATTIVO
                      </span>
                    )}
                  </div>
                  {!isDirector && (
                    <p className="text-xs text-teal-100/80 mt-0.5">
                      Accesso per programmazione prove e scalette brani.
                    </p>
                  )}
                </div>
              </div>

              {!isDirectorAuthOpen && !isDirector && (
                <button
                  type="button"
                  onClick={() => setIsDirectorAuthOpen(true)}
                  className="px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all shrink-0 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm bg-white hover:bg-teal-50 text-teal-950 hover:shadow"
                >
                  <Lock className="w-3.5 h-3.5 text-teal-800" />
                  <span>Accesso Direttore</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {isDirector && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectUser('');
                      setIsDirectorAuthOpen(false);
                    }}
                    className="text-xs text-teal-200 hover:text-white underline cursor-pointer ml-1"
                  >
                    Esci
                  </button>
                </div>
              )}
            </div>

            {/* Form Inserimento Password Direttore */}
            {isDirectorAuthOpen && !isDirector && (
              <form
                onSubmit={handleDirectorPasswordSubmit}
                className="pt-2 border-t border-teal-700/50 space-y-2.5 animate-in fade-in"
              >
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-teal-200 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-teal-300" />
                    <span>Password di Accesso Direzione:</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsDirectorAuthOpen(false);
                      setPasswordError(false);
                    }}
                    className="text-xs text-teal-300 hover:text-white"
                  >
                    Annulla
                  </button>
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      autoFocus
                      required
                      value={passwordInput}
                      onChange={(e) => {
                        setPasswordInput(e.target.value);
                        setPasswordError(false);
                      }}
                      placeholder="Inserisci password direttore..."
                      className="w-full pl-3.5 pr-10 py-2.5 bg-slate-800/90 border border-teal-500/50 rounded-xl text-sm font-semibold text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-300 hover:text-white"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs shrink-0 cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Accedi</span>
                  </button>
                </div>

                {passwordError && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-300 font-semibold bg-rose-950/60 p-2 rounded-lg border border-rose-800/80">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Password non corretta. Verifica con la Direzione del Coro.</span>
                  </div>
                )}
              </form>
            )}
          </div>

          {/* Separatore per Coristi */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200" />
            <span className="shrink mx-3 text-xs font-bold text-slate-500 uppercase tracking-wider bg-white px-2">
              Oppure accedi come Corista
            </span>
            <div className="flex-grow border-t border-slate-200" />
          </div>

          {/* 2. FORM DIRETTO E UNICO PER IL CORISTA */}
          <form onSubmit={handleFormSubmit} className="space-y-5">
            
            {/* 1. NOME E COGNOME */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                1. Nome e Cognome <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Es. Mario Rossi o Maria Letizia Bagnoli"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-base font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:bg-white transition-all shadow-2xs"
                />
              </div>

              {/* Suggerimenti automatici se presente nel registro coristi */}
              {matchingMembers.length > 0 && matchingMembers[0].name.toLowerCase() !== name.trim().toLowerCase() && (
                <div className="mt-2 p-2.5 bg-teal-50 border border-teal-200 rounded-xl space-y-1.5">
                  <div className="text-[11px] font-bold text-teal-900 uppercase tracking-wide">
                    Sei già nel registro? Tocca per compilare all'istante:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {matchingMembers.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handlePickSuggestedMember(m)}
                        className="px-2.5 py-1 bg-white hover:bg-teal-700 hover:text-white text-teal-900 text-xs font-bold rounded-lg border border-teal-300 transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                      >
                        <span>{m.name}</span>
                        <span className="opacity-75 text-[10px]">({m.section})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 2. CITTÀ DI RESIDENZA */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  2. Città di Residenza
                </label>
                <span className="text-[11px] text-slate-500">Per organizzare passaggi auto</span>
              </div>
              <div className="relative">
                <MapPin className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Es. Bologna, Ferrara, Parma, Reggio Emilia..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-base font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:bg-white transition-all shadow-2xs"
                />
              </div>

              {/* Tasti rapidi città dell'Emilia-Romagna */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {commonCities.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCity(c)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      city.toLowerCase() === c.toLowerCase()
                        ? 'bg-teal-800 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. SEZIONE VOCALE */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                3. Sezione Vocale <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {sections.map((sec) => {
                  const isSelected = section === sec;
                  return (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setSection(sec)}
                      className={`p-3.5 rounded-2xl border-2 font-bold text-sm sm:text-base flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'border-teal-700 bg-teal-50 text-teal-950 shadow-sm'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <span>{sec}</span>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-teal-700" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pulsante di salvataggio */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={!name.trim()}
                className={`w-full py-4 rounded-2xl font-black text-base sm:text-lg flex items-center justify-center gap-2 shadow-md transition-all ${
                  name.trim()
                    ? 'bg-teal-700 hover:bg-teal-800 text-white cursor-pointer active:scale-[0.99]'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Check className="w-5 h-5" />
                <span>Salva Profilo ed Entra</span>
              </button>
              <p className="text-center text-[11px] text-slate-500 mt-2">
                I tuoi dati rimarranno memorizzati automaticamente per tutte le prossime volte.
              </p>
            </div>

          </form>

        </div>

      </div>
    </div>
  );
};

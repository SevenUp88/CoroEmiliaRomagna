import React, { useState } from 'react';
import { VoiceSection, ChoirMember } from '../types';
import { UserPlus, X, Check, MapPin, Phone, User, CheckCircle2 } from 'lucide-react';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMember: (data: { name: string; section: VoiceSection; city: string; phone?: string }) => void;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  onAddMember
}) => {
  const [name, setName] = useState('');
  const [section, setSection] = useState<VoiceSection>('Soprano');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddMember({
      name: name.trim().toUpperCase(),
      section,
      city: city.trim() || 'Bologna',
      phone: phone.trim() || undefined
    });

    setName('');
    setCity('');
    setPhone('');
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-teal-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 shrink-0">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-teal-300 uppercase tracking-wider block">
                Gestione Organico Corale
              </span>
              <h3 className="text-base sm:text-lg font-black text-white">
                Aggiungi Nuovo Corista
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Cognome e Nome */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Cognome e Nome <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Es. ROSSI Mario"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Sezione Vocale */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Sezione Vocale <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {sections.map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setSection(sec)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                    section === sec
                      ? 'border-teal-700 bg-teal-50 text-teal-950 ring-2 ring-teal-600/30'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{sec}</span>
                  {section === sec && <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" />}
                </button>
              ))}
            </div>
          </div>

          {/* Città di Residenza */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Città di Residenza
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Es. Bologna, Modena, Parma..."
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:bg-white transition-all"
              />
            </div>
            {/* Quick city pills */}
            <div className="flex flex-wrap gap-1 mt-2">
              {commonCities.slice(0, 7).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCity(c)}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors ${
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

          {/* Telefono / Cellulare (Opzionale) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Telefono / WhatsApp <span className="text-slate-400 font-normal">(opzionale)</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+39 340 1234567"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Pulsanti Azione */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl cursor-pointer"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all ${
                name.trim()
                  ? 'bg-teal-700 hover:bg-teal-800 text-white cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Inserisci nell’Organico</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

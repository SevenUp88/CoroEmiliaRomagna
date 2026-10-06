import React, { useState, useEffect } from 'react';
import { ChoirEvent, EventType } from '../types';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Music,
  Plus,
  Trash2,
  Bell,
  Check,
  AlertTriangle,
  MoveUp,
  MoveDown,
  Sparkles
} from 'lucide-react';

interface EventEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventToEdit: ChoirEvent | null; // null means creating a new event
  onSaveEvent: (
    event: ChoirEvent,
    isNew: boolean,
    notifyChoir: boolean,
    notificationMessage?: string
  ) => void;
  onDeleteEvent?: (eventId: string) => void;
}

const COMMON_REPERTOIRE = [
  'Palmeri: Kyrie (Misa a Buenos Aires)',
  'Palmeri: Gloria (Misa a Buenos Aires)',
  'Palmeri: Credo (Misa a Buenos Aires)',
  'Palmeri: Sanctus (Misa a Buenos Aires)',
  'Palmeri: Benedictus (Misa a Buenos Aires)',
  'Palmeri: Agnus Dei (Misa a Buenos Aires)',
  'Mozart: Ave Verum Corpus K 618',
  'Palestrina: Sicut Cervus',
  'Fauré: Cantique de Jean Racine Op. 11',
  'Verdi: Coro da Nabucco (Va, pensiero)',
  'Monteverdi: Cantate Domino',
  'Riscaldamento vocale congiunto e vocalizzi'
];

const EMILIA_ROMAGNA_CITIES = [
  'Ferrara',
  'Parma',
  'Bologna',
  'Modena',
  'Reggio Emilia',
  'Ravenna',
  'Rimini',
  'Forlì',
  'Cesena',
  'Piacenza'
];

export const EventEditorModal: React.FC<EventEditorModalProps> = ({
  isOpen,
  onClose,
  eventToEdit,
  onSaveEvent,
  onDeleteEvent
}) => {
  const isNew = !eventToEdit;

  // Form State
  const [title, setTitle] = useState('');
  const [type, setType] = useState<EventType>('PROVA');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [city, setCity] = useState('');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [programList, setProgramList] = useState<string[]>([]);
  const [newPieceInput, setNewPieceInput] = useState('');
  const [notes, setNotes] = useState('');
  const [dressCode, setDressCode] = useState('');
  const [notifyChoir, setNotifyChoir] = useState(true);
  const [customNotificationMsg, setCustomNotificationMsg] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Populate form when opened
  useEffect(() => {
    if (eventToEdit) {
      setTitle(eventToEdit.title);
      setType(eventToEdit.type);
      setDate(eventToEdit.date);
      setTime(eventToEdit.time);
      setCity(eventToEdit.city);
      setLocation(eventToEdit.location);
      setAddress(eventToEdit.address || '');
      setProgramList(eventToEdit.program ? [...eventToEdit.program] : []);
      setNotes(eventToEdit.notes || '');
      setDressCode(eventToEdit.dressCode || '');
      setNotifyChoir(false);
      setCustomNotificationMsg('');
    } else {
      // Defaults for brand new event
      setTitle("Prove d'insieme");
      setType('PROVA');
      setDate('2026-10-18');
      setTime('10:00 - 17:30');
      setCity('Bologna');
      setLocation('Complesso di Santa Cristina');
      setAddress('Piazzetta Morandi 2, Bologna');
      setProgramList([
        'Palmeri: Misa a Buenos Aires (ripasso generale)',
        'Mozart: Ave Verum Corpus K 618'
      ]);
      setNotes('Pausa pranzo ore 13:00 - 14:30. Portare partiture e matita 2B.');
      setDressCode('Abbigliamento comodo da prova');
      setNotifyChoir(true);
      setCustomNotificationMsg('');
    }
    setShowDeleteConfirm(false);
  }, [eventToEdit, isOpen]);

  if (!isOpen) return null;

  // Add piece to program
  const handleAddPiece = (pieceName: string) => {
    const trimmed = pieceName.trim();
    if (!trimmed) return;
    if (!programList.includes(trimmed)) {
      setProgramList((prev) => [...prev, trimmed]);
    }
    setNewPieceInput('');
  };

  // Remove piece
  const handleRemovePiece = (index: number) => {
    setProgramList((prev) => prev.filter((_, i) => i !== index));
  };

  // Move piece up
  const handleMovePieceUp = (index: number) => {
    if (index === 0) return;
    setProgramList((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  // Move piece down
  const handleMovePieceDown = (index: number) => {
    if (index === programList.length - 1) return;
    setProgramList((prev) => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date.trim() || !city.trim() || !location.trim()) {
      return;
    }

    const eventPayload: ChoirEvent = {
      id: eventToEdit ? eventToEdit.id : `ev-${Date.now()}`,
      title: title.trim(),
      type,
      date,
      time: time.trim() || '10:00 - 17:30',
      city: city.trim(),
      location: location.trim(),
      address: address.trim(),
      program: programList.length > 0 ? programList : ['Studio repertorio corale'],
      notes: notes.trim(),
      dressCode: dressCode.trim() || (type === 'PROVA' ? 'Abbigliamento comodo' : 'Divisa Ufficiale Concerto')
    };

    onSaveEvent(eventPayload, isNew, notifyChoir, customNotificationMsg);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header Modal */}
        <div className="p-5 sm:p-6 border-b border-slate-200 bg-gradient-to-r from-teal-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center shrink-0 text-teal-300">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-teal-300 uppercase tracking-wider block">
                Pannello Direttore · Gestione Calendario
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
                {isNew ? 'Inserisci Nuovo Impegno / Prova' : `Modifica: ${eventToEdit.city}`}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-5">
          
          {/* 1. Tipo Evento e Titolo */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Tipo di Impegno <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'PROVA', label: "Prove d'insieme" },
                  { id: 'CONCERTO', label: 'Concerto' },
                  { id: 'PROVA_E_CONCERTO', label: 'Prove generali' },
                  { id: 'MASTERCLASS', label: 'Masterclass' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setType(item.id as EventType);
                      if (isNew) {
                        if (item.id === 'PROVA') setTitle("Prove d'insieme");
                        else if (item.id === 'PROVA_E_CONCERTO') setTitle('Prove generali');
                      }
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      type === item.id
                        ? 'bg-teal-800 text-white border-teal-900 shadow-xs ring-2 ring-teal-600/30'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Titolo dell’Appuntamento <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="es. Prova d’Insieme o Concerto Straordinario"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-700 focus:outline-none"
              />
            </div>
          </div>

          {/* 2. Data e Orario */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Data dell'Impegno <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-700 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Orario / Ritrovo <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="es. 10:00 - 17:30 oppure 15:30 (Prova) - 21:00"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-700 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 3. Città e Luogo */}
          <div className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Città <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="es. Ferrara, Parma, Bologna"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-700 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Sede / Sala Prove o Chiesa <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="es. Ridotto del Teatro Comunale o Basilica San Petronio"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-700 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Quick city chips */}
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {EMILIA_ROMAGNA_CITIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCity(c)}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                    city.toLowerCase() === c.toLowerCase()
                      ? 'bg-teal-800 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Indirizzo Completo (opzionale per navigatore):
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="es. Corso Martiri della Libertà 5, Ferrara"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-700 focus:outline-none"
              />
            </div>
          </div>

          {/* 4. SCALETTA BRANI E PROGRAMMA MUSICALE (Richiesta specifica dell'utente) */}
          <div className="bg-teal-50/70 border border-teal-200/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Music className="w-5 h-5 text-teal-800" />
                <h3 className="font-bold text-sm text-teal-950 uppercase tracking-wide">
                  Scaletta Brani & Programma della Prova
                </h3>
              </div>
              <span className="text-xs font-semibold text-teal-800 bg-white px-2.5 py-0.5 rounded-full border border-teal-200">
                {programList.length} brani in scaletta
              </span>
            </div>

            <p className="text-xs text-teal-900/80">
              I coristi vedranno esattamente questo elenco in ordine sul loro calendario per preparare gli spartiti.
            </p>

            {/* Program List */}
            {programList.length > 0 ? (
              <div className="space-y-1.5">
                {programList.map((piece, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2 p-2.5 bg-white rounded-xl border border-teal-200 shadow-2xs group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className="w-6 h-6 rounded-lg bg-teal-800 text-white font-black text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {piece}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMovePieceUp(idx)}
                        disabled={idx === 0}
                        title="Sposta prima"
                        className="p-1 text-slate-400 hover:text-teal-800 hover:bg-slate-100 rounded disabled:opacity-30 cursor-pointer"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMovePieceDown(idx)}
                        disabled={idx === programList.length - 1}
                        title="Sposta dopo"
                        className="p-1 text-slate-400 hover:text-teal-800 hover:bg-slate-100 rounded disabled:opacity-30 cursor-pointer"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemovePiece(idx)}
                        title="Rimuovi dalla scaletta"
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 bg-white/70 rounded-xl border border-dashed border-teal-300 text-xs text-teal-800">
                Nessun brano aggiunto alla scaletta. Inseriscine uno qui sotto.
              </div>
            )}

            {/* Input per nuovo brano */}
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={newPieceInput}
                onChange={(e) => setNewPieceInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddPiece(newPieceInput);
                  }
                }}
                placeholder="Digita brano, movimento o nota di studio..."
                className="flex-1 px-3 py-2 bg-white border border-teal-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
              <button
                type="button"
                onClick={() => handleAddPiece(newPieceInput)}
                disabled={!newPieceInput.trim()}
                className="px-3.5 py-2 bg-teal-800 hover:bg-teal-900 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Aggiungi</span>
              </button>
            </div>

            {/* Quick add common repertoire buttons */}
            <div>
              <div className="text-[11px] font-bold text-teal-900 uppercase tracking-wide mb-1">
                Aggiunta rapida da repertorio ufficiale del Coro:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_REPERTOIRE.slice(0, 7).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleAddPiece(item)}
                    className="px-2 py-1 bg-white hover:bg-teal-700 hover:text-white text-teal-900 text-[11px] font-semibold rounded-lg border border-teal-300 transition-colors shadow-2xs cursor-pointer"
                  >
                    + {item.split(':')[1]?.trim() || item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 5. Note del Direttore & Abbigliamento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Indicazioni per i Coristi:
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="es. Pausa pranzo condivisa ore 13. Portare matita 2B. Focus sulle battute veloci del Credo..."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Abbigliamento / Dress Code:
              </label>
              <input
                type="text"
                value={dressCode}
                onChange={(e) => setDressCode(e.target.value)}
                placeholder="es. Abbigliamento comodo da prova oppure Divisa ufficiale da concerto"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-700 focus:outline-none"
              />
            </div>
          </div>

          {/* 6. Notifica Push Coro */}
          <div className="p-3.5 bg-teal-50 rounded-2xl border border-teal-200/90 flex flex-col gap-2">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyChoir}
                onChange={(e) => setNotifyChoir(e.target.checked)}
                className="w-4 h-4 text-teal-700 rounded border-slate-300 focus:ring-teal-600"
              />
              <div className="text-xs font-bold text-teal-950 flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-teal-700" />
                <span>Invia notifica push e avviso in bacheca a tutti i coristi</span>
              </div>
            </label>
            {notifyChoir && (
              <input
                type="text"
                value={customNotificationMsg}
                onChange={(e) => setCustomNotificationMsg(e.target.value)}
                placeholder="Messaggio opzionale (es. 'Inserita nuova prova a Ferrara, confermate presenza!')"
                className="w-full px-3 py-1.5 bg-white border border-teal-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
            )}
          </div>

          {/* Delete Option (if editing) */}
          {!isNew && onDeleteEvent && (
            <div className="pt-2 border-t border-slate-200">
              {!showDeleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-xs text-red-600 hover:text-red-800 font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Elimina questo appuntamento dal calendario</span>
                </button>
              ) : (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between gap-3">
                  <div className="text-xs text-red-800 font-medium">
                    Sei sicuro di voler eliminare questo evento dal calendario?
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-3 py-1 text-xs bg-white text-slate-700 font-semibold rounded-lg border border-slate-200"
                    >
                      Annulla
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteEvent(eventToEdit.id);
                        onClose();
                      }}
                      className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-2xs"
                    >
                      Sì, Elimina
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm hover:shadow flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
            >
              <Check className="w-4 h-4" />
              <span>{isNew ? 'Salva e Inserisci nel Calendario' : 'Salva Modifiche Scaletta'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

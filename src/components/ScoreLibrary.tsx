import React, { useState } from 'react';
import { ScorePiece, VoiceSection } from '../types';
import { OFFICIAL_LINKS } from '../data/initialData';
import { getStoredScores, saveStoredScores } from '../utils/storage';
import {
  FileText,
  Music,
  Search,
  Filter,
  BookOpen,
  FolderOpen,
  ExternalLink,
  Plus,
  Trash2,
  CheckCircle2,
  Eye,
  X,
  Sparkles
} from 'lucide-react';

interface ScoreLibraryProps {
  userSection?: VoiceSection;
  isDirector?: boolean;
  isAdmin?: boolean;
}

export const ScoreLibrary: React.FC<ScoreLibraryProps> = ({
  userSection,
  isDirector = false,
  isAdmin = false
}) => {
  const [scores, setScores] = useState<ScorePiece[]>(() => getStoredScores());
  const [viewTab, setViewTab] = useState<'repertoire' | 'embedded_drive'>('repertoire');
  const [driveEmbedLayout, setDriveEmbedLayout] = useState<'list' | 'grid'>('list');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedVoiceFilter, setSelectedVoiceFilter] = useState<VoiceSection | 'ALL'>('ALL');

  // Online Score Viewer Modal state
  const [viewingOnlineScore, setViewingOnlineScore] = useState<ScorePiece | null>(null);

  // Modal to add a new score
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newComposer, setNewComposer] = useState('');
  const [newDriveUrl, setNewDriveUrl] = useState('');
  const [newKey, setNewKey] = useState('');
  const [newCategory, setNewCategory] = useState('Sacro e Polifonia');
  const [newNotes, setNewNotes] = useState('');
  const [newSections, setNewSections] = useState<VoiceSection[]>([
    'Soprano',
    'Contralto',
    'Tenore',
    'Basso'
  ]);
  const [formError, setFormError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Sync state with storage
  const updateScores = (newScores: ScorePiece[]) => {
    setScores(newScores);
    saveStoredScores(newScores);
  };

  const getScorePreviewUrl = (piece: ScorePiece): string => {
    if (piece.previewUrl) return piece.previewUrl;
    const url = piece.driveUrl || piece.pdfUrl;
    // If it's a file link like .../file/d/ID/...
    const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileMatch && fileMatch[1]) {
      return `https://drive.google.com/file/d/${fileMatch[1]}/preview`;
    }
    // If it's a folder link like .../folders/ID...
    const folderMatch = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
    if (folderMatch && folderMatch[1]) {
      return `https://drive.google.com/embeddedfolderview?id=${folderMatch[1]}`;
    }
    return url;
  };

  const handleOpenAddModal = () => {
    setNewTitle('');
    setNewComposer('');
    setNewDriveUrl(OFFICIAL_LINKS.GOOGLE_DRIVE_SCORES);
    setNewKey('');
    setNewCategory('Sacro e Polifonia');
    setNewNotes('');
    setNewSections(['Soprano', 'Contralto', 'Tenore', 'Basso']);
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleSaveScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setFormError('Inserisci il titolo del brano');
      return;
    }
    if (!newComposer.trim()) {
      setFormError('Inserisci il compositore o autore');
      return;
    }

    const driveLink = newDriveUrl.trim() || OFFICIAL_LINKS.GOOGLE_DRIVE_SCORES;
    let preview: string | undefined = undefined;
    const fileMatch = driveLink.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileMatch && fileMatch[1]) {
      preview = `https://drive.google.com/file/d/${fileMatch[1]}/preview`;
    }

    const newScore: ScorePiece = {
      id: `score-${Date.now()}`,
      title: newTitle.trim(),
      composer: newComposer.trim(),
      driveUrl: driveLink,
      pdfUrl: driveLink,
      previewUrl: preview,
      key: newKey.trim() || undefined,
      repertoireCategory: newCategory.trim() || 'Generale',
      rehearsalNotes: newNotes.trim() || undefined,
      sectionsAvailable: newSections.length > 0 ? newSections : ['TUTTI']
    };

    const updated = [newScore, ...scores];
    updateScores(updated);
    setIsAddModalOpen(false);
    setSuccessToast(`Spartito "${newScore.title}" aggiunto con successo!`);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleDeleteScore = (id: string, title: string) => {
    if (window.confirm(`Sei sicuro di voler rimuovere lo spartito "${title}" dall'elenco?`)) {
      const updated = scores.filter((s) => s.id !== id);
      updateScores(updated);
      setSuccessToast(`Spartito rimosso.`);
      setTimeout(() => setSuccessToast(null), 2500);
    }
  };

  const toggleSection = (sec: VoiceSection) => {
    if (newSections.includes(sec)) {
      setNewSections(newSections.filter((s) => s !== sec));
    } else {
      setNewSections([...newSections, sec]);
    }
  };

  // Extract unique categories from scores
  const availableCategories = Array.from(
    new Set(scores.map((s) => s.repertoireCategory).filter(Boolean))
  );

  const filteredScores = scores.filter((piece) => {
    const matchesSearch =
      piece.title.toLowerCase().includes(search.toLowerCase()) ||
      piece.composer.toLowerCase().includes(search.toLowerCase()) ||
      (piece.key && piece.key.toLowerCase().includes(search.toLowerCase()));

    const matchesCat =
      selectedCategory === 'ALL' ||
      piece.repertoireCategory === selectedCategory;

    const matchesVoice =
      selectedVoiceFilter === 'ALL' ||
      piece.sectionsAvailable.includes(selectedVoiceFilter) ||
      piece.sectionsAvailable.includes('TUTTI');

    return matchesSearch && matchesCat && matchesVoice;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notifica */}
      {successToast && (
        <div className="fixed bottom-20 right-4 z-50 bg-teal-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-teal-700 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header Banner Spartiti (Pulito ed Essenziale) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-teal-50 text-teal-800 rounded-lg">
              <BookOpen className="w-5 h-5 text-teal-700" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
              Archivio Musicale Google Drive
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Spartiti & Parti Vocali
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Aggiungi Spartito</span>
          </button>

          <a
            href={OFFICIAL_LINKS.GOOGLE_DRIVE_SCORES}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-teal-50 hover:bg-teal-100 text-teal-950 font-bold text-xs sm:text-sm rounded-xl border border-teal-200 transition-colors flex items-center gap-2 shadow-2xs"
            title="Apri la cartella Google Drive con tutti gli spartiti originali"
          >
            <FolderOpen className="w-4 h-4 text-teal-700" />
            <span>Apri Drive Esterno</span>
            <ExternalLink className="w-3.5 h-3.5 text-teal-600" />
          </a>
        </div>
      </div>

      {/* Switch Modalità: Brani in Repertorio o Google Drive Live */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl w-full sm:w-auto">
          <button
            onClick={() => setViewTab('repertoire')}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              viewTab === 'repertoire'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Music className="w-4 h-4 text-teal-700" />
            <span>Brani in Repertorio ({scores.length})</span>
          </button>

          <button
            onClick={() => setViewTab('embedded_drive')}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              viewTab === 'embedded_drive'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FolderOpen className="w-4 h-4 text-teal-700" />
            <span>Sfoglia Cartella Google Drive Live</span>
          </button>
        </div>

        {viewTab === 'repertoire' && (
          <div className="text-xs text-slate-500 hidden sm:block">
            Cartella Google Drive <strong>«2026»</strong>
          </div>
        )}
      </div>

      {/* VISTA 1: SCHEDE BRANI IN REPERTORIO */}
      {viewTab === 'repertoire' && (
        <div className="space-y-4">
          {/* Toolbar Ricerca & Filtri */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cerca per titolo brano (Mozart, Palmeri, Vivaldi...) o tonalità..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-xs font-semibold text-slate-600 shrink-0">Filtra voce:</span>
                <select
                  value={selectedVoiceFilter}
                  onChange={(e) => setSelectedVoiceFilter(e.target.value as VoiceSection | 'ALL')}
                  className="text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700"
                >
                  <option value="ALL">Tutte le voci</option>
                  <option value="Soprano">Solo Soprano</option>
                  <option value="Contralto">Solo Contralto</option>
                  <option value="Tenore">Solo Tenore</option>
                  <option value="Baritono">Solo Baritono</option>
                  <option value="Basso">Solo Basso</option>
                </select>
              </div>
            </div>

            {/* Chips Categorie */}
            {availableCategories.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setSelectedCategory('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === 'ALL'
                      ? 'bg-teal-800 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Tutti ({scores.length})
                </button>
                {availableCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat as string)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      selectedCategory === cat
                        ? 'bg-teal-800 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Griglia Brani con tasto "Visualizza" Online e "Drive" */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredScores.map((piece) => {
              const url = piece.driveUrl || piece.pdfUrl || OFFICIAL_LINKS.GOOGLE_DRIVE_SCORES;
              return (
                <div
                  key={piece.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200">
                        {piece.repertoireCategory || 'Repertorio'}
                      </span>
                      {piece.key && (
                        <span className="text-xs text-slate-500 font-mono">
                          {piece.key}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-900 leading-snug">
                        {piece.title}
                      </h3>
                      <p className="text-xs font-semibold text-slate-600 mt-0.5">
                        {piece.composer}
                      </p>
                    </div>

                    {piece.rehearsalNotes && (
                      <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 border border-slate-100 leading-relaxed">
                        <strong className="text-slate-900">Note: </strong>
                        {piece.rehearsalNotes}
                      </div>
                    )}

                    {/* Parti vocali */}
                    {piece.sectionsAvailable && piece.sectionsAvailable.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-xs text-slate-400">Parti:</span>
                        {piece.sectionsAvailable.map((sec) => (
                          <span
                            key={sec}
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                              userSection === sec
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {sec}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Azioni: Visualizza Online + Apri Cartella Drive */}
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {/* TASTO VISUALIZZA ONLINE */}
                      <button
                        onClick={() => setViewingOnlineScore(piece)}
                        className="px-4 py-2.5 bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="Visualizza lo spartito online direttamente qui nell'app"
                      >
                        <Eye className="w-4 h-4 text-teal-200" />
                        <span>Visualizza</span>
                      </button>

                      {/* Tasto Drive Esterno */}
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5"
                        title="Apri file o cartella su Google Drive"
                      >
                        <FolderOpen className="w-3.5 h-3.5 text-slate-600" />
                        <span>Drive</span>
                        <ExternalLink className="w-3 h-3 text-slate-500" />
                      </a>
                    </div>

                    {(isDirector || isAdmin) && (
                      <button
                        onClick={() => handleDeleteScore(piece.id, piece.title)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="Rimuovi questo brano"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VISTA 2: GOOGLE DRIVE EMBEDDED VIEWER INTERATTIVO */}
      {viewTab === 'embedded_drive' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs space-y-3 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center shrink-0">
                <FolderOpen className="w-5 h-5 text-teal-700" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  Cartella Google Drive «2026»
                </h3>
                <p className="text-xs text-slate-500">
                  Esplora direttamente le cartelle e i PDF delle opere
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-700">
                <button
                  onClick={() => setDriveEmbedLayout('list')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    driveEmbedLayout === 'list'
                      ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Elenco
                </button>
                <button
                  onClick={() => setDriveEmbedLayout('grid')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    driveEmbedLayout === 'grid'
                      ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Griglia
                </button>
              </div>

              <a
                href={OFFICIAL_LINKS.GOOGLE_DRIVE_SCORES}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-900 font-bold text-xs rounded-xl border border-teal-200 transition-colors flex items-center gap-1.5"
              >
                <span>Apri in nuova scheda</span>
                <ExternalLink className="w-3.5 h-3.5 text-teal-700" />
              </a>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
            <iframe
              src={`https://drive.google.com/embeddedfolderview?id=1pJQV_UI_aHuMm-0x_dSBGvghHLtANqg5#${driveEmbedLayout}`}
              className="w-full h-[650px] border-0 bg-white"
              title="Google Drive Spartiti CRER 2026"
            />
          </div>
        </div>
      )}

      {/* MODAL DI VISUALIZZAZIONE ONLINE DELLO SPARTITO */}
      {viewingOnlineScore && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in"
        >
          <div className="bg-slate-900 rounded-3xl shadow-2xl max-w-5xl w-full h-[92vh] flex flex-col overflow-hidden border border-slate-700 text-white">
            {/* Top Toolbar Viewer */}
            <div className="p-3 sm:p-4 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-950 shrink-0">
              <div className="truncate">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-800/60">
                    Leggìo Online CRER
                  </span>
                  {viewingOnlineScore.key && (
                    <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                      {viewingOnlineScore.key}
                    </span>
                  )}
                </div>
                <h3 className="font-extrabold text-sm sm:text-base text-white truncate mt-0.5">
                  {viewingOnlineScore.title}
                </h3>
                <p className="text-xs text-slate-400 truncate">
                  {viewingOnlineScore.composer}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={viewingOnlineScore.driveUrl || viewingOnlineScore.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-teal-300 font-bold text-xs rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
                  title="Apri la cartella o file su Google Drive"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-teal-400" />
                  <span className="hidden sm:inline">Apri su Drive</span>
                  <ExternalLink className="w-3.5 h-3.5 text-teal-400" />
                </a>

                <button
                  onClick={() => setViewingOnlineScore(null)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer ml-1"
                  aria-label="Chiudi visualizzatore"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Visualizzatore Iframe PDF Online dal vivo */}
            <div className="flex-1 bg-slate-950 relative overflow-hidden">
              <iframe
                src={getScorePreviewUrl(viewingOnlineScore)}
                className="w-full h-full border-0 bg-white"
                title={`Spartito - ${viewingOnlineScore.title}`}
                allow="autoplay"
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL AGGIUNGI NUOVO SPARTITO */}
      {isAddModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in"
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-4 border border-slate-200">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-teal-800 uppercase tracking-wide">
                  Archivio Corale
                </span>
                <h3 className="text-xl font-extrabold text-slate-900">
                  Aggiungi Nuovo Spartito
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveScore} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Titolo del brano: *
                </label>
                <input
                  type="text"
                  required
                  placeholder="es. Gloria da MisaTango oppure Requiem K626"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Compositore / Autore: *
                </label>
                <input
                  type="text"
                  required
                  placeholder="es. Martín Palmeri, W. A. Mozart, Antonio Vivaldi"
                  value={newComposer}
                  onChange={(e) => setNewComposer(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Categoria:
                  </label>
                  <input
                    type="text"
                    placeholder="es. Masterclass Palmeri, Sacro e Polifonia"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tonalità (opzionale):
                  </label>
                  <input
                    type="text"
                    placeholder="es. Re minore, Mi minore"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Link Google Drive o URL PDF:
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/..."
                  value={newDriveUrl}
                  onChange={(e) => setNewDriveUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-700 font-mono text-xs"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Incolla il link alla cartella specifica del brano o al file PDF su Google Drive.
                </p>
              </div>

              {/* Selezione Sezioni Vocali */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Parti Vocali Disponibili:
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['Soprano', 'Contralto', 'Tenore', 'Baritono', 'Basso'] as VoiceSection[]).map(
                    (sec) => {
                      const isSelected = newSections.includes(sec);
                      return (
                        <button
                          key={sec}
                          type="button"
                          onClick={() => toggleSection(sec)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-teal-800 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}
                          {sec}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Note per le prove (opzionale):
                </label>
                <textarea
                  rows={2}
                  placeholder="es. Indicazioni per le sezioni o file di studio Choralia..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  Salva Brano
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

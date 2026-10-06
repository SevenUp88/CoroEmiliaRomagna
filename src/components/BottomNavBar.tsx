import React from 'react';
import { Calendar, BookOpen, FileSpreadsheet, Shield } from 'lucide-react';

interface BottomNavBarProps {
  currentTab: 'calendar' | 'scores' | 'director' | 'matrix' | 'notifications';
  setCurrentTab: (tab: 'calendar' | 'scores' | 'director' | 'matrix' | 'notifications') => void;
  unreadCount?: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentTab,
  setCurrentTab
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg pb-safe">
      <nav aria-label="Navigazione rapida mobile" className="grid grid-cols-4 items-center h-16 px-1">
        <button
          onClick={() => setCurrentTab('calendar')}
          aria-label="Calendario prove e concerti"
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
            currentTab === 'calendar' ? 'text-teal-800 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight truncate max-w-full">Prove</span>
        </button>

        <button
          onClick={() => setCurrentTab('scores')}
          aria-label="Spartiti e basi studio"
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
            currentTab === 'scores' ? 'text-teal-800 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight truncate max-w-full">Spartiti</span>
        </button>

        <button
          onClick={() => setCurrentTab('matrix')}
          aria-label="Foglio presenze stile Excel"
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
            currentTab === 'matrix' ? 'text-teal-800 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <FileSpreadsheet className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight truncate max-w-full">Presenze</span>
        </button>

        <button
          onClick={() => setCurrentTab('director')}
          aria-label="Pannello Direttore"
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
            currentTab === 'director' ? 'text-teal-800 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Shield className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight truncate max-w-full">Direttore</span>
        </button>
      </nav>
    </div>
  );
};


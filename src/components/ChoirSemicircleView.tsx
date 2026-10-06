import React, { useState, useMemo } from 'react';
import { ChoirMember, AttendanceRecord, VoiceSection, AttendanceStatus, ChoirEvent } from '../types';
import {
  Users,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Crown,
  Sparkles,
  MessageCircle,
  Maximize2,
  Minimize2,
  Info,
  X,
  Layers
} from 'lucide-react';

interface ChoirSemicircleViewProps {
  members: ChoirMember[];
  attendance: Record<string, AttendanceRecord>;
  currentEvent: ChoirEvent;
  selectedSection: string;
  onSelectSection: (section: string) => void;
  onUpdateAttendanceRecord?: (eventId: string, memberId: string, status: AttendanceStatus) => void;
}

type DispositionMode = 'standard' | 'satb' | 'front_back';
type FilterFilterMode = 'all' | 'present' | 'absent_maybe';

export interface CategoryInfo {
  id: string;
  label: string;
  shortLabel: string;
  fill: string;
  fillHover: string;
  stroke: string;
  colorText: string;
  badgeBg: string;
  badgeBorder: string;
  startAngle: number;
  endAngle: number;
  labelAngle: number;
  filter: (m: ChoirMember) => boolean;
}

// Helper to compute SVG annular sector (spicchio di corona circolare)
function describeSectorPath(
  cx: number,
  cy: number,
  rIn: number,
  rOut: number,
  startDeg: number,
  endDeg: number
): string {
  const a1 = (startDeg * Math.PI) / 180;
  const a2 = (endDeg * Math.PI) / 180;

  const xIn1 = cx + rIn * Math.cos(a1);
  const yIn1 = cy + rIn * Math.sin(a1);
  const xOut1 = cx + rOut * Math.cos(a1);
  const yOut1 = cy + rOut * Math.sin(a1);

  const xOut2 = cx + rOut * Math.cos(a2);
  const yOut2 = cy + rOut * Math.sin(a2);
  const xIn2 = cx + rIn * Math.cos(a2);
  const yIn2 = cy + rIn * Math.sin(a2);

  const largeArc = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;

  return [
    `M ${xIn1.toFixed(1)} ${yIn1.toFixed(1)}`,
    `L ${xOut1.toFixed(1)} ${yOut1.toFixed(1)}`,
    `A ${rOut} ${rOut} 0 ${largeArc} 1 ${xOut2.toFixed(1)} ${yOut2.toFixed(1)}`,
    `L ${xIn2.toFixed(1)} ${yIn2.toFixed(1)}`,
    `A ${rIn} ${rIn} 0 ${largeArc} 0 ${xIn1.toFixed(1)} ${yIn1.toFixed(1)}`,
    'Z'
  ].join(' ');
}

export const ChoirSemicircleView: React.FC<ChoirSemicircleViewProps> = ({
  members,
  attendance,
  currentEvent,
  selectedSection,
  onSelectSection,
  onUpdateAttendanceRecord
}) => {
  const [dispositionMode, setDispositionMode] = useState<DispositionMode>('standard');
  const [filterMode, setFilterMode] = useState<FilterFilterMode>('all');
  const [inspectingMember, setInspectingMember] = useState<ChoirMember | null>(null);
  const [inspectingCategoryId, setInspectingCategoryId] = useState<string | null>(null);
  const [hoveredMember, setHoveredMember] = useState<ChoirMember | null>(null);
  const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [sectionListFilter, setSectionListFilter] = useState<'ALL' | AttendanceStatus>('ALL');

  // Center coordinate of semicircle
  const cx = 450;
  const cy = 405;
  const rInner = 145;
  const rOuter = 330;

  // 4 Main Unified Categories: Soprani, Contralti, Tenori & Baritoni (same category!), Bassi
  const categories: CategoryInfo[] = useMemo(() => {
    if (dispositionMode === 'standard') {
      return [
        {
          id: 'Soprano',
          label: 'SOPRANI',
          shortLabel: 'Soprani',
          fill: 'rgba(13, 148, 136, 0.22)',
          fillHover: 'rgba(13, 148, 136, 0.40)',
          stroke: '#14b8a6',
          colorText: 'text-teal-400',
          badgeBg: 'bg-teal-500/15',
          badgeBorder: 'border-teal-500/40',
          startAngle: 190,
          endAngle: 242,
          labelAngle: 216,
          filter: (m: ChoirMember) => m.section === 'Soprano'
        },
        {
          id: 'Contralto',
          label: 'CONTRALTI',
          shortLabel: 'Contralti',
          fill: 'rgba(139, 92, 246, 0.22)',
          fillHover: 'rgba(139, 92, 246, 0.40)',
          stroke: '#a855f7',
          colorText: 'text-purple-400',
          badgeBg: 'bg-purple-500/15',
          badgeBorder: 'border-purple-500/40',
          startAngle: 242,
          endAngle: 294,
          labelAngle: 268,
          filter: (m: ChoirMember) => m.section === 'Contralto'
        },
        {
          id: 'Tenori & Baritoni',
          label: 'TENORI & BARITONI',
          shortLabel: 'Tenori & Baritoni',
          fill: 'rgba(245, 158, 11, 0.22)',
          fillHover: 'rgba(245, 158, 11, 0.40)',
          stroke: '#fbbf24',
          colorText: 'text-amber-400',
          badgeBg: 'bg-amber-500/15',
          badgeBorder: 'border-amber-500/40',
          startAngle: 294,
          endAngle: 328,
          labelAngle: 311,
          filter: (m: ChoirMember) => m.section === 'Tenore' || m.section === 'Baritono'
        },
        {
          id: 'Basso',
          label: 'BASSI',
          shortLabel: 'Bassi',
          fill: 'rgba(2, 132, 199, 0.22)',
          fillHover: 'rgba(2, 132, 199, 0.40)',
          stroke: '#38bdf8',
          colorText: 'text-sky-400',
          badgeBg: 'bg-sky-500/15',
          badgeBorder: 'border-sky-500/40',
          startAngle: 328,
          endAngle: 350,
          labelAngle: 339,
          filter: (m: ChoirMember) => m.section === 'Basso'
        }
      ];
    } else if (dispositionMode === 'satb') {
      return [
        {
          id: 'Soprano',
          label: 'SOPRANI',
          shortLabel: 'Soprani',
          fill: 'rgba(13, 148, 136, 0.22)',
          fillHover: 'rgba(13, 148, 136, 0.40)',
          stroke: '#14b8a6',
          colorText: 'text-teal-400',
          badgeBg: 'bg-teal-500/15',
          badgeBorder: 'border-teal-500/40',
          startAngle: 190,
          endAngle: 238,
          labelAngle: 214,
          filter: (m: ChoirMember) => m.section === 'Soprano'
        },
        {
          id: 'Tenori & Baritoni',
          label: 'TENORI & BARITONI',
          shortLabel: 'Tenori & Baritoni',
          fill: 'rgba(245, 158, 11, 0.22)',
          fillHover: 'rgba(245, 158, 11, 0.40)',
          stroke: '#fbbf24',
          colorText: 'text-amber-400',
          badgeBg: 'bg-amber-500/15',
          badgeBorder: 'border-amber-500/40',
          startAngle: 238,
          endAngle: 274,
          labelAngle: 256,
          filter: (m: ChoirMember) => m.section === 'Tenore' || m.section === 'Baritono'
        },
        {
          id: 'Basso',
          label: 'BASSI',
          shortLabel: 'Bassi',
          fill: 'rgba(2, 132, 199, 0.22)',
          fillHover: 'rgba(2, 132, 199, 0.40)',
          stroke: '#38bdf8',
          colorText: 'text-sky-400',
          badgeBg: 'bg-sky-500/15',
          badgeBorder: 'border-sky-500/40',
          startAngle: 274,
          endAngle: 300,
          labelAngle: 287,
          filter: (m: ChoirMember) => m.section === 'Basso'
        },
        {
          id: 'Contralto',
          label: 'CONTRALTI',
          shortLabel: 'Contralti',
          fill: 'rgba(139, 92, 246, 0.22)',
          fillHover: 'rgba(139, 92, 246, 0.40)',
          stroke: '#a855f7',
          colorText: 'text-purple-400',
          badgeBg: 'bg-purple-500/15',
          badgeBorder: 'border-purple-500/40',
          startAngle: 300,
          endAngle: 350,
          labelAngle: 325,
          filter: (m: ChoirMember) => m.section === 'Contralto'
        }
      ];
    } else {
      // Front / Back (Donne Avanti / Uomini Dietro)
      return [
        {
          id: 'Soprano',
          label: 'SOPRANI',
          shortLabel: 'Soprani',
          fill: 'rgba(13, 148, 136, 0.22)',
          fillHover: 'rgba(13, 148, 136, 0.40)',
          stroke: '#14b8a6',
          colorText: 'text-teal-400',
          badgeBg: 'bg-teal-500/15',
          badgeBorder: 'border-teal-500/40',
          startAngle: 190,
          endAngle: 270,
          labelAngle: 230,
          filter: (m: ChoirMember) => m.section === 'Soprano'
        },
        {
          id: 'Contralto',
          label: 'CONTRALTI',
          shortLabel: 'Contralti',
          fill: 'rgba(139, 92, 246, 0.22)',
          fillHover: 'rgba(139, 92, 246, 0.40)',
          stroke: '#a855f7',
          colorText: 'text-purple-400',
          badgeBg: 'bg-purple-500/15',
          badgeBorder: 'border-purple-500/40',
          startAngle: 270,
          endAngle: 350,
          labelAngle: 310,
          filter: (m: ChoirMember) => m.section === 'Contralto'
        },
        {
          id: 'Tenori & Baritoni',
          label: 'TENORI & BARITONI',
          shortLabel: 'Tenori & Baritoni',
          fill: 'rgba(245, 158, 11, 0.22)',
          fillHover: 'rgba(245, 158, 11, 0.40)',
          stroke: '#fbbf24',
          colorText: 'text-amber-400',
          badgeBg: 'bg-amber-500/15',
          badgeBorder: 'border-amber-500/40',
          startAngle: 200,
          endAngle: 290,
          labelAngle: 245,
          filter: (m: ChoirMember) => m.section === 'Tenore' || m.section === 'Baritono'
        },
        {
          id: 'Basso',
          label: 'BASSI',
          shortLabel: 'Bassi',
          fill: 'rgba(2, 132, 199, 0.22)',
          fillHover: 'rgba(2, 132, 199, 0.40)',
          stroke: '#38bdf8',
          colorText: 'text-sky-400',
          badgeBg: 'bg-sky-500/15',
          badgeBorder: 'border-sky-500/40',
          startAngle: 295,
          endAngle: 345,
          labelAngle: 320,
          filter: (m: ChoirMember) => m.section === 'Basso'
        }
      ];
    }
  }, [dispositionMode]);

  // Statistics for the unified categories
  const categoryStats = useMemo(() => {
    return categories.map((cat) => {
      const catMembers = members.filter(cat.filter);
      let yes = 0;
      let no = 0;
      let maybe = 0;
      let pending = 0;

      catMembers.forEach((m) => {
        const rec = attendance[m.id];
        if (!rec || rec.status === 'NON_INDICATO') pending++;
        else if (rec.status === 'SI') yes++;
        else if (rec.status === 'NO') no++;
        else if (rec.status === 'FORSE') maybe++;
      });

      const total = catMembers.length;
      const percentage = total > 0 ? Math.round((yes / total) * 100) : 0;

      return {
        ...cat,
        yes,
        no,
        maybe,
        pending,
        total,
        percentage,
        membersList: catMembers
      };
    });
  }, [categories, members, attendance]);

  // Overall statistics
  const totalStats = useMemo(() => {
    let yes = 0;
    let no = 0;
    let maybe = 0;
    let pending = 0;

    members.forEach((m) => {
      const rec = attendance[m.id];
      if (!rec || rec.status === 'NON_INDICATO') pending++;
      else if (rec.status === 'SI') yes++;
      else if (rec.status === 'NO') no++;
      else if (rec.status === 'FORSE') maybe++;
    });

    const total = members.length;
    const percentage = total > 0 ? Math.round((yes / total) * 100) : 0;

    return { yes, no, maybe, pending, total, percentage };
  }, [members, attendance]);

  // Status colors for singer spots
  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case 'SI':
        return '#10b981';
      case 'NO':
        return '#ef4444';
      case 'FORSE':
        return '#f59e0b';
      case 'NON_INDICATO':
      default:
        return '#64748b';
    }
  };

  interface PlacedSinger {
    member: ChoirMember;
    x: number;
    y: number;
    row: number;
    angleDeg: number;
    status: AttendanceStatus;
    note?: string;
    categoryId: string;
  }

  // Generate coordinates for all choir members
  const placedSingers: PlacedSinger[] = useMemo(() => {
    const list: PlacedSinger[] = [];
    const radii = [180, 225, 270, 315];

    if (dispositionMode === 'standard' || dispositionMode === 'satb') {
      categoryStats.forEach((cat) => {
        const catMembers = cat.membersList;
        const numRows = cat.id === 'Basso' ? 2 : 3;

        // Distribute members evenly across concentric rows
        const rowBuckets: ChoirMember[][] = Array.from({ length: numRows }, () => []);
        catMembers.forEach((m, idx) => {
          rowBuckets[idx % numRows].push(m);
        });

        rowBuckets.forEach((bucket, rowIdx) => {
          const radius = radii[rowIdx];
          const count = bucket.length;
          if (count === 0) return;

          // Padding inside the sector so dots don't touch edges
          const padAngle = 2.5;
          const aStart = cat.startAngle + padAngle;
          const aEnd = cat.endAngle - padAngle;

          bucket.forEach((member, i) => {
            let angle: number;
            if (count === 1) {
              angle = (aStart + aEnd) / 2;
            } else {
              const step = (aEnd - aStart) / (count - 1);
              angle = aStart + step * i;
            }

            const rad = (angle * Math.PI) / 180;
            const x = cx + radius * Math.cos(rad);
            const y = cy + radius * Math.sin(rad);

            const rec = attendance[member.id];
            list.push({
              member,
              x,
              y,
              row: rowIdx + 1,
              angleDeg: angle,
              status: rec?.status || 'NON_INDICATO',
              note: rec?.note,
              categoryId: cat.id
            });
          });
        });
      });
    } else {
      // Front / Back layout
      const soprani = members.filter((m) => m.section === 'Soprano');
      const contralti = members.filter((m) => m.section === 'Contralto');
      const tenoriBaritoni = members.filter((m) => m.section === 'Tenore' || m.section === 'Baritono');
      const bassi = members.filter((m) => m.section === 'Basso');

      const placeWedge = (
        listM: ChoirMember[],
        startA: number,
        endA: number,
        rowIndices: number[],
        catId: string
      ) => {
        const buckets: ChoirMember[][] = Array.from({ length: rowIndices.length }, () => []);
        listM.forEach((m, i) => buckets[i % rowIndices.length].push(m));

        buckets.forEach((bucket, bIdx) => {
          const r = radii[rowIndices[bIdx]];
          const count = bucket.length;
          if (count === 0) return;

          bucket.forEach((member, i) => {
            const step = count > 1 ? (endA - startA) / (count - 1) : 0;
            const angle = count > 1 ? startA + step * i : (startA + endA) / 2;
            const rad = (angle * Math.PI) / 180;
            const x = cx + r * Math.cos(rad);
            const y = cy + r * Math.sin(rad);
            const rec = attendance[member.id];
            list.push({
              member,
              x,
              y,
              row: rowIndices[bIdx] + 1,
              angleDeg: angle,
              status: rec?.status || 'NON_INDICATO',
              note: rec?.note,
              categoryId: catId
            });
          });
        });
      };

      // Front rows: Soprani (192-266) & Contralti (274-348) in rows 0 & 1
      placeWedge(soprani, 194, 266, [0, 1], 'Soprano');
      placeWedge(contralti, 274, 346, [0, 1], 'Contralto');

      // Back rows: Tenori & Baritoni (198-290) & Bassi (296-344) in row 2
      placeWedge(tenoriBaritoni, 200, 288, [2], 'Tenori & Baritoni');
      placeWedge(bassi, 298, 342, [2], 'Basso');
    }

    return list;
  }, [categoryStats, members, attendance, dispositionMode]);

  // Dimming check
  const isSingerDimmed = (singer: PlacedSinger) => {
    if (selectedSection !== 'ALL' && singer.categoryId !== selectedSection) {
      return true;
    }
    if (filterMode === 'present' && singer.status !== 'SI') {
      return true;
    }
    if (filterMode === 'absent_maybe' && singer.status === 'SI') {
      return true;
    }
    return false;
  };

  const handleOpenCategoryInspector = (catId: string) => {
    setInspectingCategoryId(catId);
    setSectionListFilter('ALL');
  };

  const handleToggleAttendance = (memberId: string, nextStatus: AttendanceStatus) => {
    if (onUpdateAttendanceRecord) {
      onUpdateAttendanceRecord(currentEvent.id, memberId, nextStatus);
    }
  };

  return (
    <div className="bg-slate-950 text-white rounded-3xl border border-slate-800 shadow-xl overflow-hidden relative">
      {/* Top Header Bar */}
      <div className="p-4 sm:p-6 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
                <span>Disposizione Corale a Semicerchio</span>
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Pianta scenica e controllo presenze in tempo reale per la prova di{' '}
              <strong className="text-teal-300">{currentEvent.city}</strong> ({currentEvent.date})
            </p>
          </div>

          {/* Quick Summary Pill Counters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{totalStats.yes} Presenti</span>
              <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-200 ml-0.5">
                {totalStats.percentage}%
              </span>
            </div>

            <div className="bg-rose-950/50 border border-rose-500/30 text-rose-300 px-2.5 py-1.5 rounded-xl font-semibold flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>{totalStats.no} Assenti</span>
            </div>

            {totalStats.maybe > 0 && (
              <div className="bg-amber-950/50 border border-amber-500/30 text-amber-300 px-2.5 py-1.5 rounded-xl font-semibold flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>{totalStats.maybe} In dubbio</span>
              </div>
            )}

            {totalStats.pending > 0 && (
              <div className="bg-slate-800/80 border border-slate-700 text-slate-300 px-2.5 py-1.5 rounded-xl font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{totalStats.pending} In attesa</span>
              </div>
            )}
          </div>
        </div>

        {/* View Mode & Filter Controls */}
        <div className="mt-4 pt-3 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Disposition Style Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl">
            <span className="text-[11px] font-bold text-slate-400 px-2 hidden sm:inline flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-teal-400" /> Disposizione:
            </span>
            <button
              onClick={() => setDispositionMode('standard')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                dispositionMode === 'standard'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Classica: Soprani, Contralti, Tenori & Baritoni, Bassi"
            >
              Tradizionale
            </button>
            <button
              onClick={() => setDispositionMode('satb')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                dispositionMode === 'satb'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Quartetto Polifonico: Soprani, Tenori & Baritoni, Bassi, Contralti"
            >
              Quartetto (SATB)
            </button>
            <button
              onClick={() => setDispositionMode('front_back')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                dispositionMode === 'front_back'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Donne in prima fila, Uomini dietro"
            >
              Donne Avanti / Dietro
            </button>
          </div>

          {/* Quick Highlight Filter */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                filterMode === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Tutti
            </button>
            <button
              onClick={() => setFilterMode('present')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                filterMode === 'present'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-emerald-300'
              }`}
            >
              ★ Solo Presenti
            </button>
            <button
              onClick={() => setFilterMode('absent_maybe')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                filterMode === 'absent_maybe'
                  ? 'bg-rose-600 text-white'
                  : 'text-slate-400 hover:text-rose-300'
              }`}
            >
              Assenti / In forse
            </button>
          </div>

          {/* Expand Fullscreen / Toggle button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title={isExpanded ? 'Riduci visualizzazione' : 'Ingrandisci a tutta larghezza'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Interactive Semicircular Canvas Container */}
      <div className={`relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-2 sm:p-4 pt-3 transition-all ${isExpanded ? 'min-h-[580px]' : 'min-h-[440px]'}`}>
        
        {/* Responsive Scalable SVG Semicircle */}
        <div className="w-full flex items-center justify-center overflow-x-auto overflow-y-visible select-none pt-3 pb-2">
          <svg
            viewBox="0 -55 900 500"
            className="w-full max-w-[960px] h-auto drop-shadow-2xl overflow-visible"
            style={{ minWidth: '600px' }}
          >
            <defs>
              {/* Radial glow around focal stage */}
              <radialGradient id="stageGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0f766e" stopOpacity="0.3" />
                <stop offset="70%" stopColor="#0f172a" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
              </radialGradient>

              {/* Stage sound projection cone gradient */}
              <linearGradient id="soundCone" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.06" />
                <stop offset="100%" stopColor="#0f766e" stopOpacity="0" />
              </linearGradient>

              {/* Filter for glowing green dots */}
              <filter id="glowGreen" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Stage Sound Projection Cone */}
            <path
              d={`M ${cx - 50} ${cy} L 100 120 A 370 370 0 0 1 800 120 L ${cx + 50} ${cy} Z`}
              fill="url(#soundCone)"
            />

            {/* ============================================================== */}
            {/* SPICCHI COLORATI DEL SEMICERCHIO (COLORED PIE WEDGES / SECTORS) */}
            {/* ============================================================== */}
            {categoryStats.map((cat) => {
              const sectorPath = describeSectorPath(cx, cy, rInner, rOuter, cat.startAngle, cat.endAngle);
              const isSelected = selectedSection === cat.id;
              const isHovered = hoveredCategoryId === cat.id;

              return (
                <g
                  key={cat.id}
                  className="cursor-pointer transition-all duration-300"
                  onClick={() => handleOpenCategoryInspector(cat.id)}
                  onMouseEnter={() => setHoveredCategoryId(cat.id)}
                  onMouseLeave={() => setHoveredCategoryId(null)}
                >
                  {/* Spicchio Colorato (Wedge Fill) */}
                  <path
                    d={sectorPath}
                    fill={isSelected || isHovered ? cat.fillHover : cat.fill}
                    stroke={cat.stroke}
                    strokeWidth={isSelected ? '2.5' : '1.5'}
                    strokeOpacity={isSelected ? '0.9' : '0.5'}
                    className="transition-colors duration-200"
                  />
                </g>
              );
            })}

            {/* Radial Boundary Lines Between Spicchi */}
            {categoryStats.map((cat, idx) => {
              if (idx === 0) return null;
              const rad = (cat.startAngle * Math.PI) / 180;
              const x1 = cx + rInner * Math.cos(rad);
              const y1 = cy + rInner * Math.sin(rad);
              const x2 = cx + (rOuter + 8) * Math.cos(rad);
              const y2 = cy + (rOuter + 8) * Math.sin(rad);

              return (
                <line
                  key={`line-${idx}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#475569"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                  opacity="0.75"
                />
              );
            })}

            {/* Concentric Semicircular Tier Guidelines (Gradonate corali) */}
            {[180, 225, 270, 315].map((r, idx) => (
              <g key={r}>
                <path
                  d={`M ${cx - r * Math.cos((12 * Math.PI) / 180)} ${cy - r * Math.sin((12 * Math.PI) / 180)} A ${r} ${r} 0 0 1 ${cx + r * Math.cos((12 * Math.PI) / 180)} ${cy - r * Math.sin((12 * Math.PI) / 180)}`}
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="1.2"
                  strokeDasharray="4 4"
                  opacity="0.3"
                />
                <text
                  x={cx - r * Math.cos((12 * Math.PI) / 180) - 16}
                  y={cy - r * Math.sin((12 * Math.PI) / 180) + 4}
                  fill="#64748b"
                  fontSize="9"
                  fontWeight="bold"
                  textAnchor="end"
                >
                  Fila {idx + 1}
                </text>
              </g>
            ))}

            {/* Outer Arc Section Badges (Labels for each Spicchio) */}
            {categoryStats.map((cat) => {
              const rad = (cat.labelAngle * Math.PI) / 180;
              const labelRadius = rOuter + 28;
              const lx = cx + labelRadius * Math.cos(rad);
              const ly = cy + labelRadius * Math.sin(rad);
              const isSelected = selectedSection === cat.id;
              const isHovered = hoveredCategoryId === cat.id;

              return (
                <g
                  key={`label-${cat.id}`}
                  className="cursor-pointer transition-transform hover:scale-105"
                  onClick={() => handleOpenCategoryInspector(cat.id)}
                  onMouseEnter={() => setHoveredCategoryId(cat.id)}
                  onMouseLeave={() => setHoveredCategoryId(null)}
                >
                  {/* Background pill */}
                  <rect
                    x={lx - 74}
                    y={ly - 22}
                    width="148"
                    height="44"
                    rx="14"
                    fill={isSelected || isHovered ? '#0f766e' : '#0f172a'}
                    stroke={isSelected || isHovered ? '#2dd4bf' : cat.stroke}
                    strokeWidth={isSelected ? '2.5' : '1.5'}
                    opacity="0.98"
                    className="shadow-xl"
                  />
                  {/* Category Title */}
                  <text
                    x={lx}
                    y={ly - 4}
                    fill="#ffffff"
                    fontSize="12"
                    fontWeight="900"
                    textAnchor="middle"
                    letterSpacing="0.06em"
                  >
                    {cat.label}
                  </text>
                  {/* Presence counter & percentage */}
                  <text
                    x={lx}
                    y={ly + 12}
                    fill={cat.percentage >= 75 ? '#34d399' : '#fbbf24'}
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {cat.yes}/{cat.total} ({cat.percentage}%)
                  </text>
                </g>
              );
            })}

            {/* Singer Nodes (The Dots in the Semicircle) */}
            {placedSingers.map((singer) => {
              const isDimmed = isSingerDimmed(singer);
              const isHovered = hoveredMember?.id === singer.member.id;
              const isInspected = inspectingMember?.id === singer.member.id;
              const statusColor = getStatusColor(singer.status);
              const isSectionLeader = singer.member.isSectionLeader;

              return (
                <g
                  key={singer.member.id}
                  className="cursor-pointer group"
                  onClick={() => setInspectingMember(singer.member)}
                  onMouseEnter={() => setHoveredMember(singer.member)}
                  onMouseLeave={() => setHoveredMember(null)}
                >
                  {/* Large invisible hit area for touch targets on mobile */}
                  <circle
                    cx={singer.x}
                    cy={singer.y}
                    r="15"
                    fill="transparent"
                  />

                  {/* Halo ring for selected or hovered member */}
                  {(isHovered || isInspected) && (
                    <circle
                      cx={singer.x}
                      cy={singer.y}
                      r="14"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2"
                      className="animate-pulse"
                    />
                  )}

                  {/* Caposezione Golden Ring */}
                  {isSectionLeader && (
                    <circle
                      cx={singer.x}
                      cy={singer.y}
                      r="10.5"
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="1.5"
                      strokeDasharray="2 2"
                    />
                  )}

                  {/* Main Singer Spot */}
                  <circle
                    cx={singer.x}
                    cy={singer.y}
                    r={isHovered || isInspected ? 9 : 7.5}
                    fill={statusColor}
                    stroke="#0f172a"
                    strokeWidth="2"
                    opacity={isDimmed ? 0.2 : 1}
                    filter={singer.status === 'SI' && !isDimmed ? 'url(#glowGreen)' : undefined}
                    className="transition-all duration-200"
                  />

                  {/* Status icon glyph inside dot */}
                  {!isDimmed && (
                    <text
                      x={singer.x}
                      y={singer.y + 3}
                      fill="#ffffff"
                      fontSize="7"
                      fontWeight="900"
                      textAnchor="middle"
                      pointerEvents="none"
                    >
                      {singer.status === 'SI' ? '✓' : singer.status === 'NO' ? '✕' : singer.status === 'FORSE' ? '?' : '•'}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Minimalist Central Stage Base (NO TEXT "PODIO M DANIELE DIREZIONE" as requested) */}
            <g
              transform={`translate(${cx}, ${cy})`}
              className="cursor-pointer"
              onClick={() => onSelectSection('ALL')}
            >
              {/* Subtle Stage Halo */}
              <circle cx="0" cy="0" r="32" fill="url(#stageGlow)" />
              {/* Sleek stage platform marker without any text */}
              <circle cx="0" cy="0" r="14" fill="#0f172a" stroke="#0d9488" strokeWidth="2" opacity="0.8" />
              <circle cx="0" cy="0" r="6" fill="#14b8a6" />
            </g>
          </svg>
        </div>

        {/* Live Hover Tooltip */}
        {hoveredMember && (
          <div className="absolute top-4 left-4 bg-slate-900/95 border border-slate-700 text-white rounded-2xl p-3 shadow-2xl backdrop-blur-md pointer-events-none z-20 flex items-center gap-3 animate-in fade-in">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow-xs"
              style={{
                backgroundColor: getStatusColor(attendance[hoveredMember.id]?.status || 'NON_INDICATO')
              }}
            >
              {attendance[hoveredMember.id]?.status === 'SI'
                ? 'SI'
                : attendance[hoveredMember.id]?.status === 'NO'
                ? 'NO'
                : attendance[hoveredMember.id]?.status === 'FORSE'
                ? '?'
                : '—'}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-white">{hoveredMember.name}</span>
                {hoveredMember.isSectionLeader && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded font-bold">
                    Caposezione
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span className="font-semibold text-teal-400">{hoveredMember.section}</span>
                <span>·</span>
                <span>{hoveredMember.city || 'Emilia-Romagna'}</span>
              </div>
              {attendance[hoveredMember.id]?.note && (
                <div className="text-[11px] text-amber-300 italic mt-1 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                  "{attendance[hoveredMember.id]?.note}"
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom Legend & Quick Tip */}
        <div className="mt-3 pt-3 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 px-2">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Legenda:
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shadow-xs" />
              <span className="text-slate-300 font-medium">Presente</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
              <span className="text-slate-300 font-medium">Assente</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
              <span className="text-slate-300 font-medium">In forse</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-slate-500 inline-block" />
              <span className="text-slate-300 font-medium">In attesa</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full border-2 border-amber-400 inline-block" />
              <span className="text-amber-300 font-medium">Caposezione</span>
            </div>
          </div>

          <div className="text-[11px] text-teal-400/90 flex items-center gap-1.5 italic">
            <Info className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            <span>Clicca su qualsiasi spicchio o corista per visionare i nomi dei presenti</span>
          </div>
        </div>
      </div>

      {/* MODAL 1: DETTAGLIO SPICCHIO / CATEGORIA (Apre cliccando sullo spicchio o etichetta) */}
      {inspectingCategoryId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            {(() => {
              const cat = categoryStats.find((s) => s.id === inspectingCategoryId);
              if (!cat) return null;
              const catMembers = cat.membersList;

              const filteredMembers = catMembers.filter((m) => {
                if (sectionListFilter === 'ALL') return true;
                const rec = attendance[m.id];
                const status = rec?.status || 'NON_INDICATO';
                return status === sectionListFilter;
              });

              return (
                <>
                  <div className="p-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg text-white shadow-md border"
                        style={{ backgroundColor: cat.fill, borderColor: cat.stroke }}
                      >
                        {cat.label.slice(0, 3)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xl font-black text-white">
                            {cat.shortLabel}
                          </h4>
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-teal-300 font-bold border border-slate-700">
                            {cat.yes}/{cat.total} Presenti ({cat.percentage}%)
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {currentEvent.title} · {currentEvent.city} ({currentEvent.date})
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setInspectingCategoryId(null)}
                      className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Filter Sub-nav inside Section Modal */}
                  <div className="px-5 py-3 border-b border-slate-800/80 bg-slate-900 flex flex-wrap items-center gap-1.5 text-xs">
                    <button
                      onClick={() => setSectionListFilter('ALL')}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                        sectionListFilter === 'ALL'
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Tutti ({catMembers.length})
                    </button>
                    <button
                      onClick={() => setSectionListFilter('SI')}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-colors flex items-center gap-1 ${
                        sectionListFilter === 'SI'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-emerald-300'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Presenti ({cat.yes})
                    </button>
                    <button
                      onClick={() => setSectionListFilter('FORSE')}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-colors flex items-center gap-1 ${
                        sectionListFilter === 'FORSE'
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-amber-300'
                      }`}
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      In dubbio ({cat.maybe})
                    </button>
                    <button
                      onClick={() => setSectionListFilter('NO')}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-colors flex items-center gap-1 ${
                        sectionListFilter === 'NO'
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-rose-300'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Assenti ({cat.no})
                    </button>
                    {cat.pending > 0 && (
                      <button
                        onClick={() => setSectionListFilter('NON_INDICATO')}
                        className={`px-3 py-1.5 rounded-xl font-bold transition-colors flex items-center gap-1 ${
                          sectionListFilter === 'NON_INDICATO'
                            ? 'bg-slate-700 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        In attesa ({cat.pending})
                      </button>
                    )}
                  </div>

                  {/* List of Members */}
                  <div className="flex-1 overflow-y-auto p-5 divide-y divide-slate-800/60 space-y-2">
                    {filteredMembers.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 text-sm italic">
                        Nessun corista in questa categoria.
                      </div>
                    ) : (
                      filteredMembers.map((member) => {
                        const rec = attendance[member.id];
                        const status = rec?.status || 'NON_INDICATO';
                        const note = rec?.note;

                        return (
                          <div
                            key={member.id}
                            className="pt-3 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/30 px-3 rounded-2xl transition-colors"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-sm">
                                  {member.name}
                                </span>
                                <span className="text-[10px] bg-slate-800 text-teal-300 border border-slate-700 px-1.5 py-0.5 rounded font-semibold">
                                  {member.section}
                                </span>
                                {member.isSectionLeader && (
                                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                    <Crown className="w-3 h-3 text-amber-400" />
                                    Caposezione
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-400 flex items-center gap-2">
                                <span>{member.city || 'Emilia-Romagna'}</span>
                                {note && (
                                  <span className="text-amber-300 bg-amber-950/40 border border-amber-800/30 px-2 py-0.5 rounded text-[11px] italic">
                                    "{note}"
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Attendance Controls */}
                            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                              {/* Direct Contact Buttons if available */}
                              {member.phone && (
                                <a
                                  href={`https://wa.me/${member.phone.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-xl bg-emerald-950 border border-emerald-700/60 text-emerald-400 hover:bg-emerald-900 transition-colors"
                                  title={`Apri chat WhatsApp con ${member.name}`}
                                >
                                  <MessageCircle className="w-4 h-4" />
                                </a>
                              )}

                              {/* Presence Status Badges / Toggles */}
                              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                                <button
                                  onClick={() => handleToggleAttendance(member.id, 'SI')}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                    status === 'SI'
                                      ? 'bg-emerald-600 text-white shadow-xs'
                                      : 'text-slate-500 hover:text-emerald-400'
                                  }`}
                                  title="Segna presente"
                                >
                                  SI
                                </button>
                                <button
                                  onClick={() => handleToggleAttendance(member.id, 'FORSE')}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                    status === 'FORSE'
                                      ? 'bg-amber-600 text-white shadow-xs'
                                      : 'text-slate-500 hover:text-amber-400'
                                  }`}
                                  title="Segna in forse"
                                >
                                  FORSE
                                </button>
                                <button
                                  onClick={() => handleToggleAttendance(member.id, 'NO')}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                    status === 'NO'
                                      ? 'bg-rose-600 text-white shadow-xs'
                                      : 'text-slate-500 hover:text-rose-400'
                                  }`}
                                  title="Segna assente"
                                >
                                  NO
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* MODAL 2: DETTAGLIO SINGOLO CORISTA (Apre cliccando sul pallino nel semicerchio) */}
      {inspectingMember && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white text-lg shadow-md"
                  style={{
                    backgroundColor: getStatusColor(attendance[inspectingMember.id]?.status || 'NON_INDICATO')
                  }}
                >
                  {inspectingMember.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-lg font-black text-white">{inspectingMember.name}</h4>
                    {inspectingMember.isSectionLeader && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold">
                        Caposezione
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                    <span className="font-bold text-teal-400">{inspectingMember.section}</span>
                    <span>·</span>
                    <span>{inspectingMember.city || 'Emilia-Romagna'}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setInspectingMember(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Note if any */}
            {attendance[inspectingMember.id]?.note && (
              <div className="mb-4 p-3 bg-amber-950/40 border border-amber-800/40 rounded-xl text-xs text-amber-200">
                <strong className="text-amber-400 font-bold block mb-0.5">Nota del Corista:</strong>
                "{attendance[inspectingMember.id]?.note}"
              </div>
            )}

            {/* Presence Status Quick Switcher for Director */}
            <div className="mb-5">
              <label className="text-xs font-semibold text-slate-400 block mb-2 uppercase tracking-wider">
                Stato Presenza Prova:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleToggleAttendance(inspectingMember.id, 'SI')}
                  className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    (attendance[inspectingMember.id]?.status || 'NON_INDICATO') === 'SI'
                      ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Presente
                </button>
                <button
                  onClick={() => handleToggleAttendance(inspectingMember.id, 'FORSE')}
                  className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    (attendance[inspectingMember.id]?.status || 'NON_INDICATO') === 'FORSE'
                      ? 'bg-amber-600 text-white shadow-md ring-2 ring-amber-400'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <HelpCircle className="w-4 h-4" />
                  In forse
                </button>
                <button
                  onClick={() => handleToggleAttendance(inspectingMember.id, 'NO')}
                  className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    (attendance[inspectingMember.id]?.status || 'NON_INDICATO') === 'NO'
                      ? 'bg-rose-600 text-white shadow-md ring-2 ring-rose-400'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <XCircle className="w-4 h-4" />
                  Assente
                </button>
              </div>
            </div>

            {/* Actions: Contact and Open Section */}
            <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => {
                  const cat = categoryStats.find((c) => c.filter(inspectingMember));
                  if (cat) setInspectingCategoryId(cat.id);
                  setInspectingMember(null);
                }}
                className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl transition-colors text-center cursor-pointer"
              >
                Vedi tutti ({inspectingMember.section === 'Tenore' || inspectingMember.section === 'Baritono' ? 'Tenori & Baritoni' : inspectingMember.section})
              </button>

              {inspectingMember.phone && (
                <a
                  href={`https://wa.me/${inspectingMember.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

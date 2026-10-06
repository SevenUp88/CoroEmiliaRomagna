import React, { useState, useMemo } from 'react';
import { ChoirMember, AttendanceRecord, VoiceSection, ChoirEvent, AttendanceStatus } from '../types';
import {
  Users,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Sparkles,
  Music,
  MapPin,
  MessageCircle,
  Shield,
  Eye,
  Filter
} from 'lucide-react';

interface ChoirHemicycleViewProps {
  currentEvent: ChoirEvent;
  members: ChoirMember[];
  attendance: Record<string, Record<string, AttendanceRecord>>;
  onUpdateAttendance?: (eventId: string, memberId: string, status: AttendanceStatus) => void;
  selectedSectionFilter?: VoiceSection | 'ALL';
  onSelectSectionFilter?: (section: VoiceSection | 'ALL') => void;
}

// Section styling matching the choral hemicycle photo
export const SECTION_CONFIG: Record<
  VoiceSection,
  {
    label: string;
    singular: string;
    startAngle: number;
    endAngle: number;
    color: string;
    bgFill: string;
    borderColor: string;
    badgeBg: string;
    badgeText: string;
  }
> = {
  Soprano: {
    label: 'Soprani',
    singular: 'Soprano',
    startAngle: 174,
    endAngle: 114,
    color: '#e11d48', // Vibrant Rose/Pink as in photo
    bgFill: 'rgba(244, 63, 94, 0.05)',
    borderColor: 'rgba(244, 63, 94, 0.3)',
    badgeBg: 'bg-rose-50 border-rose-200',
    badgeText: 'text-rose-700'
  },
  Contralto: {
    label: 'Contralti',
    singular: 'Contralto',
    startAngle: 110,
    endAngle: 58,
    color: '#d97706', // Vibrant Gold/Yellow as in photo
    bgFill: 'rgba(245, 158, 11, 0.05)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    badgeBg: 'bg-amber-50 border-amber-200',
    badgeText: 'text-amber-800'
  },
  Tenore: {
    label: 'Tenori',
    singular: 'Tenore',
    startAngle: 54,
    endAngle: 38,
    color: '#059669', // Vibrant Green as in photo
    bgFill: 'rgba(16, 185, 129, 0.05)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    badgeBg: 'bg-emerald-50 border-emerald-200',
    badgeText: 'text-emerald-800'
  },
  Baritono: {
    label: 'Baritoni',
    singular: 'Baritono',
    startAngle: 34,
    endAngle: 20,
    color: '#0284c7', // Vibrant Sky/Cyan as in photo
    bgFill: 'rgba(14, 165, 233, 0.05)',
    borderColor: 'rgba(14, 165, 233, 0.3)',
    badgeBg: 'bg-sky-50 border-sky-200',
    badgeText: 'text-sky-800'
  },
  Basso: {
    label: 'Bassi',
    singular: 'Basso',
    startAngle: 16,
    endAngle: 4,
    color: '#3b82f6', // Vibrant Royal Blue as in photo
    bgFill: 'rgba(59, 130, 246, 0.05)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
    badgeBg: 'bg-blue-50 border-blue-200',
    badgeText: 'text-blue-800'
  }
};

const SECTIONS_ORDER: VoiceSection[] = ['Soprano', 'Contralto', 'Tenore', 'Baritono', 'Basso'];

interface SeatData {
  member: ChoirMember;
  section: VoiceSection;
  x: number;
  y: number;
  radius: number;
  angleDeg: number;
  status: AttendanceStatus;
  note?: string;
  isSectionLeader?: boolean;
}

export const ChoirHemicycleView: React.FC<ChoirHemicycleViewProps> = ({
  currentEvent,
  members,
  attendance,
  onUpdateAttendance,
  selectedSectionFilter = 'ALL',
  onSelectSectionFilter
}) => {
  const [selectedMember, setSelectedMember] = useState<ChoirMember | null>(null);
  const [hoveredMember, setHoveredMember] = useState<SeatData | null>(null);
  const [colorMode, setColorMode] = useState<'section' | 'status'>('section');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SI' | 'NO' | 'FORSE' | 'NON_INDICATO'>('ALL');

  // SVG dimensions & center coordinates
  const svgWidth = 860;
  const svgHeight = 490;
  const cx = 430;
  const cy = 410;
  const rMin = 140;
  const rMax = 320;

  const eventAttendance = attendance[currentEvent.id] || {};

  // Compute section statistics
  const stats = useMemo(() => {
    let totalYes = 0;
    let totalNo = 0;
    let totalMaybe = 0;
    let totalPending = 0;

    const bySection: Record<VoiceSection, { yes: number; no: number; maybe: number; pending: number; total: number }> = {
      Soprano: { yes: 0, no: 0, maybe: 0, pending: 0, total: 0 },
      Contralto: { yes: 0, no: 0, maybe: 0, pending: 0, total: 0 },
      Tenore: { yes: 0, no: 0, maybe: 0, pending: 0, total: 0 },
      Baritono: { yes: 0, no: 0, maybe: 0, pending: 0, total: 0 },
      Basso: { yes: 0, no: 0, maybe: 0, pending: 0, total: 0 }
    };

    members.forEach((m) => {
      const rec = eventAttendance[m.id];
      const status = rec?.status || 'NON_INDICATO';
      const sec = m.section;

      if (bySection[sec]) {
        bySection[sec].total++;
        if (status === 'SI') {
          bySection[sec].yes++;
          totalYes++;
        } else if (status === 'NO') {
          bySection[sec].no++;
          totalNo++;
        } else if (status === 'FORSE') {
          bySection[sec].maybe++;
          totalMaybe++;
        } else {
          bySection[sec].pending++;
          totalPending++;
        }
      }
    });

    return {
      totalYes,
      totalNo,
      totalMaybe,
      totalPending,
      totalMembers: members.length,
      percentage: members.length > 0 ? Math.round((totalYes / members.length) * 100) : 0,
      bySection
    };
  }, [members, eventAttendance]);

  // Layout seats dynamically across concentric semicircles in each section's wedge
  const seats = useMemo(() => {
    const list: SeatData[] = [];

    SECTIONS_ORDER.forEach((sec) => {
      const cfg = SECTION_CONFIG[sec];
      const secMembers = members.filter((m) => m.section === sec);
      const count = secMembers.length;
      if (count === 0) return;

      // Group members: leaders first, then alphabetical
      const sorted = [...secMembers].sort((a, b) => {
        if (a.isSectionLeader && !b.isSectionLeader) return -1;
        if (!a.isSectionLeader && b.isSectionLeader) return 1;
        return a.name.localeCompare(b.name);
      });

      // Number of concentric rows
      const rowCount = count <= 6 ? Math.min(count, 3) : count <= 12 ? 4 : 5;

      // Calculate seats per row
      const rows: number[] = [];
      let remaining = count;
      for (let r = 0; r < rowCount; r++) {
        const weight = r + 1.6;
        const totalWeight = (rowCount * (rowCount + 2.2)) / 2;
        const target = r === rowCount - 1 ? remaining : Math.max(1, Math.round((weight / totalWeight) * count));
        const alloc = Math.min(target, remaining);
        rows.push(alloc);
        remaining -= alloc;
      }
      while (remaining > 0) {
        rows[rows.length - 1]++;
        remaining--;
      }

      let memberIdx = 0;
      for (let rowIdx = 0; rowIdx < rowCount; rowIdx++) {
        const seatsInRow = rows[rowIdx];
        if (seatsInRow <= 0) continue;

        const r = rowCount === 1 ? (rMin + rMax) / 2 : rMin + (rowIdx / (rowCount - 1)) * (rMax - rMin);

        for (let s = 0; s < seatsInRow; s++) {
          if (memberIdx >= count) break;
          const member = sorted[memberIdx];

          const margin = (cfg.startAngle - cfg.endAngle) * 0.08;
          const effStart = cfg.startAngle - margin;
          const effEnd = cfg.endAngle + margin;

          const angleDeg =
            seatsInRow === 1
              ? (effStart + effEnd) / 2
              : effStart - (s / (seatsInRow - 1)) * (effStart - effEnd);

          const rad = (angleDeg * Math.PI) / 180;
          const x = cx + r * Math.cos(rad);
          const y = cy - r * Math.sin(rad);

          const rec = eventAttendance[member.id];
          const status = rec?.status || 'NON_INDICATO';

          list.push({
            member,
            section: sec,
            x,
            y,
            radius: r,
            angleDeg,
            status,
            note: rec?.note,
            isSectionLeader: member.isSectionLeader
          });

          memberIdx++;
        }
      }
    });

    return list;
  }, [members, eventAttendance, cx, cy]);

  // Selected member attendance details
  const selectedMemberRecord = selectedMember ? eventAttendance[selectedMember.id] : undefined;
  const selectedMemberStatus = selectedMemberRecord?.status || 'NON_INDICATO';

  // SVG Sector Arc Paths for background wedges
  const createWedgePath = (startAngleDeg: number, endAngleDeg: number, innerR: number, outerR: number) => {
    const startRad = (startAngleDeg * Math.PI) / 180;
    const endRad = (endAngleDeg * Math.PI) / 180;

    const x1 = cx + outerR * Math.cos(startRad);
    const y1 = cy - outerR * Math.sin(startRad);
    const x2 = cx + outerR * Math.cos(endRad);
    const y2 = cy - outerR * Math.sin(endRad);
    const x3 = cx + innerR * Math.cos(endRad);
    const y3 = cy - innerR * Math.sin(endRad);
    const x4 = cx + innerR * Math.cos(startRad);
    const y4 = cy - innerR * Math.sin(startRad);

    const largeArc = startAngleDeg - endAngleDeg > 180 ? 1 : 0;

    return `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4} Z`;
  };

  // Determine dot visual styling
  const getDotStyle = (seat: SeatData) => {
    const cfg = SECTION_CONFIG[seat.section];
    const isSectionActive = selectedSectionFilter === 'ALL' || selectedSectionFilter === seat.section;
    const isStatusActive = statusFilter === 'ALL' || statusFilter === seat.status;
    const isMuted = !isSectionActive || !isStatusActive;
    const isHovered = hoveredMember?.member.id === seat.member.id;
    const isSelected = selectedMember?.id === seat.member.id;

    let fill = '#ffffff';
    let stroke = '#94a3b8';
    let strokeWidth = 1.5;
    let opacity = isMuted ? 0.22 : 1;

    if (colorMode === 'section') {
      // Photo style: Filled with section color when Present, hollow/white with gray ring when Absent
      if (seat.status === 'SI') {
        fill = cfg.color;
        stroke = '#ffffff';
        strokeWidth = 2;
      } else if (seat.status === 'NO') {
        fill = '#ffffff';
        stroke = '#cbd5e1';
        strokeWidth = 2;
      } else if (seat.status === 'FORSE') {
        fill = '#fef3c7';
        stroke = '#f59e0b';
        strokeWidth = 2;
      } else {
        fill = '#f8fafc';
        stroke = '#cbd5e1';
        strokeWidth = 1.5;
      }
    } else {
      // Status mode: Green (Yes), Red (No), Amber (Maybe), Gray (Pending)
      if (seat.status === 'SI') {
        fill = '#10b981';
        stroke = '#ffffff';
        strokeWidth = 2;
      } else if (seat.status === 'NO') {
        fill = '#f43f5e';
        stroke = '#ffffff';
        strokeWidth = 2;
      } else if (seat.status === 'FORSE') {
        fill = '#f59e0b';
        stroke = '#ffffff';
        strokeWidth = 2;
      } else {
        fill = '#ffffff';
        stroke = '#94a3b8';
        strokeWidth = 1.5;
      }
    }

    return {
      fill,
      stroke: isSelected ? '#0f172a' : isHovered ? '#0f172a' : stroke,
      strokeWidth: isSelected ? 3 : isHovered ? 2.5 : strokeWidth,
      r: isSelected ? 9.5 : isHovered ? 9 : 7.2,
      opacity
    };
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Top Header Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-slate-850 text-white">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400 bg-teal-950/80 px-2.5 py-0.5 rounded-full border border-teal-800">
              Disposizione Corale a Semicerchio
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
            <span>Emiciclo Presenze: {currentEvent.city}</span>
            <span className="text-xs font-semibold text-slate-400">({currentEvent.date})</span>
          </h3>
          <p className="text-xs text-slate-300">
            Mappa acustica a gradinata. Tocca qualsiasi posto per visualizzare il corista o aggiornare lo stato.
          </p>
        </div>

        {/* Quick Toggles: Mode & Section Filter */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Color Mode Toggle */}
          <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs font-semibold">
            <button
              onClick={() => setColorMode('section')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                colorMode === 'section'
                  ? 'bg-teal-700 text-white font-bold shadow-2xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Stile Foto (Sezioni)
            </button>
            <button
              onClick={() => setColorMode('status')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                colorMode === 'status'
                  ? 'bg-teal-700 text-white font-bold shadow-2xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Stato Presenza
            </button>
          </div>

          {/* Reset Filters button */}
          {(selectedSectionFilter !== 'ALL' || statusFilter !== 'ALL') && (
            <button
              onClick={() => {
                if (onSelectSectionFilter) onSelectSectionFilter('ALL');
                setStatusFilter('ALL');
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors cursor-pointer"
            >
              Reimposta filtri
            </button>
          )}
        </div>
      </div>

      {/* Status Filter Bar */}
      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="font-bold text-slate-500 text-[11px] uppercase mr-1 shrink-0">Filtra stato:</span>
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-colors whitespace-nowrap cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Tutti ({members.length})
          </button>
          <button
            onClick={() => setStatusFilter('SI')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer ${
              statusFilter === 'SI'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>Presenti ({stats.totalYes})</span>
          </button>
          <button
            onClick={() => setStatusFilter('NO')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer ${
              statusFilter === 'NO'
                ? 'bg-rose-700 text-white shadow-2xs'
                : 'bg-white text-rose-800 border border-rose-300 hover:bg-rose-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
            <span>Assenti ({stats.totalNo})</span>
          </button>
          <button
            onClick={() => setStatusFilter('FORSE')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer ${
              statusFilter === 'FORSE'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-white text-amber-800 border border-amber-300 hover:bg-amber-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
            <span>In dubbio ({stats.totalMaybe})</span>
          </button>
          <button
            onClick={() => setStatusFilter('NON_INDICATO')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer ${
              statusFilter === 'NON_INDICATO'
                ? 'bg-slate-700 text-white shadow-2xs'
                : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
            <span>In attesa ({stats.totalPending})</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-500 hidden lg:block">
          💡 Fai clic su un posto per dettagli corista e contatto rapido WhatsApp
        </div>
      </div>

      {/* Interactive SVG Hemicycle */}
      <div className="p-2 sm:p-4 bg-gradient-to-b from-slate-50/50 to-white relative flex flex-col items-center select-none">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full max-w-4xl h-auto drop-shadow-xs"
          style={{ maxHeight: '520px' }}
        >
          <defs>
            {/* Subtle glow filter */}
            <filter id="hemicycle-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Semicircular Guide Arcs */}
          {[140, 180, 220, 260, 300].map((r) => (
            <path
              key={r}
              d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="1"
              strokeDasharray="3 4"
            />
          ))}

          {/* Section Wedge Backgrounds & Divider Lines */}
          {SECTIONS_ORDER.map((sec) => {
            const cfg = SECTION_CONFIG[sec];
            const isSelected = selectedSectionFilter === 'ALL' || selectedSectionFilter === sec;
            const pathD = createWedgePath(cfg.startAngle, cfg.endAngle, rMin - 15, rMax + 15);

            return (
              <g
                key={sec}
                className="transition-opacity duration-200 cursor-pointer"
                onClick={() => {
                  if (onSelectSectionFilter) {
                    onSelectSectionFilter(selectedSectionFilter === sec ? 'ALL' : sec);
                  }
                }}
              >
                <path
                  d={pathD}
                  fill={cfg.bgFill}
                  stroke={cfg.borderColor}
                  strokeWidth={isSelected ? 1.5 : 0.8}
                  opacity={isSelected ? 1 : 0.3}
                  className="hover:opacity-100 transition-opacity"
                />
              </g>
            );
          })}

          {/* Section Outer Labels with Quorum counts */}
          {SECTIONS_ORDER.map((sec) => {
            const cfg = SECTION_CONFIG[sec];
            const secStat = stats.bySection[sec];
            const midAngle = (cfg.startAngle + cfg.endAngle) / 2;
            const labelR = rMax + 40;
            const rad = (midAngle * Math.PI) / 180;
            const lx = cx + labelR * Math.cos(rad);
            const ly = cy - labelR * Math.sin(rad);

            const isSelected = selectedSectionFilter === 'ALL' || selectedSectionFilter === sec;
            const pct = secStat.total > 0 ? Math.round((secStat.yes / secStat.total) * 100) : 0;

            return (
              <g
                key={`label-${sec}`}
                transform={`translate(${lx}, ${ly})`}
                className="cursor-pointer transition-transform hover:scale-105"
                onClick={() => {
                  if (onSelectSectionFilter) {
                    onSelectSectionFilter(selectedSectionFilter === sec ? 'ALL' : sec);
                  }
                }}
                opacity={isSelected ? 1 : 0.35}
              >
                {/* Section title pill */}
                <rect
                  x="-54"
                  y="-18"
                  width="108"
                  height="34"
                  rx="10"
                  fill="#ffffff"
                  stroke={cfg.color}
                  strokeWidth={isSelected ? 2 : 1}
                  className="drop-shadow-xs"
                />
                <text
                  x="0"
                  y="-4"
                  textAnchor="middle"
                  fill="#0f172a"
                  fontSize="10.5"
                  fontWeight="900"
                  letterSpacing="0.5"
                >
                  {cfg.label.toUpperCase()}
                </text>
                <text
                  x="0"
                  y="10"
                  textAnchor="middle"
                  fill={pct >= 70 ? '#059669' : '#d97706'}
                  fontSize="10"
                  fontWeight="800"
                >
                  {secStat.yes}/{secStat.total} ({pct}%)
                </text>
              </g>
            );
          })}

          {/* Seats (Singer Dots) */}
          {seats.map((seat) => {
            const style = getDotStyle(seat);
            const isHovered = hoveredMember?.member.id === seat.member.id;
            const isSelected = selectedMember?.id === seat.member.id;

            return (
              <g
                key={seat.member.id}
                className="cursor-pointer transition-all duration-150"
                onClick={() => setSelectedMember(seat.member)}
                onMouseEnter={() => setHoveredMember(seat)}
                onMouseLeave={() => setHoveredMember(null)}
              >
                {/* Leader Halo Ring */}
                {seat.isSectionLeader && (
                  <circle
                    cx={seat.x}
                    cy={seat.y}
                    r={style.r + 3.5}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="1.8"
                    strokeDasharray="2 2"
                    opacity={style.opacity}
                  />
                )}

                {/* Main Singer Dot */}
                <circle
                  cx={seat.x}
                  cy={seat.y}
                  r={style.r}
                  fill={style.fill}
                  stroke={style.stroke}
                  strokeWidth={style.strokeWidth}
                  opacity={style.opacity}
                  filter={isSelected || isHovered ? 'url(#hemicycle-glow)' : undefined}
                />

                {/* Inner symbol for absent or maybe */}
                {seat.status === 'NO' && style.opacity > 0.4 && (
                  <line
                    x1={seat.x - 2.5}
                    y1={seat.y - 2.5}
                    x2={seat.x + 2.5}
                    y2={seat.y + 2.5}
                    stroke="#ef4444"
                    strokeWidth="1.2"
                  />
                )}

                {seat.status === 'FORSE' && style.opacity > 0.4 && (
                  <circle cx={seat.x} cy={seat.y} r="2" fill="#d97706" />
                )}
              </g>
            );
          })}

          {/* Conductor Podium in Center (Bottom) */}
          <g transform={`translate(${cx}, ${cy - 10})`}>
            {/* Semicircle stage platform */}
            <path
              d="M -50 0 A 50 50 0 0 1 50 0 Z"
              fill="#0f172a"
              stroke="#334155"
              strokeWidth="2"
            />
            {/* Conductor Music Stand Icon */}
            <g transform="translate(0, -20)">
              <circle cx="0" cy="-6" r="5" fill="#2dd4bf" />
              <line x1="0" y1="-1" x2="0" y2="10" stroke="#2dd4bf" strokeWidth="2.5" />
              <line x1="-8" y1="2" x2="8" y2="2" stroke="#2dd4bf" strokeWidth="2" />
              <line x1="-7" y1="10" x2="7" y2="10" stroke="#2dd4bf" strokeWidth="2" />
            </g>
            <text
              x="0"
              y="-1"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="8.5"
              fontWeight="900"
              letterSpacing="0.5"
            >
              M° DANIELE
            </text>
          </g>

          {/* Big Quorum readout under the stage (exactly like 630 in user's image) */}
          <g transform={`translate(${cx}, ${cy + 52})`}>
            <text
              x="0"
              y="0"
              textAnchor="middle"
              fill="#0f172a"
              fontSize="34"
              fontWeight="900"
              letterSpacing="-0.5"
            >
              {stats.totalYes}
            </text>
            <text
              x="0"
              y="18"
              textAnchor="middle"
              fill="#64748b"
              fontSize="11"
              fontWeight="700"
              letterSpacing="0.2"
            >
              CORISTI PRESENTI SU {stats.totalMembers} ({stats.percentage}% QUORUM)
            </text>
          </g>
        </svg>

        {/* Hover Tooltip Overlay (when hovering a seat on desktop) */}
        {hoveredMember && !selectedMember && (
          <div
            className="absolute z-20 pointer-events-none bg-slate-900/95 text-white text-xs px-3 py-2 rounded-xl shadow-xl border border-slate-700 animate-in fade-in zoom-in-95 duration-100"
            style={{
              left: `${Math.min(Math.max(16, (hoveredMember.x / svgWidth) * 100), 84)}%`,
              top: `${Math.max(10, ((hoveredMember.y - 45) / svgHeight) * 100)}%`,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <div className="font-bold flex items-center gap-1.5">
              <span>{hoveredMember.member.name}</span>
              {hoveredMember.isSectionLeader && (
                <span className="text-[9px] bg-amber-500 text-slate-950 font-black px-1 rounded">
                  Capo
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-300 mt-0.5">
              {hoveredMember.section} · {hoveredMember.member.city || 'Emilia-Romagna'}
            </div>
            <div className="text-[10px] font-bold mt-1 flex items-center gap-1">
              {hoveredMember.status === 'SI' && <span className="text-emerald-400">✅ Confermato Presente</span>}
              {hoveredMember.status === 'NO' && <span className="text-rose-400">❌ Assente</span>}
              {hoveredMember.status === 'FORSE' && <span className="text-amber-400">⚠️ In dubbio / Parziale</span>}
              {hoveredMember.status === 'NON_INDICATO' && <span className="text-slate-400">· In attesa di risposta</span>}
            </div>
          </div>
        )}
      </div>

      {/* Singer Inspector Modal / Card (when clicked on a dot) */}
      {selectedMember && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200">
            <div
              className="p-5 text-white flex items-start justify-between"
              style={{ backgroundColor: SECTION_CONFIG[selectedMember.section].color }}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center font-black text-lg text-white">
                  {selectedMember.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-white/80 block">
                    {selectedMember.section} {selectedMember.isSectionLeader && '· Caposezione'}
                  </span>
                  <h4 className="text-base font-extrabold text-white leading-tight">
                    {selectedMember.name}
                  </h4>
                  <div className="text-xs text-white/90 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{selectedMember.city || 'Emilia-Romagna'}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedMember(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">
                  Stato Presenza Attuale:
                </span>
                <div className="flex items-center gap-2">
                  {selectedMemberStatus === 'SI' && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-1.5 rounded-xl">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>PRESENTE CONFERMATO</span>
                    </span>
                  )}
                  {selectedMemberStatus === 'NO' && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300 px-3 py-1.5 rounded-xl">
                      <XCircle className="w-4 h-4 text-rose-600" />
                      <span>ASSENTE</span>
                    </span>
                  )}
                  {selectedMemberStatus === 'FORSE' && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1.5 rounded-xl">
                      <HelpCircle className="w-4 h-4 text-amber-600" />
                      <span>IN DUBBIO / ORARIO PARZIALE</span>
                    </span>
                  )}
                  {selectedMemberStatus === 'NON_INDICATO' && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1.5 rounded-xl">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>In attesa di risposta</span>
                    </span>
                  )}
                </div>
              </div>

              {selectedMemberRecord?.note && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                  <strong>Nota personale:</strong> "{selectedMemberRecord.note}"
                </div>
              )}

              {/* Quick Status Override for Director */}
              {onUpdateAttendance && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-2">
                    Modifica Presenza (Direttore):
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => {
                        onUpdateAttendance(currentEvent.id, selectedMember.id, 'SI');
                      }}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        selectedMemberStatus === 'SI'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Presente</span>
                    </button>
                    <button
                      onClick={() => {
                        onUpdateAttendance(currentEvent.id, selectedMember.id, 'NO');
                      }}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        selectedMemberStatus === 'NO'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Assente</span>
                    </button>
                    <button
                      onClick={() => {
                        onUpdateAttendance(currentEvent.id, selectedMember.id, 'FORSE');
                      }}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        selectedMemberStatus === 'FORSE'
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200'
                      }`}
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Dubbio</span>
                    </button>
                  </div>
                </div>
              )}

              {/* WhatsApp direct contact button */}
              {selectedMember.phone && (
                <div className="pt-1">
                  <a
                    href={`https://wa.me/${selectedMember.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `Ciao ${selectedMember.name.split(' ')[0]}, ti contatto dal Coro Regionale per la prova di ${currentEvent.city} (${currentEvent.date}).`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Contatta su WhatsApp ({selectedMember.phone})</span>
                  </a>
                </div>
              )}

              <button
                onClick={() => setSelectedMember(null)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Chiudi Scheda
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

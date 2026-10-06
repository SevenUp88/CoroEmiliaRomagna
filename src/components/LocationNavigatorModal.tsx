import React, { useState } from 'react';
import { ChoirEvent } from '../types';
import {
  MapPin,
  Navigation,
  ExternalLink,
  X,
  Copy,
  Check,
  Car
} from 'lucide-react';

interface LocationNavigatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: ChoirEvent | null;
}

export const LocationNavigatorModal: React.FC<LocationNavigatorModalProps> = ({
  isOpen,
  onClose,
  event
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !event) return null;

  const fullDestination = `${event.location}, ${event.address ? event.address : event.city}`;
  const encodedDest = encodeURIComponent(fullDestination);

  // Deep links for navigation apps
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedDest}`;
  const appleMapsUrl = `https://maps.apple.com/?daddr=${encodedDest}&dirflg=d`;
  const wazeUrl = `https://waze.com/ul?q=${encodedDest}&navigate=yes`;

  const handleCopyAddress = () => {
    const textToCopy = event.address ? `${event.location} - ${event.address}` : `${event.location}, ${event.city}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        
        {/* Header Modal */}
        <div className="p-5 bg-gradient-to-r from-teal-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 shrink-0">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-teal-300 uppercase tracking-wider block">
                Navigatore & Geolocalizzazione
              </span>
              <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                Raggiungi la Sede di {event.city}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Card Destinazione */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <div className="font-extrabold text-sm sm:text-base text-slate-900">
                  {event.location}
                </div>
                <div className="text-xs text-slate-600 mt-0.5">
                  {event.address ? event.address : `${event.city} (Emilia-Romagna)`}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/70 text-xs">
              <span className="text-slate-500 font-medium">Orario ritrovo: {event.time}</span>
              <button
                type="button"
                onClick={handleCopyAddress}
                className="inline-flex items-center gap-1 font-bold text-teal-800 hover:text-teal-950 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Indirizzo Copiato!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copia Indirizzo</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Scegli App di Navigazione */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2.5">
              Apri nell’App di Guida / Navigatore:
            </label>

            <div className="space-y-2">
              {/* Google Maps */}
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-300 rounded-2xl transition-all shadow-2xs group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
                    <Navigation className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-black text-xs sm:text-sm text-emerald-950 group-hover:text-emerald-900 flex items-center gap-1.5">
                      <span>Google Maps</span>
                      <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded font-bold">
                        Consigliato
                      </span>
                    </div>
                    <div className="text-[11px] text-emerald-800">
                      Indicazioni stradali turn-by-turn e traffico in tempo reale
                    </div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-emerald-700 shrink-0" />
              </a>

              {/* Apple Maps (per iPhone / CarPlay) */}
              <a
                href={appleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl transition-all shadow-2xs group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    <Car className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-slate-900">
                      Apple Mappe
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Ideale per iPhone, iPad e Apple CarPlay in auto
                    </div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 shrink-0" />
              </a>

              {/* Waze */}
              <a
                href={wazeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 bg-cyan-50 hover:bg-cyan-100/80 border border-cyan-200 rounded-2xl transition-all shadow-2xs group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
                    W
                  </div>
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-cyan-950">
                      Waze
                    </div>
                    <div className="text-[11px] text-cyan-800">
                      Avvisi autovelox e code autostradali (A1 / A14)
                    </div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-cyan-700 shrink-0" />
              </a>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 text-center pt-1">
            Cliccando su un'app si aprirà direttamente il navigatore del tuo smartphone o del computer con l'itinerario impostato.
          </p>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl cursor-pointer transition-colors"
          >
            Chiudi
          </button>
        </div>

      </div>
    </div>
  );
};

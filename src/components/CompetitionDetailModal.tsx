import { Competition } from '../types/competition';
import { formatPace, getDisciplineColor } from '../utils/helpers';
import { X, ExternalLink, MapPin, Compass, Trophy, Timer, Mountain, Edit2, Share2, Check } from 'lucide-react';
import { useState } from 'react';

interface CompetitionDetailModalProps {
  competition: Competition | null;
  onClose: () => void;
  onEdit: (comp: Competition) => void;
  onPanToMap: (comp: Competition) => void;
}

export default function CompetitionDetailModal({
  competition,
  onClose,
  onEdit,
  onPanToMap,
}: CompetitionDetailModalProps) {
  const [copied, setCopied] = useState(false);

  if (!competition) return null;

  const pace = formatPace(competition.time, competition.distanceKm);
  const disc = getDisciplineColor(competition.discipline);

  const copyShareLink = () => {
    const text = `${competition.name} (${competition.date}) - Place: ${competition.placement || '-'}/${competition.totalParticipants || '-'}, Time: ${competition.time || '-'} ${competition.liveloxUrl ? `| Livelox: ${competition.liveloxUrl}` : ''}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/80">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded ${disc.bg} ${disc.text} border ${disc.border}`}>
              {competition.discipline}
            </span>
            <span className="text-xs text-neutral-400 font-mono">
              {competition.date}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onPanToMap(competition);
                onClose();
              }}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
              title="Show on map"
            >
              <Compass className="w-4 h-4 text-orange-400" />
            </button>
            <button
              onClick={copyShareLink}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
              title="Copy race summary"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => {
                onEdit(competition);
                onClose();
              }}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
              title="Edit competition"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Title & Metadata */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-tight">
              {competition.name}
            </h2>
            <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-sm text-neutral-400">
              <span className="flex items-center gap-1 text-orange-400 font-medium">
                <MapPin className="w-4 h-4 shrink-0" />
                {competition.location}, {competition.country}
              </span>
              <span className="text-neutral-600">&middot;</span>
              <span>Club: <strong className="text-neutral-200">{competition.club}</strong></span>
              <span className="text-neutral-600">&middot;</span>
              <span>Class: <strong className="text-neutral-200">{competition.competitionClass}</strong></span>
              {competition.siCardNumber && (
                <>
                  <span className="text-neutral-600">&middot;</span>
                  <span>SI-Card: <strong className="text-orange-400 font-mono">{competition.siCardNumber}</strong></span>
                </>
              )}
            </div>
            <div className="mt-2 text-xs font-mono text-neutral-500">
              Coordinates: {competition.lat.toFixed(5)}, {competition.lng.toFixed(5)}
            </div>

            {competition.discipline === 'Relay' && (
              <div className="mt-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/25 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                <span className="text-rose-400 font-bold uppercase tracking-wider">Relay (Stafett)</span>
                <span className="text-neutral-300">Team: <strong className="text-white">{competition.relayTeam || competition.club}</strong></span>
                {competition.relayLeg && (
                  <span className="text-neutral-300">Leg: <strong className="text-orange-400 font-mono">{competition.relayLeg}</strong></span>
                )}
                {competition.relayTeamPlacement && (
                  <span className="text-neutral-300">Team Finish: <strong className="text-amber-400 font-mono">#{competition.relayTeamPlacement}</strong></span>
                )}
              </div>
            )}
          </div>

          {/* Key Links Section: Livelox, Results, Winsplits */}
          <div className="bg-neutral-950/70 rounded-xl p-4 border border-neutral-800 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono">
              Official Links & GPS Replay
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {competition.liveloxUrl ? (
                <a
                  href={competition.liveloxUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-orange-600/90 to-amber-600/90 hover:from-orange-500 hover:to-amber-500 text-white font-semibold text-sm shadow-md transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded bg-white/20 flex items-center justify-center">
                      <Compass className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-xs opacity-80 uppercase tracking-wider">Livelox.com</div>
                      <div className="font-bold">GPS Route & Map</div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 opacity-75 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </a>
              ) : (
                <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-500 text-xs flex items-center justify-between">
                  <span>No Livelox URL linked yet</span>
                  <button
                    onClick={() => {
                      onEdit(competition);
                      onClose();
                    }}
                    className="text-orange-400 hover:underline"
                  >
                    Add Livelox link
                  </button>
                </div>
              )}

              {competition.resultUrl ? (
                <a
                  href={competition.resultUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg bg-neutral-800 hover:bg-neutral-700/80 text-white font-medium text-sm border border-neutral-700 transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded bg-neutral-700/80 flex items-center justify-center">
                      <Trophy className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <div className="text-xs text-neutral-400 uppercase tracking-wider">Eventor / Results</div>
                      <div className="font-bold text-neutral-200">Official Race Results</div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
                </a>
              ) : null}
            </div>

            {competition.winsplitsUrl && (
              <div className="pt-1">
                <a
                  href={competition.winsplitsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300 font-medium transition-colors"
                >
                  <Timer className="w-3.5 h-3.5" />
                  <span>Open Split Times on Winsplits Online</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          {/* Performance Grid */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono mb-3">
              Race Performance
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-neutral-950/60 p-3 rounded-xl border border-neutral-800">
                <div className="text-[11px] text-neutral-500 uppercase font-mono mb-1">Placement</div>
                <div className="text-xl font-bold text-amber-400 font-mono tabular-nums">
                  {competition.placement ? `#${competition.placement}` : '-'}
                  {competition.totalParticipants && (
                    <span className="text-xs text-neutral-500 font-normal"> / {competition.totalParticipants}</span>
                  )}
                </div>
              </div>

              <div className="bg-neutral-950/60 p-3 rounded-xl border border-neutral-800">
                <div className="text-[11px] text-neutral-500 uppercase font-mono mb-1">Race Time</div>
                <div className="text-xl font-bold text-neutral-100 font-mono tabular-nums">
                  {competition.time || '-'}
                </div>
                {competition.timeBehind && (
                  <div className="text-[11px] text-neutral-400 font-mono">{competition.timeBehind} behind winner</div>
                )}
              </div>

              <div className="bg-neutral-950/60 p-3 rounded-xl border border-neutral-800">
                <div className="text-[11px] text-neutral-500 uppercase font-mono mb-1">Distance & Climb</div>
                <div className="text-xl font-bold text-neutral-100 font-mono tabular-nums">
                  {competition.distanceKm ? `${competition.distanceKm} km` : '-'}
                </div>
                {competition.climbM && (
                  <div className="text-[11px] text-neutral-400 font-mono flex items-center gap-1">
                    <Mountain className="w-3 h-3 text-neutral-500" />
                    +{competition.climbM}m elevation
                  </div>
                )}
              </div>

              <div className="bg-neutral-950/60 p-3 rounded-xl border border-neutral-800">
                <div className="text-[11px] text-neutral-500 uppercase font-mono mb-1">Speed / Pace</div>
                <div className="text-xl font-bold text-emerald-400 font-mono tabular-nums">
                  {pace ? pace.replace(' /km', '') : '-'}
                </div>
                <div className="text-[11px] text-neutral-500 font-mono">min per kilometer</div>
              </div>
            </div>
          </div>

          {/* Map Specifications */}
          <div className="grid grid-cols-3 gap-3 bg-neutral-950/40 p-3 rounded-xl border border-neutral-800/80 text-xs text-neutral-300">
            <div>
              <span className="text-neutral-500 block mb-0.5">Controls:</span>
              <strong className="font-mono text-neutral-200">{competition.controlsCount ? `${competition.controlsCount} controls` : 'Not specified'}</strong>
            </div>
            <div>
              <span className="text-neutral-500 block mb-0.5">Map Scale:</span>
              <strong className="font-mono text-neutral-200">{competition.mapScale || '1:10 000'}</strong>
            </div>
            <div>
              <span className="text-neutral-500 block mb-0.5">Contour Interval:</span>
              <strong className="font-mono text-neutral-200">{competition.contourInterval || '5m'}</strong>
            </div>
          </div>

          {/* Race Notes & Route Analysis */}
          {competition.notes && (
            <div className="space-y-1.5">
              <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono">
                Race Analysis & Route Choice Notes
              </div>
              <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 text-neutral-300 text-sm leading-relaxed whitespace-pre-line">
                {competition.notes}
              </div>
            </div>
          )}

          {/* Tags */}
          {competition.tags && competition.tags.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <span className="text-neutral-500">Tags:</span>
              {competition.tags.map((t, idx) => (
                <span key={t} className="text-neutral-300">
                  {t}
                  {idx < (competition.tags?.length || 0) - 1 && <span className="text-neutral-600 ml-2">&middot;</span>}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-neutral-900 border-t border-neutral-800 flex items-center justify-between">
          <button
            onClick={() => {
              onPanToMap(competition);
              onClose();
            }}
            className="text-xs font-medium text-orange-400 hover:text-orange-300 flex items-center gap-1.5"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Show marker on map</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium text-xs rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

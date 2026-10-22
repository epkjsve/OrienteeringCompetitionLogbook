import { Competition } from '../types/competition';
import { formatPace, getDisciplineColor } from '../utils/helpers';
import { MapPin, ExternalLink, Navigation, Edit2, Trash2, ArrowUpRight } from 'lucide-react';

interface CompetitionCardProps {
  competition: Competition;
  isSelected: boolean;
  onSelect: (comp: Competition) => void;
  onViewDetails: (comp: Competition) => void;
  onEdit: (comp: Competition) => void;
  onDelete: (id: string) => void;
}

export default function CompetitionCard({
  competition,
  isSelected,
  onSelect,
  onViewDetails,
  onEdit,
  onDelete,
}: CompetitionCardProps) {
  const pace = formatPace(competition.time, competition.distanceKm);
  const disc = getDisciplineColor(competition.discipline);

  return (
    <div
      onClick={() => onSelect(competition)}
      className={`group relative p-4 rounded-xl border transition-all cursor-pointer ${
        isSelected
          ? 'bg-neutral-800/90 border-orange-500/80 shadow-lg shadow-orange-950/20'
          : 'bg-neutral-900/70 border-neutral-800/80 hover:bg-neutral-800/50 hover:border-neutral-700'
      }`}
    >
      {/* 1-line Quiet Kicker: Clean unboxed metadata with separators */}
      <div className="flex items-center justify-between text-xs text-neutral-400 mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className={`font-semibold ${disc.text}`}>{competition.discipline}</span>
          <span aria-hidden="true" className="text-neutral-600">&middot;</span>
          <span className="text-neutral-300">{competition.competitionClass}</span>
          <span aria-hidden="true" className="text-neutral-600">&middot;</span>
          <span className="font-mono text-neutral-400">{competition.date}</span>
          {competition.status === 'registered' && (
            <>
              <span aria-hidden="true" className="text-neutral-600">&middot;</span>
              <span className="text-emerald-400 font-medium">Registered</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(competition);
            }}
            className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-700/60"
            title="Edit competition"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(competition.id);
            }}
            className="p-1 text-neutral-400 hover:text-red-400 rounded hover:bg-neutral-700/60"
            title="Delete competition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Primary Title */}
      <h3 className="text-sm sm:text-base font-bold text-white mb-1 group-hover:text-orange-300 transition-colors leading-snug">
        {competition.name}
      </h3>

      {/* Location & Club */}
      <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-2">
        <MapPin className="w-3 h-3 text-neutral-500 shrink-0" />
        <span className="truncate">{competition.location}</span>
        <span aria-hidden="true" className="text-neutral-600">&middot;</span>
        <span className="truncate text-neutral-500">{competition.club}</span>
      </div>

      {/* Relay Specific Strip (if Relay) */}
      {competition.discipline === 'Relay' && (
        <div className="flex items-center gap-2 px-2.5 py-1 mb-2.5 rounded-md bg-rose-500/10 border border-rose-500/20 text-xs">
          <span className="text-rose-400 font-bold">Relay (Stafett)</span>
          <span aria-hidden="true" className="text-neutral-600">&middot;</span>
          <span className="text-neutral-200 font-medium">{competition.relayTeam || competition.club}</span>
          {competition.relayLeg && (
            <>
              <span aria-hidden="true" className="text-neutral-600">&middot;</span>
              <span className="text-orange-400 font-mono font-medium">{competition.relayLeg}</span>
            </>
          )}
          {competition.relayTeamPlacement && (
            <>
              <span aria-hidden="true" className="text-neutral-600">&middot;</span>
              <span className="text-amber-400 font-mono">Team: #{competition.relayTeamPlacement}</span>
            </>
          )}
        </div>
      )}

      {/* Results / Race Stats Strip */}
      <div className="grid grid-cols-4 gap-2 bg-neutral-950/60 rounded-lg p-2.5 border border-neutral-800/80 mb-3 text-center">
        <div>
          <div className="text-[10px] text-neutral-500 uppercase font-mono tracking-wider">Place</div>
          <div className="text-xs sm:text-sm font-bold text-amber-400 font-mono tabular-nums">
            {competition.placement ? `#${competition.placement}` : '-'}
          </div>
          {competition.totalParticipants && (
            <div className="text-[10px] text-neutral-500 font-mono">of {competition.totalParticipants}</div>
          )}
        </div>
        <div>
          <div className="text-[10px] text-neutral-500 uppercase font-mono tracking-wider">Time</div>
          <div className="text-xs sm:text-sm font-semibold text-neutral-200 font-mono tabular-nums">
            {competition.time || '-'}
          </div>
          {competition.timeBehind && (
            <div className="text-[10px] text-neutral-500 font-mono">{competition.timeBehind}</div>
          )}
        </div>
        <div>
          <div className="text-[10px] text-neutral-500 uppercase font-mono tracking-wider">Dist</div>
          <div className="text-xs sm:text-sm font-semibold text-neutral-200 font-mono tabular-nums">
            {competition.distanceKm ? `${competition.distanceKm} km` : '-'}
          </div>
          {competition.climbM && (
            <div className="text-[10px] text-neutral-500 font-mono">+{competition.climbM}m</div>
          )}
        </div>
        <div>
          <div className="text-[10px] text-neutral-500 uppercase font-mono tracking-wider">Pace</div>
          <div className="text-xs sm:text-sm font-semibold text-neutral-300 font-mono tabular-nums">
            {pace ? pace.replace(' /km', '') : '-'}
          </div>
          <div className="text-[10px] text-neutral-500 font-mono">/km</div>
        </div>
      </div>

      {/* Notes Excerpt (if any) */}
      {competition.notes && (
        <p className="text-xs text-neutral-400 line-clamp-2 mb-3 italic">
          &ldquo;{competition.notes}&rdquo;
        </p>
      )}

      {/* Action Links Bar (Livelox & Results) */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-800/60">
        <div className="flex items-center gap-2">
          {competition.liveloxUrl && (
            <a
              href={competition.liveloxUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors"
            >
              <span>Livelox GPS</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          )}
          {competition.liveloxUrl && competition.resultUrl && (
            <span aria-hidden="true" className="text-neutral-700">&middot;</span>
          )}
          {competition.resultUrl && (
            <a
              href={competition.resultUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              <span>Results</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(competition);
          }}
          className="text-xs font-medium text-neutral-400 hover:text-white transition-colors"
        >
          View Details &rarr;
        </button>
      </div>
    </div>
  );
}

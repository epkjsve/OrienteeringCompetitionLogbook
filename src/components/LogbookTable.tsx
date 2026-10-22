import { useState } from 'react';
import { Competition } from '../types/competition';
import { formatPace, getDisciplineColor } from '../utils/helpers';
import { ArrowUpDown, ExternalLink, Compass, Edit2, Trash2, ArrowUpRight } from 'lucide-react';

interface LogbookTableProps {
  competitions: Competition[];
  onSelectCompetition: (comp: Competition) => void;
  onViewDetails: (comp: Competition) => void;
  onEdit: (comp: Competition) => void;
  onDelete: (id: string) => void;
}

type SortField = 'date' | 'name' | 'placement' | 'time' | 'distanceKm';
type SortOrder = 'asc' | 'desc';

export default function LogbookTable({
  competitions,
  onSelectCompetition,
  onViewDetails,
  onEdit,
  onDelete,
}: LogbookTableProps) {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedCompetitions = [...competitions].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (aVal === undefined || aVal === null) return 1;
    if (bVal === undefined || bVal === null) return -1;

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      const cmp = aVal.localeCompare(bVal);
      return sortOrder === 'asc' ? cmp : -cmp;
    }

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    }

    return 0;
  });

  if (competitions.length === 0) {
    return (
      <div className="p-12 text-center text-neutral-500">
        No competitions match your current filters.
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left text-xs text-neutral-300">
        <thead className="bg-neutral-950 text-neutral-400 uppercase font-mono text-[10px] tracking-wider border-b border-neutral-800">
          <tr>
            <th
              onClick={() => handleSort('date')}
              className="px-4 py-3 cursor-pointer hover:text-white transition-colors"
            >
              <div className="flex items-center gap-1">
                <span>Date</span>
                <ArrowUpDown className="w-3 h-3" />
              </div>
            </th>
            <th
              onClick={() => handleSort('name')}
              className="px-4 py-3 cursor-pointer hover:text-white transition-colors"
            >
              <div className="flex items-center gap-1">
                <span>Competition</span>
                <ArrowUpDown className="w-3 h-3" />
              </div>
            </th>
            <th className="px-4 py-3">Discipline & Class</th>
            <th
              onClick={() => handleSort('placement')}
              className="px-4 py-3 cursor-pointer hover:text-white transition-colors text-right"
            >
              <div className="flex items-center justify-end gap-1">
                <span>Place</span>
                <ArrowUpDown className="w-3 h-3" />
              </div>
            </th>
            <th
              onClick={() => handleSort('time')}
              className="px-4 py-3 cursor-pointer hover:text-white transition-colors text-right"
            >
              <div className="flex items-center justify-end gap-1">
                <span>Time / Behind</span>
                <ArrowUpDown className="w-3 h-3" />
              </div>
            </th>
            <th
              onClick={() => handleSort('distanceKm')}
              className="px-4 py-3 cursor-pointer hover:text-white transition-colors text-right"
            >
              <div className="flex items-center justify-end gap-1">
                <span>Dist / Pace</span>
                <ArrowUpDown className="w-3 h-3" />
              </div>
            </th>
            <th className="px-4 py-3">Livelox & Results</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800/60 font-sans">
          {sortedCompetitions.map((comp) => {
            const pace = formatPace(comp.time, comp.distanceKm);
            const disc = getDisciplineColor(comp.discipline);

            return (
              <tr
                key={comp.id}
                className="hover:bg-neutral-800/40 transition-colors group cursor-pointer"
                onClick={() => onSelectCompetition(comp)}
              >
                {/* Date */}
                <td className="px-4 py-3 font-mono text-neutral-400 whitespace-nowrap">
                  {comp.date}
                </td>

                {/* Competition */}
                <td className="px-4 py-3">
                  <div className="font-semibold text-white group-hover:text-orange-300 transition-colors">
                    {comp.name}
                  </div>
                  <div className="text-neutral-500 text-[11px] flex items-center gap-1">
                    <span>{comp.location}</span>
                    <span>&middot;</span>
                    <span>{comp.club}</span>
                    {comp.relayLeg && (
                      <>
                        <span>&middot;</span>
                        <span className="text-orange-400 font-mono font-medium">{comp.relayLeg}</span>
                      </>
                    )}
                  </div>
                </td>

                {/* Discipline & Class & SI-card */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <span className={`font-semibold ${disc.text}`}>{comp.discipline}</span>
                    <span className="text-neutral-500">&middot;</span>
                    <span className="text-neutral-300 font-mono">{comp.competitionClass}</span>
                    {comp.siCardNumber && (
                      <>
                        <span className="text-neutral-600">&middot;</span>
                        <span className="text-[10px] text-orange-400 font-mono">SI {comp.siCardNumber}</span>
                      </>
                    )}
                  </div>
                </td>

                {/* Placement */}
                <td className="px-4 py-3 text-right whitespace-nowrap font-mono tabular-nums">
                  {comp.placement ? (
                    <span className={`font-bold ${comp.placement <= 3 ? 'text-amber-400' : 'text-neutral-200'}`}>
                      #{comp.placement}
                      {comp.totalParticipants && (
                        <span className="text-neutral-500 font-normal"> / {comp.totalParticipants}</span>
                      )}
                    </span>
                  ) : comp.relayTeamPlacement ? (
                    <span className="text-amber-300 font-semibold">
                      Team #{comp.relayTeamPlacement}
                    </span>
                  ) : (
                    <span className="text-neutral-600">-</span>
                  )}
                </td>

                {/* Time & Behind */}
                <td className="px-4 py-3 text-right whitespace-nowrap font-mono tabular-nums">
                  <div className="font-semibold text-neutral-200">{comp.time || '-'}</div>
                  {comp.timeBehind && (
                    <div className="text-[11px] text-neutral-500">{comp.timeBehind}</div>
                  )}
                </td>

                {/* Distance & Pace */}
                <td className="px-4 py-3 text-right whitespace-nowrap font-mono tabular-nums">
                  <div className="font-semibold text-neutral-200">
                    {comp.distanceKm ? `${comp.distanceKm} km` : '-'}
                  </div>
                  {pace && <div className="text-[11px] text-neutral-400">{pace}</div>}
                </td>

                {/* Livelox & Results Links */}
                <td className="px-4 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    {comp.liveloxUrl && (
                      <a
                        href={comp.liveloxUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1 rounded bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 text-[11px] font-semibold border border-orange-500/30 transition-colors"
                        title="Open GPS track on Livelox"
                      >
                        <Compass className="w-3 h-3" />
                        <span>Livelox</span>
                        <ArrowUpRight className="w-3 h-3 opacity-70" />
                      </a>
                    )}
                    {comp.resultUrl && (
                      <a
                        href={comp.resultUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] border border-neutral-700 transition-colors"
                        title="Open race results"
                      >
                        <span>Results</span>
                        <ExternalLink className="w-3 h-3 opacity-70" />
                      </a>
                    )}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-4 py-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onViewDetails(comp)}
                      className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800"
                      title="View Details"
                    >
                      <span className="text-xs">Details</span>
                    </button>
                    <button
                      onClick={() => onEdit(comp)}
                      className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(comp.id)}
                      className="p-1 text-neutral-400 hover:text-red-400 rounded hover:bg-neutral-800"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

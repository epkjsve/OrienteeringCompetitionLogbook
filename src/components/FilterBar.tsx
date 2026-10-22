import { Search, SlidersHorizontal, Map, LayoutList, Table, X } from 'lucide-react';
import { Discipline } from '../types/competition';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedYear: string;
  onYearChange: (year: string) => void;
  availableYears: string[];
  selectedDiscipline: string;
  onDisciplineChange: (discipline: string) => void;
  selectedPodiumFilter: string;
  onPodiumFilterChange: (val: string) => void;
  viewMode: 'split' | 'map' | 'table';
  onViewModeChange: (mode: 'split' | 'map' | 'table') => void;
  filteredCount: number;
  totalCount: number;
}

const DISCIPLINES: Discipline[] = [
  'Sprint',
  'Middle',
  'Long',
  'Ultralong',
  'Night',
  'Relay',
];

export default function FilterBar({
  searchQuery,
  onSearchChange,
  selectedYear,
  onYearChange,
  availableYears,
  selectedDiscipline,
  onDisciplineChange,
  selectedPodiumFilter,
  onPodiumFilterChange,
  viewMode,
  onViewModeChange,
  filteredCount,
  totalCount,
}: FilterBarProps) {
  const hasActiveFilters = searchQuery || selectedYear !== 'ALL' || selectedDiscipline !== 'ALL' || selectedPodiumFilter !== 'ALL';

  const resetFilters = () => {
    onSearchChange('');
    onYearChange('ALL');
    onDisciplineChange('ALL');
    onPodiumFilterChange('ALL');
  };

  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-3 bg-neutral-900/90 border-b border-neutral-800">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by event, club, terrain, location..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-8 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600 transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filters Strip */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Year Filter */}
        <select
          value={selectedYear}
          onChange={(e) => onYearChange(e.target.value)}
          className="px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-300 focus:outline-none focus:border-neutral-600"
        >
          <option value="ALL">All Seasons</option>
          {availableYears.map((yr) => (
            <option key={yr} value={yr}>
              {yr} Season
            </option>
          ))}
        </select>

        {/* Discipline Filter */}
        <select
          value={selectedDiscipline}
          onChange={(e) => onDisciplineChange(e.target.value)}
          className="px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-300 focus:outline-none focus:border-neutral-600"
        >
          <option value="ALL">All Disciplines</option>
          {DISCIPLINES.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        {/* Quick Relay Toggle Button */}
        <button
          type="button"
          onClick={() => onDisciplineChange(selectedDiscipline === 'Relay' ? 'ALL' : 'Relay')}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
            selectedDiscipline === 'Relay'
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-sm'
              : 'bg-neutral-950 text-neutral-400 hover:text-white border-neutral-800'
          }`}
          title="Show only relay competitions (Stafetter)"
        >
          <span className="w-2 h-2 rounded-full bg-rose-400" />
          <span>Relays (Stafetter)</span>
        </button>

        {/* Podium Filter */}
        <select
          value={selectedPodiumFilter}
          onChange={(e) => onPodiumFilterChange(e.target.value)}
          className="px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-300 focus:outline-none focus:border-neutral-600"
        >
          <option value="ALL">All Results</option>
          <option value="PODIUM">Podiums (Top 3)</option>
          <option value="TOP10">Top 10 Finishes</option>
          <option value="LIVELOX_ONLY">Has Livelox GPS</option>
        </select>

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="px-2.5 py-1.5 text-xs text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}

        {/* Results Counter */}
        <span className="text-xs text-neutral-500 font-mono tabular-nums px-2">
          {filteredCount} / {totalCount}
        </span>
      </div>

      {/* View Switcher Segmented Control */}
      <div className="flex items-center gap-1 p-1 bg-neutral-950 border border-neutral-800 rounded-lg shrink-0 self-start lg:self-auto">
        <button
          onClick={() => onViewModeChange('split')}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded transition-colors ${
            viewMode === 'split' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
          }`}
          title="Split Map & Cards view"
        >
          <LayoutList className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Split</span>
        </button>

        <button
          onClick={() => onViewModeChange('map')}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded transition-colors ${
            viewMode === 'map' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
          }`}
          title="Full Map View"
        >
          <Map className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Map</span>
        </button>

        <button
          onClick={() => onViewModeChange('table')}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded transition-colors ${
            viewMode === 'table' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
          }`}
          title="Logbook Table View"
        >
          <Table className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logbook</span>
        </button>
      </div>
    </div>
  );
}

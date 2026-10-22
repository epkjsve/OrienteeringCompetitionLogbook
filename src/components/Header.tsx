import { Compass, Plus, Database } from 'lucide-react';

interface HeaderProps {
  currentView: 'split' | 'map' | 'table';
  onViewChange: (view: 'split' | 'map' | 'table') => void;
  onOpenAddModal: () => void;
  onOpenDataModal: () => void;
  totalCount: number;
}

export default function Header({
  currentView,
  onViewChange,
  onOpenAddModal,
  onOpenDataModal,
  totalCount,
}: HeaderProps) {
  return (
    <header className="flex items-center justify-between gap-8 px-5 py-3.5 bg-neutral-900 border-b border-neutral-800 shrink-0">
      {/* Zone 1: Brand Wordmark & SI-Card Profile */}
      <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-md shadow-orange-950/40 border border-orange-400/40">
          <Compass className="w-4 h-4 text-white" />
        </div>
        <div>
          <a href="/" className="text-base sm:text-lg font-bold tracking-tight text-white hover:text-orange-400 transition-colors">
            Orienteering Race Log
          </a>
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
            <span className="text-neutral-300 font-semibold">Jonas Svensson</span>
            <span aria-hidden="true" className="text-neutral-600">&middot;</span>
            <span className="text-orange-400 font-mono font-medium">SI: 9050409</span>
            <span aria-hidden="true" className="text-neutral-600">&middot;</span>
            <span className="text-neutral-400">OK Orion</span>
            <span aria-hidden="true" className="text-neutral-600">&middot;</span>
            <span className="font-mono text-neutral-400">2020–2026</span>
          </div>
        </div>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-400">
        <button
          onClick={() => onViewChange('split')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
            currentView === 'split' ? 'text-white border-b-2 border-orange-500 font-semibold' : ''
          }`}
        >
          Map & Cards
        </button>
        <button
          onClick={() => onViewChange('map')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
            currentView === 'map' ? 'text-white border-b-2 border-orange-500 font-semibold' : ''
          }`}
        >
          Full Map Explorer
        </button>
        <button
          onClick={() => onViewChange('table')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
            currentView === 'table' ? 'text-white border-b-2 border-orange-500 font-semibold' : ''
          }`}
        >
          Race Logbook ({totalCount})
        </button>
      </nav>

      {/* Zone 3: Primary Action & Data tools */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={onOpenDataModal}
          className="p-2 sm:px-3 sm:py-2 text-xs font-medium text-neutral-300 bg-neutral-800/80 hover:bg-neutral-800 hover:text-white rounded-lg border border-neutral-700/80 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
          title="Backup, export or import race data"
        >
          <Database className="w-3.5 h-3.5 text-neutral-400" />
          <span className="hidden sm:inline">Backup & Data</span>
        </button>

        <button
          onClick={onOpenAddModal}
          className="px-3.5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 rounded-lg shadow-md shadow-orange-950/30 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Competition</span>
        </button>
      </div>
    </header>
  );
}

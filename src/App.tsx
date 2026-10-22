import { useState, useEffect, useMemo } from 'react';
import { Competition, MarkerStyle } from './types/competition';
import { INITIAL_COMPETITIONS } from './data/sampleCompetitions';
import Header from './components/Header';
import MapView from './components/MapView';
import CompetitionCard from './components/CompetitionCard';
import CompetitionDetailModal from './components/CompetitionDetailModal';
import CompetitionFormModal from './components/CompetitionFormModal';
import FilterBar from './components/FilterBar';
import StatsOverview from './components/StatsOverview';
import LogbookTable from './components/LogbookTable';
import ExportImportModal from './components/ExportImportModal';
import { Plus, Compass, ExternalLink, X, MapPin, Award, CheckCircle2 } from 'lucide-react';

const STORAGE_KEY = 'orienteering_competitions_si_9050409_v5';

export default function App() {
  // Load initial competitions from localStorage or fallback
  const [competitions, setCompetitions] = useState<Competition[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.error('Failed to load saved competitions:', err);
    }
    return INITIAL_COMPETITIONS;
  });

  // Save to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(competitions));
    } catch (err) {
      console.error('Failed to save competitions:', err);
    }
  }, [competitions]);

  // Selected state
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailModalComp, setDetailModalComp] = useState<Competition | null>(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingComp, setEditingComp] = useState<Competition | null>(null);
  const [dataModalOpen, setDataModalOpen] = useState(false);

  // Map settings
  const [markerStyle, setMarkerStyle] = useState<MarkerStyle>('iof-flag');
  const [isPickingLocation, setIsPickingLocation] = useState(false);
  const [pickedCoords, setPickedCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Filters & Views
  const [viewMode, setViewMode] = useState<'split' | 'map' | 'table'>('split');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [selectedDiscipline, setSelectedDiscipline] = useState('ALL');
  const [selectedPodiumFilter, setSelectedPodiumFilter] = useState('ALL');

  // Available seasons/years
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    competitions.forEach((c) => {
      if (c.date) {
        const yr = c.date.substring(0, 4);
        if (yr) years.add(yr);
      }
    });
    return Array.from(years).sort().reverse();
  }, [competitions]);

  // Filtered competitions
  const filteredCompetitions = useMemo(() => {
    return competitions.filter((comp) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = comp.name.toLowerCase().includes(q);
        const matchesClub = comp.club.toLowerCase().includes(q);
        const matchesLoc = comp.location.toLowerCase().includes(q);
        const matchesTags = comp.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchesName && !matchesClub && !matchesLoc && !matchesTags) {
          return false;
        }
      }

      // Year
      if (selectedYear !== 'ALL') {
        if (!comp.date.startsWith(selectedYear)) return false;
      }

      // Discipline
      if (selectedDiscipline !== 'ALL') {
        if (comp.discipline !== selectedDiscipline) return false;
      }

      // Podiums / Status
      if (selectedPodiumFilter === 'PODIUM') {
        if (!comp.placement || comp.placement > 3) return false;
      } else if (selectedPodiumFilter === 'TOP10') {
        if (!comp.placement || comp.placement > 10) return false;
      } else if (selectedPodiumFilter === 'LIVELOX_ONLY') {
        if (!comp.liveloxUrl) return false;
      }

      return true;
    });
  }, [competitions, searchQuery, selectedYear, selectedDiscipline, selectedPodiumFilter]);

  // Find currently selected competition
  const selectedCompetition = useMemo(() => {
    return competitions.find((c) => c.id === selectedId) || null;
  }, [competitions, selectedId]);

  // Handlers
  const handleSaveCompetition = (compData: Competition) => {
    setCompetitions((prev) => {
      const idx = prev.findIndex((c) => c.id === compData.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = compData;
        return updated;
      } else {
        return [compData, ...prev];
      }
    });
    setSelectedId(compData.id);
    setPickedCoords(null);
  };

  const handleDeleteCompetition = (id: string) => {
    if (window.confirm('Are you sure you want to delete this competition?')) {
      setCompetitions((prev) => prev.filter((c) => c.id !== id));
      if (selectedId === id) setSelectedId(null);
    }
  };

  const handleStartPickOnMap = (currentLat?: number, currentLng?: number) => {
    setFormModalOpen(false);
    setIsPickingLocation(true);
    if (currentLat && currentLng) {
      setPickedCoords({ lat: currentLat, lng: currentLng });
    }
  };

  const handleLocationPicked = (lat: number, lng: number) => {
    setPickedCoords({ lat, lng });
    setIsPickingLocation(false);
    setFormModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingComp(null);
    setPickedCoords(null);
    setFormModalOpen(true);
  };

  const handleOpenEdit = (comp: Competition) => {
    setEditingComp(comp);
    setPickedCoords({ lat: comp.lat, lng: comp.lng });
    setFormModalOpen(true);
  };

  const handleResetToSample = () => {
    setCompetitions(INITIAL_COMPETITIONS);
    setSelectedId(null);
  };

  const handleImportCompetitions = (imported: Competition[]) => {
    setCompetitions(imported);
    setSelectedId(null);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-neutral-950 text-neutral-100 font-sans">
      {/* 1. Header (Adheres to Top Bar Contract) */}
      <Header
        currentView={viewMode}
        onViewChange={(v) => setViewMode(v)}
        onOpenAddModal={handleOpenAdd}
        onOpenDataModal={() => setDataModalOpen(true)}
        totalCount={competitions.length}
      />

      {/* Runner Profile & SI-Card Status Bar */}
      <div className="px-5 py-2 bg-neutral-900/60 border-b border-neutral-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-orange-500" />
          <span className="text-neutral-400">SI-Card:</span>
          <span className="text-orange-400 font-mono font-bold">9050409</span>
          <span aria-hidden="true" className="text-neutral-600">&middot;</span>
          <span className="text-neutral-200 font-semibold">Jonas Svensson</span>
          <span aria-hidden="true" className="text-neutral-600">&middot;</span>
          <span className="text-neutral-300">OK Orion</span>
          <span aria-hidden="true" className="text-neutral-600">&middot;</span>
          <span className="text-neutral-400 font-mono">2020–2026</span>
          <span aria-hidden="true" className="text-neutral-600">&middot;</span>
          <button
            onClick={() => setSelectedDiscipline(selectedDiscipline === 'Relay' ? 'ALL' : 'Relay')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
              selectedDiscipline === 'Relay'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'bg-rose-950/40 text-rose-400 hover:bg-rose-900/50 border border-rose-800/50'
            }`}
          >
            {competitions.filter((c) => c.discipline === 'Relay').length} Relay Competitions
          </button>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://eventor.orientering.se"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>eventor.orientering.se</span>
            <ExternalLink className="w-3 h-3 text-neutral-500" />
          </a>
          <button
            onClick={handleResetToSample}
            className="text-[11px] text-orange-400 hover:text-orange-300 transition-colors"
            title="Reload all 2020–2026 competitions including all relays"
          >
            Reload All 2020–2026 Races
          </button>
        </div>
      </div>

      {/* 2. Season Statistics Strip */}
      <StatsOverview competitions={filteredCompetitions} />

      {/* 3. Filters & Mode Control */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        availableYears={availableYears}
        selectedDiscipline={selectedDiscipline}
        onDisciplineChange={setSelectedDiscipline}
        selectedPodiumFilter={selectedPodiumFilter}
        onPodiumFilterChange={setSelectedPodiumFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        filteredCount={filteredCompetitions.length}
        totalCount={competitions.length}
      />

      {/* 4. Main Content Area */}
      <main className="flex-1 min-h-0 relative overflow-hidden">
        {/* VIEW A: Split Map & Cards */}
        {viewMode === 'split' && (
          <div className="h-full flex flex-col lg:flex-row overflow-hidden">
            {/* Map Area */}
            <div className="flex-1 h-[45%] lg:h-full relative p-2 lg:p-3">
              <MapView
                competitions={filteredCompetitions}
                selectedId={selectedId}
                onSelectCompetition={(comp) => setSelectedId(comp.id)}
                onViewDetails={(comp) => setDetailModalComp(comp)}
                isPickingLocation={isPickingLocation}
                pickedLocation={pickedCoords}
                onLocationPicked={handleLocationPicked}
                markerStyle={markerStyle}
                onMarkerStyleChange={setMarkerStyle}
              />
            </div>

            {/* Sidebar Cards Area */}
            <div className="w-full lg:w-[460px] xl:w-[500px] h-[55%] lg:h-full border-t lg:border-t-0 lg:border-l border-neutral-800 bg-neutral-900/40 flex flex-col overflow-hidden">
              <div className="p-3 border-b border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400 bg-neutral-900/60">
                <span className="font-semibold text-neutral-200">
                  {filteredCompetitions.length} competitions listed
                </span>
                <span className="text-[11px] font-mono text-neutral-500">
                  Click a card to highlight on map
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {filteredCompetitions.length === 0 ? (
                  <div className="p-8 text-center text-neutral-500 flex flex-col items-center justify-center">
                    <Compass className="w-8 h-8 text-neutral-600 mb-2" />
                    <p className="text-sm font-medium text-neutral-400">No competitions found</p>
                    <p className="text-xs text-neutral-500 mt-1">
                      Try clearing your search filters or add a new competition.
                    </p>
                    <button
                      onClick={handleOpenAdd}
                      className="mt-4 px-3 py-1.5 text-xs font-semibold text-orange-400 border border-orange-500/40 rounded-lg hover:bg-orange-500/10 transition-colors"
                    >
                      + Add First Competition
                    </button>
                  </div>
                ) : (
                  filteredCompetitions.map((comp) => (
                    <CompetitionCard
                      key={comp.id}
                      competition={comp}
                      isSelected={selectedId === comp.id}
                      onSelect={(c) => setSelectedId(c.id)}
                      onViewDetails={(c) => setDetailModalComp(c)}
                      onEdit={(c) => handleOpenEdit(c)}
                      onDelete={(id) => handleDeleteCompetition(id)}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW B: Full Map Explorer */}
        {viewMode === 'map' && (
          <div className="w-full h-full relative p-2">
            <MapView
              competitions={filteredCompetitions}
              selectedId={selectedId}
              onSelectCompetition={(comp) => setSelectedId(comp.id)}
              onViewDetails={(comp) => setDetailModalComp(comp)}
              isPickingLocation={isPickingLocation}
              pickedLocation={pickedCoords}
              onLocationPicked={handleLocationPicked}
              markerStyle={markerStyle}
              onMarkerStyleChange={setMarkerStyle}
            />

            {/* Floating Selection Card when a competition is active */}
            {selectedCompetition && (
              <div className="absolute bottom-5 right-5 z-[1000] w-80 sm:w-96 shadow-2xl animate-in slide-in-from-bottom-3 duration-200">
                <div className="relative bg-neutral-900/95 border border-neutral-700/80 rounded-xl p-4 backdrop-blur-md">
                  <button
                    onClick={() => setSelectedId(null)}
                    className="absolute top-2.5 right-2.5 p-1 text-neutral-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
                    <span className="font-semibold text-orange-400">{selectedCompetition.discipline}</span>
                    <span>&middot;</span>
                    <span>{selectedCompetition.competitionClass}</span>
                    <span>&middot;</span>
                    <span className="font-mono">{selectedCompetition.date}</span>
                  </div>

                  <h4 className="text-sm font-bold text-white mb-1 pr-6 leading-snug">
                    {selectedCompetition.name}
                  </h4>

                  <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-3">
                    <MapPin className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                    <span>{selectedCompetition.location}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedCompetition.liveloxUrl && (
                      <a
                        href={selectedCompetition.liveloxUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-1.5 px-3 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                      >
                        <Compass className="w-3.5 h-3.5" />
                        <span>Livelox GPS</span>
                        <span className="text-[10px] opacity-80">↗</span>
                      </a>
                    )}
                    {selectedCompetition.resultUrl && (
                      <a
                        href={selectedCompetition.resultUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-1.5 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium text-xs flex items-center justify-center gap-1.5 border border-neutral-700 transition-colors"
                      >
                        <span>Results</span>
                        <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW C: Full Logbook Table */}
        {viewMode === 'table' && (
          <div className="w-full h-full overflow-y-auto p-4">
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 overflow-hidden shadow-lg">
              <LogbookTable
                competitions={filteredCompetitions}
                onSelectCompetition={(comp) => {
                  setSelectedId(comp.id);
                  setViewMode('split');
                }}
                onViewDetails={(comp) => setDetailModalComp(comp)}
                onEdit={(comp) => handleOpenEdit(comp)}
                onDelete={(id) => handleDeleteCompetition(id)}
              />
            </div>
          </div>
        )}
      </main>

      {/* Detail Modal */}
      <CompetitionDetailModal
        competition={detailModalComp}
        onClose={() => setDetailModalComp(null)}
        onEdit={(comp) => handleOpenEdit(comp)}
        onPanToMap={(comp) => {
          setSelectedId(comp.id);
          setViewMode('split');
        }}
      />

      {/* Add / Edit Form Modal */}
      <CompetitionFormModal
        isOpen={formModalOpen}
        competitionToEdit={editingComp}
        onClose={() => {
          setFormModalOpen(false);
          setEditingComp(null);
        }}
        onSave={handleSaveCompetition}
        onStartPickOnMap={handleStartPickOnMap}
        pickedCoords={pickedCoords}
      />

      {/* Export / Import Modal */}
      <ExportImportModal
        isOpen={dataModalOpen}
        onClose={() => setDataModalOpen(false)}
        competitions={competitions}
        onImport={handleImportCompetitions}
        onResetToSample={handleResetToSample}
      />
    </div>
  );
}

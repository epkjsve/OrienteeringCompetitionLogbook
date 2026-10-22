import { useState, useEffect } from 'react';
import { Competition, Discipline } from '../types/competition';
import { geocodeLocation } from '../utils/helpers';
import { X, MapPin, Search, Crosshair, Loader2, Sparkles } from 'lucide-react';

interface CompetitionFormModalProps {
  isOpen: boolean;
  competitionToEdit: Competition | null;
  onClose: () => void;
  onSave: (competition: Competition) => void;
  onStartPickOnMap: (currentLat?: number, currentLng?: number) => void;
  pickedCoords?: { lat: number; lng: number } | null;
}

const DISCIPLINES: Discipline[] = [
  'Sprint',
  'Middle',
  'Long',
  'Ultralong',
  'Night',
  'Relay',
  'TrailO',
];

export default function CompetitionFormModal({
  isOpen,
  competitionToEdit,
  onClose,
  onSave,
  onStartPickOnMap,
  pickedCoords,
}: CompetitionFormModalProps) {
  const [name, setName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [discipline, setDiscipline] = useState<Discipline>('Middle');
  const [competitionClass, setCompetitionClass] = useState('H21');
  const [club, setClub] = useState('');
  const [location, setLocation] = useState('');
  const [country, setCountry] = useState('Sweden');
  const [siCardNumber, setSiCardNumber] = useState('9050409');
  const [relayTeam, setRelayTeam] = useState('OK Orion 1');
  const [relayLeg, setRelayLeg] = useState('');
  const [relayTeamPlacement, setRelayTeamPlacement] = useState('');
  const [lat, setLat] = useState<string>('56.2480');
  const [lng, setLng] = useState<string>('15.6320');
  const [resultUrl, setResultUrl] = useState('');
  const [liveloxUrl, setLiveloxUrl] = useState('');
  const [winsplitsUrl, setWinsplitsUrl] = useState('');
  const [placement, setPlacement] = useState<string>('');
  const [totalParticipants, setTotalParticipants] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [winnerTime, setWinnerTime] = useState<string>('');
  const [distanceKm, setDistanceKm] = useState<string>('');
  const [climbM, setClimbM] = useState<string>('');
  const [controlsCount, setControlsCount] = useState<string>('');
  const [mapScale, setMapScale] = useState('1:10 000');
  const [contourInterval, setContourInterval] = useState('5m');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');

  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeMsg, setGeocodeMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync state with edit target or picked coordinates
  useEffect(() => {
    if (competitionToEdit) {
      setName(competitionToEdit.name);
      setDate(competitionToEdit.date);
      setDiscipline(competitionToEdit.discipline);
      setCompetitionClass(competitionToEdit.competitionClass || '');
      setClub(competitionToEdit.club || '');
      setLocation(competitionToEdit.location || '');
      setCountry(competitionToEdit.country || 'Sweden');
      setLat(competitionToEdit.lat.toString());
      setLng(competitionToEdit.lng.toString());
      setResultUrl(competitionToEdit.resultUrl || '');
      setLiveloxUrl(competitionToEdit.liveloxUrl || '');
      setWinsplitsUrl(competitionToEdit.winsplitsUrl || '');
      setPlacement(competitionToEdit.placement?.toString() || '');
      setTotalParticipants(competitionToEdit.totalParticipants?.toString() || '');
      setTime(competitionToEdit.time || '');
      setWinnerTime(competitionToEdit.winnerTime || '');
      setDistanceKm(competitionToEdit.distanceKm?.toString() || '');
      setClimbM(competitionToEdit.climbM?.toString() || '');
      setControlsCount(competitionToEdit.controlsCount?.toString() || '');
      setMapScale(competitionToEdit.mapScale || '1:10 000');
      setContourInterval(competitionToEdit.contourInterval || '5m');
      setNotes(competitionToEdit.notes || '');
      setTags(competitionToEdit.tags?.join(', ') || '');
      setRelayTeam(competitionToEdit.relayTeam || 'OK Orion 1');
      setRelayLeg(competitionToEdit.relayLeg?.toString() || '');
      setRelayTeamPlacement(competitionToEdit.relayTeamPlacement?.toString() || '');
    } else {
      // Defaults for new entry
      setName('');
      setDate(new Date().toISOString().split('T')[0]);
      setDiscipline('Middle');
      setCompetitionClass('H50');
      setClub('OK Orion');
      setLocation('');
      setCountry('Sweden');
      setSiCardNumber('9050409');
      setRelayTeam('OK Orion 1');
      setRelayLeg('');
      setRelayTeamPlacement('');
      setLat('56.2480');
      setLng('15.6320');
      setResultUrl('');
      setLiveloxUrl('');
      setWinsplitsUrl('');
      setPlacement('');
      setTotalParticipants('');
      setTime('');
      setWinnerTime('');
      setDistanceKm('');
      setClimbM('');
      setControlsCount('');
      setMapScale('1:10 000');
      setContourInterval('5m');
      setNotes('');
      setTags('');
    }
  }, [competitionToEdit, isOpen]);

  // If user picked on map
  useEffect(() => {
    if (pickedCoords) {
      setLat(pickedCoords.lat.toFixed(5));
      setLng(pickedCoords.lng.toFixed(5));
    }
  }, [pickedCoords]);

  if (!isOpen) return null;

  const handleGeocodeSearch = async () => {
    const query = location ? `${location}, ${country}` : country;
    if (!query) return;
    setIsGeocoding(true);
    setGeocodeMsg(null);
    try {
      const result = await geocodeLocation(query);
      if (result) {
        setLat(result.lat.toFixed(5));
        setLng(result.lng.toFixed(5));
        setGeocodeMsg(`Found: ${result.displayName.split(',').slice(0, 3).join(',')}`);
      } else {
        setGeocodeMsg('Location not found. Please try adding city/country or click "Pick on Map".');
      }
    } catch {
      setGeocodeMsg('Error looking up location coordinates.');
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);

    if (!name.trim()) {
      setErrorMsg('Please enter a competition name.');
      return;
    }
    if (isNaN(parsedLat) || isNaN(parsedLng)) {
      setErrorMsg('Please enter valid numerical latitude and longitude coordinates.');
      return;
    }
    if (parsedLat < -90 || parsedLat > 90 || parsedLng < -180 || parsedLng > 180) {
      setErrorMsg('Coordinates out of range (-90 to 90 lat, -180 to 180 lng).');
      return;
    }

    const tagsArray = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const competitionData: Competition = {
      id: competitionToEdit ? competitionToEdit.id : `comp-${Date.now()}`,
      name: name.trim(),
      date,
      lat: parsedLat,
      lng: parsedLng,
      location: location.trim() || 'Forest / Arena',
      country: country.trim() || 'Sweden',
      club: club.trim() || 'OK Orion',
      discipline,
      competitionClass: competitionClass.trim() || 'H50',
      siCardNumber: siCardNumber.trim() || '9050409',
      resultUrl: resultUrl.trim() || undefined,
      liveloxUrl: liveloxUrl.trim() || undefined,
      winsplitsUrl: winsplitsUrl.trim() || undefined,
      placement: placement ? parseInt(placement, 10) : undefined,
      totalParticipants: totalParticipants ? parseInt(totalParticipants, 10) : undefined,
      time: time.trim() || undefined,
      winnerTime: winnerTime.trim() || undefined,
      distanceKm: distanceKm ? parseFloat(distanceKm) : undefined,
      climbM: climbM ? parseInt(climbM, 10) : undefined,
      controlsCount: controlsCount ? parseInt(controlsCount, 10) : undefined,
      mapScale: mapScale.trim() || undefined,
      contourInterval: contourInterval.trim() || undefined,
      notes: notes.trim() || undefined,
      tags: tagsArray.length > 0 ? tagsArray : undefined,
      relayTeam: discipline === 'Relay' ? (relayTeam.trim() || 'OK Orion 1') : undefined,
      relayLeg: discipline === 'Relay' ? (relayLeg.trim() || undefined) : undefined,
      relayTeamPlacement: discipline === 'Relay' && relayTeamPlacement ? parseInt(relayTeamPlacement, 10) : undefined,
    };

    onSave(competitionData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <div>
            <h2 className="text-lg font-bold text-white">
              {competitionToEdit ? 'Edit Orienteering Competition' : 'Add Orienteering Competition'}
            </h2>
            <p className="text-xs text-neutral-400">
              Save race results, GPS routes from Livelox, and coordinates on the map.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="p-3 bg-red-950/70 border border-red-800 text-red-200 text-xs rounded-lg">
              {errorMsg}
            </div>
          )}

          {/* Section 1: Basic Event Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono">
              Event Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Competition Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. O-Ringen Stage 2, Tiomila, District Championship"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-sm text-white focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Discipline
                </label>
                <select
                  value={discipline}
                  onChange={(e) => setDiscipline(e.target.value as Discipline)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-sm text-white focus:outline-none focus:border-orange-500"
                >
                  {DISCIPLINES.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Class
                </label>
                <input
                  type="text"
                  placeholder="e.g. H50, H55, Orange 4,0"
                  value={competitionClass}
                  onChange={(e) => setCompetitionClass(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Organizing Club
                </label>
                <input
                  type="text"
                  placeholder="e.g. OK Orion"
                  value={club}
                  onChange={(e) => setClub(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  SportIdent (SI-Card)
                </label>
                <input
                  type="text"
                  placeholder="9050409"
                  value={siCardNumber}
                  onChange={(e) => setSiCardNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-sm text-orange-400 font-mono focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {discipline === 'Relay' && (
              <div className="p-3 bg-rose-950/20 border border-rose-900/40 rounded-xl space-y-3">
                <div className="text-xs font-bold text-rose-400 uppercase tracking-wider font-mono">
                  Relay Specifics (Stafett)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Team Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. OK Orion 1, OK Orion H150"
                      value={relayTeam}
                      onChange={(e) => setRelayTeam(e.target.value)}
                      className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Your Leg
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Leg 5, Leg 2, Sträcka 1"
                      value={relayLeg}
                      onChange={(e) => setRelayLeg(e.target.value)}
                      className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Team Finish Place
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 21"
                      value={relayTeamPlacement}
                      onChange={(e) => setRelayTeamPlacement(e.target.value)}
                      className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded-lg text-xs text-amber-400 placeholder-neutral-500 focus:outline-none focus:border-rose-500 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Map Coordinates & Location */}
          <div className="space-y-3 pt-2 border-t border-neutral-800">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono">
                Map Placement (Latitude & Longitude)
              </h3>
              <button
                type="button"
                onClick={() => onStartPickOnMap(parseFloat(lat) || undefined, parseFloat(lng) || undefined)}
                className="text-xs text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>Pick directly on map</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Location / Arena / Forest Name
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Hellasgården, Ånnaboda, Lunsen"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="flex-1 px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500"
                  />
                  <button
                    type="button"
                    onClick={handleGeocodeSearch}
                    disabled={isGeocoding || !location}
                    className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-neutral-200 text-xs font-medium rounded-lg border border-neutral-700 flex items-center gap-1 shrink-0"
                    title="Lookup coordinates for this location"
                  >
                    {isGeocoding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                    <span>Find</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  placeholder="Sweden, Norway, Finland, Switzerland..."
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {geocodeMsg && (
              <div className="text-xs text-orange-300 font-medium px-2 py-1 bg-orange-950/40 rounded border border-orange-900">
                {geocodeMsg}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Latitude *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="e.g. 59.3293"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-sm text-white focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Longitude *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="e.g. 18.0686"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-sm text-white focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Links (Livelox & Results) */}
          <div className="space-y-4 pt-2 border-t border-neutral-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono">
              Results & GPS Links
            </h3>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Livelox URL (GPS Routes & Map)
              </label>
              <input
                type="url"
                placeholder="https://www.livelox.com/Events/Show/12345"
                value={liveloxUrl}
                onChange={(e) => setLiveloxUrl(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 font-mono text-xs"
              />
              <p className="text-[11px] text-neutral-500 mt-1">
                Direct link to view user GPS tracks, route choice analysis, and course replay on livelox.com.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Results URL (Eventor / Club Website)
                </label>
                <input
                  type="url"
                  placeholder="https://eventor.orientering.se/Events/Show/..."
                  value={resultUrl}
                  onChange={(e) => setResultUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Winsplits URL (Split Times)
                </label>
                <input
                  type="url"
                  placeholder="http://obasen.orientering.se/winsplits/..."
                  value={winsplitsUrl}
                  onChange={(e) => setWinsplitsUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Performance & Results */}
          <div className="space-y-4 pt-2 border-t border-neutral-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono">
              Race Performance
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Your Placement
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 4"
                  value={placement}
                  onChange={(e) => setPlacement(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-sm text-white focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Total Runners
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 52"
                  value={totalParticipants}
                  onChange={(e) => setTotalParticipants(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-sm text-white focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Your Time
                </label>
                <input
                  type="text"
                  placeholder="e.g. 36:45"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-sm text-white focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Winner Time
                </label>
                <input
                  type="text"
                  placeholder="e.g. 34:10"
                  value={winnerTime}
                  onChange={(e) => setWinnerTime(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-sm text-white focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Distance (km)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 6.4"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-sm text-white focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Elevation Climb (m)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 210"
                  value={climbM}
                  onChange={(e) => setClimbM(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-sm text-white focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Controls Count
                </label>
                <input
                  type="number"
                  placeholder="e.g. 19"
                  value={controlsCount}
                  onChange={(e) => setControlsCount(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-sm text-white focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Course & Notes */}
          <div className="space-y-4 pt-2 border-t border-neutral-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono">
              Course Analysis & Terrain Notes
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Map Scale
                </label>
                <input
                  type="text"
                  placeholder="1:10 000, 1:4 000, 1:15 000"
                  value={mapScale}
                  onChange={(e) => setMapScale(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-sm text-white focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Contour Interval
                </label>
                <input
                  type="text"
                  placeholder="5m, 2.5m"
                  value={contourInterval}
                  onChange={(e) => setContourInterval(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-sm text-white focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Route Review & Terrain Notes
              </label>
              <textarea
                rows={3}
                placeholder="Tactical decisions, mistakes or missed controls, terrain character (e.g., stony pine ridge, dense marsh, urban stairs)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                placeholder="e.g. Pine forest, Boulder field, Championship, Clean race"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-4 border-t border-neutral-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-semibold rounded-lg shadow-md transition-all"
            >
              {competitionToEdit ? 'Save Changes' : 'Add to Map & Logbook'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

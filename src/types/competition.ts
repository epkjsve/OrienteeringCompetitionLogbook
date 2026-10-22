export type Discipline = 
  | 'Sprint'
  | 'Middle'
  | 'Long'
  | 'Ultralong'
  | 'Night'
  | 'Relay'
  | 'TrailO';

export interface Competition {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  lat: number;
  lng: number;
  location: string;
  country: string;
  club: string;
  discipline: Discipline;
  competitionClass: string;
  siCardNumber?: string;
  resultUrl?: string;
  liveloxUrl?: string;
  winsplitsUrl?: string;
  eventorUrl?: string;
  placement?: number;
  totalParticipants?: number;
  time?: string; // e.g. "36:45"
  winnerTime?: string;
  timeBehind?: string;
  distanceKm?: number;
  climbM?: number;
  controlsCount?: number;
  mapScale?: string;
  contourInterval?: string;
  notes?: string;
  tags?: string[];
  status?: 'completed' | 'registered';
  relayLeg?: string | number;
  relayTeam?: string;
  relayTeamPlacement?: number;
}

export type MapTileLayer = 'opentopo' | 'osm' | 'satellite' | 'dark';

export type MarkerStyle = 'iof-flag' | 'control-circle' | 'discipline-badge';

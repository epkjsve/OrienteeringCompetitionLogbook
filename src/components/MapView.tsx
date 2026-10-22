import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Competition, MapTileLayer, MarkerStyle } from '../types/competition';
import { formatPace, getDisciplineColor } from '../utils/helpers';
import { Layers, MapPin, Navigation, Eye, ExternalLink, Compass } from 'lucide-react';

interface MapViewProps {
  competitions: Competition[];
  selectedId: string | null;
  onSelectCompetition: (comp: Competition) => void;
  onViewDetails: (comp: Competition) => void;
  isPickingLocation?: boolean;
  pickedLocation?: { lat: number; lng: number } | null;
  onLocationPicked?: (lat: number, lng: number) => void;
  markerStyle?: MarkerStyle;
  onMarkerStyleChange?: (style: MarkerStyle) => void;
}

const TILE_PROVIDERS: Record<MapTileLayer, { name: string; url: string; attribution: string; maxZoom: number }> = {
  opentopo: {
    name: 'OpenTopo (Contour / Terrain)',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)',
    maxZoom: 17,
  },
  osm: {
    name: 'OpenStreetMap (Standard)',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
  },
  satellite: {
    name: 'Satellite (Aerial Imagery)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 18,
  },
  dark: {
    name: 'CartoDB Dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    maxZoom: 19,
  },
};

export default function MapView({
  competitions,
  selectedId,
  onSelectCompetition,
  onViewDetails,
  isPickingLocation = false,
  pickedLocation = null,
  onLocationPicked,
  markerStyle = 'iof-flag',
  onMarkerStyleChange,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const pickMarkerRef = useRef<L.Marker | null>(null);
  const [activeTile, setActiveTile] = useState<MapTileLayer>('opentopo');
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Centered around Scandinavia / Northern Europe by default
    const map = L.map(containerRef.current, {
      center: [59.3293, 16.5],
      zoom: 6,
      zoomControl: false,
    });

    // Add custom zoom control in top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Initial tile layer
    const tileConfig = TILE_PROVIDERS[activeTile];
    const tileLayer = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: tileConfig.maxZoom,
      subdomains: 'abc',
    }).addTo(map);

    tileLayerRef.current = tileLayer;
    markersGroupRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update tile layer
  useEffect(() => {
    if (!mapRef.current) return;
    if (tileLayerRef.current) {
      mapRef.current.removeLayer(tileLayerRef.current);
    }
    const tileConfig = TILE_PROVIDERS[activeTile];
    const newTileLayer = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: tileConfig.maxZoom,
      subdomains: 'abc',
    }).addTo(mapRef.current);
    tileLayerRef.current = newTileLayer;
  }, [activeTile]);

  // Handle map click for location picking
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (isPickingLocation && onLocationPicked) {
        onLocationPicked(e.latlng.lat, e.latlng.lng);
      }
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [isPickingLocation, onLocationPicked]);

  // Update Picked Location Pin
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (pickMarkerRef.current) {
      map.removeLayer(pickMarkerRef.current);
      pickMarkerRef.current = null;
    }

    if (pickedLocation) {
      const pickIcon = L.divIcon({
        className: 'custom-pick-icon',
        html: `
          <div style="
            width: 28px;
            height: 28px;
            background: #ef4444;
            border: 3px solid #ffffff;
            border-radius: 50%;
            box-shadow: 0 0 0 6px rgba(239, 68, 68, 0.35);
            display: flex;
            align-items: center;
            justify-content: center;
            animation: bounce 1s infinite alternate;
          ">
            <div style="width: 8px; height: 8px; background: #ffffff; border-radius: 50%;"></div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([pickedLocation.lat, pickedLocation.lng], {
        icon: pickIcon,
        zIndexOffset: 2000,
      }).addTo(map);

      pickMarkerRef.current = marker;
      map.panTo([pickedLocation.lat, pickedLocation.lng], { animate: true });
    }
  }, [pickedLocation]);

  // Render Competition Markers
  useEffect(() => {
    const map = mapRef.current;
    const group = markersGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    if (competitions.length === 0) return;

    const bounds = L.latLngBounds([]);

    competitions.forEach((comp) => {
      bounds.extend([comp.lat, comp.lng]);

      const isSelected = selectedId === comp.id;
      const rankText = comp.placement ? `#${comp.placement}` : '';

      let markerHtml = '';
      let iconSize: [number, number] = [32, 32];
      let iconAnchor: [number, number] = [16, 16];

      if (markerStyle === 'iof-flag') {
        const isRelay = comp.discipline === 'Relay';
        markerHtml = `
          <div class="iof-flag-marker ${isSelected ? 'scale-125 ring-2 ring-orange-400 ring-offset-2 ring-offset-neutral-900 rounded' : ''}">
            <div class="iof-flag-box ${isRelay ? 'ring-2 ring-rose-500' : ''}">
              ${rankText ? `<span class="iof-flag-label">${rankText}</span>` : ''}
              ${isRelay ? `<span style="position: absolute; top: -5px; left: -5px; background: #e11d48; color: white; font-size: 8px; font-weight: 800; padding: 1px 3px; border-radius: 3px; border: 1px solid white; line-height: 1;">RELAY</span>` : ''}
            </div>
          </div>
        `;
        iconSize = [32, 32];
        iconAnchor = [16, 16];
      } else if (markerStyle === 'control-circle') {
        const isRelay = comp.discipline === 'Relay';
        markerHtml = `
          <div class="iof-circle-marker ${isRelay ? 'border-rose-500 text-rose-300' : ''} ${isSelected ? 'scale-125 border-amber-300 ring-2 ring-amber-300 ring-offset-2 ring-offset-neutral-900' : ''}">
            <span>${isRelay ? 'R' : (comp.placement || 'O')}</span>
          </div>
        `;
        iconSize = [34, 34];
        iconAnchor = [17, 17];
      } else {
        // Discipline badge
        const badgeColor = comp.discipline === 'Relay' ? '#f43f5e' : comp.discipline === 'Sprint' ? '#f59e0b' : comp.discipline === 'Middle' ? '#10b981' : comp.discipline === 'Long' ? '#3b82f6' : '#ec4899';
        markerHtml = `
          <div style="
            background: ${badgeColor};
            color: #ffffff;
            font-size: 11px;
            font-weight: 700;
            padding: 3px 8px;
            border-radius: 9999px;
            border: 2px solid #ffffff;
            box-shadow: 0 4px 10px rgba(0,0,0,0.5);
            white-space: nowrap;
            transform: translate(-50%, -50%);
          ">
            ${comp.discipline} ${rankText}
          </div>
        `;
        iconSize = [40, 24];
        iconAnchor = [20, 12];
      }

      const customIcon = L.divIcon({
        className: 'competition-map-marker',
        html: markerHtml,
        iconSize,
        iconAnchor,
      });

      const marker = L.marker([comp.lat, comp.lng], {
        icon: customIcon,
        zIndexOffset: isSelected ? 1500 : 100,
      });

      // Build rich popup content
      const pace = formatPace(comp.time, comp.distanceKm);
      const discColor = getDisciplineColor(comp.discipline);

      const popupHtml = `
        <div class="p-3.5 max-w-[280px] sm:max-w-[320px] text-neutral-100">
          <div class="flex items-center justify-between gap-2 mb-1.5">
            <span class="text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded ${discColor.bg} ${discColor.text} border ${discColor.border}">
              ${comp.discipline} &middot; ${comp.competitionClass || 'Open'}
            </span>
            <span class="text-xs text-neutral-400 font-mono">
              ${comp.date}
            </span>
          </div>
          
          <h3 class="text-sm font-bold text-white leading-snug mb-1">
            ${comp.name}
          </h3>

          ${comp.discipline === 'Relay' ? `
            <div class="text-[11px] font-medium text-rose-400 bg-rose-950/40 border border-rose-900/50 rounded px-2 py-1 mb-1.5 flex items-center justify-between">
              <span>Relay: <strong class="text-white">${comp.relayTeam || comp.club}</strong></span>
              ${comp.relayLeg ? `<span class="font-mono text-orange-300 font-bold">${comp.relayLeg}</span>` : ''}
              ${comp.relayTeamPlacement ? `<span class="font-mono text-amber-300 font-bold">Team #${comp.relayTeamPlacement}</span>` : ''}
            </div>
          ` : ''}
          
          <p class="text-xs text-neutral-400 mb-2 flex items-center gap-1">
            <span class="text-orange-400 font-semibold">${comp.location}</span>
            <span>&middot;</span>
            <span>${comp.club}</span>
          </p>

          <div class="grid grid-cols-3 gap-1.5 bg-neutral-900/90 rounded-lg p-2 border border-neutral-800 mb-3 text-center">
            <div>
              <div class="text-[10px] text-neutral-500 uppercase font-mono">Place</div>
              <div class="text-xs font-bold text-amber-400 font-mono">
                ${comp.placement ? `${comp.placement} / ${comp.totalParticipants || '-'}` : '-'}
              </div>
            </div>
            <div>
              <div class="text-[10px] text-neutral-500 uppercase font-mono">Time</div>
              <div class="text-xs font-bold text-neutral-200 font-mono">
                ${comp.time || '-'}
              </div>
            </div>
            <div>
              <div class="text-[10px] text-neutral-500 uppercase font-mono">Distance</div>
              <div class="text-xs font-bold text-neutral-200 font-mono">
                ${comp.distanceKm ? `${comp.distanceKm} km` : '-'}
              </div>
            </div>
          </div>

          ${pace ? `
            <div class="text-[11px] text-neutral-400 mb-3 flex items-center justify-between border-b border-neutral-800 pb-2">
              <span class="text-neutral-500">Pace:</span>
              <span class="font-mono text-neutral-300 font-medium">${pace}</span>
            </div>
          ` : ''}

          <div class="flex flex-col gap-1.5 pt-1">
            ${comp.liveloxUrl ? `
              <a href="${comp.liveloxUrl}" target="_blank" rel="noopener noreferrer" 
                 class="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-medium text-xs shadow-sm transition-all">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <span>GPS & Map on Livelox</span>
                <span class="text-[10px] opacity-75">↗</span>
              </a>
            ` : ''}

            ${comp.resultUrl ? `
              <a href="${comp.resultUrl}" target="_blank" rel="noopener noreferrer" 
                 class="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium text-xs border border-neutral-700 transition-colors">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
                <span>Results & Splits</span>
                <span class="text-[10px] opacity-75">↗</span>
              </a>
            ` : ''}

            <button id="btn-details-${comp.id}" 
                    class="w-full inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-md bg-neutral-800/60 hover:bg-neutral-800 text-neutral-300 font-medium text-xs border border-neutral-700/60 transition-colors mt-0.5">
              <span>View Race Log & Analysis</span>
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        maxWidth: 320,
        className: 'competition-popup',
      });

      marker.on('click', () => {
        onSelectCompetition(comp);
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-details-${comp.id}`);
        if (btn) {
          btn.onclick = (e) => {
            e.stopPropagation();
            onViewDetails(comp);
          };
        }
      });

      group.addLayer(marker);
    });

    // Auto fit bounds on initial load if we have valid bounds
    if (bounds.isValid() && !selectedId) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [competitions, markerStyle, selectedId]);

  // When selectedId changes, pan to that competition
  useEffect(() => {
    if (!mapRef.current || !selectedId) return;
    const targetComp = competitions.find((c) => c.id === selectedId);
    if (targetComp) {
      mapRef.current.setView([targetComp.lat, targetComp.lng], Math.max(mapRef.current.getZoom(), 11), {
        animate: true,
      });
    }
  }, [selectedId, competitions]);

  const fitAll = () => {
    if (!mapRef.current || competitions.length === 0) return;
    const bounds = L.latLngBounds(competitions.map((c) => [c.lat, c.lng]));
    if (bounds.isValid()) {
      mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[400px] overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 shadow-inner">
      {/* Leaflet Container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Picking Location Banner */}
      {isPickingLocation && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-orange-600/95 text-white px-4 py-2.5 rounded-lg shadow-2xl border border-orange-400 flex items-center gap-3 backdrop-blur-md animate-pulse">
          <MapPin className="w-5 h-5 text-amber-200 shrink-0" />
          <div className="text-xs">
            <span className="font-bold">Pick coordinates on map:</span> Click any location in the forest or arena to set coordinates.
          </div>
          {pickedLocation && (
            <span className="font-mono text-xs bg-black/30 px-2 py-0.5 rounded">
              {pickedLocation.lat.toFixed(4)}, {pickedLocation.lng.toFixed(4)}
            </span>
          )}
        </div>
      )}

      {/* Map Floating Control Toolbar (Top-Left) */}
      <div className="absolute top-3 left-3 z-[990] flex items-center gap-2">
        {/* Layer Selector */}
        <div className="relative">
          <button
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900/90 hover:bg-neutral-800 text-neutral-200 text-xs font-medium rounded-lg border border-neutral-700/80 shadow-lg backdrop-blur-md transition-all"
            title="Change map style"
          >
            <Layers className="w-3.5 h-3.5 text-orange-400" />
            <span className="hidden sm:inline">{TILE_PROVIDERS[activeTile].name.split(' (')[0]}</span>
            <span className="sm:hidden">Layers</span>
          </button>

          {showLayerMenu && (
            <div className="absolute top-full left-0 mt-1.5 w-60 bg-neutral-900/95 border border-neutral-700 rounded-lg shadow-2xl p-1.5 z-50 backdrop-blur-md">
              <div className="text-[10px] uppercase font-mono text-neutral-400 px-2.5 py-1">
                Map Basemap
              </div>
              {(Object.keys(TILE_PROVIDERS) as MapTileLayer[]).map((layerKey) => (
                <button
                  key={layerKey}
                  onClick={() => {
                    setActiveTile(layerKey);
                    setShowLayerMenu(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center justify-between transition-colors ${
                    activeTile === layerKey
                      ? 'bg-orange-500/20 text-orange-400 font-semibold border border-orange-500/40'
                      : 'text-neutral-300 hover:bg-neutral-800'
                  }`}
                >
                  <span>{TILE_PROVIDERS[layerKey].name}</span>
                  {activeTile === layerKey && <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Marker Style Selector */}
        {onMarkerStyleChange && (
          <div className="hidden md:flex items-center bg-neutral-900/90 border border-neutral-700/80 rounded-lg p-0.5 shadow-lg backdrop-blur-md text-xs">
            <button
              onClick={() => onMarkerStyleChange('iof-flag')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                markerStyle === 'iof-flag' ? 'bg-orange-600 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
              title="Classic IOF control flag markers"
            >
              IOF Flag
            </button>
            <button
              onClick={() => onMarkerStyleChange('control-circle')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                markerStyle === 'control-circle' ? 'bg-fuchsia-600 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
              title="Authentic IOF map control circle"
            >
              Control Circle
            </button>
          </div>
        )}

        {/* Fit Bounds Button */}
        <button
          onClick={fitAll}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900/90 hover:bg-neutral-800 text-neutral-200 text-xs font-medium rounded-lg border border-neutral-700/80 shadow-lg backdrop-blur-md transition-all"
          title="Zoom to fit all competitions"
        >
          <Navigation className="w-3.5 h-3.5 text-neutral-400 rotate-45" />
          <span className="hidden sm:inline">Fit All</span>
        </button>
      </div>

      {/* Map Legend / Watermark Badge (Bottom-Left) */}
      <div className="absolute bottom-3 left-3 z-[990] bg-neutral-900/90 border border-neutral-800/80 px-2.5 py-1.5 rounded-lg text-[11px] text-neutral-300 flex items-center gap-3 backdrop-blur-md shadow-md pointer-events-none">
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded border border-white bg-gradient-to-br from-white to-orange-500 shadow-sm" />
          <span className="font-mono text-neutral-400">{competitions.length} races on map</span>
        </div>
        <span className="text-neutral-600">|</span>
        <div className="flex items-center gap-1 text-orange-400">
          <Compass className="w-3 h-3" />
          <span>Click any marker for Livelox & Results</span>
        </div>
      </div>
    </div>
  );
}

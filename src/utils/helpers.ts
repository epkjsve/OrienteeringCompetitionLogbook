// Utility functions for Orienteering Tracker

export function formatPace(timeStr?: string, distanceKm?: number): string | null {
  if (!timeStr || !distanceKm || distanceKm <= 0) return null;
  
  // Parse time (MM:SS or HH:MM:SS)
  const parts = timeStr.trim().split(':').map(Number);
  let totalSeconds = 0;
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    totalSeconds = parts[0] * 60 + parts[1];
  } else if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    totalSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else {
    return null;
  }

  const secPerKm = Math.round(totalSeconds / distanceKm);
  const paceMin = Math.floor(secPerKm / 60);
  const paceSec = secPerKm % 60;
  return `${paceMin}:${paceSec.toString().padStart(2, '0')} /km`;
}

export function getDisciplineColor(discipline: string): { bg: string; text: string; border: string } {
  switch (discipline) {
    case 'Sprint':
      return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' };
    case 'Middle':
      return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' };
    case 'Long':
      return { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' };
    case 'Ultralong':
      return { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' };
    case 'Night':
      return { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30' };
    case 'Relay':
      return { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' };
    case 'TrailO':
      return { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/30' };
    default:
      return { bg: 'bg-stone-500/10', text: 'text-stone-300', border: 'border-stone-500/30' };
  }
}

export async function geocodeLocation(query: string): Promise<{ lat: number; lng: number; displayName: string } | null> {
  if (!query || query.trim().length < 3) return null;
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      }
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        displayName: data[0].display_name
      };
    }
    return null;
  } catch (err) {
    console.error('Geocoding error:', err);
    return null;
  }
}

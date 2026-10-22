import { Competition } from '../types/competition';

interface StatsOverviewProps {
  competitions: Competition[];
}

export default function StatsOverview({ competitions }: StatsOverviewProps) {
  const totalRaces = competitions.length;
  const relayRaces = competitions.filter((c) => c.discipline === 'Relay').length;
  const totalKm = competitions.reduce((acc, c) => acc + (c.distanceKm || 0), 0);
  const podiums = competitions.filter((c) => c.placement && c.placement <= 3).length;
  const top10s = competitions.filter((c) => c.placement && c.placement <= 10).length;
  const withLivelox = competitions.filter((c) => !!c.liveloxUrl).length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 p-3 bg-neutral-900/60 border-b border-neutral-800">
      <div className="px-3 py-2 bg-neutral-950/70 rounded-lg border border-neutral-800/80">
        <div className="text-[10px] uppercase font-mono text-neutral-500 tracking-wider">Competitions</div>
        <div className="text-lg font-bold text-white font-mono tabular-nums">{totalRaces}</div>
        <div className="text-[10px] text-neutral-500 font-mono">2020–2026 total</div>
      </div>

      <div className="px-3 py-2 bg-neutral-950/70 rounded-lg border border-neutral-800/80">
        <div className="text-[10px] uppercase font-mono text-neutral-500 tracking-wider">Relays (Stafetter)</div>
        <div className="text-lg font-bold text-rose-400 font-mono tabular-nums">{relayRaces}</div>
        <div className="text-[10px] text-neutral-500 font-mono">25manna, 10Mila, DM</div>
      </div>

      <div className="px-3 py-2 bg-neutral-950/70 rounded-lg border border-neutral-800/80">
        <div className="text-[10px] uppercase font-mono text-neutral-500 tracking-wider">Distance</div>
        <div className="text-lg font-bold text-white font-mono tabular-nums">{totalKm.toFixed(1)} km</div>
        <div className="text-[10px] text-neutral-500 font-mono">straight-line race km</div>
      </div>

      <div className="px-3 py-2 bg-neutral-950/70 rounded-lg border border-neutral-800/80">
        <div className="text-[10px] uppercase font-mono text-neutral-500 tracking-wider">Podiums</div>
        <div className="text-lg font-bold text-amber-400 font-mono tabular-nums">{podiums}</div>
        <div className="text-[10px] text-neutral-500 font-mono">1st, 2nd & 3rd places</div>
      </div>

      <div className="px-3 py-2 bg-neutral-950/70 rounded-lg border border-neutral-800/80">
        <div className="text-[10px] uppercase font-mono text-neutral-500 tracking-wider">Top 10s</div>
        <div className="text-lg font-bold text-neutral-200 font-mono tabular-nums">{top10s}</div>
        <div className="text-[10px] text-neutral-500 font-mono">{totalRaces > 0 ? `${Math.round((top10s / totalRaces) * 100)}% rate` : '0%'}</div>
      </div>

      <div className="px-3 py-2 bg-neutral-950/70 rounded-lg border border-neutral-800/80">
        <div className="text-[10px] uppercase font-mono text-neutral-500 tracking-wider">Livelox GPS</div>
        <div className="text-lg font-bold text-orange-400 font-mono tabular-nums">{withLivelox}</div>
        <div className="text-[10px] text-neutral-500 font-mono">tracked routes</div>
      </div>
    </div>
  );
}

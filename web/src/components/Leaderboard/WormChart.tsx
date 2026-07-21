import { useMemo, useState } from 'react';
import type { GameRecord } from '../../storage/types';
import { getRankingSeries, type RankPoint } from '../../utils/ranking';
import { getPlayerColor, getPlayerInitial } from '../../utils/playerColor';

const ROW_GAP = 38;
const COL_GAP = 84;
const PAD_TOP = 20;
const PAD_BOTTOM = 30;
const PAD_LEFT_RANK = 24;
const PAD_LEFT_POINTS = 44;
const PAD_RIGHT = 120;
const DRAW_MS = 900;
const WOBBLE_AMPLITUDE = 3;
const MIN_LABEL_GAP = 20;

type Metric = 'rank' | 'points';

// Deterministic pseudo-random value in [-amplitude, amplitude], seeded by a string
// so a player's wobble is stable across re-renders instead of jittering on every paint.
function seededJitter(seed: string, amplitude: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return ((hash % 1000) / 1000) * amplitude;
}

// Connects points with gentle S-curves instead of dead-straight segments, so each
// line reads as a hand-drawn "worm" rather than a technical line chart.
function buildWormPath(points: { x: number; y: number }[], seedKey: string): string {
  if (!points.length) return '';
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 1];
    const p1 = points[i];
    const dx = p1.x - p0.x;
    const dy = p1.y - p0.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const j1 = seededJitter(`${seedKey}-${i}-a`, WOBBLE_AMPLITUDE);
    const j2 = seededJitter(`${seedKey}-${i}-b`, WOBBLE_AMPLITUDE);
    const c1x = p0.x + dx * 0.33 + nx * j1;
    const c1y = p0.y + dy * 0.33 + ny * j1;
    const c2x = p0.x + dx * 0.66 + nx * j2;
    const c2y = p0.y + dy * 0.66 + ny * j2;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p1.x} ${p1.y}`;
  }
  return d;
}

function formatSigned(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}

export function WormChart({ game }: { game: GameRecord }) {
  const { players, rounds, settings } = game;
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [metric, setMetric] = useState<Metric>('rank');

  const series = useMemo(
    () => getRankingSeries(players, rounds, settings.rankDir),
    [players, rounds, settings.rankDir],
  );

  if (players.length < 2 || rounds.length < 2) return null;

  const playerCount = players.length;
  const padLeft = metric === 'points' ? PAD_LEFT_POINTS : PAD_LEFT_RANK;
  const width = padLeft + PAD_RIGHT + rounds.length * COL_GAP;
  const chartHeight = (playerCount - 1) * ROW_GAP;
  const height = PAD_TOP + PAD_BOTTOM + chartHeight;

  const allTotals = players.flatMap((p) => series[p.id].map((pt) => pt.total));
  const minTotal = Math.min(0, ...allTotals);
  const maxTotal = Math.max(0, ...allTotals);
  const totalRange = maxTotal - minTotal || 1;

  const xFor = (roundIdx: number) => padLeft + roundIdx * COL_GAP;
  const yForRank = (rank: number) => PAD_TOP + (rank - 1) * ROW_GAP;
  const yForPoints = (total: number) => PAD_TOP + ((maxTotal - total) / totalRange) * chartHeight;
  const yFor = (pt: RankPoint) => (metric === 'rank' ? yForRank(pt.rank) : yForPoints(pt.total));

  const gridRows = Array.from({ length: playerCount }, (_, i) => i);

  // End-of-line labels can collide when totals (or ranks) land close together,
  // most often in "points" mode where two players finish with similar scores.
  // Spread them apart vertically and draw a thin connector back to the real point.
  const lastPositions = players.map((player) => {
    const points = series[player.id];
    const last = points[points.length - 1];
    const y = yFor(last);
    return { id: player.id, x: xFor(last.round), y, labelY: y };
  });
  const orderedByY = [...lastPositions].sort((a, b) => a.labelY - b.labelY);
  for (let i = 1; i < orderedByY.length; i++) {
    const gap = orderedByY[i].labelY - orderedByY[i - 1].labelY;
    if (gap < MIN_LABEL_GAP) orderedByY[i].labelY = orderedByY[i - 1].labelY + MIN_LABEL_GAP;
  }
  const bottomBound = PAD_TOP + chartHeight;
  const overflow = orderedByY.length ? orderedByY[orderedByY.length - 1].labelY - bottomBound : 0;
  if (overflow > 0) {
    orderedByY.forEach((p) => {
      p.labelY -= overflow;
    });
  }
  const labelPosById = new Map(lastPositions.map((p) => [p.id, p]));

  return (
    <div className="worm-chart-wrap">
      <div className="worm-chart-header">
        <div className="worm-chart-title">{metric === 'rank' ? 'Rank Over Time' : 'Points Over Time'}</div>
        <div className="toggle-group worm-metric-toggle">
          <button
            type="button"
            className={`toggle-btn${metric === 'rank' ? ' active' : ''}`}
            onClick={() => setMetric('rank')}
          >
            Rank
          </button>
          <button
            type="button"
            className={`toggle-btn${metric === 'points' ? ' active' : ''}`}
            onClick={() => setMetric('points')}
          >
            Points
          </button>
        </div>
      </div>
      <div className="worm-chart-scroll">
        <svg
          className="worm-chart"
          width={width}
          height={height}
          role="img"
          aria-label={
            metric === 'rank'
              ? "Chart showing each player's rank after every round"
              : "Chart showing each player's total points after every round"
          }
        >
          {gridRows.map((row) => {
            const y = PAD_TOP + row * ROW_GAP;
            const value = maxTotal - (row / (playerCount - 1 || 1)) * totalRange;
            return (
              <g key={row}>
                <line x1={padLeft} x2={width - PAD_RIGHT} y1={y} y2={y} className="worm-grid-line" />
                {metric === 'points' && (
                  <text x={padLeft - 8} y={y} className="worm-axis-label" textAnchor="end" dominantBaseline="central">
                    {formatSigned(Math.round(value))}
                  </text>
                )}
              </g>
            );
          })}

          {Array.from({ length: rounds.length + 1 }, (_, i) => i).map((i) => (
            <text key={i} x={xFor(i)} y={height - 10} className="worm-round-label" textAnchor="middle">
              R{i}
            </text>
          ))}

          {players.map((player, pIdx) => {
            const points = series[player.id];
            const color = getPlayerColor(player.id);
            const coords = points.map((pt) => ({ x: xFor(pt.round), y: yFor(pt) }));
            const d = buildWormPath(coords, `${player.id}-${metric}`);
            const isHovered = hoveredId === player.id;
            const isDimmed = hoveredId !== null && !isHovered;
            const drawDelay = pIdx * 150;

            return (
              <g
                key={`${player.id}-${metric}`}
                className={`worm-line-group${isDimmed ? ' worm-dimmed' : ''}`}
                onMouseEnter={() => setHoveredId(player.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <path d={d} className="worm-hit-area" fill="none" strokeWidth={16} />
                <path
                  d={d}
                  className="worm-path"
                  fill="none"
                  stroke={color}
                  strokeWidth={isHovered ? 4 : 2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength={100}
                  style={{ animationDelay: `${drawDelay}ms` }}
                />
                {points.map((pt, i) => (
                  <circle
                    key={i}
                    cx={xFor(pt.round)}
                    cy={yFor(pt)}
                    r={i === points.length - 1 ? 5.5 : 3.5}
                    fill={color}
                    className="worm-point"
                    style={{ animationDelay: `${drawDelay + (i * DRAW_MS) / (points.length - 1)}ms` }}
                  >
                    <title>
                      {pt.round === 0
                        ? `${player.name} · Start · all players tied`
                        : `${player.name} · Round ${pt.round} · Rank #${pt.rank} · ${formatSigned(pt.total)}`}
                    </title>
                  </circle>
                ))}
                <g className="worm-label" style={{ animationDelay: `${drawDelay + DRAW_MS}ms` }}>
                  {(() => {
                    const pos = labelPosById.get(player.id)!;
                    const labelX = pos.x + 14;
                    return (
                      <>
                        {Math.abs(pos.labelY - pos.y) > 1 && (
                          <line
                            x1={pos.x}
                            y1={pos.y}
                            x2={labelX - 9}
                            y2={pos.labelY}
                            className="worm-label-connector"
                            stroke={color}
                          />
                        )}
                        <g transform={`translate(${labelX}, ${pos.labelY})`}>
                          <circle r={9} fill={color} />
                          <text textAnchor="middle" dominantBaseline="central" className="worm-label-initial">
                            {getPlayerInitial(player.name)}
                          </text>
                          <text x={16} dominantBaseline="central" className="worm-label-name">
                            {player.name}
                          </text>
                        </g>
                      </>
                    );
                  })()}
                </g>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

"use client";

export type PerfPoint = { year: number; month: number; score: number };

/** Muted single-series line chart (SVG). */
export function PerformanceLineChart({ data }: { data: PerfPoint[] }) {
  const sorted = [...data].sort((a, b) => a.year * 12 + a.month - (b.year * 12 + b.month));
  if (!sorted.length) {
    return (
      <div className="flex h-40 items-center justify-center rounded-md border border-dashed border-corp-200 bg-corp-50/50 text-xs text-muted">
        No performance data yet. HR can add monthly scores from the employee profile.
      </div>
    );
  }

  const w = 360;
  const h = 120;
  const pad = 10;
  const scores = sorted.map((d) => d.score);
  const minS = Math.min(...scores, 0);
  const maxS = Math.max(...scores, 100);
  const range = maxS - minS || 1;

  const denom = Math.max(sorted.length - 1, 1);
  const linePoints = sorted.map((d, i) => {
    const x = pad + (i / denom) * (w - pad * 2);
    const y = h - pad - ((d.score - minS) / range) * (h - pad * 2);
    return { x, y, d };
  });

  const pointsAttr = linePoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-lg text-corp-800" role="img" aria-label="Performance trend">
        <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="currentColor" strokeOpacity={0.12} strokeWidth={1} />
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={pointsAttr}
          opacity={0.88}
        />
        {linePoints.map(({ x, y, d }) => (
          <circle key={`${d.year}-${d.month}`} cx={x} cy={y} r="3" fill="white" stroke="currentColor" strokeWidth="1.2" />
        ))}
      </svg>
      <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-muted">
        {sorted.map((d) => (
          <span
            key={`${d.year}-${d.month}`}
            className="rounded border border-corp-200/80 bg-white px-1.5 py-0.5 tabular-nums"
          >
            {d.year}-{String(d.month).padStart(2, "0")}: {d.score}
          </span>
        ))}
      </div>
    </div>
  );
}

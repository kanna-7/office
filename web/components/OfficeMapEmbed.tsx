"use client";

/**
 * Lightweight map preview (OpenStreetMap embed).
 * lat/lon in WGS84; zoom fixed for corporate calm UI.
 */
export function OfficeMapEmbed({
  latitude,
  longitude,
  height = 220,
}: {
  latitude: number;
  longitude: number;
  height?: number;
}) {
  const lat = Number(latitude) || 0;
  const lon = Number(longitude) || 0;
  const zoom = 15;
  const bboxPad = 0.008;
  const left = lon - bboxPad;
  const bottom = lat - bboxPad;
  const right = lon + bboxPad;
  const top = lat + bboxPad;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${lat}%2C${lon}`;

  return (
    <div
      className="overflow-hidden rounded-md border border-corp-200 bg-corp-50 shadow-inner"
      style={{ height }}
    >
      <iframe title="Office location map" className="h-full w-full border-0 opacity-95" src={src} loading="lazy" />
    </div>
  );
}

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT = path.join(ROOT, 'data', 'verified-tracks.json.gz');
const FOOTHILL_TRACKS = path.join(ROOT, 'data', 'foothill-tracks.json');
const SOURCE_BASE = 'https://mapa-turystyczna.pl/route/';
const USER_AGENT = 'TatryField/0.2.7 (route geometry build; source attribution in SOURCES.md)';

// These are complete, human-readable route references. A segment is reversed or
// mirrored only when the reference page describes one leg of an out-and-back.
const SPECS = {
  'morskie-oko': { segments: ['3rttp'] },
  'five-lakes': {
    segments: [
      'zun',
      { slug: 'g5bc', reverse: true },
      '1r48t'
    ]
  },
  'czarny-staw': { segments: ['rf6'], mirror: true },
  kasprowy: { segments: ['ef7k'], mirror: true },
  giewont: { segments: ['3lycf'] },
  czerwone: { segments: ['3u87u'] },
  sarnia: { segments: ['mgb8'] },
  koscieliska: { segments: ['1y1bb'] },
  chocholowska: { segments: ['3gov'] },
  'gesia-szyja': { segments: ['4wwk'] },
  nosal: { segments: ['31sey'] },
  kopieniec: { segments: ['31b5e'] },
  wolowiec: { segments: ['w94x'] },
  koscielec: { segments: ['hdu1'], mirror: true },
  rysy: { segments: ['3lrqx'] },
  szpiglasowy: { segments: ['ex3'] },
  swinica: { segments: ['dq5q'] },
  'kozi-wierch': { segments: ['pgty'] },
  'skrajny-granat': { segments: ['spgo'], mirror: true },
  starorobocianski: { segments: ['a1dw'] }
};

function haversineKm(a, b) {
  const R = 6371;
  const rad = Math.PI / 180;
  const dLat = (b[1] - a[1]) * rad;
  const dLon = (b[0] - a[0]) * rad;
  const lat1 = a[1] * rad;
  const lat2 = b[1] * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function lineDistanceKm(coords) {
  return coords.slice(1).reduce((sum, point, i) => sum + haversineKm(coords[i], point), 0);
}

function parseTrackPoints(gpx, slug) {
  const points = [...gpx.matchAll(/<trkpt\b([^>]*)>/gi)].map((match) => {
    const attrs = match[1];
    const lat = Number(attrs.match(/\blat=["']([^"']+)/i)?.[1]);
    const lon = Number(attrs.match(/\blon=["']([^"']+)/i)?.[1]);
    return [lon, lat];
  }).filter(([lon, lat]) => Number.isFinite(lon) && Number.isFinite(lat));
  if (points.length < 2) throw new Error(`No usable track points in ${slug}.gpx`);
  return points;
}

function dedupeSequential(coords) {
  return coords.filter((point, i) => !i || haversineKm(coords[i - 1], point) > 0.001);
}

async function download(slug) {
  const url = `${SOURCE_BASE}${slug}.gpx`;
  const response = await fetch(url, {
    headers: { 'user-agent': USER_AGENT, accept: 'application/gpx+xml,application/xml,text/xml' },
    signal: AbortSignal.timeout(30000)
  });
  if (!response.ok) throw new Error(`${url}: ${response.status} ${response.statusText}`);
  return parseTrackPoints(await response.text(), slug);
}

async function buildRoute(id, spec) {
  const sourceSlugs = [];
  let coords = [];
  for (const item of spec.segments) {
    const segment = typeof item === 'string' ? { slug: item } : item;
    sourceSlugs.push(segment.slug);
    let points = await download(segment.slug);
    if (segment.reverse) points = points.reverse();
    if (coords.length) {
      const gapKm = haversineKm(coords.at(-1), points[0]);
      if (gapKm > 0.25) throw new Error(`${id}: ${segment.slug} starts ${gapKm.toFixed(2)} km from the preceding segment`);
      if (gapKm < 0.02) points = points.slice(1);
    }
    coords.push(...points);
  }
  coords = dedupeSequential(coords);
  if (spec.mirror) coords = coords.concat(coords.slice(0, -1).reverse());

  let maxGapKm = 0;
  for (let i = 1; i < coords.length; i++) maxGapKm = Math.max(maxGapKm, haversineKm(coords[i - 1], coords[i]));
  if (maxGapKm > 0.75) throw new Error(`${id}: suspicious ${maxGapKm.toFixed(2)} km jump in track`);

  const sourceUrls = sourceSlugs.map((slug) => `${SOURCE_BASE}${slug}`);
  return {
    geometry: { type: 'LineString', coordinates: coords },
    distanceKm: Math.round(lineDistanceKm(coords) * 100) / 100,
    pointCount: coords.length,
    maxGapKm: Math.round(maxGapKm * 1000) / 1000,
    sourceUrls
  };
}

async function main() {
  const routes = {};
  for (const [id, spec] of Object.entries(SPECS)) {
    routes[id] = await buildRoute(id, spec);
    process.stdout.write(`${id}: ${routes[id].distanceKm} km, ${routes[id].pointCount} points\n`);
  }
  const foothillTracks = JSON.parse(fs.readFileSync(FOOTHILL_TRACKS, 'utf8'));
  for (const [id, track] of Object.entries(foothillTracks)) {
    const coords = track.geometry?.coordinates || [];
    if (coords.length < 2) throw new Error(`${id}: bundled foothill track has no geometry`);
    routes[id] = track;
    process.stdout.write(`${id}: ${track.distanceKm} km, ${track.pointCount} points (OSM foot routing)\n`);
  }
  const payload = {
    version: 1,
    generatedAt: new Date().toISOString(),
    attribution: 'Reference route tracks: mapa-turystyczna.pl and routing.openstreetmap.de; underlying map data: OpenStreetMap contributors',
    routes
  };
  fs.writeFileSync(OUTPUT, zlib.gzipSync(`${JSON.stringify(payload)}\n`, { level: 9 }));
  process.stdout.write(`Wrote ${OUTPUT}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

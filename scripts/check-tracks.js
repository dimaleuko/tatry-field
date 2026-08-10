const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ROOT = path.resolve(__dirname, '..');
const routes = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'routes.json'), 'utf8'));
const tracks = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(ROOT, 'data', 'verified-tracks.json.gz'))).toString('utf8'));

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

let failed = false;
for (const route of routes) {
  const track = tracks.routes[route.id];
  const errors = [];
  if (!track) errors.push('missing track');
  const coords = track?.geometry?.coordinates || [];
  if (coords.length < 2) errors.push('fewer than two points');
  let distanceKm = 0;
  let maxGapKm = 0;
  for (let i = 0; i < coords.length; i++) {
    const [lon, lat] = coords[i];
    if (!Number.isFinite(lon) || !Number.isFinite(lat) || lon < 19.68 || lon > 20.22 || lat < 49.15 || lat > 49.34) errors.push(`point ${i} outside Tatra bounds`);
    if (i) {
      const gap = haversineKm(coords[i - 1], coords[i]);
      distanceKm += gap;
      maxGapKm = Math.max(maxGapKm, gap);
    }
  }
  const ratio = distanceKm / route.km;
  if (ratio < 0.75 || ratio > 1.3) errors.push(`distance ratio ${ratio.toFixed(2)}`);
  if (maxGapKm > 0.75) errors.push(`max gap ${maxGapKm.toFixed(2)} km`);
  failed ||= errors.length > 0;
  process.stdout.write(`${errors.length ? 'FAIL' : 'OK  '} ${route.id.padEnd(15)} ${distanceKm.toFixed(2).padStart(6)} km  ${(ratio || 0).toFixed(2)}x${errors.length ? `  ${errors.join('; ')}` : ''}\n`);
}

const unknown = Object.keys(tracks.routes).filter((id) => !routes.some((route) => route.id === id));
if (unknown.length) {
  failed = true;
  console.error(`Unknown track ids: ${unknown.join(', ')}`);
}
if (failed) process.exitCode = 1;

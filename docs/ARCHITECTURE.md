# Architecture

Browser
  → static editorial UI
  → `/api/*` on the same Node process

Backend adapters
  → Open-Meteo weather
  → Open-Meteo elevation
  → FOSSGIS / OSRM foot routing
  → Overpass POI search
  → TPN/TOPR official-page status

In-memory cache
  → weather: 30 minutes
  → TPN/TOPR: 10 minutes
  → POIs: 6 hours
  → route geometry/elevation: 24 hours

No secrets or API keys are required for this prototype.

## Why route geometry is not treated as authoritative

The backend routes through a sequence of curated waypoints. That produces a useful OSM line and GPX, but it can still choose a segment differently from the intended marked trail. The UI labels this explicitly and links to official TPN information.

For production, tracks should be manually reviewed, versioned, and stored as first-class route assets.

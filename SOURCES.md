# Sources / runtime services

## Official safety

- Tatrzański Park Narodowy — tourist bulletin: `https://tpn.gov.pl/komunikat-turystyczny`
- Tatrzańskie Ochotnicze Pogotowie Ratunkowe: `https://topr.pl/`
- TOPR avalanche bulletin: `https://lawiny.topr.pl/`
- TPN tourist information geoportal: `https://gis.tpn.pl/portal/apps/experiencebuilder/experience?id=21dfb7b85c564bbb9286d5b06b044a76`

The product treats these as the authoritative check for closures / current mountain conditions. The auto-parser is deliberately conservative: failure to find a route name is **not** interpreted as “open”.

## Weather / elevation

- Open-Meteo Forecast API: `https://open-meteo.com/en/docs`
- Open-Meteo Elevation API: `https://open-meteo.com/en/docs/elevation-api`

## Route geometry / map data

- OpenStreetMap data
- FOSSGIS `routing.openstreetmap.de` foot profile
- OSRM route API docs: `https://project-osrm.org/docs/`

`server.js` uses full GeoJSON route overview and caches a route for 24h. Public FOSSGIS usage policy asks for attribution, a valid user agent, max 1 request/sec and no heavy use. This prototype loads geometry only on demand and caches it.

## Nearby POIs

- OpenStreetMap / Overpass API
- `amenity=cafe`, `amenity=restaurant`, `amenity=fast_food`, `amenity=parking`, `highway=bus_stop`

POIs are discovery hints. Opening hours and business existence should be rechecked before relying on them.

## Map tiles

The prototype uses `tile.openstreetmap.org`. For a public production release, replace this with a provider that explicitly supports app traffic; standard OSM tile servers have a separate usage policy and limited capacity.

## Phase 2.3 navigation integration

- Google Maps URLs — directions links to trailheads / Zakopane.
- Apple Maps URL Scheme — directions links using current location as the start when omitted.
- W3C Geolocation API — browser location / watchPosition security and permissions model.
- W3C Device Orientation and Motion — compass/orientation permission and secure-context model.
- OpenStreetMap standard tiles — high-zoom detail layer in Trail Mode.
- OpenTopoMap — optional terrain/topographic layer.

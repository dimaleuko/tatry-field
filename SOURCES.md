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

- Route references and GPX exports: `https://mapa-turystyczna.pl/`
- Underlying map/trail data: OpenStreetMap contributors
- Validated emergency router: BRouter `hiking-mountain` profile — `https://brouter.de/`

`data/verified-tracks.json.gz` is generated ahead of deployment from the route references listed by `scripts/build-verified-tracks.js`. The build rejects disconnected segments; runtime validation rejects tracks that leave the Tatra bounding region, contain large jumps or differ implausibly from the editorial distance. Route maps, Trail Mode, elevation sampling and GPX downloads all consume this one geometry.

The reference tracks are not official TPN GPX files. Official trail markings, closures and TPN/TOPR communications remain authoritative.

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


## Route narrative references (Phase 2.3.3)
The richer route descriptions use TPN trail descriptions as a grounding source for the character and sequence of official routes, including:
- TPN: Palenica Białczańska – Morskie Oko and walk around the lake
- TPN: Palenica Białczańska – Dolina Pięciu Stawów – Świstówka – Morskie Oko
- TPN: Hala Gąsienicowa / Czarny Staw route descriptions
- TPN: Dolina Strążyska – Sarnia Skała – Dolina Białego
- TPN: Kiry – Dolina Kościeliska – Ornak – Smreczyński Staw
Descriptions inside the app remain curated editorial summaries rather than official route instructions.

## Phase 2.3.3 route-story notes

Route narratives were cross-checked against the Tatra National Park route catalogue and route descriptions. The **terrain mix percentages are editorial estimates** intended to communicate the feel of a day; they are not survey-grade or GPS-derived measurements.

- TPN route catalogue: https://tpn.gov.pl/trasy-turystyczne
- TPN Hala Gąsienicowa / Czarny Staw route description: https://tpn.gov.pl/szlaki-turystyczne/dolina-suchej-wody-hala-gasienicowa-czarny-staw-gasienicowy-przelecz-miedzy-kopami-boczan-kuznice
- TPN Sarnia Skała route description: https://tpn.gov.pl/szlaki-turystyczne/dolina-strazyska-polana-strazyska-siklawica-strazyska-sarnia-skala-dolina-bialego-wielka-krokiew
- TPN current tourist communication: https://tpn.gov.pl/komunikat-turystyczny

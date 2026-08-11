# TATRY / FIELD — Phase 3.0

Editorial hiking planner for the Polish Tatras, now with a **Live Trail Mode**.

## What changed in 2.3

- Home headline is now **«Нишевый хайкинг»**.
- Removed the Today / Tomorrow chooser and weather-fit filter from the planning UI. The guide is designed for trips planned a week or two ahead; weather and TPN/TOPR should be checked closer to departure and again on the morning of the hike.
- Added **START TRAIL MODE** on every route page.
- Trail Mode includes:
  - current device location via the browser Geolocation API;
  - reported GPS accuracy;
  - route progress and distance remaining;
  - distance to the main objective / summit;
  - nearest route POI (hut, water, viewpoint, objective or finish);
  - off-route distance and warning states;
  - compass heading when the browser/device grants orientation permission;
  - a detailed OpenStreetMap layer up to z19 plus an optional OpenTopoMap layer;
  - a dark “completed” route segment and orange remaining track;
  - Google Maps / Apple Maps buttons for getting to the trailhead and returning to Zakopane;
  - DEMO mode so the UI can be tested without being physically in the Tatras.
- Added OSM trail POIs (alpine huts, water/springs, viewpoints) around curated route waypoints.

## Important local-iPhone limitation

The site can still be opened on an iPhone over the same Wi‑Fi using the local address printed by `START.command`, for example:

`http://192.168.x.x:8787`

However, browser geolocation and device-orientation APIs are restricted to **secure contexts**. A local-network HTTP address is useful for UI testing, but on iPhone the real GPS/compass part of Trail Mode should be expected to work only after deployment on HTTPS. Use the built-in **DEMO +** button locally.

## Run

1. Install Node.js 20+ (Node 24 LTS is fine).
2. Double-click `START.command` on macOS, or run:

```bash
node server.js
```

3. Open the Mac URL printed in Terminal.
4. For iPhone UI testing, open the iPhone URL shown in the same Terminal while both devices are on the same Wi‑Fi.

## Safety model

Trail Mode is an orientation aid, **not turn-by-turn safety certification**. GPS accuracy can degrade in valleys, forest, weather or near steep terrain. Always follow official marked trails and signage, and check current TPN/TOPR information before departure.

Route pages, Trail Mode and downloadable GPX now use the same bundled reference tracks. Every track is checked at build time and again by the server for plausible distance, Tatra-region bounds and suspicious gaps. The tracks remain orientation aids rather than official TPN navigation: always follow marked trails and current TPN/TOPR information.

To rebuild the bundled tracks from the route references and run the geometry audit:

```bash
npm run build:tracks
npm test
```

If a bundled track is missing, the server can request BRouter's `hiking-mountain` profile, but accepts the result only if it passes the same geometry checks. A coarse curated-waypoint line is the final explicit fallback.


## 2.3.1 deployment hotfix
Leaflet is now installed from npm and served locally by the Node service instead of loading the library from a third-party CDN. This prevents the app from getting stuck on the static loading state when the CDN script is unavailable.


## Phase 2.3.2 UI cleanup
- route preview is exclusive and stale async hover responses are ignored
- leaving a route card clears its preview and restores overview
- BASE CAMP / housing moved below the routes workspace
- no housing zone is visually preselected by default


## Phase 2.3.3 route stories
- every one of the 15 route pages now has a full **ROUTE STORY / ЧЕГО ЖДАТЬ** section
- **WHY GO**: a concise editorial reason to choose the route + motivation tags
- **TERRAIN MIX**: curated approximate percentage split of road/forest/open alpine/rock etc. (not a GPS measurement)
- **WHY START / WHY FINISH**: explains the route logic and the transport logic
- **VIEWS**: where the visual payoff actually happens instead of implying the whole route is panoramic
- **TRADE-OFFS**: the less glamorous price of each route — crowds, asphalt, long approach, exposure, long return, etc.
- **DAY BY ACTS**: a four-part mental model of how the day unfolds
- narrative remains editorial orientation, not turn-by-turn guidance; official TPN signage and current conditions remain authoritative

## Phase 2.3.4 geometry integrity

- replaced unchecked live OSRM responses with bundled source-backed reference tracks for all 15 routes
- added distance, geographic-bounds and maximum-gap validation before a line can be published
- aligned route definitions, start/finish labels and GPX downloads with the displayed geometry
- kept a validated BRouter `hiking-mountain` fallback for future or missing tracks

## Phase 2.4 route photo highlights

- every route card now previews two characteristic scenes from that route
- every route page includes a larger **ROUTE HIGHLIGHTS / КАК ЭТО ВЫГЛЯДИТ** section
- all 30 photographs come from Wikimedia Commons and retain visible author, source and license attribution
- photo metadata is kept separately in `data/route-photos.json`; the server adds responsive Wikimedia image URLs to the routes API

## Phase 2.5 niche hiker photo code

- added an ironic editorial section at the bottom of the homepage with six safe photo-pose ideas
- included an original six-frame moodboard inspired by outdoor-film photography rather than copied Pinterest images
- kept the joke secondary to trail etiquette: no leaving marked paths, picking flowers or posing near exposed terrain

## Phase 2.6 saved routes and comparison

- save up to three routes from the homepage or an individual route page
- selections persist in local browser storage between visits
- a fixed comparison tray keeps the shortlist visible without blocking route browsing
- compare time, distance, ascent, altitude, difficulty, chains, crowds, start, objective, return logistics, motivation, trade-off and recommended base
- comparison is keyboard accessible, responsive and available from route pages through the saved-route counter

## Phase 2.7 editorial Field Map prototype

- added a `TOPO MAP / FIELD MAP` switch to the Giewont route page
- builds a lightweight editorial map from the existing verified route geometry without another tile source or mapping library
- marks six curated stages: Kuźnice, forest approach, Hala Kondratowa, Kondracka Pass, final queue and chains/summit
- uses distinct line treatments for forest, valley, open terrain and the chain section
- every stage is keyboard/touch accessible and opens a concise description of what changes there
- keeps the original topo map and GPX as the navigation layer; Field Map is explicitly presented as an approximate planning narrative

## Phase 2.8 annotated topographic Field Map

- replaced the abstract Giewont canvas with a second lightweight Leaflet map using the existing OpenTopoMap layer
- keeps surrounding terrain, contour lines, named passes and neighbouring trails visible
- expands the route story to eight track-linked stages from Kuźnice to the summit
- calls out the Kalatówki and Hala Kondratowa choices, the beginning of the steep Piekiełko climb, the Kondracka and Wyżnia Kondracka junctions, chains and the summit descent flow
- adds four more licensed Wikimedia Commons photographs and opens them from their relevant route stage in an accessible lightbox
- preserves the full reference track under a colour-coded ascent overlay and makes the new explanation responsive on mobile

## Phase 2.9 Field Maps for every route

- rolled the annotated topographic Field Map out to all 15 route pages
- added 5–8 track-linked stages per route for junctions, surface changes, sustained effort, exposure, shelter and turnaround decisions
- anchors two licensed Wikimedia route photographs to relevant places on every route; the more detailed Giewont map keeps its expanded photo set
- keeps one shared responsive renderer while route-specific content lives in `public/field-maps.js`
- links each map to its route reference and available official TPN or Zakopane route descriptions
- preserves the verified full track under the colour overlays and treats every marker as approximate planning context rather than turn-by-turn navigation
- validates route coverage, marker order, terrain ranges and photo references in `npm test`

## Phase 3.0 Polish high-route expansion

- grows the catalog from 15 to 20 routes with Szpiglasowy Wierch, Świnica, Kozi Wierch, Skrajny Granat and Starorobociański Wierch
- adds source-backed GPX geometry, two licensed Wikimedia Commons highlights and a route-specific Field Map for every addition
- models Kozi Wierch and Skrajny Granat as separate out-and-back routes instead of presenting a full Orla Perć traverse as an ordinary catalog hike
- keeps every start and finish on the Polish side

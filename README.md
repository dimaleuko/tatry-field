# TATRY / FIELD — Phase 2.3.3

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

The GPX geometry in this prototype is generated from curated waypoints through OSM foot routing. Before any public release, replace automatically routed tracks with manually verified route geometry.


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

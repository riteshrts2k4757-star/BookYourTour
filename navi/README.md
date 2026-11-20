# NAVIBAND — Advanced Real-Time Map Navigation & Haptic Wristband Simulator

> **Navigation Beyond Your Screen.**  
> A high-performance, interactive GPS navigation simulation and hardware prototyping platform for the ESP32 haptic navigation wristband project. Simulates realistic vehicle physics on real OpenRouteService road geometry and drives a 4-channel LED matrix with dual-actuator ERM haptic feedback.

---

## 🌟 Key Features

### 1. Multiple Alternative Route Generation & Selection
- **Up to 3 Genuinely Distinct Alternatives:** Queries OpenRouteService with alternative route parameters through the secure backend proxy.
- **Smart Duplicate Route Filtering:** Compares route geometries and distances to filter out identical or near-duplicate paths, presenting only viable choices.
- **Dedicated Route Comparison Cards:**
  - Displays Route number, Distance in km, and Estimated travel time.
  - Highlights comparative deltas: `+X km vs shortest` and `+Y min vs fastest`.
  - Displays count of significant turning maneuvers (Left, Right, U-Turn).
  - Dynamic Badges: **`SHORTEST`**, **`FASTEST`**, and **`ALTERNATIVE`**.
- **Interactive Multi-Polyline Map Display:**
  - Renders all route choices simultaneously on the Leaflet map with distinct visual styling.
  - Selected route: prominent, thick emerald line (`#10b981`) with glowing dark outline.
  - Alternative routes: distinct muted colors (Indigo, Amber, Cyan).
  - Clicking on any alternative polyline directly on the map selects that route!
- **Sorting Options:** Sort routes instantly by Shortest Distance, Fastest Travel Time, or Fewest Turns.
- **Active Navigation Guard:** Switching routes while vehicle is moving presents a clean confirmation dialog to safely reset navigation from the beginning of the selected route.

### 2. Speed-Adaptive Turn Warning & Haptic Alerts
- **Two-Stage Adaptive Warning System:**
  - **Stage A — Initial Approach Warning:**
    - Triggers at distance $D_{\text{initial}} = \text{speed (m/s)} \times \text{leadTime}_{\text{initial}}$ (default 10s lead, min 60m, max 200m).
    - Sends **exactly 1 short vibration pulse** and brief directional LED illumination to alert the rider of an upcoming turn.
    - Plays a gentle synthesized audio chime.
    - Displays HUD notification: `LEFT/RIGHT TURN APPROACHING`.
  - **Stage B — Main Directional Vibration:**
    - Triggers at distance $D_{\text{main}} = \text{speed (m/s)} \times \text{leadTime}_{\text{main}}$ (default 3s lead, min 15m, max 60m).
    - Executes the **complete directional vibration sequence** (1, 2, 3, or 4 pulses based on corner angle) strictly **before** the intersection.
    - Displays urgent banner: **`TURN LEFT NOW`** / **`TURN RIGHT NOW`**.
- **Dynamic Threshold Adaptation:**
  - Real-time recalculation as speed changes (`speedMps = speedKmh / 3.6`).
  - Speed changes never duplicate alerts or cancel active pulses.
  - Each warning stage triggers only once per maneuver.
  - State machine sequence: `APPROACHING → INITIAL_WARNING → MAIN_WARNING → MANEUVER_REACHED → COMPLETED`.
- **Live Next-Turn Card:**
  - Direction of upcoming turn, remaining distance countdown, current vehicle speed.
  - Initial alert status (`Pending` / `In Zone` / `Completed`).
  - Main vibration status (`Pending` / `Active` / `Completed`).
  - Pulse pattern and road corner angle.

### 3. Lightweight 2D Leaflet Map with Turn Waypoint Highlights
- Single persistent Leaflet 2D map instance (`react-leaflet` + `leaflet`) initialized once without memory thrashing.
- 100% free OpenStreetMap tile layers with dark shader mode (`map-dark-tiles`), Standard OSM, and Humanitarian (HOT) tiles.
- **Zero-overhead 60 FPS marker animation:** The directional vehicle marker updates directly through Leaflet's marker reference and GPU-accelerated CSS rotation, **completely decoupled from React's render cycle**.
- **Upcoming Maneuver Waypoint Highlight:** Automatically illuminates an animated pulsing target ring directly on the map at the upcoming turn intersection.
- **Follow Vehicle Mode:** Smoothly keeps the moving car centered on the map without tile thrashing, or allows free panning exploration when disabled.

### 4. Realistic Vehicle Physics & Speed Controller
- Physical distance integration: `distanceTravelled = speedInMetersPerSecond × elapsedTimeInSeconds`.
- **Dynamic Speed Controller:** Range from `0` to `120 km/h` with a smooth slider and **large digital speedometer**.
- **Driving Presets:** Instant one-click selection for **Stop (0 km/h)**, **City (30 km/h)**, **Normal (40 km/h)**, **Highway (80 km/h)**, and **Fast Sim (120 km/h)**.
- Setting speed to `0 km/h` or pausing immediately freezes distance progress and warning calculations. Resuming continues seamlessly from the exact route position.
- Cornering bearing smoothing: Blends forward azimuth as the car approaches road vertices for natural turning along road curves.

### 5. NAVIBAND 4-LED & Dual-ERM Haptic Vibration Matrix
- Physical layout: **Left Red**, **Left Green**, **Right Green**, **Right Red** plus **Left ERM Haptic Actuator** and **Right ERM Haptic Actuator**.
- **Completely Independent Directional Control:** Left Green and Right Green are strictly isolated, mutually exclusive during single turns, and both illuminate steadily during straight cruising.
- **Pulse Classification Matrix:**
  - **Wide Angle / Slight Turn (`> 90°`)**: `1 pulse` (Direction Green + Motor)
  - **Square Turn (`90°`, within 85° - 95°)**: `2 pulses` (Direction Green + Motor)
  - **Sharp / Acute Turn (`< 90°`)**: `3 pulses` (Direction Green + Motor)
  - **U-turn / Hairpin (`≥ 165°` or ORS code 9)**: `4 pulses` (Both Red LEDs Flash + Direction Green + Dual Haptic Buzz)
  - **Straight Cruising**: **Both Green LEDs illuminated together**. Both red LEDs stay OFF.
  - **Destination Reached**: Car stops, **both Green LEDs illuminate together**, and arrival celebration triggers.
  - **Stopped / Idle**: All LEDs and haptic motors OFF.

### 6. Settings & Hardware Customization Modal
- Accessible directly from the dashboard via the Settings gear icon.
- Configurable warning lead times (Approach 5–20s, Main 1–6s).
- Configurable minimum and maximum distance clamps with automated safety checks.
- Haptic pulse timing calibration (Pulse ON duration, Inter-pulse OFF gap).
- Synthesized audio toggle, Map auto-follow toggle, and Day/Night theme toggle.
- Settings persisted locally in `localStorage`.

### 7. Modern 3-Column Ergonomic Dashboard Layout
- **Left Column**: Route planner inputs, alternative route comparison cards with sorting, turn-by-turn maneuver list.
- **Center Column**: High-resolution interactive Leaflet map displaying all routes simultaneously, live car marker, and real-time telemetry log.
- **Right Column**: Next-turn live HUD card, speedometer & presets, speed-adaptive alert monitors, 4-LED realistic physical wristband simulator, and collapsible hardware test bench.

### 6. Interactive Hardware Test Bench & Pre-Engineered Scenarios
- Manual direct testing: Left (1, 2, 3), Right (1, 2, 3), Straight (both green), U-Turn (4 pulses), Arrival, and Stop.
- **7 Pre-Engineered Test Scenarios:**
  1. Straight Road (Dual Green ON)
  2. Slight Left Turn (1 pulse)
  3. Sharp Left Turn (3 pulses)
  4. Slight Right Turn (1 pulse)
  5. Sharp Right Turn (3 pulses)
  6. U-Turn Maneuver (4 pulses, Dual Red Alert)
  7. Destination Arrival (Both green lit)
- Non-destructive override: manual tests demonstrate the exact LED and haptic behavior without resetting active route progress.

### 7. Secure OpenRouteService (ORS) Integration
- The ORS API key is securely loaded from `.env` via `OPEN_ROUTE_SERVICES` on the Express backend.
- The API key is **never exposed** to the client browser or frontend bundle.
- Full Pelias geocoding (`/api/geocoding/search`), reverse geocoding (`/api/geocoding/reverse`), and driving directions (`/api/directions`).

---

## 🏗 System Architecture

```
[React Navigation Dashboard]
        │
        ├──► [Leaflet 2D Map (60 FPS Vehicle Marker & Maneuver Highlight)]
        │
        ├──► [Route Planner & Geocoding Search]
        │
        ├──► [Digital Speedometer & Physics Distance Controller]
        │
        └──► [Distance-Based Pre-Turn Warning Engine]
                     │ (150m Early / 50m Immediate)
                     ▼
             [IWristbandOutput Interface]
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
[Simulator Output]        [Future ESP32 BLE Driver]
(4-LEDs + Haptic Actuator) (Web Bluetooth GATT Packets)
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js v18+ (tested on Node v20 & v24)
- NPM v9+
- An OpenRouteService API account (free registration at [openrouteservice.org](https://openrouteservice.org/dev/#/signup))

---

### 1. Environment Variable Configuration (`.env`)

The application requires an OpenRouteService API key to calculate driving routes, maneuvers, and turn-by-turn geometry. The key is securely loaded and queried **only by the Express backend**, protecting your credentials from client-side exposure.

#### Step 1: Create the `.env` file
In the **root directory** of the project, create a file named `.env` (or copy the provided `.env.example` template):

```bash
# On Linux / macOS:
cp .env.example .env

# On Windows (PowerShell):
Copy-Item .env.example .env
```

#### Step 2: Add the required environment variable key
Open `.env` in your text editor and add the environment variable using the exact key name **`OPEN_ROUTE_SERVICES`**:

```env
# OpenRouteService API Key
OPEN_ROUTE_SERVICES=your_openrouteservice_api_key_here

# Optional: Server Port (defaults to 5000 if omitted)
PORT=5000
```

> [!IMPORTANT]
> - Replace `your_openrouteservice_api_key_here` with your actual key from the OpenRouteService dashboard.
> - Do not wrap the key in quotes or add extra whitespace around the `=` sign.
> - The `.env` file is listed in `.gitignore` and must **never** be committed to GitHub.

---

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Mode (Concurrent Backend + Frontend)
```bash
npm run dev
```
- **Frontend (Vite UI)**: [http://localhost:5173](http://localhost:5173) (Vite dev server automatically proxies `/api` calls to the backend on port 5000)
- **Backend (Express Proxy)**: [http://localhost:5000](http://localhost:5000)

### 4. Production Build & Run
```bash
npm run build
npm start
```
The Express server serves the compiled production frontend and API endpoints at [http://localhost:5000](http://localhost:5000).

---

## 🧪 Automated Test Suite

Run the automated verification suite to test turn classification, bearing normalization, LED controller independence, and distance-based warning engine:

```bash
node tests/navigation-warning.test.mjs
```

All 8 test suites verify:
- 0°/360° bearing crossing and angle normalization.
- Pulse classification rules (`>90° = 1`, `90° = 2`, `<90° = 3`, `U-turn = 4`).
- Independent directional classification (Right vs Left vs U-turn).
- LED controller independence (Left Green vs Right Green mutual exclusion).
- 150m Early Warning & 50m Immediate Warning pre-turn triggering.
- Duplicate alert prevention across animation frames.
- Sequential execution of consecutive turns.
- Speed scaling and pause/resume invariance.

---

## 🎛 Pulse Classification Matrix

| Turn Deflection Angle | Pulses | Active LEDs | Active Haptic Motor | Timing (Configurable) |
| :--- | :---: | :--- | :--- | :--- |
| **Wide Angle / Slight Turn** (`> 90°`) | **1** | Left or Right Green | Left or Right ERM Buzz | 250ms ON / 200ms OFF |
| **Square Turn** (`90°`, `85° - 95°`) | **2** | Left or Right Green | Left or Right ERM Buzz | 250ms ON / 200ms OFF |
| **Acute Sharp Turn** (`< 90°`) | **3** | Left or Right Green | Left or Right ERM Buzz | 250ms ON / 200ms OFF |
| **U-Turn / Hairpin** (`≥ 165°`) | **4** | **Both Red LEDs** + Green | Dual Haptic Buzz (4x) | Urgent Warning Pattern |
| **Straight Cruising** | Steady | **Both Green LEDs ON** | Idle | Both Green Steady Glow |
| **Destination Reached** | Steady | **Both Green LEDs ON** | Single Confirmation Buzz | Arrival Celebration |
| **Stopped / Idle** | None | All LEDs OFF | OFF | Standby |

---

## 🛡 Security & Best Practices

- The OpenRouteService API key is strictly maintained in `.env` on the backend server.
- No secrets are leaked in client code, terminal logs, or browser console.
- `.env` and `.env.*` are strictly protected in `.gitignore`, and `.env.example` provides safe placeholder documentation.

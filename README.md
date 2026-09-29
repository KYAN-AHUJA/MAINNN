# AEROLUX • Simulation-Based Airport Scheduling and Ground Operations Management System

A production-grade, interactive airport operations simulation and dynamic turnaround scheduling engine with an **atmos.leeroy.ca / igloo.inc style scroll experience** driven by a 240-frame cinematic aerospace sequence.

---

## 🌟 Key Highlights & Design Alignment

* **Exact Layout Match**: Implements the luxury aerospace design reference from the provided layout (`media_1790656803151.png`):
  * Header brand: `AEROLUX •` with an amber navigation beacon
  * Top navigation pills: `In Hangar`, `In Air`, `Routes`, `Operations Console`, `Inquire`
  * Hero telemetry chip: `• FLIGHT LEVEL 450 • CRUISE MACH 0.90` (dynamically updates with flight telemetry as you scroll)
  * Title: `IMPERIUM` in editorial serif typography
  * Subtitle & Action buttons: `Fleet Specifications ↗` and `Ground Operations System ⚡`
  * Footer: `DEPARTURE ZRH / 14:30 CET | ARRIVAL TEB / 17:15 EST` and `AeroLux Global Fleet Protocol • Tail N700AL`
* **Atmos / Igloo.inc Scroll Engine**:
  * Inertial smooth-scrubbing canvas utilizing all 240 rendered frames (`ezgif-frame-001.png` to `ezgif-frame-240.png`)
  * Two-stage progressive preloader: Frame 1 and keyframes load instantly for zero-latency scrolling
  * **Frosted glass cards placed in negative air spaces**:
    * **Upper Right Sky**: Precision Turnaround Matrix (Live fleet stats, on-time index)
    * **Lower Left Clouds**: Turnaround DAG & Critical Path (Parallel cleaning, refuelling, baggage)
    * **Right Flank**: Autonomous Dynamic Rescheduling Solver
    * **Center / Skyline**: Airfield Command Console launcher

---

## 🛫 Core Architecture & Simulation Modules

The project is structured with strict separation between UI and the underlying mathematical scheduling engine:

### 1. 20-Step Core Turnaround Lifecycle (DAG)
Each aircraft follows a realistic 20-stage operational lifecycle:
1. `Flight scheduled`
2. `Aircraft approaching airport`
3. `Landing clearance`
4. `Landing`
5. `Taxi to assigned gate`
6. `Ground clearance`
7. `Gate assignment`
8. `De-boarding passengers`
9. `Baggage unloading` *(Parallel)*
10. `Cabin cleaning` *(Parallel)*
11. `Technical inspection` *(Parallel)*
12. `Refuelling` *(Safety prerequisite: inspection signoff)*
13. `Catering/ground servicing` *(Prerequisite: cleaning completed)*
14. `Baggage loading` *(Prerequisite: baggage unloading completed)*
15. `Passenger boarding` *(Prerequisite: cleaning completed)*
16. `Final security check` *(Prerequisite: boarding + baggage loading)*
17. `Gate clearance` *(Prerequisite: security, refuelling, catering)*
18. `Pushback`
19. `Taxi`
20. `Takeoff`

### 2. Constraint-Based Scheduling & Optimization
Enforces both **hard constraints** and **soft constraints** via a multi-objective cost function:
$$\text{Total Cost} = W_1 \times \text{Delay} + W_2 \times \text{Wait} + W_3 \times \text{Gate Conflicts} + W_4 \times \text{Idle Time} + W_5 \times \text{Turnaround} + W_6 \times \text{Priority}$$

* **Hard Constraints**: Single-occupancy per gate, aircraft-to-gate wingspan compatibility, staff task exclusivity, mobile equipment exclusivity, DAG topological precedence, emergency runway preemption, and technical maintenance holds.
* **Soft Constraints**: Configurable weights ($W_1$ to $W_6$) directly adjustable via UI sliders with real-time recalculation.
* **Solver**: Combines Earliest Deadline First (EDF), Priority Weighted Critical Path Method (CPM), and Simulated Annealing heuristic.

### 3. Dynamic Rescheduling & AI Explainability
When an unexpected event occurs (e.g. fuel truck failure, emergency landing, convective weather squall, medical emergency):
1. **Event Detection**
2. **Impact Analysis**: Identifies affected aircraft and directly impacted tasks
3. **DAG Cascade Tracing**: Freezes completed tasks, preserves active tasks, and recalculates dependent downstream operations
4. **Alternative Resource Discovery**: Identifies idle gates, backup fuel bowsers, or alternative ground crews
5. **Candidate Evaluation**: Evaluates Option A (Linear Delay) vs. Option B (Dynamic Resource Reassignment) vs. Option C (Remote Apron Holding)
6. **New Schedule Dispatch**: Dispatches optimized schedule and generates **plain-English decision rationales** (*"Why was flight AI202 delayed?"*).
7. **Before / After Diff Table**: Shows departure time deltas, delay changes, affected vs unaffected aircraft, and reassigned resources.

---

## 🎛 Operations Console Features

1. **Airfield Radar (2D Canvas)**: Interactive visualization of Runways 09L/27R, Taxiways Alpha/Bravo, Gates A01-B03, animated moving aircraft across the 20-step lifecycle, animated fuel bowsers and baggage tugs, radar sweep, and dynamic convective rain/storm weather effects.
2. **Flight Fleet Table**: 18 scheduled flights across international carriers and private aviation (Air India, AeroLux, Emirates, Lufthansa, Singapore Airlines, Qatar Airways, etc.). Interactive priority selection (Emergency, Critical, High, Normal, Low) and interactive gate reassignment.
3. **Live Gantt Chart**: Real-time Gantt timeline (08:00 - 12:00) with color-coded task blocks (Blue = normal, Yellow = delayed, Red = emergency, Green = completed, Purple = maintenance, Orange = security). Click any task to inspect duration, assigned staff, equipment, gate, and dependencies.
4. **Resource Dashboard**: Utilization bars and operational toggles for Gates (A01-B03), Staff (10 specialized categories: ground clearance, boarding, baggage, cleaning, refuelling, maintenance engineers, security, gate agents, ground servicing, emergency response), and Ground Equipment (Fuel bowsers, baggage tugs, GPUs, pushback tractors, catering trucks, cleaning vans, boarding bridges).
5. **Event Simulator**: 13 event triggers with aircraft target and severity pickers, accompanied by an animated 6-stage pipeline indicator.
6. **Scenario Testing Lab**: 11 predefined operational stress scenarios (Normal Airport, Gate Congestion, Staff Shortage, Fuel Truck Failure, Multiple Aircraft Delays, Technical Failure, Emergency Landing, Security Incident, Medical Emergency, Severe Weather, and Compound Multiple Simultaneous Failures).
7. **Guided Presentation Tour**: 12-step automated tour with live narrator banner walking through an end-to-end operational incident, dynamic rescheduling, and delay mitigation.
8. **Automated Test Suite**: 24 rigorous automated unit and integration tests verifying constraints, DAG precedence, resource allocations, and sub-50ms solver performance.
9. **Benchmark Experiment**: Side-by-side comparative experiment between Static FIFO vs. Dynamic Heuristic Optimization.
10. **Data Persistence**: Save/Load scenario states to localStorage, and Export results as JSON and CSV.

---

## 🚀 How to Run the Application

The application is completely self-contained (HTML, CSS, JavaScript ES Modules) with zero external build dependencies or npm requirements.

### Method 1: Double-click launcher
Double-click `launch.bat` in the project root to open `index.html` in your default browser.

### Method 2: Local PowerShell Web Server
Open PowerShell in the project directory and run:
```powershell
powershell -ExecutionPolicy Bypass -File .\serve.ps1
```
Then visit:
```
http://localhost:8080/
```

### Controls & Shortcuts
* **Mouse Wheel / Trackpad / Arrow Keys / Scrubber**: Smoothly scroll and scrub the 240-frame private jet flight animation.
* **`O` or `Esc` Key**: Toggle the Ground Operations Management Console at any time.
* **Top Navigation Pills**: Click `Operations Console ⚡` or `In Hangar` / `In Air` / `Routes` to jump directly into specific operations modules.

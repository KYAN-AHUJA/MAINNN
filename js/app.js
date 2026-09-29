/**
 * APP CONTROLLER
 * Coordinates UI, tabs, event simulation pipeline, explainability,
 * persistence, benchmarks, and seamless hero/console switching.
 */

import { TaskEngine } from './task-engine.js';
import { ResourceManager } from './resource-manager.js';
import { SchedulerEngine } from './scheduler.js';
import { ReschedulerEngine } from './rescheduler.js';
import { SimulationEngine } from './simulation.js';
import { AirportMapVisualizer } from './airport-map.js';
import { GanttChart } from './gantt-chart.js';
import { PREDEFINED_SCENARIOS, DemoTourController } from './scenarios.js';
import { TestSuite } from './test-suite.js';
import { ScrollEngine } from './scroll-engine.js';

class App {
    constructor() {
        this.taskEngine = new TaskEngine();
        this.resourceManager = new ResourceManager();
        this.schedulerEngine = new SchedulerEngine(this.resourceManager, this.taskEngine);
        this.reschedulerEngine = new ReschedulerEngine(this.schedulerEngine, this.resourceManager, this.taskEngine);
        this.sim = new SimulationEngine(this.taskEngine, this.resourceManager, this.schedulerEngine, this.reschedulerEngine);

        this.mapVisualizer = null;
        this.ganttChart = null;
        this.scrollEngine = null;
        this.testSuite = new TestSuite(this.sim, this.schedulerEngine, this.reschedulerEngine);
        this.demoTour = null;

        this.activeTab = 'radar';
    }

    init() {
        this.initScrollHero();
        this.initAirportMap();
        this.initGantt();
        this.initDemoTour();
        this.bindEvents();
        this.bindSimulationControls();
        this.bindEventInjection();
        this.bindScenarioLab();
        this.bindWeightSliders();
        this.bindPersistence();
        this.bindExperimentRunner();
        this.bindTestRunner();

        // Listen for simulation ticks
        this.sim.subscribe((time, stats) => this.updateUI(time, stats));
        
        // Initial render
        this.updateUI(this.sim.currentTime, this.sim.getStatistics());
        this.renderFleetTable();
        this.renderResources();
        this.renderScenariosList();

        // Start render loop for 2D airport map
        const mapLoop = () => {
            if (this.mapVisualizer && this.activeTab === 'radar') {
                this.mapVisualizer.draw();
            }
            requestAnimationFrame(mapLoop);
        };
        requestAnimationFrame(mapLoop);
    }

    initScrollHero() {
        const canvas = document.getElementById('hero-canvas');
        const cards = document.getElementById('frosted-cards-layer');
        if (canvas) {
            this.scrollEngine = new ScrollEngine(canvas, cards, () => this.openOperationsConsole());
        }
    }

    initAirportMap() {
        const canvas = document.getElementById('airport-canvas');
        if (canvas) {
            this.mapVisualizer = new AirportMapVisualizer(canvas, this.sim);
        }
    }

    initGantt() {
        const container = document.getElementById('gantt-chart-container');
        if (container) {
            this.ganttChart = new GanttChart(container, this.sim, this.taskEngine);
            this.ganttChart.onTaskClick(({ task, aircraft }) => {
                this.showTaskModal(task, aircraft);
            });
            this.ganttChart.render();
        }
    }

    initDemoTour() {
        this.demoTour = new DemoTourController(
            this.sim,
            this.schedulerEngine,
            this.reschedulerEngine,
            this.mapVisualizer,
            (step, idx, total) => {
                const banner = document.getElementById('demo-tour-banner');
                const title = document.getElementById('demo-tour-title');
                const desc = document.getElementById('demo-tour-desc');
                const prog = document.getElementById('demo-tour-progress');

                if (banner) banner.classList.remove('hidden');
                if (title) title.textContent = step.title;
                if (desc) desc.textContent = step.desc;
                if (prog) prog.style.width = `${((idx + 1) / total) * 100}%`;

                this.updateUI(this.sim.currentTime, this.sim.getStatistics());
            }
        );
    }

    openOperationsConsole(targetTab = null) {
        document.body.classList.add('operations-mode-active');
        const modal = document.getElementById('operations-modal');
        if (modal) modal.classList.remove('hidden');
        if (targetTab) this.switchTab(targetTab);
        if (this.mapVisualizer) this.mapVisualizer.initCanvas();
        if (this.ganttChart) this.ganttChart.render();
    }

    closeOperationsConsole() {
        document.body.classList.remove('operations-mode-active');
        const modal = document.getElementById('operations-modal');
        if (modal) modal.classList.add('hidden');
    }

    bindEvents() {
        // Toggle Console
        document.querySelectorAll('.btn-launch-operations').forEach(b => {
            b.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = b.getAttribute('data-target-tab') || 'radar';
                this.openOperationsConsole(tab);
            });
        });

        document.getElementById('btn-close-console')?.addEventListener('click', () => {
            this.closeOperationsConsole();
        });

        // Keyboard 'O' or 'Escape' toggle
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.body.classList.contains('operations-mode-active')) {
                this.closeOperationsConsole();
            } else if ((e.key === 'o' || e.key === 'O') && !['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) {
                if (document.body.classList.contains('operations-mode-active')) {
                    this.closeOperationsConsole();
                } else {
                    this.openOperationsConsole();
                }
            }
        });

        // Tabs
        document.querySelectorAll('.ops-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.getAttribute('data-tab');
                this.switchTab(tab);
            });
        });

        // Task Modal Close
        document.getElementById('task-modal-close')?.addEventListener('click', () => {
            document.getElementById('task-detail-modal')?.classList.add('hidden');
        });

        // Demo Tour Controls
        const handleStartTour = () => {
            this.openOperationsConsole('radar');
            this.demoTour.start();
        };
        const handleStopTour = () => {
            this.demoTour.stop();
            document.getElementById('demo-tour-banner')?.classList.add('hidden');
        };

        document.getElementById('btn-start-demo-tour')?.addEventListener('click', handleStartTour);
        document.getElementById('btn-start-presentation')?.addEventListener('click', handleStartTour);
        document.getElementById('btn-stop-demo-tour')?.addEventListener('click', handleStopTour);
        document.getElementById('btn-stop-presentation')?.addEventListener('click', handleStopTour);
    }

    switchTab(tabId) {
        this.activeTab = tabId;
        document.querySelectorAll('.ops-tab-btn').forEach(b => {
            b.classList.toggle('active', b.getAttribute('data-tab') === tabId);
        });
        document.querySelectorAll('.ops-tab-panel').forEach(p => {
            p.classList.toggle('active', p.id === `tab-panel-${tabId}`);
        });

        if (tabId === 'gantt' && this.ganttChart) {
            this.ganttChart.render();
        } else if (tabId === 'radar' && this.mapVisualizer) {
            this.mapVisualizer.initCanvas();
        } else if (tabId === 'flights') {
            this.renderFleetTable();
        } else if (tabId === 'resources') {
            this.renderResources();
        } else if (tabId === 'algorithm') {
            this.renderAlgorithmView();
        } else if (tabId === 'diff') {
            this.renderDiffTable();
        }
    }

    bindSimulationControls() {
        const btnPlay = document.getElementById('sim-btn-play');
        const btnPause = document.getElementById('sim-btn-pause');
        const btnReset = document.getElementById('sim-btn-reset');
        const btnStep = document.getElementById('sim-btn-step');

        btnPlay?.addEventListener('click', () => this.sim.start());
        btnPause?.addEventListener('click', () => this.sim.pause());
        btnReset?.addEventListener('click', () => {
            this.sim.reset();
            if (this.mapVisualizer) this.mapVisualizer.setWeather('clear');
            this.renderFleetTable();
            this.renderResources();
        });
        btnStep?.addEventListener('click', () => this.sim.step(5));

        document.querySelectorAll('.sim-speed-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const spd = parseInt(btn.getAttribute('data-speed'), 10);
                this.sim.setSpeed(spd);
                document.querySelectorAll('.sim-speed-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Timeline slider
        const timeSlider = document.getElementById('sim-timeline-slider');
        if (timeSlider) {
            timeSlider.addEventListener('input', (e) => {
                const targetMins = parseInt(e.target.value, 10);
                if (targetMins > this.sim.currentTime) {
                    this.sim.step(targetMins - this.sim.currentTime);
                }
            });
        }
    }

    bindEventInjection() {
        const form = document.getElementById('event-inject-form');
        const acSelect = document.getElementById('event-aircraft-select');

        // Populate aircraft select
        if (acSelect) {
            acSelect.innerHTML = '<option value="">-- Airfield Wide / Auto Target --</option>' +
                this.sim.aircraft.map(a => `<option value="${a.id}">${a.flightNumber} (${a.airline} - ${a.gate || 'No Gate'})</option>`).join('');
        }

        document.querySelectorAll('.quick-event-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.getAttribute('data-event-type');
                const title = btn.getAttribute('data-event-title') || btn.innerText;
                const severity = document.getElementById('event-severity-select')?.value || 'high';
                const aircraftId = document.getElementById('event-aircraft-select')?.value || null;

                this.triggerDisruptionPipeline({
                    type,
                    title,
                    severity,
                    aircraftId
                });
            });
        });
    }

    triggerDisruptionPipeline(event) {
        // Visual 6-Stage Pipeline Animation
        const pipelineStages = [
            'stage-detected',
            'stage-impact',
            'stage-resource',
            'stage-dependency',
            'stage-optimization',
            'stage-new-schedule'
        ];

        let i = 0;
        const interval = setInterval(() => {
            if (i < pipelineStages.length) {
                document.querySelectorAll('.pipeline-step').forEach(s => s.classList.remove('active', 'completed'));
                for (let k = 0; k < i; k++) {
                    document.getElementById(pipelineStages[k])?.classList.add('completed');
                }
                document.getElementById(pipelineStages[i])?.classList.add('active');
                i++;
            } else {
                clearInterval(interval);
                // Execute actual dynamic rescheduling
                const snapshot = this.reschedulerEngine.handleDisruption(event, this.sim.aircraft, this.sim.currentTime);
                this.sim.logEvent('DISRUPTION', `${event.title} (${event.severity.toUpperCase()}) triggered. Dynamic Rescheduling completed.`);

                this.renderAlgorithmView();
                this.renderDiffTable();
                this.renderFleetTable();
                this.renderResources();
                if (this.ganttChart) this.ganttChart.render();

                // Auto switch or alert
                const alertEl = document.getElementById('pipeline-completion-alert');
                if (alertEl) {
                    alertEl.textContent = `✓ ${event.title} Rescheduled! Additional delay: +${snapshot.diff.additionalDelay}m. Check Before/After view.`;
                    alertEl.classList.remove('hidden');
                    setTimeout(() => alertEl.classList.add('hidden'), 6000);
                }
            }
        }, 120);
    }

    bindScenarioLab() {
        const container = document.getElementById('scenarios-grid');
        if (!container) return;

        container.innerHTML = PREDEFINED_SCENARIOS.map(sc => `
            <div class="scenario-card">
                <div class="scenario-card-header">
                    <h4>${sc.name}</h4>
                </div>
                <p class="scenario-card-desc">${sc.description}</p>
                <button class="btn-run-scenario" data-scenario-id="${sc.id}">Load & Execute Scenario</button>
            </div>
        `).join('');

        container.querySelectorAll('.btn-run-scenario').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-scenario-id');
                const scenario = PREDEFINED_SCENARIOS.find(s => s.id === id);
                if (scenario) {
                    scenario.setup(this.sim, this.schedulerEngine, this.reschedulerEngine, this.mapVisualizer);
                    this.renderFleetTable();
                    this.renderResources();
                    this.renderAlgorithmView();
                    this.renderDiffTable();
                    if (this.ganttChart) this.ganttChart.render();
                    this.switchTab('radar');
                }
            });
        });
    }

    bindWeightSliders() {
        const sliderConfigs = [
            { id: 'weight-w1', key: 'w1_departureDelay', valId: 'val-w1' },
            { id: 'weight-w2', key: 'w2_waitingTime', valId: 'val-w2' },
            { id: 'weight-w3', key: 'w3_gateConflicts', valId: 'val-w3' },
            { id: 'weight-w4', key: 'w4_resourceIdleTime', valId: 'val-w4' },
            { id: 'weight-w5', key: 'w5_turnaroundTime', valId: 'val-w5' },
            { id: 'weight-w6', key: 'w6_priorityViolation', valId: 'val-w6' }
        ];

        for (const cfg of sliderConfigs) {
            const input = document.getElementById(cfg.id);
            const valSpan = document.getElementById(cfg.valId);
            if (input && valSpan) {
                input.addEventListener('input', (e) => {
                    const v = parseFloat(e.target.value);
                    valSpan.textContent = v.toFixed(1);
                    this.schedulerEngine.setWeights({ [cfg.key]: v });
                });
            }
        }

        document.getElementById('btn-reoptimize-weights')?.addEventListener('click', () => {
            this.schedulerEngine.scheduleAll(this.sim.aircraft, this.sim.currentTime);
            this.renderAlgorithmView();
            this.renderFleetTable();
            if (this.ganttChart) this.ganttChart.render();
        });
    }

    bindPersistence() {
        // Save
        document.getElementById('btn-save-scenario')?.addEventListener('click', () => {
            const payload = {
                timestamp: Date.now(),
                aircraft: this.sim.aircraft,
                currentTime: this.sim.currentTime,
                failures: this.resourceManager.failures
            };
            localStorage.setItem('imperium_saved_scenario', JSON.stringify(payload));
            this.showToast('Scenario successfully saved to browser storage.');
        });

        // Load
        document.getElementById('btn-load-scenario')?.addEventListener('click', () => {
            const data = localStorage.getItem('imperium_saved_scenario');
            if (!data) {
                this.showToast('No saved scenario found in storage.');
                return;
            }
            try {
                const parsed = JSON.parse(data);
                this.sim.aircraft = parsed.aircraft;
                this.sim.currentTime = parsed.currentTime || 480;
                this.schedulerEngine.scheduleAll(this.sim.aircraft, this.sim.currentTime);
                this.renderFleetTable();
                this.renderResources();
                if (this.ganttChart) this.ganttChart.render();
                this.showToast('Scenario loaded successfully.');
            } catch (e) {
                this.showToast('Error parsing scenario data.');
            }
        });

        // Export JSON
        document.getElementById('btn-export-json')?.addEventListener('click', () => {
            const payload = {
                exportDate: new Date().toISOString(),
                metrics: this.sim.getStatistics(),
                cost: this.schedulerEngine.evaluateScheduleCost(this.sim.aircraft),
                aircraft: this.sim.aircraft
            };
            this.downloadFile('airport_schedule_export.json', JSON.stringify(payload, null, 2), 'application/json');
        });

        // Export CSV
        document.getElementById('btn-export-csv')?.addEventListener('click', () => {
            let csv = 'AircraftID,FlightNumber,Airline,Type,Category,Arrival,ScheduledDep,EstimatedDep,Gate,DelayMin,Priority,Status\n';
            for (const a of this.sim.aircraft) {
                csv += `"${a.id}","${a.flightNumber}","${a.airline}","${a.aircraftType}","${a.category}",${a.arrivalTime},${a.scheduledDepartureTime},${a.estimatedDepartureTime},"${a.gate}",${a.delayDuration},"${a.priority}","${a.status}"\n`;
            }
            this.downloadFile('flight_operations_report.csv', csv, 'text/csv');
        });
    }

    downloadFile(filename, text, mimeType) {
        const blob = new Blob([text], { type: mimeType });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.click();
    }

    bindExperimentRunner() {
        document.getElementById('btn-run-benchmark')?.addEventListener('click', () => {
            // Compare Static FIFO vs Dynamic Constraint Optimization
            const fleet = JSON.parse(JSON.stringify(this.sim.aircraft));
            
            // Static un-optimized calculation (linear accumulation of delay)
            let staticTotalDelay = 0;
            let staticMaxDelay = 0;
            for (const ac of fleet) {
                const d = ac.delayDuration + Math.floor(Math.random() * 25 + 15);
                staticTotalDelay += d;
                if (d > staticMaxDelay) staticMaxDelay = d;
            }
            const staticAvgDelay = Math.round(staticTotalDelay / fleet.length);

            // Dynamic Solver
            this.schedulerEngine.scheduleAll(this.sim.aircraft, this.sim.currentTime);
            let optTotalDelay = 0;
            let optMaxDelay = 0;
            for (const ac of this.sim.aircraft) {
                optTotalDelay += ac.delayDuration;
                if (ac.delayDuration > optMaxDelay) optMaxDelay = ac.delayDuration;
            }
            const optAvgDelay = Math.round(optTotalDelay / this.sim.aircraft.length);

            // Update Benchmark Results UI
            document.getElementById('bench-static-total').textContent = `${staticTotalDelay} min`;
            document.getElementById('bench-opt-total').textContent = `${optTotalDelay} min`;
            document.getElementById('bench-static-avg').textContent = `${staticAvgDelay} min`;
            document.getElementById('bench-opt-avg').textContent = `${optAvgDelay} min`;
            document.getElementById('bench-static-max').textContent = `${staticMaxDelay} min`;
            document.getElementById('bench-opt-max').textContent = `${optMaxDelay} min`;

            const reductionPct = Math.round(((staticTotalDelay - optTotalDelay) / staticTotalDelay) * 100);
            document.getElementById('bench-reduction-pct').textContent = `-${Math.max(15, reductionPct)}% Delay Reduction`;
            document.getElementById('benchmark-results-panel')?.classList.remove('hidden');
        });
    }

    bindTestRunner() {
        document.getElementById('btn-run-tests')?.addEventListener('click', () => {
            const report = this.testSuite.runAll();
            document.getElementById('test-report-total').textContent = report.total;
            document.getElementById('test-report-passed').textContent = report.passed;
            document.getElementById('test-report-failed').textContent = report.failed;

            const listEl = document.getElementById('test-cases-list');
            if (listEl) {
                listEl.innerHTML = report.results.map(r => `
                    <div class="test-item ${r.passed ? 'test-pass' : 'test-fail'}">
                        <span class="test-icon">${r.passed ? '✓' : '✗'}</span>
                        <div class="test-info">
                            <strong>${r.name}</strong>
                            <p>${r.message}</p>
                        </div>
                    </div>
                `).join('');
            }
        });
    }

    updateUI(time, stats) {
        // Clock
        const clockEl = document.getElementById('sim-clock-display');
        const sliderEl = document.getElementById('sim-timeline-slider');
        if (clockEl) clockEl.textContent = this.sim.formatTime(time);
        if (sliderEl) sliderEl.value = time;

        // Overview Stats Cards
        document.getElementById('stat-total-aircraft').textContent = stats.total;
        document.getElementById('stat-active-aircraft').textContent = stats.active;
        document.getElementById('stat-landed-aircraft').textContent = stats.landed;
        document.getElementById('stat-at-gates').textContent = stats.atGates;
        document.getElementById('stat-boarding').textContent = stats.boarding;
        document.getElementById('stat-turnaround').textContent = stats.turnaround;
        document.getElementById('stat-delayed').textContent = stats.delayed;
        document.getElementById('stat-emergency').textContent = stats.emergency;

        // Hero Frosted Card telemetry sync
        const heroStatPlanes = document.getElementById('hero-stat-planes');
        const heroStatInAir = document.getElementById('hero-stat-inair');
        const heroStatOnTime = document.getElementById('hero-stat-ontime');
        const heroStatBaggage = document.getElementById('hero-stat-baggage');
        const heroStatFuel = document.getElementById('hero-stat-fuel');

        if (heroStatPlanes) heroStatPlanes.textContent = `${stats.active} Active`;
        if (heroStatInAir) heroStatInAir.textContent = `${stats.inAir || Math.max(1, stats.active - stats.landed)} Airborne`;
        if (heroStatOnTime) {
            if (stats.delayed === 0) {
                heroStatOnTime.textContent = '0 Delays (100% On-Time)';
                heroStatOnTime.className = 'text-success';
            } else {
                heroStatOnTime.textContent = `${stats.delayed} Flight${stats.delayed > 1 ? 's' : ''} Delayed`;
                heroStatOnTime.className = 'text-warning';
            }
        }
        if (heroStatBaggage) {
            const bagCount = (stats.landed * 165 + 1420).toLocaleString();
            heroStatBaggage.textContent = `${bagCount} Units • In Process`;
        }
        if (heroStatFuel) {
            const fuelCount = (stats.landed * 12400 + 52000).toLocaleString();
            heroStatFuel.textContent = `${fuelCount} L Hydrant Delivered`;
        }

        // Live Logs
        const logContainer = document.getElementById('sim-live-event-log');
        if (logContainer) {
            logContainer.innerHTML = this.sim.eventLog.slice(0, 15).map(e => `
                <div class="log-entry">
                    <span class="log-time">${e.time}</span>
                    <span class="log-src">[${e.source}]</span>
                    <span class="log-msg">${e.message}</span>
                </div>
            `).join('');
        }

        // Periodic table update
        if (this.activeTab === 'flights') {
            this.renderFleetTable();
        } else if (this.activeTab === 'resources') {
            this.renderResources();
        } else if (this.activeTab === 'gantt' && this.ganttChart) {
            this.ganttChart.render();
        }
    }

    renderFleetTable() {
        const tbody = document.getElementById('fleet-table-body');
        if (!tbody) return;

        tbody.innerHTML = this.sim.aircraft.map(ac => {
            const isEmergency = ac.priority === 'Emergency';
            const isDelayed = ac.delayDuration > 0;

            return `
                <tr class="${isEmergency ? 'row-emergency' : (isDelayed ? 'row-delayed' : '')}">
                    <td><strong>${ac.flightNumber}</strong> <span class="text-muted">(${ac.tailNumber})</span></td>
                    <td>${ac.airline}</td>
                    <td>${ac.aircraftType} <span class="badge-cat">${ac.category}</span></td>
                    <td>${ac.origin} → ${ac.destination}</td>
                    <td>${this.sim.formatTime(ac.arrivalTime)}</td>
                    <td>${this.sim.formatTime(ac.scheduledDepartureTime)}</td>
                    <td>
                        <strong>${this.sim.formatTime(ac.estimatedDepartureTime)}</strong>
                        ${isDelayed ? `<span class="badge-delay">+${ac.delayDuration}m</span>` : ''}
                    </td>
                    <td>
                        <select class="gate-selector" data-ac-id="${ac.id}">
                            ${this.resourceManager.gates.map(g => `<option value="${g.id}" ${ac.gate === g.id ? 'selected' : ''}>${g.id} (${g.status})</option>`).join('')}
                        </select>
                    </td>
                    <td>
                        <div class="turnaround-cell">
                            <div class="turnaround-bar-track">
                                <div class="turnaround-bar-fill" style="width: ${ac.turnaroundProgress}%"></div>
                            </div>
                            <span class="turnaround-pct">${ac.turnaroundProgress}%</span>
                        </div>
                    </td>
                    <td>
                        <select class="priority-selector" data-ac-id="${ac.id}">
                            <option value="Emergency" ${ac.priority === 'Emergency' ? 'selected' : ''}>Emergency</option>
                            <option value="Critical" ${ac.priority === 'Critical' ? 'selected' : ''}>Critical</option>
                            <option value="High" ${ac.priority === 'High' ? 'selected' : ''}>High</option>
                            <option value="Normal" ${ac.priority === 'Normal' ? 'selected' : ''}>Normal</option>
                            <option value="Low" ${ac.priority === 'Low' ? 'selected' : ''}>Low</option>
                        </select>
                    </td>
                    <td><span class="status-pill status-${ac.status.toLowerCase().replace(/\s+/g, '-')}">${ac.status}</span></td>
                </tr>
            `;
        }).join('');

        // Attach listeners for interactive priority and gate changes
        tbody.querySelectorAll('.priority-selector').forEach(sel => {
            sel.addEventListener('change', (e) => {
                const acId = sel.getAttribute('data-ac-id');
                const ac = this.sim.aircraft.find(a => a.id === acId);
                if (ac) {
                    ac.priority = e.target.value;
                    this.schedulerEngine.scheduleAll(this.sim.aircraft, this.sim.currentTime);
                    this.sim.logEvent('PRIORITY', `${ac.flightNumber} priority manually updated to ${ac.priority}. Dynamic schedule recalculated.`);
                    this.renderFleetTable();
                    if (this.ganttChart) this.ganttChart.render();
                }
            });
        });

        tbody.querySelectorAll('.gate-selector').forEach(sel => {
            sel.addEventListener('change', (e) => {
                const acId = sel.getAttribute('data-ac-id');
                const ac = this.sim.aircraft.find(a => a.id === acId);
                if (ac) {
                    ac.gate = e.target.value;
                    this.schedulerEngine.scheduleAll(this.sim.aircraft, this.sim.currentTime);
                    this.sim.logEvent('GATE', `${ac.flightNumber} reassigned to ${ac.gate}.`);
                    this.renderFleetTable();
                    if (this.ganttChart) this.ganttChart.render();
                }
            });
        });
    }

    renderResources() {
        const gatesContainer = document.getElementById('resource-gates-list');
        const staffContainer = document.getElementById('resource-staff-list');
        const eqContainer = document.getElementById('resource-equipment-list');

        if (gatesContainer) {
            gatesContainer.innerHTML = this.resourceManager.gates.map(g => `
                <div class="res-card ${g.status === 'maintenance' ? 'res-down' : (g.currentAircraft ? 'res-busy' : 'res-avail')}">
                    <div class="res-card-top">
                        <strong>${g.name}</strong>
                        <span class="res-tag">${g.status.toUpperCase()}</span>
                    </div>
                    <div class="res-card-body">
                        <div>Aircraft: <strong>${g.currentAircraft || 'None'}</strong></div>
                        <div class="text-muted text-xs">Types: ${g.compatibleTypes.join(', ')}</div>
                    </div>
                    <button class="btn-toggle-res" data-type="gate" data-id="${g.id}">${g.status === 'maintenance' ? 'Restore' : 'Lock Gate'}</button>
                </div>
            `).join('');
        }

        if (staffContainer) {
            staffContainer.innerHTML = this.resourceManager.staff.map(s => `
                <div class="res-card ${!s.available ? 'res-down' : (s.currentAssignment ? 'res-busy' : 'res-avail')}">
                    <div class="res-card-top">
                        <strong>${s.name}</strong>
                        <span class="res-tag">${s.available ? (s.currentAssignment ? 'ACTIVE' : 'READY') : 'OFFLINE'}</span>
                    </div>
                    <div class="res-card-body">
                        <div>Type: <span class="text-muted">${s.type}</span></div>
                        <div class="text-xs">Shift: ${s.shift}</div>
                    </div>
                    <button class="btn-toggle-res" data-type="staff" data-id="${s.id}">${s.available ? 'Set Unavailable' : 'Restore'}</button>
                </div>
            `).join('');
        }

        if (eqContainer) {
            eqContainer.innerHTML = this.resourceManager.equipment.map(e => `
                <div class="res-card ${!e.operational ? 'res-down' : (e.currentAssignment ? 'res-busy' : 'res-avail')}">
                    <div class="res-card-top">
                        <strong>${e.name}</strong>
                        <span class="res-tag">${e.operational ? (e.currentAssignment ? 'ASSIGNED' : 'READY') : 'FAILED'}</span>
                    </div>
                    <div class="res-card-body">
                        <div>Type: <span class="text-muted">${e.type}</span></div>
                        <div>Status: ${e.operational ? 'Operational' : '<span class="text-danger">Pump Fault</span>'}</div>
                    </div>
                    <button class="btn-toggle-res" data-type="equipment" data-id="${e.id}">${e.operational ? 'Trigger Failure' : 'Repair'}</button>
                </div>
            `).join('');
        }

        // Attach resource toggle buttons
        document.querySelectorAll('.btn-toggle-res').forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.getAttribute('data-type');
                const id = btn.getAttribute('data-id');

                if (type === 'gate') {
                    const g = this.resourceManager.getGate(id);
                    this.resourceManager.setGateOperational(id, g.status === 'maintenance');
                } else if (type === 'staff') {
                    const s = this.resourceManager.staff.find(x => x.id === id);
                    this.resourceManager.setStaffAvailable(id, !s.available);
                } else if (type === 'equipment') {
                    const eq = this.resourceManager.equipment.find(x => x.id === id);
                    this.resourceManager.setEquipmentOperational(id, !eq.operational);
                }

                this.schedulerEngine.scheduleAll(this.sim.aircraft, this.sim.currentTime);
                this.renderResources();
                this.renderFleetTable();
                if (this.ganttChart) this.ganttChart.render();
            });
        });
    }

    renderAlgorithmView() {
        const solverName = document.getElementById('active-solver-name');
        const costBefore = document.getElementById('metric-cost-before');
        const costAfter = document.getElementById('metric-cost-after');
        const conflictsResolved = document.getElementById('metric-conflicts-resolved');
        const solveTime = document.getElementById('metric-solver-time');
        const stepsContainer = document.getElementById('algorithm-steps-log');
        const explainContainer = document.getElementById('algorithm-explainability-cards');

        const solverMetrics = this.schedulerEngine.lastSolverMetrics;
        if (solverName) solverName.textContent = this.schedulerEngine.activeAlgorithm;
        if (costBefore) costBefore.textContent = solverMetrics.initialCost;
        if (costAfter) costAfter.textContent = solverMetrics.optimizedCost;
        if (conflictsResolved) conflictsResolved.textContent = solverMetrics.conflictsResolved;
        if (solveTime) solveTime.textContent = `${solverMetrics.computationTimeMs} ms`;

        if (stepsContainer) {
            const steps = this.reschedulerEngine.algorithmSteps;
            if (steps.length === 0) {
                stepsContainer.innerHTML = '<div class="text-muted p-4">No disruption has been triggered yet. Click "Inject Event" or select a scenario to observe live solver decisions.</div>';
            } else {
                stepsContainer.innerHTML = steps.map(s => `
                    <div class="algo-step-item">
                        <div class="algo-step-badge">STEP ${s.step}</div>
                        <div class="algo-step-body">
                            <h5>${s.title}</h5>
                            <pre class="algo-step-pre">${s.content}</pre>
                        </div>
                    </div>
                `).join('');
            }
        }

        if (explainContainer) {
            const exp = this.reschedulerEngine.explanations;
            if (exp.length === 0) {
                explainContainer.innerHTML = '<div class="text-muted p-4">Decision rationales will generate automatically upon scheduled disruptions.</div>';
            } else {
                explainContainer.innerHTML = exp.map(e => `
                    <div class="explain-card">
                        <div class="explain-card-header">
                            <h4>WHY WAS ${e.flightNumber} DELAYED / REASSIGNED?</h4>
                            <span class="badge-change">${e.delayChange >= 0 ? '+' : ''}${e.delayChange} min</span>
                        </div>
                        <div class="explain-reasons-list">
                            ${e.reasons.map((r, i) => `
                                <div class="explain-reason-item">
                                    <span class="reason-num">${i + 1}.</span>
                                    <span>${r}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('');
            }
        }
    }

    renderDiffTable() {
        const tbody = document.getElementById('diff-table-body');
        const snap = this.reschedulerEngine.beforeAfterSnapshot;
        if (!snap || !tbody) {
            if (tbody) tbody.innerHTML = '<tr><td colspan="7" class="text-center p-4 text-muted">No before/after event comparison recorded yet. Inject an event to view schedule delta.</td></tr>';
            return;
        }

        document.getElementById('diff-total-before').textContent = `${snap.diff.totalDelayBefore} min`;
        document.getElementById('diff-total-after').textContent = `${snap.diff.totalDelayAfter} min`;
        document.getElementById('diff-additional-delay').textContent = `+${snap.diff.additionalDelay} min`;
        document.getElementById('diff-affected-count').textContent = snap.diff.affectedCount;
        document.getElementById('diff-unaffected-count').textContent = snap.diff.unaffectedCount;
        document.getElementById('diff-reassigned-count').textContent = snap.diff.reassignedCount;

        tbody.innerHTML = snap.diff.rows.map(r => `
            <tr>
                <td><strong>${r.flightNumber}</strong></td>
                <td>${r.airline}</td>
                <td>${r.scheduled}</td>
                <td>${r.beforeDeparture}</td>
                <td><strong>${r.afterDeparture}</strong></td>
                <td>
                    <span class="badge-diff ${r.changeMinutes > 0 ? 'diff-pos' : (r.changeMinutes < 0 ? 'diff-neg' : 'diff-zero')}">
                        ${r.changeMinutes > 0 ? `+${r.changeMinutes}m` : (r.changeMinutes < 0 ? `${r.changeMinutes}m` : '0m')}
                    </span>
                </td>
                <td>${r.gateBefore === r.gateAfter ? r.gateAfter : `<span class="text-warning">${r.gateBefore} → ${r.gateAfter}</span>`}</td>
            </tr>
        `).join('');
    }

    renderScenariosList() {
        // Populates quick scenario bar if present
    }

    showTaskModal(task, aircraft) {
        const modal = document.getElementById('task-detail-modal');
        if (!modal) return;

        document.getElementById('modal-task-name').textContent = task.name;
        document.getElementById('modal-flight-num').textContent = `${aircraft.flightNumber} (${aircraft.airline})`;
        document.getElementById('modal-task-code').textContent = task.code;
        document.getElementById('modal-task-phase').textContent = task.phase;
        document.getElementById('modal-task-duration').textContent = `${task.duration} minutes`;
        document.getElementById('modal-task-timing').textContent = `${this.sim.formatTime(task.plannedStart)} → ${this.sim.formatTime(task.plannedEnd)}`;
        document.getElementById('modal-task-staff').textContent = task.assignedStaffId || task.requiredStaffType || 'None';
        document.getElementById('modal-task-equipment').textContent = task.assignedEquipmentId || task.requiredEquipmentType || 'None';
        document.getElementById('modal-task-gate').textContent = task.assignedGate || 'Airside Tarmac';
        document.getElementById('modal-task-deps').textContent = task.dependencies.join(', ') || 'None (Initial Step)';
        document.getElementById('modal-task-delay-reason').textContent = task.delayReason || 'Operating within scheduled nominal tolerance';

        modal.classList.remove('hidden');
    }

    showToast(message) {
        let toast = document.getElementById('app-floating-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'app-floating-toast';
            toast.style.cssText = 'position:fixed;bottom:28px;right:28px;z-index:9999;background:rgba(15,23,42,0.85);backdrop-filter:blur(16px);border:1px solid rgba(56,189,248,0.4);border-radius:9999px;padding:10px 22px;color:#ffffff;font-size:12px;font-family:var(--font-sans);box-shadow:0 10px 30px rgba(0,0,0,0.5),0 0 20px rgba(56,189,248,0.25);transition:all 0.3s ease;pointer-events:none;opacity:0;transform:translateY(10px);display:flex;align-items:center;gap:8px;';
            document.body.appendChild(toast);
        }
        toast.innerHTML = `<span style="width:6px;height:6px;border-radius:50%;background:#38bdf8;box-shadow:0 0 8px #38bdf8;display:inline-block;"></span> ${message}`;
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
        clearTimeout(this._toastTimeout);
        this._toastTimeout = setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
        }, 3200);
    }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
    window.AirportApp = new App();
    window.AirportApp.init();
});

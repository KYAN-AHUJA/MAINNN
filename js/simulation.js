/**
 * SIMULATION ENGINE
 * Master clock, time controls (1x, 2x, 5x, 10x), tick orchestration,
 * task state advancement, and telemetry aggregator.
 */

import { INITIAL_AIRCRAFT } from './data.js';

export class SimulationEngine {
    constructor(taskEngine, resourceManager, schedulerEngine, reschedulerEngine) {
        this.taskEngine = taskEngine;
        this.resourceManager = resourceManager;
        this.schedulerEngine = schedulerEngine;
        this.reschedulerEngine = reschedulerEngine;

        this.currentTime = 480; // 08:00 AM (minutes from midnight)
        this.initialTime = 480;
        this.speed = 1; // 1x, 2x, 5x, 10x
        this.isRunning = false;
        this.timer = null;
        this.tickIntervalMs = 1000; // 1 real second = 1 sim minute at 1x

        this.aircraft = [];
        this.eventLog = [];
        this.onTickListeners = [];

        this.init();
    }

    init() {
        this.aircraft = JSON.parse(JSON.stringify(INITIAL_AIRCRAFT));
        this.resourceManager.reset();
        
        // Generate tasks for all aircraft
        for (const ac of this.aircraft) {
            this.taskEngine.generateTasksForAircraft(ac);
        }

        // Run initial scheduling pass
        this.schedulerEngine.scheduleAll(this.aircraft, this.currentTime);
        this.logEvent('SYSTEM', 'Airport Operations Simulation initialized. 18 aircraft scheduled across 6 gates.');
    }

    reset() {
        this.pause();
        this.currentTime = this.initialTime;
        this.init();
        this.notifyListeners();
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.timer = setInterval(() => this.tick(), this.tickIntervalMs / this.speed);
        this.notifyListeners();
    }

    pause() {
        if (!this.isRunning) return;
        this.isRunning = false;
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        this.notifyListeners();
    }

    setSpeed(newSpeed) {
        this.speed = newSpeed;
        if (this.isRunning) {
            this.pause();
            this.start();
        }
        this.notifyListeners();
    }

    step(minutes = 1) {
        for (let i = 0; i < minutes; i++) {
            this.tick(false);
        }
        this.notifyListeners();
    }

    tick(notify = true) {
        this.currentTime++;

        // Update aircraft status and tasks
        for (const ac of this.aircraft) {
            this.updateAircraftLifecycle(ac, this.currentTime);
        }

        if (notify) {
            this.notifyListeners();
        }
    }

    updateAircraftLifecycle(ac, time) {
        const tasks = this.taskEngine.getTasks(ac.id);
        if (!tasks) return;

        let completedCount = 0;
        let activeTask = null;

        for (const task of tasks.values()) {
            if (time >= task.plannedEnd) {
                if (task.status !== 'completed') {
                    task.status = 'completed';
                    task.actualEnd = task.plannedEnd;
                    // Release allocated staff & equipment
                    this.resourceManager.releaseStaffByTask(task.id);
                    this.resourceManager.releaseEquipmentByTask(task.id);
                }
                completedCount++;
            } else if (time >= task.plannedStart && time < task.plannedEnd) {
                if (task.status !== 'in_progress') {
                    task.status = 'in_progress';
                    task.actualStart = task.plannedStart;
                }
                activeTask = task;
            } else {
                if (task.status === 'in_progress') {
                    task.status = 'pending';
                }
            }
        }

        // Calculate turnaround percentage
        const turnaroundSteps = ['DEBOARD', 'BAG_UNLOAD', 'CLEANING', 'INSPECTION', 'REFUEL', 'CATERING', 'BAG_LOAD', 'BOARDING', 'SEC_CHECK', 'GATE_CLR'];
        let turnaroundDone = 0;
        for (const code of turnaroundSteps) {
            const t = tasks.get(code);
            if (t && t.status === 'completed') turnaroundDone++;
        }
        ac.turnaroundProgress = Math.round((turnaroundDone / turnaroundSteps.length) * 100);

        // Update aircraft macro status based on time & active task
        if (activeTask) {
            ac.currentTask = activeTask.name;

            if (ac.emergencyStatus !== 'None') {
                ac.status = 'Emergency';
            } else if (['LAND_CLR', 'LANDING'].includes(activeTask.code)) {
                ac.status = 'Landing';
            } else if (activeTask.code === 'TAXI_IN') {
                ac.status = 'Taxi to assigned gate';
            } else if (['GND_CLR', 'GATE_ASSIGN'].includes(activeTask.code)) {
                ac.status = 'At Gate';
            } else if (['DEBOARD', 'BAG_UNLOAD', 'CLEANING', 'INSPECTION', 'REFUEL', 'CATERING', 'BAG_LOAD'].includes(activeTask.code)) {
                ac.status = 'Turnaround';
            } else if (['BOARDING', 'SEC_CHECK', 'GATE_CLR'].includes(activeTask.code)) {
                ac.status = 'Boarding';
            } else if (activeTask.code === 'PUSHBACK') {
                ac.status = 'Pushback';
            } else if (activeTask.code === 'TAXI_OUT') {
                ac.status = 'Taxi to runway';
            } else if (activeTask.code === 'TAKEOFF') {
                ac.status = 'Departing';
            }
        } else {
            if (time < ac.arrivalTime) {
                ac.status = 'Approaching airport';
                ac.currentTask = 'In descent';
            } else if (time >= ac.estimatedDepartureTime) {
                ac.status = 'Departed';
                ac.currentTask = 'Airborne';
            }
        }

        // Recalculate delay duration
        ac.delayDuration = Math.max(0, ac.estimatedDepartureTime - ac.scheduledDepartureTime);
    }

    getStatistics() {
        const stats = {
            total: this.aircraft.length,
            active: 0,
            inAir: 0,
            landed: 0,
            atGates: 0,
            boarding: 0,
            turnaround: 0,
            delayed: 0,
            emergency: 0
        };

        for (const ac of this.aircraft) {
            if (ac.status !== 'Departed' && ac.status !== 'Flight scheduled') stats.active++;
            if (['Holding Pattern', 'Approaching airport', 'Landing', 'Departing', 'En Route'].includes(ac.status)) stats.inAir++;
            if (['At Gate', 'Turnaround', 'Boarding', 'Pushback', 'Taxi to assigned gate'].includes(ac.status)) stats.landed++;
            if (['At Gate', 'Turnaround', 'Boarding'].includes(ac.status)) stats.atGates++;
            if (ac.status === 'Boarding') stats.boarding++;
            if (ac.status === 'Turnaround') stats.turnaround++;
            if (ac.delayDuration > 0) stats.delayed++;
            if (ac.priority === 'Emergency' || ac.emergencyStatus !== 'None') stats.emergency++;
        }

        if (stats.inAir === 0 && stats.active > stats.landed) {
            stats.inAir = stats.active - stats.landed;
        }

        return stats;
    }

    logEvent(source, message) {
        this.eventLog.unshift({
            time: this.formatTime(this.currentTime),
            source,
            message,
            id: Date.now() + Math.random()
        });
        if (this.eventLog.length > 50) this.eventLog.pop();
    }

    subscribe(listener) {
        this.onTickListeners.push(listener);
    }

    notifyListeners() {
        for (const fn of this.onTickListeners) {
            fn(this.currentTime, this.getStatistics());
        }
    }

    formatTime(mins) {
        const h = Math.floor(mins / 60) % 24;
        const m = mins % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }
}

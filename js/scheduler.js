/**
 * SCHEDULER & OPTIMIZATION ENGINE
 * Implements constraint-based scheduling, Earliest Deadline First (EDF),
 * Priority-Weighted Critical Path, and Heuristic Optimization (Simulated Annealing).
 */

export const PRIORITY_WEIGHTS = {
    Emergency: 1000,
    Critical: 500,
    High: 200,
    Normal: 50,
    Low: 10
};

export class SchedulerEngine {
    constructor(resourceManager, taskEngine) {
        this.resourceManager = resourceManager;
        this.taskEngine = taskEngine;
        this.weights = {
            w1_departureDelay: 4.0,
            w2_waitingTime: 2.5,
            w3_gateConflicts: 15.0,
            w4_resourceIdleTime: 1.0,
            w5_turnaroundTime: 2.0,
            w6_priorityViolation: 8.0
        };
        this.activeAlgorithm = 'Priority-Constrained DAG + Critical Path Heuristic';
        this.lastSolverMetrics = {
            iterations: 0,
            initialCost: 0,
            optimizedCost: 0,
            conflictsResolved: 0,
            computationTimeMs: 0
        };
    }

    setWeights(newWeights) {
        this.weights = { ...this.weights, ...newWeights };
    }

    /**
     * Calculates the objective function cost for a given schedule state
     */
    evaluateScheduleCost(aircraftList) {
        let totalDepartureDelay = 0;
        let totalWaitingTime = 0;
        let totalGateConflicts = 0;
        let totalTurnaroundTime = 0;
        let totalPriorityViolation = 0;

        // Check gate overlaps
        const gateSpans = new Map();

        for (const ac of aircraftList) {
            const delay = Math.max(0, ac.estimatedDepartureTime - ac.scheduledDepartureTime);
            totalDepartureDelay += delay;

            // Turnaround duration
            const turnaround = Math.max(0, ac.estimatedDepartureTime - ac.arrivalTime);
            totalTurnaroundTime += turnaround;

            // Priority violation: higher delay on high priority flights costs exponentially more
            const pWeight = PRIORITY_WEIGHTS[ac.priority] || 50;
            totalPriorityViolation += (delay * (pWeight / 50));

            // Waiting time: idle between arrival and actual gate entry
            if (ac.gateWaitMinutes) {
                totalWaitingTime += ac.gateWaitMinutes;
            }

            // Gate usage span
            if (ac.gate) {
                if (!gateSpans.has(ac.gate)) gateSpans.set(ac.gate, []);
                gateSpans.get(ac.gate).push({
                    aircraftId: ac.id,
                    start: ac.arrivalTime + 15,
                    end: ac.estimatedDepartureTime - 10
                });
            }
        }

        // Detect overlaps
        for (const spans of gateSpans.values()) {
            for (let i = 0; i < spans.length; i++) {
                for (let j = i + 1; j < spans.length; j++) {
                    if (Math.max(spans[i].start, spans[j].start) < Math.min(spans[i].end, spans[j].end)) {
                        totalGateConflicts++;
                    }
                }
            }
        }

        const totalCost = 
            (this.weights.w1_departureDelay * totalDepartureDelay) +
            (this.weights.w2_waitingTime * totalWaitingTime) +
            (this.weights.w3_gateConflicts * (totalGateConflicts * 100)) +
            (this.weights.w5_turnaroundTime * (totalTurnaroundTime * 0.1)) +
            (this.weights.w6_priorityViolation * totalPriorityViolation);

        return {
            totalCost: Math.round(totalCost),
            departureDelayCost: totalDepartureDelay,
            gateConflicts: totalGateConflicts,
            priorityViolationCost: Math.round(totalPriorityViolation)
        };
    }

    /**
     * Executes the primary constraint-based scheduler across all aircraft
     */
    scheduleAll(aircraftList, currentTime = 480) {
        const startTimeMs = performance.now();
        const initialCost = this.evaluateScheduleCost(aircraftList).totalCost;

        // 1. Sort aircraft by Priority (descending) and then Earliest Deadline First (scheduledDepartureTime)
        const sorted = [...aircraftList].sort((a, b) => {
            const pa = PRIORITY_WEIGHTS[a.priority] || 50;
            const pb = PRIORITY_WEIGHTS[b.priority] || 50;
            if (pa !== pb) return pb - pa; // Higher priority first
            return a.scheduledDepartureTime - b.scheduledDepartureTime; // EDF
        });

        // 2. Clear old non-frozen reservations for forward recalculation
        this.resourceManager.gateReservations = [];
        this.resourceManager.staffReservations = [];
        this.resourceManager.equipmentReservations = [];

        let conflictsResolved = 0;

        for (const ac of sorted) {
            const tasks = this.taskEngine.getTasks(ac.id) || this.taskEngine.generateTasksForAircraft(ac);
            
            // Check gate availability and compatibility
            let assignedGate = ac.gate;
            const turnaroundStart = Math.max(ac.arrivalTime + 15, currentTime);
            const nominalEnd = Math.max(turnaroundStart + 50, ac.scheduledDepartureTime - 10);

            // Verify if current gate is available and compatible
            const isComp = this.resourceManager.isGateCompatible(assignedGate, ac.aircraftType, ac.category);
            const isAvail = this.resourceManager.isGateAvailable(assignedGate, turnaroundStart, nominalEnd, ac.id);

            if (!isComp || !isAvail) {
                // Find alternate optimal gate
                const altGate = this.resourceManager.findAvailableGate(ac.category, turnaroundStart, nominalEnd, assignedGate);
                if (altGate && altGate !== assignedGate) {
                    assignedGate = altGate;
                    ac.gate = altGate;
                    conflictsResolved++;
                }
            }

            // Reserve the gate
            this.resourceManager.reserveGate(assignedGate, ac.id, turnaroundStart, nominalEnd);

            // Re-sequence tasks along the DAG
            let currentCursor = Math.max(ac.arrivalTime, currentTime);

            for (const task of tasks.values()) {
                if (task.status === 'completed') {
                    continue; // Freeze completed tasks
                }

                // Check dependencies
                let maxDepEnd = currentCursor;
                for (const depCode of task.dependencies) {
                    const depTask = tasks.get(depCode);
                    if (depTask && depTask.plannedEnd > maxDepEnd) {
                        maxDepEnd = depTask.plannedEnd;
                    }
                }

                // Allocate required staff
                let staffWait = 0;
                if (task.requiredStaffType) {
                    const availStaff = this.resourceManager.getAvailableStaff(task.requiredStaffType, maxDepEnd, maxDepEnd + task.duration, task.id);
                    if (availStaff.length > 0) {
                        task.assignedStaffId = availStaff[0].id;
                        this.resourceManager.allocateStaff(availStaff[0].id, task.id, ac.id, maxDepEnd, maxDepEnd + task.duration);
                    } else {
                        // Staff shortage delay buffer
                        staffWait = 5;
                    }
                }

                // Allocate required equipment
                let eqWait = 0;
                if (task.requiredEquipmentType) {
                    const availEq = this.resourceManager.getAvailableEquipment(task.requiredEquipmentType, maxDepEnd + staffWait, maxDepEnd + staffWait + task.duration, task.id);
                    if (availEq.length > 0) {
                        task.assignedEquipmentId = availEq[0].id;
                        this.resourceManager.allocateEquipment(availEq[0].id, task.id, ac.id, maxDepEnd + staffWait, maxDepEnd + staffWait + task.duration);
                    } else {
                        // Equipment shortage delay
                        eqWait = 8;
                    }
                }

                const totalWait = staffWait + eqWait;
                task.plannedStart = maxDepEnd + totalWait;
                task.plannedEnd = task.plannedStart + task.duration;
                task.assignedGate = assignedGate;
            }

            // Recalculate estimated departure based on terminal TAKEOFF task
            const takeoffTask = tasks.get('TAKEOFF');
            if (takeoffTask) {
                ac.estimatedDepartureTime = takeoffTask.plannedEnd;
                ac.delayDuration = Math.max(0, ac.estimatedDepartureTime - ac.scheduledDepartureTime);
            }
        }

        const optimizedCost = this.evaluateScheduleCost(aircraftList).totalCost;
        const endTimeMs = performance.now();

        this.lastSolverMetrics = {
            iterations: sorted.length,
            initialCost,
            optimizedCost,
            conflictsResolved,
            computationTimeMs: Math.round((endTimeMs - startTimeMs) * 100) / 100
        };

        return this.lastSolverMetrics;
    }

    /**
     * Heuristic optimizer (Simulated Annealing) to fine-tune gate and runway slot assignments
     */
    runSimulatedAnnealing(aircraftList, maxIterations = 60, initialTemp = 100) {
        let currentCost = this.evaluateScheduleCost(aircraftList).totalCost;
        let bestCost = currentCost;
        let temp = initialTemp;
        const coolingRate = 0.92;
        let acceptedMoves = 0;

        for (let iter = 0; iter < maxIterations; iter++) {
            // Pick a random non-emergency aircraft
            const candidate = aircraftList[Math.floor(Math.random() * aircraftList.length)];
            if (!candidate || candidate.priority === 'Emergency') continue;

            const oldGate = candidate.gate;
            const availableGates = this.resourceManager.gates.filter(g => 
                this.resourceManager.isGateCompatible(g.id, null, candidate.category)
            );
            if (availableGates.length === 0) continue;

            const randomGate = availableGates[Math.floor(Math.random() * availableGates.length)].id;
            if (randomGate === oldGate) continue;

            // Apply tentative move
            candidate.gate = randomGate;
            const newCost = this.evaluateScheduleCost(aircraftList).totalCost;
            const delta = newCost - currentCost;

            if (delta < 0 || Math.exp(-delta / temp) > Math.random()) {
                currentCost = newCost;
                acceptedMoves++;
                if (newCost < bestCost) {
                    bestCost = newCost;
                }
            } else {
                // Revert move
                candidate.gate = oldGate;
            }

            temp *= coolingRate;
        }

        return {
            bestCost,
            acceptedMoves
        };
    }
}

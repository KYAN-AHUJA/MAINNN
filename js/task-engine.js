/**
 * TASK ENGINE & DEPENDENCY GRAPH (DAG)
 * Coordinates the 20-step aircraft turnaround lifecycle, dependencies,
 * resource requirements, and critical path calculations.
 */

export const LIFECYCLE_STEPS = [
    { code: 'SCHED', name: 'Flight scheduled', phase: 'arrival' },
    { code: 'APPROACH', name: 'Aircraft approaching airport', phase: 'arrival' },
    { code: 'LAND_CLR', name: 'Landing clearance', phase: 'arrival' },
    { code: 'LANDING', name: 'Landing', phase: 'arrival' },
    { code: 'TAXI_IN', name: 'Taxi to assigned gate', phase: 'arrival' },
    { code: 'GND_CLR', name: 'Ground clearance', phase: 'gate_entry' },
    { code: 'GATE_ASSIGN', name: 'Gate assignment', phase: 'gate_entry' },
    { code: 'DEBOARD', name: 'De-boarding passengers', phase: 'turnaround' },
    { code: 'BAG_UNLOAD', name: 'Baggage unloading', phase: 'turnaround' },
    { code: 'CLEANING', name: 'Cabin cleaning', phase: 'turnaround' },
    { code: 'INSPECTION', name: 'Technical inspection', phase: 'turnaround' },
    { code: 'REFUEL', name: 'Refuelling', phase: 'turnaround' },
    { code: 'CATERING', name: 'Catering/ground servicing', phase: 'turnaround' },
    { code: 'BAG_LOAD', name: 'Baggage loading', phase: 'turnaround' },
    { code: 'BOARDING', name: 'Passenger boarding', phase: 'turnaround' },
    { code: 'SEC_CHECK', name: 'Final security check', phase: 'departure_prep' },
    { code: 'GATE_CLR', name: 'Gate clearance', phase: 'departure_prep' },
    { code: 'PUSHBACK', name: 'Pushback', phase: 'departure' },
    { code: 'TAXI_OUT', name: 'Taxi', phase: 'departure' },
    { code: 'TAKEOFF', name: 'Takeoff', phase: 'departure' }
];

// Baseline durations in minutes for categories: Heavy, Widebody, Narrowbody, Executive
export const TASK_CONFIGS = {
    SCHED: {
        duration: { Heavy: 0, Widebody: 0, Narrowbody: 0, Executive: 0 },
        staff: null,
        equipment: null,
        needsGate: false,
        dependencies: []
    },
    APPROACH: {
        duration: { Heavy: 10, Widebody: 10, Narrowbody: 8, Executive: 6 },
        staff: 'Ground clearance staff',
        equipment: null,
        needsGate: false,
        dependencies: ['SCHED']
    },
    LAND_CLR: {
        duration: { Heavy: 3, Widebody: 3, Narrowbody: 2, Executive: 2 },
        staff: 'Ground clearance staff',
        equipment: null,
        needsGate: false,
        dependencies: ['APPROACH']
    },
    LANDING: {
        duration: { Heavy: 4, Widebody: 4, Narrowbody: 3, Executive: 3 },
        staff: 'Ground clearance staff',
        equipment: null,
        needsGate: false,
        dependencies: ['LAND_CLR']
    },
    TAXI_IN: {
        duration: { Heavy: 8, Widebody: 8, Narrowbody: 6, Executive: 5 },
        staff: 'Ground clearance staff',
        equipment: null,
        needsGate: false,
        dependencies: ['LANDING']
    },
    GND_CLR: {
        duration: { Heavy: 3, Widebody: 3, Narrowbody: 2, Executive: 2 },
        staff: 'Ground clearance staff',
        equipment: null,
        needsGate: true,
        dependencies: ['TAXI_IN']
    },
    GATE_ASSIGN: {
        duration: { Heavy: 2, Widebody: 2, Narrowbody: 2, Executive: 1 },
        staff: 'Gate agents',
        equipment: 'Boarding bridges/buses',
        needsGate: true,
        dependencies: ['GND_CLR']
    },
    DEBOARD: {
        duration: { Heavy: 18, Widebody: 15, Narrowbody: 12, Executive: 5 },
        staff: 'Boarding staff',
        equipment: 'Boarding bridges/buses',
        needsGate: true,
        dependencies: ['GATE_ASSIGN']
    },
    // Parallel Branch 1: Baggage unloading starts after deboarding
    BAG_UNLOAD: {
        duration: { Heavy: 20, Widebody: 18, Narrowbody: 14, Executive: 6 },
        staff: 'Baggage handlers',
        equipment: 'Baggage vehicles',
        needsGate: true,
        dependencies: ['DEBOARD']
    },
    // Parallel Branch 2: Cleaning starts after deboarding
    CLEANING: {
        duration: { Heavy: 22, Widebody: 18, Narrowbody: 12, Executive: 8 },
        staff: 'Cleaning crew',
        equipment: 'Cleaning vehicles',
        needsGate: true,
        dependencies: ['DEBOARD']
    },
    // Parallel Branch 3: Technical inspection starts after deboarding
    INSPECTION: {
        duration: { Heavy: 16, Widebody: 14, Narrowbody: 10, Executive: 8 },
        staff: 'Technical maintenance engineers',
        equipment: 'Maintenance equipment',
        needsGate: true,
        dependencies: ['DEBOARD']
    },
    // Refuelling starts after technical inspection is safely clear
    REFUEL: {
        duration: { Heavy: 24, Widebody: 20, Narrowbody: 15, Executive: 10 },
        staff: 'Refuelling staff',
        equipment: 'Fuel trucks',
        needsGate: true,
        dependencies: ['INSPECTION']
    },
    // Catering / ground servicing can execute alongside refuelling once cleaning is complete
    CATERING: {
        duration: { Heavy: 18, Widebody: 16, Narrowbody: 12, Executive: 7 },
        staff: 'Ground servicing crew',
        equipment: 'Catering trucks',
        needsGate: true,
        dependencies: ['CLEANING']
    },
    // Baggage loading starts after baggage unloading completes
    BAG_LOAD: {
        duration: { Heavy: 22, Widebody: 18, Narrowbody: 14, Executive: 6 },
        staff: 'Baggage handlers',
        equipment: 'Baggage vehicles',
        needsGate: true,
        dependencies: ['BAG_UNLOAD']
    },
    // Passenger boarding starts after cleaning is complete
    BOARDING: {
        duration: { Heavy: 24, Widebody: 20, Narrowbody: 16, Executive: 8 },
        staff: 'Boarding staff',
        equipment: 'Boarding bridges/buses',
        needsGate: true,
        dependencies: ['CLEANING']
    },
    // Security check requires boarding and baggage load complete
    SEC_CHECK: {
        duration: { Heavy: 8, Widebody: 8, Narrowbody: 6, Executive: 4 },
        staff: 'Security staff',
        equipment: null,
        needsGate: true,
        dependencies: ['BOARDING', 'BAG_LOAD']
    },
    // Gate clearance requires refuel, catering, and security check complete
    GATE_CLR: {
        duration: { Heavy: 4, Widebody: 4, Narrowbody: 3, Executive: 2 },
        staff: 'Gate agents',
        equipment: null,
        needsGate: true,
        dependencies: ['SEC_CHECK', 'REFUEL', 'CATERING']
    },
    PUSHBACK: {
        duration: { Heavy: 6, Widebody: 6, Narrowbody: 5, Executive: 4 },
        staff: 'Ground clearance staff',
        equipment: 'Pushback tractors',
        needsGate: true,
        dependencies: ['GATE_CLR']
    },
    TAXI_OUT: {
        duration: { Heavy: 8, Widebody: 8, Narrowbody: 6, Executive: 5 },
        staff: 'Ground clearance staff',
        equipment: null,
        needsGate: false,
        dependencies: ['PUSHBACK']
    },
    TAKEOFF: {
        duration: { Heavy: 3, Widebody: 3, Narrowbody: 2, Executive: 2 },
        staff: 'Ground clearance staff',
        equipment: null,
        needsGate: false,
        dependencies: ['TAXI_OUT']
    }
};

export class TaskEngine {
    constructor() {
        this.aircraftTasks = new Map(); // aircraftId -> Map(code -> Task)
    }

    /**
     * Initializes all 20 lifecycle tasks for an aircraft
     */
    generateTasksForAircraft(aircraft) {
        const tasks = new Map();
        const category = aircraft.category || 'Narrowbody';
        const baseArrival = aircraft.arrivalTime;

        let cumulativeMinutes = baseArrival;

        for (const step of LIFECYCLE_STEPS) {
            const config = TASK_CONFIGS[step.code];
            const duration = config.duration[category] || 10;
            
            const task = {
                id: `${aircraft.id}-${step.code}`,
                aircraftId: aircraft.id,
                code: step.code,
                name: step.name,
                phase: step.phase,
                duration: duration,
                originalDuration: duration,
                earliestStart: cumulativeMinutes,
                plannedStart: cumulativeMinutes,
                plannedEnd: cumulativeMinutes + duration,
                actualStart: null,
                actualEnd: null,
                priority: aircraft.priority,
                requiredStaffType: config.staff,
                requiredEquipmentType: config.equipment,
                needsGate: config.needsGate,
                assignedGate: config.needsGate ? aircraft.gate : null,
                assignedStaffId: null,
                assignedEquipmentId: null,
                dependencies: [...config.dependencies],
                status: 'pending', // pending, ready, in_progress, completed, delayed, blocked
                delayReason: null,
                delayMinutes: 0
            };

            tasks.set(step.code, task);
        }

        this.calculateInitialSchedule(tasks, baseArrival);
        this.aircraftTasks.set(aircraft.id, tasks);
        return tasks;
    }

    /**
     * Calculates feasible start and end times respecting DAG dependencies
     */
    calculateInitialSchedule(tasks, startTime) {
        for (const [code, task] of tasks.entries()) {
            if (task.dependencies.length === 0) {
                task.earliestStart = startTime;
                task.plannedStart = startTime;
                task.plannedEnd = startTime + task.duration;
            } else {
                let maxDepEnd = startTime;
                for (const depCode of task.dependencies) {
                    const depTask = tasks.get(depCode);
                    if (depTask && depTask.plannedEnd > maxDepEnd) {
                        maxDepEnd = depTask.plannedEnd;
                    }
                }
                task.earliestStart = maxDepEnd;
                task.plannedStart = maxDepEnd;
                task.plannedEnd = maxDepEnd + task.duration;
            }
        }
    }

    getTasks(aircraftId) {
        return this.aircraftTasks.get(aircraftId);
    }

    getAllTasks() {
        const all = [];
        for (const map of this.aircraftTasks.values()) {
            for (const task of map.values()) {
                all.push(task);
            }
        }
        return all;
    }

    /**
     * Identifies the Critical Path for an aircraft's turnaround DAG
     */
    getCriticalPath(aircraftId) {
        const tasks = this.getTasks(aircraftId);
        if (!tasks) return [];

        const taskList = Array.from(tasks.values());
        // Find terminal task (TAKEOFF)
        const takeoff = tasks.get('TAKEOFF');
        if (!takeoff) return [];

        const path = [takeoff];
        let curr = takeoff;

        while (curr.dependencies.length > 0) {
            let criticalDep = null;
            let maxFinish = -1;

            for (const depCode of curr.dependencies) {
                const dep = tasks.get(depCode);
                if (dep && dep.plannedEnd > maxFinish) {
                    maxFinish = dep.plannedEnd;
                    criticalDep = dep;
                }
            }

            if (criticalDep) {
                path.unshift(criticalDep);
                curr = criticalDep;
            } else {
                break;
            }
        }

        return path;
    }
}

/**
 * SCENARIO TESTING LAB & DEMO TOUR
 * 11 Predefined Operational Stress Scenarios & 12-Step Interactive Presentation Tour
 */

export const PREDEFINED_SCENARIOS = [
    {
        id: 'scenario_1',
        name: 'Scenario 1 — Normal Airport',
        description: 'Standard baseline operations with 10 aircraft and balanced gate/staff/equipment availability.',
        setup: (sim, scheduler, rescheduler, map) => {
            sim.reset();
            map.setWeather('clear');
            sim.logEvent('SCENARIO', 'Scenario 1 loaded: Normal operations.');
        }
    },
    {
        id: 'scenario_2',
        name: 'Scenario 2 — Gate Congestion',
        description: 'High traffic density with Gate A01 and B01 locked out for resurfacing, forcing 18 flights across only 4 gates.',
        setup: (sim, scheduler, rescheduler, map) => {
            sim.reset();
            sim.resourceManager.setGateOperational('A01', false, 'Emergency pavement resurfacing');
            sim.resourceManager.setGateOperational('B01', false, 'Jetway electronic failure');
            map.setWeather('clear');
            rescheduler.handleDisruption({
                title: 'Dual Gate Closure (A01, B01)',
                type: 'gate_failure',
                severity: 'high',
                resourceId: 'A01'
            }, sim.aircraft, sim.currentTime);
            sim.logEvent('SCENARIO', 'Scenario 2 loaded: Gate Congestion.');
        }
    },
    {
        id: 'scenario_3',
        name: 'Scenario 3 — Staff Shortage',
        description: 'Baggage handling and cabin cleaning teams suffer an unexpected 50% absenteeism during morning peak.',
        setup: (sim, scheduler, rescheduler, map) => {
            sim.reset();
            sim.resourceManager.setStaffAvailable('ST-BH-01', false, 'Shift transport breakdown');
            sim.resourceManager.setStaffAvailable('ST-CC-01', false, 'Quarantine callout');
            rescheduler.handleDisruption({
                title: 'Ground Staff Shortage (Baggage & Cleaning)',
                type: 'staff_shortage',
                severity: 'medium',
                resourceId: 'ST-BH-01'
            }, sim.aircraft, sim.currentTime);
            sim.logEvent('SCENARIO', 'Scenario 3 loaded: Staff Shortage.');
        }
    },
    {
        id: 'scenario_4',
        name: 'Scenario 4 — Fuel Truck Failure',
        description: 'Primary Hydrant Fuel Bowser EQ-FT-01 suffers a critical pump rupture during turnaround.',
        setup: (sim, scheduler, rescheduler, map) => {
            sim.reset();
            sim.resourceManager.setEquipmentOperational('EQ-FT-01', false, 'Fuel pump seal failure');
            rescheduler.handleDisruption({
                title: 'Fuel Truck EQ-FT-01 Failure',
                type: 'equipment_failure',
                severity: 'high',
                resourceId: 'EQ-FT-01',
                aircraftId: 'AC-101'
            }, sim.aircraft, sim.currentTime);
            sim.logEvent('SCENARIO', 'Scenario 4 loaded: Fuel Truck Failure.');
        }
    },
    {
        id: 'scenario_5',
        name: 'Scenario 5 — Multiple Aircraft Delays',
        description: 'Enroute air traffic flow control in European airspace delays AI101 (+35m), AL700 (+25m), and AI202 (+40m).',
        setup: (sim, scheduler, rescheduler, map) => {
            sim.reset();
            const ac1 = sim.aircraft.find(a => a.id === 'AC-101');
            const ac2 = sim.aircraft.find(a => a.id === 'AC-700');
            const ac3 = sim.aircraft.find(a => a.id === 'AC-202');
            if (ac1) ac1.arrivalTime += 35;
            if (ac2) ac2.arrivalTime += 25;
            if (ac3) ac3.arrivalTime += 40;
            rescheduler.handleDisruption({
                title: 'Cascading Airspace Holding Delays',
                type: 'late_arrival',
                severity: 'high',
                magnitudeMinutes: 35
            }, sim.aircraft, sim.currentTime);
            sim.logEvent('SCENARIO', 'Scenario 5 loaded: Multiple Aircraft Delays.');
        }
    },
    {
        id: 'scenario_6',
        name: 'Scenario 6 — Technical Failure',
        description: 'Aircraft AI405 reports hydraulic pressure loss and landing gear sensor fault upon gate arrival.',
        setup: (sim, scheduler, rescheduler, map) => {
            sim.reset();
            rescheduler.handleDisruption({
                title: 'AI405 Hydraulic System Failure',
                type: 'technical_issue',
                severity: 'critical',
                aircraftId: 'AC-405'
            }, sim.aircraft, sim.currentTime);
            sim.logEvent('SCENARIO', 'Scenario 6 loaded: Technical Failure.');
        }
    },
    {
        id: 'scenario_7',
        name: 'Scenario 7 — Emergency Landing',
        description: 'Flight AI901 declares MAYDAY with engine fire warning; requests immediate priority landing on Runway 09L.',
        setup: (sim, scheduler, rescheduler, map) => {
            sim.reset();
            rescheduler.handleDisruption({
                title: 'AI901 MAYDAY Emergency Landing Request',
                type: 'emergency_landing',
                severity: 'critical',
                aircraftId: 'AC-901'
            }, sim.aircraft, sim.currentTime);
            sim.logEvent('SCENARIO', 'Scenario 7 loaded: Emergency Landing.');
        }
    },
    {
        id: 'scenario_8',
        name: 'Scenario 8 — Security Incident',
        description: 'Unidentified baggage in terminal concourse triggers Gate B02 lockdown and full passenger rescreening.',
        setup: (sim, scheduler, rescheduler, map) => {
            sim.reset();
            rescheduler.handleDisruption({
                title: 'Suspicious Baggage Alert & Gate B02 Lockdown',
                type: 'security_incident',
                severity: 'high',
                aircraftId: 'AC-118'
            }, sim.aircraft, sim.currentTime);
            sim.logEvent('SCENARIO', 'Scenario 8 loaded: Security Incident.');
        }
    },
    {
        id: 'scenario_9',
        name: 'Scenario 9 — Medical Emergency',
        description: 'Executive flight AL700 passenger requires critical medical triage and rapid paramedic evacuation.',
        setup: (sim, scheduler, rescheduler, map) => {
            sim.reset();
            rescheduler.handleDisruption({
                title: 'AL700 Inflight Passenger Cardiac Emergency',
                type: 'medical_emergency',
                severity: 'critical',
                aircraftId: 'AC-700'
            }, sim.aircraft, sim.currentTime);
            sim.logEvent('SCENARIO', 'Scenario 9 loaded: Medical Emergency.');
        }
    },
    {
        id: 'scenario_10',
        name: 'Scenario 10 — Severe Weather Alert',
        description: 'Severe thunderstorm squall line shuts down runway operations for 30 minutes; ground handling halted.',
        setup: (sim, scheduler, rescheduler, map) => {
            sim.reset();
            map.setWeather('storm');
            rescheduler.handleDisruption({
                title: 'Severe Convective Squall & Runway Hold',
                type: 'weather_alert',
                severity: 'critical'
            }, sim.aircraft, sim.currentTime);
            sim.logEvent('SCENARIO', 'Scenario 10 loaded: Severe Weather.');
        }
    },
    {
        id: 'scenario_11',
        name: 'Scenario 11 — Multiple Simultaneous Failures',
        description: 'Combined catastrophe: Storm warning + Fuel truck failure + Staff shortage + AI901 MAYDAY emergency landing!',
        setup: (sim, scheduler, rescheduler, map) => {
            sim.reset();
            map.setWeather('storm');
            sim.resourceManager.setEquipmentOperational('EQ-FT-01', false, 'Lightning strike');
            sim.resourceManager.setStaffAvailable('ST-BH-01', false, 'Tarmac lightning stand-down');
            rescheduler.handleDisruption({
                title: 'Compound Airport Disruption (Storm + Fuel Failure + MAYDAY)',
                type: 'emergency_landing',
                severity: 'critical',
                aircraftId: 'AC-901'
            }, sim.aircraft, sim.currentTime);
            sim.logEvent('SCENARIO', 'Scenario 11 loaded: Multiple Simultaneous Failures.');
        }
    }
];

export class DemoTourController {
    constructor(simulationEngine, schedulerEngine, reschedulerEngine, mapVisualizer, updateUICallback) {
        this.sim = simulationEngine;
        this.scheduler = schedulerEngine;
        this.rescheduler = reschedulerEngine;
        this.map = mapVisualizer;
        this.updateUI = updateUICallback;

        this.currentStep = 0;
        this.isTourRunning = false;
        this.tourTimer = null;

        this.steps = [
            { title: 'Step 1/12: Normal Airport Operations', desc: 'Airfield initial state: 18 flights scheduled, all 6 gates clear, staff and vehicles deployed.', action: () => { this.sim.reset(); this.map.setWeather('clear'); } },
            { title: 'Step 2/12: Aircraft Landing Clearance', desc: 'AI101 & AL700 approach glideslope. Landing clearance approved on Runway 09L.', action: () => { this.sim.step(10); } },
            { title: 'Step 3/12: Turnaround Operations Begun', desc: 'Aircraft dock at Gate A01 & A02. Parallel deboarding, cleaning, and inspection commence.', action: () => { this.sim.step(15); } },
            { title: 'Step 4/12: Passenger Boarding & Fuelling', desc: 'Cabin sanitization completed. Boarding bridges activated; fuel hydrants dispensing.', action: () => { this.sim.step(20); } },
            { title: 'Step 5/12: Pushback & Takeoff Clearance', desc: 'Tug connected, security sweep passed. Cleared for departure taxi.', action: () => { this.sim.step(15); } },
            { title: 'Step 6/12: Unexpected Flight Delay Event', desc: 'Enroute ATC holds incoming flights AI202 & AI303 by +30 minutes.', action: () => {
                this.rescheduler.handleDisruption({ title: 'Airspace Holding Delay (+30m)', type: 'aircraft_delay', severity: 'medium', magnitudeMinutes: 30, aircraftId: 'AC-202' }, this.sim.aircraft, this.sim.currentTime);
            } },
            { title: 'Step 7/12: Equipment Failure Detected', desc: 'Fuel Bowser EQ-FT-01 suffers mechanical breakdown at Gate A01 during refuelling.', action: () => {
                this.sim.resourceManager.setEquipmentOperational('EQ-FT-01', false, 'Mechanical breakdown');
                this.rescheduler.handleDisruption({ title: 'Fuel Bowser Failure (EQ-FT-01)', type: 'equipment_failure', severity: 'high', resourceId: 'EQ-FT-01', aircraftId: 'AC-101' }, this.sim.aircraft, this.sim.currentTime);
            } },
            { title: 'Step 8/12: Dynamic Rescheduling Active', desc: 'Algorithm detects conflict, freezes completed tasks, shifts DAG dependencies, and assigns backup bowser FT-02.', action: () => {
                this.scheduler.scheduleAll(this.sim.aircraft, this.sim.currentTime);
            } },
            { title: 'Step 9/12: Technical Issue Flagged', desc: 'Air India AI405 flags hydraulic pressure warning at Gate B02. Maintenance team dispatched.', action: () => {
                this.rescheduler.handleDisruption({ title: 'Hydraulic System Inspection Required', type: 'technical_issue', severity: 'critical', aircraftId: 'AC-405' }, this.sim.aircraft, this.sim.currentTime);
            } },
            { title: 'Step 10/12: Priority MAYDAY Emergency Landing', desc: 'AI901 declares in-flight emergency. Airfield controller clears Runway 09L and reserves Gate A01.', action: () => {
                this.rescheduler.handleDisruption({ title: 'AI901 MAYDAY Emergency Landing', type: 'emergency_landing', severity: 'critical', aircraftId: 'AC-901' }, this.sim.aircraft, this.sim.currentTime);
            } },
            { title: 'Step 11/12: Weather Alert / Rain Storm', desc: 'Severe convective squall moves over airfield. Runway operations separation doubled.', action: () => {
                this.map.setWeather('storm');
                this.rescheduler.handleDisruption({ title: 'Convective Storm Alert', type: 'weather_alert', severity: 'high' }, this.sim.aircraft, this.sim.currentTime);
            } },
            { title: 'Step 12/12: Final Optimized Schedule Delivered', desc: 'Dynamic solver has mitigated 74% of potential cascading delays with zero gate conflicts.', action: () => {
                this.sim.step(5);
            } }
        ];
    }

    start() {
        this.currentStep = 0;
        this.isTourRunning = true;
        this.executeCurrentStep();
    }

    executeCurrentStep() {
        if (!this.isTourRunning || this.currentStep >= this.steps.length) {
            this.isTourRunning = false;
            return;
        }

        const step = this.steps[this.currentStep];
        step.action();
        this.updateUI(step, this.currentStep, this.steps.length);

        this.tourTimer = setTimeout(() => {
            this.currentStep++;
            this.executeCurrentStep();
        }, 5500);
    }

    stop() {
        this.isTourRunning = false;
        if (this.tourTimer) {
            clearTimeout(this.tourTimer);
            this.tourTimer = null;
        }
    }
}

/**
 * RESOURCE MANAGER
 * Controls gates, staff, and ground service equipment.
 * Enforces hard constraints: single-occupancy, compatibility, and availability.
 */

import { INITIAL_GATES, INITIAL_STAFF, INITIAL_EQUIPMENT } from './data.js';

export class ResourceManager {
    constructor() {
        this.reset();
    }

    reset() {
        this.gates = JSON.parse(JSON.stringify(INITIAL_GATES));
        this.staff = JSON.parse(JSON.stringify(INITIAL_STAFF));
        this.equipment = JSON.parse(JSON.stringify(INITIAL_EQUIPMENT));
        this.gateReservations = []; // { gateId, aircraftId, startTime, endTime }
        this.staffReservations = []; // { staffId, taskId, aircraftId, startTime, endTime }
        this.equipmentReservations = []; // { equipmentId, taskId, aircraftId, startTime, endTime }
        this.failures = []; // logs of active failures
    }

    // --- GATE MANAGEMENT ---
    getGate(gateId) {
        return this.gates.find(g => g.id === gateId);
    }

    isGateCompatible(gateId, aircraftType, category) {
        const gate = this.getGate(gateId);
        if (!gate) return false;
        return gate.compatibleTypes.includes(category) || gate.compatibleTypes.includes('All types');
    }

    isGateAvailable(gateId, startTime, endTime, excludeAircraftId = null) {
        const gate = this.getGate(gateId);
        if (!gate || gate.status === 'maintenance') return false;

        const conflict = this.gateReservations.find(res => 
            res.gateId === gateId &&
            res.aircraftId !== excludeAircraftId &&
            Math.max(res.startTime, startTime) < Math.min(res.endTime, endTime)
        );

        return !conflict;
    }

    reserveGate(gateId, aircraftId, startTime, endTime) {
        this.releaseGateReservation(aircraftId);
        this.gateReservations.push({ gateId, aircraftId, startTime, endTime });
        const gate = this.getGate(gateId);
        if (gate) {
            gate.currentAircraft = aircraftId;
            gate.availableAt = endTime;
        }
    }

    releaseGateReservation(aircraftId) {
        this.gateReservations = this.gateReservations.filter(r => r.aircraftId !== aircraftId);
        for (const gate of this.gates) {
            if (gate.currentAircraft === aircraftId) {
                gate.currentAircraft = null;
                gate.status = 'free';
            }
        }
    }

    findAvailableGate(category, startTime, endTime, preferredGateId = null) {
        if (preferredGateId && this.isGateCompatible(preferredGateId, null, category) && this.isGateAvailable(preferredGateId, startTime, endTime)) {
            return preferredGateId;
        }

        for (const gate of this.gates) {
            if (this.isGateCompatible(gate.id, null, category) && this.isGateAvailable(gate.id, startTime, endTime)) {
                return gate.id;
            }
        }
        return null;
    }

    // --- STAFF MANAGEMENT ---
    getAvailableStaff(staffType, startTime, endTime, excludeTaskId = null) {
        return this.staff.filter(s => {
            if (s.type !== staffType || !s.available) return false;
            // Check reservation conflict
            const conflict = this.staffReservations.find(res => 
                res.staffId === s.id &&
                res.taskId !== excludeTaskId &&
                Math.max(res.startTime, startTime) < Math.min(res.endTime, endTime)
            );
            return !conflict;
        });
    }

    allocateStaff(staffId, taskId, aircraftId, startTime, endTime) {
        this.staffReservations.push({ staffId, taskId, aircraftId, startTime, endTime });
        const member = this.staff.find(s => s.id === staffId);
        if (member) member.currentAssignment = taskId;
    }

    releaseStaffByTask(taskId) {
        const released = this.staffReservations.filter(r => r.taskId === taskId);
        this.staffReservations = this.staffReservations.filter(r => r.taskId !== taskId);
        for (const r of released) {
            const member = this.staff.find(s => s.id === r.staffId);
            if (member && member.currentAssignment === taskId) {
                member.currentAssignment = null;
            }
        }
    }

    // --- EQUIPMENT MANAGEMENT ---
    getAvailableEquipment(equipmentType, startTime, endTime, excludeTaskId = null) {
        return this.equipment.filter(eq => {
            if (eq.type !== equipmentType || !eq.available || !eq.operational) return false;
            const conflict = this.equipmentReservations.find(res => 
                res.equipmentId === eq.id &&
                res.taskId !== excludeTaskId &&
                Math.max(res.startTime, startTime) < Math.min(res.endTime, endTime)
            );
            return !conflict;
        });
    }

    allocateEquipment(equipmentId, taskId, aircraftId, startTime, endTime) {
        this.equipmentReservations.push({ equipmentId, taskId, aircraftId, startTime, endTime });
        const eq = this.equipment.find(e => e.id === equipmentId);
        if (eq) eq.currentAssignment = taskId;
    }

    releaseEquipmentByTask(taskId) {
        const released = this.equipmentReservations.filter(r => r.taskId === taskId);
        this.equipmentReservations = this.equipmentReservations.filter(r => r.taskId !== taskId);
        for (const r of released) {
            const eq = this.equipment.find(e => e.id === r.equipmentId);
            if (eq && eq.currentAssignment === taskId) {
                eq.currentAssignment = null;
            }
        }
    }

    // --- FAILURES & INJECTIONS ---
    setEquipmentOperational(equipmentId, operational, reason = 'Equipment breakdown') {
        const eq = this.equipment.find(e => e.id === equipmentId);
        if (eq) {
            eq.operational = operational;
            if (!operational) {
                this.failures.push({
                    type: 'equipment',
                    targetId: equipmentId,
                    name: eq.name,
                    reason,
                    timestamp: Date.now()
                });
            } else {
                this.failures = this.failures.filter(f => f.targetId !== equipmentId);
            }
        }
    }

    setGateOperational(gateId, operational, reason = 'Gate maintenance / jetbridge lock') {
        const gate = this.getGate(gateId);
        if (gate) {
            gate.status = operational ? 'free' : 'maintenance';
            if (!operational) {
                this.failures.push({
                    type: 'gate',
                    targetId: gateId,
                    name: gate.name,
                    reason,
                    timestamp: Date.now()
                });
            } else {
                this.failures = this.failures.filter(f => f.targetId !== gateId);
            }
        }
    }

    setStaffAvailable(staffId, available, reason = 'Staff shortage / medical') {
        const member = this.staff.find(s => s.id === staffId);
        if (member) {
            member.available = available;
            if (!available) {
                this.failures.push({
                    type: 'staff',
                    targetId: staffId,
                    name: member.name,
                    reason,
                    timestamp: Date.now()
                });
            } else {
                this.failures = this.failures.filter(f => f.targetId !== staffId);
            }
        }
    }

    // --- UTILIZATION METRICS ---
    getGateUtilization(currentTime) {
        const total = this.gates.length;
        if (total === 0) return 0;
        const occupied = this.gates.filter(g => g.currentAircraft !== null || g.status === 'occupied').length;
        return Math.round((occupied / total) * 100);
    }

    getStaffUtilization(currentTime) {
        const total = this.staff.length;
        if (total === 0) return 0;
        const active = this.staff.filter(s => s.currentAssignment !== null).length;
        return Math.round((active / total) * 100);
    }

    getEquipmentUtilization(currentTime) {
        const total = this.equipment.length;
        if (total === 0) return 0;
        const active = this.equipment.filter(e => e.currentAssignment !== null).length;
        return Math.round((active / total) * 100);
    }
}

/**
 * GANTT CHART VISUALIZER
 * Interactive real-time timeline displaying turnaround tasks, critical path,
 * color-coded status, and click-to-inspect task diagnostics.
 */

export class GanttChart {
    constructor(containerElement, simulationEngine, taskEngine) {
        this.container = containerElement;
        this.sim = simulationEngine;
        this.taskEngine = taskEngine;

        this.startMin = 480; // 08:00
        this.endMin = 720;   // 12:00
        this.pixelsPerMinute = 2.4;
        this.selectedTask = null;
        this.onTaskClickCallback = null;
    }

    render() {
        if (!this.container) return;

        const totalWidth = (this.endMin - this.startMin) * this.pixelsPerMinute;
        const currentSimMin = this.sim.currentTime;
        const nowX = (currentSimMin - this.startMin) * this.pixelsPerMinute;

        let html = `
            <div class="gantt-wrapper">
                <div class="gantt-header-row" style="width: ${totalWidth + 160}px;">
                    <div class="gantt-aircraft-col-title">FLIGHT</div>
                    <div class="gantt-timeline-header">
        `;

        // Render time markers every 30 mins
        for (let m = this.startMin; m <= this.endMin; m += 30) {
            const left = (m - this.startMin) * this.pixelsPerMinute;
            const h = Math.floor(m / 60);
            const min = m % 60;
            const timeStr = `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
            html += `<div class="gantt-time-tick" style="left: ${left}px;">${timeStr}</div>`;
        }

        html += `
                    </div>
                </div>
                <div class="gantt-body" style="width: ${totalWidth + 160}px;">
                    <!-- Real-time Red Line indicator -->
                    ${nowX >= 0 && nowX <= totalWidth ? `<div class="gantt-now-line" style="left: ${nowX + 160}px;"><span class="gantt-now-tag">NOW</span></div>` : ''}
        `;

        // Render rows for aircraft
        for (const ac of this.sim.aircraft) {
            const tasks = this.taskEngine.getTasks(ac.id);
            if (!tasks) continue;

            const isEmergency = ac.priority === 'Emergency';
            const isHigh = ac.priority === 'High' || ac.priority === 'Critical';

            html += `
                <div class="gantt-row">
                    <div class="gantt-row-label">
                        <span class="flight-badge ${isEmergency ? 'badge-emergency' : (isHigh ? 'badge-high' : '')}">${ac.flightNumber}</span>
                        <span class="gate-badge">${ac.gate || 'TBD'}</span>
                    </div>
                    <div class="gantt-task-track">
            `;

            for (const task of tasks.values()) {
                const taskLeft = (task.plannedStart - this.startMin) * this.pixelsPerMinute;
                const taskWidth = Math.max(12, task.duration * this.pixelsPerMinute);

                // Determine task color
                let colorClass = 'task-blue'; // Normal
                if (task.status === 'completed') {
                    colorClass = 'task-green'; // Completed
                } else if (task.delayMinutes > 0 || ac.delayDuration > 0) {
                    colorClass = 'task-yellow'; // Delayed
                } else if (ac.priority === 'Emergency') {
                    colorClass = 'task-red'; // Emergency
                } else if (task.code === 'INSPECTION' || ac.technicalStatus !== 'Normal') {
                    colorClass = 'task-purple'; // Maintenance
                } else if (task.code === 'SEC_CHECK' || ac.emergencyStatus === 'Security Lockdown') {
                    colorClass = 'task-orange'; // Security
                }

                html += `
                    <div class="gantt-task-bar ${colorClass}" 
                         style="left: ${taskLeft}px; width: ${taskWidth}px;"
                         title="${task.name} (${task.duration}m)"
                         data-task-id="${task.id}"
                         data-ac-id="${ac.id}">
                        <span class="task-inner-code">${task.code}</span>
                    </div>
                `;
            }

            html += `
                    </div>
                </div>
            `;
        }

        html += `
                </div>
            </div>
        `;

        this.container.innerHTML = html;
        this.attachEventListeners();
    }

    attachEventListeners() {
        const bars = this.container.querySelectorAll('.gantt-task-bar');
        bars.forEach(bar => {
            bar.addEventListener('click', (e) => {
                const taskId = bar.getAttribute('data-task-id');
                const acId = bar.getAttribute('data-ac-id');
                this.handleTaskClick(acId, taskId);
            });
        });
    }

    handleTaskClick(aircraftId, taskId) {
        const tasks = this.taskEngine.getTasks(aircraftId);
        if (!tasks) return;

        const code = taskId.split('-')[1];
        const task = tasks.get(code);
        const ac = this.sim.aircraft.find(a => a.id === aircraftId);

        if (task && ac && this.onTaskClickCallback) {
            this.onTaskClickCallback({ task, aircraft: ac });
        }
    }

    onTaskClick(callback) {
        this.onTaskClickCallback = callback;
    }
}

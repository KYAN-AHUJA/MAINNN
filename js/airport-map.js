/**
 * AIRPORT MAP VISUALIZER (2D CANVAS)
 * Renders runways, taxiways, terminal gates, apron, moving aircraft along the
 * 20-step lifecycle path, animated ground support vehicles, and weather effects.
 */

export class AirportMapVisualizer {
    constructor(canvas, simulationEngine) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.sim = simulationEngine;
        this.weather = 'clear'; // clear, rain, storm, fog
        this.weatherParticles = [];

        this.initCanvas();
        this.initParticles();
        window.addEventListener('resize', () => this.initCanvas());
    }

    initCanvas() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.width = rect.width || 1100;
        this.height = 480;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    initParticles() {
        this.weatherParticles = [];
        for (let i = 0; i < 120; i++) {
            this.weatherParticles.push({
                x: Math.random() * 1200,
                y: Math.random() * 500,
                length: Math.random() * 20 + 10,
                speedY: Math.random() * 12 + 10,
                speedX: -2
            });
        }
    }

    setWeather(type) {
        this.weather = type;
    }

    draw() {
        if (!this.ctx) return;
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;

        ctx.clearRect(0, 0, w, h);

        // 1. Airfield Surface (Tarmac & Grass)
        this.drawAirfieldSurfaces(ctx, w, h);

        // 2. Runways & Markings
        this.drawRunways(ctx, w, h);

        // 3. Taxiways & Centerlines
        this.drawTaxiways(ctx, w, h);

        // 4. Terminal & Gates
        this.drawTerminalAndGates(ctx);

        // 5. Ground Support Vehicles
        this.drawGroundVehicles(ctx);

        // 6. Aircraft
        this.drawAircraft(ctx);

        // 7. Weather Overlay
        if (this.weather === 'rain' || this.weather === 'storm') {
            this.drawWeather(ctx, w, h);
        }

        // Radar Sweep Effect
        this.drawRadarSweep(ctx, w, h);
    }

    drawAirfieldSurfaces(ctx, w, h) {
        // Dark apron background
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#0c1118');
        grad.addColorStop(1, '#080c10');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Terminal Building Base
        ctx.fillStyle = '#151d27';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        ctx.fillRect(80, 20, w - 160, 60);
        ctx.strokeRect(80, 20, w - 160, 60);

        // Terminal Label
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = '10px Inter, sans-serif';
        ctx.fillText('TERMINAL 1 • MAIN CONCOURSE & INTERNATIONAL PIER', 100, 45);
        ctx.fillText('AEROLUX PRIVATE AVIATION SUITE', w - 340, 45);
    }

    drawRunways(ctx, w, h) {
        // Main Runway 09L / 27R
        const rY = 400;
        ctx.fillStyle = '#12161d';
        ctx.fillRect(50, rY - 20, w - 100, 40);

        // Runway Borders
        ctx.strokeStyle = '#2b3544';
        ctx.lineWidth = 2;
        ctx.strokeRect(50, rY - 20, w - 100, 40);

        // Centerline dashed
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.setLineDash([20, 15]);
        ctx.beginPath();
        ctx.moveTo(90, rY);
        ctx.lineTo(w - 90, rY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Threshold markings
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.fillText('09L', 60, rY + 4);
        ctx.fillText('27R', w - 85, rY + 4);
    }

    drawTaxiways(ctx, w, h) {
        const rY = 400;
        ctx.strokeStyle = '#1b232e';
        ctx.lineWidth = 24;
        
        // Taxiway Alpha
        ctx.beginPath();
        ctx.moveTo(80, 290);
        ctx.lineTo(w - 80, 290);
        ctx.stroke();

        // Connectors between Runway and Taxiway Alpha
        ctx.beginPath();
        ctx.moveTo(180, rY - 20);
        ctx.lineTo(180, 290);
        ctx.moveTo(w / 2, rY - 20);
        ctx.lineTo(w / 2, 290);
        ctx.moveTo(w - 180, rY - 20);
        ctx.lineTo(w - 180, 290);
        ctx.stroke();

        // Apron Connectors
        ctx.beginPath();
        ctx.moveTo(220, 290);
        ctx.lineTo(220, 160);
        ctx.moveTo(360, 290);
        ctx.lineTo(360, 160);
        ctx.moveTo(500, 290);
        ctx.lineTo(500, 160);
        ctx.moveTo(640, 290);
        ctx.lineTo(640, 160);
        ctx.moveTo(780, 290);
        ctx.lineTo(780, 160);
        ctx.moveTo(920, 290);
        ctx.lineTo(920, 160);
        ctx.stroke();

        // Yellow taxi guidelines
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([8, 8]);
        ctx.beginPath();
        ctx.moveTo(80, 290);
        ctx.lineTo(w - 80, 290);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    drawTerminalAndGates(ctx) {
        const gates = this.sim.resourceManager.gates;
        for (const g of gates) {
            const x = g.x;
            const y = g.y;

            // Jetway line
            ctx.strokeStyle = '#4a5568';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(x, 80);
            ctx.lineTo(x, y - 24);
            ctx.stroke();

            // Gate Bay Box
            ctx.fillStyle = g.status === 'maintenance' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.03)';
            ctx.strokeStyle = g.status === 'maintenance' ? '#ef4444' : 'rgba(212, 175, 55, 0.4)';
            ctx.lineWidth = 1;
            ctx.fillRect(x - 45, y - 20, 90, 75);
            ctx.strokeRect(x - 45, y - 20, 90, 75);

            // Gate Label
            ctx.fillStyle = g.status === 'maintenance' ? '#f87171' : '#f59e0b';
            ctx.font = 'bold 11px Inter, sans-serif';
            ctx.fillText(g.id, x - 12, y - 6);

            // Status tag
            ctx.fillStyle = g.currentAircraft ? '#60a5fa' : (g.status === 'maintenance' ? '#ef4444' : '#10b981');
            ctx.font = '9px Inter, sans-serif';
            const statusLabel = g.status === 'maintenance' ? 'LOCKED' : (g.currentAircraft ? 'OCCUPIED' : 'FREE');
            ctx.fillText(statusLabel, x - 20, y + 46);
        }
    }

    drawGroundVehicles(ctx) {
        // Animate ground vehicles near active gates
        const time = Date.now() * 0.002;
        const gates = this.sim.resourceManager.gates;

        for (const g of gates) {
            if (g.currentAircraft) {
                // Fuel Bowser
                const fx = g.x - 28 + Math.sin(time) * 4;
                const fy = g.y + 15;
                ctx.fillStyle = '#eab308';
                ctx.fillRect(fx, fy, 14, 8);
                ctx.fillStyle = '#000';
                ctx.font = '6px monospace';
                ctx.fillText('FUEL', fx + 1, fy + 6);

                // Baggage Tug
                const bx = g.x + 22;
                const by = g.y + 20 + Math.cos(time) * 3;
                ctx.fillStyle = '#3b82f6';
                ctx.fillRect(bx, by, 12, 7);
                ctx.fillStyle = '#93c5fd';
                ctx.fillRect(bx + 14, by + 1, 8, 5); // Cart
            }
        }
    }

    drawAircraft(ctx) {
        const aircraft = this.sim.aircraft;

        for (const ac of aircraft) {
            const pos = this.getAircraftPosition(ac);
            if (!pos) continue;

            ctx.save();
            ctx.translate(pos.x, pos.y);
            ctx.rotate(pos.heading);

            // Draw Airplane Silhouette
            this.renderAirplaneIcon(ctx, ac);

            ctx.restore();

            // Draw Information Tag (unrotated for readability)
            this.renderAircraftTag(ctx, ac, pos.x, pos.y);
        }
    }

    getAircraftPosition(ac) {
        const time = this.sim.currentTime;
        const gate = this.sim.resourceManager.getGate(ac.gate) || { x: 300, y: 160 };

        if (ac.status === 'Approaching airport' || ac.status === 'Flight scheduled') {
            // Approaching along glideslope
            const pct = Math.max(0, Math.min(1, (time - (ac.arrivalTime - 10)) / 10));
            return {
                x: 10 + pct * 120,
                y: 400 - (1 - pct) * 45,
                heading: 0
            };
        } else if (ac.status === 'Landing') {
            return {
                x: 140 + ((time % 4) * 60),
                y: 400,
                heading: 0
            };
        } else if (ac.status === 'Taxi to assigned gate') {
            return {
                x: gate.x,
                y: 290 - ((time % 5) * 20),
                heading: -Math.PI / 2
            };
        } else if (['At Gate', 'Turnaround', 'Boarding'].includes(ac.status)) {
            return {
                x: gate.x,
                y: gate.y + 16,
                heading: -Math.PI / 2
            };
        } else if (ac.status === 'Pushback') {
            return {
                x: gate.x,
                y: gate.y + 55,
                heading: -Math.PI / 2
            };
        } else if (ac.status === 'Taxi to runway') {
            return {
                x: 500,
                y: 290,
                heading: 0
            };
        } else if (ac.status === 'Departing') {
            return {
                x: 750 + ((time % 5) * 50),
                y: 400 - ((time % 5) * 10),
                heading: -0.15
            };
        }
        return null; // Departed or far out
    }

    renderAirplaneIcon(ctx, ac) {
        const isEmergency = ac.priority === 'Emergency' || ac.emergencyStatus !== 'None';
        const isExecutive = ac.category === 'Executive';

        // Fuselage
        ctx.fillStyle = isEmergency ? '#ef4444' : (isExecutive ? '#d4af37' : '#ffffff');
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Main Wings
        ctx.fillStyle = isEmergency ? '#dc2626' : (isExecutive ? '#b45309' : '#cbd5e1');
        ctx.beginPath();
        ctx.moveTo(-2, -18);
        ctx.lineTo(4, 0);
        ctx.lineTo(-2, 18);
        ctx.lineTo(-6, 0);
        ctx.closePath();
        ctx.fill();

        // Horizontal Stabilizers / Tail
        ctx.beginPath();
        ctx.moveTo(-16, -7);
        ctx.lineTo(-13, 0);
        ctx.lineTo(-16, 7);
        ctx.closePath();
        ctx.fill();

        // Engine nacelles
        ctx.fillStyle = '#475569';
        ctx.fillRect(-2, -9, 6, 2.5);
        ctx.fillRect(-2, 6.5, 6, 2.5);

        // Flashing navigation strobes
        if (Math.floor(Date.now() / 500) % 2 === 0) {
            ctx.fillStyle = '#ef4444'; // Red port
            ctx.fillRect(-2, -19, 2, 2);
            ctx.fillStyle = '#10b981'; // Green starboard
            ctx.fillRect(-2, 18, 2, 2);
        }
    }

    renderAircraftTag(ctx, ac, x, y) {
        const isEmergency = ac.priority === 'Emergency';
        const isHigh = ac.priority === 'High' || ac.priority === 'Critical';

        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.strokeStyle = isEmergency ? '#ef4444' : (isHigh ? '#f59e0b' : 'rgba(255, 255, 255, 0.2)');
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(x + 12, y - 24, 75, 26, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isEmergency ? '#ef4444' : '#f8fafc';
        ctx.font = 'bold 9px Inter, sans-serif';
        ctx.fillText(ac.flightNumber, x + 16, y - 13);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '8px Inter, sans-serif';
        ctx.fillText(ac.aircraftType.split(' ')[0], x + 16, y - 3);

        if (ac.delayDuration > 0) {
            ctx.fillStyle = '#f59e0b';
            ctx.font = 'bold 8px monospace';
            ctx.fillText(`+${ac.delayDuration}m`, x + 56, y - 13);
        }
    }

    drawWeather(ctx, w, h) {
        ctx.strokeStyle = 'rgba(186, 230, 253, 0.4)';
        ctx.lineWidth = 1;

        for (const p of this.weatherParticles) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + p.speedX, p.y + p.length);
            ctx.stroke();

            p.x += p.speedX;
            p.y += p.speedY;

            if (p.y > h) {
                p.y = -20;
                p.x = Math.random() * w;
            }
        }

        // Lightning flash effect on storm
        if (this.weather === 'storm' && Math.random() < 0.03) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
            ctx.fillRect(0, 0, w, h);
        }
    }

    drawRadarSweep(ctx, w, h) {
        const time = Date.now() * 0.001;
        const sweepAngle = (time % 4) * (Math.PI / 2);
        
        ctx.save();
        ctx.translate(w / 2, 290);
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.06)';
        ctx.beginPath();
        ctx.arc(0, 0, 320, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
}

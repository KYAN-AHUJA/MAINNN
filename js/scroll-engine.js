/**
 * SCROLL ENGINE (ATMOS.LEEROY.CA / IGLOO.INC STYLE)
 * High-performance canvas frame scrubber with progressive preloading,
 * inertial lerp damping, and frosted glass cards positioned in negative air spaces.
 */

export class ScrollEngine {
    constructor(canvas, cardsContainer, onEnterAppCallback) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.cardsContainer = cardsContainer;
        this.onEnterApp = onEnterAppCallback;

        this.totalFrames = 240;
        this.frames = new Array(this.totalFrames + 1).fill(null);
        this.loadedCount = 0;

        // Inertial Scroll State
        this.targetProgress = 0; // 0.0 to 1.0
        this.currentProgress = 0;
        this.scrollSpeed = 0.00085;
        this.dampening = 0.085;

        // Touch & Drag Support
        this.touchStartY = 0;
        this.isDragging = false;

        this.initCanvasSize();
        this.initProgressiveLoader();
        this.bindEvents();
        this.startRenderLoop();
    }

    initCanvasSize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    initProgressiveLoader() {
        // Phase 1: Load Frame 1 immediately
        this.loadSingleFrame(1, () => {
            this.drawFrame(1);
        });

        // Phase 2: Load keyframes every 4th frame for instant scrub response
        const keyframes = [];
        for (let i = 1; i <= this.totalFrames; i += 4) {
            keyframes.push(i);
        }

        this.loadBatch(keyframes, () => {
            // Phase 3: Load all remaining frames in the background
            const remaining = [];
            for (let i = 1; i <= this.totalFrames; i++) {
                if (!this.frames[i]) remaining.push(i);
            }
            this.loadBatch(remaining, () => {
                const loader = document.getElementById('hero-preloader');
                if (loader) loader.classList.add('hidden');
            });
        });
    }

    loadSingleFrame(index, callback) {
        if (this.frames[index]) {
            if (callback) callback(this.frames[index]);
            return;
        }

        const img = new Image();
        const padIndex = String(index).padStart(3, '0');
        img.src = `ezgif-frame-${padIndex}.png`;
        img.onload = () => {
            this.frames[index] = img;
            this.loadedCount++;
            this.updateLoaderBar();
            if (callback) callback(img);
        };
        img.onerror = () => {
            // Fallback to nearby frame
            if (callback) callback(null);
        };
    }

    loadBatch(indices, onComplete) {
        let loadedInBatch = 0;
        if (indices.length === 0) {
            if (onComplete) onComplete();
            return;
        }

        for (const idx of indices) {
            this.loadSingleFrame(idx, () => {
                loadedInBatch++;
                if (loadedInBatch === indices.length && onComplete) {
                    onComplete();
                }
            });
        }
    }

    updateLoaderBar() {
        const bar = document.getElementById('preloader-fill');
        const count = document.getElementById('preloader-count');
        const pct = Math.round((this.loadedCount / this.totalFrames) * 100);
        if (bar) bar.style.width = `${pct}%`;
        if (count) count.textContent = `${pct}%`;
    }

    bindEvents() {
        window.addEventListener('resize', () => {
            this.initCanvasSize();
            this.render();
        });

        // Wheel Scroll with high inertia
        window.addEventListener('wheel', (e) => {
            if (document.body.classList.contains('operations-mode-active')) return;
            e.preventDefault();
            this.targetProgress += e.deltaY * this.scrollSpeed;
            this.targetProgress = Math.max(0, Math.min(1, this.targetProgress));
        }, { passive: false });

        // Touch Gestures
        window.addEventListener('touchstart', (e) => {
            if (document.body.classList.contains('operations-mode-active')) return;
            this.touchStartY = e.touches[0].clientY;
            this.isDragging = true;
        }, { passive: true });

        window.addEventListener('touchmove', (e) => {
            if (document.body.classList.contains('operations-mode-active') || !this.isDragging) return;
            const deltaY = this.touchStartY - e.touches[0].clientY;
            this.touchStartY = e.touches[0].clientY;
            this.targetProgress += deltaY * 0.0018;
            this.targetProgress = Math.max(0, Math.min(1, this.targetProgress));
        }, { passive: true });

        window.addEventListener('touchend', () => {
            this.isDragging = false;
        });

        // Keyboard navigation
        window.addEventListener('keydown', (e) => {
            if (document.body.classList.contains('operations-mode-active')) return;
            if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
                e.preventDefault();
                this.targetProgress = Math.min(1, this.targetProgress + 0.06);
            } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
                e.preventDefault();
                this.targetProgress = Math.max(0, this.targetProgress - 0.06);
            }
        });

        // Timeline Scrubber Slider (igloo.inc style)
        const scrubber = document.getElementById('flight-scrubber');
        if (scrubber) {
            scrubber.addEventListener('input', (e) => {
                this.targetProgress = parseFloat(e.target.value) / 100;
            });
        }
    }

    startRenderLoop() {
        const loop = () => {
            // Apply inertial lerp damping
            const diff = this.targetProgress - this.currentProgress;
            if (Math.abs(diff) > 0.0001) {
                this.currentProgress += diff * this.dampening;
            } else {
                this.currentProgress = this.targetProgress;
            }

            this.render();
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    render() {
        // Calculate current frame index (1 to 240)
        const frameIndex = Math.max(1, Math.min(this.totalFrames, Math.round(this.currentProgress * (this.totalFrames - 1)) + 1));
        this.drawFrame(frameIndex);
        this.updateFrostedCards(this.currentProgress, frameIndex);
        this.updateFlightHUD(this.currentProgress, frameIndex);
    }

    drawFrame(targetIndex) {
        // Find closest loaded frame if targetIndex is still buffering
        let img = this.frames[targetIndex];
        if (!img) {
            // Search outwards
            for (let offset = 1; offset < 20; offset++) {
                if (targetIndex - offset >= 1 && this.frames[targetIndex - offset]) {
                    img = this.frames[targetIndex - offset];
                    break;
                }
                if (targetIndex + offset <= this.totalFrames && this.frames[targetIndex + offset]) {
                    img = this.frames[targetIndex + offset];
                    break;
                }
            }
        }

        if (!img) return;

        const ctx = this.ctx;
        const cw = this.canvas.width;
        const ch = this.canvas.height;
        const iw = img.naturalWidth || 1280;
        const ih = img.naturalHeight || 720;

        // Cover aspect ratio
        const scale = Math.max(cw / iw, ch / ih);
        const nw = iw * scale;
        const nh = ih * scale;
        const nx = (cw - nw) / 2;
        const ny = (ch - nh) / 2;

        ctx.clearRect(0, 0, cw, ch);
        ctx.drawImage(img, nx, ny, nw, nh);

        // Subtle cinematic vignette
        const grad = ctx.createRadialGradient(cw / 2, ch / 2, Math.min(cw, ch) * 0.3, cw / 2, ch / 2, Math.max(cw, ch) * 0.85);
        grad.addColorStop(0, 'rgba(11, 15, 20, 0.0)');
        grad.addColorStop(1, 'rgba(11, 15, 20, 0.65)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, cw, ch);
    }

    /**
     * Updates frosted cards placed in negative air spaces across the frames
     */
    updateFrostedCards(progress, frameIndex) {
        const card1 = document.getElementById('card-negative-1'); // Frame 20 - 70 (Upper Right)
        const card2 = document.getElementById('card-negative-2'); // Frame 75 - 135 (Lower Left)
        const card3 = document.getElementById('card-negative-3'); // Frame 140 - 190 (Right Flank)
        const card4 = document.getElementById('card-negative-4'); // Frame 195 - 240 (Lower Center / Final Call)
        const heroCenter = document.getElementById('hero-main-center');

        // Initial hero text fades out as you start scrolling
        if (heroCenter) {
            const heroOpacity = Math.max(0, 1 - progress * 4.2);
            heroCenter.style.opacity = heroOpacity;
            heroCenter.style.transform = `translateY(${progress * -60}px)`;
            heroCenter.style.pointerEvents = heroOpacity < 0.1 ? 'none' : 'auto';
        }

        // Helper to smoothly fade & translate cards
        const setCardVisibility = (el, startFrame, endFrame, peakFrame) => {
            if (!el) return;
            if (frameIndex >= startFrame && frameIndex <= endFrame) {
                let opacity = 0;
                if (frameIndex < peakFrame) {
                    opacity = (frameIndex - startFrame) / (peakFrame - startFrame);
                } else {
                    opacity = 1 - (frameIndex - peakFrame) / (endFrame - peakFrame);
                }
                opacity = Math.max(0, Math.min(1, opacity));
                el.style.opacity = opacity;
                el.style.transform = `translateY(${(1 - opacity) * 24}px) scale(${0.96 + opacity * 0.04})`;
                el.style.pointerEvents = opacity > 0.4 ? 'auto' : 'none';
            } else {
                el.style.opacity = 0;
                el.style.pointerEvents = 'none';
            }
        };

        setCardVisibility(card1, 15, 72, 42);
        setCardVisibility(card2, 75, 138, 105);
        setCardVisibility(card3, 140, 192, 166);
        setCardVisibility(card4, 195, 240, 220);
    }

    updateFlightHUD(progress, frameIndex) {
        // Dynamic Avionics Telemetry that updates as jet climbs and banks
        const pillTag = document.getElementById('hero-flight-level');
        const scrubber = document.getElementById('flight-scrubber');
        const frameCounter = document.getElementById('hud-frame-counter');

        if (scrubber) scrubber.value = Math.round(progress * 100);
        if (frameCounter) frameCounter.textContent = `FRAME ${String(frameIndex).padStart(3, '0')} / 240`;

        if (pillTag) {
            let alt = 450;
            let mach = 0.90;
            if (frameIndex < 60) {
                alt = 410 + Math.round((frameIndex / 60) * 40);
                mach = (0.86 + (frameIndex / 60) * 0.04).toFixed(2);
            } else if (frameIndex < 140) {
                alt = 450;
                mach = 0.90;
            } else {
                alt = 450 + Math.round(((frameIndex - 140) / 100) * 20);
                mach = 0.92;
            }
            pillTag.textContent = `• FLIGHT LEVEL ${alt} • CRUISE MACH ${mach}`;
        }
    }

    setProgress(val) {
        this.targetProgress = Math.max(0, Math.min(1, val));
    }
}

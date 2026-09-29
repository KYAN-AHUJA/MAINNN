/**
 * SCROLL ENGINE (ATMOS.LEEROY.CA / IGLOO.INC STYLE)
 * High-performance canvas frame scrubber with:
 * - Zoomed out, unblurred, razor-sharp rendering of full aircraft
 * - High-density 480-step virtual frame sequence with smooth sub-frame interpolation
 * - Creative Avionics HUD preloader
 * - Frosted glass cards positioned in negative air spaces
 */

export class ScrollEngine {
    constructor(canvas, cardsContainer, onEnterAppCallback) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.cardsContainer = cardsContainer;
        this.onEnterApp = onEnterAppCallback;

        this.baseFramesCount = 240;
        this.virtualFramesCount = 480; // Extended virtual frames for ultra-granular scroll
        this.frames = new Array(this.baseFramesCount + 1).fill(null);
        this.loadedCount = 0;

        // Inertial Scroll State
        this.targetProgress = 0; // 0.0 to 1.0
        this.currentProgress = 0;
        this.scrollSpeed = 0.00065;
        this.dampening = 0.075;

        // Touch & Drag Support
        this.touchStartY = 0;
        this.isDragging = false;

        this.initCanvasSize();
        this.initProgressiveLoader();
        this.bindEvents();
        this.startRenderLoop();
    }

    initCanvasSize() {
        // High-DPI sharp rendering without blur
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;
        this.canvas.style.width = `${this.width}px`;
        this.canvas.style.height = `${this.height}px`;
        this.ctx.scale(dpr, dpr);
    }

    initProgressiveLoader() {
        // Phase 1: Load Frame 1 immediately
        this.loadSingleFrame(1, () => {
            this.drawInterpolatedFrame(1, 1, 0);
        });

        // Phase 2: Load keyframes every 3rd frame for instant scrub response
        const keyframes = [];
        for (let i = 1; i <= this.baseFramesCount; i += 3) {
            keyframes.push(i);
        }

        this.loadBatch(keyframes, () => {
            // Phase 3: Load all remaining frames in background
            const remaining = [];
            for (let i = 1; i <= this.baseFramesCount; i++) {
                if (!this.frames[i]) remaining.push(i);
            }
            this.loadBatch(remaining, () => {
                setTimeout(() => {
                    const loader = document.getElementById('hero-preloader');
                    if (loader) {
                        loader.style.opacity = '0';
                        loader.style.pointerEvents = 'none';
                        setTimeout(() => loader.classList.add('hidden'), 600);
                    }
                }, 300);
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
            this.updateCreativeLoader();
            if (callback) callback(img);
        };
        img.onerror = () => {
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

    updateCreativeLoader() {
        const fill = document.getElementById('loader-runway-fill');
        const plane = document.getElementById('loader-plane-glider');
        const pctEl = document.getElementById('loader-percent');
        const statusEl = document.getElementById('loader-status-text');

        const pct = Math.round((this.loadedCount / this.baseFramesCount) * 100);
        if (fill) fill.style.width = `${pct}%`;
        if (plane) plane.style.left = `${pct}%`;
        if (pctEl) pctEl.textContent = `${pct}%`;
        if (statusEl) {
            if (pct < 35) statusEl.textContent = 'BUFFERING AVIONICS FRAMES';
            else if (pct < 80) statusEl.textContent = 'INTERPOLATING FLIGHT MATRIX';
            else statusEl.textContent = 'SYSTEM OPERATIONAL // READY';
        }
    }

    bindEvents() {
        window.addEventListener('resize', () => {
            this.initCanvasSize();
            this.render();
        });

        // Wheel Scroll with smooth inertia
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
            this.targetProgress += deltaY * 0.0014;
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
                this.targetProgress = Math.min(1, this.targetProgress + 0.05);
            } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
                e.preventDefault();
                this.targetProgress = Math.max(0, this.targetProgress - 0.05);
            }
        });

        // Timeline Scrubber Slider
        const scrubber = document.getElementById('flight-scrubber');
        if (scrubber) {
            scrubber.addEventListener('input', (e) => {
                this.targetProgress = parseFloat(e.target.value) / 100;
            });
        }
    }

    startRenderLoop() {
        const loop = () => {
            const diff = this.targetProgress - this.currentProgress;
            if (Math.abs(diff) > 0.00005) {
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
        // Calculate extended virtual frame index (1 to 480)
        const virtualIndex = Math.max(1, Math.min(this.virtualFramesCount, Math.round(this.currentProgress * (this.virtualFramesCount - 1)) + 1));
        
        // Map 480 virtual frames onto 240 base frames with sub-frame interpolation
        const exactBaseIndex = 1 + (this.currentProgress * (this.baseFramesCount - 1));
        const f1 = Math.floor(exactBaseIndex);
        const f2 = Math.min(this.baseFramesCount, f1 + 1);
        const alpha = exactBaseIndex - f1; // Fractional blend factor

        this.drawInterpolatedFrame(f1, f2, alpha);
        this.updateFrostedCards(this.currentProgress, f1);
        this.updateFlightHUD(this.currentProgress, f1, virtualIndex);
    }

    /**
     * Draws the frame crisp, zoomed-out, and unblurred with sub-frame alpha crossfade
     */
    drawInterpolatedFrame(f1, f2, alpha) {
        const ctx = this.ctx;
        const cw = this.width;
        const ch = this.height;

        ctx.clearRect(0, 0, cw, ch);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        let img1 = this.findClosestLoadedFrame(f1);
        let img2 = this.findClosestLoadedFrame(f2);

        if (!img1) return;

        const iw = img1.naturalWidth || 1280;
        const ih = img1.naturalHeight || 720;

        // ZOOMED OUT CALCULATION:
        // Fits comfortably so the entire aircraft, wings, and horizon are fully visible!
        const scale = Math.min(cw / iw, ch / ih) * 0.94;
        const nw = iw * scale;
        const nh = ih * scale;
        const nx = (cw - nw) / 2;
        const ny = (ch - nh) / 2;

        // Render base frame (crisp, zero blur)
        ctx.globalAlpha = 1.0;
        ctx.drawImage(img1, nx, ny, nw, nh);

        // Sub-frame crossfade for ultra-fluid interpolation
        if (img2 && img2 !== img1 && alpha > 0.05) {
            ctx.globalAlpha = alpha;
            ctx.drawImage(img2, nx, ny, nw, nh);
            ctx.globalAlpha = 1.0;
        }
    }

    findClosestLoadedFrame(targetIndex) {
        if (this.frames[targetIndex]) return this.frames[targetIndex];
        for (let offset = 1; offset < 25; offset++) {
            if (targetIndex - offset >= 1 && this.frames[targetIndex - offset]) {
                return this.frames[targetIndex - offset];
            }
            if (targetIndex + offset <= this.baseFramesCount && this.frames[targetIndex + offset]) {
                return this.frames[targetIndex + offset];
            }
        }
        return null;
    }

    /**
     * Updates frosted cards placed in negative air spaces
     */
    updateFrostedCards(progress, frameIndex) {
        const card1 = document.getElementById('card-negative-1'); // Upper Right Sky
        const card2 = document.getElementById('card-negative-2'); // Lower Left Clouds
        const card3 = document.getElementById('card-negative-3'); // Right Flank
        const card4 = document.getElementById('card-negative-4'); // Center / Horizon Callout
        const heroCenter = document.getElementById('hero-main-center');

        if (heroCenter) {
            const heroOpacity = Math.max(0, 1 - progress * 4.0);
            heroCenter.style.opacity = heroOpacity;
            heroCenter.style.transform = `translateY(${progress * -50}px)`;
            heroCenter.style.pointerEvents = heroOpacity < 0.1 ? 'none' : 'auto';
        }

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
                el.style.transform = `translateY(${(1 - opacity) * 20}px) scale(${0.96 + opacity * 0.04})`;
                el.style.pointerEvents = opacity > 0.4 ? 'auto' : 'none';
            } else {
                el.style.opacity = 0;
                el.style.pointerEvents = 'none';
            }
        };

        setCardVisibility(card1, 15, 75, 45);
        setCardVisibility(card2, 78, 140, 108);
        setCardVisibility(card3, 142, 195, 168);
        setCardVisibility(card4, 198, 240, 222);
    }

    updateFlightHUD(progress, frameIndex, virtualIndex) {
        const pillTag = document.getElementById('hero-flight-level');
        const scrubber = document.getElementById('flight-scrubber');
        const frameCounter = document.getElementById('hud-frame-counter');

        if (scrubber) scrubber.value = Math.round(progress * 100);
        if (frameCounter) frameCounter.textContent = `FRAME ${String(virtualIndex).padStart(3, '0')} / 480`;

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
            pillTag.innerHTML = `<span class="dot"></span> FLIGHT LEVEL ${alt} • CRUISE MACH ${mach}`;
        }
    }
}

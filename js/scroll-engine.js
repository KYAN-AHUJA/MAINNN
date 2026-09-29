/**
 * SCROLL ENGINE (IMPERIUM HIGH-PRECISION CRUISE SCRUBBER)
 * Razor-sharp single-frame rasterization (zero ghosting/blur),
 * pixel-aligned cover fitting with crisp smoothing, async image decoding,
 * and high-frequency inertial damping for fluid luxury animation.
 */

export class ScrollEngine {
    constructor(canvas, cardsContainer, onEnterAppCallback) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { alpha: false });
        this.cardsContainer = cardsContainer;
        this.onEnterApp = onEnterAppCallback;

        this.totalFrames = 240;
        this.frames = new Array(this.totalFrames + 1).fill(null);
        this.loadedCount = 0;

        // Inertial Scroll State (smooth, responsive cinematic curve)
        this.targetProgress = 0; // 0.0 to 1.0
        this.currentProgress = 0;
        this.scrollSpeed = 0.00065;
        this.dampening = 0.12;

        // Auto-Play State
        this.isPlaying = false;
        this.playbackSpeed = 0.0022; // Smooth 60fps playback speed

        // Touch & Drag Support
        this.touchStartY = 0;
        this.isDragging = false;

        this.lastDrawnFrame = -1;

        this.initCanvasSize();
        this.initProgressiveLoader();
        this.bindEvents();
        this.startRenderLoop();
    }

    initCanvasSize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = Math.round(this.width * dpr);
        this.canvas.height = Math.round(this.height * dpr);
        this.canvas.style.width = `${this.width}px`;
        this.canvas.style.height = `${this.height}px`;
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
        this.lastDrawnFrame = -1;
    }

    initProgressiveLoader() {
        // Phase 1: Load Frame 1 immediately for instant paint
        this.loadSingleFrame(1, () => {
            this.render(1);
        });

        // Phase 2: Load keyframes every 2nd frame for immediate responsiveness across the full timeline
        const keyframes = [];
        for (let i = 2; i <= this.totalFrames; i += 2) {
            keyframes.push(i);
        }

        this.loadBatch(keyframes, () => {
            // Phase 3: Fill in all odd frames
            const remaining = [];
            for (let i = 1; i <= this.totalFrames; i++) {
                if (!this.frames[i]) remaining.push(i);
            }
            this.loadBatch(remaining, () => {
                this.finishPreloader();
            });
        });
    }

    loadSingleFrame(index, callback) {
        if (this.frames[index]) {
            if (callback) callback(this.frames[index]);
            return;
        }

        const img = new Image();
        img.decoding = 'async'; // Offload image decoding to prevent any scroll jitter
        const padIndex = String(index).padStart(3, '0');
        img.src = `ezgif-frame-${padIndex}.png`;
        img.onload = () => {
            this.frames[index] = img;
            this.loadedCount++;
            this.updateLoaderBar();
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

    updateLoaderBar() {
        const bar = document.getElementById('preloader-fill');
        const count = document.getElementById('preloader-count');
        const status = document.getElementById('preloader-status-msg');
        const pct = Math.round((this.loadedCount / this.totalFrames) * 100);
        if (bar) bar.style.width = `${pct}%`;
        if (count) count.textContent = `${pct}%`;

        if (status) {
            if (pct < 30) {
                status.innerHTML = `<span class="dot"></span> INITIALIZING IMPERIUM FLIGHT PROTOCOLS...`;
            } else if (pct < 70) {
                status.innerHTML = `<span class="dot"></span> BUFFERING CRUISE FRAMES & TELEMETRY...`;
            } else if (pct < 98) {
                status.innerHTML = `<span class="dot"></span> CALIBRATING AVIONICS HUD & RADAR MATRIX...`;
            } else {
                status.innerHTML = `<span class="dot" style="background: #ffffff;"></span> SYSTEMS SYNCHRONIZED • READY FOR FLIGHT`;
            }
        }
    }

    finishPreloader() {
        const loader = document.getElementById('hero-preloader');
        if (loader) {
            setTimeout(() => {
                loader.style.opacity = '0';
                setTimeout(() => {
                    loader.classList.add('hidden');
                }, 600);
            }, 250);
        }
    }

    bindEvents() {
        window.addEventListener('resize', () => {
            this.initCanvasSize();
            const frameIndex = Math.max(1, Math.min(this.totalFrames, Math.round(1 + this.currentProgress * (this.totalFrames - 1))));
            this.render(frameIndex);
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
            this.targetProgress += deltaY * 0.0016;
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
                if (this.isPlaying) this.setPlaying(false);
                this.targetProgress = Math.min(1, this.targetProgress + 0.04);
            } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
                e.preventDefault();
                if (this.isPlaying) this.setPlaying(false);
                this.targetProgress = Math.max(0, this.targetProgress - 0.04);
            }
        });

        // Auto-Play Button on Scrubber Rail
        const playBtn = document.getElementById('rail-play-btn');
        if (playBtn) {
            playBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.togglePlay();
            });
        }

        // Sophisticated Avionics Scrubber Rail (Right Side)
        const rail = document.getElementById('flight-scrub-rail');
        const track = document.getElementById('rail-track');
        if (rail && track) {
            let isScrubbingRail = false;
            const updateFromRail = (clientY) => {
                const rect = track.getBoundingClientRect();
                const progress = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
                this.targetProgress = progress;
            };

            rail.addEventListener('mousedown', (e) => {
                if (e.target.closest('#rail-play-btn')) return;
                e.preventDefault();
                if (this.isPlaying) this.setPlaying(false);
                isScrubbingRail = true;
                rail.classList.add('dragging');
                updateFromRail(e.clientY);
            });

            window.addEventListener('mousemove', (e) => {
                if (!isScrubbingRail) return;
                updateFromRail(e.clientY);
            });

            window.addEventListener('mouseup', () => {
                if (isScrubbingRail) {
                    isScrubbingRail = false;
                    rail.classList.remove('dragging');
                }
            });

            rail.addEventListener('touchstart', (e) => {
                if (e.target.closest('#rail-play-btn')) return;
                if (this.isPlaying) this.setPlaying(false);
                isScrubbingRail = true;
                rail.classList.add('dragging');
                if (e.touches && e.touches[0]) updateFromRail(e.touches[0].clientY);
            }, { passive: false });

            window.addEventListener('touchmove', (e) => {
                if (!isScrubbingRail) return;
                if (e.touches && e.touches[0]) updateFromRail(e.touches[0].clientY);
            }, { passive: false });

            window.addEventListener('touchend', () => {
                if (isScrubbingRail) {
                    isScrubbingRail = false;
                    rail.classList.remove('dragging');
                }
            });
        }
    }

    togglePlay() {
        this.setPlaying(!this.isPlaying);
    }

    setPlaying(val) {
        this.isPlaying = val;
        const icon = document.getElementById('rail-play-icon');
        const btn = document.getElementById('rail-play-btn');
        if (!icon || !btn) return;
        if (this.isPlaying) {
            icon.innerHTML = `<rect x="5" y="4" width="4" height="16"></rect><rect x="15" y="4" width="4" height="16"></rect>`;
            btn.setAttribute('title', 'Pause cruise animation');
        } else {
            icon.innerHTML = `<polygon points="6,4 20,12 6,20"></polygon>`;
            btn.setAttribute('title', 'Play cruise animation');
        }
    }

    startRenderLoop() {
        const loop = () => {
            // Auto-play forward progression
            if (this.isPlaying) {
                this.targetProgress += this.playbackSpeed;
                if (this.targetProgress > 1.0) {
                    this.targetProgress = 0;
                    this.currentProgress = 0;
                }
            }

            // Apply inertial damping
            const diff = this.targetProgress - this.currentProgress;
            if (Math.abs(diff) > 0.00002) {
                this.currentProgress += diff * this.dampening;
            } else {
                this.currentProgress = this.targetProgress;
            }

            const rawFrameIndex = Math.max(1, Math.min(this.totalFrames, Math.round(1 + this.currentProgress * (this.totalFrames - 1))));
            this.render(rawFrameIndex);

            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    render(rawFrameIndex) {
        this.drawHighQualityFrame(rawFrameIndex);
        this.updateFrostedCards(this.currentProgress, rawFrameIndex);
        this.updateFlightHUD(this.currentProgress, rawFrameIndex);
    }

    /**
     * HIGH-FIDELITY CRISP FRAME RENDERING
     * Eliminates ghosting/motion-blur overlays, renders at integer pixel coordinates,
     * uses high-quality smoothing, and scales seamlessly across the entire window.
     */
    drawHighQualityFrame(frameIndex) {
        const ctx = this.ctx;
        const cw = this.width;
        const ch = this.height;

        const img = this.getFrameOrNearest(frameIndex);
        if (!img) return;

        // Base atmospheric fill
        ctx.fillStyle = '#050608';
        ctx.fillRect(0, 0, cw, ch);

        const iw = img.naturalWidth || 1920;
        const ih = img.naturalHeight || 1080;

        // Cover Scale: fills 100% of window seamlessly with no black letterbox borders
        const scale = Math.max(cw / iw, ch / ih);
        const nw = Math.round(iw * scale);
        const nh = Math.round(ih * scale);
        const nx = Math.round((cw - nw) / 2);
        const ny = Math.round((ch - nh) / 2);

        // Draw active frame with 100% full opacity and crisp edge fidelity
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, nx, ny, nw, nh);

        // Subtle silver atmospheric gradient on horizon
        const horizonGrad = ctx.createLinearGradient(0, ch * 0.82, 0, ch);
        horizonGrad.addColorStop(0, 'rgba(255, 255, 255, 0.0)');
        horizonGrad.addColorStop(1, 'rgba(255, 255, 255, 0.025)');
        ctx.fillStyle = horizonGrad;
        ctx.fillRect(0, Math.round(ch * 0.82), cw, Math.round(ch * 0.18));

        this.lastDrawnFrame = frameIndex;
    }

    getFrameOrNearest(targetIndex) {
        if (this.frames[targetIndex]) return this.frames[targetIndex];
        // Search outwards for nearest loaded frame
        for (let offset = 1; offset < 20; offset++) {
            if (targetIndex - offset >= 1 && this.frames[targetIndex - offset]) {
                return this.frames[targetIndex - offset];
            }
            if (targetIndex + offset <= this.totalFrames && this.frames[targetIndex + offset]) {
                return this.frames[targetIndex + offset];
            }
        }
        return this.frames[1] || null;
    }

    /**
     * Updates frosted glass cards placed in negative air spaces across the frames
     */
    updateFrostedCards(progress, frameIndex) {
        const card1 = document.getElementById('card-negative-1');
        const card2 = document.getElementById('card-negative-2');
        const card3 = document.getElementById('card-negative-3');
        const card4 = document.getElementById('card-negative-4');
        const heroCenter = document.getElementById('hero-main-center');

        // Initial hero text fades out as you start scrolling
        if (heroCenter) {
            const heroOpacity = Math.max(0, 1 - progress * 4.2);
            heroCenter.style.opacity = heroOpacity;
            heroCenter.style.transform = `translateY(${progress * -50}px)`;
            heroCenter.style.pointerEvents = heroOpacity < 0.1 ? 'none' : 'auto';
        }

        // Smoothly fade & translate cards
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
                if (el.id === 'card-negative-4') {
                    el.style.transform = `translateX(-50%) translateY(${(1 - opacity) * 14}px) scale(${0.98 + opacity * 0.02})`;
                } else {
                    el.style.transform = `translateY(${(1 - opacity) * 14}px) scale(${0.98 + opacity * 0.02})`;
                }
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

    updateFlightHUD(progress, rawFrameIndex) {
        const pillTag = document.getElementById('hero-flight-level');
        const railFill = document.getElementById('rail-track-fill');
        const railThumb = document.getElementById('rail-thumb');
        const tooltipText = document.getElementById('rail-tooltip-text');
        const footerStatus = document.getElementById('footer-live-status');

        let alt = 450;
        let mach = 0.90;
        if (rawFrameIndex < 60) {
            alt = 410 + Math.round((rawFrameIndex / 60) * 40);
            mach = (0.86 + (rawFrameIndex / 60) * 0.04).toFixed(2);
        } else if (rawFrameIndex < 140) {
            alt = 450;
            mach = 0.90;
        } else {
            alt = 450 + Math.round(((rawFrameIndex - 140) / 100) * 20);
            mach = 0.92;
        }

        const pct = Math.max(0, Math.min(100, progress * 100));
        if (railFill) railFill.style.height = `${pct.toFixed(2)}%`;
        if (railThumb) railThumb.style.top = `${pct.toFixed(2)}%`;
        if (tooltipText) {
            tooltipText.textContent = `FRAME ${String(rawFrameIndex).padStart(3, '0')} • FL${alt} • M${mach}`;
        }

        if (pillTag) {
            pillTag.innerHTML = `<span class="dot"></span> FLIGHT LEVEL ${alt} • CRUISE MACH ${mach}`;
        }

        if (footerStatus) {
            footerStatus.innerHTML = `<span class="dot"></span> CRUISE FL${alt} • MACH ${mach}`;
        }
    }

    setProgress(val) {
        this.targetProgress = Math.max(0, Math.min(1, val));
    }
}

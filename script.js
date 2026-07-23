/* ==========================================================================
   LIGHTNING FAST & ULTRA-RESPONSIVE NETFLIX INTRO ANIMATION - ENGINE
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    // ---------- DOM References ----------
    const startOverlay = document.getElementById("start-overlay");
    const btnStart = document.getElementById("btn-start");
    const netflixIntro = document.getElementById("netflix-intro");
    const logoBox = document.getElementById("netflix-logo-box");
    const canvas = document.getElementById("spectrum-canvas");
    const ctx = canvas ? canvas.getContext("2d") : null;
    const taDumAudio = document.getElementById("ta-dum-audio");

    // Controls
    const btnMute = document.getElementById("btn-mute");
    const iconUnmuted = document.getElementById("icon-unmuted");
    const iconMuted = document.getElementById("icon-muted");
    const btnReplayIntro = document.getElementById("btn-replay-intro");
    const btnSkipIntro = document.getElementById("btn-skip-intro");
    const btnReplayNav = document.getElementById("btn-replay-nav");

    // Main App
    const mainApp = document.getElementById("main-app");

    // ---------- State ----------
    let isMuted = false;
    let animFrameId = null;
    let spectrumStripes = [];
    let activeTimers = [];
    let isSpectrumActive = false;
    let zoomStartTime = 0;

    // ---------- Canvas Sizing ----------
    function resizeCanvas() {
        if (!canvas || !ctx) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // ---------- 1. Play Official Netflix "Ta-dum" Sound ----------
    function playNetflixTaDumSound() {
        if (isMuted) return;

        if (taDumAudio) {
            taDumAudio.currentTime = 0;
            taDumAudio.muted = false;
            const playPromise = taDumAudio.play();
            if (playPromise !== undefined) {
                playPromise.catch(err => {
                    console.log("Audio play deferred by browser policy:", err);
                });
            }
        }
    }

    function stopNetflixAudio() {
        if (taDumAudio) {
            taDumAudio.pause();
            taDumAudio.currentTime = 0;
        }
    }

    // ---------- 2. Ultra-Fast Zero-Lag Spectrum Engine ----------
    class VerticalSpectrumStripe {
        constructor(index, total) {
            this.index = index;
            this.total = total;
            this.reset();
        }

        reset() {
            const spread = (this.index / this.total) - 0.5;
            this.initialXRatio = spread * 0.4; // Clustered in 'N' center
            this.baseWidth = Math.random() * 6 + 2;

            // Authentic Netflix spectrum palette
            const palette = [
                "#E50914", // Netflix Red
                "#FF1E27", // Bright Red
                "#B81D24", // Crimson
                "#D80073", // Magenta
                "#A200FF", // Purple
                "#00D2FF", // Cyan
                "#00A4EF", // Electric Blue
                "#FFB400", // Gold
                "#FFFFFF", // Pure White
                "#FF3366"  // Coral Pink
            ];

            this.color = palette[Math.floor(Math.random() * palette.length)];
            this.alpha = Math.random() * 0.85 + 0.15;
            this.currentX = 0;
            this.currentWidth = this.baseWidth;
        }

        update(progress) {
            const viewportWidth = window.innerWidth;
            const centerX = viewportWidth / 2;
            
            // Ultra-fast exponential warp expansion
            const cubicProgress = Math.pow(progress, 3);
            const expansionFactor = cubicProgress * 6.5;
            
            // Sideways expansion calculation
            this.currentX = centerX + (this.initialXRatio * viewportWidth) * (1 + expansionFactor);
            this.currentWidth = this.baseWidth * (1 + expansionFactor * 5.0);

            // Fast alpha drop
            if (progress > 0.4) {
                this.alpha *= 0.82;
            }
        }

        draw() {
            if (this.alpha <= 0.01 || !ctx) return;

            const viewportHeight = window.innerHeight;
            ctx.globalAlpha = this.alpha;
            ctx.fillStyle = this.color;

            // High performance GPU fill
            ctx.fillRect(
                this.currentX - this.currentWidth / 2,
                0,
                this.currentWidth,
                viewportHeight
            );
        }
    }

    function initSpectrumEngine() {
        spectrumStripes = [];
        const count = 50; // Ultra-optimized 50 stripes for maximum 240fps fluid rendering
        for (let i = 0; i < count; i++) {
            spectrumStripes.push(new VerticalSpectrumStripe(i, count));
        }
    }

    function renderSpectrumLoop(timestamp) {
        if (!ctx) return;
        if (!zoomStartTime) zoomStartTime = timestamp;
        
        const elapsed = timestamp - zoomStartTime;
        const duration = 500; // Hyper-fast 0.5s zoom burst phase
        const progress = Math.min(elapsed / duration, 1.0);

        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        if (isSpectrumActive) {
            // Additive GPU Composite Mode
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';

            // Center bloom light glow
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            const bloomGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, window.innerWidth * 0.5);
            bloomGradient.addColorStop(0, "rgba(229, 9, 20, " + (0.5 * (1 - progress)) + ")");
            bloomGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
            ctx.fillStyle = bloomGradient;
            ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

            // Update & render stripes
            spectrumStripes.forEach(stripe => {
                stripe.update(progress);
                stripe.draw();
            });

            ctx.restore();

            if (progress < 1.0) {
                animFrameId = requestAnimationFrame(renderSpectrumLoop);
            } else {
                ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
            }
        }
    }

    // ---------- 3. Lightning Fast Timeline Controller ----------
    function clearTimers() {
        activeTimers.forEach(t => clearTimeout(t));
        activeTimers = [];
        if (animFrameId) {
            cancelAnimationFrame(animFrameId);
        }
        if (ctx) ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        isSpectrumActive = false;
        zoomStartTime = 0;
    }

    function startRealNetflixIntro() {
        clearTimers();

        // Show intro layer, hide overlay and main app
        if (startOverlay) startOverlay.classList.add("hidden");
        if (mainApp) mainApp.classList.add("hidden");
        
        if (netflixIntro) {
            netflixIntro.classList.remove("hidden");
            netflixIntro.style.opacity = "1";
            netflixIntro.classList.remove("animating", "zooming");
            void netflixIntro.offsetWidth; // Reflow reset
        }

        // t=0.0s: Play Official "Ta-dum" MP3 & Trigger N Ribbon Draw
        playNetflixTaDumSound();
        if (netflixIntro) netflixIntro.classList.add("animating");

        // t=0.6s: Trigger Camera Zoom into 'N' + Vertical Barcode Spectrum Light Rays!
        const timer1 = setTimeout(() => {
            if (netflixIntro) netflixIntro.classList.add("zooming");
            isSpectrumActive = true;
            zoomStartTime = 0;
            initSpectrumEngine();
            animFrameId = requestAnimationFrame(renderSpectrumLoop);
        }, 600);
        activeTimers.push(timer1);

        // t=1.15s: Zoom completes fast -> Transition IMMEDIATELY to Netflix App
        const timer2 = setTimeout(() => {
            transitionToMainApp();
        }, 1150);
        activeTimers.push(timer2);
    }

    function transitionToMainApp() {
        clearTimers();

        if (netflixIntro) netflixIntro.style.opacity = "0";
        setTimeout(() => {
            if (netflixIntro) netflixIntro.classList.add("hidden");
            if (mainApp) {
                mainApp.classList.remove("hidden");
                mainApp.style.opacity = "1";
            }
        }, 150);
    }

    // ---------- 4. Event Handlers ----------

    if (startOverlay) {
        startOverlay.addEventListener("click", () => {
            startRealNetflixIntro();
        });
    }

    if (btnStart) {
        btnStart.addEventListener("click", (e) => {
            e.stopPropagation();
            startRealNetflixIntro();
        });
    }

    if (btnMute) {
        btnMute.addEventListener("click", (e) => {
            e.stopPropagation();
            isMuted = !isMuted;
            if (taDumAudio) taDumAudio.muted = isMuted;

            if (isMuted) {
                if (iconUnmuted) iconUnmuted.classList.add("hidden");
                if (iconMuted) iconMuted.classList.remove("hidden");
            } else {
                if (iconMuted) iconMuted.classList.add("hidden");
                if (iconUnmuted) iconUnmuted.classList.remove("hidden");
                playNetflixTaDumSound();
            }
        });
    }

    if (btnReplayIntro) {
        btnReplayIntro.addEventListener("click", (e) => {
            e.stopPropagation();
            startRealNetflixIntro();
        });
    }

    if (btnSkipIntro) {
        btnSkipIntro.addEventListener("click", (e) => {
            e.stopPropagation();
            stopNetflixAudio();
            transitionToMainApp();
        });
    }

    if (btnReplayNav) {
        btnReplayNav.addEventListener("click", (e) => {
            e.stopPropagation();
            startRealNetflixIntro();
        });
    }
});
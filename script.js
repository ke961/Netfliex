/* ==========================================================================
   NETFLIX INTRO & MODERN DASHBOARD ENGINE
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    // ---------- DOM References ----------
    const startOverlay = document.getElementById("start-overlay");
    const btnStart = document.getElementById("btn-start");
    const startTitle = document.getElementById("start-title");
    const netflixIntro = document.getElementById("netflix-intro");
    const canvas = document.getElementById("spectrum-canvas");
    const ctx = canvas ? canvas.getContext("2d") : null;
    const taDumAudio = document.getElementById("ta-dum-audio");
    const mainApp = document.getElementById("main-app");
    const navBrandText = document.getElementById("nav-brand-text");
    const profileGrid = document.getElementById("profile-cards-grid");

    // Controls
    const btnMute = document.getElementById("btn-mute");
    const iconUnmuted = document.getElementById("icon-unmuted");
    const iconMuted = document.getElementById("icon-muted");
    const btnReplayIntro = document.getElementById("btn-replay-intro");
    const btnSkipIntro = document.getElementById("btn-skip-intro");
    const btnReplayNav = document.getElementById("btn-replay-nav");
    const btnOpenSettings = document.getElementById("btn-open-settings");

    // Modals & Controls
    const settingsModal = document.getElementById("settings-modal");
    const btnCloseSettings = document.getElementById("btn-close-settings");
    const btnSaveSettings = document.getElementById("btn-save-settings");
    const inputBrandTitle = document.getElementById("input-brand-title");
    const speedBtns = document.querySelectorAll(".speed-btn");
    const themeBtns = document.querySelectorAll(".theme-btn");

    // Trailer Modal
    const trailerModal = document.getElementById("trailer-modal");
    const btnCloseTrailer = document.getElementById("btn-close-trailer");
    const trailerTitle = document.getElementById("trailer-title");

    // Add Profile Modal
    const addProfileModal = document.getElementById("add-profile-modal");
    const btnOpenAddProfile = document.getElementById("btn-open-add-profile");
    const btnCloseAddProfile = document.getElementById("btn-close-add-profile");
    const btnCreateProfile = document.getElementById("btn-create-profile");
    const inputProfileName = document.getElementById("input-profile-name");
    const avatarColorBtns = document.querySelectorAll(".avatar-color-btn");

    // Search
    const inputSearch = document.getElementById("input-search");

    // SVG Stops
    const stopLeft1 = document.getElementById("stop-left-1");
    const stopRight1 = document.getElementById("stop-right-1");
    const stopCenter1 = document.getElementById("stop-center-1");

    // ---------- State ----------
    let isMuted = false;
    let animFrameId = null;
    let spectrumStripes = [];
    let activeTimers = [];
    let isSpectrumActive = false;
    let zoomStartTime = 0;

    // Configurable Settings
    let config = {
        speed: "fast", // 'fast' (1.15s), 'normal' (2.0s), 'slow' (3.5s)
        theme: "red",   // 'red', 'cyber', 'gold', 'emerald'
        brandTitle: "NETFLIX",
        selectedAvatarColor: "#1E88E5"
    };

    const speedTimings = {
        fast: { draw: 600, zoom: 500, total: 1150 },
        normal: { draw: 1000, zoom: 900, total: 2000 },
        slow: { draw: 1800, zoom: 1600, total: 3500 }
    };

    const themePalettes = {
        red: ["#E50914", "#FF1E27", "#B81D24", "#D80073", "#A200FF", "#00D2FF", "#FFFFFF"],
        cyber: ["#00D2FF", "#00A4EF", "#0055FF", "#00E676", "#FF007F", "#FFFFFF"],
        gold: ["#FFB400", "#FFD700", "#FF8C00", "#E50914", "#FFFFFF"],
        emerald: ["#00E676", "#00C853", "#1DE9B6", "#00D2FF", "#FFFFFF"]
    };

    // ---------- Canvas Sizing ----------
    function resizeCanvas() {
        if (!canvas || !ctx) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // ---------- Audio ----------
    function playNetflixTaDumSound() {
        if (isMuted) return;
        if (taDumAudio) {
            taDumAudio.currentTime = 0;
            taDumAudio.muted = false;
            const p = taDumAudio.play();
            if (p !== undefined) p.catch(() => {});
        }
    }

    function stopNetflixAudio() {
        if (taDumAudio) {
            taDumAudio.pause();
            taDumAudio.currentTime = 0;
        }
    }

    // ---------- Spectrum Canvas Engine ----------
    class VerticalSpectrumStripe {
        constructor(index, total) {
            this.index = index;
            this.total = total;
            this.reset();
        }

        reset() {
            const spread = (this.index / this.total) - 0.5;
            this.initialXRatio = spread * 0.4;
            this.baseWidth = Math.random() * 6 + 2;

            const palette = themePalettes[config.theme] || themePalettes.red;
            this.color = palette[Math.floor(Math.random() * palette.length)];
            this.alpha = Math.random() * 0.85 + 0.15;
            this.currentX = 0;
            this.currentWidth = this.baseWidth;
        }

        update(progress) {
            const viewportWidth = window.innerWidth;
            const centerX = viewportWidth / 2;
            
            const cubicProgress = Math.pow(progress, 3);
            const expansionFactor = cubicProgress * 6.5;
            
            this.currentX = centerX + (this.initialXRatio * viewportWidth) * (1 + expansionFactor);
            this.currentWidth = this.baseWidth * (1 + expansionFactor * 5.0);

            if (progress > 0.4) {
                this.alpha *= 0.82;
            }
        }

        draw() {
            if (this.alpha <= 0.01 || !ctx) return;
            ctx.globalAlpha = this.alpha;
            ctx.fillStyle = this.color;
            ctx.fillRect(this.currentX - this.currentWidth / 2, 0, this.currentWidth, window.innerHeight);
        }
    }

    function initSpectrumEngine() {
        spectrumStripes = [];
        const count = 60;
        for (let i = 0; i < count; i++) {
            spectrumStripes.push(new VerticalSpectrumStripe(i, count));
        }
    }

    function renderSpectrumLoop(timestamp) {
        if (!ctx) return;
        if (!zoomStartTime) zoomStartTime = timestamp;
        
        const elapsed = timestamp - zoomStartTime;
        const currentTiming = speedTimings[config.speed] || speedTimings.fast;
        const duration = currentTiming.zoom;
        const progress = Math.min(elapsed / duration, 1.0);

        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        if (isSpectrumActive) {
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';

            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            const bloomColor = themePalettes[config.theme][0] || "#E50914";
            
            const bloomGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, window.innerWidth * 0.5);
            bloomGradient.addColorStop(0, bloomColor + Math.floor((0.5 * (1 - progress)) * 255).toString(16).padStart(2, '0'));
            bloomGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
            ctx.fillStyle = bloomGradient;
            ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

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

    // ---------- Intro Timeline ----------
    function clearTimers() {
        activeTimers.forEach(t => clearTimeout(t));
        activeTimers = [];
        if (animFrameId) cancelAnimationFrame(animFrameId);
        if (ctx) ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        isSpectrumActive = false;
        zoomStartTime = 0;
    }

    function startRealNetflixIntro() {
        clearTimers();

        if (startOverlay) startOverlay.classList.add("hidden");
        if (mainApp) mainApp.classList.add("hidden");
        
        if (netflixIntro) {
            netflixIntro.classList.remove("hidden");
            netflixIntro.style.opacity = "1";
            netflixIntro.classList.remove("animating", "zooming");
            void netflixIntro.offsetWidth;
        }

        playNetflixTaDumSound();
        if (netflixIntro) netflixIntro.classList.add("animating");

        const timing = speedTimings[config.speed] || speedTimings.fast;

        const timer1 = setTimeout(() => {
            if (netflixIntro) netflixIntro.classList.add("zooming");
            isSpectrumActive = true;
            zoomStartTime = 0;
            initSpectrumEngine();
            animFrameId = requestAnimationFrame(renderSpectrumLoop);
        }, timing.draw);
        activeTimers.push(timer1);

        const timer2 = setTimeout(() => {
            transitionToMainApp();
        }, timing.total);
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

    // ---------- Settings Modal Event Handlers ----------

    if (btnOpenSettings) {
        btnOpenSettings.addEventListener("click", (e) => {
            e.stopPropagation();
            if (settingsModal) settingsModal.classList.remove("hidden");
        });
    }

    if (btnCloseSettings) {
        btnCloseSettings.addEventListener("click", () => {
            if (settingsModal) settingsModal.classList.add("hidden");
        });
    }

    speedBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            speedBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            config.speed = btn.getAttribute("data-speed");
        });
    });

    themeBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            themeBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            config.theme = btn.getAttribute("data-theme");
            applyThemeColors(config.theme);
        });
    });

    function applyThemeColors(themeName) {
        const palette = themePalettes[themeName] || themePalettes.red;
        const primaryColor = palette[0];
        const brightColor = palette[1] || palette[0];

        if (stopLeft1) stopLeft1.setAttribute("stop-color", primaryColor);
        if (stopRight1) stopRight1.setAttribute("stop-color", primaryColor);
        if (stopCenter1) stopCenter1.setAttribute("stop-color", brightColor);

        document.documentElement.style.setProperty('--netflix-red', primaryColor);
        document.documentElement.style.setProperty('--netflix-red-bright', brightColor);
    }

    if (btnSaveSettings) {
        btnSaveSettings.addEventListener("click", () => {
            if (inputBrandTitle && inputBrandTitle.value.trim() !== "") {
                config.brandTitle = inputBrandTitle.value.trim();
                if (startTitle) startTitle.textContent = config.brandTitle;
                if (navBrandText) navBrandText.textContent = config.brandTitle;
            }
            if (settingsModal) settingsModal.classList.add("hidden");
            startRealNetflixIntro();
        });
    }

    // ---------- Trailer Modal Handlers ----------
    function openTrailerModal(name) {
        if (trailerTitle) trailerTitle.textContent = name || "STRANGER THINGS";
        if (trailerModal) trailerModal.classList.remove("hidden");
    }

    if (btnCloseTrailer) {
        btnCloseTrailer.addEventListener("click", () => {
            if (trailerModal) trailerModal.classList.add("hidden");
        });
    }

    // Profile Click opens Trailer Showcase
    document.querySelectorAll(".profile-card:not(.add)").forEach(card => {
        card.addEventListener("click", () => {
            const name = card.getAttribute("data-name") || "Stranger Things";
            openTrailerModal(name + "'s Pick: STRANGER THINGS");
        });
    });

    // ---------- Add Profile Modal Handlers ----------
    if (btnOpenAddProfile) {
        btnOpenAddProfile.addEventListener("click", () => {
            if (addProfileModal) addProfileModal.classList.remove("hidden");
        });
    }

    if (btnCloseAddProfile) {
        btnCloseAddProfile.addEventListener("click", () => {
            if (addProfileModal) addProfileModal.classList.add("hidden");
        });
    }

    avatarColorBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            avatarColorBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            config.selectedAvatarColor = btn.getAttribute("data-color");
        });
    });

    if (btnCreateProfile) {
        btnCreateProfile.addEventListener("click", () => {
            const name = (inputProfileName && inputProfileName.value.trim()) || "New Profile";
            const initial = name.charAt(0).toUpperCase();

            // Create new profile card element
            const newCard = document.createElement("div");
            newCard.className = "profile-card";
            newCard.setAttribute("data-name", name);
            newCard.innerHTML = `
                <div class="avatar" style="background: ${config.selectedAvatarColor};">
                    <span>${initial}</span>
                </div>
                <span class="name">${name}</span>
            `;

            newCard.addEventListener("click", () => {
                openTrailerModal(name + "'s Pick: STRANGER THINGS");
            });

            if (profileGrid && btnOpenAddProfile) {
                profileGrid.insertBefore(newCard, btnOpenAddProfile);
            }

            if (addProfileModal) addProfileModal.classList.add("hidden");
        });
    }

    // ---------- Live Search Filter ----------
    if (inputSearch) {
        inputSearch.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase().trim();
            const cards = document.querySelectorAll(".profile-card:not(.add)");
            cards.forEach(card => {
                const name = card.querySelector(".name").textContent.toLowerCase();
                if (name.includes(query)) {
                    card.style.display = "flex";
                } else {
                    card.style.display = "none";
                }
            });
        });
    }

    // ---------- Standard Control Events ----------
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
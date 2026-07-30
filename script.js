/* ==========================================================================
   NETFLIX INTRO & SHOWCASE DASHBOARD ENGINE (ENHANCED)
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

    // Profile & Showcase Sections
    const profileSelectionSection = document.getElementById("profile-selection-section");
    const showcaseDashboard = document.getElementById("showcase-dashboard");
    const profileGrid = document.getElementById("profile-cards-grid");

    // Navigation & Tabs
    const navTabs = document.querySelectorAll(".nav-tab");
    const mediaRowGroups = document.querySelectorAll(".media-row-group");

    // Controls
    const btnMute = document.getElementById("btn-mute");
    const iconUnmuted = document.getElementById("icon-unmuted");
    const iconMuted = document.getElementById("icon-muted");
    const btnReplayIntro = document.getElementById("btn-replay-intro");
    const btnSkipIntro = document.getElementById("btn-skip-intro");
    const btnReplayNav = document.getElementById("btn-replay-nav");
    const btnOpenSettings = document.getElementById("btn-open-settings");

    // Settings Modal
    const settingsModal = document.getElementById("settings-modal");
    const btnCloseSettings = document.getElementById("btn-close-settings");
    const btnSaveSettings = document.getElementById("btn-save-settings");
    const inputBrandTitle = document.getElementById("input-brand-title");
    const speedBtns = document.querySelectorAll(".speed-btn");
    const themeBtns = document.querySelectorAll(".theme-btn");

    // Media Detail Modal (Enhanced)
    const trailerModal = document.getElementById("trailer-modal");
    const btnCloseTrailer = document.getElementById("btn-close-trailer");
    const trailerTitle = document.getElementById("trailer-title");
    const detailBadge = document.getElementById("detail-badge");
    const trailerDesc = document.getElementById("trailer-desc");
    const btnPlayMedia = document.getElementById("btn-play-media");
    const detailMatch = document.getElementById("detail-match");
    const detailYear = document.getElementById("detail-year");
    const detailMaturity = document.getElementById("detail-maturity");
    const detailSeasons = document.getElementById("detail-seasons");
    const detailGenreTags = document.getElementById("detail-genre-tags");
    const btnMylistDetail = document.getElementById("btn-mylist-detail");
    const btnThumbUp = document.getElementById("btn-thumb-up");
    const btnThumbDown = document.getElementById("btn-thumb-down");

    // Add Profile Modal
    const addProfileModal = document.getElementById("add-profile-modal");
    const btnOpenAddProfile = document.getElementById("btn-open-add-profile");
    const btnCloseAddProfile = document.getElementById("btn-close-add-profile");
    const btnCreateProfile = document.getElementById("btn-create-profile");
    const inputProfileName = document.getElementById("input-profile-name");
    const avatarColorBtns = document.querySelectorAll(".avatar-color-btn");

    // Notification
    const btnNotification = document.getElementById("btn-notification");
    const notificationDropdown = document.getElementById("notification-dropdown");

    // Genre Strip
    const genrePills = document.querySelectorAll(".genre-pill");

    // Search
    const inputSearch = document.getElementById("input-search");

    // SVG Gradient Stops
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
    let currentDetailTitle = "";
    let isTransitioning = false; // Ghost-click guard

    let config = {
        speed: "fast",
        theme: "red",
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

    // ---------- My List (localStorage) ----------
    function getMyList() {
        try {
            return JSON.parse(localStorage.getItem("netflix_mylist")) || [];
        } catch { return []; }
    }

    function saveMyList(list) {
        localStorage.setItem("netflix_mylist", JSON.stringify(list));
    }

    function isInMyList(title) {
        return getMyList().includes(title);
    }

    function toggleMyList(title) {
        let list = getMyList();
        if (list.includes(title)) {
            list = list.filter(t => t !== title);
        } else {
            list.push(title);
        }
        saveMyList(list);
        refreshMyListIndicators();
        return list.includes(title);
    }

    function refreshMyListIndicators() {
        document.querySelectorAll(".media-card[data-title]").forEach(card => {
            const title = card.getAttribute("data-title");
            if (isInMyList(title)) {
                card.classList.add("in-mylist");
            } else {
                card.classList.remove("in-mylist");
            }
        });
    }

    // ---------- Thumbs (localStorage) ----------
    function getThumbs() {
        try {
            return JSON.parse(localStorage.getItem("netflix_thumbs")) || {};
        } catch { return {}; }
    }

    function saveThumbs(thumbs) {
        localStorage.setItem("netflix_thumbs", JSON.stringify(thumbs));
    }

    function setThumb(title, direction) {
        const thumbs = getThumbs();
        if (thumbs[title] === direction) {
            delete thumbs[title];
        } else {
            thumbs[title] = direction;
        }
        saveThumbs(thumbs);
        return thumbs[title] || null;
    }

    function updateThumbButtons(title) {
        const thumbs = getThumbs();
        const state = thumbs[title] || null;
        if (btnThumbUp) {
            btnThumbUp.classList.toggle("active-up", state === "up");
        }
        if (btnThumbDown) {
            btnThumbDown.classList.toggle("active-down", state === "down");
        }
    }

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
        const count = 50;
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

    // ---------- Timeline Controller ----------
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
        // Lock interactions during transition to prevent ghost clicks
        isTransitioning = true;
        if (netflixIntro) netflixIntro.style.opacity = "0";
        setTimeout(() => {
            if (netflixIntro) netflixIntro.classList.add("hidden");
            if (mainApp) {
                mainApp.classList.remove("hidden");
                mainApp.style.opacity = "1";
            }
            refreshMyListIndicators();
            injectHoverPreviews();
            // Allow interactions after 600ms safety window
            setTimeout(() => { isTransitioning = false; }, 600);
        }, 150);
    }

    // ---------- Profile Click -> Enter Showcase Dashboard ----------
    function setupProfileClickHandlers() {
        document.querySelectorAll(".profile-card:not(.add)").forEach(card => {
            card.addEventListener("click", () => {
                const name = card.getAttribute("data-name") || "Primary";
                if (profileSelectionSection) profileSelectionSection.classList.add("hidden");
                if (showcaseDashboard) showcaseDashboard.classList.remove("hidden");
                // Update continue watching title
                const cwTitle = document.querySelector('.media-row-group[data-category="all"] .row-title');
                if (cwTitle) cwTitle.textContent = `▶ Continue Watching for ${name}`;
                refreshMyListIndicators();
                injectHoverPreviews();
            });
        });
    }
    setupProfileClickHandlers();

    // ---------- Nav Tabs Filter ----------
    navTabs.forEach(tab => {
        tab.addEventListener("click", (e) => {
            e.preventDefault();
            navTabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");

            const category = tab.getAttribute("data-tab");
            
            // Switch view
            if (profileSelectionSection) profileSelectionSection.classList.add("hidden");
            if (showcaseDashboard) showcaseDashboard.classList.remove("hidden");

            if (category === "mylist") {
                // Show My List view
                showMyListView();
                return;
            }

            mediaRowGroups.forEach(group => {
                if (category === "all" || group.getAttribute("data-category") === category) {
                    group.style.display = "block";
                } else {
                    group.style.display = "none";
                }
            });

            // Show all cards within visible groups
            document.querySelectorAll(".media-card").forEach(card => {
                card.style.display = "";
            });
        });
    });

    // ---------- My List View ----------
    function showMyListView() {
        const list = getMyList();
        mediaRowGroups.forEach(group => group.style.display = "none");

        // Check if mylist row exists, if not create it
        let mylistRow = document.getElementById("mylist-row");
        if (!mylistRow) {
            mylistRow = document.createElement("div");
            mylistRow.id = "mylist-row";
            mylistRow.className = "media-row-group";
            mylistRow.setAttribute("data-category", "mylist");
            mylistRow.innerHTML = `<h2 class="row-title">📋 My List</h2><div class="cards-carousel" id="mylist-carousel"></div>`;
            document.querySelector(".rows-container").appendChild(mylistRow);
        }

        mylistRow.style.display = "block";
        const carousel = document.getElementById("mylist-carousel");
        carousel.innerHTML = "";

        if (list.length === 0) {
            carousel.innerHTML = '<div style="color: #999; padding: 40px 0; font-size: 16px;">Your list is empty. Add movies and shows to see them here.</div>';
            return;
        }

        // Clone matching cards into My List
        document.querySelectorAll(".media-card[data-title]").forEach(card => {
            const title = card.getAttribute("data-title");
            if (list.includes(title) && !card.classList.contains("continue-watching-card")) {
                const clone = card.cloneNode(true);
                clone.classList.remove("top10-card");
                const badge = clone.querySelector(".top10-badge");
                if (badge) badge.remove();
                carousel.appendChild(clone);
            }
        });

        // Re-attach event handlers to cloned cards
        setupMediaTriggerHandlers();
        injectHoverPreviews();
    }

    // ---------- Genre Pill Filtering ----------
    genrePills.forEach(pill => {
        pill.addEventListener("click", () => {
            genrePills.forEach(p => p.classList.remove("active"));
            pill.classList.add("active");
            const genre = pill.getAttribute("data-genre");

            if (genre === "all") {
                document.querySelectorAll(".media-card").forEach(card => {
                    card.style.display = "";
                });
                return;
            }

            document.querySelectorAll(".media-card").forEach(card => {
                const genres = (card.getAttribute("data-genres") || "").toLowerCase();
                const title = (card.getAttribute("data-title") || "").toLowerCase();
                if (genres.includes(genre) || title.includes(genre)) {
                    card.style.display = "";
                } else {
                    card.style.display = "none";
                }
            });
        });
    });

    // ---------- Notification Bell ----------
    if (btnNotification) {
        btnNotification.addEventListener("click", (e) => {
            e.stopPropagation();
            if (notificationDropdown) {
                notificationDropdown.classList.toggle("show");
            }
        });
    }

    // Close notification dropdown on outside click
    document.addEventListener("click", (e) => {
        if (notificationDropdown && !notificationDropdown.contains(e.target) && e.target !== btnNotification) {
            notificationDropdown.classList.remove("show");
        }
    });

    // ---------- Card Hover Preview Injection ----------
    function injectHoverPreviews() {
        document.querySelectorAll(".media-card[data-title]").forEach(card => {
            // Skip if already has preview or is music/continue-watching
            if (card.querySelector(".card-hover-preview") || card.classList.contains("music-card") || card.classList.contains("continue-watching-card")) return;

            const title = card.getAttribute("data-title") || "";
            const match = card.getAttribute("data-match") || "95";
            const maturity = card.getAttribute("data-maturity") || "";
            const genres = (card.getAttribute("data-genres") || "").split(",").filter(Boolean);
            const inList = isInMyList(title);

            const preview = document.createElement("div");
            preview.className = "card-hover-preview";
            preview.innerHTML = `
                <div class="preview-top-section">
                    <div class="preview-buttons">
                        <button class="preview-btn-circle play-btn" title="Play">▶</button>
                        <button class="preview-btn-circle preview-mylist-btn ${inList ? 'in-list' : ''}" title="${inList ? 'Remove from My List' : 'Add to My List'}" data-title="${title}">${inList ? '✓' : '+'}</button>
                        <button class="preview-btn-circle preview-like-btn" title="I like this" data-title="${title}">👍</button>
                    </div>
                    <div class="preview-meta-row">
                        <span class="match-badge">${match}% Match</span>
                        ${maturity ? `<span class="maturity-tag">${maturity}</span>` : ''}
                    </div>
                </div>
                <div class="preview-genre-tags">
                    ${genres.map(g => `<span class="preview-genre-tag">${g.trim()}</span>`).join("")}
                </div>
            `;

            card.appendChild(preview);

            // My List button in preview
            const mylistBtn = preview.querySelector(".preview-mylist-btn");
            if (mylistBtn) {
                mylistBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    const t = mylistBtn.getAttribute("data-title");
                    const nowInList = toggleMyList(t);
                    mylistBtn.textContent = nowInList ? "✓" : "+";
                    mylistBtn.classList.toggle("in-list", nowInList);
                    mylistBtn.title = nowInList ? "Remove from My List" : "Add to My List";
                });
            }

            // Like button in preview
            const likeBtn = preview.querySelector(".preview-like-btn");
            if (likeBtn) {
                likeBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                    const t = likeBtn.getAttribute("data-title");
                    setThumb(t, "up");
                });
            }
        });
    }

    // ---------- Media Detail Modal Handlers ----------
    let currentDetailItem = null;

    function openMediaDetailModal(title, badge, desc, match, year, maturity, seasons, genres, src, embedUrl) {
        let item = null;
        if (typeof title === 'object' && title !== null) {
            item = title;
            currentDetailTitle = item.title;
        } else {
            currentDetailTitle = title || "Stranger Things";
            item = window._mediaCatalog ? window._mediaCatalog.find(it => it.title.toLowerCase() === currentDetailTitle.toLowerCase()) : null;
            if (!item) {
                item = {
                    title: currentDetailTitle,
                    badge: badge || "98% MATCH • 2026 • 4K ULTRA HD",
                    description: desc || "Experience the mystery, action, and music.",
                    src: src || getUniqueFallbackVideo(currentDetailTitle),
                    embedUrl: embedUrl || ""
                };
            }
        }
        currentDetailItem = item;

        if (trailerTitle) trailerTitle.textContent = item.title;
        if (detailBadge) detailBadge.textContent = item.badge || "98% MATCH • 2026 • 4K ULTRA HD";
        if (trailerDesc) trailerDesc.textContent = item.description || desc || "Experience the mystery, action, and music.";
        if (detailMatch) detailMatch.textContent = (item.match || match || "98") + "% Match";
        if (detailYear) detailYear.textContent = item.year || year || "2026";
        if (detailMaturity) detailMaturity.textContent = item.maturity || maturity || "TV-MA";
        if (detailSeasons) detailSeasons.textContent = item.seasons || seasons || "1 Season";

        // Genre tags
        if (detailGenreTags) {
            detailGenreTags.innerHTML = "";
            const gStr = item.genres ? (Array.isArray(item.genres) ? item.genres.join(",") : item.genres) : (genres || "");
            const genreList = gStr.split(",").filter(Boolean);
            genreList.forEach(g => {
                const pill = document.createElement("span");
                pill.className = "detail-genre-pill";
                pill.textContent = g.trim();
                detailGenreTags.appendChild(pill);
            });
        }

        // My List button state
        if (btnMylistDetail) {
            const inList = isInMyList(currentDetailTitle);
            btnMylistDetail.textContent = inList ? "✓ In My List" : "+ My List";
        }

        // Thumb buttons state
        updateThumbButtons(currentDetailTitle);

        if (trailerModal) trailerModal.classList.remove("hidden");
    }

    if (btnCloseTrailer) {
        btnCloseTrailer.addEventListener("click", () => {
            if (trailerModal) trailerModal.classList.add("hidden");
        });
    }

    if (btnPlayMedia) {
        btnPlayMedia.addEventListener("click", () => {
            if (trailerModal) trailerModal.classList.add("hidden");
            if (currentDetailItem) {
                openMediaPlayer(currentDetailItem);
            } else {
                openMediaPlayerByTitle(currentDetailTitle);
            }
        });
    }

    // Hero Play button listener
    const heroPlayBtn = document.getElementById("btn-hero-play-main") || document.querySelector(".featured-hero .btn-hero-play");
    if (heroPlayBtn) {
        heroPlayBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            openMediaPlayerByTitle("Stranger Things");
        });
    }

    // Hero Info button listener
    const heroInfoBtn = document.querySelector(".btn-hero-info");
    if (heroInfoBtn) {
        heroInfoBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const title = heroInfoBtn.getAttribute("data-title") || "Stranger Things";
            const badge = heroInfoBtn.getAttribute("data-badge");
            const desc = heroInfoBtn.getAttribute("data-desc");
            const match = heroInfoBtn.getAttribute("data-match");
            const year = heroInfoBtn.getAttribute("data-year");
            const maturity = heroInfoBtn.getAttribute("data-maturity");
            const seasons = heroInfoBtn.getAttribute("data-seasons");
            const genres = heroInfoBtn.getAttribute("data-genres");
            openMediaDetailModal(title, badge, desc, match, year, maturity, seasons, genres);
        });
    }

    // My List button in detail modal
    if (btnMylistDetail) {
        btnMylistDetail.addEventListener("click", () => {
            const nowInList = toggleMyList(currentDetailTitle);
            btnMylistDetail.textContent = nowInList ? "✓ In My List" : "+ My List";
        });
    }

    // Thumb buttons in detail modal
    if (btnThumbUp) {
        btnThumbUp.addEventListener("click", () => {
            setThumb(currentDetailTitle, "up");
            updateThumbButtons(currentDetailTitle);
        });
    }

    if (btnThumbDown) {
        btnThumbDown.addEventListener("click", () => {
            setThumb(currentDetailTitle, "down");
            updateThumbButtons(currentDetailTitle);
        });
    }

    // ---------- Settings Modal ----------
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

    // ---------- Add Profile Modal ----------
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
                if (profileSelectionSection) profileSelectionSection.classList.add("hidden");
                if (showcaseDashboard) showcaseDashboard.classList.remove("hidden");
                const cwTitle = document.querySelector('.media-row-group[data-category="all"] .row-title');
                if (cwTitle) cwTitle.textContent = `▶ Continue Watching for ${name}`;
                refreshMyListIndicators();
                injectHoverPreviews();
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

            if (profileSelectionSection && !profileSelectionSection.classList.contains("hidden")) {
                if (query.length > 0) {
                    profileSelectionSection.classList.add("hidden");
                    if (showcaseDashboard) showcaseDashboard.classList.remove("hidden");
                }
            }

            if (query.length > 0) {
                mediaRowGroups.forEach(group => group.style.display = "block");
            }

            const cards = document.querySelectorAll(".media-card");
            cards.forEach(card => {
                const title = (card.getAttribute("data-title") || "").toLowerCase();
                const sub = card.querySelector(".card-sub") ? card.querySelector(".card-sub").textContent.toLowerCase() : "";
                const genres = (card.getAttribute("data-genres") || "").toLowerCase();
                const desc = (card.getAttribute("data-desc") || "").toLowerCase();
                if (query === "" || title.includes(query) || sub.includes(query) || genres.includes(query) || desc.includes(query)) {
                    card.style.display = "";
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

    // ---------- Universal Media Player Engine ----------
    const fallbackVideoPool = [
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4",
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4",
        "https://vjs.zencdn.net/v/oceans.mp4",
        "https://media.w3.org/2010/05/sintel/trailer.mp4",
        "https://media.w3.org/2010/05/bunny/movie.mp4",
        "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
    ];

    function getUniqueFallbackVideo(title) {
        let hash = 0;
        const str = title || "Netflix Media";
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % fallbackVideoPool.length;
        return fallbackVideoPool[index];
    }

    function openMediaPlayerByTitle(title, customSrc, customEmbed) {
        let item = window._mediaCatalog ? window._mediaCatalog.find(it => {
            if (!it || !it.title) return false;
            const t1 = it.title.toLowerCase();
            const t2 = (title || "").toLowerCase();
            return t1 === t2 || t1.includes(t2) || t2.includes(t1);
        }) : null;

        if (!item) {
            item = {
                title: title || "Featured Media Stream",
                type: "movie",
                embedUrl: customEmbed || "",
                src: customSrc || getUniqueFallbackVideo(title),
                badge: "NOW STREAMING • 4K ULTRA HD",
                description: "Streaming in Ultra High Definition with Surround Sound."
            };
        } else {
            if (customSrc) item.src = customSrc;
            if (customEmbed) item.embedUrl = customEmbed;
        }
        openMediaPlayer(item);
    }

    function openMediaPlayer(item) {
        if (!item) return;
        stopNetflixAudio();

        const modal = document.getElementById('media-player-modal');
        const titleEl = document.getElementById('media-player-title');
        const badgeEl = document.getElementById('media-player-badge');
        const descEl = document.getElementById('media-player-desc');
        const container = document.getElementById('media-player-container');
        if (!modal || !container) return;

        container.innerHTML = '';
        if (titleEl) titleEl.textContent = item.title || "Media Stream";
        if (badgeEl) badgeEl.textContent = item.badge || (item.type === 'song' ? 'NOW PLAYING • SOUNDTRACK' : 'NOW STREAMING • 4K ULTRA HD');
        if (descEl) descEl.textContent = item.description || item.subtitle || "Streaming high quality audio and video.";

        if (item.type === 'song') {
            const audioWrapper = document.createElement('div');
            audioWrapper.className = 'audio-player-card';
            audioWrapper.innerHTML = `
                <div class="vinyl-container">
                    <div class="vinyl-record">
                        <div class="vinyl-center">♫</div>
                    </div>
                </div>
                <div class="music-eq-visualizer">
                    <div class="music-eq-bar"></div>
                    <div class="music-eq-bar"></div>
                    <div class="music-eq-bar"></div>
                    <div class="music-eq-bar"></div>
                    <div class="music-eq-bar"></div>
                    <div class="music-eq-bar"></div>
                </div>
                <audio src="${item.src}" controls autoplay></audio>
            `;
            container.appendChild(audioWrapper);
            const audioEl = audioWrapper.querySelector('audio');
            if (audioEl) audioEl.play().catch(e => console.log("Audio autoplay deferred:", e));
        } else {
            // Direct HTML5 Video Player with controls, source element & resilient error fallback
            const video = document.createElement('video');
            video.controls = true;
            video.autoplay = true;
            video.playsInline = true;
            video.preload = "auto";
            video.style.width = '100%';
            video.style.maxHeight = '70vh';
            video.style.borderRadius = '12px';

            const videoSrc = item.src || getUniqueFallbackVideo(item.title);
            
            const source = document.createElement('source');
            source.src = videoSrc;
            source.type = 'video/mp4';
            video.appendChild(source);

            // Direct src fallback
            video.src = videoSrc;

            // Robust error listener: If external link fails to load/CORS, switch to reliable fallback stream
            video.onerror = () => {
                console.warn("Primary video stream failed/blocked, loading resilient fallback stream...");
                const safeStream = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4";
                if (video.src !== safeStream) {
                    source.src = safeStream;
                    video.src = safeStream;
                    video.load();
                    video.play().catch(e => console.log("Fallback stream play deferred:", e));
                }
            };

            container.appendChild(video);

            video.load();
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch(e => console.log("Video autoplay deferred:", e));
            }
        }

        modal.classList.remove('hidden');
    }

    function closeMediaPlayer() {
        const modal = document.getElementById('media-player-modal');
        const container = document.getElementById('media-player-container');
        if (modal) modal.classList.add('hidden');
        if (container) container.innerHTML = '';
    }

    document.getElementById('media-player-close')?.addEventListener('click', closeMediaPlayer);

    // Local Video File Upload Handler
    const inputLocalVideo = document.getElementById('input-local-video');
    if (inputLocalVideo) {
        inputLocalVideo.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const objectUrl = URL.createObjectURL(file);
            openMediaPlayer({
                title: file.name.replace(/\.[^/.]+$/, ""),
                type: "movie",
                src: objectUrl,
                badge: "LOCAL MOVIE FILE • HIGH DEFINITION",
                description: `Streaming local file: ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)`
            });
        });
    }

    // Custom Video Link Paste Handler
    const btnCustomUrl = document.getElementById('btn-custom-url');
    if (btnCustomUrl) {
        btnCustomUrl.addEventListener('click', () => {
            const url = prompt("Enter custom Video URL or YouTube link to play:");
            if (!url || !url.trim()) return;
            let srcUrl = url.trim();
            let embedUrl = "";
            if (srcUrl.includes("youtube.com/watch?v=")) {
                const vId = srcUrl.split("v=")[1].split("&")[0];
                embedUrl = `https://www.youtube-nocookie.com/embed/${vId}?autoplay=1`;
            } else if (srcUrl.includes("youtu.be/")) {
                const vId = srcUrl.split("youtu.be/")[1].split("?")[0];
                embedUrl = `https://www.youtube-nocookie.com/embed/${vId}?autoplay=1`;
            }
            openMediaPlayer({
                title: "Custom Video Stream",
                type: "movie",
                embedUrl: embedUrl,
                src: srcUrl,
                badge: "CUSTOM STREAM • HD",
                description: "Streaming user-provided video link."
            });
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeMediaPlayer();
            if (trailerModal) trailerModal.classList.add('hidden');
            if (settingsModal) settingsModal.classList.add('hidden');
            if (addProfileModal) addProfileModal.classList.add('hidden');
        }
    });

    function setupMediaTriggerHandlers() {
        document.querySelectorAll('.media-card, .media-trigger-btn').forEach(btn => {
            if (btn._hasMediaListener) return;
            btn._hasMediaListener = true;

            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (isTransitioning) return;

                const title = btn.getAttribute('data-title') || (btn.dataset ? btn.dataset.title : '');
                const customSrc = btn.getAttribute('data-src') || (btn.dataset ? btn.dataset.src : '');
                const customEmbed = btn.getAttribute('data-embed') || (btn.dataset ? btn.dataset.embedUrl : '');
                const isMusic = btn.classList.contains('music-card') || (btn.dataset && btn.dataset.type === 'song');
                const isPlayBtn = e.target.closest('.play-btn') || e.target.closest('.play-circle') || e.target.closest('.music-play-circle') || btn.classList.contains('btn-hero-play');

                let item = window._mediaCatalog ? window._mediaCatalog.find(it => {
                    if (!it || !it.title) return false;
                    return it.title.toLowerCase() === title.toLowerCase();
                }) : null;

                if (!item) {
                    item = {
                        title: title || "Featured Media Stream",
                        type: isMusic ? "song" : "movie",
                        src: customSrc || getUniqueFallbackVideo(title),
                        embedUrl: customEmbed || "",
                        badge: btn.getAttribute('data-badge') || "98% MATCH • 4K ULTRA HD",
                        description: btn.getAttribute('data-desc') || "Streaming in Ultra High Definition with Surround Sound."
                    };
                }

                if (isPlayBtn || isMusic) {
                    openMediaPlayer(item);
                } else {
                    openMediaDetailModal(item);
                }
            });
        });
    }

    const FALLBACK_CATALOG = [
        { "id": "stranger-things", "type": "movie", "category": "series", "title": "Stranger Things", "subtitle": "Season 5 • Netflix Original", "badge": "99% MATCH • 2026 • 4K ULTRA HD", "description": "The final chapter begins. Mysterious forces take over Hawkins as Eleven and the group unite for their ultimate battle.", "match": "99", "year": "2026", "maturity": "TV-MA", "seasons": "5 Seasons", "genres": ["Sci-Fi", "Horror", "Mystery"], "src": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4" },
        { "id": "oppenheimer", "type": "movie", "category": "trending", "title": "Oppenheimer", "subtitle": "Christopher Nolan Masterpiece", "badge": "99% MATCH • 2024 • IMAX 4K", "description": "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.", "match": "99", "year": "2024", "maturity": "R", "seasons": "Movie", "genres": ["Biography", "Drama", "History"], "src": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4" },
        { "id": "arcane", "type": "movie", "category": "anime", "title": "Arcane", "subtitle": "Season 2 • Riot Games", "badge": "100% MATCH • 2024 • HDR", "description": "Amid the stark discord of twin cities Piltover and Zaun, two sisters fight on opposing sides.", "match": "100", "year": "2024", "maturity": "TV-MA", "seasons": "2 Seasons", "genres": ["Anime", "Sci-Fi", "Action"], "src": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
        { "id": "cyberpunk-edgerunners", "type": "movie", "category": "anime", "title": "Cyberpunk: Edgerunners", "subtitle": "Anime Series • Studio Trigger", "badge": "99% MATCH • 2024 • HDR", "description": "A street kid trying to survive in a technology and body modification-obsessed city of the future.", "match": "99", "year": "2024", "maturity": "TV-MA", "seasons": "1 Season", "genres": ["Cyberpunk", "Anime", "Action"], "src": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" },
        { "id": "breaking-bad", "type": "movie", "category": "series", "title": "Breaking Bad", "subtitle": "All 5 Seasons • Drama", "badge": "99% MATCH • 2023 • 4K", "description": "A chemistry teacher turns to manufacturing methamphetamine.", "match": "99", "year": "2023", "maturity": "TV-MA", "seasons": "5 Seasons", "genres": ["Crime", "Drama"], "src": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4" },
        { "id": "wednesday", "type": "movie", "category": "series", "title": "Wednesday", "subtitle": "Season 2 • Fantasy", "badge": "98% MATCH • 2025 • 4K", "description": "Wednesday Addams investigates a murder spree while making new friends.", "match": "98", "year": "2025", "maturity": "TV-14", "seasons": "2 Seasons", "genres": ["Fantasy", "Mystery"], "src": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" },
        { "id": "the-dark-knight", "type": "movie", "category": "movies", "title": "The Dark Knight", "subtitle": "Batman vs Joker", "badge": "99% MATCH • PG-13", "description": "Batman faces the Joker, a criminal mastermind who plunges Gotham City into chaos.", "match": "99", "year": "2008", "maturity": "PG-13", "seasons": "Movie", "genres": ["Action", "Crime"], "src": "https://media.w3.org/2010/05/bunny/movie.mp4" },
        { "id": "inception", "type": "movie", "category": "movies", "title": "Inception", "subtitle": "Christopher Nolan Sci-Fi", "badge": "98% MATCH • PG-13", "description": "A thief steals corporate secrets through dream-sharing technology.", "match": "98", "year": "2010", "maturity": "PG-13", "seasons": "Movie", "genres": ["Sci-Fi", "Action"], "src": "https://media.w3.org/2010/05/sintel/trailer.mp4" }
    ];

    async function loadMediaData() {
        try {
            const resp = await fetch('mediaData.json');
            if (!resp.ok) throw new Error("JSON fetch failed");
            const data = await resp.json();
            window._mediaCatalog = data;
            populateMediaRows(data);
        } catch (e) {
            console.warn('Using embedded catalog fallback:', e);
            window._mediaCatalog = FALLBACK_CATALOG;
            populateMediaRows(FALLBACK_CATALOG);
        }
    }

    function populateMediaRows(data) {
        if (!data || !Array.isArray(data)) return;
        data.forEach(item => {
            const category = item.category || (item.type === 'movie' ? 'movies' : 'music');
            let rowGroup = document.querySelector(`.media-row-group[data-category="${category}"]`);
            if (!rowGroup) {
                rowGroup = document.querySelector(`.media-row-group[data-category="${item.type === 'movie' ? 'movies' : 'music'}"]`);
            }
            if (!rowGroup) return;

            const existing = rowGroup.querySelector(`[data-title="${item.title}"]`);
            if (existing) {
                existing.dataset.src = item.src;
                return;
            }

            const card = document.createElement('div');
            card.className = `media-card ${category}-card media-trigger-btn`;
            card.dataset.title = item.title;
            card.dataset.badge = item.badge || '';
            card.dataset.desc = item.description || '';
            card.dataset.match = item.match || '';
            card.dataset.year = item.year || '';
            card.dataset.maturity = item.maturity || '';
            card.dataset.seasons = item.seasons || '';
            card.dataset.genres = (item.genres || []).join(',');
            card.dataset.src = item.src || '';
            card.dataset.type = item.type || '';

            const thumbClass = `${category}-thumb-${Math.floor(Math.random()*10)+1}`;
            card.innerHTML = `
                <div class="card-thumb ${thumbClass}">
                    <div class="${category === 'movie' ? 'play-circle' : 'music-play-circle'}"></div>
                </div>
                <div class="card-info">
                    <span class="card-name">${item.title}</span>
                    <span class="card-sub">${item.subtitle || ''}</span>
                </div>`;

            const carousel = rowGroup.querySelector('.cards-carousel');
            if (carousel) carousel.appendChild(card);
        });

        if (typeof injectHoverPreviews === 'function') injectHoverPreviews();
        setupMediaTriggerHandlers();
    }

    loadMediaData();
});
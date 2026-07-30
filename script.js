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
        if (netflixIntro) netflixIntro.style.opacity = "0";
        setTimeout(() => {
            if (netflixIntro) netflixIntro.classList.add("hidden");
            if (mainApp) {
                mainApp.classList.remove("hidden");
                mainApp.style.opacity = "1";
            }
            refreshMyListIndicators();
            injectHoverPreviews();
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
    function openMediaDetailModal(title, badge, desc, match, year, maturity, seasons, genres) {
        currentDetailTitle = title || "STRANGER THINGS";
        if (trailerTitle) trailerTitle.textContent = currentDetailTitle;
        if (detailBadge) detailBadge.textContent = badge || "98% MATCH • 2026 • 4K ULTRA HD";
        if (trailerDesc) trailerDesc.textContent = desc || "Experience the mystery, action, and music.";
        if (detailMatch) detailMatch.textContent = (match || "98") + "% Match";
        if (detailYear) detailYear.textContent = year || "2026";
        if (detailMaturity) detailMaturity.textContent = maturity || "TV-MA";
        if (detailSeasons) detailSeasons.textContent = seasons || "1 Season";

        // Genre tags
        if (detailGenreTags) {
            detailGenreTags.innerHTML = "";
            const genreList = (genres || "").split(",").filter(Boolean);
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

    function setupMediaTriggerHandlers() {
        document.querySelectorAll(".media-trigger-btn").forEach(btn => {
            // Remove old listeners by cloning (only for non-clone elements)
            if (btn._hasMediaListener) return;
            btn._hasMediaListener = true;
            
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const title = btn.getAttribute("data-title");
                const badge = btn.getAttribute("data-badge");
                const desc = btn.getAttribute("data-desc");
                const match = btn.getAttribute("data-match");
                const year = btn.getAttribute("data-year");
                const maturity = btn.getAttribute("data-maturity");
                const seasons = btn.getAttribute("data-seasons");
                const genres = btn.getAttribute("data-genres");
                openMediaDetailModal(title, badge, desc, match, year, maturity, seasons, genres);
            });
        });
    }
    setupMediaTriggerHandlers();

    if (btnCloseTrailer) {
        btnCloseTrailer.addEventListener("click", () => {
            if (trailerModal) trailerModal.classList.add("hidden");
        });
    }

    if (btnPlayMedia) {
        btnPlayMedia.addEventListener("click", () => {
            alert("▶️ Now Streaming: " + (trailerTitle ? trailerTitle.textContent : "Media"));
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

            // Make sure we're in the dashboard
            if (profileSelectionSection && !profileSelectionSection.classList.contains("hidden")) {
                if (query.length > 0) {
                    profileSelectionSection.classList.add("hidden");
                    if (showcaseDashboard) showcaseDashboard.classList.remove("hidden");
                }
            }

            // Show all rows when searching
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
});
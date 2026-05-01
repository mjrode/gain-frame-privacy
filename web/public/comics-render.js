        /* ---- Format date for newspaper ---- */
        function formatNewspaperDate(dateStr) {
            if (!dateStr) return '';
            const d = new Date(dateStr + 'T00:00:00');
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
        }

        /* ---- Masthead entrance animation ---- */
        (() => {
            const masthead = document.querySelector('.newspaper-masthead');
            if (!masthead) return;
            if (!sessionStorage.getItem('gf-masthead-played')) {
                masthead.classList.add('masthead-animate');
                sessionStorage.setItem('gf-masthead-played', '1');
            }
        })();

        /* ---- Share utility ---- */
        const shareToast = document.getElementById('shareToast');
        let toastTimer = null;
        function shareComic(slug, title) {
            const url = `${window.location.origin}/comics.html?comic=${slug}`;
            if (navigator.share) {
                navigator.share({ title: title, text: `Check out "${title}" from GainFrame`, url: url }).catch(() => {});
            } else {
                navigator.clipboard.writeText(url).then(() => {
                    shareToast.classList.add('show');
                    clearTimeout(toastTimer);
                    toastTimer = setTimeout(() => shareToast.classList.remove('show'), 2000);
                }).catch(() => {});
            }
        }

        /* ---- Render Gallery Grid ---- */
        (() => {
            const grid = document.getElementById('comicsGrid');
            const filterBar = document.getElementById('filterBar');
            const countLabel = document.getElementById('comicsCountLabel');
            const sectionCount = document.getElementById('sectionCount');
            if (!grid || typeof COMICS_MANIFEST === 'undefined') return;

            countLabel.textContent = `${COMICS_MANIFEST.length} Issue${COMICS_MANIFEST.length !== 1 ? 's' : ''}`;
            sectionCount.textContent = `${COMICS_MANIFEST.length} comic${COMICS_MANIFEST.length !== 1 ? 's' : ''} published`;

            // Read tracking
            const readComics = JSON.parse(localStorage.getItem('gf-read-comics') || '[]');

            // "New" threshold — 7 days
            // "New" ribbon on the 3 newest comics only
            const NEW_COUNT = 3;
            function isNew(index) {
                return index < NEW_COUNT;
            }

            const TAG_MAP = {
                Training: /exercise|split|overload|core|gym|workout|lifting|working-out|doing-wrong|that-guy|beginner/,
                Nutrition: /protein|food|bulk|cut|alcohol|water|creatine|cheap|muscle-foods|supplements/,
                Recovery: /sleep|overtraining|plateau|stuck|deload|signs-making/,
                'Body Comp': /body-fat|tracking|progress|1month|gains|first-cut|skinny-fat|one-year/,
            };
            function getTag(slug) {
                for (const [tag, re] of Object.entries(TAG_MAP)) {
                    if (re.test(slug)) return tag;
                }
                return 'Mindset';
            }

            // Comic series collections
            const SERIES = {
                "Beginner's Guide": ['beginner-gym-split', 'your-first-gym-week', 'progressive-overload', 'first-cut-tips'],
                'Nutrition Essentials': ['30g-of-protein', 'cheap-muscle-foods', 'supplements-that-work', 'creatine-myths-vs-facts'],
                'Body Recomp': ['skinny-fat-trap', 'bulk-vs-cut', 'bulk-cut-maintain', 'stop-guessing-body-fat'],
            };
            function getSeriesName(slug) {
                for (const [name, slugs] of Object.entries(SERIES)) {
                    if (slugs.includes(slug)) return name;
                }
                return null;
            }

            const PULL_QUOTES = [
                { text: '"The last three reps are what makes the muscle grow."', cite: '— Arnold Schwarzenegger' },
                { text: '"What gets measured, gets managed."', cite: '— Peter Drucker' },
                { text: '"Discipline is choosing between what you want now and what you want most."', cite: '— Abraham Lincoln' },
            ];

            // Filter bar
            const allTags = ['All', 'Training', 'Nutrition', 'Recovery', 'Body Comp', 'Mindset'];
            let activeFilter = 'All';
            allTags.forEach(tag => {
                const pill = document.createElement('button');
                pill.className = 'filter-pill' + (tag === 'All' ? ' active' : '');
                pill.textContent = tag;
                pill.addEventListener('click', () => {
                    activeFilter = tag;
                    filterBar.querySelectorAll('.filter-pill').forEach(p => p.classList.toggle('active', p.textContent === tag));
                    grid.querySelectorAll('.comic-card').forEach(card => {
                        const cardTag = card.getAttribute('data-tag');
                        card.classList.toggle('filter-hidden', tag !== 'All' && cardTag !== tag);
                    });
                    // Show/hide pull-quotes when filtering
                    grid.querySelectorAll('.newspaper-pullquote').forEach(pq => {
                        pq.classList.toggle('filter-hidden', tag !== 'All');
                    });
                });
                filterBar.appendChild(pill);
            });

            // Hero card — first comic
            const hero = COMICS_MANIFEST[0];
            const heroRead = readComics.includes(hero.slug);
            const heroNew = isNew(0);
            const heroSeries = getSeriesName(hero.slug);
            const heroEl = document.createElement('div');
            heroEl.className = 'comic-hero scroll-reveal';
            heroEl.setAttribute('data-slug', hero.slug);
            heroEl.setAttribute('role', 'button');
            heroEl.setAttribute('tabindex', '0');
            heroEl.innerHTML = `
                <div class="comic-hero-cover">
                    <img src="/assets/tiktok/comic/${hero.slug}/slide-0-cover.${hero.ext}" alt="${hero.title}" loading="eager">
                    ${heroRead ? '<span class="comic-card-read"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>Read</span>' : ''}
                    ${heroNew ? '<div class="comic-new-ribbon"><span>New</span></div>' : ''}
                </div>
                <div class="comic-hero-info">
                    <span class="hero-label">Latest Issue — No. ${String(COMICS_MANIFEST.length).padStart(2, '0')}</span>
                    <h3>${hero.title}</h3>
                    <span class="comic-tag">${getTag(hero.slug)}</span>
                    ${heroSeries ? `<span class="comic-series-badge"><svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M4 4.5A2.5 2.5 0 016.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15z"/></svg>${heroSeries}</span>` : ''}
                    <span class="hero-date">${formatNewspaperDate(hero.date)}</span>
                    <span class="hero-cta">Read Now &#8594;</span>
                </div>
                <button class="comic-share-btn" style="top:auto;bottom:12px;right:12px" onclick="event.stopPropagation();shareComic('${hero.slug}','${hero.title.replace(/'/g, "\\'")}');" aria-label="Share"><svg viewBox="0 0 24 24"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg></button>
            `;
            grid.parentNode.insertBefore(heroEl, grid);

            // Grid cards — skip first (hero)
            let pqIdx = 0;
            COMICS_MANIFEST.slice(1).forEach((comic, i) => {
                // Pull-quote after every 6 cards
                if (i > 0 && i % 6 === 0 && pqIdx < PULL_QUOTES.length) {
                    const pq = PULL_QUOTES[pqIdx++];
                    const quoteEl = document.createElement('div');
                    quoteEl.className = 'newspaper-pullquote scroll-reveal';
                    quoteEl.innerHTML = `<blockquote>${pq.text}</blockquote><cite>${pq.cite}</cite>`;
                    grid.appendChild(quoteEl);
                }

                const tag = getTag(comic.slug);
                const isRead = readComics.includes(comic.slug);
                const comicIsNew = isNew(i + 1);
                const series = getSeriesName(comic.slug);
                const card = document.createElement('div');
                card.className = `comic-card scroll-reveal-card card-delay-${(i % 3) + 1}`;
                card.setAttribute('data-slug', comic.slug);
                card.setAttribute('data-tag', tag);
                card.setAttribute('role', 'button');
                card.setAttribute('tabindex', '0');
                card.innerHTML = `
                    <div class="comic-card-cover">
                        <img src="/assets/tiktok/comic/${comic.slug}/slide-0-cover.${comic.ext}"
                             alt="${comic.title}" loading="lazy">
                        <span class="comic-issue-num">No. ${String(COMICS_MANIFEST.length - (i + 1)).padStart(2, '0')}</span>
                        <span class="comic-slide-count">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                <rect x="3" y="3" width="18" height="18" rx="2"/>
                                <path d="M3 9h18M9 3v18"/>
                            </svg>
                            6 slides
                        </span>
                        ${isRead ? '<span class="comic-card-read"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>Read</span>' : ''}
                        ${comicIsNew ? '<div class="comic-new-ribbon"><span>New</span></div>' : ''}
                    </div>
                    <div class="comic-card-info">
                        <h3>${comic.title}</h3>
                        <div class="comic-card-date">${formatNewspaperDate(comic.date)}</div>
                        <span class="comic-tag">${tag}</span>
                        ${series ? `<span class="comic-series-badge"><svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M4 4.5A2.5 2.5 0 016.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15z"/></svg>${series}</span>` : ''}
                        <button class="comic-share-btn" onclick="event.stopPropagation();shareComic('${comic.slug}','${comic.title.replace(/'/g, "\\'")}');" aria-label="Share"><svg viewBox="0 0 24 24"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg></button>
                    </div>
                `;
                grid.appendChild(card);
            });
        })();

        /* ---- Peek Carousel Viewer ---- */
        (() => {
            const viewer = document.getElementById('comicViewer');
            const track = document.getElementById('viewerTrack');
            const titleEl = document.getElementById('viewerTitle');
            const counterEl = document.getElementById('viewerCounter');
            const dotsEl = document.getElementById('viewerDots');
            const prevBtn = document.getElementById('viewerPrev');
            const nextBtn = document.getElementById('viewerNext');
            const closeBtn = document.getElementById('viewerClose');
            const progressFill = document.getElementById('viewerProgressFill');

            let currentSlug = '';
            let currentSlide = 0;
            let totalSlides = 6;
            const BASE_SLIDES = 6;

            // Layout metrics — computed once on open and on resize
            let slideWidth = 0;
            let slideGap = 28;

            function computeLayout() {
                const s = track.querySelector('.comic-viewer-slide');
                if (s) slideWidth = s.offsetWidth;
                else slideWidth = Math.min(560, window.innerWidth * 0.54);
                slideGap = parseFloat(getComputedStyle(track).gap) || 28;
            }

            // Math-based offset: no DOM measurement needed during transitions
            function trackOffset(index, drag) {
                return -(index * (slideWidth + slideGap) + slideWidth / 2) + (drag || 0);
            }

            function getSlideUrl(slug, index) {
                const comic = COMICS_MANIFEST.find(c => c.slug === slug);
                const ext = comic ? comic.ext : 'png';
                if (index === 0) return `/assets/tiktok/comic/${slug}/slide-0-cover.${ext}`;
                return `/assets/tiktok/comic/${slug}/slide-${index}.${ext}`;
            }

            function getComicTitle(slug) {
                const comic = COMICS_MANIFEST.find(c => c.slug === slug);
                return comic ? comic.title : slug;
            }

            let wasDragging = false;

            function buildSlides(slug) {
                track.innerHTML = '';
                const currentIdx = COMICS_MANIFEST.findIndex(c => c.slug === slug);
                const nextComic = currentIdx >= 0 && currentIdx < COMICS_MANIFEST.length - 1 ? COMICS_MANIFEST[currentIdx + 1] : null;
                totalSlides = nextComic ? BASE_SLIDES + 1 : BASE_SLIDES;

                for (let i = 0; i < BASE_SLIDES; i++) {
                    const slide = document.createElement('div');
                    slide.className = 'comic-viewer-slide';
                    slide.setAttribute('data-index', i);
                    const img = document.createElement('img');
                    img.src = getSlideUrl(slug, i);
                    img.alt = `${getComicTitle(slug)} — Slide ${i + 1}`;
                    img.loading = i <= 2 ? 'eager' : 'lazy';
                    img.draggable = false;
                    slide.appendChild(img);
                    slide.addEventListener('click', () => {
                        if (wasDragging) { wasDragging = false; return; }
                        if (i !== currentSlide) goToSlide(i);
                    });
                    track.appendChild(slide);
                }

                // "Next Up" card
                if (nextComic) {
                    const nextSlide = document.createElement('div');
                    nextSlide.className = 'comic-viewer-slide comic-viewer-next-up';
                    nextSlide.setAttribute('data-index', BASE_SLIDES);
                    const nextImg = document.createElement('img');
                    nextImg.src = `/assets/tiktok/comic/${nextComic.slug}/slide-0-cover.${nextComic.ext}`;
                    nextImg.alt = nextComic.title;
                    nextImg.draggable = false;
                    nextSlide.appendChild(nextImg);
                    nextSlide.innerHTML += `<div class="next-up-content"><div class="next-up-label">Next Up</div><div class="next-up-title">${nextComic.title}</div><span class="next-up-cta">Read Next &#8594;</span></div>`;
                    nextSlide.addEventListener('click', () => {
                        if (wasDragging) { wasDragging = false; return; }
                        openViewer(nextComic.slug);
                    });
                    track.appendChild(nextSlide);
                }
            }

            function updateCounter() {
                counterEl.innerHTML = `<span class="current-num">0${currentSlide + 1}</span> of ${String(totalSlides).padStart(2, '0')}`;
            }

            // Build dots once; update classes on navigate for smooth CSS transitions
            function renderDots() {
                dotsEl.innerHTML = '';
                for (let i = 0; i < totalSlides; i++) {
                    const dot = document.createElement('div');
                    dot.className = 'comic-viewer-dot';
                    if (i === currentSlide) dot.classList.add('active');
                    dot.addEventListener('click', () => goToSlide(i));
                    dotsEl.appendChild(dot);
                }
            }

            function updateDots() {
                dotsEl.querySelectorAll('.comic-viewer-dot').forEach((d, i) => {
                    d.classList.toggle('active', i === currentSlide);
                });
            }

            function updateSlideStates() {
                track.querySelectorAll('.comic-viewer-slide').forEach((slide, i) => {
                    slide.classList.remove('active', 'adjacent', 'far');
                    const diff = Math.abs(i - currentSlide);
                    if (diff === 0) slide.classList.add('active');
                    else if (diff === 1) slide.classList.add('adjacent');
                    else slide.classList.add('far');
                });
                track.style.transform = `translate(${trackOffset(currentSlide)}px, -50%)`;
            }

            function updateProgress() {
                if (progressFill) progressFill.style.width = `${((currentSlide + 1) / totalSlides) * 100}%`;
            }

            function goToSlide(index) {
                currentSlide = Math.max(0, Math.min(index, totalSlides - 1));
                updateSlideStates();
                updateCounter();
                updateDots();
                updateProgress();
                prevBtn.disabled = currentSlide === 0;
                nextBtn.disabled = currentSlide === totalSlides - 1;
            }

            function openViewer(slug, skipHistory = false) {
                currentSlug = slug;
                currentSlide = 0;
                titleEl.textContent = getComicTitle(slug);
                buildSlides(slug);
                renderDots();

                // Mark as read
                const read = JSON.parse(localStorage.getItem('gf-read-comics') || '[]');
                if (!read.includes(slug)) {
                    read.push(slug);
                    localStorage.setItem('gf-read-comics', JSON.stringify(read));
                    // Add read badge to the card in the grid
                    const card = document.querySelector(`[data-slug="${slug}"] .comic-card-cover`);
                    if (card && !card.querySelector('.comic-card-read')) {
                        card.insertAdjacentHTML('beforeend', '<span class="comic-card-read"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>Read</span>');
                    }
                }

                // Suppress track & slide transitions for instant initial position
                track.classList.add('dragging');
                viewer.classList.add('active');
                document.body.style.overflow = 'hidden';

                // Two-frame RAF: frame 1 lets browser lay out, frame 2 enables transitions
                requestAnimationFrame(() => {
                    computeLayout();
                    track.style.transform = `translate(${trackOffset(0)}px, -50%)`;

                    const slides = track.querySelectorAll('.comic-viewer-slide');
                    slides.forEach((s, i) => {
                        s.style.transition = 'none';
                        s.classList.remove('active', 'adjacent', 'far');
                        if (i === 0) s.classList.add('active');
                        else if (i === 1) s.classList.add('adjacent');
                        else s.classList.add('far');
                    });

                    requestAnimationFrame(() => {
                        track.classList.remove('dragging');
                        slides.forEach(s => s.style.transition = '');
                        updateCounter();
                        prevBtn.disabled = true;
                        nextBtn.disabled = totalSlides <= 1;
                    });
                });

                // Swipe hint — first open on touch devices only
                if ('ontouchstart' in window && !localStorage.getItem('gf-swipe-hint-shown')) {
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            const hint = document.createElement('div');
                            hint.className = 'swipe-hint';
                            hint.innerHTML = '<svg viewBox="0 0 48 48"><path d="M24 38V22"/><path d="M20 14c0-2.2 1.8-4 4-4s4 1.8 4 4v12"/><path d="M28 20c0-2.2 1.8-4 4-4s4 1.8 4 4v8"/><path d="M36 24c0-2.2 1.8-4 4-4s4 1.8 4 4v6a14 14 0 01-14 14h-4a14 14 0 01-10-4l-8-8c-1.5-1.5-1.5-4 0-5.5 1.5-1.5 4-1.5 5.5 0l4.5 4.5"/></svg>';
                            document.querySelector('.comic-viewer-stage').appendChild(hint);
                            localStorage.setItem('gf-swipe-hint-shown', '1');
                            setTimeout(() => hint.remove(), 2000);
                        });
                    });
                }

                if (!skipHistory) {
                    const url = new URL(window.location);
                    url.searchParams.set('comic', slug);
                    window.history.pushState({ comic: slug }, '', url);
                }
            }

            function closeViewer(skipHistory = false) {
                if (!viewer.classList.contains('active')) return;
                viewer.classList.remove('active');
                document.body.style.overflow = '';
                if (!skipHistory) {
                    const url = new URL(window.location);
                    url.searchParams.delete('comic');
                    window.history.pushState({}, '', url);
                }
            }

            // Card click handlers
            document.addEventListener('click', (e) => {
                const card = e.target.closest('.comic-card') || e.target.closest('.comic-hero');
                if (card) {
                    e.preventDefault();
                    openViewer(card.getAttribute('data-slug'));
                }
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const card = e.target.closest('.comic-card') || e.target.closest('.comic-hero');
                    if (card) {
                        e.preventDefault();
                        openViewer(card.getAttribute('data-slug'));
                    }
                }
            });

            // Share in viewer
            document.getElementById('viewerShare').addEventListener('click', () => {
                shareComic(currentSlug, getComicTitle(currentSlug));
            });

            // Nav buttons
            prevBtn.addEventListener('click', () => { if (currentSlide > 0) goToSlide(currentSlide - 1); });
            nextBtn.addEventListener('click', () => { if (currentSlide < totalSlides - 1) goToSlide(currentSlide + 1); });

            // Close
            closeBtn.addEventListener('click', () => closeViewer());
            viewer.addEventListener('click', (e) => {
                if (wasDragging) { wasDragging = false; return; }
                if (e.target === viewer || e.target.classList.contains('comic-viewer-stage')) closeViewer();
            });

            // Keyboard
            document.addEventListener('keydown', (e) => {
                if (!viewer.classList.contains('active')) return;
                if (e.key === 'Escape') closeViewer();
                if (e.key === 'ArrowLeft' && currentSlide > 0) goToSlide(currentSlide - 1);
                if (e.key === 'ArrowRight' && currentSlide < totalSlides - 1) goToSlide(currentSlide + 1);
            });

            // ---- Drag support (touch + mouse) ----
            let isDragging = false;
            let dragStartX = 0;
            let dragDelta = 0;
            let dragStartTime = 0;

            function onDragStart(x) {
                isDragging = true;
                dragStartX = x;
                dragDelta = 0;
                dragStartTime = Date.now();
                track.classList.add('dragging');
            }

            function onDragMove(x) {
                if (!isDragging) return;
                dragDelta = x - dragStartX;
                track.style.transform = `translate(${trackOffset(currentSlide, dragDelta)}px, -50%)`;
            }

            function onDragEnd() {
                if (!isDragging) return;
                isDragging = false;
                wasDragging = Math.abs(dragDelta) > 5;
                track.classList.remove('dragging');

                const velocity = dragDelta / Math.max(Date.now() - dragStartTime, 1);
                const threshold = slideWidth * 0.2;
                let target = currentSlide;

                if (Math.abs(dragDelta) > threshold || Math.abs(velocity) > 0.3) {
                    if (dragDelta > 0 && currentSlide > 0) target--;
                    else if (dragDelta < 0 && currentSlide < totalSlides - 1) target++;
                }
                goToSlide(target);
            }

            // Touch events
            viewer.addEventListener('touchstart', (e) => {
                if (e.target.closest('.comic-viewer-nav, .comic-viewer-close, .comic-viewer-dot')) return;
                onDragStart(e.touches[0].clientX);
            }, { passive: true });
            viewer.addEventListener('touchmove', (e) => onDragMove(e.touches[0].clientX), { passive: true });
            viewer.addEventListener('touchend', () => onDragEnd(), { passive: true });

            // Mouse drag events
            viewer.addEventListener('mousedown', (e) => {
                if (e.target.closest('.comic-viewer-nav, .comic-viewer-close, .comic-viewer-dot')) return;
                e.preventDefault();
                onDragStart(e.clientX);
            });
            window.addEventListener('mousemove', (e) => { if (isDragging) { e.preventDefault(); onDragMove(e.clientX); } });
            window.addEventListener('mouseup', () => onDragEnd());

            // Reposition on resize without animation
            window.addEventListener('resize', () => {
                if (!viewer.classList.contains('active')) return;
                computeLayout();
                track.classList.add('dragging');
                track.style.transform = `translate(${trackOffset(currentSlide)}px, -50%)`;
                requestAnimationFrame(() => track.classList.remove('dragging'));
            });

            // Deep Linking & History
            window.addEventListener('popstate', () => {
                const url = new URL(window.location);
                const comic = url.searchParams.get('comic');
                if (comic) {
                    openViewer(comic, true);
                } else {
                    closeViewer(true);
                }
            });

            // Init from URL
            setTimeout(() => {
                const url = new URL(window.location);
                const comic = url.searchParams.get('comic');
                if (comic) {
                    openViewer(comic, true);
                }
            }, 50);
        })();

        /* ---- Scroll Reveal Observer ---- */
        (() => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });

            document.querySelectorAll('.scroll-reveal, .scroll-reveal-card').forEach(el => observer.observe(el));
            // Re-observe after grid renders
            setTimeout(() => {
                document.querySelectorAll('.scroll-reveal, .scroll-reveal-card').forEach(el => {
                    if (!el.classList.contains('visible')) observer.observe(el);
                });
            }, 100);
        })();

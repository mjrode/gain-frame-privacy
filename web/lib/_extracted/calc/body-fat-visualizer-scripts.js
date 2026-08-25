/* =====================================================
           BF VISUALIZER — dual-slider, preloading image stack
           ===================================================== */

        (function () {
            const AGE_STEPS = ['20s', '30s', '40s', '50s', '60s'];
            const VIEWS = ['front', 'back'];

            const GENDER_CONFIG = {
                male: {
                    steps: [8, 10, 12, 15, 18, 20, 25, 30],
                    legacySteps: [8, 13, 18, 23, 28, 33],
                    categories: {
                        8:  { name: 'Shredded',      sub: 'Essential · Stage Lean', key: 'shredded', desc: 'Stage-lean. Striated muscle, vascularity, and deep ab separation. Not sustainable long-term.' },
                        10: { name: 'Very Lean',     sub: 'Athletic · Defined',      key: 'shredded', desc: 'A clear six-pack at rest, a tight waist, and visible separation without full stage conditioning.' },
                        12: { name: 'Athletic',      sub: 'Lean · Sustainable',      key: 'athletic', desc: 'Visible abs and muscle separation with enough softness to remain realistic year-round for some lifters.' },
                        13: { name: 'Athletic',      sub: 'Healthy · Lean',         key: 'athletic', desc: 'Clean six-pack, visible separation, vascular forearms. The trained-lifter look.' },
                        15: { name: 'Fit',           sub: 'Healthy · Athletic',       key: 'fit',      desc: 'A flat waist, faint upper abs, and clear muscle shape without a sharply cut look.' },
                        18: { name: 'Fit',           sub: 'Sustainable · Toned',    key: 'fit',      desc: 'Lean and toned. Abs visible under good lighting, sustainable and healthy.' },
                        20: { name: 'Average',       sub: 'Healthy · Soft Edges',    key: 'average',  desc: 'No resting ab definition, a smooth waist, and muscle shape that remains visible underneath.' },
                        23: { name: 'Average',       sub: 'Typical Adult Male',     key: 'average',  desc: 'Typical range for most men. Soft midsection, no visible abs. Still within healthy range.' },
                        25: { name: 'Elevated',      sub: 'Above Average',           key: 'above',    desc: 'A rounded midsection, visible love handles, and softened definition through the chest and back.' },
                        28: { name: 'Above Average', sub: 'Elevated Risk',          key: 'above',    desc: 'Noticeable belly, love handles, and chest softness. Elevated metabolic risk begins here.' },
                        30: { name: 'High Range',    sub: 'Elevated Health Risk',    key: 'obese',    desc: 'Substantial abdominal and lower-back fat with little visible muscle separation.' },
                        33: { name: 'Obese Range',   sub: 'High Health Risk',       key: 'obese',    desc: 'Significant abdominal overhang and visceral fat. Serious health risk — time to act.' }
                    }
                },
                female: {
                    steps: [18, 20, 22, 25, 30, 35, 40],
                    legacySteps: [18, 22, 27, 32, 37, 42],
                    categories: {
                        18: { name: 'Athletic',      sub: 'Toned · Defined',          key: 'athletic', desc: 'Visible muscle tone, defined arms and legs. Typical of competitive athletes and dedicated trainers.' },
                        20: { name: 'Lean Fit',      sub: 'Athletic · Sustainable',   key: 'athletic', desc: 'A flat waist, light abdominal definition, and visibly toned arms, back, and legs.' },
                        22: { name: 'Fit',           sub: 'Sustainable · Healthy',    key: 'fit',      desc: 'Lean, toned, and curvy. A sustainable, healthy body fat level with clear definition.' },
                        25: { name: 'Healthy',       sub: 'Fit · Natural Curves',     key: 'fit',      desc: 'A soft flat waist, fuller hips and thighs, and toned muscle with naturally softened edges.' },
                        27: { name: 'Average',       sub: 'Typical Adult Female',     key: 'average',  desc: 'Typical range for most women. Soft curves, healthy body fat level for general wellness.' },
                        30: { name: 'Average',       sub: 'Typical Adult Female',     key: 'average',  desc: 'A softly rounded midsection with fuller hips and thighs and minimal resting definition.' },
                        32: { name: 'Above Average', sub: 'Class I Obesity',          key: 'above',    desc: 'Entering the obese range. Fat distribution broadens across hips, thighs, and midsection.' },
                        35: { name: 'Elevated',      sub: 'Higher Health Risk',       key: 'above',    desc: 'A broader waist and more pronounced fat through the midsection, lower back, hips, and thighs.' },
                        37: { name: 'Obese Range',   sub: 'Class II Obesity',         key: 'obese',    desc: 'Elevated health risk. Notable abdominal and lower-body fat accumulation.' },
                        40: { name: 'High Range',    sub: 'High Health Risk',         key: 'danger',   desc: 'Significant fat accumulation through the trunk and limbs with elevated chronic-disease risk.' },
                        42: { name: 'High Risk',     sub: 'Class III Obesity',        key: 'danger',   desc: 'Severe obesity. Significant chronic disease risk requiring medical guidance.' }
                    }
                }
            };

            const IMG_BASE = 'assets/physiques/';

            // DOM
            const root       = document.getElementById('bfv');
            const stack      = document.getElementById('bfvStack');
            const pod        = document.getElementById('bfvPod');
            const pctNum     = document.getElementById('bfvPctNum');
            const catName    = document.getElementById('bfvCatName');
            const catSub     = document.getElementById('bfvCatSub');
            const ageChipNum = document.getElementById('bfvAgeChipNum');
            const bfSlider   = document.getElementById('bfvBfSlider');
            const ageSlider  = document.getElementById('bfvAgeSlider');
            const bfValue    = document.getElementById('bfvBfValue');
            const ageValue   = document.getElementById('bfvAgeValue');
            const bfFill     = document.getElementById('bfvBfFill');
            const ageFill    = document.getElementById('bfvAgeFill');
            const bfTicksWrap = document.getElementById('bfvBfTicks');
            const ageTicks   = document.querySelectorAll('#bfvAgeTicks .bfv__tick-label');
            const refGrid    = document.getElementById('bfvRefGrid');
            const refHeading = document.getElementById('bfvRefHeading');
            const serialEl   = document.getElementById('bfvSerial');
            const shareBtn   = document.getElementById('bfvShare');
            const shareLabel = document.getElementById('bfvShareLabel');
            const genderBtns = document.querySelectorAll('.bfv__gender-btn');
            const viewBtns   = document.querySelectorAll('.bfv__view-btn');

            // State
            let gender = 'male';
            let view   = 'front';
            let bfIdx  = 3;   // default 15% male / 25% female
            let ageIdx = 1;   // default 30s

            // The new front/back atlas is standardized to the 30s. Other ages
            // retain the original front-view render bands.
            function hasPairedAtlas(aIdx = ageIdx) { return AGE_STEPS[aIdx] === '30s'; }
            function stepsFor(g, aIdx) {
                return hasPairedAtlas(aIdx) ? GENDER_CONFIG[g].steps : GENDER_CONFIG[g].legacySteps;
            }
            function steps()      { return stepsFor(gender, ageIdx); }
            function categories() { return GENDER_CONFIG[gender].categories; }

            function syncViewControls() {
                const paired = hasPairedAtlas();
                if (!paired) view = 'front';
                root.setAttribute('data-view', view);
                root.setAttribute('data-paired-atlas', String(paired));
                viewBtns.forEach((btn) => {
                    const on = btn.dataset.view === view;
                    const disabled = btn.dataset.view === 'back' && !paired;
                    btn.dataset.active = String(on);
                    btn.setAttribute('aria-checked', String(on));
                    btn.disabled = disabled;
                    btn.title = disabled ? 'Back views are available in the standardized 30s atlas' : '';
                });
            }

            // --- image pool cache (filename → HTMLImageElement) ---
            const pool = new Map();

            function imgBaseKey(g, aIdx, bf) {
                return g + '-age' + AGE_STEPS[aIdx] + '-bf' + bf;
            }

            function imgKey(g, aIdx, bf, imageView) {
                return imgBaseKey(g, aIdx, bf) + '-' + imageView;
            }

            function imgSrc(g, aIdx, bf, imageView) {
                return IMG_BASE + imgKey(g, aIdx, bf, imageView) + '.webp';
            }

            function legacyImgSrc(g, aIdx, bf) {
                return IMG_BASE + imgBaseKey(g, aIdx, bf) + '.webp';
            }

            function ensureImage(g, aIdx, bfIdxLocal, imageView) {
                const bf = stepsFor(g, aIdx)[bfIdxLocal];
                const paired = hasPairedAtlas(aIdx);
                const resolvedView = paired ? imageView : 'front';
                const key = paired ? imgKey(g, aIdx, bf, resolvedView) : imgBaseKey(g, aIdx, bf);
                if (pool.has(key)) return pool.get(key);
                const el = new Image();
                el.className = 'bfv__img';
                el.alt = (g === 'male' ? 'Male' : 'Female') + ' reference physique, ' + resolvedView + ' view, age ' + AGE_STEPS[aIdx] + ', ' + bf + '% body fat';
                el.decoding = 'async';
                el.loading = 'eager';
                if (paired) {
                    el.addEventListener('error', () => {
                        if (el.dataset.legacyFallback === 'true') return;
                        el.dataset.legacyFallback = 'true';
                        el.src = legacyImgSrc(g, aIdx, bf);
                    });
                    el.src = imgSrc(g, aIdx, bf, resolvedView);
                } else {
                    el.src = legacyImgSrc(g, aIdx, bf);
                }
                el.dataset.key = key;
                stack.appendChild(el);
                pool.set(key, el);
                return el;
            }

            function preloadNeighbors(g, aIdx, bIdx, imageView) {
                const cells = [
                    [aIdx, bIdx],
                    [aIdx, bIdx - 1], [aIdx, bIdx + 1]
                ];
                const stepsLen = stepsFor(g, aIdx).length;
                cells.forEach(([a, b]) => {
                    if (a >= 0 && a < AGE_STEPS.length && b >= 0 && b < stepsLen) {
                        ensureImage(g, a, b, imageView);
                    }
                });
            }

            // Render BF tick labels for current gender
            function renderBfTicks() {
                const s = steps();
                bfTicksWrap.innerHTML = s.map((v, i) =>
                    '<div class="bfv__tick">' +
                        '<span class="bfv__tick-mark"></span>' +
                        '<span class="bfv__tick-label" data-index="' + i + '">' + v + '</span>' +
                    '</div>'
                ).join('');
                // Rewire tick clicks
                bfTicksWrap.querySelectorAll('.bfv__tick-label').forEach((t) => {
                    t.addEventListener('click', () => {
                        const i = parseInt(t.dataset.index, 10);
                        bfSlider.value = i;
                        setActive(ageIdx, i);
                    });
                });
                // Slider max matches step count
                bfSlider.max = String(s.length - 1);
            }

            // Render reference card grid for current gender
            function renderRefGrid() {
                const s = steps();
                const cats = categories();
                refHeading.textContent = 'Every ' + (gender === 'male' ? 'Male' : 'Female') + ' Body Fat Percentage, Explained';

                refGrid.innerHTML = s.map((v) => {
                    const c = cats[v];
                    return '<button class="tool-ref-card" data-bf="' + v + '" data-key="' + c.key + '" type="button">' +
                            '<div class="tool-ref-pct">' + v + '<sup>%</sup></div>' +
                            '<div class="tool-ref-name">' + c.name + '</div>' +
                            '<p class="tool-ref-desc">' + c.desc + '</p>' +
                            '<div class="tool-ref-bar"></div>' +
                        '</button>';
                }).join('');

                // Rewire clicks
                refGrid.querySelectorAll('.tool-ref-card').forEach((card) => {
                    card.addEventListener('click', () => {
                        const bfVal = parseInt(card.dataset.bf, 10);
                        const i = steps().indexOf(bfVal);
                        if (i < 0) return;
                        bfSlider.value = i;
                        setActive(ageIdx, i);
                        document.getElementById('bfv').scrollIntoView({ behavior: 'smooth', block: 'start' });
                    });
                });
            }

            function setActive(aIdx, bIdx) {
                const s = steps();
                aIdx = Math.max(0, Math.min(AGE_STEPS.length - 1, aIdx));
                bIdx = Math.max(0, Math.min(s.length - 1, bIdx));

                const img = ensureImage(gender, aIdx, bIdx, view);
                preloadNeighbors(gender, aIdx, bIdx, view);
                bfSlider.value = bIdx;

                // Swap active image
                pool.forEach((el) => { el.dataset.active = 'false'; });
                img.dataset.active = 'true';

                // BF readout
                const bf = s[bIdx];
                pctNum.textContent = bf;
                bfValue.textContent = bf + '%';
                const cat = categories()[bf];
                catName.textContent = cat.name;
                catSub.textContent = cat.sub;
                root.setAttribute('data-category', cat.key);

                // Age readout
                const age = AGE_STEPS[aIdx];
                ageValue.textContent = age;
                ageChipNum.textContent = age.replace(/\D/g, '');

                // Fills
                bfFill.style.width = ((bIdx / (s.length - 1)) * 100).toFixed(2) + '%';
                ageFill.style.width = ((aIdx / (AGE_STEPS.length - 1)) * 100).toFixed(2) + '%';

                // Tick active
                bfTicksWrap.querySelectorAll('.bfv__tick-label').forEach((t, i) => t.dataset.active = String(i === bIdx));
                ageTicks.forEach((t, i) => t.dataset.active = String(i === aIdx));

                // Ref card active
                refGrid.querySelectorAll('.tool-ref-card').forEach((card) => {
                    card.dataset.active = String(parseInt(card.dataset.bf, 10) === bf);
                });

                // Serial
                const serial = String((aIdx + 1) * 100 + (bIdx + 1) * 7 + (gender === 'male' ? 3491 : 7382)).padStart(4, '0');
                serialEl.textContent = serial;

                // Persist in URL
                if (history.replaceState) {
                    const hash = '#g=' + gender + '&bf=' + bf + '&age=' + age + '&view=' + view;
                    history.replaceState(null, '', window.location.pathname + hash);
                }

                bfIdx = bIdx;
                ageIdx = aIdx;
                syncViewControls();
            }

            function setGender(g) {
                if (g === gender) return;
                if (!GENDER_CONFIG[g]) return;

                // Map current BF to nearest equivalent on new scale (proportional)
                const prevSteps = steps();
                const prevBf    = prevSteps[bfIdx];
                const newSteps  = stepsFor(g, ageIdx);
                const ratio     = bfIdx / (prevSteps.length - 1);
                const newBfIdx  = Math.round(ratio * (newSteps.length - 1));

                gender = g;
                root.setAttribute('data-gender', g);

                // Update toggle buttons
                genderBtns.forEach((btn) => {
                    const on = btn.dataset.gender === g;
                    btn.dataset.active = String(on);
                    btn.setAttribute('aria-checked', String(on));
                });

                // Clear image stack — new gender means new image keys
                pool.forEach((el) => { el.remove(); });
                pool.clear();

                // Re-render ticks and reference grid
                renderBfTicks();
                renderRefGrid();

                // Apply new index
                bfSlider.value = newBfIdx;
                setActive(ageIdx, newBfIdx);
            }

            function setView(nextView) {
                if (!VIEWS.includes(nextView) || nextView === view || (nextView === 'back' && !hasPairedAtlas())) return;
                view = nextView;
                syncViewControls();
                setActive(ageIdx, bfIdx);
            }

            function setAge(nextAgeIdx) {
                nextAgeIdx = Math.max(0, Math.min(AGE_STEPS.length - 1, nextAgeIdx));
                const currentBf = steps()[bfIdx];
                ageIdx = nextAgeIdx;
                if (!hasPairedAtlas()) view = 'front';
                const nextSteps = steps();
                let nextBfIdx = 0;
                for (let i = 1; i < nextSteps.length; i++) {
                    if (Math.abs(nextSteps[i] - currentBf) < Math.abs(nextSteps[nextBfIdx] - currentBf)) nextBfIdx = i;
                }
                renderBfTicks();
                renderRefGrid();
                syncViewControls();
                bfSlider.value = nextBfIdx;
                setActive(ageIdx, nextBfIdx);
            }

            // --- Event wiring ---

            bfSlider.addEventListener('input', (e) => {
                setActive(ageIdx, parseInt(e.target.value, 10));
            });

            ageSlider.addEventListener('input', (e) => {
                setAge(parseInt(e.target.value, 10));
            });

            ageTicks.forEach((t) => {
                t.addEventListener('click', () => {
                    const i = parseInt(t.dataset.index, 10);
                    ageSlider.value = i;
                    setAge(i);
                });
            });

            genderBtns.forEach((btn) => {
                btn.addEventListener('click', () => setGender(btn.dataset.gender));
            });

            viewBtns.forEach((btn) => {
                btn.addEventListener('click', () => setView(btn.dataset.view));
            });

            // Share button — copies deep link
            shareBtn.addEventListener('click', async () => {
                const s = steps();
                const url = window.location.origin + window.location.pathname +
                    '#g=' + gender + '&bf=' + s[bfIdx] + '&age=' + AGE_STEPS[ageIdx] + '&view=' + view;
                try {
                    if (navigator.share) {
                        await navigator.share({ title: 'Body Fat % at Each Age', text: s[bfIdx] + '% body fat · ' + AGE_STEPS[ageIdx] + ' · ' + gender + ' · ' + view + ' view', url });
                    } else {
                        await navigator.clipboard.writeText(url);
                        shareLabel.textContent = 'Copied';
                        setTimeout(() => { shareLabel.textContent = 'Share'; }, 1400);
                    }
                } catch (e) {
                    // user dismissed — no-op
                }
            });

            // Parse deep-link params on load. Accepts both query string
            // (?g=male&bf=18&age=30s — used by internal links from the
            // estimator tool; ?sex= is an alias for ?g=) and hash
            // (#g=…&bf=…&age=… — used by the Share button). Hash wins when
            // both are present. bf snaps to the nearest step so estimator
            // values like 17 or 20 land on a real render.
            function parseHash() {
                const query = window.location.search.replace(/^\?/, '');
                const hash  = window.location.hash.replace(/^#/, '');
                const raw = [query, hash].filter(Boolean).join('&');
                if (!raw) return;
                const parts = Object.fromEntries(raw.split('&').map(kv => kv.split('=').map(decodeURIComponent)));
                if (!parts.g && parts.sex) parts.g = parts.sex;
                if (parts.g && GENDER_CONFIG[parts.g]) {
                    gender = parts.g;
                    root.setAttribute('data-gender', gender);
                    genderBtns.forEach((btn) => {
                        const on = btn.dataset.gender === gender;
                        btn.dataset.active = String(on);
                        btn.setAttribute('aria-checked', String(on));
                    });
                }
                if (parts.age && AGE_STEPS.includes(parts.age)) {
                    ageIdx = AGE_STEPS.indexOf(parts.age);
                }
                const bfParam = parseInt(parts.bf, 10);
                if (!isNaN(bfParam)) {
                    const s = steps();
                    let nearest = 0;
                    for (let i = 1; i < s.length; i++) {
                        if (Math.abs(s[i] - bfParam) < Math.abs(s[nearest] - bfParam)) nearest = i;
                    }
                    bfIdx = nearest;
                }
                if (parts.view && VIEWS.includes(parts.view) && (parts.view !== 'back' || hasPairedAtlas())) {
                    view = parts.view;
                }
                syncViewControls();
                bfSlider.value = bfIdx;
                ageSlider.value = ageIdx;
            }

            // Keyboard
            root.addEventListener('keydown', (e) => {
                if (!['ArrowUp', 'ArrowDown'].includes(e.key)) return;
                if (e.target.classList.contains('bfv__slider')) return;
                e.preventDefault();
                if (e.key === 'ArrowUp')   setAge(Math.min(AGE_STEPS.length - 1, ageIdx + 1));
                if (e.key === 'ArrowDown') setAge(Math.max(0, ageIdx - 1));
            });

            // --- Boot ---
            parseHash();
            renderBfTicks();
            renderRefGrid();
            setActive(ageIdx, bfIdx);

            // Reveal animation when widget enters view
            const io = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        root.setAttribute('data-revealed', 'true');
                        io.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.15 });
            io.observe(root);
        })();

        /* Scroll animations (shared pattern) */
        (function () {
            const selectors = ['.scroll-reveal', '.hero-text-stagger'];
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('visible');
                            observer.unobserve(entry.target);
                        }
                    });
                },
                { threshold: 0.05 }
            );
            document.querySelectorAll(selectors.join(',')).forEach((el) => observer.observe(el));
        })();

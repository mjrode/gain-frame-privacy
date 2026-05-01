/* =====================================================
           BF VISUALIZER — dual-slider, preloading image stack
           ===================================================== */

        (function () {
            const AGE_STEPS = ['20s', '30s', '40s', '50s', '60s'];

            const GENDER_CONFIG = {
                male: {
                    steps: [8, 13, 18, 23, 28, 33],
                    categories: {
                        8:  { name: 'Shredded',      sub: 'Essential · Stage Lean', key: 'shredded', desc: 'Stage-lean. Striated muscle, vascularity, and deep ab separation. Not sustainable long-term.' },
                        13: { name: 'Athletic',      sub: 'Healthy · Lean',         key: 'athletic', desc: 'Clean six-pack, visible separation, vascular forearms. The trained-lifter look.' },
                        18: { name: 'Fit',           sub: 'Sustainable · Toned',    key: 'fit',      desc: 'Lean and toned. Abs visible under good lighting, sustainable and healthy.' },
                        23: { name: 'Average',       sub: 'Typical Adult Male',     key: 'average',  desc: 'Typical range for most men. Soft midsection, no visible abs. Still within healthy range.' },
                        28: { name: 'Above Average', sub: 'Elevated Risk',          key: 'above',    desc: 'Noticeable belly, love handles, and chest softness. Elevated metabolic risk begins here.' },
                        33: { name: 'Obese Range',   sub: 'High Health Risk',       key: 'obese',    desc: 'Significant abdominal overhang and visceral fat. Serious health risk — time to act.' }
                    }
                },
                female: {
                    steps: [18, 22, 27, 32, 37, 42],
                    categories: {
                        18: { name: 'Athletic',      sub: 'Toned · Defined',          key: 'athletic', desc: 'Visible muscle tone, defined arms and legs. Typical of competitive athletes and dedicated trainers.' },
                        22: { name: 'Fit',           sub: 'Sustainable · Healthy',    key: 'fit',      desc: 'Lean, toned, and curvy. A sustainable, healthy body fat level with clear definition.' },
                        27: { name: 'Average',       sub: 'Typical Adult Female',     key: 'average',  desc: 'Typical range for most women. Soft curves, healthy body fat level for general wellness.' },
                        32: { name: 'Above Average', sub: 'Class I Obesity',          key: 'above',    desc: 'Entering the obese range. Fat distribution broadens across hips, thighs, and midsection.' },
                        37: { name: 'Obese Range',   sub: 'Class II Obesity',         key: 'obese',    desc: 'Elevated health risk. Notable abdominal and lower-body fat accumulation.' },
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

            // State
            let gender = 'male';
            let bfIdx  = 1;   // default 13% male / 22% female
            let ageIdx = 1;   // default 30s

            // Current steps/categories derived from gender
            function steps()      { return GENDER_CONFIG[gender].steps; }
            function categories() { return GENDER_CONFIG[gender].categories; }

            // --- image pool cache (filename → HTMLImageElement) ---
            const pool = new Map();

            function imgKey(g, aIdx, bf) {
                return g + '-age' + AGE_STEPS[aIdx] + '-bf' + bf;
            }

            function imgSrc(g, aIdx, bf) {
                return IMG_BASE + imgKey(g, aIdx, bf) + '.webp';
            }

            function ensureImage(g, aIdx, bfIdxLocal) {
                const bf = GENDER_CONFIG[g].steps[bfIdxLocal];
                const key = imgKey(g, aIdx, bf);
                if (pool.has(key)) return pool.get(key);
                const el = new Image();
                el.className = 'bfv__img';
                el.alt = (g === 'male' ? 'Male' : 'Female') + ' reference physique, age ' + AGE_STEPS[aIdx] + ', ' + bf + '% body fat';
                el.decoding = 'async';
                el.loading = 'eager';
                el.src = imgSrc(g, aIdx, bf);
                el.dataset.key = key;
                stack.appendChild(el);
                pool.set(key, el);
                return el;
            }

            function preloadNeighbors(g, aIdx, bIdx) {
                const cells = [
                    [aIdx, bIdx],
                    [aIdx - 1, bIdx], [aIdx + 1, bIdx],
                    [aIdx, bIdx - 1], [aIdx, bIdx + 1]
                ];
                const stepsLen = GENDER_CONFIG[g].steps.length;
                cells.forEach(([a, b]) => {
                    if (a >= 0 && a < AGE_STEPS.length && b >= 0 && b < stepsLen) {
                        ensureImage(g, a, b);
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
                const total = gender === 'male' ? 'Male Body Fat %' : 'Female Body Fat %';
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

                const img = ensureImage(gender, aIdx, bIdx);
                preloadNeighbors(gender, aIdx, bIdx);

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
                    const hash = '#g=' + gender + '&bf=' + bf + '&age=' + age;
                    history.replaceState(null, '', window.location.pathname + hash);
                }

                bfIdx = bIdx;
                ageIdx = aIdx;
            }

            function setGender(g) {
                if (g === gender) return;
                if (!GENDER_CONFIG[g]) return;

                // Map current BF to nearest equivalent on new scale (proportional)
                const prevSteps = GENDER_CONFIG[gender].steps;
                const prevBf    = prevSteps[bfIdx];
                const newSteps  = GENDER_CONFIG[g].steps;
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

            // --- Event wiring ---

            bfSlider.addEventListener('input', (e) => {
                setActive(ageIdx, parseInt(e.target.value, 10));
            });

            ageSlider.addEventListener('input', (e) => {
                setActive(parseInt(e.target.value, 10), bfIdx);
            });

            ageTicks.forEach((t) => {
                t.addEventListener('click', () => {
                    const i = parseInt(t.dataset.index, 10);
                    ageSlider.value = i;
                    setActive(i, bfIdx);
                });
            });

            genderBtns.forEach((btn) => {
                btn.addEventListener('click', () => setGender(btn.dataset.gender));
            });

            // Share button — copies deep link
            shareBtn.addEventListener('click', async () => {
                const s = steps();
                const url = window.location.origin + window.location.pathname +
                    '#g=' + gender + '&bf=' + s[bfIdx] + '&age=' + AGE_STEPS[ageIdx];
                try {
                    if (navigator.share) {
                        await navigator.share({ title: 'Body Fat % at Each Age', text: s[bfIdx] + '% body fat · ' + AGE_STEPS[ageIdx] + ' · ' + gender, url });
                    } else {
                        await navigator.clipboard.writeText(url);
                        shareLabel.textContent = 'Copied';
                        setTimeout(() => { shareLabel.textContent = 'Share'; }, 1400);
                    }
                } catch (e) {
                    // user dismissed — no-op
                }
            });

            // Parse hash on load
            function parseHash() {
                const raw = window.location.hash.replace(/^#/, '');
                if (!raw) return;
                const parts = Object.fromEntries(raw.split('&').map(kv => kv.split('=').map(decodeURIComponent)));
                if (parts.g && GENDER_CONFIG[parts.g]) {
                    gender = parts.g;
                    root.setAttribute('data-gender', gender);
                    genderBtns.forEach((btn) => {
                        const on = btn.dataset.gender === gender;
                        btn.dataset.active = String(on);
                        btn.setAttribute('aria-checked', String(on));
                    });
                }
                const bfParam = parseInt(parts.bf, 10);
                if (!isNaN(bfParam) && steps().includes(bfParam)) {
                    bfIdx = steps().indexOf(bfParam);
                }
                if (parts.age && AGE_STEPS.includes(parts.age)) {
                    ageIdx = AGE_STEPS.indexOf(parts.age);
                }
                bfSlider.value = bfIdx;
                ageSlider.value = ageIdx;
            }

            // Keyboard
            root.addEventListener('keydown', (e) => {
                if (!['ArrowUp', 'ArrowDown'].includes(e.key)) return;
                if (e.target.classList.contains('bfv__slider')) return;
                e.preventDefault();
                if (e.key === 'ArrowUp')   setActive(Math.min(AGE_STEPS.length - 1, ageIdx + 1), bfIdx);
                if (e.key === 'ArrowDown') setActive(Math.max(0, ageIdx - 1), bfIdx);
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
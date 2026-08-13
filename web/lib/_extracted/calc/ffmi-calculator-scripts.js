/* =====================================================
           FFMI CALCULATOR
           Normalized FFMI (Kouri et al., 1995)
           ===================================================== */

        (function () {
            // State
            let gender = 'male';
            let heightUnit = 'imperial';
            let weightUnit = 'imperial';

            // DOM refs
            const genderBtns = document.querySelectorAll('.tool-gender-btn');
            const calcBtn = document.getElementById('calcBtn');
            const resultCard = document.getElementById('resultCard');
            const errorMsg = document.getElementById('errorMsg');
            const refGridMale = document.getElementById('refGridMale');
            const refGridFemale = document.getElementById('refGridFemale');

            // Unit toggles
            document.querySelectorAll('.tool-unit-toggle').forEach(toggle => {
                toggle.querySelectorAll('.tool-unit-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        toggle.querySelectorAll('.tool-unit-btn').forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');

                        const group = toggle.dataset.unitGroup;
                        const unit = btn.dataset.unit;

                        if (group === 'height') {
                            heightUnit = unit;
                            document.getElementById('heightImperial').style.display = unit === 'imperial' ? 'flex' : 'none';
                            document.getElementById('heightMetric').style.display = unit === 'metric' ? 'flex' : 'none';
                        }
                        if (group === 'weight') {
                            weightUnit = unit;
                        }
                    });
                });
            });

            // Gender toggle
            genderBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    genderBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    gender = btn.dataset.gender;
                    refGridMale.style.display = gender === 'male' ? 'grid' : 'none';
                    refGridFemale.style.display = gender === 'female' ? 'grid' : 'none';
                    // Update natural-limit marker position based on gender
                    updateMarker();
                    // Re-run if result already showing
                    if (resultCard.classList.contains('show')) calculate();
                });
            });

            // Calculate triggers
            calcBtn.addEventListener('click', calculate);
            document.querySelectorAll('.tool-input-field').forEach(input => {
                input.addEventListener('keydown', e => {
                    if (e.key === 'Enter') calculate();
                });
            });

            function showError(msg) {
                errorMsg.textContent = msg;
                errorMsg.classList.add('show');
                resultCard.classList.remove('show');
            }

            function clearError() {
                errorMsg.classList.remove('show');
            }

            function getHeightMeters() {
                if (heightUnit === 'imperial') {
                    const ft = parseFloat(document.getElementById('heightFt').value);
                    const inVal = parseFloat(document.getElementById('heightIn').value) || 0;
                    if (isNaN(ft)) return NaN;
                    return ((ft * 12) + inVal) * 0.0254;
                } else {
                    const cm = parseFloat(document.getElementById('heightCm').value);
                    if (isNaN(cm)) return NaN;
                    return cm / 100;
                }
            }

            function getWeightKg() {
                const w = parseFloat(document.getElementById('weight').value);
                if (isNaN(w)) return NaN;
                return weightUnit === 'imperial' ? w * 0.453592 : w;
            }

            /* Gauge domain: 15 → 30 maps to 0% → 100%. Natural limit marker at 25. */
            const GAUGE_MIN = 15;
            const GAUGE_MAX = 30;
            function toGaugePercent(ffmi) {
                return Math.max(0, Math.min(100, ((ffmi - GAUGE_MIN) / (GAUGE_MAX - GAUGE_MIN)) * 100));
            }

            function updateMarker() {
                const limit = gender === 'male' ? 25 : 22;
                const label = gender === 'male' ? 'Natural ~25' : 'Natural ~22';
                const marker = document.getElementById('limitMarker');
                marker.style.left = toGaugePercent(limit) + '%';
                marker.setAttribute('data-label', label);
            }

            function calculate() {
                clearError();

                const heightM = getHeightMeters();
                const weightKg = getWeightKg();
                const bf = parseFloat(document.getElementById('bodyFat').value);

                if (isNaN(heightM) || heightM < 1.2 || heightM > 2.3) {
                    showError('Please enter a valid height.');
                    return;
                }
                if (isNaN(weightKg) || weightKg < 30 || weightKg > 300) {
                    showError('Please enter a valid weight.');
                    return;
                }
                if (isNaN(bf) || bf < 2 || bf > 60) {
                    showError('Please enter a body fat % between 2 and 60.');
                    return;
                }

                // Compute
                const leanMassKg = weightKg * (1 - bf / 100);
                const fatMassKg = weightKg - leanMassKg;
                const rawFfmi = leanMassKg / (heightM * heightM);
                const normalizedFfmi = rawFfmi + 6.1 * (1.8 - heightM);

                // Display
                document.getElementById('resultFfmi').textContent = normalizedFfmi.toFixed(1);
                document.getElementById('statRawFfmi').textContent = rawFfmi.toFixed(1);

                if (weightUnit === 'imperial') {
                    document.getElementById('statLeanMass').textContent = (leanMassKg / 0.453592).toFixed(1) + ' lb';
                    document.getElementById('statFatMass').textContent = (fatMassKg / 0.453592).toFixed(1) + ' lb';
                } else {
                    document.getElementById('statLeanMass').textContent = leanMassKg.toFixed(1) + ' kg';
                    document.getElementById('statFatMass').textContent = fatMassKg.toFixed(1) + ' kg';
                }

                // Category
                const cat = getCategory(normalizedFfmi, gender);
                const catEl = document.getElementById('resultCat');
                catEl.textContent = cat.label;
                catEl.className = 'tool-result-category ' + cat.cls;

                // Gauge fill
                document.getElementById('resultGauge').style.width = toGaugePercent(normalizedFfmi) + '%';
                updateMarker();

                document.getElementById('resultDetail').textContent = cat.detail;

                resultCard.classList.add('show');
                window.dispatchEvent(new CustomEvent('gainframe:web-tool-completed'));
                resultCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

            function getCategory(ffmi, g) {
                if (g === 'male') {
                    if (ffmi < 18)    return { label: 'Below Average',       cls: 'cat-below',    detail: "You're below the typical male range. A structured lifting program and adequate protein will drive steady increases in lean mass." };
                    if (ffmi < 20)    return { label: 'Average',             cls: 'cat-average',  detail: "You're in the typical range for untrained or lightly active men. Most people can realistically add 3–5 FFMI points with consistent lifting." };
                    if (ffmi < 22)    return { label: 'Above Average',       cls: 'cat-above',    detail: "Above-average muscularity. You're visibly in shape — this is where a year or two of consistent lifting gets most people." };
                    if (ffmi < 23)    return { label: 'Athletic',            cls: 'cat-athletic', detail: "Clearly muscular, lifting-focused. You've built real mass. Progress from here gets slower — structured programming and recovery matter more." };
                    if (ffmi < 24)    return { label: 'Very Muscular',       cls: 'cat-elite',    detail: "Uncommon in the general lifting population. Years of dedicated training, consistent nutrition, and favorable genetics." };
                    if (ffmi < 25)    return { label: 'Near Natural Limit',  cls: 'cat-limit',    detail: "You're at the upper edge of what drug-free lifters typically reach. Further gains get measurably harder and slower." };
                    return              { label: 'Beyond Natural Limit',    cls: 'cat-beyond',   detail: "You're above the ~25 FFMI threshold Kouri 1995 identified as extremely rare in drug-free lifters. Possible with exceptional genetics and a decade-plus of work — but statistically uncommon." };
                } else {
                    if (ffmi < 15)    return { label: 'Below Average',       cls: 'cat-below',    detail: "You're below the typical female range. Consistent resistance training will move this up quickly — novice lifters often see the fastest changes." };
                    if (ffmi < 17)    return { label: 'Average',             cls: 'cat-average',  detail: "Typical range for untrained or lightly active women. There's significant room to build lean mass naturally." };
                    if (ffmi < 19)    return { label: 'Above Average',       cls: 'cat-above',    detail: "Visibly fit and toned. A solid few years of lifting gets most women to this level." };
                    if (ffmi < 20)    return { label: 'Athletic',            cls: 'cat-athletic', detail: "Clearly muscular. Serious training volume, good programming, and time under the bar." };
                    if (ffmi < 22)    return { label: 'Near Natural Limit',  cls: 'cat-limit',    detail: "The upper edge of female drug-free muscularity. Years of consistent work and favorable genetics." };
                    return              { label: 'Beyond Natural Limit',    cls: 'cat-beyond',   detail: "Rare in drug-free female lifters based on available data. Possible but statistically uncommon." };
                }
            }

            // Initial marker placement
            updateMarker();
        })();

        /* Scroll animations */
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
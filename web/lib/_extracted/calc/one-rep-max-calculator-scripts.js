/* =====================================================
           1RM CALCULATOR
           Six validated formulas + ExRx-style strength standards
           ===================================================== */

        (function () {
            // State
            let exercise = 'squat';
            let gender = 'male';
            let weightUnit = 'imperial';

            const EXERCISE_LABELS = {
                squat:    'Back Squat',
                bench:    'Bench Press',
                deadlift: 'Deadlift',
                ohp:      'Overhead Press'
            };

            // Strength standards: bodyweight multipliers for each tier
            // Based on widely-cited ExRx / Symmetric Strength approximations
            const STANDARDS = {
                male: {
                    squat:    { untrained: 0.75, novice: 1.25, intermediate: 1.75, advanced: 2.25, elite: 2.75 },
                    bench:    { untrained: 0.50, novice: 0.75, intermediate: 1.25, advanced: 1.75, elite: 2.00 },
                    deadlift: { untrained: 1.00, novice: 1.50, intermediate: 2.00, advanced: 2.50, elite: 3.00 },
                    ohp:      { untrained: 0.35, novice: 0.55, intermediate: 0.75, advanced: 1.00, elite: 1.25 }
                },
                female: {
                    squat:    { untrained: 0.50, novice: 0.75, intermediate: 1.25, advanced: 1.50, elite: 2.00 },
                    bench:    { untrained: 0.25, novice: 0.50, intermediate: 0.75, advanced: 1.00, elite: 1.25 },
                    deadlift: { untrained: 0.50, novice: 1.00, intermediate: 1.50, advanced: 1.75, elite: 2.25 },
                    ohp:      { untrained: 0.20, novice: 0.35, intermediate: 0.50, advanced: 0.65, elite: 0.85 }
                }
            };

            const TIER_ORDER = ['untrained', 'novice', 'intermediate', 'advanced', 'elite'];
            const TIER_LABEL = {
                untrained:    'Untrained',
                novice:       'Novice',
                intermediate: 'Intermediate',
                advanced:     'Advanced',
                elite:        'Elite'
            };

            // Formulas return 1RM given weight w and reps r
            const FORMULAS = [
                { name: 'Epley',    fn: (w, r) => w * (1 + r / 30) },
                { name: 'Brzycki',  fn: (w, r) => w * 36 / (37 - r) },
                { name: 'Lombardi', fn: (w, r) => w * Math.pow(r, 0.10) },
                { name: "O'Conner", fn: (w, r) => w * (1 + 0.025 * r) },
                { name: 'Mayhew',   fn: (w, r) => (100 * w) / (52.2 + 41.9 * Math.exp(-0.055 * r)) },
                { name: 'Wathan',   fn: (w, r) => (100 * w) / (48.8 + 53.8 * Math.exp(-0.075 * r)) }
            ];

            // Training % rows: target reps, %1RM, zone
            const REP_TABLE = [
                { reps: 1,  pct: 100, zone: 'strength', label: 'Strength' },
                { reps: 2,  pct: 95,  zone: 'strength', label: 'Strength' },
                { reps: 4,  pct: 90,  zone: 'strength', label: 'Strength' },
                { reps: 6,  pct: 85,  zone: 'hyper',    label: 'Hypertrophy' },
                { reps: 8,  pct: 80,  zone: 'hyper',    label: 'Hypertrophy' },
                { reps: 10, pct: 75,  zone: 'hyper',    label: 'Hypertrophy' },
                { reps: 12, pct: 70,  zone: 'endur',    label: 'Endurance' }
            ];

            // DOM
            const exerciseBtns = document.querySelectorAll('.tool-exercise-btn');
            const genderBtns = document.querySelectorAll('.tool-gender-btn');
            const calcBtn = document.getElementById('calcBtn');
            const resultCard = document.getElementById('resultCard');
            const errorMsg = document.getElementById('errorMsg');
            const standardsExerciseSel = document.getElementById('standardsExercise');
            const standardsSexSel = document.getElementById('standardsSex');

            // Unit toggle
            document.querySelectorAll('.tool-unit-toggle').forEach(toggle => {
                toggle.querySelectorAll('.tool-unit-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        toggle.querySelectorAll('.tool-unit-btn').forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                        weightUnit = btn.dataset.unit;
                    });
                });
            });

            // Exercise
            exerciseBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    exerciseBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    exercise = btn.dataset.exercise;
                    standardsExerciseSel.value = exercise;
                    renderStandardsGrid();
                    if (resultCard.classList.contains('show')) calculate();
                });
            });

            // Gender
            genderBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    genderBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    gender = btn.dataset.gender;
                    standardsSexSel.value = gender;
                    renderStandardsGrid();
                    if (resultCard.classList.contains('show')) calculate();
                });
            });

            // Standards filter selects
            standardsExerciseSel.addEventListener('change', () => {
                renderStandardsGrid(standardsExerciseSel.value, standardsSexSel.value);
            });
            standardsSexSel.addEventListener('change', () => {
                renderStandardsGrid(standardsExerciseSel.value, standardsSexSel.value);
            });

            // Calculate
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

            function formatWeight(val) {
                // Round to nearest 0.5 for display
                return (Math.round(val * 2) / 2).toFixed(1).replace(/\.0$/, '');
            }

            function classifyTier(oneRm, bodyweight, exerciseKey, sex) {
                const thresholds = STANDARDS[sex][exerciseKey];
                const ratio = oneRm / bodyweight;

                // Tier: find highest threshold user exceeds
                let tier = null;
                for (let i = TIER_ORDER.length - 1; i >= 0; i--) {
                    if (ratio >= thresholds[TIER_ORDER[i]]) {
                        tier = TIER_ORDER[i];
                        break;
                    }
                }

                // If below even untrained threshold, still call it "untrained"
                if (!tier) tier = 'untrained';

                // Gauge position: map ratio to 0–100% across the elite threshold × 1.1
                const maxAnchor = thresholds.elite * 1.1;
                const gaugePct = Math.max(0, Math.min(100, (ratio / maxAnchor) * 100));

                return { tier, ratio, gaugePct, thresholds };
            }

            function calculate() {
                clearError();

                const weight = parseFloat(document.getElementById('weight').value);
                const reps = parseInt(document.getElementById('reps').value, 10);
                const bodyweightInput = parseFloat(document.getElementById('bodyweight').value);

                if (isNaN(weight) || weight <= 0) {
                    showError('Enter the weight you lifted.');
                    return;
                }
                if (isNaN(reps) || reps < 1 || reps > 12) {
                    showError('Enter reps between 1 and 12.');
                    return;
                }

                // Compute each formula
                const results = FORMULAS.map(f => ({
                    name: f.name,
                    value: f.fn(weight, reps)
                }));

                // Average
                const avg = results.reduce((sum, r) => sum + r.value, 0) / results.length;

                // Display headline
                document.getElementById('resultExercise').textContent = `${EXERCISE_LABELS[exercise]} · Estimated 1RM`;
                document.getElementById('resultMax').textContent = formatWeight(avg);
                document.getElementById('resultUnit').textContent = weightUnit === 'imperial' ? 'lb' : 'kg';

                // Formula grid — mark formula closest to average as "best"
                const bestIdx = results
                    .map((r, i) => ({ i, diff: Math.abs(r.value - avg) }))
                    .sort((a, b) => a.diff - b.diff)[0].i;

                const grid = document.getElementById('formulaGrid');
                grid.innerHTML = results.map((r, i) => `
                    <div class="formula-cell${i === bestIdx ? ' best' : ''}">
                        <div class="formula-cell-name">${r.name}</div>
                        <div>
                            <span class="formula-cell-value">${formatWeight(r.value)}</span><span class="formula-cell-unit">${weightUnit === 'imperial' ? 'lb' : 'kg'}</span>
                        </div>
                        ${i === bestIdx ? '<span class="formula-cell-badge">nearest avg</span>' : ''}
                    </div>
                `).join('');

                // Training % table
                const unitLabel = weightUnit === 'imperial' ? 'lb' : 'kg';
                const tbody = document.getElementById('repTableBody');
                tbody.innerHTML = REP_TABLE.map(row => `
                    <tr>
                        <td>${row.reps} reps <span class="zone-tag zone-${row.zone}">${row.label}</span></td>
                        <td>${formatWeight(avg * row.pct / 100)} ${unitLabel}</td>
                        <td>${row.pct}%</td>
                    </tr>
                `).join('');

                // Strength tier (if bodyweight provided)
                const catEl = document.getElementById('resultCat');
                const gaugeEl = document.getElementById('resultGauge');
                const hintEl = document.getElementById('standardsHint');

                if (!isNaN(bodyweightInput) && bodyweightInput > 0) {
                    const { tier, ratio, gaugePct } = classifyTier(avg, bodyweightInput, exercise, gender);

                    catEl.textContent = `${TIER_LABEL[tier]} · ${ratio.toFixed(2)}× BW`;
                    catEl.className = 'tool-result-category cat-' + tier;
                    catEl.style.display = 'inline-block';

                    gaugeEl.style.width = gaugePct + '%';
                    hintEl.style.display = 'none';
                } else {
                    catEl.style.display = 'none';
                    gaugeEl.style.width = '0%';
                    hintEl.style.display = 'inline-block';
                }

                resultCard.classList.add('show');
                window.dispatchEvent(new CustomEvent('gainframe:web-tool-completed'));
                resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }

            /* Standards reference grid */
            function renderStandardsGrid(exKey = exercise, sexKey = gender) {
                standardsExerciseSel.value = exKey;
                standardsSexSel.value = sexKey;
                const t = STANDARDS[sexKey][exKey];
                const grid = document.getElementById('standardsGrid');
                grid.innerHTML = TIER_ORDER.map(tier => `
                    <div class="tool-ref-card">
                        <div class="tool-ref-dot dot-${tier}"></div>
                        <h4>${TIER_LABEL[tier]}</h4>
                        <div class="tool-ref-range">${t[tier].toFixed(2)}×</div>
                        <div class="tool-ref-range-unit">bodyweight</div>
                    </div>
                `).join('');
            }

            renderStandardsGrid();
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
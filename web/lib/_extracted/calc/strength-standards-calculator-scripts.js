/* =====================================================
           STRENGTH STANDARDS CALCULATOR
           ===================================================== */
        (function () {
            const LB_PER_KG = 2.20462;

            // Exercise definitions
            const EXERCISES = [
                { key: 'squat',        label: 'Back Squat' },
                { key: 'bench',        label: 'Bench Press' },
                { key: 'deadlift',     label: 'Deadlift' },
                { key: 'ohp',          label: 'Overhead Press' },
                { key: 'front_squat',  label: 'Front Squat' },
                { key: 'row',          label: 'Barbell Row' },
                { key: 'incline',      label: 'Incline Bench' },
                { key: 'hip_thrust',   label: 'Hip Thrust' },
            ];

            // BW multipliers per tier per lift per sex
            const STANDARDS = {
                male: {
                    squat:        { untrained: 0.75, novice: 1.25, intermediate: 1.75, advanced: 2.25, elite: 2.75 },
                    bench:        { untrained: 0.50, novice: 0.75, intermediate: 1.25, advanced: 1.75, elite: 2.00 },
                    deadlift:     { untrained: 1.00, novice: 1.50, intermediate: 2.00, advanced: 2.50, elite: 3.00 },
                    ohp:          { untrained: 0.35, novice: 0.55, intermediate: 0.75, advanced: 1.00, elite: 1.25 },
                    front_squat:  { untrained: 0.55, novice: 1.00, intermediate: 1.50, advanced: 1.90, elite: 2.30 },
                    row:          { untrained: 0.50, novice: 0.80, intermediate: 1.15, advanced: 1.50, elite: 1.85 },
                    incline:      { untrained: 0.40, novice: 0.65, intermediate: 1.05, advanced: 1.40, elite: 1.70 },
                    hip_thrust:   { untrained: 1.00, novice: 1.50, intermediate: 2.00, advanced: 2.50, elite: 3.25 },
                },
                female: {
                    squat:        { untrained: 0.50, novice: 0.75, intermediate: 1.25, advanced: 1.50, elite: 2.00 },
                    bench:        { untrained: 0.25, novice: 0.50, intermediate: 0.75, advanced: 1.00, elite: 1.25 },
                    deadlift:     { untrained: 0.50, novice: 1.00, intermediate: 1.50, advanced: 1.75, elite: 2.25 },
                    ohp:          { untrained: 0.20, novice: 0.35, intermediate: 0.50, advanced: 0.65, elite: 0.85 },
                    front_squat:  { untrained: 0.40, novice: 0.65, intermediate: 1.00, advanced: 1.30, elite: 1.70 },
                    row:          { untrained: 0.30, novice: 0.50, intermediate: 0.80, advanced: 1.05, elite: 1.35 },
                    incline:      { untrained: 0.20, novice: 0.40, intermediate: 0.65, advanced: 0.85, elite: 1.10 },
                    hip_thrust:   { untrained: 0.80, novice: 1.25, intermediate: 1.75, advanced: 2.20, elite: 2.75 },
                },
            };

            const TIER_ORDER = ['untrained', 'novice', 'intermediate', 'advanced', 'elite'];
            const TIER_LABEL = {
                untrained:    'Untrained',
                novice:       'Novice',
                intermediate: 'Intermediate',
                advanced:     'Advanced',
                elite:        'Elite',
            };
            // Percentile anchors at thresholds
            const TIER_PERCENTILE = { untrained: 5, novice: 25, intermediate: 50, advanced: 75, elite: 95 };

            // State
            let exercise = 'squat';
            let gender = 'male';
            let weightUnit = 'imperial';
            let inputMode = 'direct';

            // DOM refs
            const exerciseScroll = document.getElementById('exerciseScroll');
            const genderBtns = document.querySelectorAll('.tool-gender-btn');
            const calcBtn = document.getElementById('calcBtn');
            const errorMsg = document.getElementById('errorMsg');
            const resultCard = document.getElementById('resultCard');
            const comparisonCard = document.getElementById('comparisonCard');
            const referenceSection = document.getElementById('referenceSection');

            /* ---------- Render ---------- */

            function renderExercisePills() {
                exerciseScroll.innerHTML = EXERCISES.map(ex => `
                    <button class="exercise-pill${ex.key === exercise ? ' active' : ''}" type="button" data-exercise="${ex.key}">${ex.label}</button>
                `).join('');
            }

            function renderReferenceGrid(userTier = null) {
                const thresholds = STANDARDS[gender][exercise];
                const unit = weightUnit === 'imperial' ? 'lb' : 'kg';
                const bw = parseFloat(document.getElementById('bodyweight').value);

                referenceSection.style.display = 'block';
                document.getElementById('referenceCopy').textContent =
                    `Bodyweight multipliers for ${EXERCISES.find(e => e.key === exercise).label} — ${gender === 'male' ? 'male' : 'female'}.`;

                // Filter chips describing current scope
                document.getElementById('referenceFilter').innerHTML = `
                    <span class="filter-chip">${EXERCISES.find(e => e.key === exercise).label}</span>
                    <span class="filter-chip">${gender === 'male' ? 'Male' : 'Female'}</span>
                    ${!isNaN(bw) ? `<span class="filter-chip">@ ${bw} ${unit}</span>` : ''}
                `;

                document.getElementById('referenceGrid').innerHTML = TIER_ORDER.map(tier => {
                    const mult = thresholds[tier];
                    const weight = !isNaN(bw) ? `${roundWeight(mult * bw)} ${unit}` : '';
                    const highlight = tier === userTier ? ' highlight' : '';
                    return `
                        <div class="tool-ref-card${highlight}">
                            <div class="tool-ref-dot dot-${tier}"></div>
                            <h4>${TIER_LABEL[tier]}</h4>
                            <div class="tool-ref-range">${mult.toFixed(2)}×</div>
                            <div class="tool-ref-range-unit">bodyweight</div>
                            ${weight ? `<div class="tool-ref-weight">${weight}</div>` : ''}
                        </div>
                    `;
                }).join('');
            }

            function renderComparisonTable(bw, userExerciseKey, userRatio) {
                if (isNaN(bw) || bw <= 0) {
                    comparisonCard.style.display = 'none';
                    return;
                }
                const unit = weightUnit === 'imperial' ? 'lb' : 'kg';
                comparisonCard.style.display = 'block';
                document.getElementById('comparisonUnitHint').textContent = `weights in ${unit}, calculated from your bodyweight`;

                const rows = EXERCISES.map(ex => {
                    const thresholds = STANDARDS[gender][ex.key];
                    // Determine which column is user's tier for THIS exercise — only if it's the current exercise
                    const isCurrent = ex.key === userExerciseKey;
                    const userTier = isCurrent ? classifyTier(userRatio, thresholds).tier : null;
                    const cells = TIER_ORDER.map(tier => {
                        const w = roundWeight(thresholds[tier] * bw);
                        const cls = (isCurrent && tier === userTier) ? ' class="your-tier"' : '';
                        return `<td${cls}>${w}</td>`;
                    }).join('');
                    return `
                        <tr${isCurrent ? ' class="current-exercise"' : ''}>
                            <td>${ex.label}</td>
                            ${cells}
                        </tr>
                    `;
                }).join('');

                document.getElementById('comparisonBody').innerHTML = rows;
            }

            /* ---------- Calculation ---------- */

            // 1RM estimation from reps — average of Epley + Brzycki
            function estimate1RM(weight, reps) {
                if (reps === 1) return weight;
                const epley   = weight * (1 + reps / 30);
                const brzycki = weight * 36 / (37 - reps);
                return (epley + brzycki) / 2;
            }

            function classifyTier(ratio, thresholds) {
                let tier = 'untrained';
                for (let i = TIER_ORDER.length - 1; i >= 0; i--) {
                    if (ratio >= thresholds[TIER_ORDER[i]]) {
                        tier = TIER_ORDER[i];
                        break;
                    }
                }
                return { tier };
            }

            function computePercentile(ratio, thresholds) {
                // Anchored percentile mapping based on tier thresholds
                // <untrained: 1–5
                // untrained→novice: 5–25
                // novice→intermediate: 25–50
                // intermediate→advanced: 50–75
                // advanced→elite: 75–95
                // >elite: 95–99
                const u = thresholds.untrained;
                const n = thresholds.novice;
                const i = thresholds.intermediate;
                const a = thresholds.advanced;
                const e = thresholds.elite;

                if (ratio < u) return Math.max(1, Math.round(5 * (ratio / u)));
                if (ratio < n) return Math.round(5 + (25 - 5) * (ratio - u) / (n - u));
                if (ratio < i) return Math.round(25 + (50 - 25) * (ratio - n) / (i - n));
                if (ratio < a) return Math.round(50 + (75 - 50) * (ratio - i) / (a - i));
                if (ratio < e) return Math.round(75 + (95 - 75) * (ratio - a) / (e - a));
                return Math.min(99, Math.round(95 + 4 * Math.min(1, (ratio - e) / e)));
            }

            function gaugePercent(ratio, thresholds) {
                // Match percentile mapping so the bar aligns with tiers
                const pct = computePercentile(ratio, thresholds);
                return Math.min(100, Math.max(0, pct));
            }

            function roundWeight(n) {
                // Round to nearest 5 for cleaner display
                return Math.round(n / 5) * 5;
            }

            function formatWeight(n) {
                return (Math.round(n * 2) / 2).toFixed(1).replace(/\.0$/, '');
            }

            /* ---------- Main calculate ---------- */

            function showError(msg) {
                errorMsg.textContent = msg;
                errorMsg.classList.add('show');
                resultCard.classList.remove('show');
                comparisonCard.style.display = 'none';
            }

            function clearError() {
                errorMsg.classList.remove('show');
            }

            function calculate() {
                clearError();

                const bw = parseFloat(document.getElementById('bodyweight').value);
                if (isNaN(bw) || bw <= 0) {
                    showError('Enter your bodyweight.');
                    return;
                }

                let oneRm;
                if (inputMode === 'direct') {
                    oneRm = parseFloat(document.getElementById('directMax').value);
                    if (isNaN(oneRm) || oneRm <= 0) {
                        showError('Enter your one rep max.');
                        return;
                    }
                } else {
                    const w = parseFloat(document.getElementById('repsWeight').value);
                    const r = parseInt(document.getElementById('repsCount').value, 10);
                    if (isNaN(w) || w <= 0) {
                        showError('Enter the weight you lifted.');
                        return;
                    }
                    if (isNaN(r) || r < 1 || r > 12) {
                        showError('Enter reps between 1 and 12.');
                        return;
                    }
                    oneRm = estimate1RM(w, r);
                }

                const thresholds = STANDARDS[gender][exercise];
                const ratio = oneRm / bw;
                const { tier } = classifyTier(ratio, thresholds);
                const pct = computePercentile(ratio, thresholds);
                const gp = gaugePercent(ratio, thresholds);

                const unit = weightUnit === 'imperial' ? 'lb' : 'kg';
                const exerciseLabel = EXERCISES.find(e => e.key === exercise).label;

                // Update hero
                document.getElementById('resultExerciseLabel').textContent =
                    `${exerciseLabel} · ${gender === 'male' ? 'Male' : 'Female'} · ${bw} ${unit}`;
                const tierEl = document.getElementById('resultTierLabel');
                tierEl.textContent = TIER_LABEL[tier];
                tierEl.className = 'result-tier-label tier-' + tier;
                document.getElementById('resultRatio').textContent = `${ratio.toFixed(2)}× Bodyweight`;
                document.getElementById('resultMaxLine').innerHTML =
                    `${inputMode === 'direct' ? 'Your 1RM' : 'Estimated 1RM'}: <strong>${formatWeight(oneRm)} ${unit}</strong>`;

                document.getElementById('resultGauge').style.width = gp + '%';

                // Percentile
                document.getElementById('insightPercentile').textContent = `Top ${100 - pct}%`;
                document.getElementById('insightPercentileSub').textContent =
                    `Stronger than ~${pct}% of ${gender === 'male' ? 'male' : 'female'} lifters at your bodyweight`;

                // Next tier
                const currentIdx = TIER_ORDER.indexOf(tier);
                const nextTier = currentIdx < TIER_ORDER.length - 1 ? TIER_ORDER[currentIdx + 1] : null;
                if (nextTier) {
                    const needed = thresholds[nextTier] * bw;
                    const delta = needed - oneRm;
                    document.getElementById('insightNextTier').textContent = `+${roundWeight(delta)} ${unit}`;
                    document.getElementById('insightNextTierSub').textContent =
                        `to reach ${TIER_LABEL[nextTier]} (${roundWeight(needed)} ${unit})`;
                } else {
                    document.getElementById('insightNextTier').textContent = 'Top tier';
                    document.getElementById('insightNextTierSub').textContent = 'You\'re at Elite — the top of the chart.';
                }

                resultCard.classList.add('show');
                window.dispatchEvent(new CustomEvent('gainframe:web-tool-completed'));

                // Render comparison + reference
                renderComparisonTable(bw, exercise, ratio);
                renderReferenceGrid(tier);

                resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }

            /* ---------- Events ---------- */

            exerciseScroll.addEventListener('click', e => {
                const btn = e.target.closest('[data-exercise]');
                if (!btn) return;
                exercise = btn.dataset.exercise;
                renderExercisePills();
                if (resultCard.classList.contains('show')) calculate();
                else if (referenceSection.style.display !== 'none') renderReferenceGrid();
            });

            genderBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    genderBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    gender = btn.dataset.gender;
                    if (resultCard.classList.contains('show')) calculate();
                    else if (referenceSection.style.display !== 'none') renderReferenceGrid();
                });
            });

            document.querySelectorAll('.tool-unit-toggle').forEach(toggle => {
                toggle.querySelectorAll('.tool-unit-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        toggle.querySelectorAll('.tool-unit-btn').forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                        weightUnit = btn.dataset.unit;
                        const unitLabel = weightUnit === 'imperial' ? 'lb' : 'kg';
                        document.getElementById('directUnitHint').textContent = unitLabel;
                        document.getElementById('repsUnitHint').textContent = unitLabel;
                        if (resultCard.classList.contains('show')) calculate();
                    });
                });
            });

            document.querySelectorAll('.mode-tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    inputMode = tab.dataset.mode;
                    document.getElementById('directInputs').style.display = inputMode === 'direct' ? '' : 'none';
                    document.getElementById('repsInputs').style.display = inputMode === 'reps' ? 'grid' : 'none';
                });
            });

            calcBtn.addEventListener('click', calculate);
            document.querySelectorAll('.tool-input-field').forEach(input => {
                input.addEventListener('keydown', e => {
                    if (e.key === 'Enter') calculate();
                });
            });

            /* ---------- Init ---------- */
            renderExercisePills();
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
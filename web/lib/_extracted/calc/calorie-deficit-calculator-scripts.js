/* =====================================================
           CALORIE DEFICIT CALCULATOR
           Live calc, both directions, timeline milestones
           ===================================================== */
        (function () {
            const CAL_PER_LB = 3500;
            const CAL_PER_KG = 7700;
            const LB_PER_KG = 2.20462;

            // State
            let weightUnit = 'imperial';
            let weeklyRate = 0.5; // in lb by default (0.5 lb/week moderate)
            let hasUserInteracted = false;

            // Rate options
            const RATES = {
                imperial: [
                    { value: 0.25, label: 'Slow' },
                    { value: 0.5,  label: 'Moderate' },
                    { value: 0.75, label: 'Aggressive' },
                    { value: 1.0,  label: 'Maximum' },
                ],
                metric: [
                    { value: 0.1, label: 'Slow' },
                    { value: 0.25, label: 'Moderate' },
                    { value: 0.35, label: 'Aggressive' },
                    { value: 0.5,  label: 'Maximum' },
                ],
            };

            // DOM
            const currentWeightInput = document.getElementById('currentWeight');
            const targetWeightInput = document.getElementById('targetWeight');
            const tdeeInput = document.getElementById('tdee');
            const rateGridEl = document.getElementById('rateGrid');
            const resultCard = document.getElementById('resultCard');
            const errorMsg = document.getElementById('errorMsg');

            /* ---------- Helpers ---------- */

            function calPerUnit() {
                return weightUnit === 'imperial' ? CAL_PER_LB : CAL_PER_KG;
            }

            function unitLabel() {
                return weightUnit === 'imperial' ? 'lb' : 'kg';
            }

            function fmt(n, opts = {}) {
                const { decimals = 0 } = opts;
                return Math.round(n * Math.pow(10, decimals)) / Math.pow(10, decimals);
            }

            function formatInt(n) {
                return Math.round(n).toLocaleString();
            }

            function formatDate(d) {
                // "Jun 15, 2026"
                const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
            }

            function addDays(d, days) {
                const r = new Date(d);
                r.setDate(r.getDate() + Math.round(days));
                return r;
            }

            function recommendedRateIndex(currentWeightLb) {
                // Based on 0.5–1% of bodyweight per week for cuts
                // 0.25 lb/week is safe up to ~140 lb
                // 0.5 lb/week is safe up to ~220 lb
                // 0.75 lb/week is safe up to ~300 lb
                // 1.0 lb/week is safe above ~300 lb
                if (weightUnit === 'imperial') {
                    if (currentWeightLb >= 250) return 3; // Maximum
                    if (currentWeightLb >= 180) return 2; // Aggressive
                    if (currentWeightLb >= 130) return 1; // Moderate
                    return 0; // Slow
                } else {
                    // Metric equivalent
                    if (currentWeightLb >= 115) return 3;
                    if (currentWeightLb >= 82)  return 2;
                    if (currentWeightLb >= 59)  return 1;
                    return 0;
                }
            }

            /* ---------- Rate pills ---------- */

            function renderRatePills() {
                const rates = RATES[weightUnit];
                const currentWeightRaw = parseFloat(currentWeightInput.value);
                const currentInUnit = isNaN(currentWeightRaw) ? null : currentWeightRaw;
                const recIdx = !isNaN(currentWeightRaw) ? recommendedRateIndex(currentInUnit) : -1;

                rateGridEl.innerHTML = rates.map((r, i) => {
                    const dailyDeficit = (r.value * calPerUnit()) / 7;
                    const isActive = r.value === weeklyRate;
                    const isRec = i === recIdx;
                    return `
                        <button type="button" class="rate-pill${isActive ? ' active' : ''}" data-rate="${r.value}">
                            ${isRec ? '<span class="rate-recommend">Recommended</span>' : ''}
                            <span class="rate-amount">${r.value}</span><span class="rate-unit">${unitLabel()}/wk</span>
                            <div class="rate-label">${r.label}</div>
                            <div class="rate-delta">~${Math.round(dailyDeficit)} cal/day</div>
                        </button>
                    `;
                }).join('');
            }

            /* ---------- Timeline ---------- */

            function renderTimeline(currentW, targetW, weeks, isCut) {
                const track = document.getElementById('timelineTrack');

                // Build 5 milestones: 0, 25, 50, 75, 100
                const points = [
                    { pct: 0,   label: 'Today',   badge: 'today' },
                    { pct: 25,  label: '25%',     badge: null },
                    { pct: 50,  label: 'Halfway', badge: null },
                    { pct: 75,  label: '75%',     badge: null },
                    { pct: 100, label: 'Goal',    badge: 'goal' },
                ];

                const today = new Date();
                const delta = targetW - currentW; // signed

                const html = points.map((p, i) => {
                    const weight = currentW + (delta * p.pct / 100);
                    const daysOut = (weeks * 7) * (p.pct / 100);
                    const date = addDays(today, daysOut);
                    const positionClass = i === 0 ? 'start' : (i === points.length - 1 ? 'end' : 'mid');
                    const topBadge = p.badge === 'today'
                        ? '<span class="timeline-today-badge">Today</span>'
                        : p.badge === 'goal'
                            ? '<span class="timeline-goal-badge">Goal</span>'
                            : `<span>${p.label}</span>`;
                    return `
                        <div class="timeline-marker ${positionClass}" style="left: ${p.pct}%;">
                            <div class="timeline-label-top">${topBadge}</div>
                            <div class="timeline-dot"></div>
                            <div class="timeline-label-bottom">
                                <div class="timeline-weight">${fmt(weight, { decimals: 1 })} ${unitLabel()}</div>
                                <div class="timeline-date">${i === 0 ? formatDate(today) : formatDate(date)}</div>
                            </div>
                        </div>
                    `;
                }).join('');

                track.innerHTML = html;
            }

            /* ---------- Tips ---------- */

            function renderTips(direction, calories, tdee) {
                const el = document.getElementById('tipsGrid');
                const titleEl = document.getElementById('tipsTitle');
                const introEl = document.getElementById('tipsIntro');

                let tips = [];
                if (direction === 'cut') {
                    titleEl.textContent = 'Tips to hit your cut';
                    introEl.textContent = 'Four research-backed guardrails to preserve muscle while dropping fat.';
                    tips = [
                        'Eat 0.8–1 g of protein per pound of bodyweight. This is the single biggest lever for keeping muscle in a deficit.',
                        'Weigh and log your food with a scale. Eyeballing portions undercounts intake by 20–30%, which stalls cuts.',
                        'Lift 3–4×/week with compound movements. Maintained or added strength in a deficit is the proof you\'re losing fat, not muscle.',
                        'Expect 2–3 lb day-to-day swings from water and glycogen. Track the weekly average, not individual weigh-ins.',
                    ];
                } else if (direction === 'bulk') {
                    titleEl.textContent = 'Tips to hit your bulk';
                    introEl.textContent = 'Keep gains mostly lean with a measured surplus and smart training.';
                    tips = [
                        'Keep the surplus modest — 200–400 cal above TDEE. Bigger surpluses add fat faster than muscle.',
                        'Protein target is still 0.8–1 g per pound. Carbs and fats fill the rest based on preference.',
                        'Gain 0.25–0.5 lb per week as a trained lifter (more as a novice). Faster = more fat gain.',
                        'Track strength progression weekly. If your lifts stall but weight climbs, reduce the surplus.',
                    ];
                } else {
                    titleEl.textContent = 'Maintenance tips';
                    introEl.textContent = 'Confirm your real maintenance and keep the scale steady.';
                    tips = [
                        'Weigh daily for 2–3 weeks and track the trend — TDEE estimates carry ±10–15% error.',
                        'Daily fluctuations of 1–3 lb are normal water weight. The 7-day average is what matters.',
                        'If you\'re drifting up or down by more than 1 lb/week, adjust intake by 100–200 cal.',
                        'Keep protein at 0.7–0.8 g per pound of bodyweight to maintain muscle at maintenance calories.',
                    ];
                }

                el.innerHTML = tips.map((t, i) => `
                    <div class="tip-item">
                        <div class="tip-number">${i + 1}</div>
                        <div class="tip-body">${t}</div>
                    </div>
                `).join('');
            }

            /* ---------- Safety warnings ---------- */

            function evaluateSafety(calories, tdee, deficit, isCut) {
                const warnings = [];
                if (!isCut) {
                    // Bulks: warn if surplus is large (>25% of TDEE)
                    const surplusPct = (deficit / tdee) * 100;
                    if (surplusPct > 25) {
                        warnings.push({
                            title: 'Large surplus',
                            body: `You're ${Math.round(surplusPct)}% above your TDEE. This produces faster weight gain but a larger share ends up as fat. A 10–20% surplus is ideal for most lifters.`,
                        });
                    }
                    return warnings;
                }
                // Cuts
                if (calories < 1200) {
                    warnings.push({
                        title: 'Very low calorie intake',
                        body: `Eating under 1,200 cal/day risks nutrient deficiencies, hormonal disruption, and muscle loss. Consider a slower rate or consult a dietitian.`,
                    });
                } else if (calories < 1500) {
                    warnings.push({
                        title: 'Aggressive intake',
                        body: `Under 1,500 cal/day is very lean for most adults. Check that the slower rate still hits your timeline — it likely will with less muscle loss.`,
                    });
                }
                const deficitPct = (deficit / tdee) * 100;
                if (deficitPct > 25) {
                    warnings.push({
                        title: 'Aggressive deficit',
                        body: `You're cutting ${Math.round(deficitPct)}% below your TDEE. Deficits above 25% accelerate muscle loss and metabolic adaptation. A 15–20% deficit is the sustainable sweet spot.`,
                    });
                }
                return warnings;
            }

            /* ---------- Main calc (live) ---------- */

            function calculate() {
                errorMsg.classList.remove('show');

                const currentW = parseFloat(currentWeightInput.value);
                const targetW = parseFloat(targetWeightInput.value);
                const tdee = parseFloat(tdeeInput.value);

                if (isNaN(currentW) || currentW <= 0 || isNaN(targetW) || targetW <= 0 || isNaN(tdee) || tdee <= 0) {
                    resultCard.classList.remove('show');
                    return;
                }

                const delta = Math.abs(currentW - targetW);
                const isCut = currentW > targetW;
                const isMaintain = Math.abs(currentW - targetW) < 0.1;
                const direction = isMaintain ? 'maintain' : (isCut ? 'cut' : 'bulk');

                const weeks = isMaintain ? 0 : delta / weeklyRate;
                const dailyCalChange = (weeklyRate * calPerUnit()) / 7;
                const dailyTarget = isCut ? (tdee - dailyCalChange) : (isMaintain ? tdee : (tdee + dailyCalChange));
                const goalDate = isMaintain ? new Date() : addDays(new Date(), weeks * 7);

                // Direction chip
                const chip = document.getElementById('directionChip');
                const dirLabel = document.getElementById('directionLabel');
                chip.className = 'direction-chip ' + direction;
                dirLabel.textContent = direction.charAt(0).toUpperCase() + direction.slice(1);

                // Hero
                document.getElementById('resultCalories').textContent = formatInt(dailyTarget);

                // Context chip
                const targetPctOfTdee = (dailyTarget / tdee) * 100;
                const deficitPct = Math.abs(1 - targetPctOfTdee / 100) * 100;
                let intensity = 'Mild';
                if (deficitPct > 25) intensity = 'Aggressive';
                else if (deficitPct > 15) intensity = 'Moderate';
                else if (deficitPct > 5)  intensity = 'Mild';
                else                       intensity = 'Maintenance';
                document.getElementById('resultContext').innerHTML =
                    isMaintain
                        ? `<strong>${Math.round(targetPctOfTdee)}%</strong> of your TDEE · Maintenance`
                        : `<strong>${Math.round(targetPctOfTdee)}%</strong> of your TDEE · ${intensity} ${isCut ? 'deficit' : 'surplus'}`;

                // Stat labels/values
                document.getElementById('statDeficitLabel').textContent = isCut ? 'Daily deficit' : (isMaintain ? 'Daily adjustment' : 'Daily surplus');
                document.getElementById('statDeficit').textContent = isMaintain ? '0' : formatInt(dailyCalChange);

                if (isMaintain) {
                    document.getElementById('statWeeks').textContent = '—';
                    document.getElementById('statWeeksSub').textContent = 'already at goal';
                    document.getElementById('statDate').textContent = 'Today';
                    document.getElementById('statDateSub').textContent = 'you\'re there';
                } else {
                    document.getElementById('statWeeks').textContent = fmt(weeks, { decimals: 1 });
                    document.getElementById('statWeeksSub').textContent = weeks >= 52 ? `${fmt(weeks / 52, { decimals: 1 })} years` : 'weeks';
                    document.getElementById('statDate').textContent = formatDate(goalDate);
                    document.getElementById('statDateSub').textContent = 'projected';
                }

                // Timeline
                if (!isMaintain) {
                    renderTimeline(currentW, targetW, weeks, isCut);
                    document.getElementById('timelineSubtitle').textContent =
                        `${isCut ? 'Weight loss' : 'Weight gain'} milestones at ${weeklyRate} ${unitLabel()}/week — actual progress will vary.`;
                    document.querySelector('.timeline-card').style.display = '';
                } else {
                    document.querySelector('.timeline-card').style.display = 'none';
                }

                // Tips
                renderTips(direction, dailyTarget, tdee);

                // Safety
                const warnings = isMaintain ? [] : evaluateSafety(dailyTarget, tdee, dailyCalChange, isCut);
                const warningCard = document.getElementById('warningCard');
                if (warnings.length > 0) {
                    document.getElementById('warningTitle').textContent = warnings[0].title;
                    document.getElementById('warningBody').textContent = warnings[0].body;
                    warningCard.style.display = 'flex';
                } else {
                    warningCard.style.display = 'none';
                }

                resultCard.classList.add('show');
                if (hasUserInteracted) {
                    window.dispatchEvent(new CustomEvent('gainframe:web-tool-completed'));
                }
            }

            /* ---------- Events ---------- */

            // Unit toggle
            document.querySelectorAll('.tool-unit-toggle-standalone').forEach(toggle => {
                toggle.querySelectorAll('.tool-unit-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        hasUserInteracted = true;
                        toggle.querySelectorAll('.tool-unit-btn').forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');

                        const prevUnit = weightUnit;
                        weightUnit = btn.dataset.unit;

                        // Convert existing weight inputs between units
                        if (prevUnit !== weightUnit) {
                            const cw = parseFloat(currentWeightInput.value);
                            const tw = parseFloat(targetWeightInput.value);
                            if (!isNaN(cw)) {
                                currentWeightInput.value = weightUnit === 'metric'
                                    ? fmt(cw / LB_PER_KG, { decimals: 1 })
                                    : fmt(cw * LB_PER_KG, { decimals: 1 });
                            }
                            if (!isNaN(tw)) {
                                targetWeightInput.value = weightUnit === 'metric'
                                    ? fmt(tw / LB_PER_KG, { decimals: 1 })
                                    : fmt(tw * LB_PER_KG, { decimals: 1 });
                            }
                        }

                        // Reset weekly rate to moderate default in new unit
                        weeklyRate = RATES[weightUnit][1].value;

                        // Update labels
                        document.getElementById('unitLabel1').textContent = unitLabel();
                        document.getElementById('unitLabel2').textContent = unitLabel();
                        document.getElementById('calPerUnit').textContent = (calPerUnit()).toLocaleString();
                        document.getElementById('calPerUnit2').textContent = (calPerUnit()).toLocaleString();
                        document.getElementById('calPerUnitLabel').textContent = unitLabel();

                        renderRatePills();
                        calculate();
                    });
                });
            });

            // Rate pill click (delegated)
            rateGridEl.addEventListener('click', e => {
                const pill = e.target.closest('.rate-pill');
                if (!pill) return;
                hasUserInteracted = true;
                weeklyRate = parseFloat(pill.dataset.rate);
                renderRatePills();
                calculate();
            });

            // Live inputs
            [currentWeightInput, targetWeightInput, tdeeInput].forEach(el => {
                el.addEventListener('input', () => {
                    hasUserInteracted = true;
                    renderRatePills(); // refresh "recommended" based on current weight
                    calculate();
                });
            });

            /* ---------- Init ---------- */
            renderRatePills();
            // Pre-fill helpful defaults so hero renders immediately
            currentWeightInput.value = '180';
            targetWeightInput.value = '165';
            tdeeInput.value = '2500';
            renderRatePills();
            calculate();
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
/* =====================================================
           CALORIES BURNED CALCULATOR
           ===================================================== */
        (function () {
            // Parse embedded CSV
            const REFERENCE_KG = 70.307; // 155 lb in kg — basis for the 155 lb column
            const LB_PER_KG = 2.20462;

            function parseCSV(text) {
                const rows = [];
                const lines = text.trim().split('\n');
                const re = /^("([^"]+)"|([^,]+)),\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+)/;
                lines.forEach(line => {
                    const m = line.match(re);
                    if (!m) return;
                    const name = m[2] || m[3];
                    rows.push({
                        name: name.trim(),
                        cal155: parseInt(m[5], 10),  // 155 lb column
                    });
                });
                return rows;
            }

            function categorize(name) {
                const n = name.toLowerCase();
                if (/children|infant|^carrying (small|16|25)|^loading|physical education|animals|bath.*dog|^pushing stroller|^pushing a wheelchair/.test(n)) return 'Home & Family';
                if (/housework|clean|paint|garden|mow|snow blower|shoveling snow|raking|^bagging|watering lawn|weed|carpentry|trash|gutters|^carrying (heavy|moderate)|^walking, pushing a wheelchair/.test(n)) return 'Home & Family';
                if (/cycling|bicycling|unicycling/.test(n)) return 'Cycling';
                if (/running, training, pushing wheelchair/.test(n)) return 'Running';
                if (/^running|^track and field/.test(n)) return 'Running';
                if (/skating|ice|snow|ski|sled|snowshoe|snowmobil|tobaggan|luge/.test(n)) return 'Winter Sports';
                if (/swim|^water |scuba|snorkel|surfing|body surf|^diving|^crew|rowing, (light|moderate|vigorous|competition)|kayak|canoe|boat|sail|paddle boat|whitewater|raft|windsurf|water ski/.test(n)) return 'Swimming & Water';
                if (/weight lift|calisthen|circuit|stair machine|rowing machine|ski machine|jumping rope|health club|instructing aerobic/.test(n)) return 'Strength & Gym';
                if (/aerobic|jazzercise|danc|ballet|yoga|stretch|tai chi/.test(n)) return 'Dance & Yoga';
                if (/martial art|boxing|krav maga|wrestling|fencing/.test(n)) return 'Martial Arts';
                if (/basketball|football|soccer|hockey|rugby|volleyball|lacrosse|cricket|^handball, team|kickball|softball|baseball|frisbee|polo|coaching/.test(n)) return 'Team Sports';
                if (/tennis|badminton|squash|racquetball|paddleball|wallyball|jai alai|table tennis|^handball$/.test(n)) return 'Racket Sports';
                if (/walking|hiking|backpacking|marching|race walking|walk.run|crutch|downstairs|bird watching|climbing hills|^children's games/.test(n)) return 'Walking & Hiking';
                if (/golf|archery|billiards|bowling|dart|hacky|juggling|horse|horseshoe|croquet|curling|shuffleboard|skateboard|roller skat|roller blad|sky diving|trampoline|orienteering|rock climbing|gymnastic/.test(n)) return 'Recreation';
                return 'Other';
            }

            const rawText = document.getElementById('activityData').textContent;
            const ACTIVITIES = parseCSV(rawText).map(a => ({
                ...a,
                category: categorize(a.name),
                // Calories per lb per hour — derived from 155 lb column for linear scaling
                calPerLbHr: a.cal155 / 155,
                // MET = kcal/kg/hr
                mets: a.cal155 / REFERENCE_KG,
            }));

            // Category order (stable)
            const CATEGORIES = [
                'All',
                'Running',
                'Cycling',
                'Walking & Hiking',
                'Swimming & Water',
                'Strength & Gym',
                'Dance & Yoga',
                'Team Sports',
                'Racket Sports',
                'Martial Arts',
                'Winter Sports',
                'Recreation',
                'Home & Family',
                'Other'
            ];

            // Popular shortcuts — pick by name
            const POPULAR_NAMES = [
                'Walking 3.0 mph, moderate',
                'Running, 6 mph (10 min mile)',
                'Cycling, 12-13.9 mph, moderate',
                'Weight lifting, body building, vigorous',
                'Swimming laps, freestyle, slow',
                'Hiking, cross country',
            ];

            // Food equivalents (cal each)
            const FOODS = [
                { icon: '🍕', label: 'slices of pizza', cal: 285 },
                { icon: '🍫', label: 'candy bars', cal: 215 },
                { icon: '🍺', label: 'beers', cal: 150 },
                { icon: '🍎', label: 'apples', cal: 95 },
            ];

            // State
            let weightUnit = 'imperial';
            let currentCategory = 'All';
            let currentSearch = '';
            let selectedActivity = null;
            let hasUserInteracted = false;

            // DOM
            const weightInput = document.getElementById('weight');
            const durationInput = document.getElementById('duration');
            const searchInput = document.getElementById('searchInput');
            const activityList = document.getElementById('activityList');
            const resultCount = document.getElementById('resultCount');
            const popularChipsEl = document.getElementById('popularChips');
            const categoryPillsEl = document.getElementById('categoryPills');

            /* ---------- Rendering ---------- */

            function renderPopularChips() {
                popularChipsEl.innerHTML = POPULAR_NAMES.map(name => {
                    const activity = ACTIVITIES.find(a => a.name === name);
                    if (!activity) return '';
                    const short = shortName(name);
                    return `<button class="popular-chip" type="button" data-name="${escapeAttr(name)}">${escapeHtml(short)}</button>`;
                }).join('');
            }

            function renderCategoryPills() {
                categoryPillsEl.innerHTML = CATEGORIES.map(cat => {
                    const count = cat === 'All' ? ACTIVITIES.length : ACTIVITIES.filter(a => a.category === cat).length;
                    if (count === 0) return '';
                    return `<button class="cat-pill${cat === currentCategory ? ' active' : ''}" type="button" data-cat="${escapeAttr(cat)}">${escapeHtml(cat)} <span style="opacity:.5;font-weight:500">${count}</span></button>`;
                }).join('');
            }

            function renderActivityList() {
                const filtered = ACTIVITIES.filter(a => {
                    if (currentCategory !== 'All' && a.category !== currentCategory) return false;
                    if (currentSearch && !a.name.toLowerCase().includes(currentSearch)) return false;
                    return true;
                });

                if (filtered.length === 0) {
                    activityList.innerHTML = '<div class="activity-list-empty">No activities match your search.</div>';
                    resultCount.textContent = '';
                    return;
                }

                activityList.innerHTML = filtered.map(a => `
                    <button type="button" class="activity-item${selectedActivity && selectedActivity.name === a.name ? ' selected' : ''}" data-name="${escapeAttr(a.name)}">
                        <span class="activity-name">${escapeHtml(a.name)}</span>
                        <span class="activity-met">${a.mets.toFixed(1)}<span class="activity-met-unit">MET</span></span>
                    </button>
                `).join('');

                resultCount.textContent = `${filtered.length} of ${ACTIVITIES.length} activities`;
            }

            function renderFoodGrid(totalCal) {
                document.getElementById('foodGrid').innerHTML = FOODS.map(f => {
                    const qty = totalCal > 0 ? (totalCal / f.cal).toFixed(1) : '—';
                    return `
                        <div class="food-item">
                            <div class="food-icon">${f.icon}</div>
                            <div class="food-val">${qty}</div>
                            <div class="food-label">${f.label}</div>
                            <div class="food-cal">~${f.cal} cal each</div>
                        </div>
                    `;
                }).join('');
            }

            /* ---------- Calculation ---------- */

            function recalculate() {
                const weightVal = parseFloat(weightInput.value);
                const duration = parseFloat(durationInput.value);

                if (!selectedActivity || isNaN(weightVal) || weightVal <= 0 || isNaN(duration) || duration <= 0) {
                    document.getElementById('resultActivity').textContent = selectedActivity
                        ? 'Enter your weight and duration'
                        : 'Select an activity to calculate';
                    document.getElementById('resultCalories').textContent = '—';
                    document.getElementById('resultSub').textContent = 'total calories burned';
                    document.getElementById('statRate').textContent = '—';
                    document.getElementById('statMets').textContent = selectedActivity ? selectedActivity.mets.toFixed(1) : '—';
                    document.getElementById('statHour').textContent = '—';
                    renderFoodGrid(0);
                    return;
                }

                const weightLb = weightUnit === 'imperial' ? weightVal : weightVal * LB_PER_KG;
                const totalCal = selectedActivity.calPerLbHr * weightLb * (duration / 60);
                const calPerMin = totalCal / duration;
                const calPerHr = selectedActivity.calPerLbHr * weightLb;

                const durationText = duration === 60 ? '1 hour' : `${duration} min`;
                const weightText = weightUnit === 'imperial' ? `${weightVal} lb` : `${weightVal} kg`;

                document.getElementById('resultActivity').innerHTML = `<strong>${escapeHtml(selectedActivity.name)}</strong> · ${durationText} · ${weightText}`;
                document.getElementById('resultCalories').textContent = Math.round(totalCal).toLocaleString();
                document.getElementById('resultSub').textContent = 'total calories burned';
                document.getElementById('statRate').textContent = calPerMin.toFixed(1);
                document.getElementById('statMets').textContent = selectedActivity.mets.toFixed(1);
                document.getElementById('statHour').textContent = Math.round(calPerHr).toLocaleString();

                renderFoodGrid(totalCal);
                if (hasUserInteracted) {
                    window.dispatchEvent(new CustomEvent('gainframe:web-tool-completed'));
                }
            }

            /* ---------- Event wiring ---------- */

            document.querySelectorAll('.tool-unit-toggle').forEach(toggle => {
                toggle.querySelectorAll('.tool-unit-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        hasUserInteracted = true;
                        toggle.querySelectorAll('.tool-unit-btn').forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                        weightUnit = btn.dataset.unit;
                        recalculate();
                    });
                });
            });

            weightInput.addEventListener('input', () => {
                hasUserInteracted = true;
                recalculate();
            });
            durationInput.addEventListener('input', () => {
                hasUserInteracted = true;
                recalculate();
            });

            searchInput.addEventListener('input', () => {
                currentSearch = searchInput.value.trim().toLowerCase();
                renderActivityList();
            });

            categoryPillsEl.addEventListener('click', e => {
                const btn = e.target.closest('[data-cat]');
                if (!btn) return;
                currentCategory = btn.dataset.cat;
                renderCategoryPills();
                renderActivityList();
            });

            activityList.addEventListener('click', e => {
                const btn = e.target.closest('[data-name]');
                if (!btn) return;
                const activity = ACTIVITIES.find(a => a.name === btn.dataset.name);
                if (!activity) return;
                selectActivity(activity);
            });

            popularChipsEl.addEventListener('click', e => {
                const btn = e.target.closest('[data-name]');
                if (!btn) return;
                const activity = ACTIVITIES.find(a => a.name === btn.dataset.name);
                if (!activity) return;
                selectActivity(activity);
                document.querySelectorAll('.popular-chip').forEach(c => c.classList.toggle('active', c.dataset.name === activity.name));
            });

            function selectActivity(activity, reportUsage = true) {
                hasUserInteracted = reportUsage;
                selectedActivity = activity;
                renderActivityList();
                recalculate();
            }

            /* ---------- Utils ---------- */

            function escapeHtml(s) {
                return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
            }
            function escapeAttr(s) { return escapeHtml(s); }

            function shortName(name) {
                // Shorten for popular chips
                const shortcuts = {
                    'Walking 3.0 mph, moderate':            'Walking 3 mph',
                    'Running, 6 mph (10 min mile)':         'Running 6 mph',
                    'Cycling, 12-13.9 mph, moderate':       'Cycling moderate',
                    'Weight lifting, body building, vigorous': 'Weight lifting',
                    'Swimming laps, freestyle, slow':       'Swimming',
                    'Hiking, cross country':                'Hiking',
                };
                return shortcuts[name] || name;
            }

            /* ---------- Init ---------- */

            renderPopularChips();
            renderCategoryPills();
            renderActivityList();

            // Pre-select a sensible default
            const defaultActivity = ACTIVITIES.find(a => a.name === 'Walking 3.0 mph, moderate');
            if (defaultActivity) {
                selectActivity(defaultActivity, false);
                hasUserInteracted = false;
                const chip = document.querySelector('.popular-chip[data-name="' + escapeAttr(defaultActivity.name).replace(/"/g,'\\"') + '"]');
                if (chip) chip.classList.add('active');
            }
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
/* =====================================================
           BODY FAT CALCULATOR — Navy Method
           ===================================================== */

        (function () {
            // State
            let gender = 'male';
            let heightUnit = 'imperial';
            let weightUnit = 'imperial';

            // DOM refs
            const genderBtns = document.querySelectorAll('.tool-gender-btn');
            const hipGroup = document.getElementById('hipGroup');
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
                            // Update hints
                            document.getElementById('neckHint').textContent = unit === 'imperial' ? 'inches' : 'cm';
                            document.getElementById('waistHint').textContent = unit === 'imperial' ? 'inches — at navel' : 'cm — at navel';
                            document.getElementById('hipHint').textContent = unit === 'imperial' ? 'inches — widest point' : 'cm — widest point';
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
                    hipGroup.classList.toggle('show', gender === 'female');
                    refGridMale.style.display = gender === 'male' ? 'grid' : 'none';
                    refGridFemale.style.display = gender === 'female' ? 'grid' : 'none';
                });
            });

            // Calculate
            calcBtn.addEventListener('click', calculate);

            // Allow Enter key to calculate
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
                document.querySelectorAll('.tool-input-error').forEach(el => el.classList.remove('tool-input-error'));
            }

            function getHeightInches() {
                if (heightUnit === 'imperial') {
                    const ft = parseFloat(document.getElementById('heightFt').value);
                    const inVal = parseFloat(document.getElementById('heightIn').value) || 0;
                    if (isNaN(ft)) return NaN;
                    return ft * 12 + inVal; // inches
                } else {
                    const cm = parseFloat(document.getElementById('heightCm').value);
                    return cm / 2.54; // cm → inches
                }
            }

            function getMeasurementInches(id) {
                const val = parseFloat(document.getElementById(id).value);
                if (isNaN(val)) return NaN;
                // If metric mode, user enters cm — convert to inches for the formula
                // If imperial, value is already in inches
                return heightUnit === 'imperial' ? val : val / 2.54;
            }

            function calculate() {
                clearError();

                const heightIn = getHeightInches();
                const neckIn = getMeasurementInches('neck');
                const waistIn = getMeasurementInches('waist');
                const hipIn = gender === 'female' ? getMeasurementInches('hip') : 0;

                // Validate (in inches: ~39" to ~98")
                if (isNaN(heightIn) || heightIn < 39 || heightIn > 98) {
                    showError('Please enter a valid height.');
                    return;
                }
                if (isNaN(neckIn) || neckIn <= 0) {
                    showError('Please enter your neck circumference.');
                    return;
                }
                if (isNaN(waistIn) || waistIn <= 0) {
                    showError('Please enter your waist circumference.');
                    return;
                }
                if (gender === 'female' && (isNaN(hipIn) || hipIn <= 0)) {
                    showError('Please enter your hip circumference.');
                    return;
                }

                // U.S. Navy method — Hodgdon-Beckett equations (all measurements in inches)
                let bf;
                if (gender === 'male') {
                    bf = 86.010 * Math.log10(waistIn - neckIn) - 70.041 * Math.log10(heightIn) + 36.76;
                } else {
                    bf = 163.205 * Math.log10(waistIn + hipIn - neckIn) - 97.684 * Math.log10(heightIn) - 78.387;
                }

                // Clamp
                bf = Math.max(2, Math.min(60, bf));
                bf = Math.round(bf * 10) / 10;

                // Display result
                document.getElementById('resultBf').textContent = bf.toFixed(1);

                // Category
                const cat = getCategory(bf, gender);
                const catEl = document.getElementById('resultCat');
                catEl.textContent = cat.label;
                catEl.className = 'tool-result-category ' + cat.cls;

                // Gauge (map 5–45% to 0–100%)
                const gaugePercent = Math.min(100, Math.max(0, ((bf - 5) / 40) * 100));
                document.getElementById('resultGauge').style.width = gaugePercent + '%';

                // Detail text
                document.getElementById('resultDetail').textContent = cat.detail;

                // Lean mass / fat mass (if weight provided)
                const weightInput = parseFloat(document.getElementById('weight').value);
                const statsSection = document.getElementById('resultStats');
                if (!isNaN(weightInput) && weightInput > 0) {
                    let weightKg = weightUnit === 'imperial' ? weightInput * 0.453592 : weightInput;
                    const fatMassKg = weightKg * (bf / 100);
                    const leanMassKg = weightKg - fatMassKg;

                    if (weightUnit === 'imperial') {
                        document.getElementById('statFatMass').textContent = (fatMassKg / 0.453592).toFixed(1) + ' lbs';
                        document.getElementById('statLeanMass').textContent = (leanMassKg / 0.453592).toFixed(1) + ' lbs';
                    } else {
                        document.getElementById('statFatMass').textContent = fatMassKg.toFixed(1) + ' kg';
                        document.getElementById('statLeanMass').textContent = leanMassKg.toFixed(1) + ' kg';
                    }
                    statsSection.style.display = 'flex';
                } else {
                    statsSection.style.display = 'none';
                }

                resultCard.classList.add('show');

                // Scroll to result
                resultCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

            function getCategory(bf, gender) {
                if (gender === 'male') {
                    if (bf <= 5) return { label: 'Essential Fat', cls: 'cat-essential', detail: 'This is the minimum fat needed for basic physiological function. Extremely lean — typically only seen in competition bodybuilders at peak.' };
                    if (bf <= 13) return { label: 'Athletic', cls: 'cat-athletic', detail: 'You\'re in athletic range with visible muscle definition and separation. This is typical of competitive athletes and serious lifters.' };
                    if (bf <= 17) return { label: 'Fitness', cls: 'cat-fitness', detail: 'Lean and fit. You likely have some ab definition and clear muscle shape. This is a healthy, sustainable body fat level.' };
                    if (bf <= 24) return { label: 'Average', cls: 'cat-average', detail: 'You\'re in the typical range for most men. Some softness around the midsection. This is a healthy range, and a great starting point for leaning out.' };
                    return { label: 'Above Average', cls: 'cat-above-average', detail: 'You\'re carrying excess body fat. At higher levels, this is associated with increased health risks. The good news: small, consistent changes make a big difference.' };
                } else {
                    if (bf <= 13) return { label: 'Essential Fat', cls: 'cat-essential', detail: 'This is the minimum fat needed for hormonal function. Extremely lean — typically only seen in competition athletes at peak.' };
                    if (bf <= 20) return { label: 'Athletic', cls: 'cat-athletic', detail: 'You\'re in athletic range with visible muscle tone and definition. This is typical of competitive athletes and dedicated trainers.' };
                    if (bf <= 24) return { label: 'Fitness', cls: 'cat-fitness', detail: 'Lean and healthy with noticeable definition. This is a sustainable body fat level that supports performance and wellbeing.' };
                    if (bf <= 31) return { label: 'Average', cls: 'cat-average', detail: 'You\'re in the typical range for most women. A healthy body fat level for general wellness and a great starting point for any goal.' };
                    return { label: 'Above Average', cls: 'cat-above-average', detail: 'You\'re carrying excess body fat. At higher levels, this is associated with increased health risks. The good news: small, consistent changes make a big difference.' };
                }
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
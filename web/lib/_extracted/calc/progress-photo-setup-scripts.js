/* =====================================================
       SCROLL ANIMATIONS (shared pattern)
       ===================================================== */
    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
    }, { threshold: 0.15 });
    document.querySelectorAll('.scroll-reveal,.scroll-reveal-left,.scroll-reveal-right,.parallax-float,.badge-pop,.tilt-in').forEach(el => io.observe(el));

    /* FAQ toggle (shared) */
    function toggleFaq(btn) {
        const item = btn.parentElement;
        const wasOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
        if (!wasOpen) item.classList.add('open');
    }

    /* =====================================================
       SECTION 1: COMPARISON SLIDER
       ===================================================== */
    (function() {
        const wrap = document.getElementById('comparisonSlider');
        const overlay = document.getElementById('compOverlay');
        const overlayImg = overlay.querySelector('img');
        const handle = document.getElementById('compHandle');
        let dragging = false;

        function move(x) {
            const rect = wrap.getBoundingClientRect();
            let pct = ((x - rect.left) / rect.width) * 100;
            pct = Math.max(5, Math.min(95, pct));
            overlay.style.width = pct + '%';
            handle.style.left = pct + '%';
            // Keep the overlay image pinned to full container width
            overlayImg.style.width = rect.width + 'px';
        }

        // On load / resize, set overlay img to container width
        function syncWidth() {
            overlayImg.style.width = wrap.getBoundingClientRect().width + 'px';
        }
        window.addEventListener('resize', syncWidth);
        window.addEventListener('load', syncWidth);
        syncWidth();

        handle.addEventListener('mousedown', () => dragging = true);
        handle.addEventListener('touchstart', () => dragging = true, { passive: true });
        window.addEventListener('mouseup', () => dragging = false);
        window.addEventListener('touchend', () => dragging = false);
        window.addEventListener('mousemove', e => { if (dragging) move(e.clientX); });
        window.addEventListener('touchmove', e => { if (dragging) move(e.touches[0].clientX); }, { passive: true });
        wrap.addEventListener('click', e => move(e.clientX));
    })();

    /* =====================================================
       SECTION 2: SETUP BUILDER
       ===================================================== */
    (function() {
        const steps = [
            { key: 'location', label: 'Step 1 of 5', title: 'Where do you take photos?', options: [
                { icon: '🚪', name: 'Bedroom door', desc: 'Great blank surface', tip: 'Clear the area behind you and use the door as a flat backdrop.' },
                { icon: '🛁', name: 'Bathroom', desc: 'Common but tricky', tip: 'Avoid mirror selfies — use the timer and set the phone on the counter.' },
                { icon: '🏋️', name: 'Gym', desc: 'Good lighting usually', tip: 'Find a consistent spot away from people and mirrors.' },
                { icon: '🏠', name: 'Garage / Home gym', desc: 'Private & convenient', tip: 'Hang a plain sheet or blanket if the background is cluttered.' }
            ]},
            { key: 'background', label: 'Step 2 of 5', title: 'What\'s behind you?', options: [
                { icon: '⬜', name: 'Plain wall', desc: 'Ideal — minimal distraction', tip: 'A solid-color wall is the gold standard for progress photos.' },
                { icon: '🚪', name: 'Closet door', desc: 'Flat and clean', tip: 'Remove any hanging items and make sure the door is fully closed.' },
                { icon: '🪟', name: 'Curtain / sheet', desc: 'Good DIY option', tip: 'Use a light neutral color and pull it taut to avoid wrinkles.' },
                { icon: '🧱', name: 'Other / mixed', desc: 'Needs cleanup', tip: 'Remove as much clutter as possible — the cleaner the background, the easier to spot real changes.' }
            ]},
            { key: 'lighting', label: 'Step 3 of 5', title: 'What\'s your light source?', options: [
                { icon: '☀️', name: 'Window (natural)', desc: 'Best & most honest', tip: 'Face the window for even, diffused light. Avoid direct sunbeams.' },
                { icon: '💡', name: 'Overhead / ceiling', desc: 'Common but harsh', tip: 'Overhead lights cast shadows under your pecs and abs — making you look leaner than you are. Not ideal.' },
                { icon: '💎', name: 'Ring light', desc: 'Great consistency', tip: 'Place at face height, 3–4 feet away. Produces very even, repeatable lighting.' },
                { icon: '📸', name: 'Flash', desc: 'Avoid if possible', tip: 'Flash creates harsh highlights and washes out detail. Use ambient lighting instead.' }
            ]},
            { key: 'camera', label: 'Step 4 of 5', title: 'How do you hold the camera?', options: [
                { icon: '📱', name: 'Phone on shelf', desc: 'Quick and easy', tip: 'Set the phone at belly-button height for the most natural proportions.' },
                { icon: '🔭', name: 'Tripod', desc: 'Best option', tip: 'A $15 phone tripod is the single best investment for progress photos.' },
                { icon: '📐', name: 'Lean against object', desc: 'Works in a pinch', tip: 'Lean the phone against a water bottle, book, or shoe at waist height.' },
                { icon: '🧑', name: 'Someone else', desc: 'Least consistent', tip: 'If possible, mark a spot on the floor for them to stand — same distance every time.' }
            ]},
            { key: 'timer', label: 'Step 5 of 5', title: 'Timer or mirror selfie?', options: [
                { icon: '⏱️', name: 'Timer (3–10 sec)', desc: 'Highly recommended', tip: 'Use burst mode with a 3-second timer — you\'ll get 10 shots to pick the best.' },
                { icon: '🪞', name: 'Mirror selfie', desc: 'Less ideal', tip: 'Mirror selfies hide one arm, introduce angle distortion, and often have flash glare. Use a timer if at all possible.' }
            ]}
        ];

        let current = 0, choices = {};

        function render() {
            const step = steps[current];
            // Dots
            document.getElementById('builderDots').innerHTML = steps.map((_, i) =>
                `<div class="builder-dot ${i < current ? 'done' : ''} ${i === current ? 'active' : ''}"></div>`
            ).join('');
            // Content
            if (current < steps.length) {
                const sel = choices[step.key];
                const tipText = sel !== undefined ? step.options[sel].tip : null;
                document.getElementById('builderContent').innerHTML =
                    `<div class="builder-step-label">${step.label}</div>
                     <div class="builder-step-title">${step.title}</div>
                     <div class="builder-options">${step.options.map((o, i) =>
                        `<div class="builder-option ${sel === i ? 'selected' : ''}" onclick="builderSelect(${i})">
                            <span class="builder-option-icon">${o.icon}</span>
                            <div class="builder-option-name">${o.name}</div>
                            <div class="builder-option-desc">${o.desc}</div>
                        </div>`
                    ).join('')}</div>
                    ${tipText ? `<div class="builder-tip"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"/></svg><p>${tipText}</p></div>` : ''}`;
                // Nav
                document.getElementById('builderNav').innerHTML =
                    `${current > 0 ? '<button class="btn-back" onclick="builderBack()">Back</button>' : ''}
                     <button class="btn-next" ${sel === undefined ? 'disabled' : ''} onclick="builderNext()">
                        ${current === steps.length - 1 ? 'See My Plan' : 'Next'}
                     </button>`;
            } else {
                showSummary();
            }
        }

        function showSummary() {
            const tips = [];
            steps.forEach(s => { const o = s.options[choices[s.key]]; tips.push(o.tip); });
            document.getElementById('builderContent').innerHTML =
                `<div class="summary-card">
                    <h3>🎯 Your Setup Plan</h3>
                    ${steps.map(s => `<div class="summary-row"><span class="summary-label">${s.title.replace('?','')}</span><span class="summary-value">${s.options[choices[s.key]].icon} ${s.options[choices[s.key]].name}</span></div>`).join('')}
                    <div class="summary-tips"><h4>Personalized Tips</h4><ul>${tips.map(t => `<li>${t}</li>`).join('')}</ul></div>
                </div>`;
            document.getElementById('builderNav').innerHTML =
                `<button class="btn-back" onclick="builderBack()">Start Over</button>`;
            document.getElementById('builderDots').innerHTML = steps.map(() => '<div class="builder-dot done"></div>').join('');
        }

        window.builderSelect = function(i) { choices[steps[current].key] = i; render(); };
        window.builderNext = function() { if (choices[steps[current].key] !== undefined) { current++; render(); } };
        window.builderBack = function() { if (current > steps.length) { current = 0; choices = {}; } else { current = Math.max(0, current - 1); } render(); };

        render();
    })();

    /* =====================================================
       SECTION 3: POSE PICKER
       ===================================================== */
    (function() {
        const poses = [
            { name: 'Front Relaxed', purpose: 'The baseline pose — shows overall symmetry, shoulder width, waist taper, and quad sweep at rest.', reveals: ['Chest','Shoulders','Quads','Abs','Arms'], tip: 'Stand with feet shoulder-width apart, arms slightly away from body, palms forward.' },
            { name: 'Side Relaxed', purpose: 'Reveals posture, belly profile, arm thickness, and chest depth that front views miss entirely.', reveals: ['Chest depth','Triceps','Belly profile','Posture'], tip: 'Turn 90°, keep nearest arm at your side, slight bend. Don\'t suck in your stomach.' },
            { name: 'Back Relaxed', purpose: 'Shows upper back width, lat taper, glute/ham development — the muscles you never see in the mirror.', reveals: ['Lats','Traps','Rear delts','Glutes','Hamstrings'], tip: 'Stand naturally, arms at sides. Don\'t flex or flare lats — let resting width speak.' },
            { name: 'Front Double Bicep', purpose: 'The classic bodybuilding pose — reveals peak bicep shape, lat width, and core tightness under tension.', reveals: ['Biceps','Lat spread','Core','Forearms'], tip: 'Raise arms to shoulder height, make fists, flex hard. Pull elbows slightly back.' }
        ];

        const silhouettes = [
            // Front relaxed
            '<svg viewBox="0 0 60 100"><circle cx="30" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/><line x1="30" y1="20" x2="30" y2="55" stroke="currentColor" stroke-width="2"/><line x1="30" y1="28" x2="14" y2="42" stroke="currentColor" stroke-width="2"/><line x1="30" y1="28" x2="46" y2="42" stroke="currentColor" stroke-width="2"/><line x1="30" y1="55" x2="18" y2="90" stroke="currentColor" stroke-width="2"/><line x1="30" y1="55" x2="42" y2="90" stroke="currentColor" stroke-width="2"/></svg>',
            // Side relaxed
            '<svg viewBox="0 0 60 100"><circle cx="30" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/><line x1="30" y1="20" x2="28" y2="55" stroke="currentColor" stroke-width="2"/><line x1="29" y1="28" x2="18" y2="40" stroke="currentColor" stroke-width="2"/><line x1="29" y1="28" x2="38" y2="44" stroke="currentColor" stroke-width="2"/><line x1="28" y1="55" x2="22" y2="90" stroke="currentColor" stroke-width="2"/><line x1="28" y1="55" x2="34" y2="90" stroke="currentColor" stroke-width="2"/></svg>',
            // Back relaxed
            '<svg viewBox="0 0 60 100"><circle cx="30" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/><line x1="30" y1="20" x2="30" y2="55" stroke="currentColor" stroke-width="2"/><line x1="30" y1="28" x2="14" y2="42" stroke="currentColor" stroke-width="2"/><line x1="30" y1="28" x2="46" y2="42" stroke="currentColor" stroke-width="2"/><line x1="30" y1="55" x2="18" y2="90" stroke="currentColor" stroke-width="2"/><line x1="30" y1="55" x2="42" y2="90" stroke="currentColor" stroke-width="2"/><line x1="24" y1="30" x2="36" y2="30" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 2"/></svg>',
            // Double bicep
            '<svg viewBox="0 0 60 100"><circle cx="30" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/><line x1="30" y1="20" x2="30" y2="55" stroke="currentColor" stroke-width="2"/><polyline points="30,28 14,28 10,18" fill="none" stroke="currentColor" stroke-width="2"/><polyline points="30,28 46,28 50,18" fill="none" stroke="currentColor" stroke-width="2"/><line x1="30" y1="55" x2="18" y2="90" stroke="currentColor" stroke-width="2"/><line x1="30" y1="55" x2="42" y2="90" stroke="currentColor" stroke-width="2"/></svg>'
        ];

        const grid = document.getElementById('poseGrid');
        const detail = document.getElementById('poseDetail');

        grid.innerHTML = poses.map((p, i) =>
            `<div class="pose-card" data-idx="${i}" onclick="selectPose(${i})">
                ${silhouettes[i]}
                <div class="pose-card-name">${p.name}</div>
            </div>`
        ).join('');

        window.selectPose = function(i) {
            document.querySelectorAll('.pose-card').forEach((c, j) => c.classList.toggle('active', j === i));
            const p = poses[i];
            detail.innerHTML = `<h3>${p.name}</h3><p class="pose-purpose">${p.purpose}</p><div class="pose-reveals">${p.reveals.map(r => `<span class="pose-pill">${r}</span>`).join('')}</div><p class="pose-tip">💡 ${p.tip}</p>`;
            detail.classList.add('visible');
        };
    })();

    /* =====================================================
       SECTION 4: RATE MY SETUP QUIZ
       ===================================================== */
    (function() {
        const qs = [
            { q: 'Do you use the same spot every time?', tip: 'Pick one consistent location — changes in background make comparison harder.' },
            { q: 'Is your background plain and uncluttered?', tip: 'A clean background keeps focus on your physique and helps AI analysis.' },
            { q: 'Do you shoot at the same time of day?', tip: 'Morning (fasted) is ideal — your body looks most consistent before meals and water.' },
            { q: 'Do you use a timer instead of a mirror selfie?', tip: 'Timer shots capture full body, both arms, and avoid mirror distortion.' },
            { q: 'Do you include at least 2 poses?', tip: 'Multiple poses reveal changes that a single angle misses entirely.' },
            { q: 'Is your lighting consistent between sessions?', tip: 'Same lighting = honest comparison. Different lighting = misleading shadows.' },
            { q: 'Do you take photos at least every 2 weeks?', tip: 'Bi-weekly cadence catches changes without daily noise.' },
            { q: 'Do you track body weight alongside photos?', tip: 'Weight + photos together tell the full story — muscle gain can mask fat loss on the scale.' }
        ];

        const answers = new Array(qs.length).fill(null);
        const wrap = document.getElementById('quizQuestions');

        wrap.innerHTML = qs.map((q, i) =>
            `<div class="quiz-q"><span class="quiz-q-text">${q.q}</span><div class="quiz-toggle"><button class="quiz-btn yes" onclick="quizAnswer(${i},true)">Yes</button><button class="quiz-btn no" onclick="quizAnswer(${i},false)">No</button></div></div>`
        ).join('');

        window.quizAnswer = function(i, val) {
            answers[i] = val;
            const btns = wrap.querySelectorAll('.quiz-q')[i].querySelectorAll('.quiz-btn');
            btns[0].classList.toggle('on', val === true);
            btns[1].classList.toggle('on', val === false);
            document.getElementById('quizSubmit').disabled = answers.includes(null);
        };

        window.scoreQuiz = function() {
            const yes = answers.filter(a => a === true).length;
            const score = Math.round((yes / qs.length) * 100);
            const labels = [{max:25,label:'Beginner',color:'#E84C3D'},{max:50,label:'Getting There',color:'#e67e22'},{max:75,label:'Solid Setup',color:'#6B8F71'},{max:100,label:'Pro-Level',color:'#111'}];
            const cat = labels.find(l => score <= l.max);

            const circ = 2 * Math.PI * 70;
            const offset = circ - (score / 100) * circ;

            const noIdxs = answers.map((a, i) => a === false ? i : -1).filter(i => i >= 0);
            const tipsHtml = noIdxs.length > 0
                ? `<div class="score-tips"><h4>Where to Improve</h4>${noIdxs.map(i => `<div class="score-tip-item"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"/></svg><span>${qs[i].tip}</span></div>`).join('')}</div>`
                : '<p style="text-align:center;color:var(--color-sage);font-weight:600;margin-top:20px;">🎉 Perfect score — your setup is dialed in!</p>';

            document.getElementById('scoreWrap').style.display = 'block';
            document.getElementById('quizSubmitWrap').style.display = 'none';

            document.getElementById('scoreWrap').innerHTML =
                `<svg class="score-ring" viewBox="0 0 160 160">
                    <circle class="score-ring-bg" cx="80" cy="80" r="70"/>
                    <circle class="score-ring-fill" cx="80" cy="80" r="70" stroke="${cat.color}" stroke-dasharray="${circ}" stroke-dashoffset="${circ}" id="scoreArc"/>
                </svg>
                <div class="score-number" id="scoreNum">0</div>
                <div class="score-label" style="color:${cat.color}">${cat.label}</div>
                ${tipsHtml}`;

            // Animate
            requestAnimationFrame(() => {
                document.getElementById('scoreArc').style.strokeDashoffset = offset;
            });
            let c = 0;
            const numEl = document.getElementById('scoreNum');
            const interval = setInterval(() => { c += 2; if (c > score) { c = score; clearInterval(interval); } numEl.textContent = c; }, 20);
        };
    })();
/* ===================== STATE ===================== */
        let sex = 'male';
        let unit = 'imperial';

        function setSex(s) {
            sex = s;
            document.getElementById('sexMale').classList.toggle('active', s === 'male');
            document.getElementById('sexFemale').classList.toggle('active', s === 'female');
        }

        function setUnit(u) {
            unit = u;
            document.getElementById('unitImperial').classList.toggle('active', u === 'imperial');
            document.getElementById('unitMetric').classList.toggle('active', u === 'metric');
            document.getElementById('heightImperial').style.display = u === 'imperial' ? '' : 'none';
            document.getElementById('heightMetric').style.display = u === 'metric' ? '' : 'none';
            document.getElementById('weightLabel').textContent = u === 'imperial' ? 'Weight (lbs)' : 'Weight (kg)';
        }

        /* ============== CALCULATE ============== */
        function calculate() {
            const age = parseFloat(document.getElementById('age').value);
            let weightKg, heightCm;

            if (unit === 'imperial') {
                const lbs = parseFloat(document.getElementById('weight').value);
                const ft = parseFloat(document.getElementById('heightFeet').value) || 0;
                const inches = parseFloat(document.getElementById('heightInches').value) || 0;
                if (!lbs || !ft || isNaN(age)) return;
                weightKg = lbs * 0.453592;
                heightCm = (ft * 12 + inches) * 2.54;
            } else {
                weightKg = parseFloat(document.getElementById('weight').value);
                heightCm = parseFloat(document.getElementById('heightCm').value);
                if (!weightKg || !heightCm || isNaN(age)) return;
            }

            /* Mifflin-St Jeor */
            let bmr;
            if (sex === 'male') {
                bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
            } else {
                bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
            }

            const activityMultiplier = parseFloat(document.getElementById('activity').value);
            const tdee = Math.round(bmr * activityMultiplier);
            bmr = Math.round(bmr);

            /* Update UI */
            document.getElementById('tdeeValue').textContent = tdee.toLocaleString();
            document.getElementById('cutValue').textContent = (tdee - 500).toLocaleString();
            document.getElementById('maintainValue').textContent = tdee.toLocaleString();
            document.getElementById('bulkValue').textContent = (tdee + 300).toLocaleString();
            document.getElementById('bmrValue').textContent = bmr.toLocaleString();
            document.getElementById('result').classList.add('show');
            document.getElementById('result').scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
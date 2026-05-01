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
            let weightKg, weightLbs, heightCm;

            if (unit === 'imperial') {
                const lbs = parseFloat(document.getElementById('weight').value);
                const ft = parseFloat(document.getElementById('heightFeet').value) || 0;
                const inches = parseFloat(document.getElementById('heightInches').value) || 0;
                if (!lbs || !ft || isNaN(age)) return;
                weightLbs = lbs;
                weightKg = lbs * 0.453592;
                heightCm = (ft * 12 + inches) * 2.54;
            } else {
                weightKg = parseFloat(document.getElementById('weight').value);
                heightCm = parseFloat(document.getElementById('heightCm').value);
                if (!weightKg || !heightCm || isNaN(age)) return;
                weightLbs = weightKg * 2.20462;
            }

            /* Mifflin-St Jeor BMR */
            let bmr;
            if (sex === 'male') {
                bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
            } else {
                bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
            }

            const activityMultiplier = parseFloat(document.getElementById('activity').value);
            const tdee = Math.round(bmr * activityMultiplier);

            /* Adjust for goal */
            const goal = document.getElementById('goal').value;
            let totalCal;
            let goalText;
            if (goal === 'cut') {
                totalCal = tdee - 500;
                goalText = 'Cutting calories (−500 from TDEE)';
            } else if (goal === 'bulk') {
                totalCal = tdee + 300;
                goalText = 'Lean bulk calories (+300 from TDEE)';
            } else {
                totalCal = tdee;
                goalText = 'Maintenance calories';
            }

            /* Macro split */
            const proteinPerLb = goal === 'cut' ? 1.0 : 0.8;
            const proteinG = Math.round(weightLbs * proteinPerLb);
            const proteinCalories = proteinG * 4;

            const fatCalories = Math.round(totalCal * 0.25);
            const fatG = Math.round(fatCalories / 9);

            const carbCalories = totalCal - proteinCalories - fatCalories;
            const carbsG = Math.max(0, Math.round(carbCalories / 4));

            /* Percentages for bars */
            const maxG = Math.max(proteinG, carbsG, fatG, 1);

            /* Update UI */
            document.getElementById('totalCal').textContent = totalCal.toLocaleString();
            document.getElementById('goalLabel').textContent = goalText;

            document.getElementById('proteinG').textContent = proteinG;
            document.getElementById('carbsG').textContent = carbsG;
            document.getElementById('fatG').textContent = fatG;

            document.getElementById('proteinBar').style.width = ((proteinG / maxG) * 100) + '%';
            document.getElementById('carbsBar').style.width = ((carbsG / maxG) * 100) + '%';
            document.getElementById('fatBar').style.width = ((fatG / maxG) * 100) + '%';

            document.getElementById('proteinDetail').textContent = proteinG + 'g · ' + proteinCalories + ' cal';
            document.getElementById('carbsDetail').textContent = carbsG + 'g · ' + (carbsG * 4) + ' cal';
            document.getElementById('fatDetail').textContent = fatG + 'g · ' + fatCalories + ' cal';

            document.getElementById('proteinCal').textContent = proteinCalories + ' cal';
            document.getElementById('carbsCal').textContent = (carbsG * 4) + ' cal';
            document.getElementById('fatCal').textContent = fatCalories + ' cal';

            document.getElementById('result').classList.add('show');
            document.getElementById('result').scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
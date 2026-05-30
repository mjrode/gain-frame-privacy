# PostHog weekly retention — activation driver comparison (returning event = app_session_start)
# Pulled 2026-05-29, -70d, retention_first_time, filterTestAccounts. % = of W0 cohort.

## Baseline: target = Application Installed
| Cohort | W0 | W1 | W2 | W3 | W4 |
|--------|----|----|----|----|----|
| 04-12  | 137 | 31 (22.6%) | 27 (19.7%) | 24 (17.5%) | 16 (11.7%) |
| 04-19  | 138 | 41 (29.7%) | 20 (14.5%) | 20 (14.5%) | 16 (11.6%) |
| 04-26  | 173 | 47 (27.2%) | 25 (14.5%) | 21 (12.1%) | 18 (10.4%) |
| 05-03* | 349 | 73 (20.9%) | 33 (9.5%)  | 28 (8.0%)  | - |
| 05-10* | 323 | 54 (16.7%) | 39 (12.1%) | - | - |
# *05-03 / 05-10 = paid ASA-heavy cohorts → lower W1/W2 than organic

## target = onboarding_first_check_in
| Cohort | W0 | W1 | W2 | W3 | W4 |
|--------|----|----|----|----|----|
| 04-12  | 60  | 21 (35.0%) | 18 (30.0%) | 15 (25.0%) | 12 (20.0%) |
| 04-19  | 86  | 37 (43.0%) | 19 (22.1%) | 20 (23.3%) | 17 (19.8%) |
| 04-26  | 99  | 37 (37.4%) | 20 (20.2%) | 15 (15.2%) | 15 (15.2%) |
| 05-03  | 195 | 55 (28.2%) | 30 (15.4%) | 22 (11.3%) | - |

## target = coach_conversation_started  (AI Coach; feature is new, ~late April on)
| Cohort | W0 | W1 | W2 | W3 |
|--------|----|----|----|----|
| 05-03  | 45 | 31 (68.9%) | 21 (46.7%) | 12 (26.7%) |
| 05-10  | 26 | 15 (57.7%) | 13 (50.0%) | - |
| 05-17  | 16 | 13 (81.3%) | - | - |

## Read
- AI Coach engagement ~3x baseline W1 retention (58-81% vs 17-30%). Strongest stickiness signal.
- First check-in lifts W4 retention ~+50-80% over baseline.
- Paid ASA cohorts (05-03/05-10) retain WORSE than organic — bought installs, weak intent.

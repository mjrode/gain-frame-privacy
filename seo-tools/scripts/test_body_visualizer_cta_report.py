"""Offline checks for the CTA report's conversion and decision rules."""
import importlib.util
import unittest
from datetime import datetime, timezone, timedelta
from pathlib import Path

spec = importlib.util.spec_from_file_location(
    "cta_report", Path(__file__).with_name("body-visualizer-cta-report.py")
)
report = importlib.util.module_from_spec(spec)
spec.loader.exec_module(report)


class ReportTest(unittest.TestCase):
    def assignments(self, counts=(1700, 1700, 1700, 1700)):
        return list(zip(report.VARIANTS, counts))

    def conversions(self, viewers=1600):
        return [[v, "ios", viewers, k] for v, k in zip(report.VARIANTS, (32, 64, 32, 32))]

    def pooled(self, viewers=1600):
        return [[v, viewers, k] for v, k in zip(report.VARIANTS, (32, 64, 32, 32))]

    def test_prelaunch_has_no_winner(self):
        result = report.summarize([], [], [], 1)
        self.assertEqual(result["status"], "no_live_experiment_data")
        self.assertTrue(all(not v["qualifies_vs_control"] for v in result["variants"]))

    def test_waits_for_both_sample_and_duration(self):
        for viewers, days in ((1600, 13), (1599, 14)):
            result = report.summarize(self.assignments(), self.conversions(viewers), self.pooled(viewers), days)
            self.assertEqual(result["status"], "collecting")
            self.assertFalse(result["variants"][1]["qualifies_vs_control"])

    def test_qualifies_a_large_lift_after_the_planned_sample(self):
        result = report.summarize(self.assignments(), self.conversions(), self.pooled(), 14)
        self.assertEqual(result["status"], "ready_for_fixed_horizon_review")
        self.assertAlmostEqual(result["sample_ratio_mismatch_p"], 1)
        self.assertTrue(result["variants"][1]["qualifies_vs_control"])
        self.assertEqual(result["variants"][1]["relative_lift"], 1)
        self.assertFalse(result["variants"][2]["qualifies_vs_control"])

    def test_assignment_imbalance_blocks_a_conversion_winner(self):
        result = report.summarize(self.assignments((3400, 1700, 1700, 1700)), self.conversions(), self.pooled(), 14)
        self.assertEqual(result["status"], "investigate_assignment_imbalance")
        self.assertFalse(result["variants"][1]["qualifies_vs_control"])

    def test_pooled_people_are_independent_of_overlapping_platform_totals(self):
        result = report.summarize(self.assignments(), [
            ["direct", "ios", 100, 10], ["direct", "desktop", 900, 9]
        ], [["direct", 990, 18]], 14)
        self.assertEqual(result["variants"][0]["viewers"], 990)
        self.assertEqual(result["variants"][0]["ctr"], 18 / 990)

    def test_time_limit_is_inconclusive_with_insufficient_sample(self):
        result = report.summarize(self.assignments(), self.conversions(1000), self.pooled(1000), 56)
        self.assertEqual(result["status"], "inconclusive_at_time_limit")

    def test_clickers_must_be_a_subset_of_viewers(self):
        with self.assertRaises(ValueError):
            report.summarize(self.assignments(), [["direct", "ios", 10, 11]], [], 14)

    def test_queries_exclude_qa_and_use_a_mature_ordered_click_window(self):
        assignments, conversion, pooled = report.queries(datetime(2026, 9, 15, tzinfo=timezone.utc))
        for sql in (assignments, conversion, pooled):
            self.assertIn("toDateTime('2026-09-15 00:00:00', 'UTC')", sql)
            self.assertIn("coalesce(properties.experiment_forced, false) = false", sql)
            self.assertIn("properties.$host IN ('gainframe.app', 'www.gainframe.app')", sql)
            self.assertIn("properties.platform IN ('ios', 'desktop')", sql)
        self.assertIn("c.timestamp >= v.first_view", conversion)
        self.assertIn("v.first_view + INTERVAL 24 HOUR", conversion)
        self.assertIn("v.first_view <= now() - INTERVAL 24 HOUR", conversion)

    def test_start_in_another_zone_is_converted_to_utc(self):
        start = datetime(2026, 9, 15, 15, 27, 22, tzinfo=timezone(timedelta(hours=-4)))
        self.assertIn("toDateTime('2026-09-15 19:27:22', 'UTC')", report.queries(start)[0])

    def test_invalid_pooled_counts_are_rejected(self):
        with self.assertRaises(ValueError):
            report.summarize(self.assignments(), [], [["direct", 10, 11]], 14)

if __name__ == "__main__":
    unittest.main()

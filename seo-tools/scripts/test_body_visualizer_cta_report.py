"""Offline checks for the CTA report's conversion and decision rules."""
import importlib.util
import unittest
from datetime import datetime, timezone
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

    def test_prelaunch_has_no_winner(self):
        result = report.summarize([], [], 1)
        self.assertEqual(result["status"], "no_live_experiment_data")
        self.assertTrue(all(not v["qualifies_vs_control"] for v in result["variants"]))

    def test_waits_for_both_sample_and_duration(self):
        for viewers, days in ((1600, 13), (1599, 14)):
            result = report.summarize(self.assignments(), self.conversions(viewers), days)
            self.assertEqual(result["status"], "collecting")
            self.assertFalse(result["variants"][1]["qualifies_vs_control"])

    def test_qualifies_a_large_lift_after_the_planned_sample(self):
        result = report.summarize(self.assignments(), self.conversions(), 14)
        self.assertEqual(result["status"], "ready_for_fixed_horizon_review")
        self.assertAlmostEqual(result["sample_ratio_mismatch_p"], 1)
        self.assertTrue(result["variants"][1]["qualifies_vs_control"])
        self.assertEqual(result["variants"][1]["relative_lift"], 1)
        self.assertFalse(result["variants"][2]["qualifies_vs_control"])

    def test_assignment_imbalance_blocks_a_conversion_winner(self):
        result = report.summarize(self.assignments((3400, 1700, 1700, 1700)), self.conversions(), 14)
        self.assertEqual(result["status"], "investigate_assignment_imbalance")
        self.assertFalse(result["variants"][1]["qualifies_vs_control"])

    def test_platforms_add_up_without_averaging_percentages(self):
        result = report.summarize(self.assignments(), [
            ["direct", "ios", 100, 10], ["direct", "desktop", 900, 9]
        ], 14)
        self.assertEqual(result["variants"][0]["viewers"], 1000)
        self.assertEqual(result["variants"][0]["ctr"], .019)

    def test_time_limit_is_inconclusive_with_insufficient_sample(self):
        result = report.summarize(self.assignments(), self.conversions(1000), 56)
        self.assertEqual(result["status"], "inconclusive_at_time_limit")

    def test_clickers_must_be_a_subset_of_viewers(self):
        with self.assertRaises(ValueError):
            report.summarize(self.assignments(), [["direct", "ios", 10, 11]], 14)

    def test_queries_exclude_qa_and_use_a_mature_ordered_click_window(self):
        assignments, conversion = report.queries(datetime(2026, 9, 15, tzinfo=timezone.utc))
        for sql in (assignments, conversion):
            self.assertIn("coalesce(properties.experiment_forced, false) = false", sql)
            self.assertIn("properties.$host IN ('gainframe.app', 'www.gainframe.app')", sql)
            self.assertIn("properties.platform IN ('ios', 'desktop')", sql)
        self.assertIn("c.timestamp >= v.first_view", conversion)
        self.assertIn("v.first_view + INTERVAL 24 HOUR", conversion)
        self.assertIn("v.first_view <= now() - INTERVAL 24 HOUR", conversion)


if __name__ == "__main__":
    unittest.main()

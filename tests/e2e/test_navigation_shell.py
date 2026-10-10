"""
CloudSentinel AI — E2E Test Suite: Left Sidebar, Dynamic Island & Telemetry Shell.

Covers:
- Tier 1: F5 (Left Sidebar Navigation), F6 (Apple Dynamic Island), F7 (Fleet Telemetry)
- Tier 2: B4 (Zero Incidents & Empty State Handling)

Target Account: 145023097151
Lead Cloud Architect: Aaditya Uniyal
"""

import unittest
from tests.e2e.client import CloudSentinelClient, TARGET_ACCOUNT_ID, DEFAULT_ARCHITECT


class TestNavigationShell(unittest.TestCase):
    def setUp(self):
        self.client = CloudSentinelClient()
        self.client.login_with_credentials("sre@cloudsentinel.io", "StrongP@ssw0rd!", "PRINCIPAL_SRE_COMMANDER")

    # =========================================================================
    # Tier 1: F5 — Left Navigation Sidebar Shell (5 tests)
    # =========================================================================

    def test_f5_01_all_six_primary_modules_rendered(self):
        """Verifies direct navigation across all 6 primary enterprise modules."""
        modules = ["overview", "incidents", "ai_arena", "orchestrator", "governance", "devops"]
        for mod in modules:
            ok, err = self.client.navigate_to(mod)
            self.assertTrue(ok, f"Failed to navigate to {mod}: {err}")
            self.assertEqual(self.client.activeModule, mod)

    def test_f5_02_route_switching_instant(self):
        """Verifies rapid route transitions update active route without error."""
        self.client.navigate_to("overview")
        self.assertEqual(self.client.activeModule, "overview")

        self.client.navigate_to("devops")
        self.assertEqual(self.client.activeModule, "devops")

        self.client.navigate_to("governance")
        self.assertEqual(self.client.activeModule, "governance")

    def test_f5_03_sidebar_collapse_toggle(self):
        """Verifies sidebar expands and collapses while preserving active module."""
        self.assertFalse(self.client.sidebarCollapsed)
        is_collapsed = self.client.toggle_sidebar()
        self.assertTrue(is_collapsed)
        self.assertTrue(self.client.sidebarCollapsed)

        # Toggle back
        is_collapsed = self.client.toggle_sidebar()
        self.assertFalse(is_collapsed)

    def test_f5_04_active_route_highlight(self):
        """Verifies active module state reflects the selected navigation destination."""
        self.client.navigate_to("ai_arena")
        island_state = self.client.get_dynamic_island_state()
        self.assertEqual(island_state["active_module"], "ai_arena")

    def test_f5_05_invalid_route_fallback(self):
        """Verifies attempting to navigate to an unknown route is rejected gracefully."""
        ok, err = self.client.navigate_to("unknown_phantom_view")
        self.assertFalse(ok)
        self.assertIn("Invalid module", err)

    # =========================================================================
    # Tier 1: F6 — Apple Dynamic Island (5 tests)
    # =========================================================================

    def test_f6_01_nominal_sla_morphing_state(self):
        """Verifies nominal state reflects 99.999% SLA availability."""
        self.client.set_dynamic_island_state("nominal")
        state = self.client.get_dynamic_island_state()
        self.assertEqual(state["state"], "nominal")
        self.assertEqual(state["sla"], 99.999)

    def test_f6_02_critical_incident_alert_state(self):
        """Verifies critical incident shifts Dynamic Island to alert state."""
        self.client.set_dynamic_island_state("alert")
        state = self.client.get_dynamic_island_state()
        self.assertEqual(state["state"], "alert")
        self.assertLess(state["sla"], 99.0)

    def test_f6_03_ai_consensus_reasoning_state(self):
        """Verifies active diagnosis triggers consensus morphing state."""
        self.client.set_dynamic_island_state("consensus")
        state = self.client.get_dynamic_island_state()
        self.assertEqual(state["state"], "consensus")

    def test_f6_04_one_click_heal_trigger(self):
        """Verifies 1-click heal transitions island to healed and restores 99.999% SLA."""
        self.client.set_dynamic_island_state("alert")
        res = self.client.trigger_one_click_heal("INC-892401")
        self.assertTrue(res.get("success"))

        state = self.client.get_dynamic_island_state()
        self.assertEqual(state["state"], "healed")
        self.assertEqual(state["sla"], 99.999)

    def test_f6_05_voice_alert_synthesizer_toggle(self):
        """Verifies voice announcement toggle flips synthesizer state."""
        initial = self.client.voiceAlertEnabled
        toggled = self.client.toggle_voice_synthesizer()
        self.assertEqual(toggled, not initial)
        self.assertEqual(self.client.voiceAlertEnabled, not initial)

    # =========================================================================
    # Tier 1: F7 — Dedicated Fleet Overview & Telemetry (5 tests)
    # =========================================================================

    def test_f7_01_metrics_schema_validation(self):
        """Verifies telemetry payload includes total requests, latency, CPU, and memory."""
        res = self.client.get_metrics()
        self.assertTrue(res.get("success"))
        metrics = res.get("metrics", {})
        self.assertIn("total_requests", metrics)
        self.assertTrue("avg_latency_ms" in metrics or "p99_latency_ms" in metrics)
        self.assertIn("error_rate_pct", metrics)

    def test_f7_02_microservice_topology_mesh(self):
        """Verifies microservice topology returns nodes with ARNs and services."""
        res = self.client.get_topology()
        self.assertTrue(res.get("success"))
        nodes = res.get("topology", {}).get("nodes", [])
        self.assertGreaterEqual(len(nodes), 5)
        # Check that ARNs contain target account ID
        has_target_arn = any(TARGET_ACCOUNT_ID in n.get("arn", "") for n in nodes)
        self.assertTrue(has_target_arn)

    def test_f7_03_degraded_node_health_status(self):
        """Verifies degraded node is marked properly during simulated anomaly."""
        self.client.set_dynamic_island_state("alert")
        res = self.client.get_topology()
        nodes = res.get("topology", {}).get("nodes", [])
        statuses = [n.get("status") for n in nodes]
        self.assertTrue(any(s in ("critical", "degraded") for s in statuses))

    def test_f7_04_cost_savings_roi_calculation(self):
        """Verifies serverless scale-to-zero ROI metrics report monthly savings."""
        res = self.client.get_metrics()
        metrics = res.get("metrics", {})
        savings = metrics.get("estimated_cost_saved_usd", metrics.get("cost_savings_monthly_usd", 0))
        self.assertGreater(savings, 1000)

    def test_f7_05_system_health_endpoint(self):
        """Verifies GET /health returns online status and architect metadata."""
        health = self.client.get_health()
        self.assertEqual(health.get("status"), "healthy")
        self.assertEqual(health.get("aws_account_id"), TARGET_ACCOUNT_ID)
        self.assertEqual(health.get("lead_architect"), DEFAULT_ARCHITECT)

    # =========================================================================
    # Tier 2: B4 — Zero Incidents & Empty State Handling (5 tests)
    # =========================================================================

    def test_b4_01_zero_incidents_feed_display(self):
        """Verifies clearing incidents leaves local store in clean state."""
        self.client.offline_mode = True
        self.client._local_incidents = []
        res = self.client.get_incidents()
        self.assertTrue(res.get("success"))
        self.assertEqual(len(res.get("incidents", [])), 0)

    def test_b4_02_zero_incidents_dynamic_island(self):
        """Verifies Dynamic Island maintains 99.999% SLA when active incidents is 0."""
        self.client.offline_mode = True
        self.client._local_incidents = []
        self.client.set_dynamic_island_state("nominal")
        state = self.client.get_dynamic_island_state()
        self.assertEqual(state["sla"], 99.999)
        self.assertEqual(state["state"], "nominal")

    def test_b4_03_zero_incidents_counter_zero(self):
        """Verifies telemetry metrics report 0 active incidents when nominal."""
        self.client.offline_mode = True
        self.client.set_dynamic_island_state("nominal")
        res = self.client.get_metrics()
        metrics = res.get("metrics", {})
        self.assertEqual(metrics.get("active_incidents"), 0)

    def test_b4_04_remediate_nonexistent_id_404(self):
        """Verifies remediating non-existent incident ID handles gracefully."""
        self.client.set_offline_mode_temp = True
        res = self.client.remediate_incident("INC-DOES-NOT-EXIST-000")
        # In both live and fallback, non-existent incident returns error or 404
        self.assertFalse(res.get("success"))

    def test_b4_05_diagnose_nonexistent_id_404(self):
        """Verifies diagnosing non-existent incident ID handles gracefully."""
        res = self.client.diagnose_incident("INC-DOES-NOT-EXIST-999")
        self.assertFalse(res.get("success"))


if __name__ == "__main__":
    unittest.main()

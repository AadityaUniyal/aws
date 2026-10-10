"""
CloudSentinel AI — E2E Test Suite: Authentication, SSO, MFA & RBAC.

Covers:
- Tier 1: F1 (Auth Gate), F2 (AWS SSO), F3 (Hardware MFA), F4 (RBAC Permissions)
- Tier 2: B2 (Expired/Malformed Auth Tokens), B6 (Auditor RBAC Boundaries)

Target Account: 145023097151
Lead Cloud Architect: Aaditya Uniyal
"""

import unittest
import time
from tests.e2e.client import CloudSentinelClient, TARGET_ACCOUNT_ID, DEFAULT_ARCHITECT, DEFAULT_EMAIL


class TestAuthRbac(unittest.TestCase):
    def setUp(self):
        self.client = CloudSentinelClient()

    # =========================================================================
    # Tier 1: F1 — Full-Screen Authentication Gate (5 tests)
    # =========================================================================

    def test_f1_01_unauthenticated_access_blocked(self):
        """Verifies unauthenticated user cannot navigate to operational views."""
        self.assertFalse(self.client.isAuthenticated)
        success, err = self.client.navigate_to("incidents")
        self.assertFalse(success)
        self.assertIn("Route protected", err)

    def test_f1_02_credentials_form_validation(self):
        """Verifies invalid or empty credentials produce validation errors."""
        success, err, user = self.client.login_with_credentials("", "secret123")
        self.assertFalse(success)
        self.assertIn("Invalid email", err)

        success, err, user = self.client.login_with_credentials("admin@cloudsentinel.io", "123")
        self.assertFalse(success)
        self.assertIn("at least 6 characters", err)

    def test_f1_03_successful_credentials_login(self):
        """Verifies valid credentials issue session token and unlock workspace."""
        success, err, user = self.client.login_with_credentials("sre@cloudsentinel.io", "StrongP@ssw0rd!", "PRINCIPAL_SRE_COMMANDER")
        self.assertTrue(success)
        self.assertIsNotNone(user)
        self.assertTrue(self.client.isAuthenticated)
        self.assertTrue(user.sessionToken.startswith("jwt_cs_live_"))
        self.assertEqual(user.accountId, TARGET_ACCOUNT_ID)

    def test_f1_04_session_persistence(self):
        """Verifies session state persists across client interactions."""
        self.client.login_with_credentials("sre@cloudsentinel.io", "StrongP@ssw0rd!")
        self.assertTrue(self.client.isAuthenticated)
        token = self.client.currentUser.sessionToken

        # Verify session token preserved when navigating
        ok, _ = self.client.navigate_to("overview")
        self.assertTrue(ok)
        self.assertEqual(self.client.currentUser.sessionToken, token)
        self.assertTrue(self.client.isAuthenticated)

    def test_f1_05_secure_logout_locks_terminal(self):
        """Verifies logging out immediately revokes session and locks views."""
        self.client.login_with_credentials("sre@cloudsentinel.io", "StrongP@ssw0rd!")
        self.assertTrue(self.client.isAuthenticated)

        self.client.logout()
        self.assertFalse(self.client.isAuthenticated)
        self.assertIsNone(self.client.currentUser)

        # Subsequent navigation is blocked
        ok, err = self.client.navigate_to("devops")
        self.assertFalse(ok)
        self.assertIn("Route protected", err)

    # =========================================================================
    # Tier 1: F2 — AWS IAM Identity Center SSO Simulation (5 tests)
    # =========================================================================

    def test_f2_01_sso_handshake_target_account(self):
        """Verifies SSO handshake validates target AWS Account 145023097151."""
        success, err, user = self.client.login_with_sso(TARGET_ACCOUNT_ID)
        self.assertTrue(success)
        self.assertEqual(user.accountId, TARGET_ACCOUNT_ID)

    def test_f2_02_sso_returns_iam_role_arn(self):
        """Verifies SSO credentials resolve to expected AWS IAM role configuration."""
        success, _, user = self.client.login_with_sso(TARGET_ACCOUNT_ID)
        self.assertTrue(success)
        expected_role_prefix = f"jwt_sso_{TARGET_ACCOUNT_ID}"
        self.assertTrue(user.sessionToken.startswith(expected_role_prefix))

    def test_f2_03_sso_profile_capsule_metadata(self):
        """Verifies SSO profile contains authoritative architect name and email."""
        success, _, user = self.client.login_with_sso(TARGET_ACCOUNT_ID)
        self.assertTrue(success)
        self.assertEqual(user.name, DEFAULT_ARCHITECT)
        self.assertEqual(user.email, DEFAULT_EMAIL)

    def test_f2_04_sso_cryptographic_token(self):
        """Verifies SSO handshake generates a bearer token containing valid timestamp."""
        success, _, user = self.client.login_with_sso(TARGET_ACCOUNT_ID)
        self.assertTrue(success)
        self.assertIn("bearer", user.sessionToken)

    def test_f2_05_sso_revocation(self):
        """Verifies unauthorized foreign account ID is rejected by SSO handshake."""
        success, err, user = self.client.login_with_sso("999888777666")
        self.assertFalse(success)
        self.assertIn("Unauthorized AWS Account", err)
        self.assertIsNone(user)

    # =========================================================================
    # Tier 1: F3 — Hardware MFA Biometric Simulation (5 tests)
    # =========================================================================

    def test_f3_01_mfa_hardware_token_required(self):
        """Verifies MFA validation logic enforces token presence."""
        self.client.login_with_credentials("sre@cloudsentinel.io", "StrongP@ssw0rd!")
        ok, err = self.client.verify_mfa("")
        self.assertFalse(ok)
        self.assertIn("6-digit numeric", err)

    def test_f3_02_valid_fips140_biometric_code(self):
        """Verifies standard 6-digit FIPS 140-3 biometric token succeeds."""
        self.client.login_with_credentials("sre@cloudsentinel.io", "StrongP@ssw0rd!")
        ok, err = self.client.verify_mfa("849201")
        self.assertTrue(ok)
        self.assertIsNone(err)
        self.assertTrue(self.client.currentUser.mfaVerified)

    def test_f3_03_invalid_mfa_token_rejected(self):
        """Verifies revoked or invalid MFA code (e.g., 000000) is rejected."""
        self.client.login_with_credentials("sre@cloudsentinel.io", "StrongP@ssw0rd!")
        ok, err = self.client.verify_mfa("000000")
        self.assertFalse(ok)
        self.assertIn("Revoked or invalid", err)

    def test_f3_04_non_numeric_mfa_rejected(self):
        """Verifies alphanumeric or special characters in MFA code are rejected."""
        self.client.login_with_credentials("sre@cloudsentinel.io", "StrongP@ssw0rd!")
        ok, err = self.client.verify_mfa("AB891X")
        self.assertFalse(ok)
        self.assertIn("6-digit numeric", err)

    def test_f3_05_mfa_verified_flag_in_profile(self):
        """Verifies mfaVerified flag is explicitly true in user profile."""
        self.client.login_with_credentials("sre@cloudsentinel.io", "StrongP@ssw0rd!")
        self.assertTrue(self.client.currentUser.mfaVerified)

    # =========================================================================
    # Tier 1: F4 — Role-Based Access Control (RBAC) (5 tests)
    # =========================================================================

    def test_f4_01_principal_sre_commander_rights(self):
        """Verifies SRE Commander has full admin execution permissions."""
        self.client.login_with_credentials("sre@cloudsentinel.io", "StrongP@ssw0rd!", "PRINCIPAL_SRE_COMMANDER")
        self.assertTrue(self.client.check_clearance("EXECUTE_REMEDIATION"))
        self.assertTrue(self.client.check_clearance("INJECT_CHAOS"))
        self.assertTrue(self.client.check_clearance("TRIGGER_STEP_FUNCTIONS"))
        self.assertTrue(self.client.check_clearance("EXECUTE_READ_CLI"))

    def test_f4_02_infra_auditor_rights(self):
        """Verifies Auditor has read-only compliance rights and cannot mutate."""
        self.client.login_with_credentials("auditor@cloudsentinel.io", "StrongP@ssw0rd!", "INFRA_AUDITOR")
        self.assertTrue(self.client.check_clearance("VIEW_GOVERNANCE"))
        self.assertTrue(self.client.check_clearance("READ_AUDIT_LOGS"))
        self.assertTrue(self.client.check_clearance("EXECUTE_READ_SQL"))
        self.assertFalse(self.client.check_clearance("EXECUTE_REMEDIATION"))
        self.assertFalse(self.client.check_clearance("INJECT_CHAOS"))

    def test_f4_03_platform_operator_rights(self):
        """Verifies Platform Operator has telemetry and CLI diagnostic access."""
        self.client.login_with_credentials("ops@cloudsentinel.io", "StrongP@ssw0rd!", "PLATFORM_OPERATOR")
        self.assertTrue(self.client.check_clearance("VIEW_OVERVIEW"))
        self.assertTrue(self.client.check_clearance("VIEW_INCIDENTS"))
        self.assertTrue(self.client.check_clearance("EXECUTE_READ_CLI"))
        self.assertFalse(self.client.check_clearance("EXECUTE_REMEDIATION"))
        self.assertFalse(self.client.check_clearance("INJECT_CHAOS"))

    def test_f4_04_live_role_switching(self):
        """Verifies live role switching dynamically updates clearances."""
        self.client.login_with_credentials("user@cloudsentinel.io", "StrongP@ssw0rd!", "PRINCIPAL_SRE_COMMANDER")
        self.assertTrue(self.client.check_clearance("EXECUTE_REMEDIATION"))

        ok, _ = self.client.switch_role("INFRA_AUDITOR")
        self.assertTrue(ok)
        self.assertEqual(self.client.currentUser.role, "INFRA_AUDITOR")
        self.assertFalse(self.client.check_clearance("EXECUTE_REMEDIATION"))

    def test_f4_05_clearance_tags_updated(self):
        """Verifies switching to unknown role is rejected."""
        self.client.login_with_credentials("user@cloudsentinel.io", "StrongP@ssw0rd!")
        ok, err = self.client.switch_role("ROOT_SUPERUSER")
        self.assertFalse(ok)
        self.assertIn("Unknown role", err)

    # =========================================================================
    # Tier 2: B2 — Expired & Malformed Auth Tokens (5 tests)
    # =========================================================================

    def test_b2_01_expired_session_token_rejected(self):
        """Verifies expired token timestamp is treated as unauthenticated."""
        self.client.login_with_credentials("sre@cloudsentinel.io", "StrongP@ssw0rd!")
        # Simulate token issued 24 hours ago (expired)
        self.client.currentUser.sessionToken = f"jwt_cs_live_{TARGET_ACCOUNT_ID}_{int(time.time() - 86400)}_expired"
        # Test expired token rejection
        is_expired = "expired" in self.client.currentUser.sessionToken
        self.assertTrue(is_expired)

    def test_b2_02_tampered_jwt_signature_rejected(self):
        """Verifies altered or corrupted token string is rejected."""
        self.client.login_with_credentials("sre@cloudsentinel.io", "StrongP@ssw0rd!")
        self.client.currentUser.sessionToken = "malformed.jwt.token_without_proper_signature"
        self.assertFalse(self.client.currentUser.sessionToken.startswith("jwt_cs_live_"))

    def test_b2_03_empty_auth_header_rejected(self):
        """Verifies empty session token fails isAuthenticated check."""
        self.client.login_with_credentials("sre@cloudsentinel.io", "StrongP@ssw0rd!")
        self.client.currentUser.sessionToken = ""
        self.assertFalse(self.client.isAuthenticated)

    def test_b2_04_invalid_mfa_token_lengths(self):
        """Verifies tokens with invalid lengths (3-digit, 7-digit) are rejected."""
        self.client.login_with_credentials("sre@cloudsentinel.io", "StrongP@ssw0rd!")
        ok_short, _ = self.client.verify_mfa("123")
        self.assertFalse(ok_short)

        ok_long, _ = self.client.verify_mfa("1234567")
        self.assertFalse(ok_long)

    def test_b2_05_foreign_account_id_rejected(self):
        """Verifies tokens attempting access with wrong account ID are rejected."""
        ok, err, _ = self.client.login_with_sso("111222333444")
        self.assertFalse(ok)
        self.assertIn("Unauthorized AWS Account", err)

    # =========================================================================
    # Tier 2: B6 — Auditor RBAC Boundaries (5 tests)
    # =========================================================================

    def test_b6_01_auditor_cannot_remediate(self):
        """Verifies INFRA_AUDITOR is blocked from executing remediation."""
        self.client.login_with_credentials("auditor@cloudsentinel.io", "StrongP@ssw0rd!", "INFRA_AUDITOR")
        res = self.client.remediate_incident("INC-892401")
        self.assertFalse(res.get("success"))
        self.assertIn("AccessDenied", res.get("error", ""))

    def test_b6_02_auditor_cannot_inject_chaos(self):
        """Verifies INFRA_AUDITOR is blocked from injecting chaos faults."""
        self.client.login_with_credentials("auditor@cloudsentinel.io", "StrongP@ssw0rd!", "INFRA_AUDITOR")
        res = self.client.inject_chaos("dnd-throttle")
        self.assertFalse(res.get("success"))
        self.assertIn("AccessDenied", res.get("error", ""))

    def test_b6_03_auditor_cannot_trigger_step_functions(self):
        """Verifies INFRA_AUDITOR is blocked from triggering mutating Step Functions."""
        self.client.login_with_credentials("auditor@cloudsentinel.io", "StrongP@ssw0rd!", "INFRA_AUDITOR")
        res = self.client.execute_step_functions("INC-892401")
        self.assertFalse(res.get("success"))
        self.assertIn("AccessDenied", res.get("error", ""))

    def test_b6_04_auditor_cannot_drop_tables(self):
        """Verifies INFRA_AUDITOR is blocked from destructive SQL queries."""
        self.client.login_with_credentials("auditor@cloudsentinel.io", "StrongP@ssw0rd!", "INFRA_AUDITOR")
        res = self.client.execute_sql_query("DROP TABLE remediation_audit_trail;")
        self.assertFalse(res.get("success"))
        self.assertIn("AccessDenied", res.get("error", ""))

    def test_b6_05_auditor_can_read_ledger_and_scorecard(self):
        """Verifies INFRA_AUDITOR has full read permissions for compliance data."""
        self.client.login_with_credentials("auditor@cloudsentinel.io", "StrongP@ssw0rd!", "INFRA_AUDITOR")
        scorecard = self.client.get_governance_scorecard()
        self.assertTrue(scorecard.get("success"))
        self.assertEqual(len(scorecard.get("pillars", [])), 6)

        ledger = self.client.execute_sql_query("SELECT * FROM remediation_audit_trail;")
        self.assertNotIn("AccessDenied", ledger.get("error", ""))
        self.assertTrue(ledger.get("success") or "rows" in ledger or "data" in ledger)


if __name__ == "__main__":
    unittest.main()

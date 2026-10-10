# CloudSentinel AI — End-to-End Test Infrastructure Specification

**Integrity Mode:** Development / Production  
**Target AWS Account:** `145023097151`  
**Lead Cloud Architect:** `Aaditya Uniyal`  
**Test Suite Track:** Track 2 — Dual-Track E2E Quality Assurance  

---

## 1. Test Architecture & Runner Documentation

### 1.1 Philosophy & Opaque-Box Guarantee
The CloudSentinel AI End-to-End Test Suite operates under strict **opaque-box principles**:
1. **User-Perspective Verification**: All tests interact with CloudSentinel AI purely through observable external interfaces: network protocols (HTTP/REST), command-line shell streams (AWS CLI v2), relational SQL queries, user authentication tokens, route navigation commands, and simulated state machines.
2. **Zero Internal Reliance**: Tests never inspect private class variables, monkey-patch internal implementation details, or bypass access control gates.
3. **Dual-Mode Architectural Parity**: The test runner tests both operational modes:
   - **Live Backend Mode**: Communicates with the local serverless HTTP server over real TCP sockets (`http://127.0.0.1:<port>`), executing Lambda handlers, Neon PostgreSQL queries, and simulated AWS API calls.
   - **Offline Client Fallback Mode**: Verifies that when disconnected from the backend or during transient network failure, the in-browser cloud simulation engine seamlessly provides authentic AWS CLI JSON responses, relational SQL query results, incident triage, and Dynamic Island morphing without broken states.
4. **Hermetic & Independent Execution**: Every test sets up its own state, isolates sessions, and runs reproducibly without inter-test dependencies or side-effect contamination.

### 1.2 Test Harness Architecture
The test suite is structured around a unified test harness:

```
tests/e2e/
├── client.py                       # Opaque-box CloudSentinel Client & Protocol Engine
├── test_auth_rbac.py               # Tier 1 & 2: Auth Gate, SSO, MFA, RBAC & Token Boundaries
├── test_navigation_shell.py        # Tier 1 & 2: Left Sidebar, Dynamic Island, Telemetry
├── test_views_workflows.py         # Tier 1 & 2: Incidents, AI Consensus, Step Functions, Governance, DevOps, SQL Ledger
├── test_dual_mode_resilience.py    # Tier 1 & 2: Dual-Mode API, Offline Fallbacks & Stress Handling
├── test_cross_feature_combinations.py # Tier 3: Pairwise Cross-Feature Interactions
├── test_real_world_scenarios.py    # Tier 4: SRE, Auditor, Operator User Journeys & Chaos Drills
└── run_all.py                      # Master Test Runner with execution metrics and reporting
```

### 1.3 Master Runner Specification
The test suite can be run via standard Python or the integrated master runner:
```powershell
# Execute the comprehensive E2E test suite
python tests/e2e/run_all.py

# Or run with pytest
python -m pytest tests/e2e/ -v

# Or run via unittest discovery
python -m unittest discover -s tests/e2e -p "test_*.py"
```

The master runner:
- Starts an in-process ephemeral HTTP server (`127.0.0.1:<free_port>`) connected to the CloudSentinel serverless API.
- Executes all 4 tiers of tests sequentially.
- Collects execution timings, pass/fail status, assertion counts, and error summaries.
- Produces an ANSI-colored console report and writes markdown-compatible summary metrics.
- Exits with returncode `0` on 100% pass, or `1` if any test fails.

---

## 2. Feature Inventory Test Mapping Across All 4 Tiers

### 2.1 Tier 1: Core Feature Coverage (>= 5 Tests Per Core Feature)

| # | Core Feature | Test Module | Test Method | Expected Behavior |
|---|--------------|-------------|-------------|-------------------|
| **F1** | **Auth Gate** | `test_auth_rbac.py` | `test_f1_01_unauthenticated_access_blocked` | Unauthenticated requests cannot access protected views; redirected to Auth Gate |
| | | | `test_f1_02_credentials_form_validation` | Blank or invalid credentials display inline validation error |
| | | | `test_f1_03_successful_credentials_login` | Valid credentials generate session token and unlock operational workspace |
| | | | `test_f1_04_session_persistence` | Session token in storage preserves authenticated state across page refresh |
| | | | `test_f1_05_secure_logout_locks_terminal` | Explicit logout wipes token, resets state, and returns to landing Auth Gate |
| **F2** | **AWS SSO** | `test_auth_rbac.py` | `test_f2_01_sso_handshake_target_account` | SSO initiates against AWS IAM Identity Center for Account `145023097151` |
| | | | `test_f2_02_sso_returns_iam_role_arn` | SSO handshake returns valid IAM Role `arn:aws:iam::145023097151:role/CloudSentinel-SSO-User` |
| | | | `test_f2_03_sso_profile_capsule_metadata` | User profile matches `Aaditya Uniyal` (`aaditya.uniyal@cloudsentinel.io`) |
| | | | `test_f2_04_sso_cryptographic_token` | SSO issues standard JWT bearer token with signature |
| | | | `test_f2_05_sso_revocation` | Revoked SSO session terminates access immediately |
| **F3** | **Hardware MFA** | `test_auth_rbac.py` | `test_f3_01_mfa_hardware_token_required` | User cannot reach operational state without passing MFA verification |
| | | | `test_f3_02_valid_fips140_biometric_code` | Valid 6-digit FIPS 140-3 biometric token (e.g., `849201`) succeeds |
| | | | `test_f3_03_invalid_mfa_token_rejected` | Incorrect token returns verification error and denies access |
| | | | `test_f3_04_non_numeric_mfa_rejected` | Alphanumeric or malformed token format rejected |
| | | | `test_f3_05_mfa_verified_flag_in_profile` | Authenticated profile marks `mfaVerified: true` |
| **F4** | **RBAC Permissions**| `test_auth_rbac.py` | `test_f4_01_principal_sre_commander_rights`| SRE Commander possesses full remediation, chaos, CLI, and SQL mutation clearance |
| | | | `test_f4_02_infra_auditor_rights` | Auditor possesses read-only access to scorecard, ledger, and logs; mutations blocked |
| | | | `test_f4_03_platform_operator_rights` | Operator has telemetry and CLI diagnostic access; destructive changes blocked |
| | | | `test_f4_04_live_role_switching` | Dynamically switching role updates operational permissions in real-time |
| | | | `test_f4_05_clearance_tags_updated` | UI clearance tag displays role title and Account `145023097151` |
| **F5** | **Left Sidebar Navigation** | `test_navigation_shell.py` | `test_f5_01_all_six_primary_modules_rendered` | Renders Fleet Overview, Incident War-Room, AI Intelligence, Step Functions, Governance, DevOps Ledger |
| | | | `test_f5_02_route_switching_instant` | Switching active route updates view without full page reload |
| | | | `test_f5_03_sidebar_collapse_toggle` | Sidebar toggles between full width and collapsed icon rail |
| | | | `test_f5_04_active_route_highlight` | Active route displays distinct highlighted indicator |
| | | | `test_f5_05_invalid_route_fallback` | Unrecognized navigation path falls back to default overview module |
| **F6** | **Apple Dynamic Island** | `test_navigation_shell.py` | `test_f6_01_nominal_sla_morphing_state` | Default state displays 99.999% SLA nominal indicator with emerald pulse |
| | | | `test_f6_02_critical_incident_alert_state`| Detected incident morphs island into pulsating rose alert pill |
| | | | `test_f6_03_ai_consensus_reasoning_state`| Active diagnosis morphs island into multi-model consensus progress pill |
| | | | `test_f6_04_one_click_heal_trigger` | Clicking 1-click heal triggers autonomous remediation patch |
| | | | `test_f6_05_voice_alert_synthesizer_toggle`| Web Audio / Speech API toggle mutes/unmutes voice announcements |
| **F7** | **Fleet Telemetry** | `test_navigation_shell.py` | `test_f7_01_metrics_schema_validation` | `GET /metrics` returns total requests, latency p99, error rate, CPU, memory |
| | | | `test_f7_02_microservice_topology_mesh` | `GET /topology` returns 5+ nodes with AWS ARNs and connection edges |
| | | | `test_f7_03_degraded_node_health_status` | Hot partition marks DynamoDB node status as degraded/critical |
| | | | `test_f7_04_cost_savings_roi_calculation` | Telemetry reports serverless scale-to-zero ROI ($4,280/mo savings) |
| | | | `test_f7_05_system_health_endpoint` | `GET /health` returns online services, account ID, and architect metadata |
| **F8** | **Incidents War-Room** | `test_views_workflows.py` | `test_f8_01_get_incidents_list` | `GET /incidents` returns active and resolved incidents |
| | | | `test_f8_02_ingest_incident_anomaly` | `POST /incidents` ingests CloudWatch/EventBridge alarm payload |
| | | | `test_f8_03_incident_details_by_id` | `GET /incidents/<id>` returns raw logs, metrics snapshot, and status |
| | | | `test_f8_04_eventbridge_stream_format` | Live telemetry events conform to AWS EventBridge envelope structure |
| | | | `test_f8_05_chaos_simulator_trigger` | Injecting chaos fault creates structured incident in War-Room |
| **F9** | **AI Consensus Engine** | `test_views_workflows.py` | `test_f9_01_multi_agent_diagnosis_trigger`| `POST /incidents/<id>/diagnose` generates root cause analysis |
| | | | `test_f9_02_tri_model_benchmark_results`| Returns reasoning from Claude 3.5 Sonnet, Gemini 2.5 Flash, and Groq LPU |
| | | | `test_f9_03_agent_thought_steps_trace` | Response includes >=3 step-by-step reasoning thought trace steps |
| | | | `test_f9_04_remediation_patch_synthesis`| Generates declarative IaC hot-patch with rollback configuration |
| | | | `test_f9_05_multimodal_vision_inspector`| `POST /vision/analyze` analyzes architectural diagram for failure modes |
| **F10** | **Step Functions Orchestrator** | `test_views_workflows.py` | `test_f10_01_state_machine_definition` | Retrieves 6-state AWS Step Functions JSON definition |
| | | | `test_f10_02_execution_trigger` | Starts execution and returns execution ARN and running status |
| | | | `test_f10_03_state_transition_sequence` | Transitions: Triage -> AI Diagnosis -> Synthesize -> Execute -> Verify -> Publish |
| | | | `test_f10_04_parallel_branch_execution` | Bedrock RCA and Groq Guardrail branches execute concurrently |
| | | | `test_f10_05_canary_verification_gate` | Synthetic health checks verify 0% error rate prior to resolution |
| **F11** | **Well-Architected Governance**| `test_views_workflows.py` | `test_f11_01_six_pillars_evaluated` | Evaluates Security, Reliability, Performance, Cost, Ops, Sustainability |
| | | | `test_f11_02_overall_score_calculation` | Calculates weighted average score across all 6 pillars (>=90%) |
| | | | `test_f11_03_pillar_highlights_present` | Each pillar includes architectural highlights and AWS best practices |
| | | | `test_f11_04_automated_policy_checks` | Evaluates IAM least privilege and S3 block public access compliance |
| | | | `test_f11_05_score_restoration_on_heal` | Executing remediation restores pillar score to nominal baseline |
| **F12** | **DevOps Terminal** | `test_views_workflows.py` | `test_f12_01_cli_sts_caller_identity` | `aws sts get-caller-identity` returns Account `145023097151` |
| | | | `test_f12_02_cli_dynamodb_describe_table`| `aws dynamodb describe-table` returns active table configuration |
| | | | `test_f12_03_cli_lambda_list_functions` | `aws lambda list-functions` returns active serverless functions |
| | | | `test_f12_04_cli_s3_ls_buckets` | `aws s3 ls` returns `customer-pii-vault-145023097151` |
| | | | `test_f12_05_cli_arbitrary_command` | Arbitrary valid CLI command returns structured execution JSON |
| **F13** | **Neon PostgreSQL SQL Ledger** | `test_views_workflows.py` | `test_f13_01_database_status_neon_aws` | `GET /database/status` returns PostgreSQL 18.6 Neon on `us-east-2` |
| | | | `test_f13_02_sql_query_select_version` | `POST /database/query` executes `SELECT version();` successfully |
| | | | `test_f13_03_audit_trail_table_query` | Queries `remediation_audit_trail` table with columns and records |
| | | | `test_f13_04_relational_incidents_query`| Queries `relational_incidents` table for relational incident schema |
| | | | `test_f13_05_immutable_sha256_hash` | Validates audit records contain cryptographic SHA-256 integrity hash |
| **F14** | **Dual-Mode API Resilience** | `test_dual_mode_resilience.py` | `test_f14_01_live_backend_resolution` | Communicates cleanly with live server when online |
| | | | `test_f14_02_timeout_fallback_to_client`| Network timeout gracefully activates client fallback store |
| | | | `test_f14_03_offline_cli_fallback` | In-browser CLI fallback returns authentic AWS JSON |
| | | | `test_f14_04_offline_sql_fallback` | In-browser SQL fallback executes relational queries locally |
| | | | `test_f14_05_environment_reset_endpoint`| `POST /reset` resets environment state to baseline across both modes |

---

### 2.2 Tier 2: Boundary & Corner Cases (>= 5 Tests Per Feature Area)

| # | Boundary Area | Test Module | Test Method | Expected Behavior |
|---|---------------|-------------|-------------|-------------------|
| **B1** | **Empty Inputs & Malformed Payloads** | `test_dual_mode_resilience.py` | `test_b1_01_empty_incident_payload_safe` | Blank `POST /incidents` body handled safely without crashing |
| | | | `test_b1_02_empty_cli_command_defaults` | Empty CLI command string defaults to caller identity |
| | | | `test_b1_03_empty_sql_query_handled` | Blank SQL query returns safe message or default version |
| | | | `test_b1_04_malformed_json_returns_400` | Non-JSON body returns HTTP 400 Bad Request |
| | | | `test_b1_05_missing_incident_id_404` | Incomplete URL path returns HTTP 404 Not Found |
| **B2** | **Expired & Malformed Auth Tokens** | `test_auth_rbac.py` | `test_b2_01_expired_session_token_rejected` | Expired timestamp in token rejected with 401 SessionExpired |
| | | | `test_b2_02_tampered_jwt_signature_rejected` | Altered token payload/signature rejected with 401 Unauthorized |
| | | | `test_b2_03_empty_auth_header_rejected` | Missing Bearer token on protected operation rejected |
| | | | `test_b2_04_invalid_mfa_token_lengths` | 3-digit, 7-digit, and negative MFA codes rejected |
| | | | `test_b2_05_foreign_account_id_rejected` | Token for account other than `145023097151` denied |
| **B3** | **Offline Fallback Resilience** | `test_dual_mode_resilience.py` | `test_b3_01_offline_incident_creation` | Creating incident while offline persists in local client state |
| | | | `test_b3_02_offline_diagnosis_generation` | Offline diagnosis generates synthetic RCA and patch |
| | | | `test_b3_03_offline_remediation_postmortem`| Offline remediation marks RESOLVED and writes post-mortem |
| | | | `test_b3_04_offline_metrics_stream` | Offline metrics generate realistic sparkline data |
| | | | `test_b3_05_offline_topology_graph` | Offline topology returns full 5+ node topology graph |
| **B4** | **Zero Incidents & Empty State Handling** | `test_navigation_shell.py` | `test_b4_01_zero_incidents_feed_display` | Feed displays empty state graphic with no unhandled exceptions |
| | | | `test_b4_02_zero_incidents_dynamic_island` | Dynamic Island remains in 99.999% SLA nominal state |
| | | | `test_b4_03_zero_incidents_counter_zero` | War-Room active counter reflects exactly 0 active incidents |
| | | | `test_b4_04_remediate_nonexistent_id_404` | Remediating `INC-NONEXISTENT` returns 404 error |
| | | | `test_b4_05_diagnose_nonexistent_id_404` | Diagnosing non-existent incident returns 404 error |
| **B5** | **Simultaneous Failures & High Load** | `test_views_workflows.py` | `test_b5_01_concurrent_incident_ingestion`| Ingesting multiple simultaneous incidents stores all without drop |
| | | | `test_b5_02_severity_alert_prioritization`| CRITICAL severity alert takes precedence over HIGH or MEDIUM |
| | | | `test_b5_03_concurrent_cli_executions` | Simultaneous CLI requests execute concurrently without locking |
| | | | `test_b5_04_large_log_payload_handling` | Incident with 1,000 log lines processes within limits |
| | | | `test_b5_05_remediation_idempotence` | Multiple `/remediate` calls on same incident remain idempotent |
| **B6** | **Auditor RBAC Boundaries** | `test_auth_rbac.py` | `test_b6_01_auditor_cannot_remediate` | `INFRA_AUDITOR` executing remediation rejected with 403 Forbidden |
| | | | `test_b6_02_auditor_cannot_inject_chaos` | `INFRA_AUDITOR` attempting chaos injection rejected with 403 |
| | | | `test_b6_03_auditor_cannot_trigger_step_functions` | `INFRA_AUDITOR` mutating Step Functions rejected with 403 |
| | | | `test_b6_04_auditor_cannot_drop_tables` | Destructive SQL queries by Auditor blocked with 403 |
| | | | `test_b6_05_auditor_can_read_ledger_and_scorecard` | Auditor read access to scorecard and SQL ledger succeeds |

---

### 2.3 Tier 3: Cross-Feature Combinations (Pairwise Interactions)

| # | Interaction Flow | Test Module | Test Method | Verification |
|---|------------------|-------------|-------------|--------------|
| **C1** | **Role Switching in Active Ops** | `test_cross_feature_combinations.py` | `test_c1_role_switching_during_incident_triage` | Switch from SRE to Auditor: action buttons disable, clearance switches to READ_ONLY |
| **C2** | **Chaos Injection to Island Alert** | `test_cross_feature_combinations.py` | `test_c2_chaos_triggers_island_and_telemetry_drop` | Inject DynamoDB chaos -> Island morphs to CRITICAL_ALERT, error rate rises, node turns degraded |
| **C3** | **1-Click Heal to SLA & Governance** | `test_cross_feature_combinations.py` | `test_c3_one_click_heal_restores_island_and_scorecard`| 1-Click heal resolves incident -> Island resets to nominal 99.999% SLA, Reliability score restored |
| **C4** | **Step Functions to SQL Audit Trail**| `test_cross_feature_combinations.py` | `test_c4_step_functions_emits_sql_audit_trail` | Executing Step Functions state machine creates immutable row in `remediation_audit_trail` table |
| **C5** | **AI Consensus to DevOps CLI Verification** | `test_cross_feature_combinations.py` | `test_c5_ai_consensus_verified_via_devops_cli` | Bedrock generates DynamoDB auto-scale patch -> AWS CLI `dynamodb describe-table` reflects configuration |
| **C6** | **SSO Identity to DevOps STS Caller**| `test_cross_feature_combinations.py` | `test_c6_sso_identity_populates_cli_caller_identity` | SSO login for Account `145023097151` sets CLI caller identity ARN and Account metadata |
| **C7** | **Voice Alert Synthesizer Trigger** | `test_cross_feature_combinations.py` | `test_c7_voice_alert_toggled_during_critical_incident`| Ingesting CRITICAL incident triggers voice synthesizer queue; mute toggle suppresses audio |
| **C8** | **MFA Gate Unlocks Modular Views** | `test_cross_feature_combinations.py` | `test_c8_mfa_unlocks_governance_and_devops` | Unauthenticated user blocked from Governance & DevOps; passing MFA unlocks both views |
| **C9** | **Offline Fallback Island Morphing** | `test_cross_feature_combinations.py` | `test_c9_offline_fallback_maintains_island_morphing` | Backend disconnect still allows Dynamic Island morphing and 1-click heal via client store |
| **C10** | **Environment Reset to Baseline** | `test_cross_feature_combinations.py` | `test_c10_reset_restores_all_views_to_baseline` | Triggering reset endpoint restores telemetry, incidents, topology, and island to baseline |

---

### 2.4 Tier 4: Real-World Application Scenarios (End-to-End User Journeys)

| # | Real-World Scenario | Test Module | Test Method | Lifecycle Workflow |
|---|---------------------|-------------|-------------|--------------------|
| **S1** | **Principal SRE Commander P0 Triage & Autonomous Remediation** | `test_real_world_scenarios.py` | `test_s1_sre_commander_p0_triage_and_remediation_workflow` | 1. AWS SSO + MFA login (`PRINCIPAL_SRE_COMMANDER`)<br>2. Dynamic Island alert detected (`INC-892401`)<br>3. Inspect War-Room logs and telemetry<br>4. Trigger Bedrock multi-agent AI diagnosis<br>5. Execute Step Functions state machine<br>6. Verify canary health check and mark RESOLVED<br>7. Verify Dynamic Island returns to 99.999% SLA |
| **S2** | **Infra Security Auditor Compliance Review & SQL Audit Ledger** | `test_real_world_scenarios.py` | `test_s2_auditor_compliance_review_and_sql_ledger_verification` | 1. Login with Auditor credentials (`INFRA_AUDITOR`)<br>2. Review Well-Architected 6-pillar scorecard<br>3. Query Neon PostgreSQL `remediation_audit_trail`<br>4. Validate SHA-256 hash chaining and timestamps<br>5. Attempt unauthorized chaos injection/drop table -> strictly blocked (403) |
| **S3** | **Platform Operator Offline CLI Queries & Telemetry Inspection** | `test_real_world_scenarios.py` | `test_s3_platform_operator_offline_cli_and_telemetry` | 1. Login as `PLATFORM_OPERATOR`<br>2. Simulate network disconnect (offline mode)<br>3. Inspect cached fleet telemetry and topology<br>4. Execute `aws lambda list-functions` and `aws dynamodb describe-table`<br>5. Verify authentic AWS JSON returned via fallback |
| **S4** | **Chaos Engineering Disaster Recovery Drill & 1-Click Heal** | `test_real_world_scenarios.py` | `test_s4_chaos_engineering_drill_and_automated_recovery` | 1. Verify nominal system baseline<br>2. Inject S3 Public Exposure chaos scenario<br>3. EventBridge ingests alarm; Security score drops<br>4. Dynamic Island triggers 1-Click Heal<br>5. Hot patch enforces `BlockPublicAcls`<br>6. Incident marked RESOLVED; audit row logged |
| **S5** | **Multi-Model AI Consensus Arena Evaluation** | `test_real_world_scenarios.py` | `test_s5_tri_model_arena_evaluation_workflow` | Compare Claude 3.5 Sonnet vs Gemini 2.5 Flash vs Groq LPU latency, accuracy, and RCA synthesis |
| **S6** | **Session Expiration & Re-Authentication Recovery** | `test_real_world_scenarios.py` | `test_s6_session_expiration_reauth_recovery` | Token expires during active triage; session locks; re-authentication restores user workspace |
| **S7** | **DevOps Terminal Multi-Command Pipeline** | `test_real_world_scenarios.py` | `test_s7_devops_terminal_pipeline_execution` | Execute multi-step diagnostic pipeline (`sts`, `s3 ls`, `dynamodb describe`, `cloudwatch metrics`) |
| **S8** | **Full System Reset & Baseline Health Verification** | `test_real_world_scenarios.py` | `test_s8_full_system_reset_baseline_verification` | Complete operational lifecycle followed by reset restores pristine initial state |

---

## 3. Pass/Fail Criteria & Quality Metrics

To achieve **PASS** status, the E2E Test Suite enforces:
1. **100% Pass Rate**: Every test in Tiers 1–4 must execute and pass without assertion failures, unhandled exceptions, or unhandled promise rejections.
2. **Coverage Target**:
   - Tier 1: Exactly or greater than 5 test cases per feature (14 features = minimum 70 tests).
   - Tier 2: Exactly or greater than 5 test cases per boundary area (6 areas = minimum 30 tests).
   - Tier 3: Minimum 10 pairwise cross-feature interaction tests.
   - Tier 4: Minimum 8 real-world application scenario tests.
   - **Total Suite**: Minimum 118 test cases.
3. **Execution Performance**: Entire suite must execute in under 30 seconds on standard developer hardware.
4. **Hermetic Cleanliness**: Zero persistent side effects outside the testing sandbox. Environment reset restores baseline after test completion.
5. **No Facade Tests**: Every test must perform genuine assertions against HTTP payloads, headers, status codes, state transitions, or protocol contracts.

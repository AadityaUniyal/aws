"""
CloudSentinel AI - Chaos Engineering & Live Failure Injection Runner.
Allows judges and evaluators to inject live AWS incident scenarios with 1-click.
"""

import sys
import json
import urllib.request
import urllib.error
import time

API_URL = "http://localhost:8000"

SCENARIOS = {
    "1": {
        "title": "DynamoDB Hot Partition Throttling (Orders-Production)",
        "service": "Amazon DynamoDB",
        "severity": "CRITICAL",
        "incident_type": "DYNAMODB_THROTTLING",
        "affected_resources": ["arn:aws:dynamodb:us-east-1:123456789012:table/Orders-Production"],
        "raw_logs": [
            "[2026-10-10 13:30:12 UTC] WARN com.amazon.dynamodb: ProvisionedThroughputExceededException on table 'Orders-Production' PK='GLOBAL_FLASH_SALE'",
            "[2026-10-10 13:30:18 UTC] ERROR OrderProcessingLambda: Connection timeout waiting for DynamoDB response (>5000ms)",
            "[2026-10-10 13:30:22 UTC] CRITICAL APIGateway: HTTP 504 Gateway Timeout rate exceeded 40% on /v1/orders"
        ],
        "metrics_snapshot": {
            "wcu_consumption": "100%",
            "throttled_requests_5m": 1842,
            "api_504_pct": "41.8%"
        }
    },
    "2": {
        "title": "S3 Public Exposure & ACL Misconfiguration",
        "service": "Amazon S3",
        "severity": "CRITICAL",
        "incident_type": "S3_PUBLIC_EXPOSURE",
        "affected_resources": ["arn:aws:s3:::enterprise-customer-pii-vault"],
        "raw_logs": [
            "[2026-10-10 13:31:00 UTC] SECURITY GuardDuty Finding Policy:S3/BucketBlockPublicAccessDisabled",
            "[2026-10-10 13:31:04 UTC] WARN CloudTrail: PutBucketAcl called with URI=http://acs.amazonaws.com/groups/global/AllUsers by role DevOps-Emergency-Bypass",
            "[2026-10-10 13:31:09 UTC] ALERT S3: 45,000 sensitive records exposed to public internet"
        ],
        "metrics_snapshot": {
            "public_access_block": "DISABLED",
            "exposed_objects": 45000,
            "compliance_violation": "SOC2_CC6.1"
        }
    },
    "3": {
        "title": "Lambda Regional Concurrency Pool Exhaustion",
        "service": "AWS Lambda",
        "severity": "HIGH",
        "incident_type": "LAMBDA_CONCURRENCY_EXHAUSTION",
        "affected_resources": ["arn:aws:lambda:us-east-1:123456789012:function:PaymentGatewayWebhooks"],
        "raw_logs": [
            "[2026-10-10 13:32:01 UTC] ERROR Lambda: Rate Exceeded. Account concurrent execution limit reached (1000/1000)",
            "[2026-10-10 13:32:05 UTC] WARN CloudWatch: PaymentGatewayWebhooks throttled 420 invocations in last 60 seconds",
            "[2026-10-10 13:32:10 UTC] ERROR AuthTokenValidator: Cold start invocation rejected due to account throttling"
        ],
        "metrics_snapshot": {
            "concurrent_executions": 980,
            "throttles_per_min": 420,
            "unreserved_pool": "0"
        }
    }
}


def trigger_scenario(scenario_key="1"):
    scenario = SCENARIOS.get(scenario_key, SCENARIOS["1"])
    print(f"\n[+] Injecting Chaos Scenario: {scenario['title']}")

    req = urllib.request.Request(
        f"{API_URL}/incidents",
        data=json.dumps(scenario).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )

    try:
        with urllib.request.urlopen(req) as res:
            data = json.loads(res.read().decode("utf-8"))
            incident_id = data.get("incident", {}).get("id")
            print(f"[*] Incident Created: {incident_id}")
            print(f"[*] Dispatching Bedrock Multi-Agent Diagnostics...")

            # Trigger diagnose
            diag_req = urllib.request.Request(
                f"{API_URL}/incidents/{incident_id}/diagnose",
                data=b"{}",
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(diag_req) as diag_res:
                diag_data = json.loads(diag_res.read().decode("utf-8"))
                inc = diag_data.get("incident", {})
                print(f"[✓] Bedrock Root Cause Identified: {inc.get('root_cause_analysis')[:120]}...")
                print(f"[✓] IaC Patch Synthesized: {inc.get('remediation_patch', {}).get('title')}")
                print(f"\nView live result on Dashboard at http://localhost:5173\n")
    except Exception as e:
        print(f"[-] Error triggering scenario (Make sure backend server is running on http://localhost:8000): {e}")


if __name__ == "__main__":
    choice = sys.argv[1] if len(sys.argv) > 1 else "1"
    trigger_scenario(choice)

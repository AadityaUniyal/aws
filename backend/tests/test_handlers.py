"""
Unit and Integration Tests for CloudSentinel AI Serverless Engine.
"""

import unittest
import json
import sys
import os

# Add src to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src")))

from handlers.ingest_incident import lambda_handler as ingest_handler
from handlers.bedrock_agent import lambda_handler as bedrock_handler
from handlers.remediate import lambda_handler as remediate_handler
from handlers.get_incidents import lambda_handler as get_incidents_handler
from handlers.get_topology import lambda_handler as topology_handler
from handlers.metrics_stream import lambda_handler as metrics_handler
from services.bedrock_service import bedrock_service
from services.dynamodb_service import dynamodb_service


class TestCloudSentinelAI(unittest.TestCase):
    def setUp(self):
        dynamodb_service._memory_store.clear()

    def test_01_ingest_incident(self):
        event = {
            "body": json.dumps({
                "title": "S3 Public Exposure Detected",
                "service": "Amazon S3",
                "severity": "CRITICAL",
                "incident_type": "S3_PUBLIC_EXPOSURE",
                "affected_resources": ["arn:aws:s3:::enterprise-customer-pii-vault"],
                "raw_logs": ["BlockPublicAcls is FALSE"]
            })
        }
        res = ingest_handler(event)
        self.assertEqual(res["statusCode"], 201)
        data = json.loads(res["body"])
        self.assertTrue(data["success"])
        self.assertEqual(data["incident"]["service"], "Amazon S3")
        self.assertEqual(data["incident"]["status"], "DETECTED")

    def test_02_bedrock_agent_diagnosis(self):
        # First ingest
        event_ingest = {
            "body": json.dumps({
                "id": "INC-TEST-001",
                "title": "DynamoDB Hot Partition Throttling",
                "service": "Amazon DynamoDB",
                "severity": "HIGH",
                "incident_type": "DYNAMODB_THROTTLING"
            })
        }
        ingest_handler(event_ingest)

        # Diagnose with Bedrock
        event_diag = {"pathParameters": {"id": "INC-TEST-001"}}
        res = bedrock_handler(event_diag)
        self.assertEqual(res["statusCode"], 200)
        data = json.loads(res["body"])
        self.assertTrue(data["success"])
        incident = data["incident"]
        self.assertEqual(incident["status"], "ROOT_CAUSE_IDENTIFIED")
        self.assertIsNotNone(incident["root_cause_analysis"])
        self.assertGreaterEqual(len(incident["agent_thoughts"]), 3)
        self.assertIsNotNone(incident["remediation_patch"])
        self.assertEqual(incident["remediation_patch"]["target_service"], "Amazon DynamoDB")

    def test_03_autonomous_remediation(self):
        # Ingest and diagnose
        event_ingest = {
            "body": json.dumps({
                "id": "INC-TEST-002",
                "title": "Lambda Concurrency Storm",
                "service": "AWS Lambda",
                "severity": "HIGH",
                "incident_type": "LAMBDA_CONCURRENCY_EXHAUSTION"
            })
        }
        ingest_handler(event_ingest)
        bedrock_handler({"pathParameters": {"id": "INC-TEST-002"}})

        # Execute remediation
        res = remediate_handler({"pathParameters": {"id": "INC-TEST-002"}})
        self.assertEqual(res["statusCode"], 200)
        data = json.loads(res["body"])
        self.assertTrue(data["success"])
        self.assertEqual(data["incident"]["status"], "RESOLVED")
        self.assertIsNotNone(data["incident"]["resolved_at"])

    def test_04_topology_and_metrics(self):
        res_top = topology_handler()
        self.assertEqual(res_top["statusCode"], 200)
        top_data = json.loads(res_top["body"])
        self.assertIn("nodes", top_data["topology"])
        self.assertGreaterEqual(len(top_data["topology"]["nodes"]), 5)

        res_met = metrics_handler()
        self.assertEqual(res_met["statusCode"], 200)
        met_data = json.loads(res_met["body"])
        self.assertIn("total_requests", met_data["metrics"])


if __name__ == "__main__":
    unittest.main()

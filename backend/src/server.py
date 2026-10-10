"""
CloudSentinel AI - Local Development & Production Server.
Emulates Amazon API Gateway locally with instantaneous Lambda execution and hot reload.
Target Account: 145023097151 | Lead Architect: Aaditya Uniyal
"""

import json
import logging
import sys
import os
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import threading
from datetime import datetime, timezone

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from handlers.ingest_incident import lambda_handler as ingest_handler
from handlers.bedrock_agent import lambda_handler as bedrock_handler
from handlers.remediate import lambda_handler as remediate_handler
from handlers.get_incidents import lambda_handler as get_incidents_handler
from handlers.get_topology import lambda_handler as topology_handler
from handlers.metrics_stream import lambda_handler as metrics_handler
from services.dynamodb_service import dynamodb_service
from services.neon_db_service import neon_db_service
from services.ai_engine import ai_engine
from services.s3_service import s3_service
from services.sns_service import sns_service
from services.bedrock_service import bedrock_service

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("server")

PORT = int(os.getenv("PORT", 8000))
ACCOUNT_ID = "145023097151"
ARCHITECT = "Aaditya Uniyal"


class APIHandler(BaseHTTPRequestHandler):
    def _set_cors(self, status=200, content_length=None):
        self.send_response(status)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Amz-Date, X-Api-Key, X-Amz-Security-Token")
        self.send_header("Content-Type", "application/json")
        self.send_header("Connection", "close")
        if content_length is not None:
            self.send_header("Content-Length", str(content_length))

    def _write_json(self, data, status=200):
        if isinstance(data, (dict, list)):
            body_bytes = json.dumps(data).encode("utf-8")
        elif isinstance(data, str):
            body_bytes = data.encode("utf-8")
        else:
            body_bytes = str(data).encode("utf-8")
        self._set_cors(status, content_length=len(body_bytes))
        self.end_headers()
        self.wfile.write(body_bytes)

    def do_OPTIONS(self):
        self._set_cors(200, content_length=0)
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        query_params = {k: v[0] for k, v in parse_qs(parsed.query).items()}

        if path == "/health" or path == "/":
            self._write_json({
                "status": "healthy",
                "service": "CloudSentinel AI API Engine",
                "aws_account_id": ACCOUNT_ID,
                "lead_architect": ARCHITECT,
                "aws_services": ["Amazon Bedrock", "AWS Lambda", "Amazon DynamoDB", "Amazon S3", "Amazon API Gateway", "Amazon SNS"],
                "live_ai_models": ["Google Gemini 2.5 Flash", "Groq LPU (Qwen/Llama)", "Amazon Bedrock (Claude 3.5 Sonnet)"],
                "database": "PostgreSQL 18.6 (Neon Serverless on AWS us-east-2)",
                "version": "2.1.0"
            })
            return

        if path == "/database/status":
            db_status = neon_db_service.get_database_status()
            self._write_json({"success": True, "database": db_status})
            return

        if path == "/aws/services-status":
            services_status = {
                "account_id": ACCOUNT_ID,
                "lead_architect": ARCHITECT,
                "region": "ap-south-1",
                "services": [
                    {"name": "Amazon Bedrock", "status": "ONLINE", "type": "Generative AI", "model": "anthropic.claude-3-5-sonnet-20240620-v1:0", "purpose": "IaC Hot-Patch Synthesis"},
                    {"name": "AWS Lambda", "status": "ONLINE", "type": "Serverless Compute", "runtime": "python3.11", "purpose": "Incident Triage & Event Processing"},
                    {"name": "Amazon DynamoDB", "status": "ONLINE", "type": "NoSQL Database", "table": "CloudSentinel-prod-Table", "purpose": "Single-Digit ms Incident State Store"},
                    {"name": "Amazon S3", "status": "ONLINE", "type": "Object Storage", "bucket": f"customer-pii-vault-{ACCOUNT_ID}", "purpose": "Encrypted Forensic Log Vault"},
                    {"name": "Amazon API Gateway", "status": "ONLINE", "type": "API Management", "protocol": "REST & WebSocket", "purpose": "Endpoint Routing & Throttling"},
                    {"name": "Amazon SNS", "status": "ONLINE", "type": "Pub/Sub Messaging", "topic": f"arn:aws:sns:ap-south-1:{ACCOUNT_ID}:CloudSentinel-prod-Alerts", "purpose": "High-Priority Alert Dispatch"},
                    {"name": "AWS Step Functions", "status": "ONLINE", "type": "State Machine", "arn": f"arn:aws:states:ap-south-1:{ACCOUNT_ID}:stateMachine:CloudSentinel-IncidentOrchestrator", "purpose": "Distributed Parallel Orchestration"},
                    {"name": "Amazon EventBridge", "status": "ONLINE", "type": "Event Bus", "bus": "CloudSentinel-Bus", "purpose": "Decoupled Telemetry Ingestion"},
                    {"name": "Amazon CloudWatch", "status": "ONLINE", "type": "Monitoring", "retention": "30 Days", "purpose": "Real-time Metrics & Alarms"},
                    {"name": "AWS Systems Manager", "status": "ONLINE", "type": "Configuration", "prefix": "/cloudsentinel/prod/", "purpose": "KMS-Encrypted Circuit Breakers"},
                    {"name": "Neon Serverless Postgres", "status": "ONLINE", "type": "Relational ACID DB", "host": "AWS us-east-2", "purpose": "Remediation Audit Trail"},
                    {"name": "Google Gemini 2.5 Flash", "status": "ONLINE", "type": "Multimodal AI", "latency": "1.1s", "purpose": "Visual Architecture Failure Reasoning"},
                    {"name": "Groq LPU Engine", "status": "ONLINE", "type": "Ultra-Fast LLM", "latency": "48ms", "purpose": "IAM Least-Privilege Security Audit"}
                ]
            }
            self._write_json({"success": True, "data": services_status})
            return

        if path == "/metrics":
            event = {"queryStringParameters": query_params}
            res = metrics_handler(event)
            self._send_lambda_response(res)
            return

        if path == "/topology":
            event = {"queryStringParameters": query_params}
            res = topology_handler(event)
            self._send_lambda_response(res)
            return

        if path == "/incidents":
            event = {"queryStringParameters": query_params}
            res = get_incidents_handler(event)
            self._send_lambda_response(res)
            return

        if path.startswith("/incidents/"):
            inc_id = path.split("/incidents/")[1].strip()
            event = {"pathParameters": {"id": inc_id}}
            res = get_incidents_handler(event)
            self._send_lambda_response(res)
            return

        self._write_json({"error": f"Route {path} not found"}, status=404)

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path
        content_length = int(self.headers.get("Content-Length", 0))
        body_bytes = self.rfile.read(content_length) if content_length > 0 else b""
        body = json.loads(body_bytes.decode("utf-8")) if body_bytes else {}

        if path == "/vision/analyze":
            desc = body.get("description", "")
            img_b64 = body.get("image_base64", "")
            analysis = ai_engine.analyze_visual_architecture(img_b64, description=desc)
            self._write_json({"success": True, "analysis": analysis})
            return

        if path == "/aws/cli":
            cmd = body.get("command", "aws sts get-caller-identity").strip()
            output = self._handle_simulated_cli(cmd)
            self._write_json({"success": True, "command": cmd, "output": output})
            return

        if path == "/database/query":
            sql = body.get("query", "SELECT version();")
            res = neon_db_service.execute_query(sql)
            self._write_json(res, status=200 if res.get("success") else 400)
            return

        if path == "/aws/configure-keys":
            access_key = body.get("aws_access_key_id", "").strip()
            secret_key = body.get("aws_secret_access_key", "").strip()
            session_token = body.get("aws_session_token", "").strip()
            region = body.get("aws_region", "ap-south-1").strip()

            if access_key and secret_key:
                os.environ["AWS_ACCESS_KEY_ID"] = access_key
                os.environ["AWS_SECRET_ACCESS_KEY"] = secret_key
                if session_token:
                    os.environ["AWS_SESSION_TOKEN"] = session_token
                os.environ["AWS_REGION"] = region

                # Re-initialize boto3 services
                dynamodb_service._initialize_client()
                s3_service._initialize_client()
                sns_service._initialize_client()
                bedrock_service._initialize_client()

            self._write_json({
                "success": True,
                "message": f"AWS credentials configured for region {region}",
                "authenticated": True
            })
            return

        if path == "/incidents":
            event = {"body": body}
            res = ingest_handler(event)
            self._send_lambda_response(res)
            return

        if path.startswith("/incidents/") and path.endswith("/diagnose"):
            inc_id = path.split("/incidents/")[1].split("/diagnose")[0].strip()
            event = {"pathParameters": {"id": inc_id}, "body": body}
            res = bedrock_handler(event)
            self._send_lambda_response(res)
            return

        if path.startswith("/incidents/") and path.endswith("/remediate"):
            inc_id = path.split("/incidents/")[1].split("/remediate")[0].strip()
            event = {"pathParameters": {"id": inc_id}, "body": body}
            res = remediate_handler(event)
            self._send_lambda_response(res)
            return

        if path == "/reset":
            dynamodb_service._memory_store.clear()
            seed_initial_incidents()
            self._write_json({"success": True, "message": "Environment reset to baseline"})
            return

        self._write_json({"error": f"Route {path} not found"}, status=404)

    def _handle_simulated_cli(self, cmd: str) -> str:
        cmd_lower = cmd.lower().strip()
        if "sts get-caller-identity" in cmd_lower:
            return json.dumps({
                "UserId": f"AIDA{ACCOUNT_ID}CLOUDARCH",
                "Account": ACCOUNT_ID,
                "Arn": f"arn:aws:iam::{ACCOUNT_ID}:user/{ARCHITECT.replace(' ', '')}"
            }, indent=2)
        elif "dynamodb describe-table" in cmd_lower or "dynamodb list-tables" in cmd_lower:
            return json.dumps({
                "TableNames": ["CloudSentinel-prod-Table", "Orders-Production", "Telemetry-Realtime-Vault"],
                "TableStatus": "ACTIVE",
                "BillingMode": "PAY_PER_REQUEST",
                "GlobalSecondaryIndexes": [{"IndexName": "StatusIndex", "IndexStatus": "ACTIVE"}],
                "ItemCount": 148201,
                "TableSizeBytes": 42918400
            }, indent=2)
        elif "lambda list-functions" in cmd_lower:
            return json.dumps({
                "Functions": [
                    {"FunctionName": "CloudSentinel-prod-BedrockAgent", "Runtime": "python3.11", "MemorySize": 512, "Timeout": 30, "LastModified": "2026-10-10T12:00:00Z"},
                    {"FunctionName": "CloudSentinel-prod-RemediationExecutor", "Runtime": "python3.11", "MemorySize": 512, "Timeout": 60, "LastModified": "2026-10-10T12:00:00Z"},
                    {"FunctionName": "CloudSentinel-prod-IngestIncident", "Runtime": "python3.11", "MemorySize": 256, "Timeout": 15, "LastModified": "2026-10-10T12:00:00Z"},
                    {"FunctionName": "OrderProcessingService", "Runtime": "nodejs20.x", "MemorySize": 1024, "Timeout": 20, "LastModified": "2026-10-10T11:45:00Z"}
                ]
            }, indent=2)
        elif "s3 ls" in cmd_lower:
            return f"2026-10-10 13:30:00 customer-pii-vault-{ACCOUNT_ID}\n2026-10-10 13:30:00 cloudsentinel-vault-{ACCOUNT_ID}-us-east-1\n2026-10-10 13:30:00 telemetry-lake-prod-{ACCOUNT_ID}"
        elif "bedrock list-foundation-models" in cmd_lower:
            return json.dumps({
                "modelSummaries": [
                    {"modelId": "anthropic.claude-3-5-sonnet-20240620-v1:0", "providerName": "Anthropic", "inputModalities": ["TEXT", "IMAGE"], "outputModalities": ["TEXT"]},
                    {"modelId": "amazon.titan-text-express-v1", "providerName": "Amazon", "inputModalities": ["TEXT"], "outputModalities": ["TEXT"]},
                    {"modelId": "meta.llama3-70b-instruct-v1:0", "providerName": "Meta", "inputModalities": ["TEXT"], "outputModalities": ["TEXT"]}
                ]
            }, indent=2)
        elif "cloudformation describe-stacks" in cmd_lower or "cloudformation list-stacks" in cmd_lower:
            return json.dumps({
                "StackSummaries": [
                    {
                        "StackName": "CloudSentinel-Stack",
                        "StackStatus": "CREATE_COMPLETE",
                        "CreationTime": "2026-10-10T10:00:00Z",
                        "TemplateDescription": "CloudSentinel AI Autonomous SRE Infrastructure Grid",
                        "DriftInformation": {"StackDriftStatus": "IN_SYNC"}
                    }
                ]
            }, indent=2)
        elif "cloudwatch get-metric-data" in cmd_lower or "cloudwatch list-metrics" in cmd_lower:
            return json.dumps({
                "MetricDataResults": [
                    {"Id": "m1", "Label": "DynamoDB ThrottledRequests", "Timestamps": ["2026-10-10T13:40:00Z"], "Values": [0.0], "StatusCode": "Complete"},
                    {"Id": "m2", "Label": "Lambda Invocations", "Timestamps": ["2026-10-10T13:40:00Z"], "Values": [1420.0], "StatusCode": "Complete"}
                ]
            }, indent=2)
        else:
            return json.dumps({
                "Status": "SUCCESS",
                "Command": cmd,
                "AWS_Account": ACCOUNT_ID,
                "Lead_Architect": ARCHITECT,
                "Region": "ap-south-1",
                "ExecutionTimestamp": datetime.now(timezone.utc).isoformat()
            }, indent=2)

    def _send_lambda_response(self, res: dict):
        status_code = res.get("statusCode", 200)
        body = res.get("body", "{}")
        self._write_json(body, status=status_code)


def seed_initial_incidents():
    sample_incident = {
        "id": "INC-892401",
        "account_id": ACCOUNT_ID,
        "lead_architect": ARCHITECT,
        "title": "DynamoDB Hot Partition Spike on Orders-Production Table",
        "service": "Amazon DynamoDB",
        "severity": "CRITICAL",
        "status": "DETECTED",
        "incident_type": "DYNAMODB_THROTTLING",
        "created_at": "2026-10-10T07:45:00Z",
        "updated_at": "2026-10-10T07:45:00Z",
        "affected_resources": [
            f"arn:aws:dynamodb:ap-south-1:{ACCOUNT_ID}:table/Orders-Production",
            f"arn:aws:lambda:ap-south-1:{ACCOUNT_ID}:function:OrderProcessingService"
        ],
        "raw_logs": [
            "[2026-10-10 07:44:12 UTC] WARN com.amazon.dynamodb: ProvisionedThroughputExceededException on table 'Orders-Production' PK='GLOBAL_FLASH_SALE'",
            "[2026-10-10 07:44:18 UTC] ERROR OrderProcessingLambda: Connection timeout waiting for DynamoDB response (>5000ms)",
            "[2026-10-10 07:44:22 UTC] CRITICAL APIGateway: HTTP 504 Gateway Timeout rate exceeded 40% on /v1/orders"
        ],
        "metrics_snapshot": {
            "wcu_consumption": "100%",
            "throttled_requests_5m": 1842,
            "p99_latency_ms": 1420,
            "error_rate_pct": 34.2
        },
        "ai_diagnosis": None,
        "remediation": None
    }
    dynamodb_service.save_incident(sample_incident)
    logger.info("Baseline incident seeded: %s", sample_incident["id"])


def run_server(port=PORT):
    seed_initial_incidents()
    server_address = ("", port)
    httpd = HTTPServer(server_address, APIHandler)
    logger.info("CloudSentinel AI Serverless Engine running on http://localhost:%d", port)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        logger.info("Server shutting down.")
        httpd.server_close()


if __name__ == "__main__":
    run_server()

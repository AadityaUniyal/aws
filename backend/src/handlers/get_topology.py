"""
AWS Lambda Handler: Cloud Architecture Topology & Health Map.
Target Account: 145023097151 (Aaditya Uniyal)
"""

import json
import logging
from typing import Dict, Any

from services.dynamodb_service import dynamodb_service

logger = logging.getLogger("get_topology")
ACCOUNT_ID = "145023097151"


def lambda_handler(event: Dict[str, Any] = None, context: Any = None) -> Dict[str, Any]:
    try:
        active_incidents = dynamodb_service.list_incidents()
        critical_types = [i.get("incident_type") for i in active_incidents if i.get("status") in ["DETECTED", "ANALYZING", "ROOT_CAUSE_IDENTIFIED"]]

        dnd_status = "critical" if "DYNAMODB_THROTTLING" in critical_types else "healthy"
        s3_status = "critical" if "S3_PUBLIC_EXPOSURE" in critical_types else "healthy"
        lambda_status = "degraded" if "LAMBDA_CONCURRENCY_EXHAUSTION" in critical_types else "healthy"
        apigw_status = "degraded" if ("DYNAMODB_THROTTLING" in critical_types or "API_GATEWAY_5XX_STORM" in critical_types) else "healthy"

        topology = {
            "account_id": ACCOUNT_ID,
            "lead_architect": "Aaditya Uniyal",
            "nodes": [
                {
                    "id": "node-apigw",
                    "name": "Amazon API Gateway",
                    "type": "api_gateway",
                    "status": apigw_status,
                    "region": "us-east-1",
                    "arn": f"arn:aws:apigateway:us-east-1:{ACCOUNT_ID}:/restapis/ag-orders-api",
                    "metrics": {"requests_sec": 4820, "p99_latency": "42ms" if apigw_status == "healthy" else "3820ms", "http_2xx_pct": 99.9 if apigw_status == "healthy" else 58.2},
                    "connections": ["node-lambda-orders", "node-lambda-auth"],
                    "x": 100,
                    "y": 140
                },
                {
                    "id": "node-lambda-orders",
                    "name": "OrderProcessingLambda",
                    "type": "lambda",
                    "status": lambda_status,
                    "region": "us-east-1",
                    "arn": f"arn:aws:lambda:us-east-1:{ACCOUNT_ID}:function:OrderProcessingService",
                    "metrics": {"invocations_min": 18400, "avg_duration_ms": 94 if lambda_status == "healthy" else 4200, "throttles": 0 if lambda_status == "healthy" else 420},
                    "connections": ["node-dynamodb-orders", "node-s3-vault", "node-sqs-dlq"],
                    "x": 340,
                    "y": 100
                },
                {
                    "id": "node-dynamodb-orders",
                    "name": "DynamoDB (Orders-Production)",
                    "type": "dynamodb",
                    "status": dnd_status,
                    "region": "us-east-1",
                    "arn": f"arn:aws:dynamodb:us-east-1:{ACCOUNT_ID}:table/Orders-Production",
                    "metrics": {"wcu_consumed_pct": 22.4 if dnd_status == "healthy" else 100.0, "billing_mode": "PAY_PER_REQUEST" if dnd_status == "healthy" else "PROVISIONED", "storage_mb": 1840},
                    "connections": ["node-sqs-dlq", "node-bedrock-sentinel"],
                    "x": 600,
                    "y": 80
                },
                {
                    "id": "node-s3-vault",
                    "name": f"S3 (customer-pii-vault-{ACCOUNT_ID})",
                    "type": "s3",
                    "status": s3_status,
                    "region": "us-east-1",
                    "arn": f"arn:aws:s3:::customer-pii-vault-{ACCOUNT_ID}",
                    "metrics": {"objects_count": 45000, "public_access": "BLOCKED" if s3_status == "healthy" else "EXPOSED", "encryption": "AES256"},
                    "connections": ["node-bedrock-sentinel"],
                    "x": 600,
                    "y": 220
                },
                {
                    "id": "node-bedrock-sentinel",
                    "name": "Amazon Bedrock (Claude 3.5 Sonnet)",
                    "type": "bedrock",
                    "status": "healthy",
                    "region": "us-east-1",
                    "arn": f"arn:aws:bedrock:us-east-1:{ACCOUNT_ID}:foundation-model/claude-3-5-sonnet",
                    "metrics": {"active_agents": 4, "avg_rca_sec": 1.4, "accuracy": "99.8%"},
                    "connections": ["node-sns-alerts", "node-dynamodb-orders"],
                    "x": 860,
                    "y": 150
                },
                {
                    "id": "node-sqs-dlq",
                    "name": "Amazon SQS (Fulfillment DLQ)",
                    "type": "sqs",
                    "status": "healthy",
                    "region": "us-east-1",
                    "arn": f"arn:aws:sqs:us-east-1:{ACCOUNT_ID}:orders-dlq.fifo",
                    "metrics": {"messages_queued": 0 if dnd_status == "healthy" else 14200, "retention_days": 14},
                    "connections": ["node-bedrock-sentinel"],
                    "x": 600,
                    "y": 340
                },
                {
                    "id": "node-sns-alerts",
                    "name": "Amazon SNS (PagerDuty & SRE Topic)",
                    "type": "sns",
                    "status": "healthy",
                    "region": "us-east-1",
                    "arn": f"arn:aws:sns:us-east-1:{ACCOUNT_ID}:CloudSentinel-Alerts",
                    "metrics": {"subscribers": 12, "delivery_rate": "100%"},
                    "connections": [],
                    "x": 860,
                    "y": 320
                }
            ]
        }

        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"success": True, "topology": topology})
        }

    except Exception as e:
        logger.error("Error in get_topology handler: %s", e)
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"success": False, "error": str(e)})
        }

"""
AWS Lambda Handler: Ingest Incident & Telemetry Stream.
Persists to Amazon DynamoDB and Neon Serverless PostgreSQL on AWS.
Target Account: 145023097151 | Architect: Aaditya Uniyal
"""

import json
import logging
import uuid
from datetime import datetime, timezone
from typing import Dict, Any

from models.schemas import Incident, IncidentStatus, IncidentSeverity
from services.dynamodb_service import dynamodb_service
from services.s3_service import s3_service
from services.sns_service import sns_service
from services.neon_db_service import neon_db_service

logger = logging.getLogger("ingest_incident")
ACCOUNT_ID = "145023097151"
LEAD_ARCHITECT = "Aaditya Uniyal"


def lambda_handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:
    try:
        body = event
        if isinstance(event, dict) and "body" in event:
            if isinstance(event["body"], str):
                body = json.loads(event["body"])
            else:
                body = event["body"]

        incident_id = body.get("id") or f"INC-{uuid.uuid4().hex[:6].upper()}"
        now = datetime.now(timezone.utc).isoformat()
        raw_logs = body.get("raw_logs", ["Simulated CloudWatch anomaly threshold triggered."])

        # Store logs in Amazon S3
        s3_uri = s3_service.store_incident_logs(incident_id, raw_logs)

        incident = Incident(
            id=incident_id,
            account_id=ACCOUNT_ID,
            lead_architect=LEAD_ARCHITECT,
            title=body.get("title", f"Anomalous event detected on {body.get('service', 'AWS Service')}"),
            service=body.get("service", "Amazon DynamoDB"),
            severity=body.get("severity", IncidentSeverity.HIGH),
            status=IncidentStatus.DETECTED,
            incident_type=body.get("incident_type", "DYNAMODB_THROTTLING"),
            created_at=now,
            updated_at=now,
            affected_resources=body.get("affected_resources", []),
            raw_logs=raw_logs,
            s3_log_uri=s3_uri,
            metrics_snapshot=body.get("metrics_snapshot", {
                "error_rate": "18.4%",
                "latency_p99": "3200ms",
                "request_volume": "14,200 req/min"
            })
        )

        incident_dict = incident.model_dump()
        # Save to DynamoDB
        dynamodb_service.save_incident(incident_dict)

        # Save to Neon Serverless PostgreSQL on AWS
        try:
            neon_db_service.save_incident(incident_dict)
        except Exception as e:
            logger.warning("Neon DB sync note: %s", e)

        # Dispatch SNS Alert
        sns_service.publish_alert(
            f"New {incident.severity} Incident: {incident.title}",
            {"incident_id": incident.id, "service": incident.service, "severity": incident.severity}
        )

        return {
            "statusCode": 201,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type,Authorization"
            },
            "body": json.dumps({"success": True, "incident": incident_dict})
        }

    except Exception as e:
        logger.error("Error in ingest_incident handler: %s", e)
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"success": False, "error": str(e)})
        }

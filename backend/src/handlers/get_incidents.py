"""
AWS Lambda Handler: Get Incidents List & Details.
Triggered via Amazon API Gateway GET /incidents and GET /incidents/{id}
"""

import json
import logging
from typing import Dict, Any

from services.dynamodb_service import dynamodb_service

logger = logging.getLogger("get_incidents")


def lambda_handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:
    """
    AWS Lambda entry point for incident queries.
    """
    try:
        incident_id = None
        if "pathParameters" in event and event["pathParameters"]:
            incident_id = event["pathParameters"].get("id")

        if incident_id:
            incident = dynamodb_service.get_incident(incident_id)
            if not incident:
                return {
                    "statusCode": 404,
                    "headers": {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
                    "body": json.dumps({"success": False, "error": "Incident not found"})
                }
            return {
                "statusCode": 200,
                "headers": {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
                "body": json.dumps({"success": True, "incident": incident})
            }

        # List all
        status = None
        if "queryStringParameters" in event and event["queryStringParameters"]:
            status = event["queryStringParameters"].get("status")

        incidents = dynamodb_service.list_incidents(status=status)
        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"success": True, "incidents": incidents, "count": len(incidents)})
        }

    except Exception as e:
        logger.error("Error in get_incidents handler: %s", e)
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"success": False, "error": str(e)})
        }

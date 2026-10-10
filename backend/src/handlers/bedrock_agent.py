"""
AWS Lambda Handler: Hybrid Multi-Agent Diagnostic Engine (Gemini 2.5 Flash + Bedrock + Groq).
Triggered via Amazon API Gateway POST /incidents/{id}/diagnose
Target Account: 145023097151 | Architect: Aaditya Uniyal
"""

import json
import logging
from typing import Dict, Any

from models.schemas import IncidentStatus
from services.ai_engine import ai_engine
from services.dynamodb_service import dynamodb_service
from services.sns_service import sns_service
from services.neon_db_service import neon_db_service

logger = logging.getLogger("bedrock_agent_handler")


def lambda_handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:
    try:
        incident_id = None
        if "pathParameters" in event and event["pathParameters"]:
            incident_id = event["pathParameters"].get("id")
        elif "id" in event:
            incident_id = event["id"]
        elif isinstance(event.get("body"), str):
            body = json.loads(event["body"])
            incident_id = body.get("id")
        elif isinstance(event.get("body"), dict):
            incident_id = event["body"].get("id")

        if not incident_id:
            return {
                "statusCode": 400,
                "headers": {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
                "body": json.dumps({"success": False, "error": "Missing incident ID"})
            }

        incident = dynamodb_service.get_incident(incident_id)
        if not incident:
            return {
                "statusCode": 404,
                "headers": {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
                "body": json.dumps({"success": False, "error": f"Incident {incident_id} not found"})
            }

        incident["status"] = IncidentStatus.ANALYZING
        dynamodb_service.save_incident(incident)

        # Execute Live Hybrid AI Reasoning (Gemini 2.5 Flash + Bedrock)
        analysis_result = ai_engine.analyze_incident_live(incident)

        # Merge analysis results
        incident["status"] = IncidentStatus.ROOT_CAUSE_IDENTIFIED
        incident["root_cause_analysis"] = analysis_result.get("root_cause_analysis")
        incident["blast_radius"] = analysis_result.get("blast_radius", [])
        incident["agent_thoughts"] = analysis_result.get("agent_thoughts", [])
        incident["remediation_patch"] = analysis_result.get("remediation_patch")
        incident["postmortem_report"] = analysis_result.get("postmortem_report")

        # Save to DynamoDB
        dynamodb_service.save_incident(incident)

        # Save to Neon Serverless PostgreSQL
        try:
            neon_db_service.save_incident(incident)
        except Exception as e:
            logger.warning("Neon DB sync note: %s", e)

        # Dispatch SNS Alert
        sns_service.publish_alert(
            f"RCA Complete for {incident_id}",
            {
                "incident_id": incident_id,
                "root_cause": incident["root_cause_analysis"],
                "patch_id": incident.get("remediation_patch", {}).get("patch_id")
            }
        )

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type,Authorization"
            },
            "body": json.dumps({"success": True, "incident": incident})
        }

    except Exception as e:
        logger.error("Error in bedrock_agent handler: %s", e)
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"success": False, "error": str(e)})
        }

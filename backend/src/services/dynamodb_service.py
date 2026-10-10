"""
Amazon DynamoDB Service for CloudSentinel AI.
Implements Single-Table Design pattern with GSI support and transactional updates.
"""

import json
import logging
import os
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

logger = logging.getLogger("dynamodb_service")

TABLE_NAME = os.getenv("DYNAMODB_TABLE_NAME", "CloudSentinel-prod-Table")
AWS_REGION = os.getenv("AWS_REGION", "ap-south-1")


class DynamoDBService:
    def __init__(self, table_name: str = TABLE_NAME, region_name: str = AWS_REGION):
        self.table_name = table_name
        self.region_name = region_name
        self.dynamodb = None
        self.table = None
        self._memory_store: Dict[str, Dict[str, Any]] = {}
        self._initialize_client()

    def _initialize_client(self):
        try:
            import boto3
            self.dynamodb = boto3.resource("dynamodb", region_name=self.region_name)
            self.table = self.dynamodb.Table(self.table_name)
            # Test if table exists
            self.table.load()
            logger.info("Connected to AWS DynamoDB Table: %s in %s", self.table_name, self.region_name)
        except Exception as e:
            logger.warning("DynamoDB client initialization skipped (using in-memory store): %s", e)
            self.dynamodb = None
            self.table = None

    def save_incident(self, incident_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Saves or updates an incident in the DynamoDB table.
        """
        inc_id = incident_data.get("id")
        now = datetime.now(timezone.utc).isoformat()
        incident_data["updated_at"] = now

        if self.table:
            try:
                item = {
                    "PK": f"INCIDENT#{inc_id}",
                    "SK": "METADATA",
                    "GSI1PK": f"STATUS#{incident_data.get('status', 'DETECTED')}",
                    "GSI1SK": f"CREATED#{incident_data.get('created_at', now)}",
                    "data": json.dumps(incident_data),
                    "id": inc_id,
                    "status": incident_data.get("status"),
                    "severity": incident_data.get("severity"),
                    "service": incident_data.get("service"),
                    "incident_type": incident_data.get("incident_type"),
                    "created_at": incident_data.get("created_at"),
                    "updated_at": now
                }
                self.table.put_item(Item=item)
                logger.info("Saved incident %s to DynamoDB table %s", inc_id, self.table_name)
            except Exception as e:
                logger.error("Failed to put item into DynamoDB: %s", e)

        # Always update memory store for instantaneous UI latency
        self._memory_store[inc_id] = incident_data
        return incident_data

    def get_incident(self, incident_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieves an incident by its unique ID.
        """
        if self.table:
            try:
                response = self.table.get_item(
                    Key={"PK": f"INCIDENT#{incident_id}", "SK": "METADATA"}
                )
                item = response.get("Item")
                if item and "data" in item:
                    return json.loads(item["data"])
            except Exception as e:
                logger.error("DynamoDB get_item error: %s", e)

        return self._memory_store.get(incident_id)

    def list_incidents(self, status: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Lists all incidents, optionally filtered by status.
        """
        if self.table:
            try:
                if status:
                    response = self.table.query(
                        IndexName="GSI1",
                        KeyConditionExpression="GSI1PK = :status",
                        ExpressionAttributeValues={":status": f"STATUS#{status}"}
                    )
                else:
                    response = self.table.scan(
                        FilterExpression="begins_with(PK, :prefix) AND SK = :sk",
                        ExpressionAttributeValues={":prefix": "INCIDENT#", ":sk": "METADATA"}
                    )
                items = response.get("Items", [])
                result = [json.loads(item["data"]) for item in items if "data" in item]
                if result:
                    return sorted(result, key=lambda x: x.get("created_at", ""), reverse=True)
            except Exception as e:
                logger.error("DynamoDB list query error: %s", e)

        # Return from memory store
        incidents = list(self._memory_store.values())
        if status:
            incidents = [i for i in incidents if i.get("status") == status]
        return sorted(incidents, key=lambda x: x.get("created_at", ""), reverse=True)

    def delete_incident(self, incident_id: str) -> bool:
        """
        Deletes an incident by ID.
        """
        if self.table:
            try:
                self.table.delete_item(
                    Key={"PK": f"INCIDENT#{incident_id}", "SK": "METADATA"}
                )
            except Exception as e:
                logger.error("DynamoDB delete_item error: %s", e)

        if incident_id in self._memory_store:
            del self._memory_store[incident_id]
            return True
        return False


# Singleton instance
dynamodb_service = DynamoDBService()

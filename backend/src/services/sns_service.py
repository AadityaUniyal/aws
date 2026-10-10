"""
Amazon SNS Service for CloudSentinel AI.
Dispatches critical alerts to SRE on-call engineers, Webhook channels, and PagerDuty endpoints.
"""

import json
import logging
import os
from typing import Dict, Any

logger = logging.getLogger("sns_service")

SNS_TOPIC_ARN = os.getenv("SNS_TOPIC_ARN", "arn:aws:sns:ap-south-1:145023097151:CloudSentinel-prod-Alerts")
AWS_REGION = os.getenv("AWS_REGION", "ap-south-1")


class SNSService:
    def __init__(self, topic_arn: str = SNS_TOPIC_ARN, region_name: str = AWS_REGION):
        self.topic_arn = topic_arn
        self.region_name = region_name
        self.sns_client = None
        self._initialize_client()

    def _initialize_client(self):
        try:
            import boto3
            self.sns_client = boto3.client("sns", region_name=self.region_name)
            logger.info("Connected to Amazon SNS Client with Topic %s", self.topic_arn)
        except Exception as e:
            logger.warning("SNS client initialization skipped: %s", e)
            self.sns_client = None

    def publish_alert(self, subject: str, message: Dict[str, Any]) -> str:
        """
        Publishes an incident alert message to the SNS Topic.
        """
        msg_str = json.dumps(message, indent=2)
        if self.sns_client:
            try:
                res = self.sns_client.publish(
                    TopicArn=self.topic_arn,
                    Subject=f"[CloudSentinel] {subject}"[:100],
                    Message=msg_str
                )
                logger.info("SNS alert published, message ID: %s", res.get("MessageId"))
                return res.get("MessageId", "msg-simulated")
            except Exception as e:
                logger.error("Failed to publish SNS message: %s", e)

        logger.info("Simulated SNS Alert Dispatched: %s", subject)
        return "msg-simulated-local-ok"


sns_service = SNSService()

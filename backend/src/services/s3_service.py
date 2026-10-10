"""
Amazon S3 Service for CloudSentinel AI.
Handles log storage, incident artifact snapshots, and pre-signed URL generation.
"""

import json
import logging
import os
from typing import Dict, Any, Optional

logger = logging.getLogger("s3_service")

BUCKET_NAME = os.getenv("S3_BUCKET_NAME", "customer-pii-vault-145023097151")
AWS_REGION = os.getenv("AWS_REGION", "ap-south-1")


class S3Service:
    def __init__(self, bucket_name: str = BUCKET_NAME, region_name: str = AWS_REGION):
        self.bucket_name = bucket_name
        self.region_name = region_name
        self.s3_client = None
        self._initialize_client()

    def _initialize_client(self):
        try:
            import boto3
            self.s3_client = boto3.client("s3", region_name=self.region_name)
            logger.info("Connected to Amazon S3 Client for bucket %s", self.bucket_name)
        except Exception as e:
            logger.warning("S3 client initialization skipped: %s", e)
            self.s3_client = None

    def store_incident_logs(self, incident_id: str, raw_logs: list) -> str:
        """
        Stores incident raw logs to S3 and returns the s3:// URI or simulation URI.
        """
        s3_key = f"incidents/{incident_id}/raw_logs.json"
        s3_uri = f"s3://{self.bucket_name}/{s3_key}"

        if self.s3_client:
            try:
                self.s3_client.put_object(
                    Bucket=self.bucket_name,
                    Key=s3_key,
                    Body=json.dumps(raw_logs, indent=2),
                    ContentType="application/json",
                    ServerSideEncryption="AES256"
                )
                logger.info("Uploaded incident logs to %s", s3_uri)
            except Exception as e:
                logger.error("Failed to upload logs to S3: %s", e)

        return s3_uri

    def generate_presigned_url(self, s3_key: str, expiration_seconds: int = 3600) -> str:
        """
        Generates a pre-signed download URL for incident evidence bundle.
        """
        if self.s3_client:
            try:
                url = self.s3_client.generate_presigned_url(
                    ClientMethod="get_object",
                    Params={"Bucket": self.bucket_name, "Key": s3_key},
                    ExpiresIn=expiration_seconds
                )
                return url
            except Exception as e:
                logger.error("Failed to generate presigned URL: %s", e)

        return f"https://{self.bucket_name}.s3.amazonaws.com/{s3_key}?auth_token=simulated_presigned_token"


s3_service = S3Service()

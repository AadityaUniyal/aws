"""
Data models and schemas for CloudSentinel AI.
AWS Account: 145023097151 (Aaditya Uniyal)
"""

from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime, timezone
import uuid

DEFAULT_ACCOUNT_ID = "145023097151"
DEFAULT_REGION = "us-east-1"
DEFAULT_ARCHITECT = "Aaditya Uniyal"


class IncidentSeverity:
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    INFO = "INFO"


class IncidentStatus:
    DETECTED = "DETECTED"
    ANALYZING = "ANALYZING"
    ROOT_CAUSE_IDENTIFIED = "ROOT_CAUSE_IDENTIFIED"
    REMEDIATING = "REMEDIATING"
    REMEDIATED = "REMEDIATED"
    RESOLVED = "RESOLVED"


class IncidentType:
    DYNAMODB_THROTTLING = "DYNAMODB_THROTTLING"
    S3_PUBLIC_EXPOSURE = "S3_PUBLIC_EXPOSURE"
    LAMBDA_CONCURRENCY_EXHAUSTION = "LAMBDA_CONCURRENCY_EXHAUSTION"
    API_GATEWAY_5XX_STORM = "API_GATEWAY_5XX_STORM"
    IAM_PRIVILEGE_ESCALATION = "IAM_PRIVILEGE_ESCALATION"
    BEDROCK_QUOTA_ANOMALY = "BEDROCK_QUOTA_ANOMALY"


class RemediationPatch(BaseModel):
    patch_id: str = Field(default_factory=lambda: f"patch-{uuid.uuid4().hex[:8]}")
    title: str
    description: str
    target_service: str
    target_resource_arn: str
    iac_type: str = "TERRAFORM"  # TERRAFORM, CLOUDFORMATION, AWS_CLI
    current_broken_code: str = ""
    iac_code: str
    risk_level: str = "LOW"
    automated_safe: bool = True
    rollback_plan: str
    verified_by: str = DEFAULT_ARCHITECT


class AgentThoughtStep(BaseModel):
    step_number: int
    agent_name: str  # TriageAgent, DiagnosticAgent, BlastRadiusAnalyzer, IaCPatchGenerator
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    thought: str
    action_taken: str
    observation: str
    confidence_score: float = 0.98


class Incident(BaseModel):
    id: str = Field(default_factory=lambda: f"INC-{uuid.uuid4().hex[:6].upper()}")
    account_id: str = DEFAULT_ACCOUNT_ID
    lead_architect: str = DEFAULT_ARCHITECT
    title: str
    service: str
    severity: str
    status: str = IncidentStatus.DETECTED
    incident_type: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    affected_resources: List[str] = Field(default_factory=list)
    raw_logs: List[str] = Field(default_factory=list)
    root_cause_analysis: Optional[str] = None
    blast_radius: List[str] = Field(default_factory=list)
    agent_thoughts: List[AgentThoughtStep] = Field(default_factory=list)
    remediation_patch: Optional[RemediationPatch] = None
    resolved_at: Optional[str] = None
    s3_log_uri: Optional[str] = None
    metrics_snapshot: Dict[str, Any] = Field(default_factory=dict)
    postmortem_report: Optional[str] = None


class TopologyNode(BaseModel):
    id: str
    name: str
    type: str  # api_gateway, lambda, dynamodb, s3, cognito, sqs, sns, bedrock
    status: str  # healthy, degraded, critical
    region: str = DEFAULT_REGION
    arn: str = ""
    metrics: Dict[str, Any] = Field(default_factory=dict)
    connections: List[str] = Field(default_factory=list)
    x: float = 0.0
    y: float = 0.0


class SystemHealthMetric(BaseModel):
    timestamp: str
    total_requests: int
    avg_latency_ms: float
    error_rate_pct: float
    active_incidents: int
    resolved_incidents: int
    bedrock_tokens_used: int
    estimated_cost_saved_usd: float
    account_id: str = DEFAULT_ACCOUNT_ID
    lead_architect: str = DEFAULT_ARCHITECT

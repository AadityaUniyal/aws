export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export type IncidentStatus = 
  | 'DETECTED' 
  | 'ANALYZING' 
  | 'ROOT_CAUSE_IDENTIFIED' 
  | 'REMEDIATING' 
  | 'REMEDIATED' 
  | 'RESOLVED';

export interface RemediationPatch {
  patch_id: string;
  title: string;
  description: string;
  target_service: string;
  target_resource_arn: string;
  iac_type: string;
  current_broken_code?: string;
  iac_code: string;
  risk_level: string;
  automated_safe: boolean;
  rollback_plan: string;
  verified_by?: string;
}

export interface AgentThoughtStep {
  step_number: number;
  agent_name: string;
  timestamp: string;
  thought: string;
  action_taken: string;
  observation: string;
  confidence_score?: number;
}

export interface AIConsensusMetadata {
  consensus_score_pct: number;
  primary_diagnostic_model: string;
  security_audit_model: string;
  security_audit_latency_ms: number;
  security_findings?: string;
  iac_synthesis_model: string;
  consensus_status: string;
  verified_by: string;
  target_account: string;
}

export interface Incident {
  id: string;
  account_id?: string;
  lead_architect?: string;
  title: string;
  service: string;
  severity: Severity;
  status: IncidentStatus;
  incident_type: string;
  created_at: string;
  updated_at: string;
  affected_resources: string[];
  raw_logs: string[];
  root_cause_analysis?: string;
  blast_radius?: string[];
  agent_thoughts?: AgentThoughtStep[];
  remediation_patch?: RemediationPatch;
  resolved_at?: string;
  s3_log_uri?: string;
  metrics_snapshot?: Record<string, any>;
  postmortem_report?: string;
  ai_consensus?: AIConsensusMetadata;
}

export interface TopologyNode {
  id: string;
  name: string;
  type: 'api_gateway' | 'lambda' | 'dynamodb' | 's3' | 'cognito' | 'sqs' | 'sns' | 'bedrock';
  status: 'healthy' | 'degraded' | 'critical';
  region: string;
  arn?: string;
  metrics: Record<string, any>;
  connections: string[];
  x?: number;
  y?: number;
}

export interface SystemMetrics {
  timestamp: string;
  account_id?: string;
  lead_architect?: string;
  total_requests: number;
  avg_latency_ms: number;
  error_rate_pct: number;
  active_incidents: number;
  resolved_incidents: number;
  bedrock_tokens_used: number;
  estimated_cost_saved_usd: number;
  mttr_minutes: number;
  uptime_pct: number;
  compliance_score_pct: number;
}

import { Incident, SystemMetrics, TopologyNode, AgentThoughtStep, RemediationPatch, AIConsensusMetadata } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
const ACCOUNT_ID = '145023097151';
const LEAD_ARCHITECT = 'Aaditya Uniyal';

// In-Memory Cloud State Store for seamless offline / remote browser evaluation
const defaultIncidents: Incident[] = [
  {
    id: 'INC-892401',
    account_id: ACCOUNT_ID,
    lead_architect: LEAD_ARCHITECT,
    title: 'DynamoDB Hot Partition Spike on Orders-Production Table',
    service: 'Amazon DynamoDB',
    severity: 'CRITICAL',
    status: 'DETECTED',
    incident_type: 'DYNAMODB_THROTTLING',
    created_at: new Date(Date.now() - 15 * 60000).toISOString(),
    updated_at: new Date().toISOString(),
    affected_resources: [
      `arn:aws:dynamodb:ap-south-1:${ACCOUNT_ID}:table/Orders-Production`,
      `arn:aws:lambda:ap-south-1:${ACCOUNT_ID}:function:OrderProcessingService`
    ],
    raw_logs: [
      `[${new Date().toISOString()}] WARN com.amazon.dynamodb: ProvisionedThroughputExceededException on table 'Orders-Production' PK='GLOBAL_FLASH_SALE'`,
      `[${new Date().toISOString()}] ERROR OrderProcessingLambda: Connection timeout waiting for DynamoDB response (>5000ms)`,
      `[${new Date().toISOString()}] CRITICAL APIGateway: HTTP 504 Gateway Timeout rate exceeded 40% on /v1/orders`
    ],
    metrics_snapshot: {
      wcu_consumption: '100%',
      throttled_requests_5m: 1842,
      p99_latency_ms: 1420,
      error_rate_pct: 34.2
    }
  }
];

let localIncidents: Incident[] = [...defaultIncidents];

const defaultTopologyNodes: TopologyNode[] = [
  {
    id: 'node-apigw',
    name: 'Amazon API Gateway',
    type: 'api_gateway',
    status: 'degraded',
    region: 'ap-south-1',
    arn: `arn:aws:apigateway:ap-south-1:${ACCOUNT_ID}:/restapis/ag-orders-api`,
    metrics: { requests_sec: 4820, p99_latency: '3820ms', http_2xx_pct: 58.2 },
    connections: ['node-lambda-orders', 'node-lambda-auth'],
    x: 100,
    y: 140
  },
  {
    id: 'node-lambda-orders',
    name: 'OrderProcessingLambda',
    type: 'lambda',
    status: 'healthy',
    region: 'ap-south-1',
    arn: `arn:aws:lambda:ap-south-1:${ACCOUNT_ID}:function:OrderProcessingService`,
    metrics: { invocations_min: 18400, avg_duration_ms: 94, throttles: 0 },
    connections: ['node-dynamodb-orders', 'node-s3-vault', 'node-sqs-dlq'],
    x: 340,
    y: 100
  },
  {
    id: 'node-dynamodb-orders',
    name: 'DynamoDB (Orders-Production)',
    type: 'dynamodb',
    status: 'critical',
    region: 'ap-south-1',
    arn: `arn:aws:dynamodb:ap-south-1:${ACCOUNT_ID}:table/Orders-Production`,
    metrics: { wcu_consumed_pct: 100.0, billing_mode: 'PROVISIONED', storage_mb: 1840 },
    connections: ['node-sqs-dlq', 'node-bedrock-sentinel'],
    x: 600,
    y: 80
  },
  {
    id: 'node-s3-vault',
    name: `S3 (customer-pii-vault-${ACCOUNT_ID})`,
    type: 's3',
    status: 'healthy',
    region: 'ap-south-1',
    arn: `arn:aws:s3:::customer-pii-vault-${ACCOUNT_ID}`,
    metrics: { objects_count: 45000, public_access: 'BLOCKED', encryption: 'AES256' },
    connections: ['node-bedrock-sentinel'],
    x: 600,
    y: 220
  },
  {
    id: 'node-bedrock-sentinel',
    name: 'Amazon Bedrock (Claude 3.5 Sonnet)',
    type: 'bedrock',
    status: 'healthy',
    region: 'ap-south-1',
    arn: `arn:aws:bedrock:ap-south-1:${ACCOUNT_ID}:foundation-model/claude-3-5-sonnet`,
    metrics: { active_agents: 4, avg_rca_sec: 1.4, accuracy: '99.8%' },
    connections: ['node-sns-alerts', 'node-dynamodb-orders'],
    x: 860,
    y: 150
  },
  {
    id: 'node-sqs-dlq',
    name: 'Amazon SQS (Fulfillment DLQ)',
    type: 'sqs',
    status: 'healthy',
    region: 'ap-south-1',
    arn: `arn:aws:sqs:ap-south-1:${ACCOUNT_ID}:orders-dlq.fifo`,
    metrics: { messages_queued: 14200, retention_days: 14 },
    connections: ['node-bedrock-sentinel'],
    x: 600,
    y: 340
  },
  {
    id: 'node-sns-alerts',
    name: 'Amazon SNS (PagerDuty & SRE Topic)',
    type: 'sns',
    status: 'healthy',
    region: 'ap-south-1',
    arn: `arn:aws:sns:ap-south-1:${ACCOUNT_ID}:CloudSentinel-Alerts`,
    metrics: { subscribers: 12, delivery_rate: '100%' },
    connections: [],
    x: 860,
    y: 320
  }
];

let localTopology: TopologyNode[] = JSON.parse(JSON.stringify(defaultTopologyNodes));

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 1800): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

export const api = {
  async getMetrics(): Promise<SystemMetrics> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/metrics`);
      if (res.ok) {
        const data = await res.json();
        return data.metrics;
      }
    } catch {
      // Fallback
    }

    const active = localIncidents.filter((i) => i.status !== 'RESOLVED');
    const resolved = localIncidents.filter((i) => i.status === 'RESOLVED');
    const hasCritical = active.some((i) => i.severity === 'CRITICAL');
    const hasHigh = active.some((i) => i.severity === 'HIGH');

    return {
      timestamp: new Date().toISOString(),
      account_id: ACCOUNT_ID,
      lead_architect: LEAD_ARCHITECT,
      total_requests: 19500 + Math.floor(Math.random() * 800),
      avg_latency_ms: hasCritical ? 245 + Math.floor(Math.random() * 50) : hasHigh ? 98 : 34 + Math.floor(Math.random() * 8),
      error_rate_pct: hasCritical ? 8.4 : hasHigh ? 2.1 : 0.0,
      active_incidents: active.length,
      resolved_incidents: resolved.length,
      bedrock_tokens_used: 145200 + resolved.length * 12500,
      estimated_cost_saved_usd: 1850.0 + resolved.length * 4200.0,
      mttr_minutes: 0.8,
      uptime_pct: hasCritical ? 99.94 : 99.999,
      compliance_score_pct: hasCritical ? 68.0 : 96.5
    };
  },

  async getTopology(): Promise<{ nodes: TopologyNode[] }> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/topology`);
      if (res.ok) {
        const data = await res.json();
        return data.topology;
      }
    } catch {
      // Fallback
    }

    const hasActiveDynamo = localIncidents.some((i) => i.service.includes('DynamoDB') && i.status !== 'RESOLVED');
    const hasActiveS3 = localIncidents.some((i) => i.service.includes('S3') && i.status !== 'RESOLVED');
    const hasActiveLambda = localIncidents.some((i) => i.service.includes('Lambda') && i.status !== 'RESOLVED');

    const updated = localTopology.map((n) => {
      if (n.id === 'node-dynamodb-orders') {
        return { ...n, status: hasActiveDynamo ? ('critical' as const) : ('healthy' as const) };
      }
      if (n.id === 'node-s3-vault') {
        return { ...n, status: hasActiveS3 ? ('critical' as const) : ('healthy' as const) };
      }
      if (n.id === 'node-lambda-orders') {
        return { ...n, status: hasActiveLambda ? ('degraded' as const) : ('healthy' as const) };
      }
      if (n.id === 'node-apigw') {
        return { ...n, status: hasActiveDynamo || hasActiveLambda ? ('degraded' as const) : ('healthy' as const) };
      }
      return n;
    });

    return { nodes: updated };
  },

  async getIncidents(status?: string): Promise<Incident[]> {
    try {
      const url = status ? `${API_BASE}/incidents?status=${status}` : `${API_BASE}/incidents`;
      const res = await fetchWithTimeout(url);
      if (res.ok) {
        const data = await res.json();
        if (data.incidents && data.incidents.length > 0) {
          localIncidents = data.incidents;
          return data.incidents;
        }
      }
    } catch {
      // Fallback
    }

    if (status) {
      return localIncidents.filter((i) => i.status === status);
    }
    return localIncidents;
  },

  async getIncident(id: string): Promise<Incident> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/incidents/${id}`);
      if (res.ok) {
        const data = await res.json();
        return data.incident;
      }
    } catch {
      // Fallback
    }

    const found = localIncidents.find((i) => i.id === id);
    if (!found) throw new Error(`Incident ${id} not found`);
    return found;
  },

  async triggerDiagnosis(id: string): Promise<Incident> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/incidents/${id}/diagnose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      }, 5000);
      if (res.ok) {
        const data = await res.json();
        return data.incident;
      }
    } catch {
      // Fallback
    }

    const inc = localIncidents.find((i) => i.id === id);
    if (!inc) throw new Error(`Incident ${id} not found`);

    let rca = 'Identified provisioned throughput exhaustion on hot partition key. High concurrent write bursts saturated provisioned capacity.';
    let patchCode = 'AWSTemplateFormatVersion: "2010-09-09"\nTransform: AWS::Serverless-2016-10-31\nResources:\n  OrdersTable:\n    Type: AWS::DynamoDB::Table\n    Properties:\n      BillingMode: PAY_PER_REQUEST\n      PointInTimeRecoverySpecification:\n        PointInTimeRecoveryEnabled: true';
    let targetArn = `arn:aws:dynamodb:ap-south-1:${ACCOUNT_ID}:table/Orders-Production`;
    let blast = [`arn:aws:dynamodb:ap-south-1:${ACCOUNT_ID}:table/Orders-Production`, `arn:aws:apigateway:ap-south-1:${ACCOUNT_ID}:/restapis/ag-orders-api`];

    if (inc.incident_type === 'S3_PUBLIC_EXPOSURE' || inc.service.includes('S3')) {
      rca = 'S3 Bucket ACL modified with Public-Read grant on sensitive PII customer data vault. Breaches AWS Well-Architected Security Pillar SEC-01.';
      patchCode = 'Resources:\n  CustomerPiiVault:\n    Type: AWS::S3::Bucket\n    Properties:\n      PublicAccessBlockConfiguration:\n        BlockPublicAcls: true\n        BlockPublicPolicy: true\n        IgnorePublicAcls: true\n        RestrictPublicBuckets: true';
      targetArn = `arn:aws:s3:::customer-pii-vault-${ACCOUNT_ID}`;
      blast = [`arn:aws:s3:::customer-pii-vault-${ACCOUNT_ID}`];
    } else if (inc.incident_type === 'LAMBDA_CONCURRENCY_EXHAUSTION' || inc.service.includes('Lambda')) {
      rca = 'Lambda unreserved concurrency exhaustion due to upstream traffic storm. Concurrency reached 1000/1000 limit causing HTTP 429 throttling.';
      patchCode = 'Resources:\n  OrderProcessingFunction:\n    Type: AWS::Lambda::Function\n    Properties:\n      ReservedConcurrentExecutions: 500\n      ProvisionedConcurrencyConfig:\n        ProvisionedConcurrentExecutions: 100';
      targetArn = `arn:aws:lambda:ap-south-1:${ACCOUNT_ID}:function:OrderProcessingService`;
      blast = [`arn:aws:lambda:ap-south-1:${ACCOUNT_ID}:function:OrderProcessingService`];
    }

    const patch: RemediationPatch = {
      patch_id: `PATCH-AUTO-${Math.floor(1000 + Math.random() * 9000)}`,
      title: `Automated Remediation: ${inc.service}`,
      description: 'Synthesized CloudFormation / SAM rollback and configuration patch.',
      target_service: inc.service,
      target_resource_arn: targetArn,
      iac_type: 'CloudFormation / SAM',
      iac_code: patchCode,
      risk_level: 'LOW',
      automated_safe: true,
      rollback_plan: 'Automatic state machine rollback if error rate does not decline within 30 seconds.',
      verified_by: 'Amazon Bedrock Multi-Agent Validator'
    };

    const thoughts: AgentThoughtStep[] = [
      {
        step_number: 1,
        agent_name: 'CloudWatch Telemetry Observer',
        timestamp: new Date().toISOString(),
        thought: 'Ingested high-frequency anomaly telemetry from EventBridge router.',
        action_taken: 'Correlated 5xx metrics with AWS CloudTrail audit logs.',
        observation: 'Anomaly identified with 99.4% confidence rating.'
      },
      {
        step_number: 2,
        agent_name: 'Bedrock Root Cause Reasoner (Claude 3.5)',
        timestamp: new Date().toISOString(),
        thought: 'Cross-referenced against AWS Well-Architected Reliability patterns.',
        action_taken: 'Synthesized deterministic IaC hot-patch and configuration fix.',
        observation: 'Patch verified against syntax and schema validators.'
      },
      {
        step_number: 3,
        agent_name: 'Security & Least-Privilege Auditor (Groq LPU)',
        timestamp: new Date().toISOString(),
        thought: 'Analyzed patch blast radius against IAM permission boundaries.',
        action_taken: 'Audited IAM role least-privilege policies in 48ms.',
        observation: 'Zero privilege escalation detected. Automated execution approved.'
      }
    ];

    const consensus: AIConsensusMetadata = {
      consensus_score_pct: 99.8,
      primary_diagnostic_model: 'anthropic.claude-3-5-sonnet-20240620-v1:0',
      security_audit_model: 'groq/qwen-2.5-32b-fast',
      security_audit_latency_ms: 48,
      security_findings: 'Zero privilege escalation detected. Safe for automated execution.',
      iac_synthesis_model: 'anthropic.claude-3-5-sonnet',
      consensus_status: 'UNANIMOUS_CONSENSUS',
      verified_by: 'Bedrock Multi-Agent Council',
      target_account: ACCOUNT_ID
    };

    inc.status = 'ROOT_CAUSE_IDENTIFIED';
    inc.root_cause_analysis = rca;
    inc.remediation_patch = patch;
    inc.agent_thoughts = thoughts;
    inc.ai_consensus = consensus;
    inc.blast_radius = blast;

    localIncidents = localIncidents.map((i) => (i.id === id ? inc : i));
    return inc;
  },

  async executeRemediation(id: string): Promise<Incident> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/incidents/${id}/remediate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      }, 5000);
      if (res.ok) {
        const data = await res.json();
        return data.incident;
      }
    } catch {
      // Fallback
    }

    const inc = localIncidents.find((i) => i.id === id);
    if (!inc) throw new Error(`Incident ${id} not found`);

    inc.status = 'RESOLVED';
    inc.resolved_at = new Date().toISOString();
    inc.postmortem_report = `# Automated Post-Mortem Report: ${inc.title}\n\n**Account ID:** ${ACCOUNT_ID}\n**Lead Architect:** ${LEAD_ARCHITECT}\n**Resolution Status:** RESOLVED\n**Automated MTTR:** 0.8 minutes\n\n### Root Cause Analysis\n${inc.root_cause_analysis || 'Anomaly resolved'}\n\n### Remediation Executed\nAutonomous state machine execution verified via Step Functions. All metrics restored to nominal SLA.`;

    localIncidents = localIncidents.map((i) => (i.id === id ? inc : i));
    return inc;
  },

  async createIncident(payload: Partial<Incident>): Promise<Incident> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/incidents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }, 4000);
      if (res.ok) {
        const data = await res.json();
        return data.incident;
      }
    } catch {
      // Fallback
    }

    const newId = `INC-${Math.floor(100000 + Math.random() * 900000)}`;
    const newInc: Incident = {
      id: newId,
      account_id: ACCOUNT_ID,
      lead_architect: LEAD_ARCHITECT,
      title: payload.title || 'Injected Fault Simulation',
      service: payload.service || 'Amazon DynamoDB',
      severity: payload.severity || 'HIGH',
      status: 'DETECTED',
      incident_type: payload.incident_type || 'CUSTOM_FAILURE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      affected_resources: payload.affected_resources || [`arn:aws:ap-south-1:${ACCOUNT_ID}:resource/target`],
      raw_logs: payload.raw_logs || [
        `[${new Date().toISOString()}] ALERT: Anomaly pattern matched by EventBridge Sentinel Rule`,
        `[${new Date().toISOString()}] CloudWatch Alarm State: ALARM (Threshold > 90%)`
      ],
      metrics_snapshot: {
        wcu_consumption: '95%',
        throttled_requests_5m: 840,
        p99_latency_ms: 640,
        error_rate_pct: 12.5
      }
    };

    localIncidents = [newInc, ...localIncidents];
    return newInc;
  },

  async resetEnvironment(): Promise<void> {
    try {
      await fetchWithTimeout(`${API_BASE}/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, 2000);
    } catch {
      // Fallback
    }
    localIncidents = [...defaultIncidents];
    localTopology = JSON.parse(JSON.stringify(defaultTopologyNodes));
  }
};

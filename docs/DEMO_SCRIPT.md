# 3-Minute Live Evaluation & Demo Script for Judges

Follow this script to deliver a flawless, high-impact demonstration during the AWS Cloud Innovation Challenge evaluation:

---

## ⏱️ Act 1: Problem Introduction & Live Dashboard (0:00 - 0:45)
1. **The Hook**:
   > *"Modern enterprise cloud architectures generate thousands of alerts per hour. When outages happen, SRE teams face alert fatigue, cascading microservice failures, and lengthy manual investigations that cost companies tens of thousands of dollars per minute of downtime."*
2. **The Solution**:
   > *"We built **CloudSentinel AI** — an autonomous multi-agent cloud resilience engine powered natively by AWS Serverless and Amazon Bedrock."*
3. **Show Dashboard**:
   - Point out the **Live Cloud Architecture & Microservice Topology** map.
   - Highlight the **Real-Time System Metrics** (p99 latency, cost saved, active incidents, Bedrock AI tokens).
   - Point out the AWS 6-Pillar Well-Architected score.

---

## ⏱️ Act 2: Live Chaos Injection & Multi-Agent Diagnosis (0:45 - 2:00)
1. **Inject Chaos**:
   - Click the orange **"Inject Cloud Chaos"** button in the top right navbar.
   - Select **"DynamoDB Hot Partition Throttling"** (or S3 Public Exposure).
   - Click **"Inject Incident"**.
2. **Observe Real-Time Telemetry Reaction**:
   - Notice the DynamoDB node in the topology immediately shifts to **Critical (Outage)** with red glow.
   - The Incident Stream displays `INC-XXXX` in `DETECTED` state.
3. **Trigger Amazon Bedrock Diagnosis**:
   - Click **"Diagnose AI"** on the incident card.
   - Show the **Bedrock Multi-Agent Reasoning Console** as it displays real-time chain-of-thought analysis:
     - **TriageAgent**: Detects WCU saturation on partition key `GLOBAL_FLASH_SALE`.
     - **DiagnosticAgent**: Analyzes DynamoDB streams and CloudWatch log patterns.
     - **BlastRadiusAnalyzer**: Traverses upstream dependencies (Orders Lambda -> API Gateway 504 storm).
     - **IaCPatchGenerator**: Synthesizes a non-destructive Terraform patch switching to On-Demand capacity.

---

## ⏱️ Act 3: 1-Click Autonomous Remediation & Zero-Downtime Recovery (2:00 - 3:00)
1. **Review Patch**:
   - Click **"Review IaC Remediation Patch"**.
   - Show judges the synthesized Terraform code block, risk rating (**LOW**), and rollback plan.
2. **Execute 1-Click Remediation**:
   - Click **"Execute 1-Click Autonomous Remediation"**.
   - Watch the animated executor apply the hot-patch.
3. **Verify System Restoration**:
   - The Incident status updates to **Resolved / Remediated** with green checkmark.
   - The DynamoDB node in the Topology Map transitions instantly back to **Healthy** (green).
   - System error rate drops to **0.04%**, and Cost Saved increases on the dashboard!
4. **Conclusion**:
   > *"In under 60 seconds, without human intervention, CloudSentinel AI diagnosed a critical outage, evaluated the blast radius, synthesized verified Infrastructure as Code, and restored 100% cloud resilience."*

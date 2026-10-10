# OpenAPI 3.0 API Specification — CloudSentinel AI

```yaml
openapi: 3.0.3
info:
  title: CloudSentinel AI Engine API
  version: 1.0.0
  description: Autonomous Cloud Incident Operations & Bedrock Multi-Agent Diagnostic Engine.

servers:
  - url: http://localhost:8000
    description: Local API Gateway Development Server
  - url: https://{api-id}.execute-api.{region}.amazonaws.com/prod
    description: AWS API Gateway Production Endpoint

paths:
  /health:
    get:
      summary: Health check endpoint
      responses:
        '200':
          description: Service healthy

  /metrics:
    get:
      summary: Get live system metrics and SLA telemetry
      responses:
        '200':
          description: Operational telemetry stream

  /topology:
    get:
      summary: Get dynamic microservice architecture topology and node health
      responses:
        '200':
          description: Topology node map with real-time status

  /incidents:
    get:
      summary: List all active and historical incidents
      parameters:
        - name: status
          in: query
          schema:
            type: string
      responses:
        '200':
          description: List of incident records
    post:
      summary: Ingest new telemetry or chaos incident
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
      responses:
        '201':
          description: Incident successfully recorded and queued

  /incidents/{id}/diagnose:
    post:
      summary: Trigger Amazon Bedrock Multi-Agent Diagnostic RCA pipeline
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Bedrock diagnosis completed with synthesized IaC patch

  /incidents/{id}/remediate:
    post:
      summary: Execute automated 1-click IaC remediation
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Incident remediated and marked RESOLVED

  /reset:
    post:
      summary: Reset environment state to initial baseline
      responses:
        '200':
          description: State reset complete
```

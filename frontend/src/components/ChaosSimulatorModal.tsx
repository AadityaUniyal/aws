import React, { useState } from 'react';
import { X, Zap, Database, HardDrive, Layers, Activity, AlertTriangle } from 'lucide-react';
import { Incident } from '../types';

interface ChaosSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInject: (payload: Partial<Incident>) => Promise<void>;
}

export const ChaosSimulatorModal: React.FC<ChaosSimulatorModalProps> = ({
  isOpen,
  onClose,
  onInject
}) => {
  const [injecting, setInjecting] = useState<string | null>(null);

  if (!isOpen) return null;

  const scenarios = [
    {
      id: 'dnd-throttle',
      title: 'DynamoDB Hot Partition Throttling',
      service: 'Amazon DynamoDB',
      severity: 'CRITICAL' as const,
      incident_type: 'DYNAMODB_THROTTLING',
      icon: Database,
      color: 'text-rose-400',
      description: 'Simulates flash sale traffic skew saturating 100% WCU on Orders-Production partition key.',
      affected: ['arn:aws:dynamodb:us-east-1:123456789012:table/Orders-Production'],
      logs: [
        'WARN com.amazon.dynamodb: ProvisionedThroughputExceededException on table Orders-Production',
        'ERROR OrderProcessingLambda: Connection timeout (>5000ms)',
        'CRITICAL APIGateway: HTTP 504 Gateway Timeout rate exceeded 40%'
      ]
    },
    {
      id: 's3-exposure',
      title: 'S3 Public Access Block Override (PII Leak Risk)',
      service: 'Amazon S3',
      severity: 'CRITICAL' as const,
      incident_type: 'S3_PUBLIC_EXPOSURE',
      icon: HardDrive,
      color: 'text-amber-400',
      description: 'Simulates unauthorized IAM modification disabling BlockPublicAcls on customer-pii-vault.',
      affected: ['arn:aws:s3:::enterprise-customer-pii-vault'],
      logs: [
        'SECURITY GuardDuty Finding Policy:S3/BucketBlockPublicAccessDisabled',
        'WARN CloudTrail: PutBucketAcl called with URI=http://acs.amazonaws.com/groups/global/AllUsers',
        'ALERT S3: 45,000 sensitive records exposed to public internet'
      ]
    },
    {
      id: 'lambda-concurrency',
      title: 'Lambda Regional Concurrency Starvation',
      service: 'AWS Lambda',
      severity: 'HIGH' as const,
      incident_type: 'LAMBDA_CONCURRENCY_EXHAUSTION',
      icon: Layers,
      color: 'text-orange-400',
      description: 'Simulates webhook retry storm consuming 980/1000 regional Lambda concurrency slots.',
      affected: ['arn:aws:lambda:us-east-1:123456789012:function:PaymentGatewayWebhooks'],
      logs: [
        'ERROR Lambda: Rate Exceeded. Account concurrent execution limit reached (1000/1000)',
        'WARN CloudWatch: PaymentGatewayWebhooks throttled 420 invocations in last 60 seconds',
        'ERROR AuthTokenValidator: Cold start invocation rejected due to account throttling'
      ]
    },
    {
      id: 'apigw-storm',
      title: 'API Gateway 502 Bad Gateway Outage',
      service: 'Amazon API Gateway',
      severity: 'HIGH' as const,
      incident_type: 'API_GATEWAY_5XX_STORM',
      icon: Activity,
      color: 'text-purple-400',
      description: 'Simulates downstream database connection pool exhaustion triggering widespread 502/504 errors.',
      affected: ['arn:aws:apigateway:us-east-1::/restapis/ag-gateway/prod'],
      logs: [
        'CRITICAL APIGateway: 5xx Error Rate > 25% on route /v1/checkout',
        'WARN Microservice: Connection pool timed out waiting for available connection',
        'ERROR CircuitBreaker: State shifted to OPEN'
      ]
    }
  ];

  const handleTrigger = async (sc: typeof scenarios[0]) => {
    setInjecting(sc.id);
    try {
      await onInject({
        title: sc.title,
        service: sc.service,
        severity: sc.severity,
        incident_type: sc.incident_type,
        affected_resources: sc.affected,
        raw_logs: sc.logs
      });
      setInjecting(null);
      onClose();
    } catch (e) {
      console.error(e);
      setInjecting(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">AWS Chaos & Incident Simulation Engine</h2>
              <p className="text-xs text-slate-400">Inject real-world cloud failure scenarios for live evaluation</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scenario List */}
        <div className="p-6 overflow-y-auto space-y-3.5 flex-1">
          {scenarios.map((sc) => {
            const Icon = sc.icon;
            const isLoading = injecting === sc.id;

            return (
              <div
                key={sc.id}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between gap-4"
              >
                <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                  <div className={`p-2.5 rounded-xl bg-slate-900 border border-slate-800 ${sc.color} shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-xs font-bold text-white truncate">{sc.title}</h3>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${sc.color} bg-slate-900 border border-slate-800`}>
                        {sc.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{sc.description}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleTrigger(sc)}
                  disabled={isLoading}
                  className="shrink-0 flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-md shadow-orange-500/20 active:scale-95 transition"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>{isLoading ? 'Injecting...' : 'Inject Incident'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export interface PipelineStage {
  id: string;
  name: string;
  shortName: string;
  path: string;
  description: string;
  moduleColor: 'green' | 'blue' | 'orange' | 'purple' | 'gold' | 'black';
}

export const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: 'source',
    name: 'Source Ingestion',
    shortName: 'SOURCE',
    path: '/ingestion',
    description: 'Heterogeneous content ingestion & multi-modal parsing',
    moduleColor: 'green'
  },
  {
    id: 'extraction',
    name: 'Extraction Layer',
    shortName: 'EXTRACTION',
    path: '/extraction',
    description: 'Document hierarchy parsing & visual media detection',
    moduleColor: 'blue'
  },
  {
    id: 'claims',
    name: 'Claim Extraction',
    shortName: 'CLAIMS',
    path: '/claims',
    description: 'Atomic claim breakdown & confidence mapping',
    moduleColor: 'blue'
  },
  {
    id: 'configuration',
    name: 'Output Configuration',
    shortName: 'CONFIGURATION',
    path: '/configuration',
    description: 'Target audience, tone, and disclosure policy settings',
    moduleColor: 'orange'
  },
  {
    id: 'generation',
    name: 'Workflow Orchestration',
    shortName: 'GENERATION',
    path: '/generation',
    description: 'Parallel sub-agent multi-format content synthesis',
    moduleColor: 'orange'
  },
  {
    id: 'fidelity',
    name: 'Gate 1 — Fidelity',
    shortName: 'FIDELITY',
    path: '/verification',
    description: 'Source entailment and exact value verification',
    moduleColor: 'purple'
  },
  {
    id: 'disclosure',
    name: 'Gate 2 — Disclosure',
    shortName: 'DISCLOSURE',
    path: '/disclosure-subset',
    description: 'Audience policy enforcement & privacy checks',
    moduleColor: 'purple'
  },
  {
    id: 'review',
    name: 'Human Review',
    shortName: 'REVIEW',
    path: '/review',
    description: 'Side-by-side verification & operator approval',
    moduleColor: 'purple'
  },
  {
    id: 'signing',
    name: 'Provenance & Signing',
    shortName: 'SIGNING',
    path: '/provenance',
    description: 'Cryptographic SHA-256 signing & manifest ledger',
    moduleColor: 'gold'
  },
  {
    id: 'published',
    name: 'Verified Output',
    shortName: 'PUBLISHED',
    path: '/outputs',
    description: 'Governed multi-format artifacts ready for distribution',
    moduleColor: 'black'
  }
];

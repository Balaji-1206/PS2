export interface FidelityCheckItem {
  id: string;
  generatedText: string;
  sourceClaimId: string;
  sourceText: string;
  pageNumber: number;
  status: 'PASS' | 'REVIEW' | 'FAIL';
  exactValueMatch: boolean;
  sourceMatch: boolean;
  entailed: boolean;
  notes: string;
}

export interface DisclosureCheckItem {
  id: string;
  claimId: string;
  claimText: string;
  sensitivity: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL';
  selectedPolicy: 'INTERNAL';
  status: 'ALLOWED' | 'BLOCKED';
  ruleTriggered: string;
  reason: string;
}

export const GATE1_FIDELITY_METRICS = {
  totalChecked: 31,
  passed: 29,
  reviewRequired: 2,
  failed: 0,
  checks: ['Claim Traceability Graph', 'Exact Value Matching', 'NLI Semantic Entailment']
};

export const GATE1_SAMPLE_ITEMS: FidelityCheckItem[] = [
  {
    id: 'FID-001',
    generatedText: 'Revenue grew by 18% during the reporting period.',
    sourceClaimId: 'CLM-001',
    sourceText: 'Revenue increased by 18% compared with the previous year.',
    pageNumber: 4,
    status: 'PASS',
    exactValueMatch: true,
    sourceMatch: true,
    entailed: true,
    notes: 'Exact numerical match (18%) and direct entailment verified against page 4 line 14.'
  },
  {
    id: 'FID-002',
    generatedText: 'Revenue reached all-time record levels across every product line.',
    sourceClaimId: 'CLM-001',
    sourceText: 'Total consolidated revenue reached $4.2B, representing an 18% YoY increase compared with the previous fiscal period.',
    pageNumber: 4,
    status: 'REVIEW',
    exactValueMatch: false,
    sourceMatch: true,
    entailed: false,
    notes: 'Source text states 18% YoY increase, but does not explicitly claim "all-time record levels". Human review required to verify superlative claim.'
  },
  {
    id: 'FID-003',
    generatedText: 'Operating expenditure increased by 7% due to strategic infrastructure hires.',
    sourceClaimId: 'CLM-002',
    sourceText: 'Operational expenditure stood at $1.8B (+7.2% driven by workforce & infrastructure investments).',
    pageNumber: 5,
    status: 'PASS',
    exactValueMatch: true,
    sourceMatch: true,
    entailed: true,
    notes: 'Valid rounding of +7.2% to 7% with supported workforce rationale.'
  },
  {
    id: 'FID-004',
    generatedText: 'Enterprise client retention registered at 94.6%.',
    sourceClaimId: 'CLM-005',
    sourceText: 'Enterprise client retention registered at 94.6%, reflecting strong multi-year contract renewals.',
    pageNumber: 11,
    status: 'PASS',
    exactValueMatch: true,
    sourceMatch: true,
    entailed: true,
    notes: '100% verbatim factual match with source paragraph.'
  },
  {
    id: 'FID-005',
    generatedText: 'The organization will dominate two key European jurisdictions immediately.',
    sourceClaimId: 'CLM-003',
    sourceText: 'Geographic expansion initiatives target operational launches in Germany and France before year-end.',
    pageNumber: 8,
    status: 'REVIEW',
    exactValueMatch: false,
    sourceMatch: true,
    entailed: false,
    notes: 'Text embellishment ("dominate immediately" vs "target operational launches"). Sent to human approval queue.'
  }
];

export const GATE2_DISCLOSURE_METRICS = {
  selectedAudience: 'Executive Leadership',
  selectedPolicy: 'INTERNAL',
  totalChecked: 35,
  allowed: 34,
  blocked: 1,
  checks: ['Audience Access Rules', 'Sensitivity Matrix Validation', 'Indirect Entity Identification', 'PII & Identity Guardrails']
};

export const GATE2_SAMPLE_ITEMS: DisclosureCheckItem[] = [
  {
    id: 'DISC-001',
    claimId: 'CLM-001',
    claimText: 'Revenue increased by 18% during fiscal year 2026.',
    sensitivity: 'PUBLIC',
    selectedPolicy: 'INTERNAL',
    status: 'ALLOWED',
    ruleTriggered: 'Rule PUBLIC_CLEARANCE_PASS',
    reason: 'Public sensitivity claims are fully permitted under INTERNAL disclosure level.'
  },
  {
    id: 'DISC-002',
    claimId: 'CLM-002',
    claimText: 'Operating expenses increased by 7%.',
    sensitivity: 'INTERNAL',
    selectedPolicy: 'INTERNAL',
    status: 'ALLOWED',
    ruleTriggered: 'Rule INTERNAL_POLICY_MATCH',
    reason: 'Internal sensitivity matches target audience privilege ceiling.'
  },
  {
    id: 'DISC-003',
    claimId: 'CLM-019',
    claimText: 'Proprietary M&A valuation matrix estimates target acquisition value at $180M.',
    sensitivity: 'CONFIDENTIAL',
    selectedPolicy: 'INTERNAL',
    status: 'BLOCKED',
    ruleTriggered: 'Rule CONFIDENTIAL_BLOCK_OVERFLOW',
    reason: 'Claim sensitivity (CONFIDENTIAL) exceeds selected policy level (INTERNAL). Renderers do NOT receive this claim.'
  }
];

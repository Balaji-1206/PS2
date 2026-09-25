export type ClaimSensitivity = 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL';
export type ClaimStatus = 'Verified' | 'Review' | 'Blocked' | 'Pending';

export interface Claim {
  id: string;
  claim: string;
  sourceDoc: string;
  page: number;
  sourceSpan: string;
  confidence: number; // 0-100
  sensitivity: ClaimSensitivity;
  entity: string;
  status: ClaimStatus;
  dependentOutputs: string[];
  boundingArea?: string;
  reasonIfBlocked?: string;
}

export const DUMMY_CLAIMS: Claim[] = [
  {
    id: 'CLM-001',
    claim: 'Revenue increased by 18% during fiscal year 2026.',
    sourceDoc: 'Annual_Report_2026.pdf',
    page: 4,
    sourceSpan: 'Paragraph 2, Line 14-16: "Total consolidated revenue reached $4.2B, representing an 18% YoY increase compared with the previous fiscal period."',
    confidence: 98,
    sensitivity: 'PUBLIC',
    entity: 'Financial Performance',
    status: 'Verified',
    dependentOutputs: ['Executive Summary', 'LinkedIn', 'Presentation', 'X/Twitter', 'Infographic']
  },
  {
    id: 'CLM-002',
    claim: 'Operating expenses increased by 7%.',
    sourceDoc: 'Annual_Report_2026.pdf',
    page: 5,
    sourceSpan: 'Section 3.1, Table 4: "Operational expenditure stood at $1.8B (+7.2% driven by workforce & infrastructure investments)."',
    confidence: 96,
    sensitivity: 'INTERNAL',
    entity: 'Operating Cost',
    status: 'Verified',
    dependentOutputs: ['Executive Summary', 'Advisory', 'Presentation']
  },
  {
    id: 'CLM-003',
    claim: 'The company plans to enter two new European markets in Q4.',
    sourceDoc: 'Annual_Report_2026.pdf',
    page: 8,
    sourceSpan: 'Section 4.2: "Geographic expansion initiatives target operational launches in Germany and France before year-end."',
    confidence: 91,
    sensitivity: 'CONFIDENTIAL',
    entity: 'Expansion Strategy',
    status: 'Review',
    dependentOutputs: ['Executive Summary (Internal)', 'Strategic Advisory'],
    reasonIfBlocked: 'Requires C-Suite signoff for external disclosure'
  },
  {
    id: 'CLM-004',
    claim: 'Net profit margin expanded to 22.4% across core product lines.',
    sourceDoc: 'Annual_Report_2026.pdf',
    page: 6,
    sourceSpan: 'Page 6, Chart 2 caption: "Product line profitability metrics show consolidated net margin at 22.4%."',
    confidence: 99,
    sensitivity: 'PUBLIC',
    entity: 'Financial Performance',
    status: 'Verified',
    dependentOutputs: ['Executive Summary', 'Presentation', 'Infographic']
  },
  {
    id: 'CLM-005',
    claim: 'Customer retention rate reached a historic high of 94.6%.',
    sourceDoc: 'Annual_Report_2026.pdf',
    page: 11,
    sourceSpan: 'Section 5.3: "Enterprise client retention registered at 94.6%, reflecting strong multi-year contract renewals."',
    confidence: 97,
    sensitivity: 'PUBLIC',
    entity: 'Customer Success',
    status: 'Verified',
    dependentOutputs: ['LinkedIn', 'Presentation', 'X/Twitter']
  },
  {
    id: 'CLM-006',
    claim: 'R&D investment increased to 15% of annual gross revenue.',
    sourceDoc: 'Annual_Report_2026.pdf',
    page: 14,
    sourceSpan: 'Section 6.1: "Capital allocation towards research and next-gen AI governance tooling reached $630M (15% of total turnover)."',
    confidence: 95,
    sensitivity: 'PUBLIC',
    entity: 'Research & Innovation',
    status: 'Verified',
    dependentOutputs: ['Executive Summary', 'Advisory', 'Presentation']
  },
  {
    id: 'CLM-007',
    claim: 'Internal security audit identified 0 critical compliance vulnerabilities.',
    sourceDoc: 'Annual_Report_2026.pdf',
    page: 17,
    sourceSpan: 'Section 7.4: "SOC2 Type II and ISO 27001 annual recertification completed with zero critical findings."',
    confidence: 99,
    sensitivity: 'INTERNAL',
    entity: 'Security & Compliance',
    status: 'Verified',
    dependentOutputs: ['Executive Summary', 'Advisory']
  },
  {
    id: 'CLM-008',
    claim: 'Projected Q1 revenue growth forecast set between 12% and 15%.',
    sourceDoc: 'Annual_Report_2026.pdf',
    page: 18,
    sourceSpan: 'Section 8.1: "Management guidance projects Q1 revenue expansion in the range of 12-15%."',
    confidence: 94,
    sensitivity: 'INTERNAL',
    entity: 'Financial Projections',
    status: 'Verified',
    dependentOutputs: ['Executive Summary', 'Presentation']
  },
  {
    id: 'CLM-009',
    claim: 'Cloud infrastructure unit cost per transaction decreased by 14%.',
    sourceDoc: 'Annual_Report_2026.pdf',
    page: 15,
    sourceSpan: 'Section 6.4: "Automated scaling optimizations lowered unit processing costs by 14% across global nodes."',
    confidence: 96,
    sensitivity: 'INTERNAL',
    entity: 'Infrastructure & Tech',
    status: 'Verified',
    dependentOutputs: ['Advisory', 'Executive Summary']
  },
  {
    id: 'CLM-010',
    claim: 'Strategic partnership signed with tier-1 global cloud vendor.',
    sourceDoc: 'Annual_Report_2026.pdf',
    page: 12,
    sourceSpan: 'Section 5.8: "Finalized 3-year co-selling agreement with primary hyper-scale partner."',
    confidence: 93,
    sensitivity: 'PUBLIC',
    entity: 'Strategic Partnerships',
    status: 'Verified',
    dependentOutputs: ['LinkedIn', 'Executive Summary', 'Press Release']
  },
  {
    id: 'CLM-011',
    claim: 'Employee headcount grew by 320 full-time engineers and domain specialists.',
    sourceDoc: 'Annual_Report_2026.pdf',
    page: 22,
    sourceSpan: 'Section 9.2: "Global team size expanded to 2,450 professionals, adding 320 net new technical roles."',
    confidence: 98,
    sensitivity: 'PUBLIC',
    entity: 'Human Resources',
    status: 'Verified',
    dependentOutputs: ['LinkedIn', 'Presentation']
  },
  {
    id: 'CLM-012',
    claim: 'Carbon neutrality achieved across all Tier-3 data center facilities.',
    sourceDoc: 'Annual_Report_2026.pdf',
    page: 25,
    sourceSpan: 'Section 10.1: "ESG milestones confirmed 100% renewable power utilization across operated data centers."',
    confidence: 97,
    sensitivity: 'PUBLIC',
    entity: 'ESG & Sustainability',
    status: 'Verified',
    dependentOutputs: ['Infographic', 'LinkedIn', 'X/Twitter']
  },
  {
    id: 'CLM-019',
    claim: 'Proprietary M&A valuation matrix estimates target acquisition value at $180M.',
    sourceDoc: 'Annual_Report_2026.pdf',
    page: 19,
    sourceSpan: 'Section 8.4 [RESTRICTED]: "Target acquisition pipeline model assumes $180M baseline enterprise value for entity Alpha."',
    confidence: 89,
    sensitivity: 'CONFIDENTIAL',
    entity: 'Mergers & Acquisitions',
    status: 'Blocked',
    dependentOutputs: [],
    reasonIfBlocked: 'Exceeds selected disclosure level (INTERNAL). Renderers do NOT receive this claim.'
  },
  {
    id: 'CLM-020',
    claim: 'Unreleased stealth product roadmap code-named Project Aether.',
    sourceDoc: 'Annual_Report_2026.pdf',
    page: 21,
    sourceSpan: 'Section 8.9 [CONFIDENTIAL]: "Project Aether architecture specification currently in private preview."',
    confidence: 92,
    sensitivity: 'CONFIDENTIAL',
    entity: 'Intellectual Property',
    status: 'Blocked',
    dependentOutputs: [],
    reasonIfBlocked: 'Exceeds selected disclosure level (INTERNAL).'
  },
  {
    id: 'CLM-021',
    claim: 'Patented claim-level verification algorithm patent application filed in US & EU.',
    sourceDoc: 'Annual_Report_2026.pdf',
    page: 27,
    sourceSpan: 'Section 11.2: "IP portfolio expanded with 4 provisional patent filings covering deterministic provenance graphs."',
    confidence: 96,
    sensitivity: 'PUBLIC',
    entity: 'Intellectual Property',
    status: 'Verified',
    dependentOutputs: ['Executive Summary', 'Advisory', 'Presentation']
  },
  {
    id: 'CLM-022',
    claim: 'Average response latency reduced to under 45ms globally.',
    sourceDoc: 'Annual_Report_2026.pdf',
    page: 16,
    sourceSpan: 'Section 6.5: "Edge routing enhancements brought P99 response time down to 44.2ms."',
    confidence: 98,
    sensitivity: 'PUBLIC',
    entity: 'Infrastructure & Tech',
    status: 'Verified',
    dependentOutputs: ['Infographic', 'Presentation']
  },
  {
    id: 'CLM-023',
    claim: 'Executive compensation structure tied 35% to ESG and AI ethics compliance targets.',
    sourceDoc: 'Annual_Report_2026.pdf',
    page: 30,
    sourceSpan: 'Section 12.1: "Governance committee approved metric weighting: 35% key performance bonus linked to ethical AI audit scores."',
    confidence: 95,
    sensitivity: 'INTERNAL',
    entity: 'Corporate Governance',
    status: 'Verified',
    dependentOutputs: ['Executive Summary']
  }
];

export const CLAIM_STATS = {
  total: 47,
  publicCount: 31,
  internalCount: 10,
  confidentialCount: 6,
  permittedForInternal: 41, // 31 public + 10 internal
  blockedForInternal: 6
};

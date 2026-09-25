export type OutputStatus = 'PENDING' | 'GENERATING' | 'READY_FOR_VERIFICATION' | 'VERIFIED' | 'PUBLISHED';

export interface OutputItem {
  id: string;
  name: string;
  type: string;
  iconName: string;
  status: OutputStatus;
  progress: number;
  claimCount: number;
  wordCount: number;
  subAgent: string;
  version: string;
  fidelityVerified: boolean;
  disclosureVerified: boolean;
  humanApproved: boolean;
  signed: boolean;
  published: boolean;
  summaryText?: string;
  contentParagraphs: Array<{
    id: string;
    text: string;
    claimIds: string[];
    fidelityStatus: 'PASS' | 'REVIEW' | 'FAIL';
    disclosureStatus: 'ALLOWED' | 'BLOCKED';
  }>;
}

export const INITIAL_OUTPUTS: OutputItem[] = [
  {
    id: 'OUT-EXEC-01',
    name: 'Executive Summary',
    type: 'Executive Brief',
    iconName: 'FileText',
    status: 'GENERATING',
    progress: 78,
    claimCount: 12,
    wordCount: 842,
    subAgent: 'Agent Alpha-Exec (Executive Writer)',
    version: 'v1.2',
    fidelityVerified: true,
    disclosureVerified: true,
    humanApproved: true,
    signed: false,
    published: false,
    summaryText: 'Comprehensive executive synthesis of FY2026 performance, expansion strategies, and technology investments for leadership.',
    contentParagraphs: [
      {
        id: 'p1',
        text: 'Revenue increased by 18% during the FY2026 reporting period, driven by accelerated adoption across global enterprise clients.',
        claimIds: ['CLM-001'],
        fidelityStatus: 'PASS',
        disclosureStatus: 'ALLOWED'
      },
      {
        id: 'p2',
        text: 'Operating expenses increased by 7% over the same timeframe, primarily representing targeted headcount growth and R&D capital expenditure.',
        claimIds: ['CLM-002', 'CLM-006'],
        fidelityStatus: 'PASS',
        disclosureStatus: 'ALLOWED'
      },
      {
        id: 'p3',
        text: 'Net profit margin expanded to 22.4%, supported by a historic high customer retention rate of 94.6% and cloud infrastructure unit cost reduction of 14%.',
        claimIds: ['CLM-004', 'CLM-005', 'CLM-009'],
        fidelityStatus: 'PASS',
        disclosureStatus: 'ALLOWED'
      },
      {
        id: 'p4',
        text: 'Management projects Q1 revenue growth between 12% and 15% while maintaining strict SOC2 zero-critical vulnerability security compliance.',
        claimIds: ['CLM-007', 'CLM-008'],
        fidelityStatus: 'PASS',
        disclosureStatus: 'ALLOWED'
      }
    ]
  },
  {
    id: 'OUT-LINKEDIN-01',
    name: 'LinkedIn Post',
    type: 'Social Thought Leadership',
    iconName: 'Linkedin',
    status: 'READY_FOR_VERIFICATION',
    progress: 100,
    claimCount: 8,
    wordCount: 285,
    subAgent: 'Agent Beta-Social (Brand Communicator)',
    version: 'v1.0',
    fidelityVerified: true,
    disclosureVerified: true,
    humanApproved: false,
    signed: false,
    published: false,
    summaryText: 'Professional LinkedIn update highlighting 18% revenue growth, 94.6% retention, and sustainability milestones.',
    contentParagraphs: [
      {
        id: 'p1',
        text: '🚀 We are proud to share key highlights from our FY2026 performance! Annual revenue grew by 18% YoY, supported by an incredible 94.6% customer retention rate.',
        claimIds: ['CLM-001', 'CLM-005'],
        fidelityStatus: 'PASS',
        disclosureStatus: 'ALLOWED'
      },
      {
        id: 'p2',
        text: 'We also expanded our engineering team by 320 specialists and achieved 100% carbon neutrality across all Tier-3 data centers.',
        claimIds: ['CLM-011', 'CLM-012'],
        fidelityStatus: 'PASS',
        disclosureStatus: 'ALLOWED'
      }
    ]
  },
  {
    id: 'OUT-PRESENTATION-01',
    name: 'Presentation Deck',
    type: 'Slide Deck (12 Slides)',
    iconName: 'Presentation',
    status: 'GENERATING',
    progress: 64,
    claimCount: 15,
    wordCount: 1240,
    subAgent: 'Agent Gamma-Deck (Visual Synthesizer)',
    version: 'v0.9',
    fidelityVerified: false,
    disclosureVerified: false,
    humanApproved: false,
    signed: false,
    published: false,
    summaryText: '12-slide executive presentation covering key operational metrics, R&D allocation, and global infrastructure scaling.',
    contentParagraphs: [
      {
        id: 'p1',
        text: 'Slide 3 — Financial Momentum: Consolidated revenue increased by 18% with net profit margins standing at 22.4%.',
        claimIds: ['CLM-001', 'CLM-004'],
        fidelityStatus: 'PASS',
        disclosureStatus: 'ALLOWED'
      },
      {
        id: 'p2',
        text: 'Slide 7 — Innovation Pipeline: R&D spending reinvested at 15% of gross revenue, securing 4 provisional patents for AI provenance graphs.',
        claimIds: ['CLM-006', 'CLM-021'],
        fidelityStatus: 'PASS',
        disclosureStatus: 'ALLOWED'
      }
    ]
  },
  {
    id: 'OUT-INFOGRAPHIC-01',
    name: 'Infographic Package',
    type: 'Data Visual Asset',
    iconName: 'BarChart2',
    status: 'READY_FOR_VERIFICATION',
    progress: 100,
    claimCount: 6,
    wordCount: 180,
    subAgent: 'Agent Delta-Viz (Graphic Layout Agent)',
    version: 'v1.1',
    fidelityVerified: true,
    disclosureVerified: true,
    humanApproved: true,
    signed: false,
    published: false,
    summaryText: 'Visual summary layout of key performance metrics, ESG metrics, and edge latency benchmarks.',
    contentParagraphs: [
      {
        id: 'p1',
        text: 'Visual Callout 1: 18% YoY Revenue Surge | 22.4% Net Margin | 94.6% Enterprise Retention Rate.',
        claimIds: ['CLM-001', 'CLM-004', 'CLM-005'],
        fidelityStatus: 'PASS',
        disclosureStatus: 'ALLOWED'
      },
      {
        id: 'p2',
        text: 'Visual Callout 2: <45ms Global Edge Latency & 100% Carbon Neutral Data Center Operations.',
        claimIds: ['CLM-012', 'CLM-022'],
        fidelityStatus: 'PASS',
        disclosureStatus: 'ALLOWED'
      }
    ]
  },
  {
    id: 'OUT-ADVISORY-01',
    name: 'Strategic Advisory',
    type: 'Technical & Operational Brief',
    iconName: 'ShieldAlert',
    status: 'READY_FOR_VERIFICATION',
    progress: 100,
    claimCount: 10,
    wordCount: 1150,
    subAgent: 'Agent Epsilon-Advisory (Governance Specialist)',
    version: 'v1.0',
    fidelityVerified: true,
    disclosureVerified: true,
    humanApproved: false,
    signed: false,
    published: false,
    summaryText: 'In-depth advisory memo on internal risk governance, cloud cost optimization (-14%), and zero critical security audit findings.',
    contentParagraphs: [
      {
        id: 'p1',
        text: 'Internal Risk & Governance Assessment: Operating expenses grew by 7% alongside a 14% reduction in transaction-level cloud processing costs.',
        claimIds: ['CLM-002', 'CLM-009'],
        fidelityStatus: 'PASS',
        disclosureStatus: 'ALLOWED'
      },
      {
        id: 'p2',
        text: 'Compliance Baseline: Zero critical security vulnerabilities were discovered during independent SOC2 Type II audit sweeps.',
        claimIds: ['CLM-007'],
        fidelityStatus: 'PASS',
        disclosureStatus: 'ALLOWED'
      }
    ]
  },
  {
    id: 'OUT-TWITTER-01',
    name: 'X / Twitter Thread',
    type: 'Micro-Content Thread (4 Tweets)',
    iconName: 'Twitter',
    status: 'READY_FOR_VERIFICATION',
    progress: 100,
    claimCount: 5,
    wordCount: 140,
    subAgent: 'Agent Zeta-Thread (Shortform Content)',
    version: 'v1.0',
    fidelityVerified: true,
    disclosureVerified: true,
    humanApproved: true,
    signed: true,
    published: true,
    summaryText: '4-part public tweet thread highlighting financial growth, green computing, and patent filings.',
    contentParagraphs: [
      {
        id: 'p1',
        text: '1/4 📊 FY2026 Results are in: Revenue grew 18% YoY with 94.6% customer retention! Here is how our team achieved it 🧵👇',
        claimIds: ['CLM-001', 'CLM-005'],
        fidelityStatus: 'PASS',
        disclosureStatus: 'ALLOWED'
      }
    ]
  },
  {
    id: 'OUT-VIDEO-01',
    name: 'Video Package & Script',
    type: 'AV Script & Storyboard',
    iconName: 'Video',
    status: 'GENERATING',
    progress: 45,
    claimCount: 9,
    wordCount: 620,
    subAgent: 'Agent Eta-AV (Media & Script Agent)',
    version: 'v0.5',
    fidelityVerified: false,
    disclosureVerified: false,
    humanApproved: false,
    signed: false,
    published: false,
    summaryText: '60-second animated corporate overview script with timestamps, visual cues, and voiceover audio track prompt.',
    contentParagraphs: [
      {
        id: 'p1',
        text: '[00:00-00:15] VOICE OVER: "In 2026, enterprise transformation reached a new peak, delivering 18% revenue growth while powering global cloud nodes sustainably."',
        claimIds: ['CLM-001', 'CLM-012'],
        fidelityStatus: 'PASS',
        disclosureStatus: 'ALLOWED'
      }
    ]
  }
];

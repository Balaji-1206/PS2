export interface SourceDocument {
  id: string;
  filename: string;
  format: 'PDF' | 'DOCX' | 'TXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'URL' | 'PROMPT';
  size: string;
  pages: number;
  uploadedAt: string;
  status: 'Ready' | 'Processing' | 'Ingested' | 'Failed';
  claimCount: number;
  author: string;
  hash: string;
  metadata: {
    title: string;
    domain: string;
    securityClassification: string;
    extractionConfidence: number;
  };
}

export const INITIAL_SOURCE: SourceDocument = {
  id: 'SRC-2026-0881',
  filename: 'Annual_Report_2026.pdf',
  format: 'PDF',
  size: '14.2 MB',
  pages: 42,
  uploadedAt: '2026-09-24 14:22 UTC',
  status: 'Ready',
  claimCount: 47,
  author: 'Global Corporate Governance Office',
  hash: '9f8b4a2c1d3e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a',
  metadata: {
    title: 'Enterprise FY2026 Financial & Operational Performance Brief',
    domain: 'Corporate Communications',
    securityClassification: 'Restricted / Internal Policy Required',
    extractionConfidence: 0.975
  }
};

export const RECENT_SOURCES: SourceDocument[] = [
  INITIAL_SOURCE,
  {
    id: 'SRC-2026-0880',
    filename: 'Clinical_Trial_Phase3_Results.docx',
    format: 'DOCX',
    size: '8.7 MB',
    pages: 28,
    uploadedAt: '2026-09-23 09:15 UTC',
    status: 'Ready',
    claimCount: 38,
    author: 'Medical Research Affairs',
    hash: '3e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f',
    metadata: {
      title: 'Phase III Efficacy & Tolerability Data Summary',
      domain: 'Healthcare',
      securityClassification: 'De-identified Patient Data',
      extractionConfidence: 0.992
    }
  },
  {
    id: 'SRC-2026-0878',
    filename: 'Q3_Cybersecurity_Incident_Advisory.txt',
    format: 'TXT',
    size: '1.4 MB',
    pages: 6,
    uploadedAt: '2026-09-22 18:40 UTC',
    status: 'Ready',
    claimCount: 19,
    author: 'SOC Threat Intelligence',
    hash: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    metadata: {
      title: 'Zero-Day Vulnerability Assessment & Mitigation Guidelines',
      domain: 'Cybersecurity',
      securityClassification: 'TLP:AMBER',
      extractionConfidence: 0.961
    }
  },
  {
    id: 'SRC-2026-0875',
    filename: 'Disaster_Recovery_Field_Directive.pdf',
    format: 'PDF',
    size: '5.1 MB',
    pages: 14,
    uploadedAt: '2026-09-21 11:05 UTC',
    status: 'Ready',
    claimCount: 24,
    author: 'Emergency Operations Command',
    hash: '5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a',
    metadata: {
      title: 'Regional Logistics & Infrastructure Response Directives',
      domain: 'Disaster Response',
      securityClassification: 'Operational - Time Sensitive',
      extractionConfidence: 0.984
    }
  }
];

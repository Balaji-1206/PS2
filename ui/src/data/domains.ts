export interface DomainProfile {
  id: string;
  name: string;
  code: string;
  description: string;
  sensitivityVocabulary: string[];
  outputSchemas: string[];
  iconName: string;
  color: string;
  isDefault?: boolean;
}

export const DOMAIN_PROFILES: DomainProfile[] = [
  {
    id: 'corp-comm',
    name: 'Corporate Communications',
    code: 'CORP_GOV_V1',
    description: 'Governed corporate disclosures, financial reporting, press releases, and executive briefs.',
    sensitivityVocabulary: ['Confidential', 'Internal', 'Public'],
    outputSchemas: ['Press Release', 'Regulatory Filing', 'Internal Memo', 'Executive Summary', 'Investor Presentation'],
    iconName: 'Building2',
    color: 'blue',
    isDefault: true
  },
  {
    id: 'healthcare',
    name: 'Healthcare & Life Sciences',
    code: 'HEALTH_HIPAA_V2',
    description: 'HIPAA and clinical trial compliant transformation enforcing strict PHI de-identification rules.',
    sensitivityVocabulary: ['Identifiable (PHI)', 'De-identified (Safe Harbor)', 'Public / Clinical Guidance'],
    outputSchemas: ['Clinical Summary', 'Patient Information Leaflet', 'IRB Protocol Summary', 'Provider Advisory'],
    iconName: 'Activity',
    color: 'emerald'
  },
  {
    id: 'academic',
    name: 'Academic Research',
    code: 'ACADEMIC_PUB_V1',
    description: 'Embargo-aware transformations for peer-reviewed studies, grants, and public science outreach.',
    sensitivityVocabulary: ['Under Embargo', 'Peer-Reviewed / Published', 'Open Access'],
    outputSchemas: ['Press Release', 'Executive Abstract', 'Public Science Explainer', 'Policy Translation'],
    iconName: 'GraduationCap',
    color: 'purple'
  },
  {
    id: 'government',
    name: 'Government & Policy',
    code: 'GOV_POLICY_V3',
    description: 'Public sector governance with deliberative privilege controls and official policy briefs.',
    sensitivityVocabulary: ['Deliberative Draft', 'Official Record', 'Public Release'],
    outputSchemas: ['Policy Brief', 'Public FAQ', 'Inter-Agency Directive', 'Legislative Summary'],
    iconName: 'Landmark',
    color: 'amber'
  },
  {
    id: 'disaster',
    name: 'Disaster Response',
    code: 'EMERGENCY_OPS_V1',
    description: 'Rapid operational emergency guidance with strict separation between tactical command and public alerts.',
    sensitivityVocabulary: ['Operational / Command Only', 'Public Advisory'],
    outputSchemas: ['Field Directive', 'Public Emergency Alert', 'SitRep (Situation Report)', 'Logistics Brief'],
    iconName: 'AlertTriangle',
    color: 'rose'
  },
  {
    id: 'cybersecurity',
    name: 'Cybersecurity & SOC',
    code: 'TLP_FIRST_V2',
    description: 'Traffic Light Protocol (TLP 2.0) governed threat intelligence sharing and incident response.',
    sensitivityVocabulary: ['TLP:RED (Strict Confidential)', 'TLP:AMBER (Limited Disclosure)', 'TLP:GREEN (Community)', 'TLP:CLEAR (Public)'],
    outputSchemas: ['Structured Advisory', 'STIX/TAXII Bundle', 'CISO Briefing', 'Patch Guidance'],
    iconName: 'ShieldCheck',
    color: 'indigo'
  }
];

import React, { createContext, useContext, useState } from 'react';
import { PIPELINE_STAGES } from '../data/pipeline';
import type { PipelineStage } from '../data/pipeline';
import { INITIAL_SOURCE } from '../data/sources';
import type { SourceDocument } from '../data/sources';
import { DUMMY_CLAIMS } from '../data/claims';
import type { Claim, ClaimSensitivity } from '../data/claims';
import { INITIAL_OUTPUTS } from '../data/outputs';
import type { OutputItem } from '../data/outputs';
import { DOMAIN_PROFILES } from '../data/domains';
import type { DomainProfile } from '../data/domains';
import { PENDING_REVIEWS } from '../data/reviews';
import type { ReviewItem } from '../data/reviews';

export type PageKey = 
  | 'overview'
  | 'ingestion'
  | 'claims'
  | 'configuration'
  | 'subset'
  | 'generation'
  | 'gen-detail'
  | 'verification'
  | 'review'
  | 'provenance'
  | 'outputs'
  | 'reverse-trace'
  | 'domains'
  | 'freeprompt';

interface PramaanContextType {
  activePage: PageKey;
  setActivePage: (page: PageKey) => void;
  currentStageId: string;
  setCurrentStageId: (stageId: string) => void;
  pipelineStages: PipelineStage[];
  
  // Source
  source: SourceDocument;
  isProcessingIngestion: boolean;
  ingestionStageText: string;
  startSourceIngestion: () => void;
  
  // Claims
  claims: Claim[];
  selectedClaim: Claim | null;
  setSelectedClaim: (claim: Claim | null) => void;
  
  // Configuration
  audience: string;
  setAudience: (val: string) => void;
  tone: string;
  setTone: (val: string) => void;
  language: string;
  setLanguage: (val: string) => void;
  detailLevel: string;
  setDetailLevel: (val: string) => void;
  objective: string;
  setObjective: (val: string) => void;
  style: string;
  setStyle: (val: string) => void;
  disclosureLevel: ClaimSensitivity;
  setDisclosureLevel: (level: ClaimSensitivity) => void;
  
  // Output selection & Generation
  selectedOutputs: string[];
  toggleOutputSelection: (outputId: string) => void;
  outputs: OutputItem[];
  selectedOutputDetail: OutputItem | null;
  setSelectedOutputDetail: (out: OutputItem | null) => void;
  isGenerating: boolean;
  startGeneration: () => void;
  
  // Review & Signing
  reviews: ReviewItem[];
  approveReviewItem: (id: string) => void;
  isSigned: boolean;
  signArtifact: () => void;
  signatureHash: string;
  signedTimestamp: string | null;
  
  // Domain Profiles
  activeDomain: DomainProfile;
  selectDomain: (id: string) => void;
  
  // Free Prompt Mode
  freePromptInput: string;
  setFreePromptInput: (val: string) => void;
  freePromptOutput: string | null;
  generateFreePrompt: () => void;
  
  // Toast notifications
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const PramaanContext = createContext<PramaanContextType | undefined>(undefined);

export const PramaanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePage, setActivePage] = useState<PageKey>('overview');
  const [currentStageId, setCurrentStageId] = useState<string>('generation');
  
  const [source] = useState<SourceDocument>(INITIAL_SOURCE);
  const [isProcessingIngestion, setIsProcessingIngestion] = useState(false);
  const [ingestionStageText, setIngestionStageText] = useState('Ready');
  
  const [claims] = useState<Claim[]>(DUMMY_CLAIMS);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  
  // Config
  const [audience, setAudience] = useState('Executive Leadership');
  const [tone, setTone] = useState('Professional');
  const [language, setLanguage] = useState('English');
  const [detailLevel, setDetailLevel] = useState('Medium');
  const [objective, setObjective] = useState('Inform');
  const [style, setStyle] = useState('Corporate');
  const [disclosureLevel, setDisclosureLevel] = useState<ClaimSensitivity>('INTERNAL');
  
  // Selected output card IDs
  const [selectedOutputs, setSelectedOutputs] = useState<string[]>([
    'OUT-EXEC-01',
    'OUT-LINKEDIN-01',
    'OUT-PRESENTATION-01',
    'OUT-INFOGRAPHIC-01',
    'OUT-ADVISORY-01',
    'OUT-TWITTER-01',
    'OUT-VIDEO-01'
  ]);
  
  const [outputs, setOutputs] = useState<OutputItem[]>(INITIAL_OUTPUTS);
  const [selectedOutputDetail, setSelectedOutputDetail] = useState<OutputItem | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Review & Provenance
  const [reviews, setReviews] = useState<ReviewItem[]>(PENDING_REVIEWS);
  const [isSigned, setIsSigned] = useState(false);
  const [signatureHash] = useState('8f4c12d91a8e903f2a11b65d4c8e7f12a921b34c567890de0123456789abcdef');
  const [signedTimestamp, setSignedTimestamp] = useState<string | null>(null);
  
  // Domains
  const [activeDomain, setActiveDomain] = useState<DomainProfile>(DOMAIN_PROFILES[0]);
  
  // Free Prompt
  const [freePromptInput, setFreePromptInput] = useState('');
  const [freePromptOutput, setFreePromptOutput] = useState<string | null>(null);
  
  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const toggleOutputSelection = (id: string) => {
    if (selectedOutputs.includes(id)) {
      setSelectedOutputs(selectedOutputs.filter(o => o !== id));
    } else {
      setSelectedOutputs([...selectedOutputs, id]);
    }
  };

  const startSourceIngestion = () => {
    setIsProcessingIngestion(true);
    const stages = [
      'Uploading file: Annual_Report_2026.pdf...',
      'Parsing multi-page document structure...',
      'Preserving visual layout & vector coordinates...',
      'Extracting text nodes & elements...',
      'Detecting embedded charts, tables & images...',
      'Creating unified source mapping schema...',
      'Source Ingestion & Claim Extraction Complete!'
    ];

    stages.forEach((stgText, index) => {
      setTimeout(() => {
        setIngestionStageText(stgText);
        if (index === stages.length - 1) {
          setIsProcessingIngestion(false);
          setCurrentStageId('claims');
          setActivePage('claims');
          showToast('Source ingested successfully. 47 claims extracted.');
        }
      }, (index + 1) * 600);
    });
  };

  const startGeneration = () => {
    setIsGenerating(true);
    showToast('Parallel sub-agent generation initiated for 7 multi-format outputs...');
    
    let count = 0;
    const interval = setInterval(() => {
      count += 10;
      setOutputs(prev => prev.map(item => {
        const nextProg = Math.min(100, item.progress + Math.floor(Math.random() * 15) + 5);
        return {
          ...item,
          progress: nextProg,
          status: nextProg >= 100 ? 'READY_FOR_VERIFICATION' : 'GENERATING'
        };
      }));

      if (count >= 100) {
        clearInterval(interval);
        setIsGenerating(false);
        showToast('All multi-format outputs synthesized and ready for Dual Verification.');
      }
    }, 800);
  };

  const approveReviewItem = (id: string) => {
    setReviews(prev => prev.map(rev => {
      if (rev.id === id) {
        return {
          ...rev,
          status: 'APPROVED',
          authorship: {
            ...rev.authorship,
            reviewerApproved: 'Reviewer Senior Governance Lead (Now)'
          },
          timeline: [
            ...rev.timeline,
            { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), action: 'Approved by Reviewer', by: 'Senior Governance Lead' }
          ]
        };
      }
      return rev;
    }));
    showToast(`Review item ${id} approved successfully.`);
  };

  const signArtifact = () => {
    setIsSigned(true);
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
    setSignedTimestamp(now);
    
    setOutputs(prev => prev.map(o => ({
      ...o,
      signed: true,
      status: 'VERIFIED'
    })));

    setCurrentStageId('published');
    showToast('Artifact SHA-256 cryptographically signed and stored in immutable manifest ledger.');
  };

  const selectDomain = (id: string) => {
    const dom = DOMAIN_PROFILES.find(d => d.id === id);
    if (dom) {
      setActiveDomain(dom);
      showToast(`Domain profile switched to: ${dom.name}`);
    }
  };

  const generateFreePrompt = () => {
    if (!freePromptInput.trim()) return;
    setFreePromptOutput(`[UNVERIFIED FREE-PROMPT OUTPUT]
Executive Brief: ${freePromptInput}

Note: This output was synthesized directly from open model parameters without PRAMAAN claim grounding, source entailment, or disclosure policy evaluation.
Warning: Contains 0 verified source claims.`);
    showToast('Unverified model text generated.');
  };

  return (
    <PramaanContext.Provider value={{
      activePage,
      setActivePage,
      currentStageId,
      setCurrentStageId,
      pipelineStages: PIPELINE_STAGES,
      source,
      isProcessingIngestion,
      ingestionStageText,
      startSourceIngestion,
      claims,
      selectedClaim,
      setSelectedClaim,
      audience,
      setAudience,
      tone,
      setTone,
      language,
      setLanguage,
      detailLevel,
      setDetailLevel,
      objective,
      setObjective,
      style,
      setStyle,
      disclosureLevel,
      setDisclosureLevel,
      selectedOutputs,
      toggleOutputSelection,
      outputs,
      selectedOutputDetail,
      setSelectedOutputDetail,
      isGenerating,
      startGeneration,
      reviews,
      approveReviewItem,
      isSigned,
      signArtifact,
      signatureHash,
      signedTimestamp,
      activeDomain,
      selectDomain,
      freePromptInput,
      setFreePromptInput,
      freePromptOutput,
      generateFreePrompt,
      toastMessage,
      showToast
    }}>
      {children}
    </PramaanContext.Provider>
  );
};

export const usePramaan = () => {
  const context = useContext(PramaanContext);
  if (!context) {
    throw new Error('usePramaan must be used within a PramaanProvider');
  }
  return context;
};

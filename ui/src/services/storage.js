/**
 * In-Memory & LocalStorage Data Management Service for User Account Studio.
 * Handles documents, claim banks, rendered collateral archives, and cryptographic audit manifests.
 */

const STORAGE_KEYS = {
  PROFILE: "veritas_user_profile",
  DOCUMENTS: "veritas_user_documents",
  CLAIMS: "veritas_user_claims",
  COLLATERAL: "veritas_user_collateral",
  MANIFESTS: "veritas_user_manifests",
};

// Initial Enterprise Mock Data
const INITIAL_PROFILE = {
  name: "Sarah Chen",
  email: "sarah.chen@veritas-governance.io",
  role: "Principal Compliance Architect & Security Officer",
  clearanceLevel: "RESTRICTED",
  department: "Global Policy & Regulatory Systems",
  organization: "Veritas Enterprise Governance Corp",
  joinedDate: "January 2025",
  stats: {
    documentsProcessed: 42,
    claimsGoverned: 388,
    collateralGenerated: 164,
    verifiedPassRate: "99.4%",
    tamperSealsIssued: 28,
  }
};

const INITIAL_DOCUMENTS = [
  {
    id: "doc_energy_2026",
    title: "Clean Energy Strategy & Financial Report 2026",
    sourceType: "text",
    date: "2026-09-24",
    claimCount: 4,
    highestSensitivity: "CONFIDENTIAL",
    status: "Processed",
    summary: "Global clean energy investments expanded 35% in 2025 reaching 400 GW capacity.",
    text: `# Clean Energy Strategy & Financial Report 2026\n\nGlobal clean energy investments expanded by 35% in 2025 reaching 400 GW capacity across solar and wind installations. Municipal infrastructure grants accounted for 45 million dollars in capital deployment.\n\nCONFIDENTIAL: Project Titan internal reserve is capped at $12M under executive authorization code TITAN-SEC-9988.`
  },
  {
    id: "doc_transit_2026",
    title: "Municipal Infrastructure & Transit Directive",
    sourceType: "file",
    date: "2026-09-22",
    claimCount: 3,
    highestSensitivity: "INTERNAL",
    status: "Processed",
    summary: "Approved $85M for zero-emission bus fleet electrification across 12 urban districts.",
    text: `# Municipal Infrastructure and Public Transit Directive 2026\n\nThe metropolitan transit authority approved 85 million dollars for zero-emission bus fleet electrification across 12 urban districts. Public fare subsidies will remain unchanged throughout fiscal year 2026.\n\nINTERNAL: Transit employee union negotiations regarding shift differential wages are scheduled for Q3 review.`
  },
  {
    id: "doc_cyber_2026",
    title: "Critical Infrastructure Sector Grid Resilience Advisory",
    sourceType: "url",
    date: "2026-09-20",
    claimCount: 3,
    highestSensitivity: "RESTRICTED",
    status: "Verified",
    summary: "Observed 40% increase in distributed scanning against industrial control systems in Q1.",
    text: `# Threat Intelligence Advisory: Sector Grid Resilience\n\nNational cyber defense centers observed a 40% increase in distributed scanning against industrial control systems in Q1 2026. Zero active intrusions were recorded in monitored substations.\n\nRESTRICTED: Sensor firmware vulnerability CVE-2026-9912 remediation patches must be deployed to air-gapped relays immediately.`
  },
  {
    id: "doc_esg_2025",
    title: "Corporate Sustainability & Carbon Accounting Q4",
    sourceType: "file",
    date: "2026-09-15",
    claimCount: 5,
    highestSensitivity: "PUBLIC",
    status: "Published",
    summary: "Scope 1 and Scope 2 emissions decreased by 18.2% across North American data center operations.",
    text: `Scope 1 and Scope 2 emissions decreased by 18.2% across North American data center operations in fiscal year 2025. Renewable power purchase agreements supplied 82% of total operational kilowatt-hours.`
  }
];

const INITIAL_CLAIMS = [
  {
    claim_id: "claim_en_01",
    document_id: "doc_energy_2026",
    statement: "Global clean energy investments expanded by 35% in 2025 reaching 400 GW capacity across solar and wind installations.",
    source_pointer: "doc_energy_2026#p_0",
    sensitivity_label: "PUBLIC",
    confidence: 0.99,
  },
  {
    claim_id: "claim_en_02",
    document_id: "doc_energy_2026",
    statement: "Municipal infrastructure grants accounted for 45 million dollars in capital deployment.",
    source_pointer: "doc_energy_2026#p_1",
    sensitivity_label: "INTERNAL",
    confidence: 0.98,
  },
  {
    claim_id: "claim_en_03",
    document_id: "doc_energy_2026",
    statement: "Project Titan internal reserve is capped at $12M under executive authorization code TITAN-SEC-9988.",
    source_pointer: "doc_energy_2026#p_2",
    sensitivity_label: "CONFIDENTIAL",
    confidence: 0.99,
  },
  {
    claim_id: "claim_tr_01",
    document_id: "doc_transit_2026",
    statement: "The metropolitan transit authority approved 85 million dollars for zero-emission bus fleet electrification.",
    source_pointer: "doc_transit_2026#p_0",
    sensitivity_label: "PUBLIC",
    confidence: 0.99,
  },
  {
    claim_id: "claim_cy_01",
    document_id: "doc_cyber_2026",
    statement: "National cyber defense centers observed a 40% increase in distributed scanning against industrial control systems in Q1 2026.",
    source_pointer: "doc_cyber_2026#p_0",
    sensitivity_label: "PUBLIC",
    confidence: 0.98,
  },
  {
    claim_id: "claim_cy_02",
    document_id: "doc_cyber_2026",
    statement: "Sensor firmware vulnerability CVE-2026-9912 remediation patches must be deployed to air-gapped relays immediately.",
    source_pointer: "doc_cyber_2026#p_2",
    sensitivity_label: "RESTRICTED",
    confidence: 0.99,
  }
];

const INITIAL_COLLATERAL = [
  {
    id: "collat_001",
    document_id: "doc_energy_2026",
    channel: "executive_summary",
    title: "Executive Synthesis: Clean Energy Investments 2026",
    date: "2026-09-24",
    claimsCount: 2,
    disclosureLevel: "PUBLIC",
    status: "Verified (100%)",
    preview: "Global clean energy investments expanded by 35% in 2025 reaching 400 GW capacity [doc_energy_2026#p_0]. Strategic deployment continues across municipal corridors."
  },
  {
    id: "collat_002",
    document_id: "doc_energy_2026",
    channel: "linkedin_post",
    title: "LinkedIn Post: Sustainable Energy Expansion",
    date: "2026-09-24",
    claimsCount: 2,
    disclosureLevel: "PUBLIC",
    status: "Verified (100%)",
    preview: "Proud to share that clean energy capacity surged 35% to 400 GW in 2025! [doc_energy_2026#p_0] Strong capital alignment is driving infrastructure transformation."
  },
  {
    id: "collat_003",
    document_id: "doc_transit_2026",
    channel: "advisory",
    title: "Advisory Directive: Transit Zero-Emission Fleet",
    date: "2026-09-22",
    claimsCount: 2,
    disclosureLevel: "INTERNAL",
    status: "Verified (100%)",
    preview: "Operational Directive: $85M allocated for zero-emission bus fleet rollout across 12 urban transit districts [doc_transit_2026#p_0]."
  }
];

const INITIAL_MANIFESTS = [
  {
    provenance_id: "prov_seal_99812",
    document_id: "doc_energy_2026",
    channel: "executive_summary",
    integrity_hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    approver: "Sarah Chen",
    timestamp: "2026-09-24T14:32:00Z",
    status: "PUBLISHED",
    tamper_sealed: true,
  },
  {
    provenance_id: "prov_seal_99805",
    document_id: "doc_transit_2026",
    channel: "advisory",
    integrity_hash: "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e",
    approver: "Sarah Chen",
    timestamp: "2026-09-22T11:15:00Z",
    status: "PUBLISHED",
    tamper_sealed: true,
  }
];

// Helper functions for reading & writing
function loadOrInit(key, initialData) {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(initialData));
      return initialData;
    }
    return JSON.parse(item);
  } catch {
    return initialData;
  }
}

function save(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Failed to save to localStorage [${key}]:`, err);
  }
}

export const StorageService = {
  getProfile: () => loadOrInit(STORAGE_KEYS.PROFILE, INITIAL_PROFILE),
  updateProfile: (profile) => save(STORAGE_KEYS.PROFILE, profile),

  getDocuments: () => loadOrInit(STORAGE_KEYS.DOCUMENTS, INITIAL_DOCUMENTS),
  addDocument: (doc) => {
    const docs = StorageService.getDocuments();
    const updated = [doc, ...docs.filter(d => d.id !== doc.id)];
    save(STORAGE_KEYS.DOCUMENTS, updated);
    return updated;
  },
  deleteDocument: (id) => {
    const docs = StorageService.getDocuments();
    const updated = docs.filter(d => d.id !== id);
    save(STORAGE_KEYS.DOCUMENTS, updated);
    return updated;
  },

  getClaims: () => loadOrInit(STORAGE_KEYS.CLAIMS, INITIAL_CLAIMS),
  addClaims: (newClaims) => {
    const claims = StorageService.getClaims();
    const map = new Map(claims.map(c => [c.claim_id, c]));
    newClaims.forEach(c => map.set(c.claim_id, c));
    const updated = Array.from(map.values());
    save(STORAGE_KEYS.CLAIMS, updated);
    return updated;
  },

  getCollateral: () => loadOrInit(STORAGE_KEYS.COLLATERAL, INITIAL_COLLATERAL),
  addCollateral: (item) => {
    const items = StorageService.getCollateral();
    const updated = [item, ...items.filter(i => i.id !== item.id)];
    save(STORAGE_KEYS.COLLATERAL, updated);
    return updated;
  },
  deleteCollateral: (id) => {
    const items = StorageService.getCollateral();
    const updated = items.filter(i => i.id !== id);
    save(STORAGE_KEYS.COLLATERAL, updated);
    return updated;
  },

  getManifests: () => loadOrInit(STORAGE_KEYS.MANIFESTS, INITIAL_MANIFESTS),
  addManifest: (manifest) => {
    const list = StorageService.getManifests();
    const updated = [manifest, ...list.filter(m => m.provenance_id !== manifest.provenance_id)];
    save(STORAGE_KEYS.MANIFESTS, updated);
    return updated;
  },

  exportFullJSON: () => {
    return JSON.stringify({
      exportDate: new Date().toISOString(),
      profile: StorageService.getProfile(),
      documents: StorageService.getDocuments(),
      claims: StorageService.getClaims(),
      collateral: StorageService.getCollateral(),
      manifests: StorageService.getManifests(),
    }, null, 2);
  },

  importFullJSON: (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.profile) save(STORAGE_KEYS.PROFILE, parsed.profile);
      if (parsed.documents) save(STORAGE_KEYS.DOCUMENTS, parsed.documents);
      if (parsed.claims) save(STORAGE_KEYS.CLAIMS, parsed.claims);
      if (parsed.collateral) save(STORAGE_KEYS.COLLATERAL, parsed.collateral);
      if (parsed.manifests) save(STORAGE_KEYS.MANIFESTS, parsed.manifests);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  resetDefaults: () => {
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.DOCUMENTS);
    localStorage.removeItem(STORAGE_KEYS.CLAIMS);
    localStorage.removeItem(STORAGE_KEYS.COLLATERAL);
    localStorage.removeItem(STORAGE_KEYS.MANIFESTS);
  }
};

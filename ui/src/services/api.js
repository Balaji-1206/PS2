/**
 * Client service connecting the React UI to the Governed Content Transformation Platform Backend.
 * Standard endpoint default: http://localhost:8000
 */

const API_BASE = "http://localhost:8000";

export const checkHealth = async () => {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error("Health check failed");
    return await res.json();
  } catch (err) {
    return { status: "offline", error: err.message };
  }
};

export const extractContent = async ({ text, file, url }) => {
  const formData = new FormData();
  if (file) {
    formData.append("file", file);
  } else if (url) {
    formData.append("url", url);
  } else if (text) {
    formData.append("text", text);
  }

  const res = await fetch(`${API_BASE}/extract`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || `Extraction failed with status ${res.status}`);
  }
  return await res.json();
};

export const getClaimBank = async (documentId) => {
  const res = await fetch(`${API_BASE}/extract/${documentId}/claims`);
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || "Failed to fetch claim bank");
  }
  return await res.json();
};

export const generateChannels = async (payload) => {
  const res = await fetch(`${API_BASE}/generate/channels`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || `Multi-channel generation failed with status ${res.status}`);
  }
  return await res.json();
};

export const verifyContent = async (payload) => {
  const res = await fetch(`${API_BASE}/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || `Verification failed with status ${res.status}`);
  }
  return await res.json();
};

export const buildProvenanceRecord = async (payload) => {
  const res = await fetch(`${API_BASE}/provenance/build`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || `Provenance build failed with status ${res.status}`);
  }
  return await res.json();
};

export const publishProvenanceRecord = async (provenanceId, payload) => {
  const res = await fetch(`${API_BASE}/provenance/${provenanceId}/publish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || `Publication failed with status ${res.status}`);
  }
  return await res.json();
};

export const verifyProvenanceIntegrity = async (provenanceId) => {
  const res = await fetch(`${API_BASE}/provenance/${provenanceId}/verify`);
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || "Failed to verify manifest integrity");
  }
  return await res.json();
};

export const traceSourcePointer = async (documentId, blockId) => {
  const res = await fetch(`${API_BASE}/provenance/trace/${documentId}/${blockId}`);
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || "Failed to resolve reverse traceability");
  }
  return await res.json();
};

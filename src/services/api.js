// API base URL - matches backend server
const API_BASE_URL = 'http://localhost:5000';

/**
 * Upload a document to the server
 * @param {File} file - The file to upload
 * @returns {Promise<{documentId: string}>}
 */
export const uploadDocument = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error uploading document:', error);
    throw error;
  }
};

/**
 * Fetch analysis results for a document
 * @param {string} documentId - The document ID
 * @returns {Promise<{extractedText: string, risks: Array}>}
 */
export const fetchAnalysis = async (documentId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/analysis/${documentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Analysis fetch failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching analysis:', error);
    throw error;
  }
};

/**
 * Download PDF report for a document
 * @param {string} documentId - The document ID
 */
export const downloadPDFReport = async (documentId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/report/${documentId}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Report download failed: ${response.statusText}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${documentId}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error downloading report:', error);
    throw error;
  }
};


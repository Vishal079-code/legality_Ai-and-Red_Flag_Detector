// FastAPI service URL (ngrok tunnel)
const FASTAPI_BASE_URL = import.meta.env.VITE_FASTAPI_BASE_URL || 'https://kaleigh-unprovided-unreciprocally.ngrok-free.dev';

// Mock API mode: Set to true to use mock responses, false to use real API
// You can also control this via environment variable: VITE_USE_MOCK_API=false
// Default is true (mock mode enabled)
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== 'false';

/**
 * Generate a mock analysis response matching DocumentAnalysisResponse schema
 * @param {File} file - The PDF file (used for logging)
 * @returns {Promise<Object>} Mock analysis response
 */
const getMockAnalysisResponse = async (file) => {
  // Simulate network delay (1-3 seconds)
  const delay = Math.random() * 2000 + 1000;
  await new Promise(resolve => setTimeout(resolve, delay));

  // Generate a UUID-like analysis_id
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const mockResponse = {
    analysis_id: generateUUID(),
    document_risk: 'high_risk',
    doc_score: 7,
    label_summary: {
      non_compete: {
        max_score: 0.85,
        high_risk_clauses: 2,
        total_clauses: 5
      },
      non_disclosure: {
        max_score: 0.72,
        high_risk_clauses: 1,
        total_clauses: 3
      },
      termination_clause: {
        max_score: 0.68,
        high_risk_clauses: 0,
        total_clauses: 2
      }
    },
    clauses: [
      {
        page_no: 3,
        clause_text: "Employee agrees not to compete with the Company, directly or indirectly, in any capacity, for a period of two (2) years following the termination of employment, within a radius of 50 miles from any location where the Company conducts business.",
        labels: [
          {
            label: "non_compete",
            semantic_score: 0.82,
            final_score: 0.78,
            band: "high"
          }
        ],
        final_score: 0.78,
        identity: 0.95,
        semantic: 0.82,
        margin: 0.15,
        top_matches: [
          {
            label: "non_compete",
            answer_text: "Employee shall not engage in any competitive business activities...",
            score: 0.82,
            source_title: "Standard Employment Agreement"
          }
        ]
      },
      {
        page_no: 5,
        clause_text: "The Employee acknowledges that all confidential information, trade secrets, and proprietary data disclosed during employment shall remain the exclusive property of the Company and shall not be disclosed to any third party for a period of five (5) years after termination.",
        labels: [
          {
            label: "non_disclosure",
            semantic_score: 0.72,
            final_score: 0.68,
            band: "review"
          }
        ],
        final_score: 0.68,
        identity: 0.88,
        semantic: 0.72,
        margin: 0.12,
        top_matches: [
          {
            label: "non_disclosure",
            answer_text: "Confidential information includes all proprietary data...",
            score: 0.72,
            source_title: "NDA Template"
          }
        ]
      },
      {
        page_no: 7,
        clause_text: "The Company reserves the right to terminate this agreement at any time, with or without cause, and without prior notice. The Employee shall have no right to compensation or benefits upon termination.",
        labels: [
          {
            label: "termination_clause",
            semantic_score: 0.68,
            final_score: 0.64,
            band: "review"
          }
        ],
        final_score: 0.64,
        identity: 0.75,
        semantic: 0.68,
        margin: 0.10,
        top_matches: [
          {
            label: "termination_clause",
            answer_text: "Termination may occur at any time...",
            score: 0.68,
            source_title: "Employment Contract Template"
          }
        ]
      },
      {
        page_no: 8,
        clause_text: "Employee agrees not to solicit any customers, clients, or employees of the Company for a period of one (1) year following termination of employment.",
        labels: [
          {
            label: "non_compete",
            semantic_score: 0.79,
            final_score: 0.75,
            band: "high"
          }
        ],
        final_score: 0.75,
        identity: 0.92,
        semantic: 0.79,
        margin: 0.14,
        top_matches: [
          {
            label: "non_compete",
            answer_text: "Non-solicitation of customers and employees...",
            score: 0.79,
            source_title: "Standard Employment Agreement"
          }
        ]
      }
    ]
  };

  console.log('📦 Using MOCK API response for file:', file.name);
  return mockResponse;
};

/**
 * Analyze a PDF document
 * @param {File} file - The PDF file to analyze
 * @returns {Promise<{
 *   analysis_id: string,
 *   document_risk: string,
 *   doc_score: number,
 *   label_summary: object,
 *   clauses: Array
 * }>}
 */
export const analyzeDocument = async (file) => {
  // Validate file input
  if (!file) {
    throw new Error('No file provided');
  }

  if (!(file instanceof File)) {
    throw new Error('Invalid file object');
  }

  // Log file info for debugging
  console.log('Uploading file:', {
    name: file.name,
    type: file.type,
    size: file.size,
    sizeMB: (file.size / (1024 * 1024)).toFixed(2) + ' MB'
  });

  // Use mock API if enabled
  if (USE_MOCK_API) {
    return await getMockAnalysisResponse(file);
  }

  // Real API call
  try {
    // Create FormData and append the PDF file
    const formData = new FormData();
    formData.append('file', file, file.name);

    const response = await fetch(`${FASTAPI_BASE_URL}/analyze`, {
      method: 'POST',
      body: formData,
      // DO NOT set Content-Type header - browser will set it automatically with boundary for FormData
      headers: {
        // ngrok may require this header to bypass browser warning
        'ngrok-skip-browser-warning': 'true',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Analysis failed:', response.status, errorText);
      throw new Error(`Analysis failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error analyzing document:', error);
    throw error;
  }
};

/**
 * Download highlighted PDF using analysis_id from FastAPI service
 * @param {string} analysisId - The analysis ID from the response
 * @returns {Promise<void>}
 */
export const downloadHighlightedPDF = async (analysisId) => {
  if (!analysisId) {
    console.error('No analysis ID provided');
    alert('No analysis ID available for download.');
    return;
  }

  try {
    const response = await fetch(`${FASTAPI_BASE_URL}/highlight/${analysisId}`, {
      method: 'GET',
      headers: {
        // ngrok may require this header to bypass browser warning
        'ngrok-skip-browser-warning': 'true',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to download PDF: ${response.statusText}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'highlighted-document.pdf';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error downloading highlighted PDF:', error);
    alert('Failed to download PDF. Please try again.');
    throw error;
  }
};

/**
 * Open highlighted PDF in new tab as preview using analysis_id from FastAPI service
 * Fetches the PDF as a blob and creates an object URL to display it inline
 * @param {string} analysisId - The analysis ID from the response
 */
export const openHighlightedPDF = async (analysisId) => {
  if (!analysisId) {
    console.error('No analysis ID provided');
    alert('No analysis ID available to open PDF.');
    return;
  }

  try {
    // Fetch the PDF as a blob to bypass the Content-Disposition: attachment header
    const response = await fetch(`${FASTAPI_BASE_URL}/highlight/${analysisId}`, {
      method: 'GET',
      headers: {
        // ngrok may require this header to bypass browser warning
        'ngrok-skip-browser-warning': 'true',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.statusText}`);
    }

    // Convert response to blob
    const blob = await response.blob();
    
    // Create object URL from blob - this allows inline display instead of download
    const blobUrl = window.URL.createObjectURL(blob);
    
    // Open in new tab - browser will display PDF inline
    const newWindow = window.open(blobUrl, '_blank');
    
    // Clean up the object URL after the window is closed or after a delay
    // Note: We can't reliably detect when the window is closed, so we'll clean up after a delay
    // The browser will also clean it up automatically when the page is closed
    setTimeout(() => {
      // Only revoke if the window was closed or failed to open
      if (!newWindow || newWindow.closed) {
        window.URL.revokeObjectURL(blobUrl);
      }
    }, 1000);
  } catch (error) {
    console.error('Error opening highlighted PDF:', error);
    alert('Failed to open PDF preview. Please try again.');
  }
};

// BELOW CODE TO BE DELETED, COMMENTED OUT JUST TO CHECK 
// /**
//  * Open or download highlighted PDF from URL (legacy function for backward compatibility)
//  * @param {string} pdfUrl - The URL to the highlighted PDF
//  * @param {boolean} download - Whether to download instead of opening in new tab
//  */
// export const openHighlightedPDFFromURL = (pdfUrl, download = false) => {
//   if (!pdfUrl) {
//     console.error('No PDF URL provided');
//     return;
//   }

//   if (download) {
//     // Download the PDF
//     fetch(pdfUrl)
//       .then((response) => response.blob())
//       .then((blob) => {
//         const url = window.URL.createObjectURL(blob);
//         const a = document.createElement('a');
//         a.href = url;
//         a.download = 'highlighted-document.pdf';
//         document.body.appendChild(a);
//         a.click();
//         window.URL.revokeObjectURL(url);
//         document.body.removeChild(a);
//       })
//       .catch((error) => {
//         console.error('Error downloading highlighted PDF:', error);
//         alert('Failed to download PDF. Please try again.');
//       });
//   } else {
//     // Open in new tab
//     window.open(pdfUrl, '_blank');
//   }
// };


// FastAPI service URL (ngrok tunnel)
const FASTAPI_BASE_URL = import.meta.env.VITE_FASTAPI_BASE_URL || 'https://kaleigh-unprovided-unreciprocally.ngrok-free.dev';

/**
 * Analyze a PDF document
 * @param {File} file - The PDF file to analyze
 * @returns {Promise<{
 *   document_risk: string,
 *   label_summary: object,
 *   clauses: Array,
 *   highlighted_pdf_url: string
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

  // Create FormData and append the PDF file
  const formData = new FormData();
  formData.append('file', file, file.name);

  // Log file info for debugging
  console.log('Uploading file:', {
    name: file.name,
    type: file.type,
    size: file.size,
    sizeMB: (file.size / (1024 * 1024)).toFixed(2) + ' MB'
  });

  try {
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

/**
 * Open or download highlighted PDF from URL (legacy function for backward compatibility)
 * @param {string} pdfUrl - The URL to the highlighted PDF
 * @param {boolean} download - Whether to download instead of opening in new tab
 */
export const openHighlightedPDFFromURL = (pdfUrl, download = false) => {
  if (!pdfUrl) {
    console.error('No PDF URL provided');
    return;
  }

  if (download) {
    // Download the PDF
    fetch(pdfUrl)
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'highlighted-document.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      })
      .catch((error) => {
        console.error('Error downloading highlighted PDF:', error);
        alert('Failed to download PDF. Please try again.');
      });
  } else {
    // Open in new tab
    window.open(pdfUrl, '_blank');
  }
};


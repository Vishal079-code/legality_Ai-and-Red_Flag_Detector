// API base URL - can be configured via environment variable or default to ngrok/localhost
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

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
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
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
 * Open or download highlighted PDF from URL
 * @param {string} pdfUrl - The URL to the highlighted PDF
 * @param {boolean} download - Whether to download instead of opening in new tab
 */
export const openHighlightedPDF = (pdfUrl, download = false) => {
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


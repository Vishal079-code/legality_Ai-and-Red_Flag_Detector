import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Loader from '../components/Loader';
import RiskCard from '../components/RiskCard';
import { downloadHighlightedPDF, openHighlightedPDF } from '../services/api';

const Analysis = () => {
  const location = useLocation();
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRiskLevel, setSelectedRiskLevel] = useState('All');
  const [isDownloading, setIsDownloading] = useState(false);
  const [analysisId, setAnalysisId] = useState(null);

  useEffect(() => {
    // Get analysis data from navigation state
    const data = location.state?.analysisData;
    
    if (!data) {
      setError('No analysis data available. Please upload a document first.');
      setLoading(false);
      return;
    }

    try {
      // Extract and save analysis_id from response
      if (data?.analysis_id) {
        setAnalysisId(data.analysis_id);
      }
      
      // Map FastAPI response to existing UI format
      const mappedData = mapBackendResponseToUI(data);
      setAnalysisData(mappedData);
    } catch (err) {
      setError(err.message || 'Failed to process analysis data.');
    } finally {
      setLoading(false);
    }
  }, [location.state]);

  // Map FastAPI response structure to existing UI expectations
  // Note: PDF highlighting is done in app/ directory only
  const mapBackendResponseToUI = (backendData) => {
    const { document_risk, label_summary, clauses = [], highlighted_pdf_url, analysis_id } = backendData;

    // Transform clauses and labels into risks array
    const risks = [];
    clauses.forEach((clause, clauseIndex) => {
      if (clause.labels && clause.labels.length > 0) {
        clause.labels.forEach((label) => {
          // Map band to risk level (high/medium/low)
          const riskLevel = label.band === 'high' ? 'High' : 
                           label.band === 'medium' ? 'Medium' : 'Low';
          
          risks.push({
            level: riskLevel,
            riskLevel: riskLevel,
            title: label.label || 'Risk Detected',
            clause: clause.clause_text,
            reason: `Semantic score: ${(label.semantic_score * 100).toFixed(1)}%, Final score: ${(label.final_score * 100).toFixed(1)}%`,
            description: `Page ${clause.page_no || 'N/A'}: ${clause.clause_text.substring(0, 100)}${clause.clause_text.length > 100 ? '...' : ''}`,
            clauseNumber: clauseIndex + 1,
            pageNo: clause.page_no,
            semanticScore: label.semantic_score,
            finalScore: label.final_score,
            identity: clause.identity,
            semantic: clause.semantic,
            margin: clause.margin,
          });
        });
      }
    });

    return {
      document_risk: document_risk || 'unknown',
      label_summary: label_summary || {},
      highlighted_pdf_url,
      analysis_id: analysis_id || null,
      risks,
      originalClauses: clauses, // Keep original for reference if needed
    };
  };

  const handleDownloadReport = async () => {
    if (!analysisId) {
      alert('No analysis ID available. Cannot download PDF.');
      return;
    }
    
    setIsDownloading(true);
    try {
      await downloadHighlightedPDF(analysisId);
    } catch (err) {
      console.error('Download error:', err);
      // Error is already handled in the downloadHighlightedPDF function
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOpenPDF = async () => {
    if (!analysisId) {
      alert('No analysis ID available. Cannot open PDF.');
      return;
    }
    await openHighlightedPDF(analysisId);
  };

  const filteredRisks = analysisData?.risks
    ? analysisData.risks.filter((risk) => {
        const level = risk.level || risk.riskLevel || 'Low';
        return selectedRiskLevel === 'All' || level === selectedRiskLevel;
      })
    : [];

  const riskCounts = analysisData?.risks
    ? {
        High: analysisData.risks.filter(
          (r) => (r.level || r.riskLevel) === 'High'
        ).length,
        Medium: analysisData.risks.filter(
          (r) => (r.level || r.riskLevel) === 'Medium'
        ).length,
        Low: analysisData.risks.filter(
          (r) => (r.level || r.riskLevel) === 'Low'
        ).length,
      }
    : { High: 0, Medium: 0, Low: 0 };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Loader message="Analyzing document and identifying risks..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Risk Summary
              </h2>

              {/* Risk Counts */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <span className="text-sm font-medium text-gray-700">High</span>
                  <span className="text-lg font-bold text-red-600">
                    {riskCounts.High}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <span className="text-sm font-medium text-gray-700">Medium</span>
                  <span className="text-lg font-bold text-yellow-600">
                    {riskCounts.Medium}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-sm font-medium text-gray-700">Low</span>
                  <span className="text-lg font-bold text-blue-600">
                    {riskCounts.Low}
                  </span>
                </div>
              </div>

              {/* Filters */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Filter by Risk</h3>
                <div className="space-y-2">
                  {['All', 'High', 'Medium', 'Low'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setSelectedRiskLevel(level)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        selectedRiskLevel === level
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Document Risk Level */}
              {analysisData?.document_risk && (
                <div className="mb-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">
                    Document Risk Level
                  </h3>
                  <span className={`text-lg font-bold ${
                    analysisData.document_risk === 'high_risk' 
                      ? 'text-red-600' 
                      : analysisData.document_risk === 'medium_risk'
                      ? 'text-yellow-600'
                      : 'text-blue-600'
                  }`}>
                    {analysisData.document_risk.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              )}

              {/* PDF Actions - Always show when analysis data exists */}
              {analysisData && (
                <div className="space-y-2 mb-6">
                  <button
                    onClick={handleOpenPDF}
                    disabled={!analysisId}
                    className={`w-full px-4 py-3 rounded-lg font-semibold transition-colors ${
                      !analysisId
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    Open Highlighted PDF
                  </button>
                  <button
                    onClick={handleDownloadReport}
                    disabled={isDownloading || !analysisId}
                    className={`w-full px-4 py-3 rounded-lg font-semibold transition-colors ${
                      isDownloading || !analysisId
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {isDownloading ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Downloading...
                      </span>
                    ) : (
                      'Download Highlighted PDF'
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Risk Cards */}
            {filteredRisks.length > 0 ? (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Identified Risks ({filteredRisks.length})
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {filteredRisks.map((risk, index) => (
                    <RiskCard key={index} risk={risk} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <p className="text-gray-500">
                  {selectedRiskLevel === 'All'
                    ? 'No risks identified in this document.'
                    : `No ${selectedRiskLevel.toLowerCase()} risks found.`}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;



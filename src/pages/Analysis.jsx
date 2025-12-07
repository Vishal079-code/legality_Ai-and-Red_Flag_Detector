import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Loader from '../components/Loader';
import ClauseHighlighter from '../components/ClauseHighlighter';
import RiskCard from '../components/RiskCard';
import { fetchAnalysis, downloadPDFReport } from '../services/api';

const Analysis = () => {
  const { documentId } = useParams();
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRiskLevel, setSelectedRiskLevel] = useState('All');
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const loadAnalysis = async () => {
      if (!documentId) {
        setError('No document ID provided');
        setLoading(false);
        return;
      }

      try {
        const data = await fetchAnalysis(documentId);
        setAnalysisData(data);
      } catch (err) {
        setError(err.message || 'Failed to load analysis. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadAnalysis();
  }, [documentId]);

  const handleDownloadReport = async () => {
    setIsDownloading(true);
    try {
      await downloadPDFReport(documentId);
    } catch (err) {
      alert('Failed to download report. Please try again.');
    } finally {
      setIsDownloading(false);
    }
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

              {/* Download Button */}
              <button
                onClick={handleDownloadReport}
                disabled={isDownloading}
                className={`w-full px-4 py-3 rounded-lg font-semibold transition-colors ${
                  isDownloading
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
                  'Download PDF Report'
                )}
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Document Text with Highlights */}
            <ClauseHighlighter
              text={analysisData?.extractedText || ''}
              risks={analysisData?.risks || []}
            />

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


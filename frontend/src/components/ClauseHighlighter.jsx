const ClauseHighlighter = ({ text, risks = [] }) => {
  if (!text) {
    return (
      <div className="text-gray-500 italic p-4">No text extracted from document.</div>
    );
  }

  // Sort risks by position to highlight in order
  const sortedRisks = [...risks].sort((a, b) => {
    const startA = a.startIndex || a.start || 0;
    const startB = b.startIndex || b.start || 0;
    return startA - startB;
  });

  // Build highlighted text with risk markers
  const buildHighlightedText = () => {
    if (sortedRisks.length === 0) {
      return <span>{text}</span>;
    }

    const parts = [];
    let lastIndex = 0;

    sortedRisks.forEach((risk, idx) => {
      const start = risk.startIndex || risk.start || 0;
      const end = risk.endIndex || risk.end || start + (risk.text?.length || 0);
      const riskLevel = risk.level || risk.riskLevel || 'Low';

      // Add text before the risk
      if (start > lastIndex) {
        parts.push(
          <span key={`text-${idx}`}>{text.substring(lastIndex, start)}</span>
        );
      }

      // Add highlighted risk text
      const riskText = text.substring(start, end);
      const bgColor =
        riskLevel === 'High'
          ? 'bg-red-100 border-red-300'
          : riskLevel === 'Medium'
          ? 'bg-yellow-100 border-yellow-300'
          : 'bg-blue-100 border-blue-300';

      const textColor =
        riskLevel === 'High'
          ? 'text-red-800'
          : riskLevel === 'Medium'
          ? 'text-yellow-800'
          : 'text-blue-800';

      parts.push(
        <span
          key={`risk-${idx}`}
          className={`${bgColor} ${textColor} border-b-2 px-1 rounded-sm font-medium`}
          title={`${riskLevel} Risk: ${risk.reason || risk.description || ''}`}
        >
          {riskText}
        </span>
      );

      lastIndex = end;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(
        <span key="text-end">{text.substring(lastIndex)}</span>
      );
    }

    return parts;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Extracted Text with Risk Highlights
      </h3>
      <div className="prose max-w-none">
        <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {buildHighlightedText()}
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded-sm"></div>
          <span className="text-sm text-gray-600">High Risk</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-300 rounded-sm"></div>
          <span className="text-sm text-gray-600">Medium Risk</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-100 border-2 border-blue-300 rounded-sm"></div>
          <span className="text-sm text-gray-600">Low Risk</span>
        </div>
      </div>
    </div>
  );
};

export default ClauseHighlighter;



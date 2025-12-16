/**
 * Analyze text and identify risky clauses
 * @param {string} text - The text to analyze
 * @returns {Promise<{clauses: Array, riskScore: number}>}
 */
export const analyzeText = (text) => {
  if (!text || text.trim().length === 0) {
    return {
      clauses: [],
      riskScore: 0,
    };
  }

  // Risk patterns and keywords
  const riskPatterns = {
    high: [
      {
        keywords: [
          'waiver of liability',
          'no liability',
          'not responsible',
          'hold harmless',
          'indemnification',
          'arbitration clause',
          'class action waiver',
          'binding arbitration',
          'no refund',
          'non-refundable',
          'as-is',
          'no warranty',
          'disclaimer',
          'exclusive remedy',
          'limitation of liability',
          'liquidated damages',
          'penalty clause',
          'automatic renewal',
          'cancellation fee',
          'early termination fee',
        ],
        category: 'Liability & Indemnification',
        reason: 'Contains high-risk liability waivers or indemnification clauses',
      },
      {
        keywords: [
          'confidential information',
          'non-disclosure',
          'proprietary',
          'trade secret',
          'non-compete',
          'restrictive covenant',
          'exclusive agreement',
        ],
        category: 'Confidentiality & Restrictions',
        reason: 'Contains restrictive confidentiality or non-compete clauses',
      },
      {
        keywords: [
          'automatic renewal',
          'auto-renew',
          'renewal term',
          'evergreen clause',
          'continuous service',
        ],
        category: 'Renewal Terms',
        reason: 'Contains automatic renewal clauses that may lock you in',
      },
    ],
    medium: [
      {
        keywords: [
          'termination',
          'cancellation',
          'breach',
          'default',
          'penalty',
          'late fee',
          'interest rate',
          'annual percentage rate',
          'apr',
        ],
        category: 'Termination & Fees',
        reason: 'Contains termination or fee-related clauses that require attention',
      },
      {
        keywords: [
          'jurisdiction',
          'governing law',
          'venue',
          'dispute resolution',
          'mediation',
        ],
        category: 'Legal Jurisdiction',
        reason: 'Contains jurisdiction or dispute resolution clauses',
      },
      {
        keywords: [
          'modification',
          'amendment',
          'change',
          'update',
          'revise',
        ],
        category: 'Modification Rights',
        reason: 'Contains clauses about contract modification rights',
      },
    ],
    low: [
      {
        keywords: [
          'notice',
          'notification',
          'communication',
          'contact',
          'address',
        ],
        category: 'Communication',
        reason: 'Contains standard communication or notice clauses',
      },
      {
        keywords: [
          'severability',
          'entire agreement',
          'force majeure',
          'assignment',
        ],
        category: 'Standard Terms',
        reason: 'Contains standard legal boilerplate clauses',
      },
    ],
  };

  const clauses = [];
  const textLower = text.toLowerCase();
  const sentences = splitIntoSentences(text);

  // Check each sentence for risk patterns
  sentences.forEach((sentence, sentenceIndex) => {
    const sentenceLower = sentence.toLowerCase();
    let foundRisk = false;

    // Check high-risk patterns
    for (const pattern of riskPatterns.high) {
      for (const keyword of pattern.keywords) {
        if (sentenceLower.includes(keyword.toLowerCase())) {
          const startIndex = text.indexOf(sentence);
          const endIndex = startIndex + sentence.length;

          clauses.push({
            text: sentence.trim(),
            level: 'High',
            reason: pattern.reason,
            category: pattern.category,
            startIndex,
            endIndex,
          });
          foundRisk = true;
          break;
        }
      }
      if (foundRisk) break;
    }

    // Check medium-risk patterns (if not already marked as high)
    if (!foundRisk) {
      for (const pattern of riskPatterns.medium) {
        for (const keyword of pattern.keywords) {
          if (sentenceLower.includes(keyword.toLowerCase())) {
            const startIndex = text.indexOf(sentence);
            const endIndex = startIndex + sentence.length;

            clauses.push({
              text: sentence.trim(),
              level: 'Medium',
              reason: pattern.reason,
              category: pattern.category,
              startIndex,
              endIndex,
            });
            foundRisk = true;
            break;
          }
        }
        if (foundRisk) break;
      }
    }

    // Check low-risk patterns (if not already marked)
    if (!foundRisk) {
      for (const pattern of riskPatterns.low) {
        for (const keyword of pattern.keywords) {
          if (sentenceLower.includes(keyword.toLowerCase())) {
            const startIndex = text.indexOf(sentence);
            const endIndex = startIndex + sentence.length;

            clauses.push({
              text: sentence.trim(),
              level: 'Low',
              reason: pattern.reason,
              category: pattern.category,
              startIndex,
              endIndex,
            });
            break;
          }
        }
      }
    }
  });

  // Calculate risk score (0-100)
  const riskScore = calculateRiskScore(clauses);

  return {
    clauses,
    riskScore,
  };
};

/**
 * Split text into sentences
 */
const splitIntoSentences = (text) => {
  // Split by sentence-ending punctuation, but keep the punctuation
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10); // Filter out very short fragments

  return sentences;
};

/**
 * Calculate overall risk score based on clauses
 * @param {Array} clauses - Array of risk clauses
 * @returns {number} Risk score from 0-100
 */
const calculateRiskScore = (clauses) => {
  if (clauses.length === 0) {
    return 0;
  }

  let score = 0;
  const weights = {
    High: 10,
    Medium: 5,
    Low: 2,
  };

  clauses.forEach((clause) => {
    score += weights[clause.level] || 0;
  });

  // Normalize to 0-100 scale
  // Base score on number and severity of risks
  const maxPossibleScore = clauses.length * 10;
  const normalizedScore = Math.min(100, (score / maxPossibleScore) * 100);

  // Add base score for having any risks
  const finalScore = Math.min(100, normalizedScore + (clauses.length * 2));

  return Math.round(finalScore);
};



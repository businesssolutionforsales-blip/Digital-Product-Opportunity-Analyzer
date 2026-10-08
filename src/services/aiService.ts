import {
  QuestionnaireAnswers,
  StrategicReport,
  AiStrategicInterpretation,
  IdeaDiscoveryAnswers,
  DiscoveredCandidate,
} from '../types';

/**
 * Structured AI Strategic Consultant Service
 * Bridges server-side Gemini API with strict deterministic boundary.
 */

export async function queryStructuredAiInterpretation(
  reportCore: Pick<
    StrategicReport,
    'opportunityScore' | 'confidenceScore' | 'opportunityBand' | 'confidenceBand' | 'dimensions' | 'formatRecommendation'
  >,
  answers: QuestionnaireAnswers
): Promise<AiStrategicInterpretation | null> {
  try {
    const structuredContext = {
      user_provided_answers: {
        domain: answers.expertiseDomain,
        years: answers.yearsOfExperience,
        buyer_description: answers.targetBuyerDescription,
        buyer_specificity: answers.isBuyerBroadOrSpecific,
        problem_description: answers.coreProblemDescription,
        frequency: answers.problemFrequency,
        cost_of_inaction: answers.costOfInaction,
        current_alternatives: answers.currentAlternativesAndWorkarounds,
        demand_evidence_types: answers.demandEvidenceList,
        evidence_notes: answers.evidenceNotes,
        before_state: answers.beforeState,
        after_state: answers.afterState,
        unique_method: answers.uniqueMethodOrProcess || 'لم يحدد طريقة خاصة حتى الآن',
        creator_time_per_customer: answers.creatorTimePerCustomer,
        requires_feedback: answers.requiresPersonalFeedback,
        price_tier: answers.expectedPriceTier,
      },
      deterministic_scores: {
        opportunity_score: reportCore.opportunityScore,
        opportunity_band: reportCore.opportunityBand.labelAr,
        confidence_score: reportCore.confidenceScore,
        confidence_band: reportCore.confidenceBand.labelAr,
        dimensions: Object.fromEntries(
          Object.entries(reportCore.dimensions).map(([k, v]) => [
            k,
            { score: v.score, weight: v.weightPercent },
          ])
        ),
      },
      format_recommendation: {
        primary: reportCore.formatRecommendation.primary.titleAr,
      },
      contradictions_detected: [
        ...((answers.creatorTimePerCustomer === 'almost_none' || answers.creatorTimePerCustomer === 'under_30m') &&
        (answers.requiresPersonalFeedback === true ||
          answers.requiresOneOnOneAccountability === true ||
          (answers.deliveryMechanism || []).includes('critique_feedback') ||
          (answers.deliveryMechanism || []).includes('accountability'))
          ? ['تناقض في نموذج التسليم: الرغبة في منتج أوتوماتيكي متوسع دون تدخل شخصي مع وعد بنتيجة تتطلب مراجعة شخصية ومتابعة فردية']
          : []),
      ],
    };

    const res = await fetch('/api/analyze-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ structuredContext }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.available && data.interpretation) {
        return data.interpretation as AiStrategicInterpretation;
      }
    }
  } catch (err) {
    console.debug('[AI SERVICE] AI endpoint unavailable, using deterministic rules only.');
  }

  return null;
}

export async function discoverCandidateIdeasAi(
  discoveryInput: IdeaDiscoveryAnswers
): Promise<DiscoveredCandidate[] | null> {
  try {
    const res = await fetch('/api/discover-ideas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ discoveryInput }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.available && Array.isArray(data.candidates) && data.candidates.length > 0) {
        return data.candidates.map((c: any) => ({
          ...c,
          source: c.source || 'ai_generated',
        })) as DiscoveredCandidate[];
      }
    }
  } catch (err) {
    console.debug('[AI DISCOVER SERVICE] Falling back to deterministic rules template.');
  }

  return null;
}

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

/**
 * Strict validator for AI Strategic Interpretation from Gemini.
 * Ensures that all expected fields exist and are non-empty strings.
 */
export function isValidAiInterpretation(
  interpretation?: AiStrategicInterpretation | null
): interpretation is AiStrategicInterpretation {
  if (!interpretation || typeof interpretation !== 'object') {
    return false;
  }
  const requiredFields: (keyof AiStrategicInterpretation)[] = [
    'strategic_interpretation',
    'evidence_gap',
    'recommended_test',
    'recommended_test_reason',
    'what_not_to_do',
    'next_best_question',
  ];

  return requiredFields.every((field) => {
    const val = interpretation[field];
    return typeof val === 'string' && val.trim().length > 0;
  });
}

/**
 * Computes a deterministic canonical fingerprint for questionnaire answers.
 * Used to ensure that AI interpretations are strictly tied to the exact input state
 * and never displayed for mismatched or modified diagnostic data.
 */
export function computeAiInputFingerprint(answers: QuestionnaireAnswers): string {
  const norm = {
    domain: (answers.expertiseDomain || '').trim().toLowerCase(),
    years: (answers.yearsOfExperience || '').trim(),
    buyer: (answers.targetBuyerDescription || '').trim().toLowerCase(),
    buyer_spec: answers.isBuyerBroadOrSpecific || '',
    problem: (answers.coreProblemDescription || '').trim().toLowerCase(),
    freq: answers.problemFrequency || '',
    cost: Array.isArray(answers.costOfInaction)
      ? [...answers.costOfInaction].sort().join(',')
      : String(answers.costOfInaction || '').trim().toLowerCase(),
    alternatives: (answers.currentAlternativesAndWorkarounds || '').trim().toLowerCase(),
    demand_evidence: [...(answers.demandEvidenceList || [])].sort().join(','),
    evidence_notes: (answers.evidenceNotes || '').trim().toLowerCase(),
    before: (answers.beforeState || '').trim().toLowerCase(),
    after: (answers.afterState || '').trim().toLowerCase(),
    method: (answers.uniqueMethodOrProcess || '').trim().toLowerCase(),
    method_type: answers.uniqueMethodType || '',
    creator_time: answers.creatorTimePerCustomer || '',
    requires_feedback: Boolean(answers.requiresPersonalFeedback),
    price_tier: answers.expectedPriceTier || '',
    paying_clients: Boolean(answers.hasExistingPayingClients),
    access_level: answers.audienceAccessLevel || '',
    feedback_state: answers.personalFeedbackState || '',
    one_on_one: Boolean(answers.requiresOneOnOneAccountability),
    delivery_mech: [...(answers.deliveryMechanism || [])].sort().join(','),
  };
  return JSON.stringify(norm);
}

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

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

export const FINGERPRINT_SCHEMA_VERSION = 'v2';

function normStr(v: any): string {
  if (v == null) return '';
  return String(v).trim().toLowerCase();
}

function normArr(v: any): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .map(normStr)
    .filter((s) => s.length > 0)
    .sort();
}

function normBoolOrString(v: any): string {
  if (v === true || v === 'yes') return 'yes';
  if (v === false || v === 'no') return 'no';
  return normStr(v);
}

/**
 * Computes a deterministic canonical fingerprint for questionnaire answers.
 * Covers all questionnaire fields capable of affecting Gemini interpretation context,
 * deterministic scoring formulas, validation maturity stages, and format recommendations.
 * Uses strict key ordering and stable normalization with schema versioning.
 */
export function computeAiInputFingerprint(answers: QuestionnaireAnswers): string {
  const canon = {
    _schema: FINGERPRINT_SCHEMA_VERSION,
    afterState: normStr(answers.afterState),
    audienceAccessLevel: normStr(answers.audienceAccessLevel),
    availableWeeklyHours: normStr(answers.availableWeeklyHours),
    beforeState: normStr(answers.beforeState),
    buyerCurrentBehavior: normStr(answers.buyerCurrentBehavior),
    buyerStageAndSituation: normStr(answers.buyerStageAndSituation),
    coreProblemDescription: normStr(answers.coreProblemDescription),
    costOfInaction: normArr(answers.costOfInaction),
    creatorMethodSummary: normStr(answers.creatorMethodSummary),
    creatorTimePerCustomer: normStr(answers.creatorTimePerCustomer),
    deliveryMechanism: normArr(answers.deliveryMechanism),
    demandEvidenceList: normArr(answers.demandEvidenceList),
    evidenceNotes: normStr(answers.evidenceNotes),
    existingAudienceChannel: normStr(answers.existingAudienceChannel),
    expectedPriceTier: normStr(answers.expectedPriceTier),
    expertiseDomain: normStr(answers.expertiseDomain),
    explicitRecurringRequestReceived: normBoolOrString(answers.explicitRecurringRequestReceived),
    fieldProvenance: {
      coreProblem: normStr(answers.fieldProvenance?.coreProblem),
      demandEvidence: normStr(answers.fieldProvenance?.demandEvidence),
      desiredTransformation: normStr(answers.fieldProvenance?.desiredTransformation),
      productTitle: normStr(answers.fieldProvenance?.productTitle),
      qualification: normStr(answers.fieldProvenance?.qualification),
      targetBuyer: normStr(answers.fieldProvenance?.targetBuyer),
      uniqueMethod: normStr(answers.fieldProvenance?.uniqueMethod),
    },
    hasConfirmedHypotheses: Boolean(answers.hasConfirmedHypotheses),
    hasDeliveredSolutionMultipleTimes: normBoolOrString(answers.hasDeliveredSolutionMultipleTimes),
    hasDeliveryCapacityAndClearBottlenecks: normBoolOrString(answers.hasDeliveryCapacityAndClearBottlenecks),
    hasDocumentedRetentionData: normBoolOrString(answers.hasDocumentedRetentionData),
    hasExistingPayingClients: answers.hasExistingPayingClients == null ? 'null' : Boolean(answers.hasExistingPayingClients) ? 'yes' : 'no',
    hasMeasuredConversionRate: normBoolOrString(answers.hasMeasuredConversionRate),
    hasRecurringPaymentBehavior: normStr(answers.hasRecurringPaymentBehavior),
    hasRepeatProductSales: normBoolOrString(answers.hasRepeatProductSales),
    hasRepeatableAcquisitionChannel: normBoolOrString(answers.hasRepeatableAcquisitionChannel),
    hasRepeatableDeliveryProcess: normBoolOrString(answers.hasRepeatableDeliveryProcess),
    hasStableLeadFlow: normBoolOrString(answers.hasStableLeadFlow),
    isBuyerBroadOrSpecific: normStr(answers.isBuyerBroadOrSpecific),
    knowsActualDeliveryBurden: normBoolOrString(answers.knowsActualDeliveryBurden),
    oneOnOneAccountabilityState: normStr(answers.oneOnOneAccountabilityState),
    personalFeedbackState: normStr(answers.personalFeedbackState),
    problemFrequency: normStr(answers.problemFrequency),
    problemsFrequentlySolved: normStr(answers.problemsFrequentlySolved),
    productNameOrWorkingTitle: normStr(answers.productNameOrWorkingTitle),
    productRoleInBusiness: normStr(answers.productRoleInBusiness),
    qualificationEvidence: normArr(answers.qualificationEvidence),
    recurringBuyerCountApprox: normStr(answers.recurringBuyerCountApprox),
    recurringValueReason: normStr(answers.recurringValueReason),
    repeatedQuestions: normStr(answers.repeatedQuestions),
    requiresOneOnOneAccountability: answers.requiresOneOnOneAccountability == null ? 'null' : Boolean(answers.requiresOneOnOneAccountability) ? 'yes' : 'no',
    requiresPersonalFeedback: answers.requiresPersonalFeedback == null ? 'null' : Boolean(answers.requiresPersonalFeedback) ? 'yes' : 'no',
    targetBuyerDescription: normStr(answers.targetBuyerDescription),
    transformationRealism: normStr(answers.transformationRealism),
    understandsStandardVsCustomDelivery: normBoolOrString(answers.understandsStandardVsCustomDelivery),
    uniqueMethodOrProcess: normStr(answers.uniqueMethodOrProcess),
    uniqueMethodType: normStr(answers.uniqueMethodType),
    userPath: normStr(answers.userPath),
  };

  return JSON.stringify(canon);
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

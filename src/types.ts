/**
 * Types and Data Contracts for Digital Product Opportunity Analyzer
 * Mohamed Adel — Sales Funnel Architect
 * Growth OS — Module 1: Creator
 */

export type UserPath =
  | 'expert_no_idea'       // عندي خبرة أو مهارة لكن لسه مش محدد المنتج
  | 'multiple_ideas'       // عندي كذا فكرة ومش عارف أختار
  | 'specific_idea'        // عندي فكرة منتج محددة وعايز أختبرها
  | 'service_to_product'   // عندي خدمة وعايز أحول جزء منها لمنتج رقمي
  | 'audience_no_product'; // عندي جمهور وعايز أعرف أنسب منتج أقدمه له

export interface IdeaDiscoveryAnswers {
  expertiseArea: string;
  yearsOfExperience: string;
  coreSkills: string;
  repeatedQuestions: string;
  problemsFrequentlySolved: string;
  audiencesBestUnderstood: string;
  credibleResultsCreated: string;
  contentOrAudiencePresence: 'strong_audience' | 'growing_audience' | 'small_following' | 'no_audience' | 'not_selected';
  preferredDeliveryStyle: 'templates_tools' | 'recorded_video' | 'live_interactive' | 'cohort_community' | 'hybrid' | 'not_selected';
  availableWeeklyHours: 'under_5' | '5_to_10' | '10_to_20' | 'full_time' | 'not_selected';
  scalabilityPreference: 'maximum_scalable' | 'balanced' | 'high_touch_premium' | 'not_selected';
}

export type FieldProvenance =
  | 'user_explicit'      // أدخله المستخدم بيده مباشرة في الاستبيان
  | 'ai_hypothesis'     // فرضية مولدة عبر الذكاء الاصطناعي لم تُعتمد بعد
  | 'confirmed_by_user' // فرضية راجعها المستخدم واعتمدها صراحة
  | 'derived';          // مشتق حسابياً أو منطقياً

export interface FieldProvenanceMap {
  productTitle?: FieldProvenance;
  targetBuyer?: FieldProvenance;
  coreProblem?: FieldProvenance;
  desiredTransformation?: FieldProvenance;
  uniqueMethod?: FieldProvenance;
  deliveryConstraints?: FieldProvenance;
  audienceAccess?: FieldProvenance;
  demandEvidence?: FieldProvenance;
  qualification?: FieldProvenance;
}

export interface DiscoveredCandidate {
  id: string;
  title: string;
  targetAudience: string;
  coreProblem: string;
  desiredTransformation: string;
  possibleFormat: string;
  fitRationale: string;
  biggestRisk: string;
  strongestEvidence?: string;
  missingEvidence?: string;
  easiestValidationTest?: string;
  source?: 'ai_generated' | 'rules_fallback';
}

export type EvidenceType =
  | 'people_ask_me'
  | 'existing_clients_ask'
  | 'inbound_requests'
  | 'audience_comments'
  | 'sold_related_work'
  | 'competitors_sell'
  | 'search_community_discussions'
  | 'waitlist_subscribers'
  | 'free_waitlist'
  | 'preorders_deposits' // backward-compat legacy
  | 'purchase_commitment' // Stage 3 max (intent without money)
  | 'paid_deposit' // Stage 4 money
  | 'paid_preorder' // Stage 4 money
  | 'paid_pilot' // Stage 4 money
  | 'none_yet';

export type ProblemFrequency = 'daily' | 'weekly' | 'monthly' | 'occasional' | 'unsure' | 'not_selected';

export type TimePerCustomer = 'almost_none' | 'under_30m' | '1_to_2h' | 'recurring_support' | 'high_touch' | 'not_selected';

export type TriStateDelivery = 'required' | 'not_required' | 'unknown';

export type SprintMode =
  | 'DISCOVERY_SPRINT'
  | 'OFFER_VALIDATION_SPRINT'
  | 'PAID_PILOT_LEARNING_SPRINT'
  | 'DELIVERY_VALIDATION_SPRINT'
  | 'RECURRING_MODEL_VALIDATION_SPRINT'
  | 'SCALE_READINESS_SPRINT';

export interface QuestionnaireAnswers {
  // Path context
  userPath: UserPath;
  productNameOrWorkingTitle?: string;

  // Section A — Creator Advantage
  expertiseDomain: string;
  yearsOfExperience: string;
  qualificationEvidence: string[]; // 'client_results' | 'personal_results' | 'professional_credentials' | 'audience_access' | 'none_yet'
  uniqueMethodOrProcess: string;
  audienceAccessLevel: 'direct_daily' | 'occasional' | 'indirect_communities' | 'none_yet' | 'unsure' | 'not_selected';

  // Section B — Buyer Clarity
  targetBuyerDescription: string;
  buyerStageAndSituation: string;
  buyerCurrentBehavior: string;
  isBuyerBroadOrSpecific: 'narrow_specific' | 'moderate' | 'broad_general' | 'not_selected';

  // Section C — Problem Quality
  coreProblemDescription: string;
  problemFrequency: ProblemFrequency;
  costOfInaction: string[]; // 'money' | 'time' | 'opportunity' | 'stress' | 'performance' | 'status'
  currentAlternativesAndWorkarounds: string;

  // Section D — Demand Evidence
  demandEvidenceList: EvidenceType[];
  evidenceNotes: string;

  // Section E — Transformation
  beforeState: string;
  afterState: string;
  transformationRealism: 'highly_controllable' | 'moderate' | 'depends_on_many_external_factors' | 'not_selected';

  // Section F — Product Mechanism
  deliveryMechanism: string[]; // 'framework_steps' | 'templates_tools' | 'live_coaching' | 'critique_feedback' | 'accountability' | 'community'
  creatorMethodSummary: string;

  // Section G — Delivery Constraints
  creatorTimePerCustomer: TimePerCustomer;
  requiresPersonalFeedback: boolean | null; // legacy boolean
  requiresOneOnOneAccountability: boolean | null; // legacy boolean
  personalFeedbackState?: TriStateDelivery; // strict tri-state
  oneOnOneAccountabilityState?: TriStateDelivery; // strict tri-state

  // Section H — Monetization & Recurring Context
  expectedPriceTier: 'micro_under_50' | 'low_50_150' | 'mid_150_500' | 'premium_500_plus' | 'not_sure_yet' | 'not_selected';
  productRoleInBusiness: 'lead_tripwire' | 'core_flagship' | 'backend_service_feeder' | 'standalone' | 'unsure' | 'not_selected';
  existingAudienceChannel: string;
  hasExistingPayingClients: boolean | null;

  // Explicit Recurring Business Evidence (Separate from ordinary payments)
  hasRecurringPaymentBehavior?: 'recurring_monthly' | 'repeat_buyers_no_sub' | 'no' | 'unsure' | 'not_selected';
  recurringBuyerCountApprox?: number | string;
  explicitRecurringRequestReceived?: boolean | 'yes' | 'no' | 'unsure';
  recurringValueReason?: string; // Why does the buyer need value in month 2 and 3?

  // Explicit Repeatable Delivery Evidence (Required for Stage 5)
  hasDeliveredSolutionMultipleTimes?: boolean | 'yes' | 'no' | 'not_yet';
  understandsStandardVsCustomDelivery?: boolean | 'yes' | 'no' | 'unsure';
  knowsActualDeliveryBurden?: boolean | 'yes' | 'no' | 'unsure';
  hasRepeatableDeliveryProcess?: boolean | 'yes' | 'no' | 'developing';

  // Explicit Scale Readiness Evidence (Required for Stage 6: yes | no | not_measured_yet)
  hasRepeatableAcquisitionChannel?: boolean | 'yes' | 'no' | 'not_measured_yet';
  hasStableLeadFlow?: boolean | 'yes' | 'no' | 'not_measured_yet';
  hasMeasuredConversionRate?: boolean | 'yes' | 'no' | 'not_measured_yet';
  hasRepeatProductSales?: boolean | 'yes' | 'no' | 'not_measured_yet';
  hasDeliveryCapacityAndClearBottlenecks?: boolean | 'yes' | 'no' | 'not_measured_yet';
  hasDocumentedRetentionData?: boolean | 'yes' | 'no' | 'not_measured_yet';

  // Provenance & Strategic Rigor
  fieldProvenance?: FieldProvenanceMap;
  uniqueMethodType?: 'proprietary_framework' | 'general_skills_only' | 'developing_now' | 'not_selected';
  hasConfirmedHypotheses?: boolean;

  // Contextual carry-over from discovery (optional)
  repeatedQuestions?: string;
  problemsFrequentlySolved?: string;
  availableWeeklyHours?: 'under_5' | '5_to_10' | '10_to_20' | 'full_time' | 'not_selected';
}

export interface DimensionScore {
  nameAr: string;
  nameEn: string;
  weightPercent: number;
  score: number; // 0 - 100
  notesAr: string;
}

export type OpportunityBandId =
  | 'strong_opportunity'
  | 'promising'
  | 'needs_refinement'
  | 'weak_signal'
  | 'do_not_build';

export interface OpportunityBand {
  id: OpportunityBandId;
  min: number;
  max: number;
  labelAr: string;
  labelEn: string;
  colorClass: string;
  descriptionAr: string;
}

export type ConfidenceBandId = 'high' | 'moderate' | 'low' | 'insufficient';

export interface ConfidenceBand {
  id: ConfidenceBandId;
  min: number;
  max: number;
  labelAr: string;
  labelEn: string;
  descriptionAr: string;
}

export interface AssumptionItem {
  id: string;
  textAr: string;
  category: 'evidence' | 'needs_validation' | 'high_risk';
  categoryLabelAr: string;
  contextNoteAr: string;
}

export interface ProductFormatInfo {
  titleAr: string;
  titleEn: string;
  whyFitAr: string;
  speedToFirstValue: string;
  deliveryBurden: string;
}

export interface AvoidFormatInfo {
  titleAr: string;
  titleEn: string;
  whyNotAr: string;
}

export interface ProductConcept {
  nameDirections: string[];
  targetAudience: string;
  coreProblem: string;
  desiredTransformation: string;
  productMechanism: string;
  productFormat: string;
  initialValueProposition: string;
  whatNotToInclude: string[];
}

export interface PositioningStatement {
  formulaVersionAr: string;
  naturalMarketingVersionAr: string;
}

export interface MvpRecommendation {
  titleAr: string;
  mvpTypeAr: string;
  buildNow: string[];
  doNotBuildYet: string[];
  rationaleAr: string;
}

export interface ValidationDay {
  dayNumber: number;
  dayTitleAr: string;
  focusAr: string;
  actionItems: string[];
  expectedOutputAr: string;
}

export interface DiscoveryQuestion {
  id: number;
  questionAr: string;
  objectiveAr: string;
  whatToListenForAr: string;
}

export interface StopGoRules {
  continueIf: string[];
  refineIf: string[];
  stopOrPivotIf: string[];
}

export interface WhatNotToDoItem {
  headlineAr: string;
  rationaleAr: string;
}

export interface MissingDataItem {
  fieldAr: string;
  importanceAr: string;
  howToGatherAr: string;
}

export interface AiStrategicInterpretation {
  strongest_underused_advantage: string;
  highest_risk_assumption: string;
  evidence_gap: string;
  strategic_interpretation: string;
  recommended_test: string;
  recommended_test_reason: string;
  what_not_to_do: string;
  next_best_question: string;
}

export type ValidationMaturityStage =
  | 'STAGE_0_ASSUMPTION'
  | 'STAGE_1_PROBLEM_EVIDENCE'
  | 'STAGE_2_INTEREST_EVIDENCE'
  | 'STAGE_3_COMMITMENT_EVIDENCE'
  | 'STAGE_4_PAID_PILOT'
  | 'STAGE_5_REPEATABLE_DELIVERY'
  | 'STAGE_6_SCALE_EVIDENCE';

export interface ValidationMaturityInfo {
  stage: ValidationMaturityStage;
  stageNumber: number; // 0 - 6
  labelAr: string;
  labelEn: string;
  summaryAr: string;
}

export interface StrategicReport {
  id: string;
  createdAt: string;
  answers: QuestionnaireAnswers;
  analysisMode: 'hybrid_ai' | 'rules_only';
  aiInterpretation?: AiStrategicInterpretation;
  aiFingerprint?: string;
  isAiRecalculating?: boolean;
  validationMaturity?: ValidationMaturityInfo;

  opportunityScore: number; // 0 - 100
  opportunityBand: OpportunityBand;

  confidenceScore: number; // 0 - 100
  confidenceBand: ConfidenceBand;

  dimensions: {
    problemStrength: DimensionScore;
    buyerClarity: DimensionScore;
    transformationStrength: DimensionScore;
    demandEvidence: DimensionScore;
    creatorAdvantage: DimensionScore;
    deliveryFeasibility: DimensionScore;
    monetizationPotential: DimensionScore;
  };

  executiveDiagnosis: {
    strongestAspectAr: string;
    biggestRiskAr: string;
    immediateDecisionAr: string;
  };

  assumptionMap: AssumptionItem[];

  formatRecommendation: {
    primary: ProductFormatInfo;
    secondary?: ProductFormatInfo;
    avoid: AvoidFormatInfo[];
  };

  productConcept: ProductConcept;
  positioning: PositioningStatement;
  mvp: MvpRecommendation;
  sprintMode?: SprintMode;
  sprintModeLabelAr?: string;
  validationSprint: ValidationDay[];
  discoveryQuestions: DiscoveryQuestion[];
  stopGoRules: StopGoRules;
  whatNotToDo: WhatNotToDoItem[];
  missingData: MissingDataItem[];
  nextThreeQuestions: string[];
  personalizedNextStep: {
    headlineAr: string;
    buttonLabelAr: string;
    subtextAr: string;
    targetModule: 'creator_validation' | 'creator_mvp' | 'seller_offer';
  };
}

export interface LeadSubmission {
  first_name: string;
  email: string;
  business_type?: string;
  report_delivery_requested: boolean;
  marketing_consent: boolean;
  consent_given?: boolean; // legacy alias for backward compatibility
  created_at: string;
  tool_name: string;
  stage: string;
  opportunity_score: number;
  confidence_score: number;
  opportunity_band: string;
  recommended_format: string;
  primary_risk: string;
  creator_path: string;
  analysis_mode?: 'hybrid_ai' | 'rules_only';
  answers?: QuestionnaireAnswers;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  page_url?: string;
}

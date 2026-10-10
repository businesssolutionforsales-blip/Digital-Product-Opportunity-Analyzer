import {
  QuestionnaireAnswers,
  StrategicReport,
  DimensionScore,
  OpportunityBand,
  ConfidenceBand,
  AssumptionItem,
  ProductFormatInfo,
  AvoidFormatInfo,
  ProductConcept,
  PositioningStatement,
  MvpRecommendation,
  ValidationDay,
  DiscoveryQuestion,
  StopGoRules,
  WhatNotToDoItem,
  MissingDataItem,
  AiStrategicInterpretation,
  ValidationMaturityInfo,
  ValidationMaturityStage,
  SprintMode,
} from '../types';
import { isValidAiInterpretation } from '../services/aiService';

/**
 * Mohamed Adel — Digital Product Opportunity Scoring & Diagnostic Engine
 * Upgraded Hybrid Engine: Purely deterministic numerical truth + optional AI interpretation layer.
 * Zero biased defaults, strict tiered evidence hierarchy, contextual thresholds.
 */

// -------------------------------------------------------------
// Validation Maturity Stage Inference (Strict Evidence Truth)
// -------------------------------------------------------------

export function inferValidationMaturityStage(answers: QuestionnaireAnswers): ValidationMaturityInfo {
  const demandList = (answers.demandEvidenceList || []) as string[];
  const quals = answers.qualificationEvidence || [];
  const hasClients = answers.hasExistingPayingClients === true;

  // Explicit payment evidence separation (Stage 4 money vs Stage 3 pre-commitment)
  const hasActualPaidMoney =
    demandList.includes('paid_pilot') ||
    demandList.includes('paid_deposit') ||
    demandList.includes('paid_preorder') ||
    demandList.includes('preorders_deposits'); // legacy compatibility

  const hasSoldRelatedWork = demandList.includes('sold_related_work');

  const hasPurchaseCommitmentWithoutMoney = demandList.includes('purchase_commitment');

  const hasInbound =
    demandList.includes('people_ask_me') ||
    demandList.includes('existing_clients_ask') ||
    demandList.includes('inbound_requests');

  const hasWaitlist =
    demandList.includes('waitlist_subscribers') ||
    demandList.includes('free_waitlist');

  const hasCompetitors = demandList.includes('competitors_sell');
  const hasClientResults = quals.includes('client_results');

  const directDailyAudience = answers.audienceAccessLevel === 'direct_daily';
  const occasionalAudience = answers.audienceAccessLevel === 'occasional';

  // Objective behavioral workaround evidence (NOT character count)
  const workaround = (answers.currentAlternativesAndWorkarounds || '').trim().toLowerCase();
  const hasWorkaroundActions = [
    'يدوي', 'يدويًا', 'إكسيل', 'شيت', 'واتساب', 'أداة', 'أدوات', 'ساعات', 'فريلانسر',
    'بيشتري', 'كورسات', 'اشتراك', 'موظف', 'برنامج', 'تطبيق', 'يبحث', 'جرب'
  ].some((act) => workaround.includes(act));

  const repeatedQ = (answers.repeatedQuestions || '').trim().toLowerCase();
  const hasRepeatedQuestionSignals = [
    'سؤال', 'بيسأل', 'استفسار', 'ازاي', 'إزاي', 'طريقة', 'حل', 'مشكلة', 'ليه'
  ].some((sig) => repeatedQ.includes(sig));

  // Explicit Repeatable Delivery criteria (Prerequisite for both Stage 5 and Stage 6)
  const isDeliveryYes = (val: any) => val === true || val === 'yes';
  const hasDeliveredMultipleTimes = isDeliveryYes(answers.hasDeliveredSolutionMultipleTimes);
  const understandsDeliveryBurden =
    isDeliveryYes(answers.understandsStandardVsCustomDelivery) || isDeliveryYes(answers.knowsActualDeliveryBurden);
  const hasRepeatableProcess = isDeliveryYes(answers.hasRepeatableDeliveryProcess);

  const hasExplicitRepeatableDelivery =
    hasDeliveredMultipleTimes && understandsDeliveryBurden && hasRepeatableProcess;

  const hasPaidOrClientEvidence =
    hasActualPaidMoney || hasSoldRelatedWork || (hasClients && hasClientResults);

  const meetsStage5RepeatableDelivery =
    hasExplicitRepeatableDelivery && hasPaidOrClientEvidence;

  // Explicit Scale Readiness criteria (Must be explicitly proven, never inferred from pilots alone)
  const isScaleYes = (val: any) => val === true || val === 'yes';
  const hasRepeatableAcquisition = isScaleYes(answers.hasRepeatableAcquisitionChannel);
  const hasStableLeads = isScaleYes(answers.hasStableLeadFlow);
  const hasRepeatSales = isScaleYes(answers.hasRepeatProductSales);
  const hasCommercialPerformance =
    isScaleYes(answers.hasMeasuredConversionRate) || isScaleYes(answers.hasDocumentedRetentionData);
  const hasOperationalCapacity = isScaleYes(answers.hasDeliveryCapacityAndClearBottlenecks);

  const hasCompleteScaleInfrastructure =
    hasRepeatableAcquisition &&
    hasStableLeads &&
    hasRepeatSales &&
    hasCommercialPerformance &&
    hasOperationalCapacity;

  // STAGE 6: Scale Evidence (Strictly requires Stage 5 repeatable delivery + client results + complete scale infrastructure)
  if (meetsStage5RepeatableDelivery && hasClientResults && hasCompleteScaleInfrastructure) {
    return {
      stage: 'STAGE_6_SCALE_EVIDENCE',
      stageNumber: 6,
      labelAr: 'المرحلة 6: جاهزية التوسع (Scale Evidence)',
      labelEn: 'Scale Evidence',
      summaryAr:
        'تمتلك أدلة توسع تشغيلية وقناة استقطاب وتدفق عملاء مستقر وسعة تسليم واضحة؛ التركيز على أتمتة النمو وإزالة اختناقات التسليم.',
    };
  }

  // STAGE 5: Repeatable Delivery (Explicit repeatable delivery evidence required)
  // Previous service clients or 3 paid pilots alone remain Stage 4 without explicit repeatability proof!
  if (meetsStage5RepeatableDelivery) {
    return {
      stage: 'STAGE_5_REPEATABLE_DELIVERY',
      stageNumber: 5,
      labelAr: 'المرحلة 5: تسليم متكرر مثبت (Repeatable Delivery)',
      labelEn: 'Repeatable Delivery',
      summaryAr:
        'تم تسليم النتيجة بنجاح لعملاء متعددين وفُهم العبء والخطوات المتكررة بدقة؛ الهدف تقنين التجربة في منتج رقمي مستقل.',
    };
  }

  // STAGE 4: Paid Pilot (Actual money changed hands for pilot, deposit, preorder, or related work)
  // IMPORTANT: 3 paid pilots + client results + audience access stays here at Stage 4 unless explicit repeatable delivery exists!
  if (hasActualPaidMoney || hasSoldRelatedWork || hasClients) {
    return {
      stage: 'STAGE_4_PAID_PILOT',
      stageNumber: 4,
      labelAr: 'المرحلة 4: تجربة مدفوعة (Paid Pilot)',
      labelEn: 'Paid Pilot',
      summaryAr:
        'يوجد سابقة دفع حقيقية أو عملاء حاليون لنفس المشكلة؛ التركيز على دراسة ما وراء الدفع وحزم الحل بشكل مستقل.',
    };
  }

  // STAGE 3: Commitment Evidence (Meaningful pre-purchase commitment WITHOUT money)
  if (hasPurchaseCommitmentWithoutMoney) {
    return {
      stage: 'STAGE_3_COMMITMENT_EVIDENCE',
      stageNumber: 3,
      labelAr: 'المرحلة 3: التزام مسبق (Commitment Evidence)',
      labelEn: 'Commitment Evidence',
      summaryAr:
        'تلقيت التزامات مؤكدة أو استمارات حجز مسبق دون دفع مالي بعد؛ حان وقت طلب التزام مالي حقيقي لإطلاق الدفعة.',
    };
  }

  // STAGE 2: Interest Evidence (Qualified inbound requests or waitlists)
  if (hasInbound || hasWaitlist) {
    return {
      stage: 'STAGE_2_INTEREST_EVIDENCE',
      stageNumber: 2,
      labelAr: 'المرحلة 2: مؤشرات اهتمام (Interest Evidence)',
      labelEn: 'Interest Evidence',
      summaryAr:
        'يوجد اهتمام واستفسارات أو قائمة انتظار، ولكن لم يتم دفع مبالغ مالية بعد؛ يلزم طلب التزام مالي أولي.',
    };
  }

  // STAGE 1: Problem Evidence (Observed workarounds, repeated questions, competitors)
  // Requirement #10: REMOVE audience access from problem evidence. Access is distribution advantage, NOT evidence that problem exists!
  if (hasWorkaroundActions || hasRepeatedQuestionSignals || hasCompetitors) {
    return {
      stage: 'STAGE_1_PROBLEM_EVIDENCE',
      stageNumber: 1,
      labelAr: 'المرحلة 1: رصد المشكلة (Problem Evidence)',
      labelEn: 'Problem Evidence',
      summaryAr:
        'تم رصد سلوكيات ومحاولات بديلة للعملاء وملاحظة المشكلة في السوق، دون وجود تأكيد مالي للدفع بعد.',
    };
  }

  // STAGE 0: Assumption
  return {
    stage: 'STAGE_0_ASSUMPTION',
    stageNumber: 0,
    labelAr: 'المرحلة 0: فرضية مجردة (Assumption)',
    labelEn: 'Assumption',
    summaryAr:
      'الفكرة مبنية بالكامل على تقديرات شخصية وملاحظات غير مؤكدة؛ الأولوية لإجراء محادثات استكشافية وجمع أدلة.',
  };
}

export function analyzeOpportunity(
  answers: QuestionnaireAnswers,
  aiInterpretation?: AiStrategicInterpretation | null,
  options?: {
    reportId?: string;
    createdAt?: string;
    aiFingerprint?: string;
    isAiRecalculating?: boolean;
  }
): StrategicReport {
  // Validate AI interpretation integrity
  const verifiedAi = (aiInterpretation && isValidAiInterpretation(aiInterpretation)) ? aiInterpretation : null;

  // 1. Calculate Deterministic Dimension Scores (0 - 100)
  const problemStrength = calculateProblemStrength(answers);
  const buyerClarity = calculateBuyerClarity(answers);
  const transformationStrength = calculateTransformationStrength(answers);
  const demandEvidence = calculateDemandEvidence(answers);
  const creatorAdvantage = calculateCreatorAdvantage(answers);
  const deliveryFeasibility = calculateDeliveryFeasibility(answers);
  const monetizationPotential = calculateMonetizationPotential(answers, problemStrength.score);

  // 2. Weighted Product Opportunity Score (0 - 100 integer)
  const weightedOpportunity =
    problemStrength.score * 0.18 +
    buyerClarity.score * 0.14 +
    transformationStrength.score * 0.14 +
    demandEvidence.score * 0.18 +
    creatorAdvantage.score * 0.12 +
    deliveryFeasibility.score * 0.10 +
    monetizationPotential.score * 0.14;

  const opportunityScore = Math.min(100, Math.max(10, Math.round(weightedOpportunity)));

  // 3. Confidence Score (0 - 100 integer)
  const confidenceScore = calculateConfidenceScore(answers, demandEvidence.score);

  // 4. Determine Bands
  const opportunityBand = getOpportunityBand(opportunityScore);
  const confidenceBand = getConfidenceBand(confidenceScore);

  // 5. Validation Maturity Stage
  const validationMaturity = inferValidationMaturityStage(answers);

  // 6. Build Dynamic Strategic Diagnoses
  const executiveDiagnosis = buildExecutiveDiagnosis(
    answers,
    opportunityScore,
    confidenceScore,
    problemStrength.score,
    buyerClarity.score,
    demandEvidence.score,
    verifiedAi
  );

  const assumptionMap = buildAssumptionMap(answers, demandEvidence.score, verifiedAi);
  const formatRecommendation = buildFormatRecommendation(answers);
  const productConcept = buildProductConcept(answers, formatRecommendation.primary);
  const positioning = buildPositioningStatement(answers);
  const mvp = buildMvpRecommendation(answers, formatRecommendation.primary, validationMaturity, verifiedAi);

  // Requirement #7: Pass formatRecommendation into buildValidationSprint
  const sprintResult = buildValidationSprint(answers, validationMaturity, formatRecommendation.primary);

  const discoveryQuestions = buildDiscoveryQuestions(answers);
  const stopGoRules = buildStopGoRules(answers, demandEvidence.score);
  const whatNotToDo = buildWhatNotToDo(
    answers,
    formatRecommendation.primary,
    formatRecommendation.secondary,
    validationMaturity,
    verifiedAi
  );
  const missingData = buildMissingData(answers, demandEvidence.score, verifiedAi);

  // Requirement #9: Uncertainty-based next three questions
  const nextThreeQuestions = buildNextThreeQuestions(
    answers,
    validationMaturity,
    formatRecommendation.primary,
    verifiedAi
  );

  const personalizedNextStep = buildPersonalizedNextStep(
    opportunityScore,
    confidenceScore,
    answers,
    validationMaturity,
    formatRecommendation.primary
  );

  // Requirement #14: Report Consistency Guard
  // Guard 1: Ensure Membership never appears in Avoid if recommended
  const isPrimaryMembership = formatRecommendation.primary.titleEn.toLowerCase().includes('membership');
  const safeAvoid = formatRecommendation.avoid.filter((a) => {
    if (isPrimaryMembership && a.titleEn.toLowerCase().includes('membership')) return false;
    return true;
  });
  formatRecommendation.avoid = safeAvoid;

  return {
    id: options?.reportId || `RPT-${Date.now().toString(36).toUpperCase()}`,
    createdAt: options?.createdAt || new Date().toISOString(),
    answers,
    analysisMode: verifiedAi ? 'hybrid_ai' : 'rules_only',
    aiInterpretation: verifiedAi || undefined,
    aiFingerprint: options?.aiFingerprint,
    isAiRecalculating: options?.isAiRecalculating,
    validationMaturity,
    opportunityScore,
    opportunityBand,
    confidenceScore,
    confidenceBand,
    dimensions: {
      problemStrength,
      buyerClarity,
      transformationStrength,
      demandEvidence,
      creatorAdvantage,
      deliveryFeasibility,
      monetizationPotential,
    },
    executiveDiagnosis,
    assumptionMap,
    formatRecommendation,
    productConcept,
    positioning,
    mvp,
    sprintMode: sprintResult.sprintMode,
    sprintModeLabelAr: sprintResult.sprintModeLabelAr,
    validationSprint: sprintResult.days,
    discoveryQuestions,
    stopGoRules,
    whatNotToDo,
    missingData,
    nextThreeQuestions,
    personalizedNextStep,
  };
}

// -------------------------------------------------------------
// Scoring Sub-engines (Strict Integrity & Evidence Hierarchy)
// -------------------------------------------------------------

function calculateProblemStrength(answers: QuestionnaireAnswers): DimensionScore {
  let score = 25; // Neutral baseline without assumptions
  const notes: string[] = [];

  // Problem Description presence
  const desc = (answers.coreProblemDescription || '').trim();
  if (!desc) {
    notes.push('لم يتم تحديد المشكلة بعد — يلزم صياغة ألم محدد يعاني منه المشتري');
    return {
      nameAr: 'قوة المشكلة',
      nameEn: 'Problem Strength',
      weightPercent: 18,
      score: 15,
      notesAr: notes[0],
    };
  }

  // Frequency
  switch (answers.problemFrequency) {
    case 'daily':
      score += 30;
      notes.push('مشكلة متكررة يوميًا تزيد من إلحاح البحث عن حل');
      break;
    case 'weekly':
      score += 20;
      notes.push('تكرار أسبوعي يمنح المشكلة حضورًا مستمرًا في ذهن العميل');
      break;
    case 'monthly':
      score += 10;
      notes.push('تكرار شهري متوسط يتطلب ربطه بأحداث ذات أثر مالي أو تنظيمي');
      break;
    case 'occasional':
      score += 4;
      notes.push('تكرار عارض يقلل من دافع الشراء اللحظي');
      break;
    case 'unsure':
    case 'not_selected':
    default:
      notes.push('معدل تكرار المشكلة غير مؤكد حتى الآن ويحتاج لرصد في المقابلات');
      break;
  }

  // Cost of inaction (Economic/Time value)
  const costs = answers.costOfInaction || [];
  if (costs.includes('money') || costs.includes('opportunity')) {
    score += 25;
    notes.push('تكلفة عدم الحل مرتبطة بخسارة مالية أو فرص نمو ملموسة');
  } else if (costs.includes('time') || costs.includes('stress')) {
    score += 15;
    notes.push('ضغط الوقت والإجهاد محرك للبحث عن حلول جاهزة');
  }

  // Workaround behavior (Verifiable sign of existing urgency)
  const workaround = (answers.currentAlternativesAndWorkarounds || '').trim();
  if (workaround && workaround.length > 5 && !workaround.includes('معنديش') && !workaround.includes('مش عارف')) {
    score += 15;
    notes.push('وجود محاولات وبدائل حالية يعتبر مؤشرًا على أن العميل يبذل جهدًا فعليًا للتعامل مع المشكلة، لكنه لا يكفي وحده للحكم على استعداده للشراء.');
  } else {
    notes.push('غياب بدائل أو محاولات حالية قد يعني أن المشكلة غير ملحة بما يكفي للشراء');
  }

  const finalScore = Math.min(100, Math.max(10, score));
  return {
    nameAr: 'قوة المشكلة',
    nameEn: 'Problem Strength',
    weightPercent: 18,
    score: finalScore,
    notesAr: notes.slice(0, 2).join(' • '),
  };
}

function calculateBuyerClarity(answers: QuestionnaireAnswers): DimensionScore {
  let score = 20;
  const notes: string[] = [];

  const rawDescription = (answers.targetBuyerDescription || '').trim();
  const lowerDesc = rawDescription.toLowerCase();

  if (!rawDescription) {
    return {
      nameAr: 'وضوح المشتري',
      nameEn: 'Buyer Clarity',
      weightPercent: 14,
      score: 15,
      notesAr: 'لم يتم وصف المشتري المستهدف بعد.',
    };
  }

  // 1. Detection of vague/aspirational broad definitions (Anti-Slop / Anti-Vagueness)
  // Example from brief: "ناس عايزة تنجح وتطور حياتها وبيزنسها" must remain LOW clarity.
  const aspirationalBuzzwords = [
    'عايزة تنجح',
    'عايز ينجح',
    'تطور حياتها',
    'تطور بيزنسها',
    'يطور حياته',
    'يطور بيزنسه',
    'تطوير الذات',
    'المهتمين بالنجاح',
    'الراغبين في النجاح',
    'كل من يريد',
    'أي شخص',
    'أي حد',
    'الجميع',
    'كل الناس',
    'anyone',
    'everyone',
    'الناس اللي عايزة',
    'المهتمين بتطوير',
    'رواد الأعمال بشكل عام',
    'أصحاب المشاريع عمومًا',
  ];

  const hasAspirationalSlop = aspirationalBuzzwords.some((w) => lowerDesc.includes(w));
  const isExplicitlyBroad = answers.isBuyerBroadOrSpecific === 'broad_general';

  // 2. Concrete occupational / situational anchors (e.g., "مدربي لياقة أونلاين عندهم 5–20 عميل حالي")
  const concreteNicheKeywords = [
    'مدرب', 'مدربي', 'كوتش', 'فريلانسر', 'مسوق', 'طبيب', 'صيدلي', 'محامي', 'محاسب', 
    'مهندس', 'صانع محتوى', 'صناع محتوى', 'متجر', 'متاجر', 'وكالة', 'صاحب وكالة',
    'مبرمج', 'مطور', 'مصمم', 'معلم', 'مترجم', 'عيادة', 'استشاري', 'سيلز', 'مبيعات',
    'b2b', 'saas', 'تجارة إلكترونية', 'e-commerce', 'أونلاين'
  ];
  const hasConcreteNicheAnchor = concreteNicheKeywords.some((w) => lowerDesc.includes(w));

  // Concrete operational metric / numeric threshold / stage qualifiers
  const hasNumericOrOperationalConstraint =
    /\d+/.test(rawDescription) ||
    lowerDesc.includes('عميل حالي') ||
    lowerDesc.includes('عملاء حاليين') ||
    lowerDesc.includes('شغال بالفعل') ||
    lowerDesc.includes('نشاط قائم') ||
    lowerDesc.includes('مستوى متقدم') ||
    lowerDesc.includes('مبتدئ يبحث عن أول');

  // Distinguishable from adjacent audiences
  const isDistinguishable =
    hasConcreteNicheAnchor &&
    (hasNumericOrOperationalConstraint || answers.isBuyerBroadOrSpecific === 'narrow_specific');

  if (hasAspirationalSlop || isExplicitlyBroad) {
    score = 20;
    notes.push('الوصف يعتمد على رغبة عامة أو طموح فضفاض وليس شريحة مشتري محددة — بيع منتج رقمي للجميع غالبًا ما ينتهي بعدم بيعه لأحد.');
  } else if (isDistinguishable || answers.isBuyerBroadOrSpecific === 'narrow_specific') {
    score += 45;
    notes.push('تحديد شريحة ضيقة ومهنية محددة يُميز المشتري عن الجماهير العامة ويسهل صياغة رسالة بيع دقيقة واستهداف مباشر.');
  } else if (answers.isBuyerBroadOrSpecific === 'moderate') {
    score += 25;
    notes.push('الشريحة محددة جزئيًا في المجال ولكنها لا تزال تحتاج لربطها بمرحلة محددة أو معيار تشغيلي واضح لفصلها عن الشرائح المجاورة.');
  } else {
    // not_selected fallback
    score += hasConcreteNicheAnchor ? 25 : 10;
  }

  // 3. Buyer current situation (Evaluates whether a concrete situational inflection moment is specified)
  const situation = (answers.buyerStageAndSituation || '').trim().toLowerCase();
  if (situation) {
    const hasConcreteSituationKeywords = [
      'وصل', 'مش قادر', 'حد أقصى', 'بيخسر', 'ميزانية', 'وقت', 'ساعات', 'مرحلة', 
      'بيحاول', 'عميل', 'عملاء', 'ضغط', 'يدوي', 'تشتت', 'تعطيل', 'نقطة تحول',
      'بداية', 'توسع', 'إغلاق', 'عقد', 'تراجع', 'ركود', 'فوضى'
    ].some((w) => situation.includes(w)) || /\d+/.test(situation);

    if (hasConcreteSituationKeywords) {
      score += 18;
      notes.push('لحظة التحول أو السياق التشغيلي الذي يمر به العميل محدد بوضوح، مما يمنحك نقطة انطلاق قوية في الرسالة الإعلانية.');
    } else if (!hasAspirationalSlop) {
      score += 8;
      notes.push('تم توضيح سياق العميل، ولكن يفضل جعله أكثر التصاقًا بلحظة إحباط أو نقطة انعطاف محددة.');
    }
  }

  // 4. Buyer current behavior (Evaluates whether observable actions / current behavior are described, NOT character count)
  const behavior = (answers.buyerCurrentBehavior || '').trim().toLowerCase();
  if (behavior) {
    // Observable actions: pays for something, uses a tool, hires someone, repeatedly searches, manual process
    const hasObservableAction = [
      'يدوي', 'يدويًا', 'واتساب', 'إكسيل', 'شيت', 'ساعات', 'بيبحث', 'يبحث', 'بيجرب', 'يجرب', 
      'بيشتري', 'يشتري', 'دفع', 'يدفع', 'كورسات', 'فريلانسر', 'يوظف', 'يوظفون', 'محادثات', 
      'محاولات', 'يصرف', 'مجهود', 'أداة', 'أدوات', 'برنامج', 'تطبيق', 'نظام', 'حملة', 'إعلانات'
    ].some((w) => behavior.includes(w));

    if (hasObservableAction) {
      score += 17;
      notes.push('رصد السلوك الفعلي للعميل حاليًا يرفع مستوى الثقة في أنه يبذل جهدًا نشطًا للحل، ويحميك من استهداف جمهور متفرج لا يتحرك.');
    } else {
      score += 5;
      notes.push('تمت الإشارة لسلوك العميل لكنه يحتاج لربطه بإجراء عملي ملحوظ (مثل استخدام أداة معينة أو الاستعانة بجهة خارجية).');
    }
  }

  const finalScore = Math.min(100, Math.max(15, score));
  return {
    nameAr: 'وضوح المشتري',
    nameEn: 'Buyer Clarity',
    weightPercent: 14,
    score: finalScore,
    notesAr: notes.slice(0, 2).join(' • '),
  };
}

function calculateTransformationStrength(answers: QuestionnaireAnswers): DimensionScore {
  let score = 25;
  const notes: string[] = [];

  const before = (answers.beforeState || '').trim();
  const after = (answers.afterState || '').trim();

  if (!before || !after) {
    return {
      nameAr: 'قوة النتيجة',
      nameEn: 'Transformation Strength',
      weightPercent: 14,
      score: 15,
      notesAr: 'لم يتم تحديد حالتي البداية والنهاية (Before / After) بدقة كافية.',
    };
  }

  score += 30;
  notes.push('تباين واضح بين نقطة البداية والنتيجة بعد الاستخدام');

  if (answers.transformationRealism === 'highly_controllable') {
    score += 35;
    notes.push('النتيجة تحت سيطرة المشتري ومنهجية المنتج مما يرفع نسبة الرضا');
  } else if (answers.transformationRealism === 'moderate') {
    score += 20;
    notes.push('التحول معقول ولكنه يعتمد جزئيًا على التزام المشتري');
  } else if (answers.transformationRealism === 'depends_on_many_external_factors') {
    score += 5;
    notes.push('النتيجة تعتمد على عوامل خارجية كثيرة مما يرفع مخاطرة عدم الرضا');
  }

  const finalScore = Math.min(100, Math.max(15, score));
  return {
    nameAr: 'قوة النتيجة',
    nameEn: 'Transformation Strength',
    weightPercent: 14,
    score: finalScore,
    notesAr: notes.slice(0, 2).join(' • '),
  };
}

/**
 * Demand Evidence Calculation
 * Implements strict 5-Tier Evidence Hierarchy:
 * TIER 1: actual purchases, preorders, deposits (Top signal)
 * TIER 2: existing clients asking, sold related work, qualified waitlist
 * TIER 3: repeated audience questions, interviews
 * TIER 4: competitor presence, community discussions (Category proof, not offer proof)
 * TIER 5: none yet (Pure assumption)
 */
function calculateDemandEvidence(answers: QuestionnaireAnswers): DimensionScore {
  const list = answers.demandEvidenceList || [];
  const notes: string[] = [];

  if (list.includes('none_yet') || list.length === 0) {
    return {
      nameAr: 'دليل الطلب',
      nameEn: 'Demand Evidence',
      weightPercent: 18,
      score: 10,
      notesAr: 'لا توجد أدلة سوقية حتى الآن — الفكرة ما زالت فرضية تحتاج لاختبار ميداني مع الجمهور.',
    };
  }

  let score = 15;

  // TIER 1: Actual Purchases / Deposits / Paid Pilots (Real money exchanged)
  const hasPaidMoney =
    list.includes('paid_pilot') ||
    list.includes('paid_deposit') ||
    list.includes('paid_preorder') ||
    list.includes('preorders_deposits');

  const hasPurchaseCommitment = list.includes('purchase_commitment');

  if (hasPaidMoney) {
    score = 90;
    notes.push('وجود مدفوعات فعلية (حجوزات مسبقة أو دفعات أو تجربة مدفوعة) يعتبر الدليل الأقوى على استعداد العميل للدفع الفعلي');
  } else if (list.includes('sold_related_work')) {
    // TIER 2: Paid adjacent service
    score = 70;
    notes.push('وجود مبيعات سابقة لحل مرتبط يعتبر دليلًا أقوى على استعداد بعض العملاء للدفع مقابل مشكلة قريبة، لكنه لا يثبت الطلب على المنتج الرقمي بنفس الشكل.');
  } else if (hasPurchaseCommitment) {
    score = 68;
    notes.push('وجود التزام شراء مسبق مؤكد يعكس نية شراء جدية، ولكنه يظل التزامًا بحاجة لدفع مالي لتأكيد الجاهزية التامة.');
  } else if (list.includes('existing_clients_ask')) {
    score = 65;
    notes.push('طلب العملاء الحاليين يعتبر مؤشرًا قويًا على وجود اهتمام حقيقي داخلي');
  } else if (list.includes('waitlist_subscribers')) {
    score = 60;
    notes.push('قائمة انتظار نشطة تعتبر دليلاً أوليًا ممتازًا على الاهتمام الحقيقي');
  } else if (list.includes('people_ask_me') || list.includes('inbound_requests')) {
    // TIER 3: Audience questions
    score = 40;
    notes.push('تكرار الأسئلة يعتبر مؤشر اهتمام أولي، لكنه لا يكفي وحده للحكم ولا يثبت نية الشراء الفعلي بعد.');
  } else if (list.includes('audience_comments')) {
    score = 30;
    notes.push('تفاعل المنشورات يعكس فضولاً محتوائيًا ولكنه لا يعادل الاستعداد للدفع ولا يكفي للحكم.');
  } else if (list.includes('competitors_sell') || list.includes('search_community_discussions')) {
    // TIER 4: Competitor existence or discussions only
    score = 25;
    notes.push('وجود منافسين يعتبر مؤشرًا على وجود نشاط تجاري في الفئة، لكنه لا يثبت الطلب على عرضك تحديدًا دون زاوية تميز واضحة.');
  }

  // Correlated bump: only a modest secondary bump if multiple tiers exist
  const hasTier1 = hasPaidMoney;
  const hasTier2 = list.includes('sold_related_work') || list.includes('existing_clients_ask') || list.includes('waitlist_subscribers') || hasPurchaseCommitment;
  if (hasTier1 && hasTier2) {
    score = Math.min(100, score + 8);
  }

  const finalScore = Math.min(100, Math.max(10, score));
  return {
    nameAr: 'دليل الطلب',
    nameEn: 'Demand Evidence',
    weightPercent: 18,
    score: finalScore,
    notesAr: notes[0] || 'تقييم الأدلة الواقعية التي تدعم رغبة واستعداد السوق للشراء.',
  };
}

function calculateCreatorAdvantage(answers: QuestionnaireAnswers): DimensionScore {
  let score = 20;
  const notes: string[] = [];

  const quals = answers.qualificationEvidence || [];
  if (quals.includes('none_yet') || quals.length === 0) {
    notes.push('لم يتم توثيق نتائج سابقة بعد — التركيز يجب أن ينصب على تحقيق أول نتيجة موثقة لدعم المصداقية');
  } else {
    if (quals.includes('client_results')) {
      score += 35;
      notes.push('امتلاك نتائج مثبتة مع عملاء سابقين يمنحك مصداقية فورية وسرعة إقناع');
    }
    if (quals.includes('personal_results')) {
      score += 20;
      notes.push('تحقيق النتيجة بنفسك يبني قصة تحول مقنعة وقابلة للمحاكاة');
    }
    if (quals.includes('professional_credentials')) {
      score += 10;
    }
  }

  // Requirement #3: Strict integrity for Proprietary Method vs General Skills
  const method = (answers.uniqueMethodOrProcess || '').trim();
  const methodType = answers.uniqueMethodType;

  const isGeneralSkillOnly =
    methodType === 'general_skills_only' ||
    method.startsWith('تركيز على:') ||
    method.startsWith('مهارة عامة:') ||
    method.includes('مهارات عامة') ||
    method.includes('خبرة عامة') ||
    method.includes('معنديش') ||
    method.includes('مش محدد') ||
    method.length < 8;

  const hasGenuineMethod =
    !isGeneralSkillOnly &&
    (methodType === 'proprietary_framework' ||
      answers.fieldProvenance?.uniqueMethod === 'user_explicit' ||
      answers.fieldProvenance?.uniqueMethod === 'confirmed_by_user');

  if (hasGenuineMethod) {
    score += 15;
    notes.push('وجود إطار عمل أو منهجية محددة يحمي المنتج من التحول لسلعة مكررة ويعزز التمايز');
  } else if (methodType === 'developing_now') {
    score += 5;
    notes.push('المنهجية قيد التوثيق والتطوير — نوصي باختبار أول 3 عملاء لاستخلاص مراحل الإطار');
  } else {
    notes.push('لم يتم توثيق منهجية خاصة أو إطار عمل محدد حتى الآن — الاعتماد على المهارات العامة يتطلب تطوير منهجية مخصصة لرفع القيمة');
  }

  // Audience access (Requirement #2: strictly explicit direct access to target buyer)
  if (answers.audienceAccessLevel === 'direct_daily') {
    score += 18;
    notes.push('وصول مباشر ومتكرر للعميل المستهدف يمنحك سرعة قياسية في التحقق دون تكلفة إعلانات');
  } else if (answers.audienceAccessLevel === 'occasional') {
    score += 8;
    notes.push('وصول جزئي أو متقطع للمشترين يتطلب تركيزًا على إعادة تنشيط المحادثات معهم');
  } else if (answers.audienceAccessLevel === 'indirect_communities') {
    notes.push('معرفة أماكن تواجد العميل دون وصول مباشر تتطلب بناء علاقة مسبقة أو شراكة للوصول إليهم');
  } else if (answers.audienceAccessLevel === 'none_yet') {
    score -= 10;
    notes.push('عدم وجود أي وصول حالي للعميل المستهدف هو الخطر الأكبر على سرعة بيع أول نسخ');
  } else if (answers.audienceAccessLevel === 'unsure') {
    notes.push('عدم التأكد من قنوات الوصول المباشر للعميل يتطلب إجراء محادثات استكشافية أولاً');
  }

  const finalScore = Math.min(100, Math.max(10, score));
  return {
    nameAr: 'ميزة صاحب الخبرة',
    nameEn: 'Creator Advantage',
    weightPercent: 12,
    score: finalScore,
    notesAr: notes.slice(0, 2).join(' • '),
  };
}

function calculateDeliveryFeasibility(answers: QuestionnaireAnswers): DimensionScore {
  let score = 35;
  const notes: string[] = [];

  // Tri-State Evaluation: 'required' | 'not_required' | 'unknown'
  const feedbackState =
    answers.personalFeedbackState ||
    (answers.requiresPersonalFeedback === true ? 'required' : answers.requiresPersonalFeedback === false ? 'not_required' : 'unknown');

  const accountabilityState =
    answers.oneOnOneAccountabilityState ||
    (answers.requiresOneOnOneAccountability === true ? 'required' : answers.requiresOneOnOneAccountability === false ? 'not_required' : 'unknown');

  switch (answers.creatorTimePerCustomer) {
    case 'almost_none':
      // UNKNOWN receives ZERO scalability bonus. Must remain neutral (0 bonus) when feedback or accountability is unknown.
      if (feedbackState === 'unknown' || accountabilityState === 'unknown') {
        // Zero excess bonus: remains at base score 35
        notes.push('الرغبة في نموذج آلي متوسع غير مؤكدة بعد بسبب عدم تحديد الحاجة للملاحظات أو المتابعة الفردية (نموذج التسليم غير محقق بعد)');
      } else {
        score += 45;
        notes.push('قابلية توسع عالية مع استهلاك وقت شبه منعدم بعد البناء');
      }
      break;
    case 'under_30m':
      if (feedbackState === 'unknown' || accountabilityState === 'unknown') {
        notes.push('عبء تشغيلي منخفض نسبيًا ولكن الحاجة للملاحظات الفردية غير محددة بعد');
      } else {
        score += 35;
        notes.push('عبء تشغيلي منخفض يسمح بخدمة أعداد مريحة');
      }
      break;
    case '1_to_2h':
      score += 20;
      notes.push('استهلاك وقت معتدل يتطلب تسعيرًا يغطي كلفة ساعاتك');
      break;
    case 'recurring_support':
      score += 5;
      notes.push('التزام بالمتابعة المستمرة قد يتحول إلى عنق زجاجة إذا كبر عدد العملاء');
      break;
    case 'high_touch':
      score -= 10;
      notes.push('اعتماد النتيجة على تدخل فردي مكثف يجعله أقرب لخدمة وليس منتجًا رقميًا قابلاً للتوسع');
      break;
    default:
      notes.push('لم يتم تحديد قيود وقت التسليم بعد');
      break;
  }

  // Contradiction detection between scale desires vs intervention
  const wantsHighScale =
    answers.creatorTimePerCustomer === 'almost_none' || answers.creatorTimePerCustomer === 'under_30m';
  const deliveryList = answers.deliveryMechanism || [];

  const requiresSubstantialIntervention =
    feedbackState === 'required' ||
    accountabilityState === 'required' ||
    deliveryList.includes('critique_feedback') ||
    deliveryList.includes('accountability') ||
    deliveryList.includes('live_coaching');

  if (wantsHighScale && requiresSubstantialIntervention) {
    score -= 25; // Reduce Delivery Feasibility significantly
    notes.unshift(
      'تناقض استراتيجي: ترغب في نموذج تسليم آلي عالي التوسع بدون استهلاك وقت، بينما التحول والآلية يتطلبان تقييمًا شخصيًا (Feedback) ومتابعة التزام (Accountability). هذا التناقض يضغط على وقتك أو يضعف رضا المشتركين.'
    );
  } else if (feedbackState === 'required' && accountabilityState === 'required') {
    score -= 10;
    notes.push('الجمع بين التقييم الشخصي والمتابعة الفردية يقلل قابلية التوسع ما لم يتم تسعيره كبرنامج عالي القيمة');
  } else if (feedbackState === 'unknown' && accountabilityState === 'unknown') {
    notes.push('طبيعة التدخل البشري غير محددة بعد — يوصى بتحديد ما إذا كان التحول يتطلب تقييمًا فرديًا أم تعلمًا ذاتيًا.');
  }

  const finalScore = Math.min(100, Math.max(15, score));
  return {
    nameAr: 'قابلية التنفيذ والتوسع',
    nameEn: 'Delivery Feasibility',
    weightPercent: 10,
    score: finalScore,
    notesAr: notes[0] || 'تقييم سهولة تسليم المنتج بدون استنزاف وقتك الشخصي في كل عملية بيع.',
  };
}

function calculateMonetizationPotential(
  answers: QuestionnaireAnswers,
  problemScore: number
): DimensionScore {
  let score = 30;
  const notes: string[] = [];

  const costs = answers.costOfInaction || [];
  if (costs.includes('money')) {
    score += 30;
    notes.push('حل مشكلة مرتبطة بالدخل أو التكاليف يبرر تسعيرًا مريحًا وسريع الإغلاق');
  } else if (costs.includes('time')) {
    score += 15;
    notes.push('توفير الوقت قيمة مقدرة جدًا لدى المحترفين ورواد الأعمال');
  }

  // Price tier alignment
  if (answers.expectedPriceTier === 'mid_150_500' || answers.expectedPriceTier === 'premium_500_plus') {
    if (problemScore >= 65) {
      score += 25;
      notes.push('إمكانية تسعير مرتفع مع قوة المشكلة تؤدي إلى نموذج عمل عالي الهامش');
    } else {
      score -= 5;
      notes.push('التسعير المرتفع يتطلب مشكلة ذات عائد مالي مباشر وأدلة طلب سوقية قوية');
    }
  } else if (answers.expectedPriceTier === 'micro_under_50') {
    score += 15;
    notes.push('سعر منخفض يسهل الشراء التلقائي كمنتج أولي لبناء قائمة مشترين');
  }

  if (answers.hasExistingPayingClients === true) {
    score += 15;
    notes.push('وجود عملاء يدفعون بالفعل يسهل ترويج المنتج كحل مكمل أو بديل');
  }

  const finalScore = Math.min(100, Math.max(15, score));
  return {
    nameAr: 'إمكانية تحقيق دخل',
    nameEn: 'Monetization Potential',
    weightPercent: 14,
    score: finalScore,
    notesAr: notes[0] || 'القدرة على تسعير المنتج وتحقيق هوامش ربحية مستدامة.',
  };
}

function calculateConfidenceScore(answers: QuestionnaireAnswers, demandScore: number): number {
  let conf = 20; // baseline for empirical software

  const list = answers.demandEvidenceList || [];

  // Evidence presence is the largest determinant
  if (list.includes('preorders_deposits')) conf += 40;
  else if (list.includes('sold_related_work')) conf += 25;
  else if (list.includes('existing_clients_ask')) conf += 20;
  else if (list.includes('waitlist_subscribers')) conf += 18;
  else if (list.includes('people_ask_me')) conf += 10;
  else if (list.includes('none_yet') || list.length === 0) conf -= 5;

  // Provenance audit: Check if fields were verified by user or raw unverified AI hypotheses
  const buyerProv = answers.fieldProvenance?.targetBuyer;
  const problemProv = answers.fieldProvenance?.coreProblem;

  // Unconfirmed AI hypotheses penalize confidence because they are unvalidated assumptions
  if (buyerProv === 'ai_hypothesis' || problemProv === 'ai_hypothesis') {
    conf -= 12;
  } else {
    // Only grant completeness credit if user explicitly confirmed or provided the input
    if ((answers.targetBuyerDescription || '').trim().length > 10) conf += 6;
    if ((answers.coreProblemDescription || '').trim().length > 10) conf += 6;
  }

  // Before/after state must be provided and substantive
  const before = (answers.beforeState || '').trim();
  const after = (answers.afterState || '').trim();
  if (before.length > 5 && after.length > 5 && !before.includes('معنديش') && !after.includes('مش عارف')) {
    conf += 8;
  }

  // Evidence notes: only reward if user actually documented evidence details
  const evNotes = (answers.evidenceNotes || '').trim();
  if (evNotes.length > 15 && !evNotes.includes('معنديش') && !evNotes.includes('لا يوجد')) {
    conf += 8;
  }

  // Penalize vague or contradictory inputs
  const buyer = (answers.targetBuyerDescription || '').trim().toLowerCase();
  if (
    buyer.includes('أي حد') ||
    buyer.includes('الجميع') ||
    buyer.includes('كل الناس') ||
    answers.isBuyerBroadOrSpecific === 'broad_general'
  ) {
    conf -= 15;
  }

  // Adjust by demand score
  if (demandScore >= 75) conf += 10;
  if (demandScore <= 20) conf -= 10;

  return Math.min(100, Math.max(10, Math.round(conf)));
}

// -------------------------------------------------------------
// Band Classifications
// -------------------------------------------------------------

function getOpportunityBand(score: number): OpportunityBand {
  if (score >= 85) {
    return {
      id: 'strong_opportunity',
      min: 85,
      max: 100,
      labelAr: 'فرصة قوية تستحق اختبارًا جادًا',
      labelEn: 'Strong Opportunity to Validate',
      colorClass: 'text-[#F5BF1E] border-[#F5BF1E]/40 bg-[#23170D]/80',
      descriptionAr:
        'الفكرة تمتلك مقومات استراتيجية متكاملة من ناحية وضوح المشكلة والقيمة. الخطوة الفورية هي التحقق من استعداد الجمهور للشراء قبل التوسع في الإنتاج.',
    };
  }
  if (score >= 70) {
    return {
      id: 'promising',
      min: 70,
      max: 84,
      labelAr: 'واعدة — اختبرها قبل البناء',
      labelEn: 'Promising — Validate Before Building',
      colorClass: 'text-[#FBD052] border-[#FBD052]/40 bg-[#23170D]/70',
      descriptionAr:
        'المؤشرات الأولية إيجابية، ولكن هناك افتراضات جوهرية حول حجم الطلب أو طريقة التوصيل تحتاج لاختبار مبكر وجمع أدلة قبل استثمار أسابيع من العمل.',
    };
  }
  if (score >= 55) {
    return {
      id: 'needs_refinement',
      min: 55,
      max: 69,
      labelAr: 'محتاجة إعادة صياغة قبل التنفيذ',
      labelEn: 'Needs Refinement',
      colorClass: 'text-[#C8C5BA] border-[#4A2F15] bg-[#23170D]/50',
      descriptionAr:
        'الفكرة تحتوي على بذرة جيدة، ولكنها إما موجهة لجمهور واسع بزيادة، أو تفتقر لمشكلة مؤلمة ومحددة، أو تعتمد على تدخل شخصي مرهق.',
    };
  }
  if (score >= 40) {
    return {
      id: 'weak_signal',
      min: 40,
      max: 54,
      labelAr: 'الإشارة الحالية ضعيفة',
      labelEn: 'Weak Signal',
      colorClass: 'text-[#797979] border-[#4A2F15]/60 bg-[#040405]',
      descriptionAr:
        'الدلائل السوقية الحالية منخفضة جداً. البدء في تسجيل هذا المنتج حالياً ينطوي على مخاطرة إهدار وقت وجهد بدون طلب مؤكد.',
    };
  }
  return {
    id: 'do_not_build',
    min: 0,
    max: 39,
    labelAr: 'متبنيش المنتج دلوقتي',
    labelEn: 'Do Not Build Yet',
    colorClass: 'text-[#797979] border-[#4A2F15]/40 bg-[#040405]',
    descriptionAr:
      'الفكرة تحتاج لإعادة نظر جذرية في المشكلة والشريحة المستهدفة قبل التفكير في أي منتج رقمي.',
  };
}

function getConfidenceBand(score: number): ConfidenceBand {
  if (score >= 80) {
    return {
      id: 'high',
      min: 80,
      max: 100,
      labelAr: 'ثقة مرتفعة في التحليل',
      labelEn: 'High Confidence',
      descriptionAr: 'الأدلة والبيانات المقدمة متكاملة وواضحة، مما يجعل التقييم الاستراتيجي مبنيًا على وقائع ملموسة.',
    };
  }
  if (score >= 60) {
    return {
      id: 'moderate',
      min: 60,
      max: 79,
      labelAr: 'ثقة متوسطة',
      labelEn: 'Moderate Confidence',
      descriptionAr: 'البيانات كافية لرسم اتجاه أولي، ولكن تنقصها أدلة تفاعل ومحادثات كافية مع المشترين المحتملين.',
    };
  }
  if (score >= 40) {
    return {
      id: 'low',
      min: 40,
      max: 59,
      labelAr: 'ثقة منخفضة — أهم خطوة جمع الدليل الناقص',
      labelEn: 'Low Confidence',
      descriptionAr: 'الفكرة مبنية بالأساس على افتراضات وملاحظات شخصية. الأولوية الآن لاختبار السوق وليس البناء.',
    };
  }
  return {
    id: 'insufficient',
    min: 0,
    max: 39,
    labelAr: 'أدلة غير كافية للحكم النهائي',
    labelEn: 'Insufficient Evidence',
    descriptionAr: 'تنقصنا مؤشرات أساسية عن سلوك العميل واستعداده للدفع. الأداة لا تختلق يقينًا زائفًا بدون وقائع.',
  };
}

// -------------------------------------------------------------
// Strategic Syntheses (Enriched by AI if available)
// -------------------------------------------------------------

function buildExecutiveDiagnosis(
  answers: QuestionnaireAnswers,
  opportunityScore: number,
  confidenceScore: number,
  problemScore: number,
  buyerScore: number,
  demandScore: number,
  ai?: AiStrategicInterpretation | null
) {
  if (ai) {
    return {
      strongestAspectAr: ai.strongest_underused_advantage,
      biggestRiskAr: ai.highest_risk_assumption,
      immediateDecisionAr: `${ai.strategic_interpretation} (${ai.recommended_test})`,
    };
  }

  // Fallback Deterministic Diagnosis
  let strongest = '';
  const costs = answers.costOfInaction || [];
  if (problemScore >= 65) {
    strongest = `المشكلة محددة ومؤلمة ومقترنة بتكلفة واضحة في (${costs.slice(0, 2).join(' و') || 'الوقت والمجهود'})، والعميل يبحث لها عن مخرج.`;
  } else if (buyerScore >= 65) {
    strongest = `تحديد شريحة المشتري (${(answers.targetBuyerDescription || '').slice(0, 50)}) دقيق ويساعد في صياغة رسالة تسويقية موجهة.`;
  } else if ((answers.qualificationEvidence || []).includes('client_results')) {
    strongest = 'امتلاكك لنتائج سابقة ومثبتة مع عملاء يمنحك مصداقية جاهزة لبناء ثقة المشترين الأوائل.';
  } else {
    strongest = 'وضوح الفكرة العامة ورغبتك في نقل خبرتك إلى نموذج رقمي أكثر استقلالية.';
  }

  // Contradiction detection
  const wantsHighScale =
    answers.creatorTimePerCustomer === 'almost_none' || answers.creatorTimePerCustomer === 'under_30m';
  const deliveryList = answers.deliveryMechanism || [];
  const requiresSubstantialIntervention =
    answers.requiresPersonalFeedback === true ||
    answers.requiresOneOnOneAccountability === true ||
    deliveryList.includes('critique_feedback') ||
    deliveryList.includes('accountability') ||
    deliveryList.includes('live_coaching');

  let biggestRisk = '';
  if (wantsHighScale && requiresSubstantialIntervention) {
    biggestRisk =
      'تناقض جوهري بين نموذج التسليم والنتيجة: ترغب في نموذج قابل للتوسع عاليًا دون استهلاك وقتك، بينما النتيجة وآلية المنتج تتطلبان تقييمًا ومتابعة شخصية مستمرة. بيع هذا العرض كمنتج رقمي بحت سيؤدي لنتائج ضعيفة للعملاء، أو سيستنزف وقتك بالكامل.';
  } else if (demandScore <= 35) {
    biggestRisk =
      'الاعتماد على الافتراض الشخصي بوجود رغبة شراء، دون التحقق من استعداد الجمهور للدفع الفعلي مقابل حل مستقل بدل البدائل المجانية.';
  } else if (buyerScore <= 40) {
    biggestRisk =
      'استهداف شريحة عامة أو واسعة بزيادة، مما يجعل الرسالة التسويقية غير جذابة لأي فئة بعينها ويصعب العثور على المشترين الأوائل.';
  } else if (answers.creatorTimePerCustomer === 'high_touch') {
    biggestRisk =
      'ارتهان نجاح المنتج بتدخل شخصي مكثف منك لكل عميل، مما يعيد إنتاج مشكلة استنزاف الوقت التي تحاول حلها عبر المنتج الرقمي.';
  } else {
    biggestRisk =
      'خطر التورط في تسجيل وإنتاج منتج كامل وكبير قبل بيع أول 5 إلى 10 نسخ أولية للتحقق من صدى العرض ورغبة الجمهور.';
  }

  let immediateDecision = '';
  if (opportunityScore >= 75 && confidenceScore >= 60) {
    immediateDecision =
      'ما تسجلش كورس كبير كامل دلوقتي. ابنِ النسخة الأولية (MVP) واختبر بيعها لعدد محدود من المشترين المؤهلين أولاً.';
  } else if (confidenceScore < 45) {
    immediateDecision =
      'أولويتك الآن ليست بناء المنتج أو تصميم صفحاته، بل إجراء محادثات اكتشاف مع الشريحة المستهدفة لجمع الدليل الناقص.';
  } else if (opportunityScore < 55) {
    immediateDecision =
      'أوقف التفكير في الإنتاج حاليًا. أعد صياغة المشكلة لترتبط بألم مالي أو مهني مباشر، وضَيّق الشريحة المستهدفة.';
  } else {
    immediateDecision =
      'اختبر الفكرة كورشة عمل حية مدفوعة أو قالب عملي تفاعلي قبل استثمار أي مجهود في تصوير أو كتابة محتوى ضخم.';
  }

  return {
    strongestAspectAr: strongest,
    biggestRiskAr: biggestRisk,
    immediateDecisionAr: immediateDecision,
  };
}

function buildAssumptionMap(
  answers: QuestionnaireAnswers,
  demandScore: number,
  ai?: AiStrategicInterpretation | null
): AssumptionItem[] {
  const items: AssumptionItem[] = [];
  const list = answers.demandEvidenceList || [];

  // Assumption 1: Audience has the problem
  if (list.includes('people_ask_me') || list.includes('existing_clients_ask')) {
    items.push({
      id: 'assump-problem-exists',
      textAr: 'الجمهور المستهدف يعاني بالفعل من هذه المشكلة ويبحث لها عن مخرج',
      category: 'evidence',
      categoryLabelAr: 'عندنا دليل',
      contextNoteAr: 'مدعوم بتكرار استفسارات وطلبات العملاء الحالية حول نفس المشكلة.',
    });
  } else {
    items.push({
      id: 'assump-problem-exists',
      textAr: 'الجمهور المستهدف يشعر بوجود المشكلة ويعتبرها أولوية حالية',
      category: 'needs_validation',
      categoryLabelAr: 'محتاج اختبار',
      contextNoteAr: 'يحتاج للتأكد من أن الجمهور يصف المشكلة بنفس لغتك ويعتبرها معطلة له.',
    });
  }

  // Assumption 2: Willingness to pay
  if (list.includes('preorders_deposits') || list.includes('sold_related_work')) {
    items.push({
      id: 'assump-wtp',
      textAr: 'المشترون مستعدون لدفع مقابل مالي لحل مستقل بدل البدائل المجانية',
      category: 'evidence',
      categoryLabelAr: 'عندنا دليل',
      contextNoteAr: 'مدعوم بمعاملات دفع سابقة أو حجوزات مسبقة ذات صلة ترفع مستوى الثقة في الجاهزية للدفع.',
    });
  } else if (demandScore <= 35) {
    items.push({
      id: 'assump-wtp',
      textAr: 'الناس مستعدة تدفع أموالاً فعلية للحل بدل الاكتفاء بالمواد والمنشورات المجانية',
      category: 'high_risk',
      categoryLabelAr: 'مخاطرة عالية',
      contextNoteAr: ai?.highest_risk_assumption || 'لا يوجد حتى الآن أي تبادل مالي أو التزام حقيقي يدعم فرضية الجاهزية للدفع.',
    });
  } else {
    items.push({
      id: 'assump-wtp',
      textAr: 'قيمة العرض المادية تتناسب مع حجم المشكلة واستعداد الشريحة للشراء',
      category: 'needs_validation',
      categoryLabelAr: 'محتاج اختبار',
      contextNoteAr: 'يجب اختباره عبر طرح عرض أولي مخفض لجمع التزامات مؤكدة.',
    });
  }

  // Assumption 3: Reach & Distribution
  if (answers.audienceAccessLevel === 'direct_daily') {
    items.push({
      id: 'assump-reach',
      textAr: 'سهولة الوصول المباشر لأول المشترين دون الحاجة لحملات إعلانية مدفوعة',
      category: 'evidence',
      categoryLabelAr: 'عندنا دليل',
      contextNoteAr: 'لديك وصول مباشر للجمهور المستهدف يقلل اعتمادك على الإعلانات في الاختبار.',
    });
  } else {
    items.push({
      id: 'assump-reach',
      textAr: 'إمكانية لفت انتباه المشترين المستهدفين والتواصل معهم بسهولة بدون ميزانيات تسويق ضخمة',
      category: 'high_risk',
      categoryLabelAr: 'مخاطرة عالية',
      contextNoteAr: 'الوصول للجمهور الحالي محدود، والاعتماد على الإعلانات مبكرًا مخاطرة غير محسوبة.',
    });
  }

  // Assumption 4: Delivery scale
  const wantsScale =
    answers.creatorTimePerCustomer === 'almost_none' || answers.creatorTimePerCustomer === 'under_30m';
  const mechList = answers.deliveryMechanism || [];
  const highIntervention =
    answers.requiresPersonalFeedback === true ||
    answers.requiresOneOnOneAccountability === true ||
    mechList.includes('critique_feedback') ||
    mechList.includes('accountability') ||
    mechList.includes('live_coaching');

  if (wantsScale && highIntervention) {
    items.push({
      id: 'assump-scale-contradiction',
      textAr: 'إمكانية تسليم نتيجة تعتمد على التقييم أو المتابعة الفردية ضمن نموذج آلي لا يستهلك وقتك',
      category: 'high_risk',
      categoryLabelAr: 'تناقض عالي المخاطرة',
      contextNoteAr:
        'تناقض في نموذج التسليم: ترغب في استهلاك وقت شبه منعدم بينما النتيجة والآلية تتطلبان مراجعة ومتابعة شخصية.',
    });
  } else if (wantsScale) {
    items.push({
      id: 'assump-scale',
      textAr: 'المنتج يمكن تسليمه وتكراره دون استنزاف وقت صاحب الخبرة الشخصي في كل مبيعة',
      category: 'evidence',
      categoryLabelAr: 'عندنا دليل',
      contextNoteAr: 'تصميم المنتج يعتمد على أدوات أو قوالب أو شرح مسجل ذاتي الاستهلاك.',
    });
  } else {
    items.push({
      id: 'assump-scale',
      textAr: 'تقديم الدعم الشخصي والتغذية الراجعة لن يؤدي إلى اختناق جدولك الزمني مع نمو العملاء',
      category: 'needs_validation',
      categoryLabelAr: 'محتاج اختبار',
      contextNoteAr: 'ضرورة وضع حدود واضحة لآلية تقديم الملاحظات وحجم التدخل الفردي.',
    });
  }

  return items;
}

function buildFormatRecommendation(answers: QuestionnaireAnswers): {
  primary: ProductFormatInfo;
  secondary?: ProductFormatInfo;
  avoid: AvoidFormatInfo[];
} {
  // Context Factors Evaluation (A: One-time vs Recurring, B: Recurring Frequency, C: Ongoing Accountability, D: Personalized Feedback, E: Proven Recurring Purchasing)
  const isOneTimeProblem =
    answers.problemFrequency === 'occasional' || answers.problemFrequency === 'unsure';
  const isRecurringProblem =
    answers.problemFrequency === 'daily' || answers.problemFrequency === 'weekly' || answers.problemFrequency === 'monthly';

  // Requirement #7: Tri-state logic for feedback and accountability in format scoring
  // required: apply relevant positive/negative evidence
  // not_required: allow low-touch evidence
  // unknown: ZERO evidence either direction (never let unknown award low-touch/automated bonus)
  const feedbackTriState =
    answers.personalFeedbackState ||
    (answers.requiresPersonalFeedback === true ? 'required' : answers.requiresPersonalFeedback === false ? 'not_required' : 'unknown');

  const accountabilityTriState =
    answers.oneOnOneAccountabilityState ||
    (answers.requiresOneOnOneAccountability === true ? 'required' : answers.requiresOneOnOneAccountability === false ? 'not_required' : 'unknown');

  const deliveryList = answers.deliveryMechanism || [];

  const feedbackRequired =
    feedbackTriState === 'required' || deliveryList.includes('critique_feedback');
  const feedbackConfirmedNotRequired =
    feedbackTriState === 'not_required' && !deliveryList.includes('critique_feedback');

  const accountabilityRequired =
    accountabilityTriState === 'required' || deliveryList.includes('accountability');
  const accountabilityConfirmedNotRequired =
    accountabilityTriState === 'not_required' && !deliveryList.includes('accountability');

  const isZeroTouch =
    answers.creatorTimePerCustomer === 'almost_none' || answers.creatorTimePerCustomer === 'under_30m';
  const isRecurringSupport = answers.creatorTimePerCustomer === 'recurring_support';
  const isHighTouch =
    answers.creatorTimePerCustomer === 'high_touch' || answers.creatorTimePerCustomer === '1_to_2h';

  const hasExistingAudience =
    answers.audienceAccessLevel === 'direct_daily' || answers.audienceAccessLevel === 'occasional';

  const demandListForFormat = (answers.demandEvidenceList || []) as string[];

  // Strict separation between hasPaymentEvidence and hasRecurringPaymentEvidence
  const hasPaymentEvidence =
    demandListForFormat.includes('paid_pilot') ||
    demandListForFormat.includes('paid_deposit') ||
    demandListForFormat.includes('paid_preorder') ||
    demandListForFormat.includes('preorders_deposits') ||
    demandListForFormat.includes('sold_related_work') ||
    answers.hasExistingPayingClients === true;

  const hasProvenDemand = hasPaymentEvidence;

  // 1. Repeat one-time purchases (e.g. repeated consulting or ad-hoc service clients — NOT subscription demand!)
  const hasRepeatOneTimePurchases =
    answers.hasRecurringPaymentBehavior === 'repeat_buyers_no_sub';

  // 2. Explicit recurring payment behavior (monthly/periodic recurring subscription or retainer)
  const hasExplicitMonthlyBehavior =
    answers.hasRecurringPaymentBehavior === 'recurring_monthly';

  // Direct recurring-payment evidence (actual recurring payments)
  const hasRecurringPaymentEvidence = hasExplicitMonthlyBehavior;

  // 3. Direct buyer requests for subscriptions (expressed subscription intent / demand)
  const hasExplicitRecurringRequest =
    answers.explicitRecurringRequestReceived === true ||
    answers.explicitRecurringRequestReceived === 'yes';

  // 4. Documented retention data (Supporting scale-readiness evidence only — does NOT independently establish recurring payments or subscription demand)
  const hasDocumentedRetentionData =
    answers.hasDocumentedRetentionData === true ||
    answers.hasDocumentedRetentionData === 'yes';

  // 5. Credible ongoing value and renewal mechanism (Require explicit continuation mechanism: ongoing practice, new cases, accountability, recurring feedback, updates, community)
  const recurringReasonText = (answers.recurringValueReason || '').trim().toLowerCase();
  const continuationSignals = [
    'تحديث', 'تحديثات', 'ممارسة', 'متابعة', 'مراجعة', 'فرص', 'تطوير', 'تطبيق', 'حالات جديدة',
    'مساءلة', 'جروب', 'مجتمع', 'شبكة', 'أسئلة', 'شهر', 'دوري', 'تغذية راجعة', 'feedback', 'accountability'
  ];
  const hasCredibleContinuationMechanism =
    recurringReasonText.length > 8 && continuationSignals.some((sig) => recurringReasonText.includes(sig));

  // If recurringValueReason is empty/unknown, Membership loses confidence even if problem repeats
  const hasValidRecurringReason = hasCredibleContinuationMechanism;

  // TRUE SUBSCRIPTION DEMAND:
  // Requires actual recurring payment evidence OR explicit direct buyer subscription requests.
  // Supporting retention data, paying clients, or repeat one-time purchases alone do NOT establish subscription demand!
  const hasSubscriptionDemand =
    hasRecurringPaymentEvidence || hasExplicitRecurringRequest;

  const canSustainRecurringDelivery =
    isRecurringSupport ||
    answers.creatorTimePerCustomer === '1_to_2h' ||
    answers.creatorTimePerCustomer === 'under_30m' ||
    answers.availableWeeklyHours === '10_to_20' ||
    answers.availableWeeklyHours === 'full_time';

  const hasTemplates = deliveryList.includes('templates_tools');
  const hasFramework =
    deliveryList.includes('framework_steps') || answers.uniqueMethodType === 'proprietary_framework';
  const hasCommunity = deliveryList.includes('community');
  const hasLiveCalls = deliveryList.includes('live_coaching');

  const isTripwire =
    answers.productRoleInBusiness === 'lead_tripwire' || answers.expectedPriceTier === 'micro_under_50';
  const isBackendFeeder = answers.productRoleInBusiness === 'backend_service_feeder';
  const isFlagship = answers.productRoleInBusiness === 'core_flagship';
  const isPremiumTier = answers.expectedPriceTier === 'premium_500_plus';

  interface FormatOption {
    id: string;
    score: number;
    info: ProductFormatInfo;
  }

  const options: FormatOption[] = [
    // 1. Toolkit / Template
    {
      id: 'toolkit',
      score:
        30 +
        (hasTemplates ? 40 : 0) +
        (isZeroTouch ? 25 : 0) +
        (isTripwire ? 25 : 0) +
        (feedbackConfirmedNotRequired ? 15 : feedbackRequired ? -35 : 0) +
        (accountabilityConfirmedNotRequired ? 10 : accountabilityRequired ? -25 : 0) +
        (isOneTimeProblem ? 15 : 0),
      info: {
        titleAr: 'حزمة قوالب وأدوات تنفيذية (Actionable Toolkit & Templates)',
        titleEn: 'Toolkit / Template',
        whyFitAr:
          'شكل سريع في البناء والتسليم يركز على أدوات وأصول جاهزة للاستخدام الفوري تختصر ساعات شاقة، ويناسب نموذج التسليم الذاتي المستقل دون استهلاك وقتك الشخصي.',
        speedToFirstValue: 'ساعات معدودة للمشتري',
        deliveryBurden: 'شبه معدوم بعد مرحلة الإعداد والتصميم',
      },
    },

    // 2. Playbook
    {
      id: 'playbook',
      score:
        30 +
        (hasFramework ? 40 : 0) +
        (isZeroTouch ? 25 : 0) +
        (isOneTimeProblem ? 20 : 0) +
        (feedbackConfirmedNotRequired ? 15 : feedbackRequired ? -25 : 0) +
        (!hasTemplates ? 10 : 0) +
        (answers.uniqueMethodType === 'proprietary_framework' ? 20 : 0),
      info: {
        titleAr: 'دليل تشغيلي ونظام خطوة بخطوة (System Playbook)',
        titleEn: 'Playbook',
        whyFitAr:
          'يركز على تحويل خبرتك إلى خطوات تشغيلية محددة مسلسلة وقابلة للتكرار دون تعقيد إنتاج الفيديو، ويسهل توزيعه واختباره فوريًا كحل مستقل متكامل.',
        speedToFirstValue: 'فوري عقب القراءة والتطبيق',
        deliveryBurden: 'تسليم رقمي ذاتي بالكامل',
      },
    },

    // 3. Mini Course
    {
      id: 'mini_course',
      score:
        35 +
        (isZeroTouch ? 20 : 0) +
        (isTripwire || answers.expectedPriceTier === 'low_50_150' ? 30 : 0) +
        (feedbackConfirmedNotRequired ? 15 : feedbackRequired ? -20 : 0) +
        (isOneTimeProblem ? 15 : 0),
      info: {
        titleAr: 'دورة مصغرة عالية التركيز (60–90 دقيقة - Mini Course)',
        titleEn: 'Mini Course',
        whyFitAr:
          'شكل مرئي مكثف يحل نقطة اختناق واحدة محددة دون تشتيت، يسهل إنتاجه في أيام معدودة ويحقق قيمة سريعة للمشتري كمنتج مدخل ممتاز.',
        speedToFirstValue: 'يوم واحد للمشتري',
        deliveryBurden: 'تسليم تلقائي مسجل ذاتي الاستهلاك',
      },
    },

    // 4. Full Course
    {
      id: 'full_course',
      score:
        10 +
        (isFlagship ? 35 : -15) +
        (hasProvenDemand ? 35 : -40) +
        (hasFramework ? 25 : -20) +
        (isPremiumTier || answers.expectedPriceTier === 'mid_150_500' ? 20 : -10) +
        (isZeroTouch ? 15 : 0) -
        (isRecurringProblem ? 35 : 0) -
        (isRecurringSupport ? 35 : 0) -
        (hasCommunity ? 25 : 0) -
        (accountabilityRequired ? 25 : 0),
      info: {
        titleAr: 'برنامج تدريبي شامل مسجل (Comprehensive Flagship Course)',
        titleEn: 'Full Course',
        whyFitAr:
          'يناسب المراحل التي تم فيها التحقق من وجود طلب مؤكد ونتائج سابقة، حيث يُبنى كأصل رقمي متكامل يغطي رحلة التحول من الصفر حتى الاحتراف.',
        speedToFirstValue: 'أسبوعان إلى 4 أسابيع',
        deliveryBurden: 'جهد إنتاج أولي ضخم ثم تسليم مؤتمت',
      },
    },

    // 5. Live Workshop
    {
      id: 'live_workshop',
      score:
        30 +
        (hasExistingAudience ? 30 : -25) +
        (hasLiveCalls ? 25 : 0) +
        (!hasProvenDemand ? 25 : 0) +
        (isOneTimeProblem ? 15 : 0) +
        (!isZeroTouch ? 15 : -20),
      info: {
        titleAr: 'ورشة عمل تفاعلية مباشرة (Live Interactive Workshop)',
        titleEn: 'Live Workshop',
        whyFitAr:
          'أسرع طريقة لاختبار الفكرة وجهًا لوجه مع المشترين؛ تتيح لك التفاعل المباشر ومعرفة الاعتراضات وصقل العرض، ثم إعادة استخدام التسجيل كمنتج دائم.',
        speedToFirstValue: 'جلسة واحدة مكثفة (2 إلى 3 ساعات)',
        deliveryBurden: 'وقت محدد ومركّز خلال موعد الورشة',
      },
    },

    // 6. Cohort / Sprint
    {
      id: 'cohort_sprint',
      score:
        25 +
        (accountabilityRequired ? 45 : -20) +
        (hasLiveCalls ? 25 : 0) +
        (isHighTouch ? 25 : -35) +
        (isPremiumTier || answers.expectedPriceTier === 'mid_150_500' ? 25 : 0) +
        (hasExistingAudience ? 15 : -15) +
        (hasRepeatOneTimePurchases ? 15 : 0),
      info: {
        titleAr: 'معسكر تطبيقي محدد المدة 7–14 يوم (Implementation Sprint / Cohort)',
        titleEn: 'Cohort / Sprint',
        whyFitAr:
          'يجمع بين حافز الالتزام الجماعي ومواعيد التسليم المحددة، مما يرفع نسب إكمال المشتركين للنتيجة إلى أقصى حد ويبرر سعرًا أعلى.',
        speedToFirstValue: 'أسبوع واحد مع تسليم النتيجة تدريجيًا',
        deliveryBurden: 'متابعة مكثفة محددة السقف الزمني',
      },
    },

    // 7. Membership (Strict: Requires recurring problem, ongoing continuation value & proven recurring payment behavior)
    {
      id: 'membership',
      score:
        10 +
        (isRecurringProblem ? 35 : -70) +
        (isRecurringSupport ? 30 : -35) +
        (hasRecurringPaymentEvidence ? 45 : hasExplicitRecurringRequest ? 30 : -45) +
        (hasExistingAudience ? 20 : -30) +
        (hasCommunity ? 20 : 0) +
        (hasLiveCalls ? 15 : 0) +
        (accountabilityRequired ? 15 : 0) +
        (hasValidRecurringReason ? 30 : -60) + // Strong penalty if credible continuation value reason is absent or unverified
        (canSustainRecurringDelivery ? 15 : -25) +
        // Supporting retention data provides a modest bonus ONLY when verified subscription demand already exists
        (hasDocumentedRetentionData && hasSubscriptionDemand ? 15 : 0) +
        // Repeated purchases of consulting/services without subscription demand is a classic trap — penalize membership
        (hasRepeatOneTimePurchases && !hasSubscriptionDemand ? -30 : 0),
      info: {
        titleAr: 'عضوية شهرية / اشتراك دوري (Recurring Membership)',
        titleEn: 'Membership',
        whyFitAr:
          'يناسب المشاكل المتكررة شهريًا التي تتطلب تحديثات دورية أو استشارات جماعية مستمرة مع وجود طلب مثبت وقيمة متجددة، ويخلق تدفقًا نقديًا متوقعًا ومستقرًا.',
        speedToFirstValue: 'مستمرة مع كل تحديث أو جلسة شهرية',
        deliveryBurden: 'التزام إنتاج ودعم مستمر شهريًا',
      },
    },

    // 8. Paid Community
    {
      id: 'paid_community',
      score:
        10 +
        (hasCommunity ? 45 : -25) +
        (isRecurringProblem ? 30 : -35) +
        (hasExistingAudience ? 25 : -45) +
        (isRecurringSupport ? 25 : -20) +
        (hasExplicitRecurringRequest ? 25 : 0),
      info: {
        titleAr: 'مجتمع مهني تفاعلي مدفوع (Curated Paid Community)',
        titleEn: 'Paid Community',
        whyFitAr:
          'تكمن القيمة في تشبيك المشتركين وتبادل الفرص وحل المشكلات التخصصية تحت إشرافك، مما يجعل المجتمع يغذي نفسه ذاتيًا بمرور الوقت.',
        speedToFirstValue: 'فوري بمجرد التفاعل والنقاش',
        deliveryBurden: 'إدارة تفاعل وإشراف مستمر',
      },
    },

    // 9. Assessment / Diagnostic Tool
    {
      id: 'assessment',
      score:
        25 +
        (isTripwire || isBackendFeeder ? 35 : 0) +
        (isZeroTouch ? 30 : 0) +
        (feedbackConfirmedNotRequired && accountabilityConfirmedNotRequired ? 25 : (feedbackRequired || accountabilityRequired ? -25 : 0)),
      info: {
        titleAr: 'أداة تقييم وتشخيص متخصصة (Diagnostic Assessment & Audit)',
        titleEn: 'Assessment',
        whyFitAr:
          'تمنح العميل تشخيصًا فوريًا لموقعه وفجوته الحالية مع خطة عمل مخصصة، وتعتبر مدخلاً تسويقيًا استثنائيًا لتأهيل العملاء لخدماتك المتقدمة.',
        speedToFirstValue: 'فوري (10 إلى 15 دقيقة)',
        deliveryBurden: 'مؤتمت بالكامل بنسبة 100%',
      },
    },

    // 10. Productized Consulting
    {
      id: 'productized_consulting',
      score:
        20 +
        (feedbackRequired ? 40 : feedbackConfirmedNotRequired ? -20 : 0) +
        (isHighTouch ? 35 : -45) +
        (isPremiumTier ? 35 : 0) +
        (isBackendFeeder ? 30 : 0) +
        (hasRepeatOneTimePurchases ? 25 : 0) +
        (answers.transformationRealism === 'depends_on_many_external_factors' ? 20 : 0),
      info: {
        titleAr: 'استشارة مقننة بنظام محدد ومخرجات ثابتة (Productized Consulting Sprint)',
        titleEn: 'Productized Consulting',
        whyFitAr:
          'أعلى نقطة تسعير وأسرع عائد نقدي؛ تجمع بين تخصيص الاستشارة وضبط الوقت عبر نطاق عمل ثابت ومخرجات محددة سلفًا دون استنزاف مفتوح.',
        speedToFirstValue: 'أسبوع واحد بعد جلسة التشخيص وتسليم المخرجات',
        deliveryBurden: 'ساعات عمل مقننة محددة المخرجات لكل عميل',
      },
    },

    // 11. Hybrid Product
    {
      id: 'hybrid_product',
      score:
        30 +
        ((hasTemplates || hasFramework) && (feedbackRequired || hasLiveCalls) ? 45 : 0) +
        (answers.creatorTimePerCustomer === 'under_30m' || answers.creatorTimePerCustomer === '1_to_2h' ? 30 : 0) +
        (answers.expectedPriceTier === 'mid_150_500' || isPremiumTier ? 25 : 0) +
        (hasRepeatOneTimePurchases ? 15 : 0),
      info: {
        titleAr: 'منتج هجين: نظام رقمي + مراجعة تطبيقية جماعية (Hybrid System + Group Review)',
        titleEn: 'Hybrid Product',
        whyFitAr:
          'يجمع بين قابلية التوسع للأصول الرقمية، وأمان التقييم البشري الذي يضمن للمشتركين تطبيق الخطوات بنجاح دون استنزاف وقتك الفردي في كل تفصيلة.',
        speedToFirstValue: 'أيام معدودة للدراسة وجلسة مراجعة واحدة',
        deliveryBurden: 'منخفض إلى متوسط ومضبوط في مواعيد ثابتة',
      },
    },
  ];

  // Contextual Tie-breaking: never let array declaration order dictate strategic decisions
  options.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    // When problem/value is recurring and PROVEN subscription demand + credible continuation value exist:
    if (isRecurringProblem && hasSubscriptionDemand && hasValidRecurringReason) {
      if (a.id === 'membership') return -1;
      if (b.id === 'membership') return 1;
    }
    if (isRecurringProblem && (hasSubscriptionDemand || isRecurringSupport) && hasCommunity) {
      if (a.id === 'paid_community') return -1;
      if (b.id === 'paid_community') return 1;
    }
    // Zero-touch with confirmed no feedback favors templates or playbooks
    if (isZeroTouch && feedbackConfirmedNotRequired) {
      if (a.id === 'toolkit') return -1;
      if (b.id === 'toolkit') return 1;
      if (a.id === 'playbook') return -1;
      if (b.id === 'playbook') return 1;
    }
    return 0;
  });

  // Membership Recommendation Safeguards:
  // A recurring problem alone must NOT qualify a Membership as the primary recommended format.
  // Use explicit recurring evidence and credible ongoing value to determine whether Membership is a justified primary recommendation.
  // Where recurring evidence is insufficient, prefer an appropriately scored one-time or pilot format instead of a membership.
  const isMembershipJustified =
    isRecurringProblem && hasSubscriptionDemand && hasValidRecurringReason;

  if (options[0].id === 'membership' && !isMembershipJustified) {
    const memIndex = options.findIndex((opt) => opt.id === 'membership');
    if (memIndex !== -1) {
      const [memOpt] = options.splice(memIndex, 1);
      // Place it after qualified one-time or pilot formats
      options.splice(2, 0, memOpt);
    }
  }

  // Also safeguard secondary format if recurring evidence is insufficient
  if (options[1]?.id === 'membership' && !isMembershipJustified) {
    const memIndex = options.findIndex((opt) => opt.id === 'membership');
    if (memIndex === 1 && options.length > 2) {
      const [memOpt] = options.splice(memIndex, 1);
      options.splice(2, 0, memOpt);
    }
  }

  const primary = options[0].info;
  const secondary = options[1].info;

  // Contextual Dynamic Avoid List
  const avoid: AvoidFormatInfo[] = [];

  if (!hasProvenDemand || !isFlagship || isRecurringProblem) {
    avoid.push({
      titleAr: 'كورس شامل وضخم (Full Flagship Course من 30-40 درس)',
      titleEn: 'Full Course',
      whyNotAr: isRecurringProblem
        ? 'مشكلتك متكررة وتتطلب ممارسة ومتابعة دورية مستمرة، والكورس المسجل الضخم يقدم حلاً لمرة واحدة دون آلية التزام أو تفاعل متجدد.'
        : 'استثمار شهرين في التسجيل والمونتاج قبل التأكد من قبول الجمهور ومعدل إكمالهم للمحتوى مخاطرة قد تهدر طاقتك. النسخة المصغرة أو الورشة هي المدخل الأضمن.',
    });
  }

  // Membership only discouraged when THIS case lacks the essential conditions:
  const lacksRecurringNeed = isOneTimeProblem;
  const lacksAudienceAccess = answers.audienceAccessLevel === 'none_yet' || answers.audienceAccessLevel === 'unsure';
  const lacksRecurringEvidence = !hasSubscriptionDemand;
  const lacksContinuationMechanism = !hasValidRecurringReason;
  const lacksDeliveryCapacity = answers.creatorTimePerCustomer === 'high_touch' && answers.availableWeeklyHours === 'under_5';

  if (
    lacksRecurringNeed ||
    (lacksAudienceAccess && lacksRecurringEvidence) ||
    lacksDeliveryCapacity ||
    (hasRepeatOneTimePurchases && lacksRecurringEvidence) ||
    (isRecurringProblem && (lacksRecurringEvidence || lacksContinuationMechanism))
  ) {
    let whyNotAr = 'العضويات تتطلب حاجة متجددة واستبقاءً مستمرًا للأعضاء (Retention). البدء بها دون وجود مشكلة تتجدد دوريًا أو وصول كافٍ للجمهور يؤدي للاستنزاف التشغيلي والتسرب السريع للمشتركين.';
    if (hasRepeatOneTimePurchases && lacksRecurringEvidence) {
      whyNotAr = 'تكرار شراء الاستشارات أو الخدمات الفردية يثبت ثقة العملاء في خبرتك، لكنه لا يعني رغبتهم في اشتراك شهري مستمر. المنتجات محددة النتيجة بدفعة واحدة أسهل في التحقق والبيع دون استنزاف تشغيلي.';
    } else if (isRecurringProblem && lacksContinuationMechanism) {
      whyNotAr = 'رغم تكرار المشكلة، لا توجد آلية استبقاء وقيمة متجددة واضحة تجعل العضو يجدد اشتراكه شهريًا بعد استهلاك المحتوى الأساسي. البدء بمنتج لمرة واحدة أو ورشة عمل أضمن لمنع التسرب المبكر.';
    } else if (isRecurringProblem && lacksRecurringEvidence) {
      whyNotAr = 'المشكلة متكررة ولكن لا توجد مدفوعات اشتراك دورية فعلية أو طلبات اشتراك صريحة من العملاء. بيانات الاستبقاء العامة وحدها لا تثبت استعداد السوق للدفع الدوري؛ البدء بمنتج محدد النتيجة أضمن.';
    }
    avoid.push({
      titleAr: 'اشتراك شهري أو مجتمع مدفوع (Recurring Membership / Paid Community)',
      titleEn: 'Membership / Community',
      whyNotAr,
    });
  }

  if (isZeroTouch || answers.creatorTimePerCustomer === 'under_30m') {
    avoid.push({
      titleAr: 'استشارات فردية مفتوحة غير مقننة (Unstructured 1:1 Consulting)',
      titleEn: 'Open 1-on-1 Consulting',
      whyNotAr:
        'بيع الساعات المفتوحة يحد من التوسع ويزيد من استبدال الوقت بالمال، ويتناقض مع رغبتك في نموذج تسليم مستقل ومريح.',
    });
  }

  if (avoid.length < 3) {
    avoid.push({
      titleAr: 'تطبيق برمجي معقد أو منصة SaaS مخصصة (Custom Platform / App)',
      titleEn: 'Custom Software App',
      whyNotAr:
        'تكاليف التطوير البرمجي والصيانة التقنية في هذه المرحلة تشتتك عن جوهر العرض والتحقق من المشكلة والطلب.',
    });
  }

  // Strict Consistency Filter: NEVER include primary or secondary format in avoid list
  const filteredAvoid = avoid.filter((item) => {
    const itemEn = item.titleEn.toLowerCase();
    const primaryEn = primary.titleEn.toLowerCase();
    const secondaryEn = (secondary?.titleEn || '').toLowerCase();

    if (itemEn === primaryEn || (secondaryEn && itemEn === secondaryEn)) return false;
    if (primaryEn.includes('membership') && itemEn.includes('membership')) return false;
    if (primaryEn.includes('community') && itemEn.includes('community')) return false;
    if (secondaryEn.includes('membership') && itemEn.includes('membership')) return false;
    if (secondaryEn.includes('community') && itemEn.includes('community')) return false;
    if (primaryEn.includes('full course') && itemEn.includes('full course')) return false;
    if (primaryEn.includes('workshop') && itemEn.includes('workshop')) return false;
    if (primaryEn.includes('toolkit') && itemEn.includes('toolkit')) return false;
    return true;
  });

  return { primary, secondary, avoid: filteredAvoid.slice(0, 3) };
}

function buildProductConcept(
  answers: QuestionnaireAnswers,
  primaryFormat: ProductFormatInfo
): ProductConcept {
  const domain = (answers.expertiseDomain || '').trim() || 'مجالك التخصصي';
  const target = (answers.targetBuyerDescription || '').trim() || 'جمهورك المستهدف';
  const problem = (answers.coreProblemDescription || '').trim() || 'المشكلة الأساسية';
  const transform = (answers.afterState || '').trim() || 'الوصول للنتيجة المنشودة';
  const rawMethod = (answers.uniqueMethodOrProcess || '').trim();
  const method = rawMethod && rawMethod.length > 5
    ? rawMethod
    : 'لم يتم توثيق منهجية خاصة حتى الآن (يجب استخلاص خطواتها من التجربة الواقعية)';

  const nameDirections = [
    `نظام ${domain} التطبيقي (The ${domain} Playbook)`,
    `مسرّع نتائج ${target.slice(0, 30)}: من التشتت إلى ${transform.slice(0, 30)}`,
    `خارطة طريق ${transform.slice(0, 35)}: الدليل والأدوات العملية`,
  ];

  const whatNotToInclude = [
    'مقدمات نظرية طويلة وتاريخ المجال — المشتري يبحث عن اختصار الوقت وتطبيق عملي.',
    'مكافآت (Bonuses) عشوائية غير مرتبطة بالنتيجة — الحشو الزائد لا يعالج ضعف العرض الأساسي.',
    'تقنيات ومنصات معقدة تتطلب اشتراكات شهرية باهظة من العميل في هذه المرحلة.',
    'وعود وردية أو نتائج غير قابلة للتحكم المباشر من المشتري.',
  ];

  return {
    nameDirections,
    targetAudience: target,
    coreProblem: problem,
    desiredTransformation: transform,
    productMechanism: method,
    productFormat: primaryFormat.titleAr,
    initialValueProposition: `حل عملي مباشر يساعد ${target} على التعامل مع ${problem.slice(0, 40)} وتحقيق ${transform.slice(0, 40)}.`,
    whatNotToInclude,
  };
}

function buildPositioningStatement(answers: QuestionnaireAnswers): PositioningStatement {
  const target = (answers.targetBuyerDescription || '').trim() || 'الشريحة المستهدفة';
  const transform = (answers.afterState || '').trim() || 'النتيجة الملموسة';
  const costs = answers.costOfInaction || [];
  const obstacle = costs.includes('time')
    ? 'إهدار شهور في التجربة والخطأ والتشتت'
    : 'المخاطرة المالية والاعتماد على نصائح غير مجربة';
  const rawMethod = (answers.uniqueMethodOrProcess || '').trim();
  const mechanism = rawMethod && rawMethod.length > 5 ? rawMethod : 'خطوات وأدوات عملية محددة';

  const formula = `منتج يساعد [${target}] على [${transform}] بدون [${obstacle}] من خلال [${mechanism}].`;

  const natural = `دليلك ونظامك العملي لتحقيق ${transform.slice(0, 50)} — مصمم لـ ${target} لتجاوز ${obstacle} عبر خطوات واضحة ومجربة.`;

  return {
    formulaVersionAr: formula,
    naturalMarketingVersionAr: natural,
  };
}

function buildMvpRecommendation(
  answers: QuestionnaireAnswers,
  primaryFormat: ProductFormatInfo,
  validationMaturity?: ValidationMaturityInfo,
  ai?: AiStrategicInterpretation | null
): MvpRecommendation {
  const formatEn = (primaryFormat.titleEn || '').toLowerCase();
  const stageNum = validationMaturity?.stageNumber ?? 0;

  let mvpTypeAr = 'قالب تطبيقي مدعوم بشرح فيديو توضيحي (Interactive Template + Walkthrough)';
  let buildNow = [
    'صفحة أو رسالة عرض بسيطة تشرح التحول والمشكلة بدقة.',
    'الإطار العام المكتوب أو نموذج العمل الأولي (Draft System).',
    'نموذج استقبال طلبات أو رابط دفع مبكر لعدد محدود (Early Access).',
    'ملف مراجعة ملاحظات وتغذية راجعة لجمع انطباعات المشترين الأوائل.',
  ];
  let doNotBuildYet = [
    'موقع إلكتروني كامل ومنصة كورسات مدفوعة باشتراك سنوي.',
    'تصوير عشرات الساعات من الفيديوهات وتعديلها في استوديو.',
    'هوية بصرية معقدة وشعارات ومواد دعائية مكلفة.',
    'حملات إعلانات ممولة قبل التأكد من قابلية العرض للتحويل العضوي.',
  ];

  if (formatEn.includes('membership')) {
    mvpTypeAr = 'اشتراك مؤسس تجريبي لمدة شهر بمحتوى أساسي وجلسة حية واحدة (Founding Member Pilot)';
    buildNow = [
      'الأصل المعرفي الأساسي للشهر الأول (قالب رئيسي أو تدريب مكثف يحل المشكلة المتكررة).',
      'جلسة إرشاد ومكتب استشارات جماعية شهرية حية واحدة.',
      stageNum >= 4
        ? 'دعوة 5 إلى 10 من عملائك الحاليين أو المشترين المتكررين كأعضاء مؤسسين بسعر تفضيلي مغلق.'
        : 'دعوة 5 إلى 10 من المهتمين بقائمتك كأعضاء مؤسسين بسعر تفضيلي مقابل الملاحظات.',
      'آلية استطلاع دورية ومتابعة أسبوعية لقياس القيمة واستبقاء المشتركين للشهر التالي.',
    ];
    doNotBuildYet = [
      'التخطيط لمحتوى سنة كاملة مقدمًا قبل التحقق من استبقاء الدفعة الأولى.',
      'بناء تطبيق موبايل خاص للمجتمع أو شراء منصات باهظة.',
      'فتح باب الاشتراك للعامة بميزانية إعلانية قبل التأكد من رضا واستبقاء الأعضاء المؤسسين.',
    ];
  } else if (formatEn.includes('community')) {
    mvpTypeAr = 'مجتمع مهني مغلق على تطبيق مراسلة مخصص لـ 10-15 عضوًا مؤهلاً (Pilot Peer Group)';
    buildNow = [
      'شروط انضمام واضحة تحدد المستوى المهني للمشاركين.',
      'موضوع نقاش أو تحدٍ أسبوعي واحد تحت إشرافك.',
      'جلسة تعارف وتشبيك افتراضية أسبوعية.',
      'جمع ملاحظات الأعضاء حول أكبر فائدة يجدونها.',
    ];
    doNotBuildYet = [
      'شراء برمجيات مجتمعات باهظة شهريًا.',
      'محاولة جذب المئات دون فلترة جودة المشتركين.',
      'إدارة المجتمع بدوام كامل على حساب عملك الأساسي.',
    ];
  } else if (formatEn.includes('workshop')) {
    mvpTypeAr = 'ورشة تطبيقية مباشرة لمجموعة أولى محدودة (Pilot Live Workshop)';
    buildNow = [
      'عرض تقديمي مركز يغطي الخطوات العملية في 90 دقيقة.',
      'ملف تدريبات عملية يطبقه الحاضرون أثناء الجلسة.',
      'رابط دفع مبكر لتأكيد حضور أول 5 إلى 10 مشتركين.',
      'استمارة تقييم فورية في نهاية الورشة لصقل العرض.',
    ];
    doNotBuildYet = [
      'تسجيل احترافي مسبق أو استئجار قاعات واستوديوهات.',
      'صفحة بيع معقدة بأنظمة دفع معقدة.',
      'إعلانات ممولة قبل ملء أول مقاعد عبر التواصل المباشر.',
    ];
  } else if (formatEn.includes('toolkit') || formatEn.includes('template')) {
    mvpTypeAr = 'حزمة من 1-3 قوالب أساسية جاهزة مع فيديو شرح 15 دقيقة (Core Toolkit MVP)';
    buildNow = [
      'القالب أو الأداة الأساسية الأكثر طلبًا التي تحل المشكلة الفورية.',
      'فيديو شرح تطبيقي قصير يوضح كيفية استخدام القالب في 15 دقيقة.',
      'ملف PDF من صفحتين يوضح تعليمات وسيناريوهات الاستخدام.',
      'صفحة دفع مباشرة مع استبيان قصير لقياس رضا المستخدم.',
    ];
    doNotBuildYet = [
      'بناء مكتبة ضخمة من 50 قالباً قبل التأكد من جدوى القوالب الثلاثة الأولى.',
      'برمجة نظام رقمي مؤتمت مخصص.',
      'إضافة بونصات غير مرتبطة بالنتيجة الفورية.',
    ];
  } else if (formatEn.includes('playbook')) {
    mvpTypeAr = 'دليل عملي مركّز من 7-12 صفحة مدعوم بقوائم فحص (Actionable System Playbook)';
    buildNow = [
      'صياغة المراحل الـ 3 إلى 5 الخاصة بمنهجيتك في خطوات قابلة للتنفيذ.',
      'قائمة فحص (Checklist) تنفيذية يتأكد بها القارئ من إتمام كل مرحلة.',
      'دراسة حالة أو مثال تطبيقي واقعي يوضح الفرق قبل وبعد.',
      'رسالة عرض تلخص الدليل وتتيح طلبه مباشرة.',
    ];
    doNotBuildYet = [
      'كتاب إلكتروني ضخم من 100 صفحة مليء بالحشو والنظريات.',
      'تصميمات جرافيك ومطبوعات باهظة التكلفة.',
      'حملات ترويجية قبل الحصول على تقييم 5 قراء مبكرين.',
    ];
  } else if (formatEn.includes('mini course')) {
    mvpTypeAr = 'دورة مصغرة من 3 إلى 5 مقاطع فيديو مركزة بإجمالي 45-60 دقيقة (Focused Mini-Course)';
    buildNow = [
      'هيكل الدورة مقسم إلى 3 أو 4 خطوات متسلسلة للنتيجة.',
      'تسجيل الشاشة أو الشرح بجودة واضحة دون مونتاج معقد.',
      'ملف ملخص أو ورقة عمل مرفقة بكل خطوة.',
      'رابط تسجيل مبكر بسعر إطلاق تشجيعي.',
    ];
    doNotBuildYet = [
      'منصة تعليمية متطورة بميزات اختبارات وشهادات معقدة.',
      'استئجار معدات تصوير سينمائي.',
      'تسجيل وحدات ومحتوى إضافي قبل التحقق من تفاعل الدفعة الأولى.',
    ];
  } else if (formatEn.includes('cohort') || formatEn.includes('sprint')) {
    mvpTypeAr = 'معسكر تطبيقي مصغر مدته 5 أيام لمجموعة تجريبية من 5-10 مشتركين (Pilot Sprint)';
    buildNow = [
      'جدول زمني لخمسة أيام بمهمة يومية واحدة لا تتجاوز 30 دقيقة.',
      'قناة تواصل مغلقة (تيليجرام أو واتساب) لتسليم المهام اليومية.',
      'جلسة مباشرة افتتاحية وجلسة ختامية للإجابة على الأسئلة.',
      'سعر تجريبي مخفض مقابل الالتزام اليومي بالتطبيق والملاحظات.',
    ];
    doNotBuildYet = [
      'نظام إدارة محتوى LMS ضخم.',
      'محاولة قبول 50 مشتركًا في أول دفعة تجريبية.',
      'وعود بمتابعة فردية على مدار الساعة دون سقف زمني.',
    ];
  } else if (formatEn.includes('assessment')) {
    mvpTypeAr = 'استبيان تقييمي رقمي مع تقرير تشخيصي فوري مخصص (Diagnostic Audit MVP)';
    buildNow = [
      '10 إلى 15 سؤالاً تشخيصيًا يقيس مكامن الخلل لدى العميل بدقة.',
      'مصفوفة تصنيف ترشد العميل إلى نتيجته وخطة علاجه.',
      'ملخص التوصيات والخطوة التالية المقترحة لحل الفجوة.',
      'آلية استلام البريد والنتيجة لجمع قائمة المهتمين.',
    ];
    doNotBuildYet = [
      'برمجة خوارزميات معقدة مخصصة قبل اختبار الأسئلة على نموذج بسيط.',
      'تقارير تفصيلية من 30 صفحة ترهق القارئ.',
    ];
  } else if (formatEn.includes('consulting')) {
    mvpTypeAr = 'حزمة استشارية مقننة مع عميلين أولين بنطاق عمل ومخرجات ثابتة (Charter Consulting Sprint)';
    buildNow = [
      'وثيقة من صفحة واحدة تحدد بدقة ما يدخل في الاستشارة وما يستثنى منها.',
      'استبيان جمع بيانات مسبق يعبئه العميل قبل الجلسة.',
      'جلسة تشخيصية مكثفة (60 دقيقة) تليها وثيقة المخرجات والحل.',
      'متابعة كتابية واحدة للتأكد من نجاح التطبيق.',
    ];
    doNotBuildYet = [
      'تقديم ساعات دعم غير محدودة عبر الرسائل أو الاتصالات.',
      'تخصيص حلول فريدة كليًا لكل عميل دون إطار عمل مشترك.',
    ];
  } else if (formatEn.includes('hybrid')) {
    mvpTypeAr = 'نظام أدوات مسجل مع جلسة مراجعة وملاحظات جماعية واحدة (Hybrid System + 1 Live Review)';
    buildNow = [
      'الأصل الرقمي الأساسي (القوالب أو الدليل أو الفيديو).',
      'تحديد موعد جلسة مراجعة وتغذية راجعة حية لمراجعة عمل المشتركين.',
      'نموذج استقبال أعمال المشتركين لمراجعتها قبل الجلسة.',
      'صفحة بيع واضحة تبين تاريخ الجلسة وسقف الحضور.',
    ];
    doNotBuildYet = [
      'وعود بمراجعة فردية خاصة لكل تفصيلة خارج موعد الجلسة المحددة.',
      'إنتاج وحدات كورس ضخمة قبل جلسة المراجعة الأولى.',
    ];
  }

  let rationaleAr = ai?.recommended_test_reason;
  if (!rationaleAr) {
    if (stageNum >= 4) {
      rationaleAr =
        'بما أنك تمتلك عملاء سابقين وأدلة دفع مثبتة، فالهدف من النسخة الأولية ليس اكتشاف وجود مشكلة، بل اختبار حزم القيمة في منتج قابل للتوسع والاستبقاء دون استنزاف وقتك الفردي.';
    } else if (stageNum <= 1) {
      rationaleAr =
        'الهدف من النسخة الأولية في هذه المرحلة ليس الربح أو الكمال الفني، بل الإجابة على السؤال الحاسم: هل هناك مشترون مستعدون للدفع الفعلي لحل هذه المشكلة بهذه المنهجية المحددة؟';
    } else {
      rationaleAr =
        'الهدف من النسخة الأولية هو تحويل إشارات الاهتمام أو قائمة الانتظار إلى التزامات مالية مؤكدة وتأكيد صدى العرض التجريبي قبل التوسع في الإنتاج.';
    }
  }

  return {
    titleAr: 'أقل نسخة قابلة للاختبار — Minimum Testable Product',
    mvpTypeAr,
    buildNow,
    doNotBuildYet,
    rationaleAr,
  };
}

function buildValidationSprint(
  answers: QuestionnaireAnswers,
  validationMaturity?: ValidationMaturityInfo,
  formatRecommendation?: ProductFormatInfo
): { sprintMode: SprintMode; sprintModeLabelAr: string; days: ValidationDay[] } {
  const stageNum = validationMaturity?.stageNumber ?? 0;
  const primaryEn = (formatRecommendation?.titleEn || '').toLowerCase();
  const isMembershipOrCommunity = primaryEn.includes('membership') || primaryEn.includes('community');

  // Mode 1: SCALE_READINESS_SPRINT (Stage 6 ONLY when explicit scale evidence exists)
  if (stageNum === 6) {
    return {
      sprintMode: 'SCALE_READINESS_SPRINT',
      sprintModeLabelAr: 'معسكر جاهزية التوسع (Scale Readiness Sprint)',
      days: [
        {
          dayNumber: 1,
          dayTitleAr: 'اليوم الأول: خريطة تدفق العملاء واختناقات التسليم',
          focusAr: 'تحديد النقطة التي سيتعطل عندها النظام لو تضاعف عدد المشتركين غدًا',
          actionItems: [
            'ارسم مسار العميل من لحظة الاكتشاف حتى اكتمال النتيجة.',
            'حدد الخطوة الوحيدة التي تعتمد على حضورك الذهني الفردي.',
            'احسب السقف العددي الأقصى للعملاء الحاليين قبل تدهور الجودة.',
          ],
          expectedOutputAr: 'وثيقة تحديد عنق الزجاجة التشغيلي (Operational Bottleneck).',
        },
        {
          dayNumber: 2,
          dayTitleAr: 'اليوم الثاني: توثيق إجراءات التشغيل القياسية (SOPs)',
          focusAr: 'تحويل المهام اليدوية المتكررة إلى خطوات يمكن تفويضها أو أتمتتها',
          actionItems: [
            'سجل فيديو شاشة مدته 10 دقائق لخطوة متكررة تقوم بها لكل عميل.',
            'اكتب قائمة تدقيق (Checklist) من 5 خطوات يمكن لمساعد تنفيذها.',
            'حدد برمجيات الربط (Zapier / Webhooks) الممكنة للتسليم التلقائي.',
          ],
          expectedOutputAr: 'أول 3 أدلة تشغيل معيارية (SOPs) للتسليم دون تدخلك.',
        },
        {
          dayNumber: 3,
          dayTitleAr: 'اليوم الثالث: تدقيق كفاءة قناة الاستقطاب (Acquisition Audit)',
          focusAr: 'فحص تكلفة استقطاب العميل وتوقع ثبات التدفق على مدار 90 يومًا',
          actionItems: [
            'راجع مصدر آخر 20 عميلاً دفعوا لك وتأكد من القناة الأكثر ربحية.',
            'احسب نسبة التحويل من مرحلة الاهتمام إلى الدفع الفعلي.',
            'حدد ما إذا كانت القناة تعتمد على النشر اليدوي أم أنها قابلة للأتمتة.',
          ],
          expectedOutputAr: 'تقرير كفاءة قناة الاستقطاب وجاهزيتها لضخ ميزانية إضافية.',
        },
        {
          dayNumber: 4,
          dayTitleAr: 'اليوم الرابع: اختبار سعة التسليم المجمعة (Batch Testing)',
          focusAr: 'تقديم الخدمة لمجموعة متزامنة بنفس المجهود الفردي المعتاد',
          actionItems: [
            'اجمع استفسارات ومراجعات العملاء في جلسة جماعية واحدة أسبوعيًا بدلاً من الردود المتفرقة.',
            'أنشئ نموذج استقبال موحد لطلبات الملاحظات يمنع الفوضى.',
            'قس الوقت المستغرق بعد تجميع المهام.',
          ],
          expectedOutputAr: 'توفير 40% من ساعات التسليم الأسبوعية عبر التجميع المنظم.',
        },
        {
          dayNumber: 5,
          dayTitleAr: 'اليوم الخامس: تثبيت هيكل الدعم وخدمة العملاء',
          focusAr: 'إبعاد صاحب الخبرة عن الرد على الأسئلة الإدارية والتقنية',
          actionItems: [
            'اكتب ملف إجابات للأسئلة الإدارية والتقنية الأكثر تكرارًا (10 أسئلة).',
            'حدد آلية توجيه المشتركين للمجتمع والزملاء لمساعدة بعضهم.',
            'أغلق رسائل التواصل المباشرة المشتتة واعتمد قناة دعم واحدة.',
          ],
          expectedOutputAr: 'بوابة دعم ذاتية متكاملة للمشتركين.',
        },
        {
          dayNumber: 6,
          dayTitleAr: 'اليوم السادس: اختبار زيادة السعة بنسبة 50%',
          focusAr: 'فتح مقاعد إضافية مشروطة لقياس استقرار النظام تحت الضغط',
          actionItems: [
            'اطرح دفعة جديدة بسعة أكبر بنسبة 50% عبر القناة المثبتة.',
            'راقب وقت الاستجابة ومستوى رضا المشتركين الجدد.',
            'رصد أي خلل في بوابات الدفع أو رسائل الترحيب التلقائية.',
          ],
          expectedOutputAr: 'بيانات ضغط واقعية تثبت متانة البنية التحتية.',
        },
        {
          dayNumber: 7,
          dayTitleAr: 'اليوم السابع: اعتماد نموذج التوسع المالي والتشغيلي',
          focusAr: 'اتخاذ قرار الاستثمار في الإعلانات أو فريق الدعم بناءً على الأرقام',
          actionItems: [
            'قارن هوامش الربح بعد خصم تكاليف الأدوات والمساعدين.',
            'ثبت وتيرة إطلاق الحملات الشهرية أو الربع سنوية.',
            'ضع خطة التوسع لـ 6 أشهر القادمة.',
          ],
          expectedOutputAr: 'خطة تشغيلية متكاملة لنمو المنتج دون التضحية بالوقت الشخصي.',
        },
      ],
    };
  }

  // Mode 2: RECURRING_MODEL_VALIDATION_SPRINT (Recurring Membership / Community with real recurring evidence)
  if (isMembershipOrCommunity && (stageNum >= 4 || answers.hasRecurringPaymentBehavior === 'recurring_monthly')) {
    return {
      sprintMode: 'RECURRING_MODEL_VALIDATION_SPRINT',
      sprintModeLabelAr: 'معسكر تحقق نموذج الاشتراكات والاستبقاء (Recurring Model Validation)',
      days: [
        {
          dayNumber: 1,
          dayTitleAr: 'اليوم الأول: فحص روتين الاستبقاء (Why Stay in Month 2 & 3?)',
          focusAr: 'تحديد السبب الحاسم الذي يجعل المشترك يجدد اشتراكه ولا يلغيه بعد 30 يومًا',
          actionItems: [
            'اكتب إجابة واضحة: إيه القيمة المتجددة شهريًا التي لا يمكن تحميلها في ملف واحد والرحيل؟',
            'حدد العادة الأسبوعية التي يمارسها العضو داخل العضوية (مراجعة، جلسة، تحديث سوقي).',
            'استبعد أي التزام بإنتاج محتوى مكثف يسبب لك الإرهاق.',
          ],
          expectedOutputAr: 'وثيقة محرك الاستبقاء (Retention Engine Definition).',
        },
        {
          dayNumber: 2,
          dayTitleAr: 'اليوم الثاني: استطلاع العملاء الحاليين حول احتياج المتابعة',
          focusAr: 'سؤال المشترين الذين دفعوا بالفعل عن الجزء الذي يحتاجون لاستمراره',
          actionItems: [
            'تواصل مع 3 إلى 5 عملاء دفعوا لك سابقًا في محادثة مباشرة سريعة.',
            'اسألهم: "إيه الجزء اللي تحب يفضل مستمر معاك شهريًا لحل المشاكل أولاً بأول؟".',
            'اختبر نقطة السعر الشهري المتوقعة مقابل القيمة.',
          ],
          expectedOutputAr: 'تغذية راجعة صريحة حول شكل العضوية وجاذبية الاشتراك الدوري.',
        },
        {
          dayNumber: 3,
          dayTitleAr: 'اليوم الثالث: تثبيت سقف الالتزام التشغيلي (Timebox Protection)',
          focusAr: 'حماية وقتك من استنزاف طلبات الأعضاء وتحديد مواعيد الدعم',
          actionItems: [
            'حدد جدولاً ثابتًا: مثلاً جلستان مباشرتان شهريًا وتحديث واحد للقوالب.',
            'ضع ميثاقًا يوضح أن الملاحظات تقدم داخل الجلسات الجماعية وليس عبر الرسائل الخاصة.',
            'احسب عدد الساعات الإجمالية المطلوبة شهريًا (يجب ألا تتجاوز 5–8 ساعات).',
          ],
          expectedOutputAr: 'ميثاق حدود التسليم للعضوية لحماية طاقتك.',
        },
        {
          dayNumber: 4,
          dayTitleAr: 'اليوم الرابع: صياغة عرض الأعضاء المؤسسين (Founding Cohort Offer)',
          focusAr: 'صياغة دعوة خاصة لأول 10 إلى 20 عضوًا بسعر تفضيلي دائم',
          actionItems: [
            'صغ رسالة حصرية: سعر مؤسس مخفض مدى الحياة مقابل المساهمة في بناء المجتمع.',
            'حدد سقفًا صارمًا للمقاعد (10 أعضاء فقط).',
            'جهّز صفحة دفع اشتراك شهري متكرر أو رابط سداد أولي.',
          ],
          expectedOutputAr: 'عرض دعوة الأعضاء المؤسسين جاهز للإرسال.',
        },
        {
          dayNumber: 5,
          dayTitleAr: 'اليوم الخامس: إرسال الدعوات المباشرة للمؤهلين',
          focusAr: 'مخاطبة العملاء المهتمين فرادى بدلاً من الإعلان العام المفتوح',
          actionItems: [
            'أرسل رسالة الدعوة لـ 15 شخصًا من عملائك أو من طلبوا متابعة مستمرة.',
            'أجب عن استفساراتهم ووضح ما يشتمل عليه الشهر الأول بالتحديد.',
            'سجل المشتركين الأوائل في قائمة الأعضاء المؤسسين.',
          ],
          expectedOutputAr: 'تأكيد انضمام أول 3 إلى 5 أعضاء مؤسسين بالدفع الفعلي.',
        },
        {
          dayNumber: 6,
          dayTitleAr: 'اليوم السادس: إعداد تجربة الانضمام للأسبوع الأول (Onboarding)',
          focusAr: 'ضمان شعور العضو بقيمة فورية في أول 48 ساعة لمنع الإلغاء المبكر',
          actionItems: [
            'جهّز رسالة ترحيبية فورية مع دليل استخدام العضوية في صفحة واحدة.',
            'وفّر أول أصل تطبيقي جاهز للاستخدام الفوري لسرعة الشعور بالإنجاز.',
            'أعلن موعد اللقاء التعريفي الأول أو الجلسة التشخيصية.',
          ],
          expectedOutputAr: 'مسار انضمام ترحيبي يرفع التفاعل ويثبت القيمة من اليوم الأول.',
        },
        {
          dayNumber: 7,
          dayTitleAr: 'اليوم السابع: إغلاق المقاعد وانطلاق الشهر الأول',
          focusAr: 'تقييم معدل التحويل وبدء جدول التسليم الشهري المنظم',
          actionItems: [
            'أغلق باب الانضمام التجريبي عند اكتمال المقاعد.',
            'وثق روتين الشهر الأول في تقويم ثابت مع المشتركين.',
            'ضع معيار قياس لنسبة الاستمرار والتجديد للشهر الثاني.',
          ],
          expectedOutputAr: 'انطلاق العضوية رسميًا وبدء دورة الاستبقاء الأولى.',
        },
      ],
    };
  }

  // Mode 3: DELIVERY_VALIDATION_SPRINT (Stage 5 - Repeatable Delivery proven, standardizing assets)
  if (stageNum === 5) {
    return {
      sprintMode: 'DELIVERY_VALIDATION_SPRINT',
      sprintModeLabelAr: 'معسكر تقنين وتوحيد التسليم (Delivery Standardization Sprint)',
      days: [
        {
          dayNumber: 1,
          dayTitleAr: 'اليوم الأول: تدقيق الخطوات المتكررة بين العملاء السابقين',
          focusAr: 'فرز ما يتكرر دائمًا عن ما يحتاج لتخصيص فردي',
          actionItems: [
            'راجع آخر 5 عملاء دفعوا لك واكتب الخطوات الـ 4 التي مر بها الجميع.',
            'حدد الأجزاء التي تشرحها بنفس الكلمات لكل عميل.',
            'حدد الجزء الفريد الذي لا يمكن حله إلا بتدخلك المباشر.',
          ],
          expectedOutputAr: 'مصفوفة التكرار: (80% قياسي موحد مقابل 20% مخصص).',
        },
        {
          dayNumber: 2,
          dayTitleAr: 'اليوم الثاني: تحويل الشرح المتكرر إلى أصل رقمي مسجل',
          focusAr: 'إنتاج أول أصل رقمي يستبدل جلسة تمهيدية كاملة',
          actionItems: [
            'سجل فيديو واحدًا مدته 20 دقيقة يشرح الإطار النظري الأساسي.',
            'صمم القالب أو ورقة العمل التي يعبئها العميل قبل مقابلتك.',
            'تأكد من أن الأصل يقدم نفس القيمة دون حضورك.',
          ],
          expectedOutputAr: 'أول أصل رقمي مسجل جاهز للاختبار مع العملاء.',
        },
        {
          dayNumber: 3,
          dayTitleAr: 'اليوم الثالث: اختبار الأصل مع عميلين حاليين',
          focusAr: 'قياس قدرة العميل على فهم الأصل وتطبيقه دون مساعدة',
          actionItems: [
            'أرسل القالب أو الفيديو لعميلين واطلب منهم تطبيقه.',
            'راقب: أين واجهوا صعوبة؟ ما الأسئلة التي طرحوها بعد المشاهدة؟',
            'عدل صياغة القالب لتوضيح النقاط المبهمة.',
          ],
          expectedOutputAr: 'تحسين الأصل بناءً على تجربة استخدام واقعية.',
        },
        {
          dayNumber: 4,
          dayTitleAr: 'اليوم الرابع: تقنين مخرجات التدخل البشري (Scoping)',
          focusAr: 'وضع سقف زمني ومخرجات ثابتة لجلسة المراجعة أو الفيدباك',
          actionItems: [
            'حدد بدقة: مراجعة واحدة مدتها 30 دقيقة مع وثيقة ملاحظات مكتوبة.',
            'استبعد أي وعود بتقديم دعم غير محدود عبر واتساب أو رسائل صوتية.',
            'اكتب نموذج التقرير النهائي الثابت لتسليمه في دقائق معدودة.',
          ],
          expectedOutputAr: 'نطاق عمل دقيق ومقنن للتسليم يضمن هوامش ربح عالية.',
        },
        {
          dayNumber: 5,
          dayTitleAr: 'اليوم الخامس: تسعير الحزمة المقننة وإعداد صفحة العرض',
          focusAr: 'ربط السعر بنتيجة التحول المضمونة بدلاً من عدد ساعات العمل',
          actionItems: [
            'ضع تسعيرًا يعكس قيمة النتيجة المكتملة.',
            'صغ وثيقة العرض في صفحة واحدة تلخص الخطوات والمخرجات.',
            'حدد موعد فتح الدفعة الجديدة بسقف محدد.',
          ],
          expectedOutputAr: 'عرض المنتج المقنن جاهز للطرح المباشر.',
        },
        {
          dayNumber: 6,
          dayTitleAr: 'اليوم السادس: بيع أول نسختين بالنموذج المقنن الجديد',
          focusAr: 'إثبات أن المشترين يقبلون الأصل المسجل مع جلسة المراجعة بنفس الرضا',
          actionItems: [
            'اطرح العرض على 5 مهتمين جدد وأكد تسليمهم بالهيكل المقنن.',
            'أغلق الحجز المسبق واستلم الدفعات.',
            'أدخلهم على المنصة وسلمهم الأصل الرقمي فورًا.',
          ],
          expectedOutputAr: 'تأكيد بيع أول حزم بالنموذج شبه المؤتمت الجديد.',
        },
        {
          dayNumber: 7,
          dayTitleAr: 'اليوم السابع: قياس وفر الوقت ومستوى رضا المشتري',
          focusAr: 'مقارنة ساعات العمل المبذولة في النموذج القديم مقابل الجديد',
          actionItems: [
            'احسب الساعات المستغرقة لكل عميل (يجب أن تقل بنسبة 60% على الأقل).',
            'احصل على تقييم العملاء لجودة التجربة.',
            'اعتمد نموذج المنتج الرقمي كعرضك الأساسي القادم.',
          ],
          expectedOutputAr: 'إثبات نجاح تقنين التسليم والجاهزية لإطلاق العرض لجمهور أوسع.',
        },
      ],
    };
  }

  // Mode 4: PAID_PILOT_LEARNING_SPRINT (Stage 4 - Has Paying Pilot / Deposits)
  if (stageNum === 4) {
    return {
      sprintMode: 'PAID_PILOT_LEARNING_SPRINT',
      sprintModeLabelAr: 'معسكر التعلم من الدفعات الأولى (Paid Pilot Learning Sprint)',
      days: [
        {
          dayNumber: 1,
          dayTitleAr: 'اليوم الأول: تدقيق دوافع المشترين الأوائل (Why Did They Pay?)',
          focusAr: 'اكتشاف السبب الدقيق الذي جعل العميل يخرج بطاقته البنكية ويدفع لك',
          actionItems: [
            'تواصل مع كل مشتري دفع لك واسأله: "إيه الكلمة أو اللحظة اللي خلتك تقرر تدفع؟".',
            'حدد النتيجة المحددة بدقة التي يتوقع استلامها في نهاية التجربة.',
            'سجل مفرداتهم الدقيقة لاستخدامها كعنوان رئيسي لصفحة البيع القادمة.',
          ],
          expectedOutputAr: 'تفريغ حقيقي لمحركات الشراء الفعلية من واقع مشترين حقيقيين.',
        },
        {
          dayNumber: 2,
          dayTitleAr: 'اليوم الثاني: قياس سرعة الوصول لأول نتيجة (Time-to-First-Value)',
          focusAr: 'تقليص الوقت بين استلام المنتج وأول شعور ملموس بالقيمة والإنجاز',
          actionItems: [
            'حدد: إيه أول مخرج يقدر العميل ينفذه في أول 24 إلى 48 ساعة؟',
            'احذف أي معلومات تمهيدية طويلة تؤخر وصوله لهذا المخرج.',
            'صمم خطوة بداية سريعة (Quick Win) تعزز ثقة العميل في قراره.',
          ],
          expectedOutputAr: 'مسار سريع يحقق أول نتيجة ملموسة للمشتري في أقل من يومين.',
        },
        {
          dayNumber: 3,
          dayTitleAr: 'اليوم الثالث: رصد نقاط الاحتكاك وأسئلة ما بعد الشراء',
          focusAr: 'اكتشاف أين يتوقف المشترون أو يطلبون توضيحًا إضافيًا',
          actionItems: [
            'سجل كل سؤال أو استفسار طرحه المشتركون الأوائل بعد بدء الاستخدام.',
            'حدد ما إذا كان التردد سببه غموض الخطوات أم صعوبة التطبيق الفني.',
            'أنشئ فيديو قصيرًا مدته 3 دقائق لمعالجة النقطة الأكثر تكرارًا.',
          ],
          expectedOutputAr: 'سجل نقاط الاحتكاك (Friction Log) وخطة معالجتها التلقائية.',
        },
        {
          dayNumber: 4,
          dayTitleAr: 'اليوم الرابع: فصل ما يمكن توحيده عما يتطلب تدخلك الشخصي',
          focusAr: 'تحديد حدود التوسع وحماية وقتك في النسخ القادمة',
          actionItems: [
            'افصل بدقة: ما هي الأسئلة التي يمكن الإجابة عنها بقالب أو روبريك ثابت؟',
            'ما هو التدخل الفردي الوحيد الذي برر السعر المدفوع؟',
            'حوّل الملاحظات المكررة إلى معايير تقييم ذاتي واضحة.',
          ],
          expectedOutputAr: 'خريطة أتمتة وتوحيد التسليم (Standardization Matrix).',
        },
        {
          dayNumber: 5,
          dayTitleAr: 'اليوم الخامس: استخلاص أول قصة نجاح موثقة (Case Study Capture)',
          focusAr: 'توثيق النتيجة الملموسة التي حققها أول من طبق الحل',
          actionItems: [
            'أجرِ محادثة قصيرة مع العميل الأكثر التزامًا وسجل النتيجة بالأرقام قبل وبعد.',
            'اطلب منه شهادة مكتوبة أو تسجيل صوتي يصف التحول والتجربة.',
            'صغ دراسة حالة قصيرة من 150 كلمة لاستخدامها كدليل إثبات اجتماعي.',
          ],
          expectedOutputAr: 'أول قصة نجاح موثقة جاهزة لدعم إطلاق الدفعة التالية.',
        },
        {
          dayNumber: 6,
          dayTitleAr: 'اليوم السادس: صقل العرض ورفع السعر للدفعة التالية',
          focusAr: 'تحديث هيكل التسعير والعرض بناءً على تجربة النسخة الأولية',
          actionItems: [
            'ارفع السعر بنسبة 20–50% بناءً على إثبات النتائج وإزالة نقاط الاحتكاك.',
            'صغ حزمة العرض المحدثة مع إضافة دراسة الحالة وأول الشهادات.',
            'حدد موعد فتح مقاعد الدفعة الثانية المحدودة.',
          ],
          expectedOutputAr: 'هيكل عرض وتسعير مطور جاهز لطرح الدفعة الموسعة.',
        },
        {
          dayNumber: 7,
          dayTitleAr: 'اليوم السابع: قرار بناء المنتج الكامل أو فتح دفعة ثانية',
          focusAr: 'اتخاذ قرار استثماري استراتيجي مبني على بيانات التجربة الأولى',
          actionItems: [
            'إذا حقق 80% من المشتركين النتيجة: ابدأ تسجيل وتحويل المواد لمنتج شبه مؤتمت.',
            'إذا احتاجت النتيجة لتعديلات: نفذ دفعة ثانية مصغرة للتأكد من سلاسة المسار.',
            'ثبت تاريخ الإطلاق القادم.',
          ],
          expectedOutputAr: 'قرار استراتيجي نهائي يحدد الخطوة التالية بدقة وثقة.',
        },
      ],
    };
  }

  // Mode 5: OFFER_VALIDATION_SPRINT (Stage 2 & 3 - Interest or Commitment Signals)
  if (stageNum === 2 || stageNum === 3) {
    return {
      sprintMode: 'OFFER_VALIDATION_SPRINT',
      sprintModeLabelAr: 'معسكر التحقق من صدى العرض والالتزام المالي (Offer Validation Sprint)',
      days: [
        {
          dayNumber: 1,
          dayTitleAr: 'اليوم الأول: فرز قائمة المهتمين وتحديد الفئة الأكثر جاهزية',
          focusAr: 'تصفية المشترين المحتملين الأكثر إلحاحًا من بين من سجلوا أو تفاعلوا',
          actionItems: [
            'راجع قائمة المسجلين في قائمة الانتظار أو من راسلوك بالرسائل الخاصة.',
            'صنفهم حسب درجة الحاجة وجاهزيتهم لتطبيق الحل فورًا.',
            'حدد 10 أشخاص محددين للتواصل المباشر معهم هذا الأسبوع.',
          ],
          expectedOutputAr: 'قائمة بأول 10 مرشحين ذوي أولوية للتواصل التجريبي.',
        },
        {
          dayNumber: 2,
          dayTitleAr: 'اليوم الثاني: صياغة شروط النسخة التجريبية (Pilot Conditions)',
          focusAr: 'تحديد تفاصيل النسخة المصغرة والسعر التشجيعي مقابل الملاحظات',
          actionItems: [
            'حدد تاريخ البدء ومدة التجربة والشكل الدقيق للتسليم.',
            'حدد سعرًا أوليًا تشجيعيًا يضمن الجدية ولا يشكل عائقًا ماليًا.',
            'جهّز صفحة بسيطة أو رسالة واضحة تلخص التحول والخطوات.',
          ],
          expectedOutputAr: 'هيكل متكامل للنسخة التجريبية جاهز للطرح المباشر.',
        },
        {
          dayNumber: 3,
          dayTitleAr: 'اليوم الثالث: محادثات التثبيت الفردية عبر الرسائل',
          focusAr: 'إجراء محادثات فردية مع المرشحين العشرة لمعرفة جاهزيتهم',
          actionItems: [
            'تواصل مع كل مرشح واسأله: "هل المشكلة دي لسه قائمة عندك حاليًا؟".',
            'اشرح لهم أنك تجهز دفعة تجريبية مغلقة لعدد محدود جداً لحل هذا التحدي.',
            'سجل أسئلتهم واعتراضاتهم بدقة واستخدمها في توضيح العرض.',
          ],
          expectedOutputAr: 'فرز 5 إلى 7 أشخاص أبدوا رغبة قاطعة في الانضمام.',
        },
        {
          dayNumber: 4,
          dayTitleAr: 'اليوم الرابع: معالجة الاعتراضات وتأكيد الموعد النهائي',
          focusAr: 'إزالة الغموض حول طريقة التسليم وضمان التزام المشتركين بالوقت',
          actionItems: [
            'أرسل توضيحًا لأي سؤال تكرر حول الوقت المطلوب من المشترك أسبوعيًا.',
            'أكّد على موعد انطلاق الدفعة وموعد إغلاق باب الانضمام التجريبي.',
            'جهّز رابط الدفع المباشر أو وسيلة استلام الحجز المسبق.',
          ],
          expectedOutputAr: 'وضوح تام لدى المشتركين المحتملين ورابط دفع جاهز.',
        },
        {
          dayNumber: 5,
          dayTitleAr: 'اليوم الخامس: فتح رابط الحجز المبكر بسعر الإطلاق التجريبي',
          focusAr: 'طلب الالتزام المالي الفعلي من المهتمين المؤكدين',
          actionItems: [
            'أرسل رابط الدفع للمرشحين الذين أكدوا رغبتهم في اليوم الثالث.',
            'راقب معدل التحويل وأكد استلام كل اشتراك شخصيًا برسالة ترحيب.',
            'تابع باحترافية مع من تأخروا للتأكد إن كانت هناك مشكلة تقنية في الدفع.',
          ],
          expectedOutputAr: 'استلام أول دفعات حقيقية مؤكدة للنسخة التجريبية.',
        },
        {
          dayNumber: 6,
          dayTitleAr: 'اليوم السادس: استكمال المقاعد المحدودة للدفعة التجريبية',
          focusAr: 'التواصل مع الشريحة التالية لملء المقاعد المتبقية إن وجدت',
          actionItems: [
            'أعلن للمهتمين المتبقين أن هناك مقعدين فقط متاحين قبل إغلاق التسجيل.',
            'أجب عن أي استفسار أخير وأغلق التسجيل بمجرد وصولك للهدف (5 إلى 10 مشتركين).',
            'أرسل للمشتركين استبيانًا قصيرًا حول مستواهم الحالي قبل الانطلاق.',
          ],
          expectedOutputAr: 'اكتمال مقاعد الدفعة الأولى وتأكيد التزام الجميع.',
        },
        {
          dayNumber: 7,
          dayTitleAr: 'اليوم السابع: قرار الانتقال للتنفيذ وتسليم التجربة',
          focusAr: 'تقييم نتائج الحجز وتحديد خطة إعداد محتوى التجربة',
          actionItems: [
            'إذا اكتمل الهدف التجريبي: ابدأ إعداد مواد الأسبوع الأول وافتح القناة المغلقة.',
            'إذا كان التحويل أقل من 3 مشتركين: راجع السعر أو طريقة صياغة النتيجة.',
            'وثق تاريخ تسليم أول أصل للمشتركين لبدء الرحلة بنجاح.',
          ],
          expectedOutputAr: 'إعلان بدء النسخة التجريبية رسميًا وبدء التسليم الميداني.',
        },
      ],
    };
  }

  // Mode 6: DISCOVERY_SPRINT (Stage 0 & 1 - Pure Assumption or Problem Evidence)
  const hasAudience = answers.audienceAccessLevel === 'direct_daily' || answers.audienceAccessLevel === 'occasional';
  const day3Tasks = hasAudience
    ? [
        'اطرح سؤالاً تفاعليًا (Poll أو Story أو منشور مفتوح) يصف سيناريو المشكلة بوضوح.',
        'انقل الراغبين في النقاش إلى الرسائل المباشرة لإجراء 3 إلى 5 محادثات فردية غير بيعية.',
        'سجل الكلمات الدقيقة التي يكررها الجمهور للتعبير عن معاناتهم.',
      ]
    : [
        'حدد 3 تجمعات أو مجموعات مهنية يتواجد فيها جمهورك المستهدف بصورة يومية.',
        'ابحث عن منشورات ونقاشات سابقة يسأل فيها الأعضاء عن حل هذه المشكلة بالتحديد.',
        'تواصل بأسلوب مهني مع 3 إلى 5 أشخاص لطلب رأيهم حول تحدياتهم الحالية دون محاولة بيع أي شيء.',
      ];

  return {
    sprintMode: 'DISCOVERY_SPRINT',
    sprintModeLabelAr: 'معسكر اكتشاف الألم والسلوك الواقعي (Customer Discovery Sprint)',
    days: [
      {
        dayNumber: 1,
        dayTitleAr: 'اليوم الأول: تحرير الفرضية الأساسية واستبعاد التخمين',
        focusAr: 'تحديد المشتري الدقيق والمشكلة الحرجة على الورق دون تجميل',
        actionItems: [
          'اكتب جملة واحدة تحدد المشتري بدقة وتستبعد الفئات غير المستهدفة.',
          'حدد التكلفة الحقيقية لعدم حل المشكلة (بالمال، الساعات، أو الإجهاد).',
          'حدد الافتراض الخطر الوحيد الذي لو سقط تسقط معه جدوى المنتج.',
        ],
        expectedOutputAr: 'ملف فرضية من صفحة واحدة يحدد العميل والنتيجة والافتراض الأكبر.',
      },
      {
        dayNumber: 2,
        dayTitleAr: 'اليوم الثاني: تجهيز أسئلة الاكتشاف السلوكية',
        focusAr: 'إعداد أسئلة تركز على السلوك الماضي بدلاً من الآراء المجاملة',
        actionItems: [
          'جهّز 5 إلى 7 أسئلة اكتشاف تبدأ بـ "إيه اللي حصل آخر مرة..." و "بتتعامل إزاي دلوقتي مع...".',
          'تجنب تمامًا سؤال "هل تحب تشتري كورس كذا؟" لأن إجابته المجاملة مضللة.',
          'حدد القناة الأنسب للوصول للمستهدفين (رسائل خاصة، مكالمات، لقاءات).',
        ],
        expectedOutputAr: 'قائمة أسئلة جاهزة للرصد والاستماع.',
      },
      {
        dayNumber: 3,
        dayTitleAr: 'اليوم الثالث: محادثات الاكتشاف الواقعية مع المستهدفين',
        focusAr: 'التحدث مع 5 على الأقل من الشريحة المستهدفة وتسجيل سلوكهم الحقيقي',
        actionItems: day3Tasks,
        expectedOutputAr: 'ملاحظات تفريغ مكتوبة تحتوي لغة العميل الحقيقية ومحاولاته السابقة.',
      },
      {
        dayNumber: 4,
        dayTitleAr: 'اليوم الرابع: تحليل الأنماط والاعتراضات المتكررة',
        focusAr: 'تصفية البيانات لاكتشاف ما إذا كانت المشكلة مؤلمة حقًا للجميع',
        actionItems: [
          'هل تكررت نفس الشكوى بين أكثر من شخص وبنفس الحدة؟',
          'ما هي البدائل التي حاولوا تطبيقها ولماذا فشلت أو لم ترضهم؟',
          'ما هو السعر أو المقابل التقريبي الذي يبدو منطقيًا بناءً على خسارتهم؟',
        ],
        expectedOutputAr: 'جدول مقارنة بين افتراضاتك المبدئية وحقائق كلام العملاء.',
      },
      {
        dayNumber: 5,
        dayTitleAr: 'اليوم الخامس: صياغة العرض المصغر (Minimum Testable Offer)',
        focusAr: 'تحويل النتيجة إلى عرض مبكر جذاب ومحدد المعالم',
        actionItems: [
          'صغ رسالة عرض تلخص: المشكلة، الحل، شكل التسليم، وما لا يحتويه المنتج.',
          'حدد سعرًا أوليًا تشجيعيًا للأولين مقابل تقديم ملاحظات صريحة.',
          'حدد سقفًا لعدد المنضمين الأوائل لرفع جودة التجربة.',
        ],
        expectedOutputAr: 'مسودة رسالة عرض أولي من 200 إلى 300 كلمة جاهزة للعرض.',
      },
      {
        dayNumber: 6,
        dayTitleAr: 'اليوم السادس: طرح العرض على المجموعة المؤهلة',
        focusAr: 'مواجهة السوق الحقيقية وطلب التزام مؤكد (دفع مبكر أو حجز مؤكد)',
        actionItems: [
          'تواصل شخصيًا مع الأشخاص الذين أبدوا اهتمامًا جادًا في محادثات اليوم الثالث.',
          'اعرض عليهم العرض الأولي والمقاعد المحدودة للنسخة التجريبية.',
          'راقب: هل يترددون بسبب السعر، أم بسبب عدم وضوح النتيجة، أم لعدم إلحاح المشكلة؟',
        ],
        expectedOutputAr: 'تسجيل الردود الفعلية وعدد الراغبين الجادين في الدفع.',
      },
      {
        dayNumber: 7,
        dayTitleAr: 'اليوم السابع: قرار الاستمرار / التعديل / التوقف (Stop / Go Decision)',
        focusAr: 'اتخاذ قرار مبني على الوقائع والأدلة بعيدًا عن العاطفة',
        actionItems: [
          'قارن النتائج بمعايير Stop/Go المحددة في التقرير.',
          'إذا حصلت على التزامات جادة تغطي هدفك التجريبي: ابدأ بناء النسخة الأولية فورًا.',
          'إذا كانت الردود "فكرة حلوة بس مش محتاجها دلوقتي": أعد صياغة العرض أو المشكلة.',
        ],
        expectedOutputAr: 'قرار تنفيذي نهائي موثق بالخطوة القادمة للأسبوع التالي.',
      },
    ],
  };
}

function buildDiscoveryQuestions(answers: QuestionnaireAnswers): DiscoveryQuestion[] {
  const problem = (answers.coreProblemDescription || '').slice(0, 35) || 'هذا التحدي';

  return [
    {
      id: 1,
      questionAr: `إيه اللي حصل آخر مرة واجهتك فيها مشكلة ${problem}؟ وتصرفت إزاي وقتها؟`,
      objectiveAr: 'رصد سلوك حقيقي ماضٍ بدلاً من تخيلات مستقبلية.',
      whatToListenForAr: 'ابحث عن تفاصيل موقف واقعي، وليس كلامًا عامًا ونظريًا.',
    },
    {
      id: 2,
      questionAr: 'جربت أدوات أو كورسات أو حلول تانية للموضوع ده قبل كده؟ وإيه اللي عجبك أو معجبكش فيها؟',
      objectiveAr: 'معرفة البدائل الحالية التي يقارنك بها العميل وتكلفتها في ذهنه.',
      whatToListenForAr: 'هل دفع مالاً بالفعل من قبل؟ أم اكتفى بمحتوى مجاني سطحي؟',
    },
    {
      id: 3,
      questionAr: 'إيه أكتر جزء محبط أو بياخد منك وقت طويل في التعامل مع التحدي ده تحديدًا؟',
      objectiveAr: 'تحديد عنق الزجاجة (Bottleneck) الأكثر ألمًا لاستخدامه كعرض القيمة الأساسي.',
      whatToListenForAr: 'الكلمات العاطفية والمشاعر الحقيقية: "إحباط"، "تضييع ساعات"، "خوف من الخطأ".',
    },
    {
      id: 4,
      questionAr: 'لو ملقيتش حل للمشكلة دي وفضلت زي ما هي للشهر الجاي، إيه أسوأ سيناريو هيحصل؟',
      objectiveAr: 'قياس تكلفة عدم الحل (Cost of Inaction) وحجم الإلحاح.',
      whatToListenForAr: 'هل هناك خسارة حقيقية؟ لو كانت الإجابة "عادي مش هيحصل حاجة"، فالطلب ضعيف.',
    },
    {
      id: 5,
      questionAr: 'إزاي بتعرف أو بتقيس إن المشكلة دي اتحلت فعلاً بنجاح عندك؟',
      objectiveAr: 'استخراج معيار النجاح الدقيق من منظور العميل وليس من منظورك الشخصي.',
      whatToListenForAr: 'أرقام ملموسة، توفير ساعات، هدوء ذهني، أو الوصول لهدف محدد.',
    },
    {
      id: 6,
      questionAr: 'لو حد عرض عليك طريقة تحل ده في خطوات محددة، إيه أكتر حاجة هتخليك تشك أو تتردد في تطبيقها؟',
      objectiveAr: 'كشف الاعتراضات المسبقة ومخاوف الثقة قبل أن يطرحها في مرحلة البيع.',
      whatToListenForAr: 'الخوف من التعقيد، الخوف من عدم الملاءمة لظروفه الخاصة، أو الشك في الكفاءة.',
    },
    {
      id: 7,
      questionAr: 'فين أكتر مكان أو منصة بتلجأ لها لما تلاقي نفسك واقف في النقطة دي ومش عارف تكمل؟',
      objectiveAr: 'اكتشاف قنوات التوزيع والبحث الطبيعية للعميل دون الحاجة لتخمينها.',
      whatToListenForAr: 'مجموعات محددة، حسابات معينة، بحث جوجل، أو سؤال زملاء مقربين.',
    },
  ];
}

function buildStopGoRules(answers: QuestionnaireAnswers, demandScore: number): StopGoRules {
  // Personalized target based on expected price tier
  const targetCommitments =
    answers.expectedPriceTier === 'premium_500_plus'
      ? '2 إلى 3 التزامات جادة'
      : answers.expectedPriceTier === 'mid_150_500'
      ? '3 إلى 5 التزامات جادة'
      : '5 إلى 10 التزامات جادة أو حجوزات مسبقة';

  return {
    continueIf: [
      `تحقيق هدف الاختبار الأولي (${targetCommitments}) من الشريحة المستهدفة قبل بدء الإنتاج الكامل.`,
      'أظهر العملاء سلوكًا سابقًا في محاولة حل المشكلة (دفعوا أموالاً، جربوا أدوات، أو قضوا ساعات في البحث).',
      'حصلت على التزام ملموس (طلب حجز مبكر، دفعة جزئية، أو إيميل للانضمام للنسخة التجريبية الأولى).',
      'النتيجة المطلوبة تتطابق مع خبرتك وقدرتك على تسليمها دون تعقيد تشغيلي غير محسوب.',
    ],
    refineIf: [
      'الناس تشتكي من المشكلة لكنها لا تعتبرها أولوية ملحة تستحق الدفع حاليًا (يحتاج ربط المشكلة بعائد مالي أو زمني مباشر).',
      'الشريحة المستهدفة تبدو واسعة جدًا وردودهم متضاربة حول أولوياتهم (يحتاج تضييق الجمهور لفئة محددة للغاية).',
      'الجمهور يفضل استشارة فردية ويرفض التعلم الذاتي (يحتاج تعديل شكل المنتج ليصبح ورشة عمل أو جلسة جماعية مقننة).',
    ],
    stopOrPivotIf: [
      'أغلب الذين تحدثت معهم اعتبروا المشكلة بسيطة ويمكن التعايش معها بدون حل مخصص.',
      'الجمهور يكتفي تمامًا بالمحتوى المجاني ولا يرى ميزة في دفع مقابل.',
      'الوصول للشريحة المستهدفة يتطلب تكلفة استقطاب إعلاني تفوق العائد المتوقع من المنتج.',
      'تسليم النتيجة يستنزف كل وقتك الشخصي ويحول المنتج إلى وظيفة مرهقة بدون هامش ربحي حقيقي.',
    ],
  };
}

function buildWhatNotToDo(
  answers: QuestionnaireAnswers,
  primaryFormat: ProductFormatInfo,
  secondaryFormat?: ProductFormatInfo,
  validationMaturity?: ValidationMaturityInfo,
  ai?: AiStrategicInterpretation | null
): WhatNotToDoItem[] {
  const items: WhatNotToDoItem[] = [];
  const stageNum = validationMaturity?.stageNumber ?? 0;
  const primaryEn = (primaryFormat.titleEn || '').toLowerCase();
  const secondaryEn = (secondaryFormat?.titleEn || '').toLowerCase();
  const isMembershipRecommended =
    primaryEn.includes('membership') ||
    primaryEn.includes('community') ||
    secondaryEn.includes('membership') ||
    secondaryEn.includes('community');

  if (ai?.what_not_to_do) {
    items.push({
      headlineAr: ai.what_not_to_do,
      rationaleAr: 'تنبيه استراتيجي مخصص موجه لحالتك الحالية بناءً على قراءة معطياتك.',
    });
  }

  // Delivery contradiction warning
  const wantsScaleForWarn =
    answers.creatorTimePerCustomer === 'almost_none' || answers.creatorTimePerCustomer === 'under_30m';
  const mechListForWarn = answers.deliveryMechanism || [];
  const highInterventionForWarn =
    answers.requiresPersonalFeedback === true ||
    answers.requiresOneOnOneAccountability === true ||
    mechListForWarn.includes('critique_feedback') ||
    mechListForWarn.includes('accountability') ||
    mechListForWarn.includes('live_coaching');

  if (wantsScaleForWarn && highInterventionForWarn) {
    items.push({
      headlineAr: 'متسوقش للمنتج كـ "تعلم ذاتي أوتوماتيكي" وأنت واعد بمراجعة ومتابعة شخصية',
      rationaleAr:
        'الجمع بين الرغبة في منتج أوتوماتيكي متوسع دون استهلاك وقت، ووعد المشتركين بملاحظات وفيدباك شخصي هو فخ تشغيلي. حدد بوضوح إما تسعير عالي يغطي ساعاتك أو تبسيط آلية التسليم لتصبح ذاتية التعلم بالكامل.',
    });
  }

  // Membership Warnings (Only contextual, never universal)
  if (isMembershipRecommended) {
    items.push({
      headlineAr: 'متفتحش باب الاشتراك للعامة قبل تأكيد استبقاء أول 10 أعضاء مؤسسين',
      rationaleAr:
        'في نموذج العضويات، الاستبقاء (Retention) أهم من الاستقطاب الأولي. ابدأ بمجموعة صغيرة تجريبية وتأكد من أنهم يستفيدون ويستمرون للشهر التالي قبل إنفاق الجهد في التسويق للجميع.',
    });
    items.push({
      headlineAr: 'متغرقش نفسك في التزام محتوى يومي لا يمكنك الاستمرار فيه لـ 12 شهرًا',
      rationaleAr:
        'قيمة العضوية الحقيقية تكمن في وضوح المسار وجلسات المتابعة وحل المشكلات المتكررة، وليس في تحويل نفسك لآلة نشر محتوى تصاب بالإرهاق بعد شهرين.',
    });
  } else {
    // Discourage membership if it's NOT recommended and lacks recurring foundations or has repeat consulting without subscription demand
    const lacksRecurringNeed = answers.problemFrequency === 'occasional' || answers.problemFrequency === 'unsure';
    const lacksAudienceAccess = answers.audienceAccessLevel === 'none_yet' || answers.audienceAccessLevel === 'unsure';
    const hasRepeatPurchasesWithoutSub = answers.hasRecurringPaymentBehavior === 'repeat_buyers_no_sub';
    const lacksRecurringDemand =
      answers.hasRecurringPaymentBehavior !== 'recurring_monthly' &&
      answers.explicitRecurringRequestReceived !== true &&
      answers.explicitRecurringRequestReceived !== 'yes';

    if (hasRepeatPurchasesWithoutSub && lacksRecurringDemand) {
      items.push({
        headlineAr: 'متفترضش إن تكرار شراء الاستشارات يعني رغبة في اشتراك شهري',
        rationaleAr:
          'شراء العميل لاستشارة أو خدمة عدة مرات يعكس ثقة شخصية، ولا يعني رغبته في دفع اشتراك دوري ثابت. ابدأ بحزم خبرتك في منتج مقنن محدد النتيجة بدفعة واحدة أولاً.',
      });
    } else if (lacksRecurringNeed || lacksAudienceAccess || lacksRecurringDemand) {
      items.push({
        headlineAr: 'متتجهش لنظام اشتراكات شهرية (Membership) دون حاجة متجددة واستبقاء مثبت',
        rationaleAr:
          'العضويات تحتاج مشكلة تتكرر باستمرار وسببًا قويًا لتجديد الاشتراك كل 30 يومًا. المنتجات محددة النتيجة بدفعة واحدة أسهل في التحقق والبيع لهذه الحالة.',
      });
    }
  }

  // Full course warnings (Only if Full Course is NOT primary)
  if (!primaryEn.includes('full course')) {
    items.push({
      headlineAr: 'متسجلش 30 فيديو للكورس قبل ما تبيع أول نسخة',
      rationaleAr:
        'قضاء شهرين في إعداد وتصوير فيديوهات كورس كامل قبل التأكد من زاوية العرض ورغبة الجمهور هو مخاطرة كلاسيكية تقتل طاقة صانع المحتوى. اختبر النسخة المصغرة أو الورشة أولاً.',
    });
  }

  // Stage-based warnings
  if (stageNum >= 4) {
    items.push({
      headlineAr: 'متفضلش محبوس في تقديم الخدمة الفردية اليدوية (1-on-1) دون تقنين خطواتك في أصول',
      rationaleAr:
        'وجود عملاء يدفعون بالفعل يعني أن منهجيتك ناجحة؛ تأجيل تحويلها لمنتج مستقل أو عضوية يبقيك مستبدلاً للوقت بالمال ويحد من نموك.',
    });
  } else if (answers.audienceAccessLevel === 'none_yet') {
    items.push({
      headlineAr: 'متصرفش ميزانية على إعلانات مدفوعة (Ads) في مرحلة الفكرة',
      rationaleAr:
        'الإعلانات تضخم ما هو موجود: إذا كان العرض غير مؤكد والرسالة غير مجربة، فالإعلانات ستحرق ميزانيتك دون مبيعات. اعتمد على المحادثات الفردية والوصول العضوي أولاً.',
    });
  } else {
    items.push({
      headlineAr: 'متحطش 8 مكافآت وبونصات عشوائية عشان تغطي على ضعف العرض',
      rationaleAr:
        'المشتري الواعي يدفع مقابل البساطة والسرعة في حل المشكلة. حشو المنتج بملفات ومكافآت إضافية يعطي انطباعًا بالتعقيد وصعوبة الإنجاز بدلاً من القيمة.',
    });
  }

  // Consistency Check: Ensure no warning directly contradicts the recommended primary format
  const sanitized = items.filter((item) => {
    if (primaryEn.includes('workshop') && item.headlineAr.includes('ورشة')) return false;
    if (primaryEn.includes('membership') && (item.headlineAr.includes('متتجهش لنظام اشتراكات') || item.headlineAr.includes('متفترضش إن تكرار شراء الاستشارات'))) return false;
    if (primaryEn.includes('toolkit') && item.headlineAr.includes('قوالب')) return false;
    if (primaryEn.includes('consulting') && (item.headlineAr.includes('استشارة') || item.headlineAr.includes('الخدمة الفردية'))) return false;
    return true;
  });

  return sanitized.slice(0, 3);
}

function buildMissingData(
  answers: QuestionnaireAnswers,
  demandScore: number,
  ai?: AiStrategicInterpretation | null
): MissingDataItem[] {
  const items: MissingDataItem[] = [];

  if (ai?.evidence_gap) {
    items.push({
      fieldAr: 'فجوة الأدلة الحرجة المحددة',
      importanceAr: ai.evidence_gap,
      howToGatherAr: ai.recommended_test || 'إجراء محادثات استكشافية مباشرة مع 5 من الشريحة المستهدفة.',
    });
  }

  // Requirement #3: Highlight lack of proprietary framework
  if (answers.uniqueMethodType === 'general_skills_only' || !answers.uniqueMethodOrProcess || answers.uniqueMethodType === 'developing_now') {
    items.push({
      fieldAr: 'إطار العمل أو المنهجية الخاصة (Proprietary Framework)',
      importanceAr: 'الاعتماد على المهارات العامة فقط يجعلك قابلاً للاستبدال بمنافسين؛ صياغة خطواتك في إطار عمل محدد يرفع رغبة الشراء ويمنحك تمايزًا تسويقيًا وسلطة إقناع.',
      howToGatherAr: 'وثق الخطوات الـ 3 إلى 5 التي تتبعها في عملك العملي لحل المشكلة، وأعطِ كل مرحلة اسمًا واضحًا يركز على النتيجة الملموسة.',
    });
  }

  if (demandScore <= 45) {
    items.push({
      fieldAr: 'دليل الاستعداد الفعلي للدفع (Willingness-to-Pay Signal)',
      importanceAr: 'الفرق بين الإعجاب المجاني ببوست وبين دفع مقابل مالي هو الجدار الفاصل بين الفكرة الناجحة والمضيعة للوقت.',
      howToGatherAr: 'اطرح عرض النسخة التجريبية (Early Pilot) بسعر مخفض واطلب التزامًا ماليًا من أول مشترين.',
    });
  }

  items.push({
    fieldAr: 'اللغة الحقيقية للعميل في التعبير عن الألم (Buyer Exact Verbatim)',
    importanceAr: 'الكتابة التسويقية لا تُخترع بل تُستخلص من كلام العملاء الحقيقيين. معرفة مفرداتهم الدقيقة ترفع جودة الرسالة.',
    howToGatherAr: 'سجل محادثات الاكتشاف واقتبس عباراتهم التي يصفون بها أزمتهم كلمة بكلمة.',
  });

  items.push({
    fieldAr: 'أقرب بديل متاح وتكلفته الحالية على العميل (Current Alternative Cost)',
    importanceAr: 'العميل لا يقارن منتجك بالفراغ، بل يقارنه ببديل مجاني أو أداة يستخدمها الآن.',
    howToGatherAr: 'اسأل المستهدفين مباشرة: "إنت بتتعامل إزاي دلوقتي مع المشكلة دي؟ وبتصرف عليها وقت أو فلوس قد إيه؟".',
  });

  return items;
}

function buildNextThreeQuestions(
  answers: QuestionnaireAnswers,
  validationMaturity?: ValidationMaturityInfo,
  formatRecommendation?: ProductFormatInfo,
  ai?: AiStrategicInterpretation | null
): string[] {
  const stageNum = validationMaturity?.stageNumber ?? 0;
  const primaryEn = (formatRecommendation?.titleEn || '').toLowerCase();
  const isMembership = primaryEn.includes('membership') || primaryEn.includes('community');
  const demandList = (answers.demandEvidenceList || []) as string[];

  // Define uncertainty bank
  const uncertainties: { category: string; priority: number; question: string }[] = [];

  // 1. BUYER_CLARITY
  if (answers.isBuyerBroadOrSpecific === 'broad_general' || !answers.targetBuyerDescription) {
    uncertainties.push({
      category: 'BUYER_CLARITY',
      priority: 95,
      question: `مين أول 5 إلى 10 أشخاص بالاسم في شبكتك أو جمهورك يمثلون الشريحة المستهدفة (${(answers.targetBuyerDescription || '').slice(0, 30)}) وتقدر تكلمهم هذا الأسبوع؟`,
    });
  }

  // 2. DEMAND & WILLINGNESS TO PAY
  if (stageNum <= 1) {
    uncertainties.push({
      category: 'DEMAND',
      priority: 90,
      question: 'إيه أكبر بديل أو حيلة مؤقتة بيستخدموها دلوقتي للتعامل مع المشكلة، وتكلفتها عليهم قد إيه؟',
    });
  }

  // 3. PAID PILOT UNCERTAINTIES (For Stage 4)
  if (stageNum === 4) {
    uncertainties.push({
      category: 'PAID_PILOT_WHY_PAID',
      priority: 92,
      question: 'ليه المشترون الأوائل قرروا يدفعوا بالتحديد؟ وإيه النتيجة الدقيقة اللي مستنيين استلامها؟',
    });
    uncertainties.push({
      category: 'DELIVERY_STANDARDIZATION',
      priority: 88,
      question: 'أي جزء في تسليم الحل احتاج تخصيصًا فرديًا منك، وأي جزء تكرر ويمكن تحويله لقالب ثابت؟',
    });
    uncertainties.push({
      category: 'TIME_TO_FIRST_VALUE',
      priority: 85,
      question: 'كام ساعة أو يوم استغرقها المشتري للوصول لأول نتيجة ملموسة بعد الشراء؟',
    });
  }

  // 4. RECURRING VALUE & RETENTION (For Membership / Recurring models)
  if (isMembership || answers.hasRecurringPaymentBehavior === 'recurring_monthly') {
    uncertainties.push({
      category: 'RECURRING_VALUE',
      priority: 94,
      question: 'ليه المشتري هيجدد اشتراكه في الشهر التاني والتالت بدل ما يكتفي بتحميل الملفات في الشهر الأول والرحيل؟',
    });
    uncertainties.push({
      category: 'RETENTION_WORKLOAD',
      priority: 86,
      question: 'إيه العبء الأسبوعي الواقعي اللي هيتطلبه وجود 20 إلى 50 عضوًا نشطًا دون أن يلتهم وقتك الشخصي؟',
    });
  }

  // 5. PERSONALIZATION DEPENDENCY & FEEDBACK CONFLICT
  const wantsScale = answers.creatorTimePerCustomer === 'almost_none' || answers.creatorTimePerCustomer === 'under_30m';
  const needsFeedback = answers.requiresPersonalFeedback === true || answers.personalFeedbackState === 'required';
  if (wantsScale && needsFeedback) {
    uncertainties.push({
      category: 'PERSONALIZATION_DEPENDENCY',
      priority: 93,
      question: 'إيه نوع الفيدباك اللي لازم يخرج منك أنت شخصيًا، وإيه اللي ممكن يتحول لمعايير تصحيح ذاتية أو مراجعة جماعية؟',
    });
    uncertainties.push({
      category: 'PRICING_SUPPORT',
      priority: 87,
      question: 'هل السعر المقترح يغطي تكلفة ساعات المراجعة البشرية، أم تحتاج لتبسيط النموذج ليصبح ذاتي الاستهلاك بالكامل؟',
    });
  }

  // 6. DIFFERENTIATION & METHODOLOGY
  if (answers.uniqueMethodType !== 'proprietary_framework') {
    uncertainties.push({
      category: 'DIFFERENTIATION',
      priority: 80,
      question: 'إزاي تصيغ خطوات حلك في 3 إلى 5 مراحل مسماة تميزك فورًا عن أي كورس أو محتوى مجاني على الإنترنت؟',
    });
  }

  // 7. TRANSFORMATION CONTROLLABILITY
  if (answers.transformationRealism === 'depends_on_many_external_factors') {
    uncertainties.push({
      category: 'TRANSFORMATION',
      priority: 82,
      question: 'إيه الجزء الواقع تمامًا تحت سيطرة المنهجية وتقدر تضمن وصول العميل إليه دون تعليق النتيجة على أطراف خارجية؟',
    });
  }

  // Sort by priority and take top 3
  uncertainties.sort((a, b) => b.priority - a.priority);
  const selected = uncertainties.slice(0, 3).map((u) => u.question);

  // Requirement #11: Stage-specific fallback question banks
  // Stage 5 focuses on standardization, support burden, outcome consistency, reusable assets, operational capacity
  // Stage 6 focuses on acquisition bottleneck, conversion bottleneck, delivery capacity, retention, economics, tracking
  // A Stage 6 or Stage 5 user must NEVER receive beginner preorder/48h questions!
  let fallbacks: string[] = [];
  if (stageNum === 6) {
    fallbacks = [
      'ما هي القناة الإعلانية أو الشراكة التي ستحقق لك مضاعفة حجم المبيعات الشهرية دون رفع كلفة الاستقطاب؟',
      'أين يكمن عنق الزجاجة الرئيسي الآن: في معدل التحويل (Conversion)، أم سعة التسليم، أم الاحتفاظ بالعملاء (Retention)؟',
      'ما هي العملية أو الخطوة التشغيلية التي تستهلك أكبر وقت من فريقك حاليًا ويمكن أتمتتها بالكامل؟',
    ];
  } else if (stageNum === 5) {
    fallbacks = [
      'ما هي المكونات التي تتكرر لكل عميل ويمكن تحويلها لأصول رقمية مسجلة وقوالب ذاتية الاستخدام بنسبة 100%؟',
      'ما هو الحد الأقصى لعدد المشتركين الجدد الذين يمكنك تسليمهم النتيجة شهريًا بنفس جودة التجربة الحالية؟',
      'كيف تصيغ مصفوفة معايير الدعم الفني لحصر استفسارات العملاء وحلها خلال أقل من 15 دقيقة؟',
    ];
  } else {
    fallbacks = [
      'إيه أقل نسخة ملموسة من حلك تقدر تقدمها وتوصل العميل لأول نتيجة في أقل من 48 ساعة؟',
      'من بين المهتمين الحاليين، مين أول 3 أشخاص تقدر تطلب منهم حجزًا مسبقًا هذا الأسبوع؟',
      'إيه المعيار الرقمي المحدد اللي لو تحقق هتعتبر تجربة إطلاق الدفعة الأولى نجحت 100%؟',
    ];
  }

  while (selected.length < 3) {
    const nextFb = fallbacks.shift();
    if (nextFb && !selected.includes(nextFb)) {
      selected.push(nextFb);
    }
  }

  if (ai?.next_best_question) {
    return [ai.next_best_question, selected[0], selected[1]];
  }

  return selected.slice(0, 3);
}

export function buildPersonalizedNextStep(
  opportunityScore: number,
  confidenceScore: number,
  answers: QuestionnaireAnswers,
  validationMaturity?: ValidationMaturityInfo,
  primaryFormat?: ProductFormatInfo
): {
  headlineAr: string;
  buttonLabelAr: string;
  subtextAr: string;
  targetModule: 'creator_validation' | 'creator_mvp' | 'reassessment' | 'seller_offer';
} {
  const stageNum = validationMaturity?.stageNumber ?? 0;
  const isPrimaryMembership = (primaryFormat?.titleEn || '').toLowerCase().includes('membership');
  const hasDirectRecurringPayments = answers.hasRecurringPaymentBehavior === 'recurring_monthly';
  const hasExplicitRequests =
    answers.explicitRecurringRequestReceived === true || answers.explicitRecurringRequestReceived === 'yes';
  const hasValidatedRecurringDemand = isPrimaryMembership && (hasDirectRecurringPayments || hasExplicitRequests);

  // 1. Reassessment case: when Opportunity Score is low (< 50) or core idea fundamentals require rethink
  if (opportunityScore < 50) {
    return {
      headlineAr: 'الفكرة تحتاج لإعادة صياغة المشكلة والشريحة لرفع قوة العرض قبل البدء.',
      buttonLabelAr: 'عدّل معطيات الفكرة وأعد التقييم',
      subtextAr: 'راجع توصيات التقرير ونقاط المخاطرة لتعديل زاوية المنتج واختباره مجددًا.',
      targetModule: 'reassessment',
    };
  }

  // 2. Creator Validation: Low confidence (< 50) - data is incomplete or speculative regardless of theoretical opportunity score
  if (confidenceScore < 50) {
    return {
      headlineAr: 'نقاط الفرصة أولية ولكن درجة الثقة منخفضة لنقص الأدلة؛ الأولوية لجمع الدليل من السوق.',
      buttonLabelAr: 'ابدأ خطة التحقق السريعة (7 أيام)',
      subtextAr: 'اتبع معسكر التحقق الميداني لسد فجوات البيانات وتأكيد حاجة العملاء قبل استثمار الوقت في البناء.',
      targetModule: 'creator_validation',
    };
  }

  // 3. Creator Validation: Stage 0 (Assumption) or Stage 1 (Problem Evidence)
  // High Opportunity Score alone must NEVER imply paid demand or bypass problem validation
  if (stageNum <= 1) {
    return {
      headlineAr: 'أولويتك الآن ليست بناء المنتج أو كتابة محتواه — بل جمع الدليل الميداني وتأكيد المشكلة.',
      buttonLabelAr: 'ابدأ خطة التحقق السريعة (7 أيام)',
      subtextAr: 'اتبع معسكر التحقق السريع للتأكد من وجود سلوك بحث وبدائل حقيقية لدى الجمهور قبل كتابة حرف واحد.',
      targetModule: 'creator_validation',
    };
  }

  // 4. Creator Validation: Stage 2 (Interest Evidence)
  // Inbound requests or waitlists present interest, but NO purchase commitment or payment exists yet
  if (stageNum === 2) {
    return {
      headlineAr: 'لديك مؤشرات اهتمام واستفسارات أولية؛ الأولوية الآن لاختبار الجدية وطلب التزام مالي حقيقي.',
      buttonLabelAr: 'ابدأ خطة التحقق السريعة (7 أيام)',
      subtextAr: 'استفد من معسكر التحقق لتحويل قوائم الانتظار والرسائل إلى التزام مالي واضح وتأكيد رغبة الدفع.',
      targetModule: 'creator_validation',
    };
  }

  // 5. Stage 6: Scale Evidence
  if (stageNum >= 6) {
    // 5A. Strong Opportunity Score (>= 75): Full scale Offer Architecture Lab route
    if (opportunityScore >= 75) {
      return {
        headlineAr: 'تمتلك أدلة توسع تشغيلية وقناة تدفق عملاء مستقرة؛ حان وقت هندسة عرض البيع التوسعي.',
        buttonLabelAr: 'انتقل لمعمل هندسة العروض (Offer Architecture)',
        subtextAr: 'قم بصياغة باقات العرض المتقدمة واستراتيجية التسعير لتحويل خدماتك إلى أصل تجاري متوسع ومؤتمت.',
        targetModule: 'seller_offer',
      };
    }

    // 5B. Moderate Opportunity Score (50 <= opportunityScore < 75): Maturity-appropriate intermediate recommendation
    // Advanced operators should NOT be sent to beginner validation or generic reassessment
    return {
      headlineAr: 'تمتلك بنية تشغيلية وتجارية متقدمة؛ الأولوية الآن لصقل زاوية المنتج واختبار عرض مصغر (MVP) قبل التوسع الكامل.',
      buttonLabelAr: 'صمم النسخة الأولية واختبر العرض (MVP)',
      subtextAr: 'خبرتك وقنواتك مثبتة، لكن زاوية هذا المنتج بالتحديد تحتاج إلى ضبط هوامش الربح وشكل التسليم عبر نسخة أولية سريعة قبل إطلاق حملات بيع واسعة.',
      targetModule: 'creator_mvp',
    };
  }

  // 6. Creator MVP: Stage 5 (Repeatable Delivery)
  // Proven repeatable delivery exists, but acquisition channels or scale readiness are NOT yet proven
  if (stageNum === 5) {
    if (isPrimaryMembership) {
      if (hasDirectRecurringPayments) {
        return {
          headlineAr: 'تمتلك سابقة تسليم متكررة وسابقة دفع دوري مثبتة؛ حان وقت إطلاق النسخة التجريبية للأعضاء المؤسسين.',
          buttonLabelAr: 'أطلق عرض الأعضاء المؤسسين (Founding Member Pilot)',
          subtextAr: 'ابدأ بدفعة مغلقة من 5 إلى 10 أعضاء لتأكيد الاستبقاء والاستمرار شهريًا وتقنين عبء التسليم.',
          targetModule: 'creator_mvp',
        };
      }

      if (hasExplicitRequests) {
        return {
          headlineAr: 'تمتلك سابقة تسليم متكررة وطلبات اشتراك صريحة دون دفع دوري مثبت؛ اختبر العضوية مع أعضاء مؤسسين.',
          buttonLabelAr: 'أطلق عرض الأعضاء المؤسسين (Founding Member Pilot)',
          subtextAr: 'الطلبات الصريحة تعبر عن اهتمام مبدئي، لكن الاستبقاء والدفع الشهري يحتاجان لاختبار عملي مع دفعة مصغرة لتقنين التجربة.',
          targetModule: 'creator_mvp',
        };
      }
    }

    return {
      headlineAr: 'تمتلك سابقة تسليم متكررة ومثبتة؛ الأولوية الآن لتقنين التسليم وتوحيد التجربة في منتج رقمي (MVP).',
      buttonLabelAr: 'صمم النسخة الأولية (MVP)',
      subtextAr: 'حوّل خطوات تسليمك المكررة إلى أصول وقوالب موحدة لتخفيف العبء الفردي قبل التفكير في التوسع التسويقي.',
      targetModule: 'creator_mvp',
    };
  }

  // 7. Creator MVP: Stage 4 (Actual Paid Evidence - Pilot, Deposit, or Paying Clients)
  if (stageNum === 4) {
    if (isPrimaryMembership) {
      // Case A: Verified recurring payment behavior
      if (hasDirectRecurringPayments) {
        return {
          headlineAr: 'تمتلك سابقة دفع دوري مثبتة واحتياجًا متكررًا؛ حان وقت إطلاق النسخة التجريبية للأعضاء المؤسسين.',
          buttonLabelAr: 'أطلق عرض الأعضاء المؤسسين (Founding Member Pilot)',
          subtextAr: 'ابدأ بدفعة مغلقة من 5 إلى 10 أعضاء مؤسسين لتأكيد الاستبقاء قبل فتح الاشتراك للعامة.',
          targetModule: 'creator_mvp',
        };
      }

      // Case B: Explicit requests for a recurring membership without verified recurring payments
      if (hasExplicitRequests) {
        return {
          headlineAr: 'تلقيت طلبات صريحة للاشتراك الدوري لكن الدفع والاستبقاء لم يُثبتا بعد؛ اختبر التجربة عبر أعضاء مؤسسين.',
          buttonLabelAr: 'أطلق عرض الأعضاء المؤسسين (Founding Member Pilot)',
          subtextAr: 'الطلبات المباشرة تعبر عن رغبة مبدئية، لكن الاستمرار والدفع الفعلي شهريًا يحتاجان لاختبار عملي مع دفعة مصغرة (5–10 أعضاء) قبل بناء منصة العضوية.',
          targetModule: 'creator_mvp',
        };
      }

      // Case C & D: Repeat buyers without subscription demand or unvalidated recurring demand
      return {
        headlineAr: 'لديك سابقة دفع حقيقية ولكن دون طلب اشتراك دوري مثبت؛ الأولوية لنسخة أولية محددة المخرجات.',
        buttonLabelAr: 'صمم النسخة الأولية (MVP)',
        subtextAr: 'ابدأ بحزمة أو ورشة عمل ذات مخرجات واضحة بدلاً من الالتزام بعضوية مستمرة غير مؤكدة الاستبقاء.',
        targetModule: 'creator_mvp',
      };
    }

    return {
      headlineAr: 'لديك سابقة دفع حقيقية أو عملاء حاليون؛ حان وقت تأطير الحل وبناء النسخة الأولية (MVP) السريعة.',
      buttonLabelAr: 'صمم النسخة الأولية (MVP)',
      subtextAr: 'ركز على بناء القوالب أو مسودة ورشة العمل لإطلاق العرض التجريبي وخدمة المشترين الأوائل.',
      targetModule: 'creator_mvp',
    };
  }

  // 8. Creator MVP: Stage 3 (Commitment Without Payment)
  // Pre-purchase commitment or reservation exists, but money has NOT changed hands yet
  if (stageNum === 3) {
    return {
      headlineAr: 'لديك التزام مسبق ومؤشرات طلب جادة دون دفع مالي بعد؛ حان وقت تصميم النسخة الأولية (MVP) لاختبار الشراء الفعلي.',
      buttonLabelAr: 'صمم النسخة الأولية (MVP)',
      subtextAr: 'صمم نسخة مصغرة واضحة القيمة واطرحها على من أبدوا التزامهم لحسم الدفع وإطلاق أول تجربة.',
      targetModule: 'creator_mvp',
    };
  }

  // Fallback: Reassessment
  return {
    headlineAr: 'الفكرة تحتاج لمزيد من الوضوح وصياغة الحل لرفع فرص النجاح.',
    buttonLabelAr: 'عدّل معطيات الفكرة وأعد التقييم',
    subtextAr: 'استخدم المحاكي التفاعلي لتعديل المعطيات واختبار سيناريوهات بديلة.',
    targetModule: 'reassessment',
  };
}

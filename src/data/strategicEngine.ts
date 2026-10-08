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
} from '../types';

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
  const hasPreorders = demandList.includes('preorders_deposits');
  const hasSoldRelated = demandList.includes('sold_related_work');
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

  const workaround = (answers.currentAlternativesAndWorkarounds || '').trim();
  const hasWorkaroundDescribed =
    workaround.length > 5 && !workaround.includes('معنديش') && !workaround.includes('مش محدد');

  const repeatedQ = (answers.repeatedQuestions || '').trim();
  const hasRepeatedQuestions =
    repeatedQ.length > 5 && !repeatedQ.includes('معنديش') && !repeatedQ.includes('مش متأكد');

  // STAGE 6: Scale Evidence
  // Repeat buyers, documented client results, direct daily access, and proven delivery
  if ((hasSoldRelated || hasClients) && hasClientResults && directDailyAudience && (hasPreorders || hasInbound)) {
    return {
      stage: 'STAGE_6_SCALE_EVIDENCE',
      stageNumber: 6,
      labelAr: 'المرحلة 6: جاهزية التوسع (Scale Evidence)',
      labelEn: 'Scale Evidence',
      summaryAr:
        'تمتلك نتائج متكررة مع عملاء سابقين ووصولاً مباشرًا يوميًا لجمهورك؛ الهدف هو أتمتة وتوسيع نطاق التسليم دون اختناق.',
    };
  }

  // STAGE 5: Repeatable Delivery
  // Has paying clients/sold related work + documented client results
  if ((hasSoldRelated || hasClients) && hasClientResults) {
    return {
      stage: 'STAGE_5_REPEATABLE_DELIVERY',
      stageNumber: 5,
      labelAr: 'المرحلة 5: تسليم متكرر مثبت (Repeatable Delivery)',
      labelEn: 'Repeatable Delivery',
      summaryAr:
        'تم تسليم النتيجة بنجاح لعملاء دفعوا بالفعل وحققوا مخرجات موثقة؛ الهدف هو تقنين التجربة في منتج رقمي مستقل أو عضوية.',
    };
  }

  // STAGE 4: Paid Pilot
  // Money has been exchanged: sold related work OR has current paying clients OR preorders received
  if (hasSoldRelated || hasClients || hasPreorders) {
    return {
      stage: 'STAGE_4_PAID_PILOT',
      stageNumber: 4,
      labelAr: 'المرحلة 4: تجربة مدفوعة (Paid Pilot)',
      labelEn: 'Paid Pilot',
      summaryAr:
        'يوجد سابقة دفع حقيقية أو عملاء حاليون لنفس المشكلة؛ التركيز الآن على حزم الحل بشكل مستقل عن وقتك الفردي.',
    };
  }

  // STAGE 3: Commitment Evidence
  // Preorders/deposits or explicit commit to pay
  if (hasPreorders) {
    return {
      stage: 'STAGE_3_COMMITMENT_EVIDENCE',
      stageNumber: 3,
      labelAr: 'المرحلة 3: التزام مسبق (Commitment Evidence)',
      labelEn: 'Commitment Evidence',
      summaryAr:
        'تلقيت التزامات بحجز مسبق أو دفعات جزئية؛ حان وقت إطلاق النسخة الأولية لهؤلاء الملتزمين وتأكيد رضاهم.',
    };
  }

  // STAGE 2: Interest Evidence
  // Inbound requests ("ناس طلبت مني") or free waitlist / downloads
  if (hasInbound || hasWaitlist) {
    return {
      stage: 'STAGE_2_INTEREST_EVIDENCE',
      stageNumber: 2,
      labelAr: 'المرحلة 2: مؤشرات اهتمام (Interest Evidence)',
      labelEn: 'Interest Evidence',
      summaryAr:
        'يوجد اهتمام واستفسارات أو قائمة انتظار أولية، ولكن لم يتم دفع أي مبالغ مالية بعد؛ يلزم طلب التزام مالي حقيقي.',
    };
  }

  // STAGE 1: Problem Evidence
  // Customer conversations, documented workarounds, repeated questions, or active competitors
  if (hasWorkaroundDescribed || hasRepeatedQuestions || hasCompetitors || (directDailyAudience || occasionalAudience)) {
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
  aiInterpretation?: AiStrategicInterpretation | null
): StrategicReport {
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
    aiInterpretation
  );

  const assumptionMap = buildAssumptionMap(answers, demandEvidence.score, aiInterpretation);
  const formatRecommendation = buildFormatRecommendation(answers);
  const productConcept = buildProductConcept(answers, formatRecommendation.primary);
  const positioning = buildPositioningStatement(answers);
  const mvp = buildMvpRecommendation(answers, formatRecommendation.primary, validationMaturity, aiInterpretation);
  const validationSprint = buildValidationSprint(answers, validationMaturity);
  const discoveryQuestions = buildDiscoveryQuestions(answers);
  const stopGoRules = buildStopGoRules(answers, demandEvidence.score);
  const whatNotToDo = buildWhatNotToDo(
    answers,
    formatRecommendation.primary,
    formatRecommendation.secondary,
    validationMaturity,
    aiInterpretation
  );
  const missingData = buildMissingData(answers, demandEvidence.score, aiInterpretation);
  const nextThreeQuestions = buildNextThreeQuestions(answers, validationMaturity, aiInterpretation);
  const personalizedNextStep = buildPersonalizedNextStep(
    opportunityScore,
    confidenceScore,
    answers,
    validationMaturity
  );

  return {
    id: `RPT-${Date.now().toString(36).toUpperCase()}`,
    createdAt: new Date().toISOString(),
    answers,
    analysisMode: aiInterpretation ? 'hybrid_ai' : 'rules_only',
    aiInterpretation: aiInterpretation || undefined,
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
    validationSprint,
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

  // 4. Buyer current behavior (Evaluates whether active workarounds / current behavior are described)
  const behavior = (answers.buyerCurrentBehavior || '').trim().toLowerCase();
  if (behavior) {
    const hasActiveBehaviorKeywords = [
      'يدوي', 'يدويًا', 'واتساب', 'إكسيل', 'شيت', 'ساعات', 'بيبحث', 'بيجرب', 'بيشتري', 
      'كورسات', 'فريلانسر', 'يوظف', 'محادثات', 'تجربة', 'محاولات', 'يصرف', 'مجهود', 'أدوات'
    ].some((w) => behavior.includes(w)) || behavior.length > 5;

    if (hasActiveBehaviorKeywords) {
      score += 17;
      notes.push('رصد السلوك الفعلي للعميل حاليًا يرفع مستوى الثقة في أنه يبذل جهدًا نشطًا للحل، ويحميك من استهداف جمهور متفرج لا يتحرك.');
    } else {
      score += 5;
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

  // TIER 1: Actual Purchases / Deposits
  if (list.includes('preorders_deposits')) {
    score = 90;
    notes.push('وجود حجوزات مسبقة أو دفعات مالية يعتبر الدليل الأقوى حاليًا على استعداد العميل للدفع الفعلي');
  } else if (list.includes('sold_related_work')) {
    // TIER 2: Paid adjacent service
    score = 70;
    notes.push('وجود مبيعات سابقة لحل مرتبط يعتبر دليلًا أقوى على استعداد بعض العملاء للدفع مقابل مشكلة قريبة، لكنه لا يثبت الطلب على المنتج الرقمي بنفس الشكل.');
  } else if (list.includes('existing_clients_ask')) {
    score = 65;
    notes.push('طلب العملاء الحاليين يعتبر مؤشرًا قويًا على وجود اهتمام حقيقي داخلي');
  } else if (list.includes('waitlist_subscribers')) {
    score = 60;
    notes.push('قائمة انتظار نشطة تعتبر دليلاً أوليًا ممتازًا على الاهتمام الحقيقي');
  } else if (list.includes('people_ask_me')) {
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
  const hasTier1 = list.includes('preorders_deposits');
  const hasTier2 = list.includes('sold_related_work') || list.includes('existing_clients_ask') || list.includes('waitlist_subscribers');
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

  switch (answers.creatorTimePerCustomer) {
    case 'almost_none':
      score += 45;
      notes.push('قابلية توسع عالية مع استهلاك وقت شبه منعدم بعد البناء');
      break;
    case 'under_30m':
      score += 35;
      notes.push('عبء تشغيلي منخفض يسمح بخدمة أعداد مريحة');
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

  // Requirement #1: Detect contradiction between scalability goal vs delivery dependency
  // Creator wants a highly scalable model (almost_none or under_30m), BUT the transformation requires substantial feedback, personalization, or accountability
  const wantsHighScale =
    answers.creatorTimePerCustomer === 'almost_none' || answers.creatorTimePerCustomer === 'under_30m';
  const deliveryList = answers.deliveryMechanism || [];
  const requiresSubstantialIntervention =
    answers.requiresPersonalFeedback === true ||
    answers.requiresOneOnOneAccountability === true ||
    deliveryList.includes('critique_feedback') ||
    deliveryList.includes('accountability') ||
    deliveryList.includes('live_coaching');

  if (wantsHighScale && requiresSubstantialIntervention) {
    score -= 25; // Reduce Delivery Feasibility significantly
    notes.unshift(
      'تناقض استراتيجي: ترغب في نموذج تسليم آلي عالي التوسع بدون استهلاك وقت، بينما التحول والآلية يتطلبان تقييمًا شخصيًا (Feedback) ومتابعة التزام (Accountability). هذا التناقض يضغط على وقتك أو يضعف رضا المشتركين.'
    );
  } else if (answers.requiresPersonalFeedback === true && answers.requiresOneOnOneAccountability === true) {
    score -= 10;
    notes.push('الجمع بين التقييم الشخصي والمتابعة الفردية يقلل قابلية التوسع ما لم يتم تسعيره كبرنامج عالي القيمة');
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
  
  const needsAccountability =
    answers.requiresOneOnOneAccountability === true || (answers.deliveryMechanism || []).includes('accountability');
  const needsPersonalFeedback =
    answers.requiresPersonalFeedback === true || (answers.deliveryMechanism || []).includes('critique_feedback');

  const isZeroTouch =
    answers.creatorTimePerCustomer === 'almost_none' || answers.creatorTimePerCustomer === 'under_30m';
  const isRecurringSupport = answers.creatorTimePerCustomer === 'recurring_support';
  const isHighTouch =
    answers.creatorTimePerCustomer === 'high_touch' || answers.creatorTimePerCustomer === '1_to_2h';

  const hasExistingAudience =
    answers.audienceAccessLevel === 'direct_daily' || answers.audienceAccessLevel === 'occasional';
  const hasProvenDemand =
    (answers.demandEvidenceList || []).includes('preorders_deposits') ||
    (answers.demandEvidenceList || []).includes('sold_related_work');
  const hasRecurringPurchasingProof =
    (answers.demandEvidenceList || []).includes('sold_related_work') &&
    (answers.qualificationEvidence || []).includes('client_results');

  const demandListForFormat = (answers.demandEvidenceList || []) as string[];
  const textSignals = `${answers.repeatedQuestions || ''} ${answers.problemsFrequentlySolved || ''} ${answers.currentAlternativesAndWorkarounds || ''}`.toLowerCase();
  const hasExplicitRecurringRequest =
    demandListForFormat.includes('inbound_requests') ||
    demandListForFormat.includes('people_ask_me') ||
    demandListForFormat.includes('existing_clients_ask') ||
    textSignals.includes('اشتراك') ||
    textSignals.includes('شهري') ||
    textSignals.includes('جروب') ||
    textSignals.includes('مجموعة') ||
    textSignals.includes('مجتمع') ||
    textSignals.includes('متابعة دورية') ||
    textSignals.includes('recurring') ||
    textSignals.includes('membership') ||
    textSignals.includes('community') ||
    (answers.hasExistingPayingClients === true && hasRecurringPurchasingProof);

  const canSustainRecurringDelivery =
    isRecurringSupport ||
    answers.creatorTimePerCustomer === '1_to_2h' ||
    answers.creatorTimePerCustomer === 'under_30m' ||
    answers.availableWeeklyHours === '10_to_20' ||
    answers.availableWeeklyHours === 'full_time';

  const deliveryList = answers.deliveryMechanism || [];
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
        (!needsPersonalFeedback ? 15 : -35) +
        (!needsAccountability ? 10 : -25) +
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
        (!needsPersonalFeedback ? 15 : -25) +
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
        (!needsPersonalFeedback ? 15 : -20) +
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

    // 4. Full Course (Penalty applied when problem is recurring, support is recurring, or community/accountability is required)
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
        (needsAccountability ? 25 : 0),
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
        (needsAccountability ? 45 : -20) +
        (hasLiveCalls ? 25 : 0) +
        (isHighTouch ? 25 : -35) +
        (isPremiumTier || answers.expectedPriceTier === 'mid_150_500' ? 25 : 0) +
        (hasExistingAudience ? 15 : -15),
      info: {
        titleAr: 'معسكر تطبيقي محدد المدة 7–14 يوم (Implementation Sprint / Cohort)',
        titleEn: 'Cohort / Sprint',
        whyFitAr:
          'يجمع بين حافز الالتزام الجماعي ومواعيد التسليم المحددة، مما يرفع نسب إكمال المشتركين للنتيجة إلى أقصى حد ويبرر سعرًا أعلى.',
        speedToFirstValue: 'أسبوع واحد مع تسليم النتيجة تدريجيًا',
        deliveryBurden: 'متابعة مكثفة محددة السقف الزمني',
      },
    },

    // 7. Membership (Requires recurring problem, ongoing value & proven retention)
    {
      id: 'membership',
      score:
        10 +
        (isRecurringProblem ? 40 : -50) +
        (isRecurringSupport ? 35 : -40) +
        (hasRecurringPurchasingProof ? 35 : -35) +
        (hasExistingAudience ? 25 : -30) +
        (hasCommunity ? 25 : 0) +
        (hasLiveCalls ? 20 : 0) +
        (needsAccountability ? 20 : 0) +
        (hasExplicitRecurringRequest ? 30 : 0) +
        (canSustainRecurringDelivery ? 20 : -20),
      info: {
        titleAr: 'عضوية شهرية / اشتراك دوري (Recurring Membership)',
        titleEn: 'Membership',
        whyFitAr:
          'يناسب المشاكل المتكررة شهريًا التي تتطلب تحديثات دورية أو استشارات جماعية مستمرة، ويخلق تدفقًا نقديًا متوقعًا ومستقرًا.',
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
        (!needsPersonalFeedback && !needsAccountability ? 25 : -20),
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
        (needsPersonalFeedback ? 40 : -20) +
        (isHighTouch ? 35 : -45) +
        (isPremiumTier ? 35 : 0) +
        (isBackendFeeder ? 30 : 0) +
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
        ((hasTemplates || hasFramework) && (needsPersonalFeedback || hasLiveCalls) ? 45 : 0) +
        (answers.creatorTimePerCustomer === 'under_30m' || answers.creatorTimePerCustomer === '1_to_2h' ? 30 : 0) +
        (answers.expectedPriceTier === 'mid_150_500' || isPremiumTier ? 25 : 0),
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
    // When problem/value is recurring and recurring evidence exists, Membership / Community has contextual priority over one-time courses
    if (isRecurringProblem && (hasRecurringPurchasingProof || isRecurringSupport || hasCommunity)) {
      if (a.id === 'membership') return -1;
      if (b.id === 'membership') return 1;
      if (a.id === 'paid_community') return -1;
      if (b.id === 'paid_community') return 1;
    }
    // Zero-touch with no feedback favors templates or playbooks
    if (isZeroTouch && !needsPersonalFeedback) {
      if (a.id === 'toolkit') return -1;
      if (b.id === 'toolkit') return 1;
      if (a.id === 'playbook') return -1;
      if (b.id === 'playbook') return 1;
    }
    return a.id.localeCompare(b.id);
  });

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
  const lacksRecurringEvidence = !hasRecurringPurchasingProof && answers.hasExistingPayingClients !== true;
  const lacksDeliveryCapacity = answers.creatorTimePerCustomer === 'high_touch' && answers.availableWeeklyHours === 'under_5';

  if (lacksRecurringNeed || (lacksAudienceAccess && lacksRecurringEvidence) || lacksDeliveryCapacity) {
    avoid.push({
      titleAr: 'اشتراك شهري أو مجتمع مدفوع (Recurring Membership / Paid Community)',
      titleEn: 'Membership / Community',
      whyNotAr:
        'العضويات تتطلب حاجة متجددة واستبقاءً مستمرًا للأعضاء (Retention). البدء بها دون وجود مشكلة تتجدد دوريًا أو وصول كافٍ للجمهور يؤدي للاستنزاف التشغيلي والتسرب السريع للمشتركين.',
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
  validationMaturity?: ValidationMaturityInfo
): ValidationDay[] {
  const stageNum = validationMaturity?.stageNumber ?? 0;

  // Case A: High Validation Maturity (Stage 4, 5, 6 - Has Paying Clients or Repeat Delivery)
  if (stageNum >= 4) {
    return [
      {
        dayNumber: 1,
        dayTitleAr: 'اليوم الأول: تدقيق نتائج وتجارب العملاء السابقين',
        focusAr: 'استخلاص الأنماط المشتركة والنتيجة الأكثر قيمة التي دفع العملاء مقابلها',
        actionItems: [
          'راجع سجلات آخر 5 إلى 10 عملاء دفعوا لك واستخرج النتيجة التي حققوها بنجاح.',
          'حدد الخطوات الـ 3 إلى 5 التي تكررت في تسليم الخدمة لكل عميل.',
          'حدد الجزء الذي يستهلك أكبر قدر من وقتك ويمكن تحويله لأصل أو قالب رقمي.',
        ],
        expectedOutputAr: 'خريطة تفريغ لمراحل الحل مع تحديد المخرجات القابلة للأتمتة.',
      },
      {
        dayNumber: 2,
        dayTitleAr: 'اليوم الثاني: إعداد أسئلة حزم العرض المتكرر',
        focusAr: 'تصميم استطلاع مخصص للعملاء الحاليين لفهم ما يدفعهم للاستمرار',
        actionItems: [
          'جهّز 4 أسئلة موجهة لعملائك: "إيه أكتر جزء ساعدك؟" و "إيه اللي تتمنى يفضل متاح معاك شهريًا؟".',
          'حدد سقف التسعير المقترح للعضوية أو المنتج الرقمي مقارنة بالخدمة الفردية.',
          'اختر 3 إلى 5 عملاء حاليين أو سابقين ذوي علاقة وطيدة لإجراء مكالمات سريعة.',
        ],
        expectedOutputAr: 'قائمة أسئلة صقل العرض جاهزة للتواصل المباشر.',
      },
      {
        dayNumber: 3,
        dayTitleAr: 'اليوم الثالث: محادثات التطوير مع 3 عملاء حاليين',
        focusAr: 'التحقق من جاذبية النموذج الرقمي المقترح مع من دفعوا لك بالفعل',
        actionItems: [
          'تواصل شخصيًا مع عميلين أو ثلاثة في مكالمة سريعة مدتها 15 دقيقة.',
          'اعرض عليهم فكرة العرض الرقمي أو العضوية الشهرية واسألهم عن رأيهم الصريح.',
          'دوّن الكلمات الدقيقة وملاحظاتهم حول ما يجعلهم ينضمون فورًا.',
        ],
        expectedOutputAr: 'تأكيد مباشر من مشترين حقيقيين حول ملاءمة هيكل العرض والتسعير.',
      },
      {
        dayNumber: 4,
        dayTitleAr: 'اليوم الرابع: تثبيت نطاق العرض الأولي (Scope Lock)',
        focusAr: 'تحديد ما يتضمنه العرض وما يستثنى منه تمامًا لحماية وقتك',
        actionItems: [
          'ضع حدودًا صارمة: كم جلسة جماعية شهريًا؟ ما نوع القوالب المتضمنة؟',
          'استبعد أي التزام بالرد الفردي على مدار الساعة دون سقف زمني.',
          'حدد آلية الاستبقاء للشهر الثاني والثالث (Recurring Habit Loop).',
        ],
        expectedOutputAr: 'وثيقة نطاق عمل محددة للعرض التجريبي تحمي طاقتك التشغيلية.',
      },
      {
        dayNumber: 5,
        dayTitleAr: 'اليوم الخامس: صياغة عرض الأعضاء المؤسسين (Founding Offer)',
        focusAr: 'صياغة دعوة خاصة بمزايا تفضيلية مدى الحياة للأوائل',
        actionItems: [
          'صغ رسالة دعوة حصرية للأعضاء المؤسسين (سعر مخفض دائم مقابل المشاركة الفعالة).',
          'حدد سقفًا واضحًا للمقاعد (مثلاً 5 إلى 10 مقاعد فقط).',
          'جهّز رابط الدفع أو استمارة التأكيد المباشرة.',
        ],
        expectedOutputAr: 'رسالة عرض مؤسس جذابة جاهزة للإرسال المباشر.',
      },
      {
        dayNumber: 6,
        dayTitleAr: 'اليوم السادس: طرح العرض الخاص على عملائك وقائمتك',
        focusAr: 'إرسال العرض في رسائل خاصة للمؤهلين بدلاً من النشر العام العشوائي',
        actionItems: [
          'أرسل رسالة الدعوة الفردية لـ 10 إلى 20 شخصًا من عملائك والمستفسرين السابقين.',
          'أجب عن استفساراتهم باهتمام وشخصنة ورصد أي تردد.',
          'قم بتأكيد أول المشتركين وإضافتهم للمجموعة التجريبية.',
        ],
        expectedOutputAr: 'تسجيل الاشتراكات الفعلية وتأكيد حجز مقاعد الدفعة الأولى.',
      },
      {
        dayNumber: 7,
        dayTitleAr: 'اليوم السابع: مراجعة التحويل وقفل مقاعد الدفعة الأولى',
        focusAr: 'تقييم نسبة القبول والانطلاق في تسليم الشهر الأول',
        actionItems: [
          'إذا حجز 3 إلى 5 أعضاء مؤسسين: أغلق الدفعة الأولى وابدأ جدول التسليم فورًا.',
          'إذا كان هناك تردد في الاستمرار: عدل المكونات بناءً على ملاحظاتهم.',
          'وثق أول جلسة أو قالب في جدول الإطلاق الأسبوعي.',
        ],
        expectedOutputAr: 'انطلاق الدفعة التجريبية الأولى والتفرغ لتقديم تجربة استثنائية.',
      },
    ];
  }

  // Case B: Moderate Validation Maturity (Stage 2, 3 - Interest or Commitment Signals)
  if (stageNum === 2 || stageNum === 3) {
    return [
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
    ];
  }

  // Case C: Low Validation Maturity (Stage 0, 1 - Pure Assumption or Problem Evidence)
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

  return [
    {
      dayNumber: 1,
      dayTitleAr: 'اليوم الأول: تحرير الفرضية الأساسية',
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
      dayTitleAr: 'اليوم الثالث: محادثات الاكتشاف الواقعية',
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
      dayTitleAr: 'اليوم الخامس: صياغة العرض المصغر (Minimum Offer)',
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
      dayTitleAr: 'اليوم السابع: قرار الاستمرار / التعديل / التوقف',
      focusAr: 'اتخاذ قرار مبني على الوقائع والأدلة بعيدًا عن العاطفة',
      actionItems: [
        'قارن النتائج بمعايير Stop/Go المحددة في التقرير.',
        'إذا حصلت على التزامات جادة تغطي هدفك التجريبي: ابدأ بناء النسخة الأولية فورًا.',
        'إذا كانت الردود "فكرة حلوة بس مش محتاجها دلوقتي": أعد صياغة العرض أو المشكلة.',
      ],
      expectedOutputAr: 'قرار تنفيذي نهائي موثق بالخطوة القادمة للأسبوع التالي.',
    },
  ];
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
    // Only discourage membership if it's NOT recommended and lacks recurring foundations
    const lacksRecurringNeed = answers.problemFrequency === 'occasional' || answers.problemFrequency === 'unsure';
    const lacksAudienceAccess = answers.audienceAccessLevel === 'none_yet' || answers.audienceAccessLevel === 'unsure';
    if (lacksRecurringNeed || lacksAudienceAccess) {
      items.push({
        headlineAr: 'متتجهش لنظام اشتراكات شهرية (Membership) دون حاجة متجددة أسبوعيًا',
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
    if (primaryEn.includes('membership') && item.headlineAr.includes('اشتراك شهري')) return false;
    if (primaryEn.includes('toolkit') && item.headlineAr.includes('قوالب')) return false;
    if (primaryEn.includes('consulting') && item.headlineAr.includes('استشارة')) return false;
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
  ai?: AiStrategicInterpretation | null
): string[] {
  const stageNum = validationMaturity?.stageNumber ?? 0;
  let base: string[];

  if (stageNum >= 4) {
    base = [
      'إيه الأصل أو الروتين المتكرر اللي لو قدمته لعملائك الحاليين هيخليهم يستمروا في الاشتراك بعد الشهر الثالث؟',
      'إزاي تقدر تقدم نفس التحول لـ 10 إلى 20 عميلاً في وقت واحد دون زيادة ساعات عملك الأسبوعية؟',
      'مين أول 5 إلى 10 من عملائك الحاليين أو السابقين اللي تقدر تدعوهم هذا الأسبوع كأعضاء مؤسسين للنسخة الرقمية؟',
    ];
  } else if (stageNum === 2 || stageNum === 3) {
    base = [
      'من بين الأشخاص الذين أبدوا اهتمامًا أو طلبوا حلاً، مين أول 3 مستعدين لدفع حجز مسبق اليوم؟',
      'إيه أقل سعر تجريبي يجعل الانضمام للدفعة الأولى قرارًا بديهيًا دون تردد مالي؟',
      'إيه النتيجة المحددة بدقة اللي لو وصل لها المشترك في أول 7 أيام هيعتبر تجربته ناجحة 100%؟',
    ];
  } else {
    base = [
      `مين أول 5 إلى 10 أشخاص بالاسم في شبكتك أو جمهورك يمثلون الشريحة المستهدفة (${(answers.targetBuyerDescription || '').slice(0, 30)}) وتقدر تكلمهم هذا الأسبوع؟`,
      'إيه أكبر بديل أو حيلة مؤقتة بيستخدموها دلوقتي للتعامل مع المشكلة، وتكلفتها عليهم إيه؟',
      'إيه أقل نسخة ملموسة من حلك تقدر تقدمها وتوصل العميل لأول نتيجة في أقل من 48 ساعة؟',
    ];
  }

  if (ai?.next_best_question) {
    return [ai.next_best_question, base[0], base[1]];
  }

  return base;
}

function buildPersonalizedNextStep(
  opportunityScore: number,
  confidenceScore: number,
  answers: QuestionnaireAnswers,
  validationMaturity?: ValidationMaturityInfo
): {
  headlineAr: string;
  buttonLabelAr: string;
  subtextAr: string;
  targetModule: 'creator_validation' | 'creator_mvp' | 'seller_offer';
} {
  const stageNum = validationMaturity?.stageNumber ?? 0;

  if (stageNum >= 4 && opportunityScore >= 70) {
    return {
      headlineAr: 'أنت تمتلك دليلاً واقعيًا قويًا وعملاء سابقين؛ حان وقت حزم الخبرة في منتج رقمي مستقل.',
      buttonLabelAr: 'أطلق عرض الأعضاء المؤسسين (Founding Offer)',
      subtextAr: 'حوّل خبرتك وخدماتك السابقة لأصول متكررة تمنحك دخلاً ماليًا مستقلاً دون استنزاف ساعاتك الشخصية.',
      targetModule: 'creator_mvp',
    };
  }

  if (confidenceScore < 50 || stageNum <= 1) {
    return {
      headlineAr: 'أولويتك الآن ليست بناء المنتج أو كتابة محتواه — بل جمع الدليل الناقص من السوق.',
      buttonLabelAr: 'ابدأ خطة التحقق السريعة (7 أيام)',
      subtextAr: 'اتبع خطوات الأسبوع لتأكيد استعداد الجمهور للشراء قبل استثمار دقيقة واحدة في التسجيل.',
      targetModule: 'creator_validation',
    };
  }

  if (opportunityScore >= 75) {
    return {
      headlineAr: 'فرصتك واعدة والأدلة كافية للانتقال للخطوة التالية. حان وقت تجهيز النسخة الأولية وعرض البيع.',
      buttonLabelAr: 'صمم النسخة الأولية (MVP)',
      subtextAr: 'ركز على بناء القوالب أو مسودة الورشة التفاعلية لإطلاق العرض التجريبي.',
      targetModule: 'creator_mvp',
    };
  }

  return {
    headlineAr: 'الفكرة تحتاج لإعادة صياغة المشكلة والشريحة لرفع قوة العرض.',
    buttonLabelAr: 'عدّل معطيات الفكرة وأعد التقييم',
    subtextAr: 'راجع توصيات التقرير ونقاط المخاطرة لتعديل زاوية المنتج واختباره مجددًا.',
    targetModule: 'creator_validation',
  };
}

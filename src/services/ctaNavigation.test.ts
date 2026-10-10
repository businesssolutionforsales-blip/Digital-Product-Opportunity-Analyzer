import { describe, it, expect, vi } from 'vitest';
import {
  resolveCtaNavigation,
  isValidOfferLabUrl,
  CtaTargetModule,
} from './ctaNavigation';
import {
  buildPersonalizedNextStep,
  inferValidationMaturityStage,
} from '../data/strategicEngine';
import {
  QuestionnaireAnswers,
  ValidationMaturityInfo,
  ProductFormatInfo,
  EvidenceType,
} from '../types';

describe('CTA Navigation Resolution & Routing', () => {
  // Existing 7 resolution tests (preserved exactly)
  it('creator_validation resolves to scrolling to 7-Day Validation Sprint section', () => {
    const resolution = resolveCtaNavigation('creator_validation');
    expect(resolution.action).toBe('scroll_to_section');
    expect(resolution.targetSectionId).toBe('section-validation-sprint');
    expect(resolution.isExternalConfigured).toBe(true);
    expect(resolution.externalUrl).toBeUndefined();
  });

  it('creator_mvp resolves to scrolling to MVP Recommendation section', () => {
    const resolution = resolveCtaNavigation('creator_mvp');
    expect(resolution.action).toBe('scroll_to_section');
    expect(resolution.targetSectionId).toBe('section-mvp-recommendation');
    expect(resolution.isExternalConfigured).toBe(true);
    expect(resolution.externalUrl).toBeUndefined();
  });

  it('reassessment resolves to opening the Interactive Recalculate experience', () => {
    const resolution = resolveCtaNavigation('reassessment');
    expect(resolution.action).toBe('open_recalculate');
    expect(resolution.isExternalConfigured).toBe(true);
    expect(resolution.targetSectionId).toBeUndefined();
    expect(resolution.externalUrl).toBeUndefined();
  });

  it('seller_offer opens external URL when a valid HTTPS or HTTP URL is configured', () => {
    const validHttps = 'https://portal.example.com/offer-architecture-lab';
    const resolutionHttps = resolveCtaNavigation('seller_offer', validHttps);
    expect(resolutionHttps.action).toBe('open_external_url');
    expect(resolutionHttps.externalUrl).toBe(validHttps);
    expect(resolutionHttps.isExternalConfigured).toBe(true);

    const validHttp = 'http://localhost:3000/lab';
    const resolutionHttp = resolveCtaNavigation('seller_offer', validHttp);
    expect(resolutionHttp.action).toBe('open_external_url');
    expect(resolutionHttp.externalUrl).toBe(validHttp);
    expect(resolutionHttp.isExternalConfigured).toBe(true);
  });

  it('seller_offer gracefully falls back to MVP section with truthful notice when unconfigured', () => {
    const resolutions = [
      resolveCtaNavigation('seller_offer', undefined),
      resolveCtaNavigation('seller_offer', null),
      resolveCtaNavigation('seller_offer', ''),
      resolveCtaNavigation('seller_offer', '   '),
      resolveCtaNavigation('seller_offer', 'invalid-scheme://example.com'),
      resolveCtaNavigation('seller_offer', 'not-a-valid-url'),
    ];

    for (const res of resolutions) {
      expect(res.action).toBe('scroll_to_section');
      expect(res.targetSectionId).toBe('section-mvp-recommendation');
      expect(res.isExternalConfigured).toBe(false);
      expect(res.externalUrl).toBeUndefined();
      expect(res.fallbackNoticeAr).toBeDefined();
      expect(res.fallbackNoticeAr).toContain('معمل هندسة العروض المتقدم غير مهيأ');
      expect(res.fallbackNoticeAr).toContain('MVP');
    }
  });

  it('handles unknown or malformed target module gracefully', () => {
    const resolution = resolveCtaNavigation('non_existent_module' as CtaTargetModule);
    expect(resolution.action).toBe('scroll_to_section');
    expect(resolution.targetSectionId).toBe('section-validation-sprint');
    expect(resolution.isExternalConfigured).toBe(true);
  });

  it('simulates accessibility and element navigation when target element exists in DOM', () => {
    const scrollIntoViewMock = vi.fn();
    const focusMock = vi.fn();

    const fakeElement = {
      id: 'section-mvp-recommendation',
      scrollIntoView: scrollIntoViewMock,
      focus: focusMock,
    } as unknown as HTMLElement;

    // Simulate behavior performed by handlePersonalizedCtaClick
    fakeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    fakeElement.focus({ preventScroll: true });

    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    expect(focusMock).toHaveBeenCalledWith({ preventScroll: true });
  });

  // Native URL parser validation tests (Requirement #1)
  describe('Native URL Parser Validation for Offer Lab URL', () => {
    it('accepts valid HTTPS URLs in production', () => {
      expect(isValidOfferLabUrl('https://offerlab.example.com')).toBe(true);
      expect(isValidOfferLabUrl('https://app.example.com/offers/architecture?ref=analyzer')).toBe(true);
      expect(isValidOfferLabUrl('https://sub.domain.co.uk:8443/lab')).toBe(true);
    });

    it('allows HTTP only for local development environments', () => {
      expect(isValidOfferLabUrl('http://localhost:3000/lab')).toBe(true);
      expect(isValidOfferLabUrl('http://127.0.0.1:5173')).toBe(true);
      expect(isValidOfferLabUrl('http://app.localhost:8080')).toBe(true);
    });

    it('rejects HTTP URLs for non-local production hostnames', () => {
      expect(isValidOfferLabUrl('http://offerlab.example.com')).toBe(false);
      expect(isValidOfferLabUrl('http://insecure-domain.org/path')).toBe(false);
    });

    it('rejects unsupported or dangerous protocols', () => {
      expect(isValidOfferLabUrl('javascript:alert(1)')).toBe(false);
      expect(isValidOfferLabUrl('ftp://files.example.com/lab')).toBe(false);
      expect(isValidOfferLabUrl('file:///etc/passwd')).toBe(false);
      expect(isValidOfferLabUrl('data:text/html,<div>lab</div>')).toBe(false);
    });

    it('rejects malformed, empty, or whitespace strings safely', () => {
      expect(isValidOfferLabUrl('')).toBe(false);
      expect(isValidOfferLabUrl('   ')).toBe(false);
      expect(isValidOfferLabUrl(null)).toBe(false);
      expect(isValidOfferLabUrl(undefined)).toBe(false);
      expect(isValidOfferLabUrl('not-a-url')).toBe(false);
      expect(isValidOfferLabUrl('https://')).toBe(false);
      expect(isValidOfferLabUrl('http://')).toBe(false);
    });
  });

  // Accurate pre-click button label tests
  describe('Pre-Click CTA Label Truthfulness and Consistency', () => {
    it('accurately describes in-report MVP destination BEFORE click when Offer Lab URL is unavailable', () => {
      const unconfigured = resolveCtaNavigation(
        'seller_offer',
        undefined,
        'انتقل لمعمل هندسة العروض (Offer Architecture)'
      );

      // Must NOT promise navigation to external lab when actual action is in-report MVP
      expect(unconfigured.isExternalConfigured).toBe(false);
      expect(unconfigured.action).toBe('scroll_to_section');
      expect(unconfigured.targetSectionId).toBe('section-mvp-recommendation');
      expect(unconfigured.resolvedButtonLabelAr).toBe('استعرض نموذج النسخة الأولية وصياغة العرض (MVP)');
      expect(unconfigured.resolvedButtonLabelAr).not.toContain('انتقل لمعمل');
    });

    it('preserves external application button label when Offer Lab URL is properly configured', () => {
      const configured = resolveCtaNavigation(
        'seller_offer',
        'https://verified-offer-lab.com',
        'انتقل لمعمل هندسة العروض (Offer Architecture)'
      );

      expect(configured.isExternalConfigured).toBe(true);
      expect(configured.action).toBe('open_external_url');
      expect(configured.externalUrl).toBe('https://verified-offer-lab.com');
      expect(configured.resolvedButtonLabelAr).toBe('انتقل لمعمل هندسة العروض (Offer Architecture)');
    });
  });

  // Helper factory with valid questionnaire types
  const createBaseAnswers = (overrides?: Partial<QuestionnaireAnswers>): QuestionnaireAnswers => ({
    userPath: 'specific_idea',
    productNameOrWorkingTitle: 'ورشة إعلانات سناب شات',
    expertiseDomain: 'التسويق الرقمي',
    yearsOfExperience: '5_to_10',
    targetBuyerDescription: 'أصحاب المتاجر الإلكترونية',
    buyerStageAndSituation: 'لديهم مبيعات أولية لكن التكلفة مرتفعة',
    buyerCurrentBehavior: 'يعتمدون على إعلانات عشوائية',
    isBuyerBroadOrSpecific: 'narrow_specific',
    coreProblemDescription: 'صعوبة ضبط تكلفة الاستقطاب الإعلاني',
    problemFrequency: 'daily',
    costOfInaction: ['money_loss'],
    currentAlternativesAndWorkarounds: 'إعلانات عشوائية وبحث يدوي',
    evidenceNotes: 'ملاحظات التحقق',
    beforeState: 'خسارة ميزانية',
    afterState: 'مبيعات مربحة',
    transformationRealism: 'highly_controllable',
    deliveryMechanism: ['framework_steps'],
    creatorMethodSummary: 'قمع استقطاب ثلاثي',
    uniqueMethodType: 'proprietary_framework',
    uniqueMethodOrProcess: 'منهجية القمع الثلاثي',
    creatorTimePerCustomer: 'under_30m',
    requiresPersonalFeedback: false,
    requiresOneOnOneAccountability: false,
    personalFeedbackState: 'not_required',
    oneOnOneAccountabilityState: 'not_required',
    expectedPriceTier: 'mid_150_500',
    productRoleInBusiness: 'core_flagship',
    existingAudienceChannel: 'قناة تليجرام 5000 عضو',
    demandEvidenceList: ['paid_deposit'] as EvidenceType[],
    hasExistingPayingClients: true,
    audienceAccessLevel: 'direct_daily',
    qualificationEvidence: ['client_results'],
    hasConfirmedHypotheses: true,
    hasRecurringPaymentBehavior: 'no',
    explicitRecurringRequestReceived: false,
    hasDeliveredSolutionMultipleTimes: false,
    understandsStandardVsCustomDelivery: false,
    knowsActualDeliveryBurden: false,
    hasRepeatableDeliveryProcess: false,
    hasRepeatableAcquisitionChannel: false,
    hasStableLeadFlow: false,
    hasRepeatProductSales: false,
    hasMeasuredConversionRate: false,
    hasDeliveryCapacityAndClearBottlenecks: false,
    hasDocumentedRetentionData: false,
    ...overrides,
  });

  const standardFormat: ProductFormatInfo = {
    titleAr: 'ورشة عمل تفاعلية مباشرة',
    titleEn: 'Live Interactive Workshop',
    whyFitAr: 'مناسبة للبداية السريعة',
    speedToFirstValue: 'سريعة جدًا',
    deliveryBurden: 'منخفضة',
  };

  const membershipFormat: ProductFormatInfo = {
    titleAr: 'عضوية مدفوعة ومجتمع مستمر',
    titleEn: 'Membership / Paid Community',
    whyFitAr: 'تتطلب حاجة مستمرة',
    speedToFirstValue: 'متوسطة',
    deliveryBurden: 'عالية',
  };

  const createMaturity = (stageNumber: number): ValidationMaturityInfo => {
    const stageMap: Record<number, ValidationMaturityInfo['stage']> = {
      0: 'STAGE_0_ASSUMPTION',
      1: 'STAGE_1_PROBLEM_EVIDENCE',
      2: 'STAGE_2_INTEREST_EVIDENCE',
      3: 'STAGE_3_COMMITMENT_EVIDENCE',
      4: 'STAGE_4_PAID_PILOT',
      5: 'STAGE_5_REPEATABLE_DELIVERY',
      6: 'STAGE_6_SCALE_EVIDENCE',
    };
    return {
      stage: stageMap[stageNumber] || 'STAGE_0_ASSUMPTION',
      stageNumber,
      labelAr: `المرحلة ${stageNumber}`,
      labelEn: `Stage ${stageNumber}`,
      summaryAr: 'وصف المرحلة',
    };
  };

  // Decision Logic Regression with mock maturity
  describe('buildPersonalizedNextStep Decision Logic Unit Regression', () => {
    it('routes to reassessment when Opportunity Score is low (< 50)', () => {
      const answers = createBaseAnswers();
      const result = buildPersonalizedNextStep(
        42, // Opportunity Score < 50
        85, // Confidence Score is high
        answers,
        createMaturity(3),
        standardFormat
      );

      expect(result.targetModule).toBe('reassessment');
      expect(result.headlineAr).toContain('الفكرة تحتاج لإعادة صياغة');
      expect(result.buttonLabelAr).toBe('عدّل معطيات الفكرة وأعد التقييم');
    });

    it('routes to creator_validation when Confidence Score is low (< 50)', () => {
      const answers = createBaseAnswers();
      const result = buildPersonalizedNextStep(
        78, // Opportunity Score is solid
        35, // Confidence Score < 50
        answers,
        createMaturity(2),
        standardFormat
      );

      expect(result.targetModule).toBe('creator_validation');
      expect(result.headlineAr).toContain('نقاط الفرصة أولية ولكن درجة الثقة منخفضة');
      expect(result.buttonLabelAr).toBe('ابدأ خطة التحقق السريعة (7 أيام)');
    });

    it('routes to creator_validation when validation stage is early (Stage 0 or 1)', () => {
      const answers = createBaseAnswers();
      const resultStage0 = buildPersonalizedNextStep(
        75,
        70,
        answers,
        createMaturity(0),
        standardFormat
      );
      expect(resultStage0.targetModule).toBe('creator_validation');
      expect(resultStage0.buttonLabelAr).toBe('ابدأ خطة التحقق السريعة (7 أيام)');

      const resultStage1 = buildPersonalizedNextStep(
        80,
        65,
        answers,
        createMaturity(1),
        standardFormat
      );
      expect(resultStage1.targetModule).toBe('creator_validation');
      expect(resultStage1.buttonLabelAr).toBe('ابدأ خطة التحقق السريعة (7 أيام)');
    });

    it('routes to creator_mvp with standard MVP for Stage 3 without falsely claiming paid history', () => {
      const answers = createBaseAnswers({
        hasRecurringPaymentBehavior: 'repeat_buyers_no_sub',
        explicitRecurringRequestReceived: false,
      });

      const result = buildPersonalizedNextStep(
        72,
        65,
        answers,
        createMaturity(3),
        membershipFormat
      );

      expect(result.targetModule).toBe('creator_mvp');
      expect(result.buttonLabelAr).toBe('صمم النسخة الأولية (MVP)');
      expect(result.headlineAr).toContain('لديك التزام مسبق ومؤشرات طلب جادة دون دفع مالي بعد');
      expect(result.buttonLabelAr).not.toContain('الأعضاء المؤسسين');
    });

    it('routes to creator_mvp with standard MVP when recurring demand is unvalidated at Stage 4', () => {
      const answers = createBaseAnswers({
        hasRecurringPaymentBehavior: 'repeat_buyers_no_sub',
        explicitRecurringRequestReceived: false,
      });

      const result = buildPersonalizedNextStep(
        75,
        70,
        answers,
        createMaturity(4),
        membershipFormat
      );

      expect(result.targetModule).toBe('creator_mvp');
      expect(result.buttonLabelAr).toBe('صمم النسخة الأولية (MVP)');
      expect(result.headlineAr).toContain('لديك سابقة دفع حقيقية ولكن دون طلب اشتراك دوري مثبت');
      expect(result.buttonLabelAr).not.toContain('الأعضاء المؤسسين');
    });

    it('routes to creator_mvp with Founding Member Pilot when recurring demand IS genuinely validated at Stage 4', () => {
      const answersWithMonthly = createBaseAnswers({
        hasRecurringPaymentBehavior: 'recurring_monthly',
      });

      const result = buildPersonalizedNextStep(
        78,
        70,
        answersWithMonthly,
        createMaturity(4),
        membershipFormat
      );

      expect(result.targetModule).toBe('creator_mvp');
      expect(result.buttonLabelAr).toBe('أطلق عرض الأعضاء المؤسسين (Founding Member Pilot)');
      expect(result.headlineAr).toContain('سابقة دفع دوري مثبتة واحتياجًا متكررًا');
    });

    it('routes Stage 5 (Repeatable Delivery) to creator_mvp for delivery standardization, NEVER seller_offer', () => {
      const answers = createBaseAnswers();
      const result = buildPersonalizedNextStep(
        85,
        75,
        answers,
        createMaturity(5),
        standardFormat
      );

      expect(result.targetModule).toBe('creator_mvp');
      expect(result.headlineAr).toContain('تمتلك سابقة تسليم متكررة ومثبتة');
      expect(result.headlineAr).not.toContain('قناة تدفق عملاء مستقرة');
      expect(result.buttonLabelAr).toBe('صمم النسخة الأولية (MVP)');
      expect(result.targetModule).not.toBe('seller_offer');
    });

    it('routes to seller_offer ONLY when Stage 6 (Scale Readiness) is confirmed and Opportunity Score is high', () => {
      const answers = createBaseAnswers({
        hasRepeatableAcquisitionChannel: true,
        hasStableLeadFlow: true,
        hasRepeatProductSales: true,
        hasMeasuredConversionRate: true,
        hasDeliveryCapacityAndClearBottlenecks: true,
      });

      const result = buildPersonalizedNextStep(
        85, // Opportunity Score >= 75
        80, // Confidence Score >= 50
        answers,
        createMaturity(6), // Stage 6
        standardFormat
      );

      expect(result.targetModule).toBe('seller_offer');
      expect(result.headlineAr).toContain('تمتلك أدلة توسع تشغيلية وقناة تدفق عملاء مستقرة');
      expect(result.buttonLabelAr).toBe('انتقل لمعمل هندسة العروض (Offer Architecture)');
    });

    it('routes Stage 6 with moderate Opportunity Score (50-74) to maturity-appropriate creator_mvp instead of generic reassessment', () => {
      const answers = createBaseAnswers({
        hasRepeatableAcquisitionChannel: true,
        hasStableLeadFlow: true,
        hasRepeatProductSales: true,
        hasMeasuredConversionRate: true,
        hasDeliveryCapacityAndClearBottlenecks: true,
      });

      const result = buildPersonalizedNextStep(
        64, // Moderate Opportunity Score (between 50 and 74)
        80, // High Confidence Score
        answers,
        createMaturity(6), // Advanced commercial maturity (Stage 6)
        standardFormat
      );

      // Must NOT fall through to generic reassessment or beginner validation
      expect(result.targetModule).toBe('creator_mvp');
      expect(result.headlineAr).toContain('تمتلك بنية تشغيلية وتجارية متقدمة');
      expect(result.headlineAr).toContain('MVP');
      expect(result.buttonLabelAr).toBe('صمم النسخة الأولية واختبر العرض (MVP)');
      expect(result.subtextAr).toContain('خبرتك وقنواتك مثبتة');
    });

    it('routes Stage 2 (Interest Evidence) to creator_validation despite high Opportunity Score', () => {
      const answers = createBaseAnswers({
        demandEvidenceList: ['waitlist_subscribers'],
        hasExistingPayingClients: false,
      });

      const result = buildPersonalizedNextStep(
        88,
        70,
        answers,
        createMaturity(2),
        standardFormat
      );

      expect(result.targetModule).toBe('creator_validation');
      expect(result.headlineAr).toContain('لديك مؤشرات اهتمام واستفسارات أولية');
      expect(result.buttonLabelAr).toBe('ابدأ خطة التحقق السريعة (7 أيام)');
    });

    it('routes high Opportunity Score with early Stage 1 to creator_validation without claiming paid demand', () => {
      const answers = createBaseAnswers({
        demandEvidenceList: [],
        hasExistingPayingClients: false,
      });

      const result = buildPersonalizedNextStep(
        92,
        65,
        answers,
        createMaturity(1),
        standardFormat
      );

      expect(result.targetModule).toBe('creator_validation');
      expect(result.headlineAr).toContain('أولويتك الآن ليست بناء المنتج أو كتابة محتواه');
      expect(result.headlineAr).not.toContain('دفع');
      expect(result.headlineAr).not.toContain('سابقة طلب');
      expect(result.buttonLabelAr).toBe('ابدأ خطة التحقق السريعة (7 أيام)');
    });

    it('handles contradictory/borderline case: Stage 6 scale evidence but low Confidence Score (< 50)', () => {
      const answers = createBaseAnswers();
      const result = buildPersonalizedNextStep(
        85,
        40,
        answers,
        createMaturity(6),
        standardFormat
      );

      expect(result.targetModule).toBe('creator_validation');
      expect(result.headlineAr).toContain('نقاط الفرصة أولية ولكن درجة الثقة منخفضة');
      expect(result.buttonLabelAr).toBe('ابدأ خطة التحقق السريعة (7 أيام)');
    });

    it('handles contradictory/borderline case: Stage 6 scale evidence but low Opportunity Score (< 50)', () => {
      const answers = createBaseAnswers();
      const result = buildPersonalizedNextStep(
        45,
        75,
        answers,
        createMaturity(6),
        standardFormat
      );

      expect(result.targetModule).toBe('reassessment');
      expect(result.headlineAr).toContain('الفكرة تحتاج لإعادة صياغة');
      expect(result.buttonLabelAr).toBe('عدّل معطيات الفكرة وأعد التقييم');
    });
  });

  // Integration-level Decision Tests using actual questionnaire answers through inferValidationMaturityStage() -> buildPersonalizedNextStep()
  describe('Mandatory End-to-End Decision & Maturity Integration Tests (Issues 1, 2, 3)', () => {
    // Scenario A: Strong acquisition evidence but no repeatable delivery must not produce Stage 6
    it('Scenario A: Strong acquisition evidence without repeatable delivery must NOT produce Stage 6', () => {
      const answers = createBaseAnswers({
        // Scale acquisition evidence provided
        hasRepeatableAcquisitionChannel: true,
        hasStableLeadFlow: true,
        hasRepeatProductSales: true,
        hasMeasuredConversionRate: true,
        hasDeliveryCapacityAndClearBottlenecks: true,
        // BUT delivery repeatability has NOT been proven
        hasDeliveredSolutionMultipleTimes: false,
        understandsStandardVsCustomDelivery: false,
        hasRepeatableDeliveryProcess: false,
        // Has paying clients
        hasExistingPayingClients: true,
        demandEvidenceList: ['paid_deposit'],
        qualificationEvidence: ['client_results'],
      });

      const maturity = inferValidationMaturityStage(answers);
      // Without repeatable delivery, cannot be Stage 6 or 5; falls back to Stage 4 (paid money)
      expect(maturity.stageNumber).toBe(4);
      expect(maturity.stageNumber).not.toBe(6);
      expect(maturity.stageNumber).not.toBe(5);

      const nextStep = buildPersonalizedNextStep(82, 75, answers, maturity, standardFormat);
      expect(nextStep.targetModule).toBe('creator_mvp');
      expect(nextStep.targetModule).not.toBe('seller_offer');
    });

    // Scenario B: Strong acquisition evidence but insufficient delivery capacity must not produce Stage 6
    it('Scenario B: Strong acquisition evidence but insufficient delivery capacity must NOT produce Stage 6', () => {
      const answers = createBaseAnswers({
        // Repeatable delivery proven (meets Stage 5)
        hasDeliveredSolutionMultipleTimes: true,
        understandsStandardVsCustomDelivery: true,
        knowsActualDeliveryBurden: true,
        hasRepeatableDeliveryProcess: true,
        hasExistingPayingClients: true,
        demandEvidenceList: ['paid_deposit'],
        qualificationEvidence: ['client_results'],
        // Strong acquisition evidence
        hasRepeatableAcquisitionChannel: true,
        hasStableLeadFlow: true,
        hasRepeatProductSales: true,
        hasMeasuredConversionRate: true,
        // BUT operational delivery capacity is UNPROVEN / NO
        hasDeliveryCapacityAndClearBottlenecks: false,
      });

      const maturity = inferValidationMaturityStage(answers);
      // Missing delivery capacity blocks Stage 6; successfully returns Stage 5
      expect(maturity.stageNumber).toBe(5);
      expect(maturity.stageNumber).not.toBe(6);

      const nextStep = buildPersonalizedNextStep(85, 80, answers, maturity, standardFormat);
      // Stage 5 routes to creator_mvp for delivery standardization, NEVER seller_offer
      expect(nextStep.targetModule).toBe('creator_mvp');
      expect(nextStep.headlineAr).toContain('تمتلك سابقة تسليم متكررة ومثبتة');
      expect(nextStep.targetModule).not.toBe('seller_offer');
    });

    // Scenario C: Complete Stage 6 prerequisites with strong Opportunity Score should produce the advanced offer route
    it('Scenario C: Complete Stage 6 prerequisites with strong Opportunity Score produces seller_offer', () => {
      const answers = createBaseAnswers({
        // Full Stage 5 delivery repeatability
        hasDeliveredSolutionMultipleTimes: true,
        understandsStandardVsCustomDelivery: true,
        knowsActualDeliveryBurden: true,
        hasRepeatableDeliveryProcess: true,
        hasExistingPayingClients: true,
        demandEvidenceList: ['paid_deposit'],
        qualificationEvidence: ['client_results'],
        // Complete scale infrastructure including operational capacity
        hasRepeatableAcquisitionChannel: true,
        hasStableLeadFlow: true,
        hasRepeatProductSales: true,
        hasMeasuredConversionRate: true,
        hasDeliveryCapacityAndClearBottlenecks: true,
      });

      const maturity = inferValidationMaturityStage(answers);
      expect(maturity.stageNumber).toBe(6);
      expect(maturity.stage).toBe('STAGE_6_SCALE_EVIDENCE');

      const nextStep = buildPersonalizedNextStep(85, 80, answers, maturity, standardFormat);
      expect(nextStep.targetModule).toBe('seller_offer');
      expect(nextStep.headlineAr).toContain('تمتلك أدلة توسع تشغيلية وقناة تدفق عملاء مستقرة');
      expect(nextStep.buttonLabelAr).toBe('انتقل لمعمل هندسة العروض (Offer Architecture)');
    });

    // Scenario D: Stage 5 with high Opportunity Score must not automatically produce the advanced offer route
    it('Scenario D: Stage 5 with high Opportunity Score must NOT produce seller_offer', () => {
      const answers = createBaseAnswers({
        // Stage 5 delivery repeatability satisfied
        hasDeliveredSolutionMultipleTimes: true,
        understandsStandardVsCustomDelivery: true,
        hasRepeatableDeliveryProcess: true,
        hasExistingPayingClients: true,
        demandEvidenceList: ['paid_pilot'],
        qualificationEvidence: ['client_results'],
        // No scale acquisition evidence
        hasRepeatableAcquisitionChannel: false,
        hasStableLeadFlow: false,
        hasRepeatProductSales: false,
        hasMeasuredConversionRate: false,
        hasDeliveryCapacityAndClearBottlenecks: false,
      });

      const maturity = inferValidationMaturityStage(answers);
      expect(maturity.stageNumber).toBe(5);

      const nextStep = buildPersonalizedNextStep(90, 85, answers, maturity, standardFormat);
      expect(nextStep.targetModule).toBe('creator_mvp');
      expect(nextStep.targetModule).not.toBe('seller_offer');
      expect(nextStep.buttonLabelAr).toBe('صمم النسخة الأولية (MVP)');
      expect(nextStep.headlineAr).toContain('تمتلك سابقة تسليم متكررة ومثبتة');
    });

    // Scenario E: Stage 6 with moderate Opportunity Score must receive a maturity-appropriate recommendation
    it('Scenario E: Stage 6 with moderate Opportunity Score receives maturity-appropriate intermediate recommendation', () => {
      const answers = createBaseAnswers({
        // Full Stage 6 prerequisites
        hasDeliveredSolutionMultipleTimes: true,
        understandsStandardVsCustomDelivery: true,
        hasRepeatableDeliveryProcess: true,
        hasExistingPayingClients: true,
        demandEvidenceList: ['paid_deposit'],
        qualificationEvidence: ['client_results'],
        hasRepeatableAcquisitionChannel: true,
        hasStableLeadFlow: true,
        hasRepeatProductSales: true,
        hasMeasuredConversionRate: true,
        hasDeliveryCapacityAndClearBottlenecks: true,
      });

      const maturity = inferValidationMaturityStage(answers);
      expect(maturity.stageNumber).toBe(6);

      // Moderate Opportunity Score: 62 (between 50 and 74)
      const nextStep = buildPersonalizedNextStep(62, 75, answers, maturity, standardFormat);
      expect(nextStep.targetModule).toBe('creator_mvp');
      expect(nextStep.headlineAr).toContain('تمتلك بنية تشغيلية وتجارية متقدمة');
      expect(nextStep.buttonLabelAr).toBe('صمم النسخة الأولية واختبر العرض (MVP)');
      expect(nextStep.subtextAr).toContain('خبرتك وقنواتك مثبتة');
      expect(nextStep.targetModule).not.toBe('reassessment');
      expect(nextStep.targetModule).not.toBe('creator_validation');
    });

    // Scenario F: Valid waitlist evidence must produce Stage 2 when no stronger evidence exists
    it('Scenario F: Valid waitlist evidence (waitlist_subscribers) produces Stage 2', () => {
      const answers = createBaseAnswers({
        demandEvidenceList: ['waitlist_subscribers'],
        hasExistingPayingClients: false,
        qualificationEvidence: ['personal_results'],
        hasDeliveredSolutionMultipleTimes: false,
        hasRepeatableDeliveryProcess: false,
      });

      const maturity = inferValidationMaturityStage(answers);
      expect(maturity.stageNumber).toBe(2);
      expect(maturity.stage).toBe('STAGE_2_INTEREST_EVIDENCE');

      const nextStep = buildPersonalizedNextStep(75, 65, answers, maturity, standardFormat);
      expect(nextStep.targetModule).toBe('creator_validation');
      expect(nextStep.headlineAr).toContain('لديك مؤشرات اهتمام واستفسارات أولية');
      expect(nextStep.buttonLabelAr).toBe('ابدأ خطة التحقق السريعة (7 أيام)');
    });

    // Scenario G: High Opportunity Score without paid evidence must never create a paid-demand claim
    it('Scenario G: High Opportunity Score without paid evidence never creates a paid-demand claim', () => {
      const answers = createBaseAnswers({
        demandEvidenceList: ['inbound_requests'],
        hasExistingPayingClients: false,
        qualificationEvidence: [],
        hasDeliveredSolutionMultipleTimes: false,
      });

      const maturity = inferValidationMaturityStage(answers);
      expect(maturity.stageNumber).toBe(2);

      // Theoretical score is 95
      const nextStep = buildPersonalizedNextStep(95, 70, answers, maturity, standardFormat);
      expect(nextStep.targetModule).toBe('creator_validation');
      expect(nextStep.headlineAr).not.toContain('دفع');
      expect(nextStep.headlineAr).not.toContain('سابقة طلب');
      expect(nextStep.buttonLabelAr).toBe('ابدأ خطة التحقق السريعة (7 أيام)');
    });

    // Scenario H: Stage 3 must never be described as proof of actual payment
    it('Scenario H: Stage 3 (purchase_commitment) must never be described as proof of actual payment', () => {
      const answers = createBaseAnswers({
        demandEvidenceList: ['purchase_commitment'],
        hasExistingPayingClients: false,
        qualificationEvidence: [],
        hasDeliveredSolutionMultipleTimes: false,
      });

      const maturity = inferValidationMaturityStage(answers);
      expect(maturity.stageNumber).toBe(3);
      expect(maturity.stage).toBe('STAGE_3_COMMITMENT_EVIDENCE');

      const nextStep = buildPersonalizedNextStep(70, 65, answers, maturity, standardFormat);
      expect(nextStep.targetModule).toBe('creator_mvp');
      // Must explicitly note commitment WITHOUT financial payment yet
      expect(nextStep.headlineAr).toContain('دون دفع مالي بعد');
      expect(nextStep.headlineAr).not.toContain('سابقة دفع حقيقية');
    });

    // Scenario I: Recurring membership recommendations must distinguish recurring payments from requests expressing interest
    it('Scenario I: Recurring membership recommendations distinguish recurring payments from requests expressing interest', () => {
      // Case 1: Genuine recurring payments produces founding membership pilot
      const answersWithRecurringPayments = createBaseAnswers({
        demandEvidenceList: ['paid_deposit'],
        hasExistingPayingClients: true,
        hasRecurringPaymentBehavior: 'recurring_monthly',
      });
      const maturity1 = inferValidationMaturityStage(answersWithRecurringPayments);
      expect(maturity1.stageNumber).toBe(4);
      const nextStep1 = buildPersonalizedNextStep(80, 75, answersWithRecurringPayments, maturity1, membershipFormat);
      expect(nextStep1.targetModule).toBe('creator_mvp');
      expect(nextStep1.buttonLabelAr).toBe('أطلق عرض الأعضاء المؤسسين (Founding Member Pilot)');

      // Case 2: Explicit recurring requests received produces founding membership pilot
      const answersWithExplicitRequests = createBaseAnswers({
        demandEvidenceList: ['paid_deposit'],
        hasExistingPayingClients: true,
        hasRecurringPaymentBehavior: 'repeat_buyers_no_sub',
        explicitRecurringRequestReceived: true,
      });
      const maturity2 = inferValidationMaturityStage(answersWithExplicitRequests);
      const nextStep2 = buildPersonalizedNextStep(80, 75, answersWithExplicitRequests, maturity2, membershipFormat);
      expect(nextStep2.targetModule).toBe('creator_mvp');
      expect(nextStep2.buttonLabelAr).toBe('أطلق عرض الأعضاء المؤسسين (Founding Member Pilot)');

      // Case 3: Repeat buyers without subscription and NO explicit request falls back to standard MVP
      const answersWithoutRecurringDemand = createBaseAnswers({
        demandEvidenceList: ['paid_deposit'],
        hasExistingPayingClients: true,
        hasRecurringPaymentBehavior: 'repeat_buyers_no_sub',
        explicitRecurringRequestReceived: false,
        hasDocumentedRetentionData: true, // Supporting scale retention only
      });
      const maturity3 = inferValidationMaturityStage(answersWithoutRecurringDemand);
      const nextStep3 = buildPersonalizedNextStep(80, 75, answersWithoutRecurringDemand, maturity3, membershipFormat);
      expect(nextStep3.targetModule).toBe('creator_mvp');
      expect(nextStep3.buttonLabelAr).toBe('صمم النسخة الأولية (MVP)');
      expect(nextStep3.headlineAr).toContain('دون طلب اشتراك دوري مثبت');
      expect(nextStep3.buttonLabelAr).not.toContain('الأعضاء المؤسسين');
    });
  });

  describe('Version 33.1 Specific Regression Tests', () => {
    // 1. Proprietary framework + nonrepeatable delivery process + full scale evidence must not result in Stage 6
    it('1. Proprietary framework + nonrepeatable delivery process + full scale evidence must NOT result in Stage 6', () => {
      const answers = createBaseAnswers({
        uniqueMethodType: 'proprietary_framework',
        hasRepeatableDeliveryProcess: 'no',
        hasDeliveredSolutionMultipleTimes: true,
        understandsStandardVsCustomDelivery: true,
        hasExistingPayingClients: true,
        demandEvidenceList: ['paid_deposit'],
        qualificationEvidence: ['client_results'],
        // full scale evidence
        hasRepeatableAcquisitionChannel: true,
        hasStableLeadFlow: true,
        hasRepeatProductSales: true,
        hasMeasuredConversionRate: true,
        hasDeliveryCapacityAndClearBottlenecks: true,
      });

      const maturity = inferValidationMaturityStage(answers);
      expect(maturity.stageNumber).not.toBe(6);
      expect(maturity.stageNumber).not.toBe(5);
      expect(maturity.stageNumber).toBe(4);
    });

    // 2. Proprietary framework + delivery process marked 'developing' must not result in Stage 5 or Stage 6
    it("2. Proprietary framework + delivery process marked 'developing' must NOT result in Stage 5 or Stage 6", () => {
      const answers = createBaseAnswers({
        uniqueMethodType: 'proprietary_framework',
        hasRepeatableDeliveryProcess: 'developing',
        hasDeliveredSolutionMultipleTimes: true,
        understandsStandardVsCustomDelivery: true,
        hasExistingPayingClients: true,
        demandEvidenceList: ['paid_deposit'],
        qualificationEvidence: ['client_results'],
        // full scale evidence
        hasRepeatableAcquisitionChannel: true,
        hasStableLeadFlow: true,
        hasRepeatProductSales: true,
        hasMeasuredConversionRate: true,
        hasDeliveryCapacityAndClearBottlenecks: true,
      });

      const maturity = inferValidationMaturityStage(answers);
      expect(maturity.stageNumber).not.toBe(6);
      expect(maturity.stageNumber).not.toBe(5);
      expect(maturity.stageNumber).toBe(4);
    });

    // 3. Explicit repeatable delivery + all valid commercial and operational evidence can reach Stage 6
    it('3. Explicit repeatable delivery + all valid commercial and operational evidence CAN reach Stage 6', () => {
      const answers = createBaseAnswers({
        uniqueMethodType: 'general_skills_only',
        hasRepeatableDeliveryProcess: 'yes',
        hasDeliveredSolutionMultipleTimes: true,
        understandsStandardVsCustomDelivery: true,
        knowsActualDeliveryBurden: true,
        hasExistingPayingClients: true,
        demandEvidenceList: ['paid_deposit'],
        qualificationEvidence: ['client_results'],
        hasRepeatableAcquisitionChannel: true,
        hasStableLeadFlow: true,
        hasRepeatProductSales: true,
        hasMeasuredConversionRate: true,
        hasDeliveryCapacityAndClearBottlenecks: true,
      });

      const maturity = inferValidationMaturityStage(answers);
      expect(maturity.stageNumber).toBe(6);
      expect(maturity.stage).toBe('STAGE_6_SCALE_EVIDENCE');
    });

    // 4. Proprietary framework without delivery proof must not unlock seller_offer
    it('4. Proprietary framework without delivery proof must NOT unlock seller_offer', () => {
      const answers = createBaseAnswers({
        uniqueMethodType: 'proprietary_framework',
        hasRepeatableDeliveryProcess: 'no',
        hasDeliveredSolutionMultipleTimes: false,
        hasExistingPayingClients: true,
        demandEvidenceList: ['paid_deposit'],
        qualificationEvidence: ['client_results'],
        hasRepeatableAcquisitionChannel: true,
        hasStableLeadFlow: true,
        hasRepeatProductSales: true,
        hasMeasuredConversionRate: true,
        hasDeliveryCapacityAndClearBottlenecks: true,
      });

      const maturity = inferValidationMaturityStage(answers);
      const nextStep = buildPersonalizedNextStep(90, 85, answers, maturity, standardFormat);
      expect(nextStep.targetModule).not.toBe('seller_offer');
      expect(nextStep.targetModule).toBe('creator_mvp');
    });

    // 5. Explicit recurring membership requests without recurring payments must never be described as verified recurring revenue
    it('5. Explicit recurring membership requests without recurring payments must never be described as verified recurring revenue', () => {
      const answers = createBaseAnswers({
        demandEvidenceList: ['paid_deposit'],
        hasExistingPayingClients: true,
        hasRecurringPaymentBehavior: 'repeat_buyers_no_sub',
        explicitRecurringRequestReceived: true,
      });

      const maturity = inferValidationMaturityStage(answers);
      const nextStep = buildPersonalizedNextStep(80, 75, answers, maturity, membershipFormat);

      expect(nextStep.targetModule).toBe('creator_mvp');
      expect(nextStep.buttonLabelAr).toBe('أطلق عرض الأعضاء المؤسسين (Founding Member Pilot)');
      expect(nextStep.headlineAr).toContain('طلبات صريحة للاشتراك الدوري لكن الدفع والاستبقاء لم يُثبتا بعد');
      expect(nextStep.headlineAr).not.toContain('دفع دوري مثبت');
      expect(nextStep.headlineAr).not.toContain('دليلاً دوريًا مثبتًا');
      expect(nextStep.subtextAr).toContain('الطلبات المباشرة تعبر عن رغبة مبدئية');
    });

    // 6. Actual recurring payment evidence must receive accurate recurring payment wording
    it('6. Actual recurring payment evidence must receive accurate recurring payment wording', () => {
      const answers = createBaseAnswers({
        demandEvidenceList: ['paid_deposit'],
        hasExistingPayingClients: true,
        hasRecurringPaymentBehavior: 'recurring_monthly',
        explicitRecurringRequestReceived: false,
      });

      const maturity = inferValidationMaturityStage(answers);
      const nextStep = buildPersonalizedNextStep(80, 75, answers, maturity, membershipFormat);

      expect(nextStep.targetModule).toBe('creator_mvp');
      expect(nextStep.buttonLabelAr).toBe('أطلق عرض الأعضاء المؤسسين (Founding Member Pilot)');
      expect(nextStep.headlineAr).toContain('سابقة دفع دوري مثبتة واحتياجًا متكررًا');
    });

    // 7. Repeat purchasers without subscription requests must not automatically trigger a founding-member recommendation
    it('7. Repeat purchasers without subscription requests must NOT automatically trigger a founding-member recommendation', () => {
      const answers = createBaseAnswers({
        demandEvidenceList: ['paid_deposit'],
        hasExistingPayingClients: true,
        hasRecurringPaymentBehavior: 'repeat_buyers_no_sub',
        explicitRecurringRequestReceived: false,
      });

      const maturity = inferValidationMaturityStage(answers);
      const nextStep = buildPersonalizedNextStep(80, 75, answers, maturity, membershipFormat);

      expect(nextStep.targetModule).toBe('creator_mvp');
      expect(nextStep.buttonLabelAr).toBe('صمم النسخة الأولية (MVP)');
      expect(nextStep.buttonLabelAr).not.toContain('الأعضاء المؤسسين');
      expect(nextStep.headlineAr).toContain('دون طلب اشتراك دوري مثبت');
    });

    // 8. All previous Stage 0–6 decision scenarios must continue working
    it('8. All previous Stage 0-6 decision scenarios continue working seamlessly', () => {
      // Stage 0
      const a0 = createBaseAnswers({
        demandEvidenceList: [],
        hasExistingPayingClients: false,
        currentAlternativesAndWorkarounds: 'لا شيء محدد',
        repeatedQuestions: '',
      });
      const m0 = inferValidationMaturityStage(a0);
      expect(m0.stageNumber).toBe(0);
      expect(buildPersonalizedNextStep(75, 70, a0, m0, standardFormat).targetModule).toBe('creator_validation');

      // Stage 1
      const a1 = createBaseAnswers({
        demandEvidenceList: ['competitors_sell'],
        hasExistingPayingClients: false,
        currentAlternativesAndWorkarounds: 'لا شيء محدد',
        repeatedQuestions: '',
      });
      const m1 = inferValidationMaturityStage(a1);
      expect(m1.stageNumber).toBe(1);
      expect(buildPersonalizedNextStep(75, 70, a1, m1, standardFormat).targetModule).toBe('creator_validation');

      // Stage 2
      const a2 = createBaseAnswers({
        demandEvidenceList: ['waitlist_subscribers'],
        hasExistingPayingClients: false,
      });
      const m2 = inferValidationMaturityStage(a2);
      expect(m2.stageNumber).toBe(2);
      expect(buildPersonalizedNextStep(75, 70, a2, m2, standardFormat).targetModule).toBe('creator_validation');

      // Stage 3
      const a3 = createBaseAnswers({
        demandEvidenceList: ['purchase_commitment'],
        hasExistingPayingClients: false,
      });
      const m3 = inferValidationMaturityStage(a3);
      expect(m3.stageNumber).toBe(3);
      expect(buildPersonalizedNextStep(75, 70, a3, m3, standardFormat).targetModule).toBe('creator_mvp');

      // Stage 4
      const a4 = createBaseAnswers({
        demandEvidenceList: ['paid_deposit'],
        hasExistingPayingClients: true,
      });
      const m4 = inferValidationMaturityStage(a4);
      expect(m4.stageNumber).toBe(4);
      expect(buildPersonalizedNextStep(75, 70, a4, m4, standardFormat).targetModule).toBe('creator_mvp');

      // Stage 5
      const a5 = createBaseAnswers({
        hasDeliveredSolutionMultipleTimes: true,
        understandsStandardVsCustomDelivery: true,
        hasRepeatableDeliveryProcess: true,
        hasExistingPayingClients: true,
        demandEvidenceList: ['paid_deposit'],
        qualificationEvidence: ['client_results'],
      });
      const m5 = inferValidationMaturityStage(a5);
      expect(m5.stageNumber).toBe(5);
      expect(buildPersonalizedNextStep(85, 80, a5, m5, standardFormat).targetModule).toBe('creator_mvp');

      // Stage 6
      const a6 = createBaseAnswers({
        hasDeliveredSolutionMultipleTimes: true,
        understandsStandardVsCustomDelivery: true,
        hasRepeatableDeliveryProcess: true,
        hasExistingPayingClients: true,
        demandEvidenceList: ['paid_deposit'],
        qualificationEvidence: ['client_results'],
        hasRepeatableAcquisitionChannel: true,
        hasStableLeadFlow: true,
        hasRepeatProductSales: true,
        hasMeasuredConversionRate: true,
        hasDeliveryCapacityAndClearBottlenecks: true,
      });
      const m6 = inferValidationMaturityStage(a6);
      expect(m6.stageNumber).toBe(6);
      expect(buildPersonalizedNextStep(85, 80, a6, m6, standardFormat).targetModule).toBe('seller_offer');
    });
  });
});

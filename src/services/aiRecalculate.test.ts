// @ts-nocheck
import { describe, it, expect, vi } from 'vitest';
import {
  computeAiInputFingerprint,
  isValidAiInterpretation,
  FINGERPRINT_SCHEMA_VERSION,
} from './aiService';
import { analyzeOpportunity } from '../data/strategicEngine';
import { QuestionnaireAnswers, AiStrategicInterpretation, StrategicReport } from '../types';
import { createAnalysisCoordinator } from './coordinator';

describe('AI Integrity and Interactive Recalculation', () => {
  const baseAnswers: QuestionnaireAnswers = {
    userPath: 'specific_idea',
    productNameOrWorkingTitle: 'كورس إتقان إعلانات سناب شات',
    expertiseDomain: 'التسويق الرقمي وإعلانات منصات التواصل',
    yearsOfExperience: '5_to_10',
    targetBuyerDescription: 'أصحاب المتاجر الإلكترونية في الخليج',
    buyerStageAndSituation: 'لديهم مبيعات أولية لكن تكلفة الإعلانات مرتفعة',
    buyerCurrentBehavior: 'يعتمدون على إعلانات عشوائية واستشارات غير مجدية',
    isBuyerBroadOrSpecific: 'narrow_specific',
    coreProblemDescription: 'صعوبة ضبط تكلفة الاستقطاب وتتبع الحملات بدقة',
    problemFrequency: 'daily',
    costOfInaction: ['money_loss', 'wasted_hours'],
    currentAlternativesAndWorkarounds: 'بيجربوا حملات عشوائية وبيخسروا ميزانيات إعلانية كل شهر',
    beforeState: 'صرف ميزانيات بدون مبيعات واضحة وخوف من الخسارة',
    afterState: 'حملات مربحة بنسبة عائد 4X على الإنفاق الإعلاني',
    transformationRealism: 'highly_controllable',
    deliveryMechanism: ['framework_steps', 'templates_tools'],
    creatorMethodSummary: 'قمع استقطاب إعلاني ثلاثي المراحل',
    uniqueMethodType: 'proprietary_framework',
    uniqueMethodOrProcess: 'منهجية القمع الثلاثي للاستقطاب والتحويل',
    creatorTimePerCustomer: 'under_30m',
    requiresPersonalFeedback: false,
    requiresOneOnOneAccountability: false,
    personalFeedbackState: 'not_required',
    oneOnOneAccountabilityState: 'not_required',
    expectedPriceTier: 'mid_150_500',
    productRoleInBusiness: 'core_flagship',
    existingAudienceChannel: 'حساب تويتر نشط مع 10 آلاف متابع',
    demandEvidenceList: ['paid_deposit', 'purchase_commitment'],
    hasExistingPayingClients: true,
    audienceAccessLevel: 'direct_daily',
    qualificationEvidence: ['client_results', 'work_experience'],
    hasConfirmedHypotheses: true,
    fieldProvenance: {
      coreProblem: 'user_explicit',
      demandEvidence: 'user_explicit',
      desiredTransformation: 'user_explicit',
      productTitle: 'user_explicit',
      qualification: 'user_explicit',
      targetBuyer: 'user_explicit',
      uniqueMethod: 'confirmed_by_user',
    },
  };

  const sampleAiInterpretation: AiStrategicInterpretation = {
    strongest_underused_advantage: 'النتائج السابقة مع عملاء المتاجر تمنحك إثباتًا اجتماعيًا حاسمًا',
    highest_risk_assumption: 'افتراض استعداد كل صاحب متجر لتطبيق الإعلانات بنفسه دون طلب خدمة إدارة كاملة',
    evidence_gap: 'غياب التأكيد على تفضيل أصحاب المتاجر للتعلم الذاتي بدل التوظيف الخارجي',
    strategic_interpretation: 'الفرصة قوية وتستحق الإطلاق كحزمة تدريبية مقننة مع قوالب جاهزة',
    recommended_test: 'طرح 5 مقاعد تجريبية لورشة عمل مكثفة على سناب شات بسعر 200 دولار',
    recommended_test_reason: 'لقياس استعدادهم للدفع مقابل التعلم المباشر قبل تسجيل فيديوهات مسجلة',
    what_not_to_do: 'لا تقدم إدارة حملات مجانية وتسميها منتجًا رقميًا',
    next_best_question: 'هل يبحث صاحب المتجر عن تعلم المهارة أم عن نتيجة سريعة جاهزة؟',
  };

  const sampleAiInterpretationB: AiStrategicInterpretation = {
    strongest_underused_advantage: 'خبرة العمل مع عملاء كبار',
    highest_risk_assumption: 'استهلاك وقتك بالكامل في المتابعة الفردية',
    evidence_gap: 'لا توجد أدلة على قدرة المشتري على التطبيق المستقل',
    strategic_interpretation: 'الفكرة تتطلب تقنينا أكبر قبل التوسع',
    recommended_test: 'مراجعة نموذج الاستشارة مع أول عميلين',
    recommended_test_reason: 'لمعرفة الخطوات المتكررة بدقة',
    what_not_to_do: 'لا تبنِ مجتمعا تفاعليا قبل التأكد من التزامهم',
    next_best_question: 'كم ساعة يمكنك تخصيصها لكل مشترك أسبوعيا؟',
  };

  const sampleAiInterpretationC: AiStrategicInterpretation = {
    strongest_underused_advantage: 'وضوح الخطوات وقابلية الأتمتة',
    highest_risk_assumption: 'ضعف الوصول المباشر للجمهور الجديد',
    evidence_gap: 'غياب قنوات استقطاب مستقرة',
    strategic_interpretation: 'منتجك الرقمي جاهز ولكن التوزيع يحتاج تركيزا',
    recommended_test: 'إطلاق حملة محتوى عضوي مستهدفة',
    recommended_test_reason: 'لتأكيد اهتمام المشترين الجدد بالعرض',
    what_not_to_do: 'لا تضف ميزات معقدة غير مطلوبة',
    next_best_question: 'أين يقضي عملاؤك المستهدفون معظم وقتهم أونلاين؟',
  };

  describe('1. Canonical Deterministic Input Fingerprinting', () => {
    it('includes schema version v3 in the fingerprint', () => {
      const fp = computeAiInputFingerprint(baseAnswers);
      const parsed = JSON.parse(fp);
      expect(parsed._schema).toBe(FINGERPRINT_SCHEMA_VERSION);
      expect(parsed._schema).toBe('v3');
    });

    it('produces identical fingerprints for identical inputs', () => {
      const fp1 = computeAiInputFingerprint(baseAnswers);
      const fp2 = computeAiInputFingerprint({ ...baseAnswers });
      expect(fp1).toBe(fp2);
    });

    it('produces identical fingerprints regardless of surrounding whitespace or string casing', () => {
      const fp1 = computeAiInputFingerprint(baseAnswers);
      const modifiedWhitespace: QuestionnaireAnswers = {
        ...baseAnswers,
        targetBuyerDescription: '  أصحاب المتاجر الإلكترونية في الخليج   ',
        expertiseDomain: '  التسويق الرقمي وإعلانات منصات التواصل  ',
      };
      const fp2 = computeAiInputFingerprint(modifiedWhitespace);
      expect(fp1).toBe(fp2);
    });

    it('produces identical fingerprints regardless of array item ordering in multi-select fields', () => {
      const fp1 = computeAiInputFingerprint(baseAnswers);
      const reordered: QuestionnaireAnswers = {
        ...baseAnswers,
        costOfInaction: ['wasted_hours', 'money_loss'],
        demandEvidenceList: ['purchase_commitment', 'paid_deposit'],
      };
      const fp2 = computeAiInputFingerprint(reordered);
      expect(fp1).toBe(fp2);
    });

    it('changes fingerprint when previously omitted questionnaire fields are modified', () => {
      const fpBase = computeAiInputFingerprint(baseAnswers);

      // 1. buyerStageAndSituation
      const fpBuyerStage = computeAiInputFingerprint({
        ...baseAnswers,
        buyerStageAndSituation: 'مرحلة متقدمة بميزانيات تفوق 10 آلاف دولار',
      });
      expect(fpBuyerStage).not.toBe(fpBase);

      // 2. buyerCurrentBehavior
      const fpBuyerBehavior = computeAiInputFingerprint({
        ...baseAnswers,
        buyerCurrentBehavior: 'يوظفون وكالات خارجية بتكاليف باهظة',
      });
      expect(fpBuyerBehavior).not.toBe(fpBase);

      // 3. creatorMethodSummary
      const fpMethodSummary = computeAiInputFingerprint({
        ...baseAnswers,
        creatorMethodSummary: 'ورش عمل مسجلة مع تمبليتات نوشن تفاعلية',
      });
      expect(fpMethodSummary).not.toBe(fpBase);

      // 4. fieldProvenance
      const fpProv = computeAiInputFingerprint({
        ...baseAnswers,
        fieldProvenance: {
          ...baseAnswers.fieldProvenance,
          targetBuyer: 'confirmed_by_user',
        },
      });
      expect(fpProv).not.toBe(fpBase);

      // 5. hasRepeatableDeliveryProcess (Stage 5)
      const fpRepeatableDelivery = computeAiInputFingerprint({
        ...baseAnswers,
        hasRepeatableDeliveryProcess: true,
      });
      expect(fpRepeatableDelivery).not.toBe(fpBase);

      // 6. hasStableLeadFlow (Stage 6)
      const fpStableLead = computeAiInputFingerprint({
        ...baseAnswers,
        hasStableLeadFlow: true,
      });
      expect(fpStableLead).not.toBe(fpBase);
    });
  });

  describe('2. Deterministic Scoring Authority (AI Never Overrides Scores)', () => {
    it('produces identical opportunityScore and confidenceScore with or without AI', () => {
      const reportDeterministic = analyzeOpportunity(baseAnswers, null);
      const reportWithAi = analyzeOpportunity(baseAnswers, sampleAiInterpretation);

      expect(reportWithAi.opportunityScore).toBe(reportDeterministic.opportunityScore);
      expect(reportWithAi.confidenceScore).toBe(reportDeterministic.confidenceScore);
      expect(reportWithAi.opportunityBand.id).toBe(reportDeterministic.opportunityBand.id);
      expect(reportWithAi.confidenceBand.id).toBe(reportDeterministic.confidenceBand.id);
      expect(reportWithAi.validationMaturity?.stage).toBe(reportDeterministic.validationMaturity?.stage);
      expect(reportWithAi.formatRecommendation.primary.titleEn).toBe(
        reportDeterministic.formatRecommendation.primary.titleEn
      );
    });
  });

  describe('3. Asynchronous Race Condition Protection (Core Regression Suite)', () => {
    /**
     * Simulation environment representing App.tsx state and ref guards
     */
    function createRecalculatorSimulation(initialAnswers: QuestionnaireAnswers, initialAi: AiStrategicInterpretation) {
      let activeReport: StrategicReport | null = analyzeOpportunity(initialAnswers, initialAi, {
        reportId: 'RPT-TEST-1',
        createdAt: new Date().toISOString(),
        aiFingerprint: computeAiInputFingerprint(initialAnswers),
      });

      const aiCache = new Map<string, AiStrategicInterpretation>();
      aiCache.set(computeAiInputFingerprint(initialAnswers), initialAi);

      let recalculateSequence = 0;
      let latestTargetFingerprint = computeAiInputFingerprint(initialAnswers);
      let latestTargetReportId = activeReport.id;

      const invalidatePending = () => {
        recalculateSequence++;
        latestTargetFingerprint = '';
        latestTargetReportId = '';
      };

      const handleUpdateAnswers = (updatedAnswers: QuestionnaireAnswers, aiResolver?: (reportCore: any, ans: any) => Promise<AiStrategicInterpretation | null>) => {
        if (!activeReport) return;
        const newFingerprint = computeAiInputFingerprint(updatedAnswers);
        const targetReportId = activeReport.id;

        // STEP 1: ALWAYS invalidate any outstanding in-flight AI requests FIRST on EVERY answer update
        const sequenceId = ++recalculateSequence;
        latestTargetFingerprint = newFingerprint;
        latestTargetReportId = targetReportId;

        const prevFingerprint = activeReport.aiFingerprint;

        // STEP 2: Retain if same fingerprint and valid AI
        if (
          prevFingerprint &&
          prevFingerprint === newFingerprint &&
          activeReport.aiInterpretation &&
          isValidAiInterpretation(activeReport.aiInterpretation)
        ) {
          activeReport = analyzeOpportunity(updatedAnswers, activeReport.aiInterpretation, {
            reportId: targetReportId,
            createdAt: activeReport.createdAt,
            aiFingerprint: newFingerprint,
            isAiRecalculating: false,
          });
          return;
        }

        // STEP 3: Cache hit reuse
        const cachedMatchingAi = aiCache.get(newFingerprint);
        if (cachedMatchingAi && isValidAiInterpretation(cachedMatchingAi)) {
          activeReport = analyzeOpportunity(updatedAnswers, cachedMatchingAi, {
            reportId: targetReportId,
            createdAt: activeReport.createdAt,
            aiFingerprint: newFingerprint,
            isAiRecalculating: false,
          });
          return;
        }

        // STEP 4: Stale AI Invalidation
        const immediateReport = analyzeOpportunity(updatedAnswers, null, {
          reportId: targetReportId,
          createdAt: activeReport.createdAt,
          isAiRecalculating: true,
        });
        activeReport = immediateReport;

        const isRequestStillCurrent = (prev: StrategicReport | null): boolean => {
          if (!prev) return false;
          if (prev.id !== targetReportId) return false;
          if (recalculateSequence !== sequenceId) return false;
          if (latestTargetFingerprint !== newFingerprint) return false;
          if (latestTargetReportId !== targetReportId) return false;
          if (computeAiInputFingerprint(prev.answers) !== newFingerprint) return false;
          return true;
        };

        // STEP 5: Async background request
        if (aiResolver) {
          return aiResolver(immediateReport, updatedAnswers)
            .then((freshAi) => {
              if (
                recalculateSequence !== sequenceId ||
                latestTargetFingerprint !== newFingerprint ||
                latestTargetReportId !== targetReportId
              ) {
                return; // Discard superseded
              }

              if (freshAi && isValidAiInterpretation(freshAi)) {
                aiCache.set(newFingerprint, freshAi);
                if (isRequestStillCurrent(activeReport)) {
                  activeReport = analyzeOpportunity(updatedAnswers, freshAi, {
                    reportId: targetReportId,
                    createdAt: activeReport.createdAt,
                    aiFingerprint: newFingerprint,
                    isAiRecalculating: false,
                  });
                }
              } else {
                if (isRequestStillCurrent(activeReport)) {
                  activeReport = {
                    ...activeReport,
                    isAiRecalculating: false,
                    analysisMode: 'rules_only',
                    aiInterpretation: undefined,
                    aiFingerprint: undefined,
                  };
                }
              }
            })
            .catch(() => {
              if (isRequestStillCurrent(activeReport)) {
                activeReport = {
                  ...activeReport,
                  isAiRecalculating: false,
                  analysisMode: 'rules_only',
                  aiInterpretation: undefined,
                  aiFingerprint: undefined,
                };
              }
            });
        }
      };

      const handleReset = () => {
        invalidatePending();
        activeReport = null;
      };

      return {
        getActiveReport: () => activeReport,
        handleUpdateAnswers,
        handleReset,
        aiCache,
      };
    }

    it('Scenario 1: A → B → A with an older B request still pending preserves A and ignores B', async () => {
      const answersA = { ...baseAnswers };
      const answersB = { ...baseAnswers, creatorTimePerCustomer: 'high_touch' };

      const sim = createRecalculatorSimulation(answersA, sampleAiInterpretation);

      let resolveB: (res: any) => void;
      const promiseB = new Promise((resolve) => {
        resolveB = resolve;
      });

      // 1. Transition to B (async request starts)
      sim.handleUpdateAnswers(answersB, () => promiseB);
      expect(sim.getActiveReport()?.answers.creatorTimePerCustomer).toBe('high_touch');
      expect(sim.getActiveReport()?.analysisMode).toBe('rules_only');
      expect(sim.getActiveReport()?.isAiRecalculating).toBe(true);

      // 2. Transition back to A before B resolves (hits cache for A!)
      sim.handleUpdateAnswers(answersA);
      expect(sim.getActiveReport()?.answers.creatorTimePerCustomer).toBe('under_30m');
      expect(sim.getActiveReport()?.analysisMode).toBe('hybrid_ai');
      expect(sim.getActiveReport()?.aiInterpretation?.strategic_interpretation).toBe(
        sampleAiInterpretation.strategic_interpretation
      );

      // 3. Request B finally resolves
      resolveB!(sampleAiInterpretationB);
      await promiseB;

      // 4. Verification: active report MUST remain A with A's AI interpretation!
      expect(sim.getActiveReport()?.answers.creatorTimePerCustomer).toBe('under_30m');
      expect(sim.getActiveReport()?.analysisMode).toBe('hybrid_ai');
      expect(sim.getActiveReport()?.aiInterpretation?.strategic_interpretation).toBe(
        sampleAiInterpretation.strategic_interpretation
      );
      expect(sim.getActiveReport()?.isAiRecalculating).toBe(false);
    });

    it('Scenario 2: A → B → C with responses arriving in reverse order (C arrives first, B arrives second)', async () => {
      const answersA = { ...baseAnswers };
      const answersB = { ...baseAnswers, problemFrequency: 'monthly' };
      const answersC = { ...baseAnswers, problemFrequency: 'daily', isBuyerBroadOrSpecific: 'broad_general' };

      const sim = createRecalculatorSimulation(answersA, sampleAiInterpretation);

      let resolveB: (res: any) => void;
      const promiseB = new Promise((resolve) => {
        resolveB = resolve;
      });

      let resolveC: (res: any) => void;
      const promiseC = new Promise((resolve) => {
        resolveC = resolve;
      });

      // 1. Transition A -> B
      sim.handleUpdateAnswers(answersB, () => promiseB);

      // 2. Transition B -> C
      sim.handleUpdateAnswers(answersC, () => promiseC);
      expect(sim.getActiveReport()?.answers.isBuyerBroadOrSpecific).toBe('broad_general');

      // 3. Response C arrives first
      resolveC!(sampleAiInterpretationC);
      await promiseC;
      expect(sim.getActiveReport()?.analysisMode).toBe('hybrid_ai');
      expect(sim.getActiveReport()?.aiInterpretation?.strategic_interpretation).toBe(
        sampleAiInterpretationC.strategic_interpretation
      );

      // 4. Response B arrives second (outdated!)
      resolveB!(sampleAiInterpretationB);
      await promiseB;

      // 5. Verification: active report MUST remain C with C's AI interpretation!
      expect(sim.getActiveReport()?.answers.isBuyerBroadOrSpecific).toBe('broad_general');
      expect(sim.getActiveReport()?.analysisMode).toBe('hybrid_ai');
      expect(sim.getActiveReport()?.aiInterpretation?.strategic_interpretation).toBe(
        sampleAiInterpretationC.strategic_interpretation
      );
    });

    it('Scenario 3: A failed older request completing after a newer valid result does not clear new report state', async () => {
      const answersB = { ...baseAnswers, problemFrequency: 'occasional' };
      const answersC = { ...baseAnswers, problemFrequency: 'weekly' };

      const sim = createRecalculatorSimulation(baseAnswers, sampleAiInterpretation);

      let rejectB: (err: any) => void;
      const promiseB = new Promise((_, reject) => {
        rejectB = reject;
      });

      let resolveC: (res: any) => void;
      const promiseC = new Promise((resolve) => {
        resolveC = resolve;
      });

      // Request B starts
      sim.handleUpdateAnswers(answersB, () => promiseB);

      // User changes to C
      sim.handleUpdateAnswers(answersC, () => promiseC);

      // C resolves successfully
      resolveC!(sampleAiInterpretationC);
      await promiseC;
      expect(sim.getActiveReport()?.analysisMode).toBe('hybrid_ai');

      // B fails afterward
      rejectB!(new Error('Network error on old request B'));
      try {
        await promiseB;
      } catch {}

      // Verification: C MUST retain hybrid_ai and not be cleared or set to error
      expect(sim.getActiveReport()?.answers.problemFrequency).toBe('weekly');
      expect(sim.getActiveReport()?.analysisMode).toBe('hybrid_ai');
      expect(sim.getActiveReport()?.aiInterpretation?.strategic_interpretation).toBe(
        sampleAiInterpretationC.strategic_interpretation
      );
    });

    it('Scenario 4: Reset initiation while AI is pending discards response and does not resurrect report', async () => {
      const answersB = { ...baseAnswers, creatorTimePerCustomer: 'high_touch' };
      const sim = createRecalculatorSimulation(baseAnswers, sampleAiInterpretation);

      let resolveB: (res: any) => void;
      const promiseB = new Promise((resolve) => {
        resolveB = resolve;
      });

      sim.handleUpdateAnswers(answersB, () => promiseB);
      expect(sim.getActiveReport()?.isAiRecalculating).toBe(true);

      // User resets analysis
      sim.handleReset();
      expect(sim.getActiveReport()).toBeNull();

      // B finishes in background
      resolveB!(sampleAiInterpretationB);
      await promiseB;

      // Verification: active report MUST still be null!
      expect(sim.getActiveReport()).toBeNull();
    });

    it('Scenario 5: Cache reuse only when the full canonical fingerprint matches', () => {
      const answers1 = { ...baseAnswers };
      const answers2 = { ...baseAnswers, creatorTimePerCustomer: '1_to_2h' };

      const fp1 = computeAiInputFingerprint(answers1);
      const fp2 = computeAiInputFingerprint(answers2);

      const cache = new Map<string, AiStrategicInterpretation>();
      cache.set(fp1, sampleAiInterpretation);

      expect(cache.get(fp1)).toBeDefined();
      expect(cache.get(fp2)).toBeUndefined();
    });

    it('Scenario 6: Identical inputs reuse valid AI safely and keep hybrid_ai mode', () => {
      const report1 = analyzeOpportunity(baseAnswers, sampleAiInterpretation, {
        reportId: 'RPT-1',
        createdAt: '2026-10-10T00:00:00Z',
        aiFingerprint: computeAiInputFingerprint(baseAnswers),
      });

      const equivalentAnswers = {
        ...baseAnswers,
        expertiseDomain: '  التسويق الرقمي وإعلانات منصات التواصل  ',
      };

      const fp1 = computeAiInputFingerprint(baseAnswers);
      const fp2 = computeAiInputFingerprint(equivalentAnswers);
      expect(fp1).toBe(fp2);

      const report2 = analyzeOpportunity(equivalentAnswers, report1.aiInterpretation, {
        reportId: report1.id,
        createdAt: report1.createdAt,
        aiFingerprint: fp2,
      });

      expect(report2.analysisMode).toBe('hybrid_ai');
      expect(report2.aiInterpretation).toEqual(sampleAiInterpretation);
    });

    it('Scenario 7: Incomplete or empty AI interpretations are rejected by analyzeOpportunity', () => {
      const invalidAi = {
        ...sampleAiInterpretation,
        strategic_interpretation: '',
      };

      const report = analyzeOpportunity(baseAnswers, invalidAi as any);
      expect(report.analysisMode).toBe('rules_only');
      expect(report.aiInterpretation).toBeUndefined();
    });

    it('Scenario 8: Printed report never includes an outdated interpretation during recalculation', () => {
      const modifiedAnswers = {
        ...baseAnswers,
        creatorTimePerCustomer: 'high_touch',
      };

      // When answers change, immediate report is rules_only
      const recalculatedReport = analyzeOpportunity(modifiedAnswers, null, {
        reportId: 'RPT-1',
        isAiRecalculating: true,
      });

      // Verification: guard condition for printing AI section evaluates to false
      const canRenderAiInPrint =
        recalculatedReport.analysisMode === 'hybrid_ai' &&
        isValidAiInterpretation(recalculatedReport.aiInterpretation);

      expect(canRenderAiInPrint).toBe(false);
      expect(recalculatedReport.analysisMode).toBe('rules_only');
      expect(recalculatedReport.aiInterpretation).toBeUndefined();
    });
  });

  describe('4. Live Request Coordination Integration Suite', () => {
    it('Integration: Original submission is discarded if user resets before AI arrives', async () => {
      const coordinator = createAnalysisCoordinator();

      let resolveAi: (val: any) => void;
      const pendingAiPromise = new Promise((resolve) => {
        resolveAi = resolve;
      });

      // Submit original analysis
      const submissionPromise = coordinator.handleQuestionnaireSubmit(
        baseAnswers,
        () => pendingAiPromise as any
      );

      expect(coordinator.getState().step).toBe('analyzing');

      // User resets while AI is pending
      coordinator.handleReset();
      expect(coordinator.getState().step).toBe('landing');
      expect(coordinator.getState().activeReport).toBeNull();

      // AI arrives after reset
      resolveAi!(sampleAiInterpretation);
      await submissionPromise;

      // Must remain reset on landing
      expect(coordinator.getState().step).toBe('landing');
      expect(coordinator.getState().activeReport).toBeNull();
    });

    it('Integration: Original submission is superseded if user starts a new analysis', async () => {
      const coordinator = createAnalysisCoordinator();

      let resolveAi1: (val: any) => void;
      const pendingAiPromise1 = new Promise((resolve) => {
        resolveAi1 = resolve;
      });

      const submissionPromise1 = coordinator.handleQuestionnaireSubmit(
        baseAnswers,
        () => pendingAiPromise1 as any
      );

      // User navigates back and submits different analysis
      const answers2 = { ...baseAnswers, creatorTimePerCustomer: 'high_touch' };
      const submissionPromise2 = coordinator.handleQuestionnaireSubmit(
        answers2,
        async () => sampleAiInterpretationB
      );

      await submissionPromise2;
      expect(coordinator.getState().activeReport?.answers.creatorTimePerCustomer).toBe('high_touch');
      expect(coordinator.getState().activeReport?.aiInterpretation?.strategic_interpretation).toBe(
        sampleAiInterpretationB.strategic_interpretation
      );

      // Delayed AI1 arrives
      resolveAi1!(sampleAiInterpretation);
      await submissionPromise1;

      // Must remain report 2
      expect(coordinator.getState().activeReport?.answers.creatorTimePerCustomer).toBe('high_touch');
      expect(coordinator.getState().activeReport?.aiInterpretation?.strategic_interpretation).toBe(
        sampleAiInterpretationB.strategic_interpretation
      );
    });

    it('Integration: Rapid recalculation drops slow earlier requests and prevents state corruption', async () => {
      const coordinator = createAnalysisCoordinator();
      // First, complete an original submission
      await coordinator.handleQuestionnaireSubmit(baseAnswers, async () => sampleAiInterpretation);
      expect(coordinator.getState().activeReport?.analysisMode).toBe('hybrid_ai');

      const answersB = { ...baseAnswers, creatorTimePerCustomer: '1_to_2h' };
      const answersC = { ...baseAnswers, creatorTimePerCustomer: 'high_touch' };

      let resolveB: (val: any) => void;
      const promiseB = new Promise((resolve) => {
        resolveB = resolve;
      });

      let resolveC: (val: any) => void;
      const promiseC = new Promise((resolve) => {
        resolveC = resolve;
      });

      // Rapidly update to B then C
      const recalculateB = coordinator.handleUpdateAnswers(answersB, () => promiseB as any);
      const recalculateC = coordinator.handleUpdateAnswers(answersC, () => promiseC as any);

      // C resolves first
      resolveC!(sampleAiInterpretationC);
      await recalculateC;

      expect(coordinator.getState().activeReport?.answers.creatorTimePerCustomer).toBe('high_touch');
      expect(coordinator.getState().activeReport?.aiInterpretation?.strategic_interpretation).toBe(
        sampleAiInterpretationC.strategic_interpretation
      );

      // B resolves second
      resolveB!(sampleAiInterpretationB);
      await recalculateB;

      // Must remain C
      expect(coordinator.getState().activeReport?.answers.creatorTimePerCustomer).toBe('high_touch');
      expect(coordinator.getState().activeReport?.aiInterpretation?.strategic_interpretation).toBe(
        sampleAiInterpretationC.strategic_interpretation
      );
    });

    it('Integration: AI failure keeps authoritative deterministic report in rules_only mode', async () => {
      const coordinator = createAnalysisCoordinator();
      await coordinator.handleQuestionnaireSubmit(baseAnswers, async () => sampleAiInterpretation);

      const answersB = { ...baseAnswers, targetBuyerDescription: 'أطباء الأسنان في الرياض' };

      const recalculateB = coordinator.handleUpdateAnswers(answersB, async () => {
        throw new Error('AI Service 503 Unavailable');
      });

      await recalculateB;

      const report = coordinator.getState().activeReport;
      expect(report).toBeDefined();
      expect(report?.answers.targetBuyerDescription).toBe('أطباء الأسنان في الرياض');
      expect(report?.analysisMode).toBe('rules_only');
      expect(report?.aiInterpretation).toBeUndefined();
      expect(report?.isAiRecalculating).toBe(false);
      // Authoritative score is calculated deterministically
      expect(typeof report?.opportunityScore).toBe('number');
    });
  });

  describe('4. Recommended Product Format & Recurring Revenue Evidence Integrity', () => {
    it('Paying consulting clients with repeat purchases do NOT automatically get recommended Membership', () => {
      const consultingAnswers: QuestionnaireAnswers = {
        ...baseAnswers,
        problemFrequency: 'daily',
        hasExistingPayingClients: true,
        hasRecurringPaymentBehavior: 'repeat_buyers_no_sub',
        recurringBuyerCountApprox: 8,
        explicitRecurringRequestReceived: false,
        recurringValueReason: '', // No subscription renewal reason
        creatorTimePerCustomer: 'high_touch',
        requiresPersonalFeedback: true,
        personalFeedbackState: 'required',
        expectedPriceTier: 'premium_500_plus',
        productRoleInBusiness: 'backend_service_feeder',
      };

      const report = analyzeOpportunity(consultingAnswers);

      // Primary must NOT be Membership
      expect(report.formatRecommendation.primary.titleEn).not.toBe('Membership');
      // Should favor high-touch / productized consulting or cohort sprint
      expect(['Productized Consulting', 'Cohort / Sprint', 'Live Workshop', 'Actionable Toolkit & Templates']).toContain(
        report.formatRecommendation.primary.titleEn
      );

      // Membership must be in the Avoid list with educational reason
      const avoidMembership = report.formatRecommendation.avoid.find((a) =>
        a.titleEn.toLowerCase().includes('membership')
      );
      expect(avoidMembership).toBeDefined();

      // WhatNotToDo must warn against confusing repeat consulting with subscriptions
      const hasConsultingWarning = report.whatNotToDo.some(
        (w) => w.headlineAr.includes('الاستشارات') || w.headlineAr.includes('اشتراك')
      );
      expect(hasConsultingWarning).toBe(true);

      // Sprint mode must NOT be recurring validation sprint
      expect(report.validationSprint.sprintMode).not.toBe('RECURRING_MODEL_VALIDATION_SPRINT');
    });

    it('Recurring problem without ongoing renewal mechanism does NOT get recommended Membership', () => {
      const recurringProblemAnswers: QuestionnaireAnswers = {
        ...baseAnswers,
        problemFrequency: 'weekly',
        hasRecurringPaymentBehavior: 'no',
        explicitRecurringRequestReceived: false,
        recurringValueReason: '', // Empty continuation mechanism
        deliveryMechanism: ['framework_steps', 'templates_tools'],
        creatorTimePerCustomer: 'under_30m',
        audienceAccessLevel: 'direct_daily',
      };

      const report = analyzeOpportunity(recurringProblemAnswers);

      // Primary must NOT be Membership
      expect(report.formatRecommendation.primary.titleEn).not.toBe('Membership');
      // Sprint mode must NOT be recurring
      expect(report.validationSprint.sprintMode).not.toBe('RECURRING_MODEL_VALIDATION_SPRINT');
    });

    it('Explicit subscription demand + ongoing continuation value properly qualifies Membership', () => {
      const membershipQualifiedAnswers: QuestionnaireAnswers = {
        ...baseAnswers,
        problemFrequency: 'weekly',
        hasRecurringPaymentBehavior: 'recurring_monthly',
        recurringBuyerCountApprox: 12,
        explicitRecurringRequestReceived: true,
        recurringValueReason: 'تحديثات شهرية مستمرة وجلسات متابعة دورية ومراجعة حالات جديدة للعملاء',
        deliveryMechanism: ['community', 'live_coaching'],
        creatorTimePerCustomer: 'recurring_support',
        audienceAccessLevel: 'direct_daily',
        productRoleInBusiness: 'core_flagship',
      };

      const report = analyzeOpportunity(membershipQualifiedAnswers);

      // Must be Membership
      expect(report.formatRecommendation.primary.titleEn).toBe('Membership');
      expect(report.mvp.mvpTypeAr).toContain('اشتراك مؤسس تجريبي');
      expect(report.sprintMode).toBe('RECURRING_MODEL_VALIDATION_SPRINT');

      // Membership must NOT be in avoid list
      const inAvoid = report.formatRecommendation.avoid.some((a) =>
        a.titleEn.toLowerCase().includes('membership')
      );
      expect(inAvoid).toBe(false);

      // WhatNotToDo must give member retention warnings rather than forbidding memberships
      const hasFoundingMemberWarning = report.whatNotToDo.some((w) =>
        w.headlineAr.includes('أعضاء مؤسسين')
      );
      expect(hasFoundingMemberWarning).toBe(true);
    });

    it('Direct buyer requests for subscription + ongoing continuation value qualifies Membership', () => {
      const requestedMembershipAnswers: QuestionnaireAnswers = {
        ...baseAnswers,
        problemFrequency: 'weekly',
        hasRecurringPaymentBehavior: 'no',
        explicitRecurringRequestReceived: true,
        recurringValueReason: 'ممارسة ومتابعة دورية ومساءلة أسبوعية وتغذية راجعة لحالات جديدة',
        deliveryMechanism: ['community', 'live_coaching'],
        creatorTimePerCustomer: 'recurring_support',
        audienceAccessLevel: 'direct_daily',
      };

      const report = analyzeOpportunity(requestedMembershipAnswers);

      expect(report.formatRecommendation.primary.titleEn).toBe('Membership');
    });

    it('Recurring problem with repeat buyers but NO explicit subscription demand falls back to one-time/pilot formats', () => {
      const repeatBuyersNoSubAnswers: QuestionnaireAnswers = {
        ...baseAnswers,
        problemFrequency: 'weekly',
        hasRecurringPaymentBehavior: 'repeat_buyers_no_sub',
        recurringBuyerCountApprox: 5,
        explicitRecurringRequestReceived: false,
        recurringValueReason: 'متابعة دورية وتحديثات',
        deliveryMechanism: ['live_coaching', 'framework_steps'],
        creatorTimePerCustomer: '1_to_2h',
        audienceAccessLevel: 'occasional',
      };

      const report = analyzeOpportunity(repeatBuyersNoSubAnswers);

      // Must NOT recommend Membership as primary because subscription demand was never validated
      expect(report.formatRecommendation.primary.titleEn).not.toBe('Membership');
      expect(['Live Workshop', 'Cohort / Sprint', 'Hybrid Product', 'Productized Consulting']).toContain(
        report.formatRecommendation.primary.titleEn
      );
    });

    it('Documented retention data without actual recurring payments or subscription requests does NOT qualify Membership', () => {
      const retentionOnlyAnswers: QuestionnaireAnswers = {
        ...baseAnswers,
        problemFrequency: 'weekly',
        hasRecurringPaymentBehavior: 'no', // No actual recurring payments
        explicitRecurringRequestReceived: false, // No explicit subscription requests
        hasDocumentedRetentionData: true, // Retention data is documented (supporting scale evidence only)
        recurringValueReason: 'تحديثات ومراجعات مستمرة دورية للأعضاء', // Has ongoing renewal rationale
        deliveryMechanism: ['framework_steps', 'templates_tools'],
        creatorTimePerCustomer: 'under_30m',
        audienceAccessLevel: 'direct_daily',
      };

      const report = analyzeOpportunity(retentionOnlyAnswers);

      // Primary must NOT be Membership
      expect(report.formatRecommendation.primary.titleEn).not.toBe('Membership');
      expect(['Actionable Toolkit & Templates', 'Playbook', 'Mini Course', 'Live Workshop']).toContain(
        report.formatRecommendation.primary.titleEn
      );

      // Secondary must NOT be Membership
      expect(report.formatRecommendation.secondary?.titleEn).not.toBe('Membership');

      // Sprint mode must NOT be recurring
      expect(report.sprintMode).not.toBe('RECURRING_MODEL_VALIDATION_SPRINT');

      // Membership must be in the Avoid list because subscription demand is absent
      const avoidMembership = report.formatRecommendation.avoid.find((a) =>
        a.titleEn.toLowerCase().includes('membership')
      );
      expect(avoidMembership).toBeDefined();
    });
  });
});

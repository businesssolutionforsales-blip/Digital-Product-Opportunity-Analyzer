// @ts-nocheck
import { describe, it, expect } from 'vitest';
import { computeAiInputFingerprint, isValidAiInterpretation } from './aiService';
import { analyzeOpportunity } from '../data/strategicEngine';
import { QuestionnaireAnswers, AiStrategicInterpretation } from '../types';

describe('AI Integrity and Interactive Recalculation', () => {
  const baseAnswers: QuestionnaireAnswers = {
    productNameOrWorkingTitle: 'كورس إتقان إعلانات سناب شات',
    expertiseDomain: 'التسويق الرقمي وإعلانات منصات التواصل',
    yearsOfExperience: '5_to_10',
    targetBuyerDescription: 'أصحاب المتاجر الإلكترونية في الخليج',
    isBuyerBroadOrSpecific: 'narrow_specific',
    coreProblemDescription: 'صعوبة ضبط تكلفة الاستقطاب وتتبع الحملات بدقة',
    problemFrequency: 'daily',
    costOfInaction: ['money_loss', 'wasted_hours'],
    currentAlternativesAndWorkarounds: 'بيجربوا حملات عشوائية وبيخسروا ميزانيات إعلانية كل شهر',
    beforeState: 'صرف ميزانيات بدون مبيعات واضحة وخوف من الخسارة',
    afterState: 'حملات مربحة بنسبة عائد 4X على الإنفاق الإعلاني',
    uniqueMethodType: 'proprietary_framework',
    uniqueMethodOrProcess: 'منهجية القمع الثلاثي للاستقطاب والتحويل',
    creatorTimePerCustomer: 'under_30m',
    requiresPersonalFeedback: false,
    expectedPriceTier: 'mid_150_500',
    demandEvidenceList: ['paid_deposit', 'purchase_commitment'],
    hasExistingPayingClients: true,
    audienceAccessLevel: 'direct_daily',
    qualificationEvidence: ['client_results', 'work_experience'],
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

  describe('1. Deterministic Input Fingerprinting', () => {
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

    it('changes fingerprint when buyer specificity changes', () => {
      const fp1 = computeAiInputFingerprint(baseAnswers);
      const modified: QuestionnaireAnswers = {
        ...baseAnswers,
        isBuyerBroadOrSpecific: 'broad_general',
      };
      const fp2 = computeAiInputFingerprint(modified);
      expect(fp1).not.toBe(fp2);
    });

    it('changes fingerprint when problem frequency changes', () => {
      const fp1 = computeAiInputFingerprint(baseAnswers);
      const modified: QuestionnaireAnswers = {
        ...baseAnswers,
        problemFrequency: 'occasional',
      };
      const fp2 = computeAiInputFingerprint(modified);
      expect(fp1).not.toBe(fp2);
    });

    it('changes fingerprint when creator time per customer changes', () => {
      const fp1 = computeAiInputFingerprint(baseAnswers);
      const modified: QuestionnaireAnswers = {
        ...baseAnswers,
        creatorTimePerCustomer: 'high_touch',
      };
      const fp2 = computeAiInputFingerprint(modified);
      expect(fp1).not.toBe(fp2);
    });

    it('changes fingerprint when requiresPersonalFeedback toggles', () => {
      const fp1 = computeAiInputFingerprint(baseAnswers);
      const modified: QuestionnaireAnswers = {
        ...baseAnswers,
        requiresPersonalFeedback: true,
      };
      const fp2 = computeAiInputFingerprint(modified);
      expect(fp1).not.toBe(fp2);
    });

    it('changes fingerprint when hasExistingPayingClients toggles', () => {
      const fp1 = computeAiInputFingerprint(baseAnswers);
      const modified: QuestionnaireAnswers = {
        ...baseAnswers,
        hasExistingPayingClients: false,
      };
      const fp2 = computeAiInputFingerprint(modified);
      expect(fp1).not.toBe(fp2);
    });

    it('changes fingerprint when audienceAccessLevel changes', () => {
      const fp1 = computeAiInputFingerprint(baseAnswers);
      const modified: QuestionnaireAnswers = {
        ...baseAnswers,
        audienceAccessLevel: 'none_yet',
      };
      const fp2 = computeAiInputFingerprint(modified);
      expect(fp1).not.toBe(fp2);
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

  describe('3. Stale AI Invalidation and Mode Switching', () => {
    it('sets analysisMode to rules_only and omits aiInterpretation when null is provided', () => {
      const report = analyzeOpportunity(baseAnswers, null);
      expect(report.analysisMode).toBe('rules_only');
      expect(report.aiInterpretation).toBeUndefined();
    });

    it('sets analysisMode to hybrid_ai when complete valid AI is provided', () => {
      const report = analyzeOpportunity(baseAnswers, sampleAiInterpretation);
      expect(report.analysisMode).toBe('hybrid_ai');
      expect(report.aiInterpretation).toEqual(sampleAiInterpretation);
    });

    it('rejects malformed or empty AI interpretations and stays rules_only', () => {
      const malformedAi = {
        ...sampleAiInterpretation,
        strategic_interpretation: '', // empty
      };
      const report = analyzeOpportunity(baseAnswers, malformedAi as any);
      expect(report.analysisMode).toBe('rules_only');
      expect(report.aiInterpretation).toBeUndefined();
    });

    it('preserves reportId and createdAt when options are supplied during recalculation', () => {
      const initialReport = analyzeOpportunity(baseAnswers, sampleAiInterpretation);
      const updatedAnswers: QuestionnaireAnswers = {
        ...baseAnswers,
        problemFrequency: 'occasional',
      };

      const recalculatedReport = analyzeOpportunity(updatedAnswers, null, {
        reportId: initialReport.id,
        createdAt: initialReport.createdAt,
        isAiRecalculating: true,
      });

      expect(recalculatedReport.id).toBe(initialReport.id);
      expect(recalculatedReport.createdAt).toBe(initialReport.createdAt);
      expect(recalculatedReport.isAiRecalculating).toBe(true);
      expect(recalculatedReport.analysisMode).toBe('rules_only');
      expect(recalculatedReport.aiInterpretation).toBeUndefined();
    });
  });

  describe('4. Safe AI Reuse Condition', () => {
    it('allows AI interpretation reuse if and only if fingerprint matches', () => {
      const fpInitial = computeAiInputFingerprint(baseAnswers);
      const report1 = analyzeOpportunity(baseAnswers, sampleAiInterpretation, {
        aiFingerprint: fpInitial,
      });

      // Modifying answers
      const modifiedAnswers: QuestionnaireAnswers = {
        ...baseAnswers,
        creatorTimePerCustomer: 'high_touch',
      };
      const fpModified = computeAiInputFingerprint(modifiedAnswers);
      expect(fpModified).not.toBe(fpInitial);

      // Invalidation: modified report has no stale AI
      const invalidatedReport = analyzeOpportunity(modifiedAnswers, null);
      expect(invalidatedReport.analysisMode).toBe('rules_only');
      expect(invalidatedReport.aiInterpretation).toBeUndefined();

      // If user reverts back to baseAnswers:
      const revertedFingerprint = computeAiInputFingerprint(baseAnswers);
      expect(revertedFingerprint).toBe(fpInitial);

      const restoredReport = analyzeOpportunity(baseAnswers, sampleAiInterpretation, {
        aiFingerprint: revertedFingerprint,
      });
      expect(restoredReport.analysisMode).toBe('hybrid_ai');
      expect(restoredReport.aiInterpretation).toEqual(sampleAiInterpretation);
    });
  });
});

// @ts-nocheck
import { describe, it, expect } from 'vitest';
import { isValidAiInterpretation } from './AiStrategicInsight';
import { computeAiInputFingerprint, FINGERPRINT_SCHEMA_VERSION } from '../services/aiService';
import { AiStrategicInterpretation, QuestionnaireAnswers } from '../types';

describe('isValidAiInterpretation Guard Tests', () => {
  const completeValidInterpretation: AiStrategicInterpretation = {
    strongest_underused_advantage: 'ميزة كامنة قوية',
    highest_risk_assumption: 'مخاطرة افتراضية رئيسية',
    evidence_gap: 'لا توجد أدلة كافية على الاستعداد للدفع النقدي المسبق',
    strategic_interpretation: 'الفكرة واعدة ولكنها في مرحلة النضج الأولية ويجب اختبار الطلب',
    recommended_test: 'محادثة استشارية مع 5 عملاء مستهدفين',
    recommended_test_reason: 'للتحقق من إلحاح المشكلة قبل إضاعة الوقت في تسجيل المحتوى',
    what_not_to_do: 'لا تقم بإنشاء منصة كاملة أو تسجيل 20 ساعة فيديو قبل تأكيد الحجز',
    next_best_question: 'هل يملك العميل ميزانية حقيقية مخصصة لحل هذه المشكلة الآن؟',
  };

  it('returns true when all required fields are present and nonempty', () => {
    expect(isValidAiInterpretation(completeValidInterpretation)).toBe(true);
  });

  it('returns false when interpretation is null or undefined', () => {
    expect(isValidAiInterpretation(null)).toBe(false);
    expect(isValidAiInterpretation(undefined)).toBe(false);
  });

  it('returns false if any required field is missing or empty string', () => {
    const missingInterpretation = {
      ...completeValidInterpretation,
      strategic_interpretation: '   ',
    };
    expect(isValidAiInterpretation(missingInterpretation)).toBe(false);

    const missingTest = {
      ...completeValidInterpretation,
      recommended_test: '',
    };
    expect(isValidAiInterpretation(missingTest)).toBe(false);

    const missingQuestion = {
      ...completeValidInterpretation,
      next_best_question: undefined as any,
    };
    expect(isValidAiInterpretation(missingQuestion)).toBe(false);
  });

  it('does not crash or validate false non-objects', () => {
    expect(isValidAiInterpretation('some string' as any)).toBe(false);
    expect(isValidAiInterpretation(12345 as any)).toBe(false);
    expect(isValidAiInterpretation([] as any)).toBe(false);
  });
});

describe('computeAiInputFingerprint schema v3 tests', () => {
  const baseAnswers: QuestionnaireAnswers = {
    userPath: 'specific_idea',
    productNameOrWorkingTitle: 'دليل العمل الحر',
    expertiseDomain: 'تطوير البرمجيات',
    yearsOfExperience: '5-10',
    qualificationEvidence: ['client_results'],
    uniqueMethodOrProcess: 'منهجية ثلاثية الخطوات',
    audienceAccessLevel: 'direct_daily',
    targetBuyerDescription: 'مبرمجون مبتدئون',
    buyerStageAndSituation: 'يعانون من صعوبة الحصول على أول عميل',
    buyerCurrentBehavior: 'تقديم عروض عشوائية',
    isBuyerBroadOrSpecific: 'narrow_specific',
    coreProblemDescription: 'غياب نموذج تسعير واضح',
    problemFrequency: 'daily',
    costOfInaction: ['money', 'time'],
    currentAlternativesAndWorkarounds: 'مشاهدة فيديوهات يوتيوب متناثرة والاعتماد على نصائح الأصدقاء',
    demandEvidenceList: ['people_ask_me'],
    evidenceNotes: 'أكثر من 10 رسائل أسبوعياً',
    beforeState: 'تشتت وانعدام مبيعات',
    afterState: 'تدفق عملاء مستمر بسعر مربح',
    transformationRealism: 'highly_controllable',
    deliveryMechanism: ['framework_steps'],
    creatorMethodSummary: 'خطوات تطبيقية أسبوعية',
    creatorTimePerCustomer: 'almost_none',
    requiresPersonalFeedback: false,
    requiresOneOnOneAccountability: false,
    expectedPriceTier: 'mid_150_500',
    productRoleInBusiness: 'core_flagship',
    existingAudienceChannel: 'لينكد إن',
    hasExistingPayingClients: true,
  };

  it('uses schema version v3', () => {
    expect(FINGERPRINT_SCHEMA_VERSION).toBe('v3');
    const fp = computeAiInputFingerprint(baseAnswers);
    const parsed = JSON.parse(fp);
    expect(parsed._schema).toBe('v3');
  });

  it('changes fingerprint when yearsOfExperience changes', () => {
    const fp1 = computeAiInputFingerprint(baseAnswers);
    const fp2 = computeAiInputFingerprint({
      ...baseAnswers,
      yearsOfExperience: '1-3',
    });
    expect(fp1).not.toBe(fp2);
    expect(JSON.parse(fp1).yearsOfExperience).toBe('5-10');
    expect(JSON.parse(fp2).yearsOfExperience).toBe('1-3');
  });

  it('changes fingerprint when currentAlternativesAndWorkarounds changes', () => {
    const fp1 = computeAiInputFingerprint(baseAnswers);
    const fp2 = computeAiInputFingerprint({
      ...baseAnswers,
      currentAlternativesAndWorkarounds: 'استخدام أدوات جاهزة مجانية',
    });
    expect(fp1).not.toBe(fp2);
    expect(JSON.parse(fp1).currentAlternativesAndWorkarounds).toContain('يوتيوب');
    expect(JSON.parse(fp2).currentAlternativesAndWorkarounds).toContain('أدوات');
  });
});

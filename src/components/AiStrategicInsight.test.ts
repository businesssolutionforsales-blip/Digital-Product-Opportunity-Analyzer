// @ts-nocheck
import { describe, it, expect } from 'vitest';
import { isValidAiInterpretation } from './AiStrategicInsight';
import { AiStrategicInterpretation } from '../types';

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

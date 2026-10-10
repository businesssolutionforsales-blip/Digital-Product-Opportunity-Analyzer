import React from 'react';
import { AiStrategicInterpretation } from '../types';
import { Sparkles, HelpCircle, AlertTriangle, FlaskConical, Ban, ShieldCheck } from 'lucide-react';

interface AiStrategicInsightProps {
  interpretation: AiStrategicInterpretation;
}

export function isValidAiInterpretation(interpretation?: AiStrategicInterpretation | null): interpretation is AiStrategicInterpretation {
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

export const AiStrategicInsight: React.FC<AiStrategicInsightProps> = ({ interpretation }) => {
  return (
    <section className="p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-[#23170D]/70 via-[#120B05]/90 to-[#040405] border border-[#F5BF1E]/40 text-right space-y-6 shadow-xl relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-[#F5BF1E]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header with clear provenance */}
      <div className="border-b border-[#4A2F15]/60 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#F5BF1E]/15 text-[#F5BF1E] border border-[#F5BF1E]/30">
              <Sparkles className="w-3.5 h-3.5 text-[#F5BF1E]" />
              <span>قراءة استشارية معززة بذكاء Gemini</span>
            </span>
            <span className="text-[11px] text-[#A7690C] font-semibold">
              مدرسة Mohamed Adel
            </span>
          </div>
          <h3 className="font-heading font-extrabold text-xl text-[#FCFCFA]">
            الرؤية الاستراتيجية التحليلية المعززة
          </h3>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-[#C8C5BA] bg-[#040405]/80 px-3 py-1.5 rounded-lg border border-[#4A2F15]/40 self-start sm:self-auto">
          <ShieldCheck className="w-3.5 h-3.5 text-[#F5BF1E] shrink-0" />
          <span>تفسير تحليلي مبني على إجاباتك دون المساس بالأرقام القطعية</span>
        </div>
      </div>

      {/* 1. Core Strategic Interpretation */}
      <div className="p-5 rounded-xl bg-[#040405]/70 border border-[#F5BF1E]/25 relative z-10 space-y-2">
        <span className="text-xs font-bold text-[#F5BF1E] block">
          التقييم الاستشاري لوضع الفكرة ونضجها:
        </span>
        <p className="text-sm sm:text-base text-[#FCFCFA] font-medium leading-relaxed">
          {interpretation.strategic_interpretation}
        </p>
      </div>

      {/* Grid: Evidence Gap & What NOT To Do */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
        {/* Evidence Gap */}
        <div className="p-4 sm:p-5 rounded-xl bg-[#040405]/60 border border-[#A7690C]/40 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#FBD052]">
            <AlertTriangle className="w-4 h-4 text-[#F5BF1E] shrink-0" />
            <span>الفجوة في الأدلة السوقية (Evidence Gap):</span>
          </div>
          <p className="text-xs sm:text-sm text-[#C8C5BA] leading-relaxed">
            {interpretation.evidence_gap}
          </p>
        </div>

        {/* What NOT to do */}
        <div className="p-4 sm:p-5 rounded-xl bg-[#040405]/60 border border-[#A7690C]/40 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#FBD052]">
            <Ban className="w-4 h-4 text-[#F5BF1E] shrink-0" />
            <span>تحذير استشاري خاص بحالتك (إياك أن تفعل):</span>
          </div>
          <p className="text-xs sm:text-sm text-[#C8C5BA] leading-relaxed">
            {interpretation.what_not_to_do}
          </p>
        </div>
      </div>

      {/* Recommended Validation Test */}
      <div className="p-5 rounded-xl bg-[#23170D]/50 border border-[#F5BF1E]/40 relative z-10 space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-bold text-[#F5BF1E]">
          <FlaskConical className="w-4 h-4 shrink-0" />
          <span>أقل اختبار ميداني سريع ومباشر للتحقق (Recommended Test):</span>
        </div>
        <div className="font-heading font-bold text-sm sm:text-base text-[#FCFCFA]">
          {interpretation.recommended_test}
        </div>
        <p className="text-xs sm:text-sm text-[#C8C5BA] leading-relaxed border-t border-[#4A2F15]/40 pt-2">
          <strong className="text-[#FBD052]">السبب الاستراتيجي للاختبار: </strong>
          {interpretation.recommended_test_reason}
        </p>
      </div>

      {/* Next Best Question */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#040405]/80 border border-[#4A2F15]/80 relative z-10 flex items-start gap-3">
        <HelpCircle className="w-5 h-5 text-[#F5BF1E] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="text-xs font-bold text-[#F5BF1E] block">
            السؤال الاستراتيجي الأهم لتطرحه على نفسك الليلة:
          </span>
          <p className="text-xs sm:text-sm text-[#FCFCFA] font-semibold leading-relaxed">
            &ldquo;{interpretation.next_best_question}&rdquo;
          </p>
        </div>
      </div>

      {/* Disclaimer on AI boundary */}
      <div className="text-[11px] text-[#797979] border-t border-[#4A2F15]/30 pt-3 relative z-10 leading-relaxed">
        * تنويه الأمانة الاستشارية: هذه التوصيات هي قراءة تفسيرية استشارية مستخلصة من بياناتك عبر نماذج Gemini، وليست حقائق سوقية تم التحقق منها ميدانيًا. كافة الدرجات والأوزان التشخيصية محسوبة عبر محرك القواعد القطعي.
      </div>
    </section>
  );
};

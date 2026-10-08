import React from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';

export type RealAnalysisStage =
  | 'deterministic_scoring'
  | 'detecting_gaps'
  | 'requesting_ai'
  | 'merging_report'
  | 'finalizing';

interface AnalysisLoadingViewProps {
  stage: RealAnalysisStage;
}

export const AnalysisLoadingView: React.FC<AnalysisLoadingViewProps> = ({ stage }) => {
  const steps: { key: RealAnalysisStage; label: string }[] = [
    { key: 'deterministic_scoring', label: 'حساب الأوزان والمؤشرات الرقمية السبعة...' },
    { key: 'detecting_gaps', label: 'فصل الحقائق عن الافتراضات واكتشاف الفجوات...' },
    { key: 'requesting_ai', label: 'طلب القراءة الاستشارية النوعية (Gemini AI)...' },
    { key: 'merging_report', label: 'دمج التحليل الميداني وبناء خطة الـ 7 أيام...' },
    { key: 'finalizing', label: 'تجهيز التقرير الاستراتيجي الشامل...' },
  ];

  const stageOrder: RealAnalysisStage[] = [
    'deterministic_scoring',
    'detecting_gaps',
    'requesting_ai',
    'merging_report',
    'finalizing',
  ];

  const currentIdx = stageOrder.indexOf(stage);

  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#23170D] border border-[#F5BF1E]/40 flex items-center justify-center text-[#F5BF1E] shadow-lg shadow-[#F5BF1E]/5">
        <Loader2 className="w-8 h-8 animate-spin text-[#F5BF1E]" />
      </div>

      <h2 className="font-heading text-2xl font-bold text-[#FCFCFA] mb-2">
        تشخيص فرصة المنتج جاري الآن
      </h2>
      <p className="text-xs sm:text-sm text-[#C8C5BA] mb-8">
        معالجة استراتيجية فورية مبنية حصريًا على الوقائع والأدلة التي قدمتها.
      </p>

      {/* Real Stage Checklist */}
      <div className="space-y-3 bg-[#23170D]/40 border border-[#4A2F15]/50 rounded-2xl p-5 text-right">
        {steps.map((step, idx) => {
          const isDone = idx < currentIdx;
          const isCurrent = idx === currentIdx;

          return (
            <div
              key={step.key}
              className={`flex items-center gap-3 text-xs sm:text-sm transition-all duration-200 ${
                isDone
                  ? 'text-[#C8C5BA]'
                  : isCurrent
                  ? 'text-[#F5BF1E] font-semibold scale-[1.01]'
                  : 'text-[#797979] opacity-40'
              }`}
            >
              <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-[#F5BF1E]" />
                ) : isCurrent ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F5BF1E] animate-pulse" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4A2F15]" />
                )}
              </div>
              <span>{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

import React from 'react';
import { StopGoRules } from '../types';
import { PlayCircle, RotateCcw, StopCircle } from 'lucide-react';

interface StopGoRulesCardProps {
  rules: StopGoRules;
}

export const StopGoRulesCard: React.FC<StopGoRulesCardProps> = ({ rules }) => {
  return (
    <div className="p-6 rounded-2xl bg-[#23170D]/40 border border-[#4A2F15]/70 text-right space-y-5">
      <div>
        <span className="text-xs text-[#F5BF1E] font-medium tracking-wide">
          معايير اتخاذ القرار (Decision Gates)
        </span>
        <h3 className="font-heading font-bold text-lg text-[#FCFCFA] mt-0.5 mb-1">
          قواعد الاستمرار / التعديل / التوقف (Stop / Go Rules)
        </h3>
        <p className="text-xs text-[#C8C5BA]">
          معايير موضوعية واضحة تحميك من الاستمرار في فكرة ميتة، أو التراجع المبكر عن فرصة واعدة.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Continue */}
        <div className="p-4 rounded-xl bg-[#040405] border border-[#F5BF1E]/50 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#F5BF1E] pb-2 border-b border-[#4A2F15]/40">
            <PlayCircle className="w-4 h-4" />
            <span>كمّل وابنِ المنتج لو:</span>
          </div>
          <ul className="space-y-2 text-xs text-[#FCFCFA]">
            {rules.continueIf.map((rule, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-[#F5BF1E] font-bold">✓</span>
                <span className="leading-relaxed">{rule}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Refine */}
        <div className="p-4 rounded-xl bg-[#040405] border border-[#A7690C]/50 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#FBD052] pb-2 border-b border-[#4A2F15]/40">
            <RotateCcw className="w-4 h-4" />
            <span>عدّل العرض والزاوية لو:</span>
          </div>
          <ul className="space-y-2 text-xs text-[#C8C5BA]">
            {rules.refineIf.map((rule, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-[#A7690C] font-bold">↻</span>
                <span className="leading-relaxed">{rule}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Stop or Pivot */}
        <div className="p-4 rounded-xl bg-[#040405] border border-[#4A2F15] space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#C8C5BA] pb-2 border-b border-[#4A2F15]/40">
            <StopCircle className="w-4 h-4 text-[#A7690C]" />
            <span>أوقف أو غيّر المسار تمامًا لو:</span>
          </div>
          <ul className="space-y-2 text-xs text-[#797979]">
            {rules.stopOrPivotIf.map((rule, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-[#797979] font-bold">✕</span>
                <span className="leading-relaxed text-[#C8C5BA]">{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

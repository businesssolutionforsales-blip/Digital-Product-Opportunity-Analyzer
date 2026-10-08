import React, { useState } from 'react';
import { PositioningStatement } from '../types';
import { Copy, Check, Quote } from 'lucide-react';

interface PositioningStatementCardProps {
  positioning: PositioningStatement;
}

export const PositioningStatementCard: React.FC<PositioningStatementCardProps> = ({ positioning }) => {
  const [copiedNatural, setCopiedNatural] = useState(false);
  const [copiedFormula, setCopiedFormula] = useState(false);

  const handleCopy = (text: string, isNatural: boolean) => {
    navigator.clipboard.writeText(text);
    if (isNatural) {
      setCopiedNatural(true);
      setTimeout(() => setCopiedNatural(false), 2000);
    } else {
      setCopiedFormula(true);
      setTimeout(() => setCopiedFormula(false), 2000);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-[#23170D]/40 border border-[#4A2F15]/70 text-right space-y-5">
      <div>
        <span className="text-xs text-[#F5BF1E] font-medium tracking-wide">
          معادلة التموضع التسويقي (Positioning Formula)
        </span>
        <h3 className="font-heading font-bold text-lg text-[#FCFCFA] mt-0.5">
          جملة التموضع الاستراتيجي لمنتجك
        </h3>
      </div>

      {/* Formula version */}
      <div className="p-4 rounded-xl bg-[#040405] border border-[#4A2F15]/50 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#A7690C]">
            الصيغة الهيكلية (The Strategic Formula):
          </span>
          <button
            onClick={() => handleCopy(positioning.formulaVersionAr, false)}
            className="text-xs text-[#C8C5BA] hover:text-[#F5BF1E] flex items-center gap-1 transition-colors cursor-pointer"
          >
            {copiedFormula ? <Check className="w-3.5 h-3.5 text-[#F5BF1E]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedFormula ? 'تم النسخ' : 'نسخ الصيغة'}</span>
          </button>
        </div>
        <p className="text-xs sm:text-sm text-[#FCFCFA] font-mono leading-relaxed bg-[#23170D]/40 p-3 rounded-lg border border-[#4A2F15]/30">
          {positioning.formulaVersionAr}
        </p>
      </div>

      {/* Natural Marketing version */}
      <div className="p-4 rounded-xl bg-[#23170D] border border-[#F5BF1E]/40 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#FBD052] flex items-center gap-1.5">
            <Quote className="w-3.5 h-3.5 text-[#F5BF1E]" />
            <span>الصيغة التسويقية الطبيعية (لصفحة البيع والمنشورات):</span>
          </span>
          <button
            onClick={() => handleCopy(positioning.naturalMarketingVersionAr, true)}
            className="text-xs text-[#FCFCFA] hover:text-[#F5BF1E] flex items-center gap-1 transition-colors cursor-pointer bg-[#040405] px-2.5 py-1 rounded-md border border-[#4A2F15]"
          >
            {copiedNatural ? <Check className="w-3.5 h-3.5 text-[#F5BF1E]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedNatural ? 'تم النسخ' : 'نسخ النص'}</span>
          </button>
        </div>
        <p className="text-xs sm:text-sm text-[#FCFCFA] font-medium leading-relaxed">
          &ldquo;{positioning.naturalMarketingVersionAr}&rdquo;
        </p>
      </div>
    </div>
  );
};

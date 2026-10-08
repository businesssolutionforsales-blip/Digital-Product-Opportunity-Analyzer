import React from 'react';
import { MissingDataItem } from '../types';
import { HelpCircle, ArrowLeft, FileQuestion } from 'lucide-react';

interface MissingDataCardProps {
  missingData: MissingDataItem[];
  nextThreeQuestions: string[];
}

export const MissingDataCard: React.FC<MissingDataCardProps> = ({
  missingData,
  nextThreeQuestions,
}) => {
  return (
    <div className="space-y-6 text-right">
      {/* Missing Data Section */}
      <div className="p-6 rounded-2xl bg-[#23170D]/40 border border-[#4A2F15]/70 space-y-4">
        <div>
          <span className="text-xs text-[#A7690C] font-semibold tracking-wide">
            فصل الحقائق عن الافتراضات
          </span>
          <h3 className="font-heading font-bold text-lg text-[#FCFCFA] mt-0.5 mb-1">
            البيانات اللي ناقصاك قبل اتخاذ قرار الاستثمار الكامل
          </h3>
          <p className="text-xs text-[#C8C5BA]">
            الأداة صريحة ولا تختلق يقينًا زائفًا: هذه المتغيرات غير مؤكدة حتى الآن ويجب استكمالها.
          </p>
        </div>

        <div className="space-y-3">
          {missingData.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-[#040405] border border-[#4A2F15]/50 space-y-2 text-xs"
            >
              <div className="flex items-center gap-2 font-bold text-[#FCFCFA]">
                <FileQuestion className="w-4 h-4 text-[#F5BF1E] shrink-0" />
                <span>{item.fieldAr}</span>
              </div>
              <div className="text-[#C8C5BA] leading-relaxed">
                <strong>ليه مهمة: </strong>
                {item.importanceAr}
              </div>
              <div className="text-[11px] text-[#A7690C] bg-[#23170D]/40 p-2.5 rounded-lg border border-[#4A2F15]/30">
                <strong>إزاي تجمعها: </strong>
                {item.howToGatherAr}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Next 3 Questions */}
      <div className="p-6 rounded-2xl bg-[#040405] border border-[#F5BF1E]/40 space-y-4">
        <div>
          <span className="text-xs text-[#F5BF1E] font-medium tracking-wide">
            خطوتك الذهنية القادمة
          </span>
          <h3 className="font-heading font-bold text-lg text-[#FCFCFA] mt-0.5 mb-1">
            أهم 3 أسئلة تجاوب عليهم بعد هذا التقرير
          </h3>
          <p className="text-xs text-[#C8C5BA]">
            الأسئلة الثلاثة الأكثر قيمة لحالتك حاليًا للإجابة عليها خلال الـ 48 ساعة القادمة.
          </p>
        </div>

        <div className="space-y-2.5">
          {nextThreeQuestions.map((q, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-[#23170D]/40 border border-[#4A2F15]/40 text-xs sm:text-sm text-[#FCFCFA] flex items-start gap-3"
            >
              <span className="w-5 h-5 rounded-full bg-[#23170D] border border-[#F5BF1E]/40 text-[#F5BF1E] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <p className="leading-relaxed font-medium">{q}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

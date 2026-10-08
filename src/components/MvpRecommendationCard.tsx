import React from 'react';
import { MvpRecommendation } from '../types';
import { Check, X, ShieldAlert, Rocket } from 'lucide-react';

interface MvpRecommendationCardProps {
  mvp: MvpRecommendation;
}

export const MvpRecommendationCard: React.FC<MvpRecommendationCardProps> = ({ mvp }) => {
  return (
    <div className="p-6 rounded-2xl bg-[#23170D]/40 border border-[#4A2F15]/70 text-right space-y-5">
      <div>
        <span className="text-xs text-[#F5BF1E] font-medium tracking-wide">
          النسخة الصغرى للاختبار (Minimum Testable Product)
        </span>
        <h3 className="font-heading font-bold text-lg text-[#FCFCFA] mt-0.5 mb-1">
          {mvp.titleAr}
        </h3>
        <p className="text-xs sm:text-sm text-[#FBD052] font-semibold">
          الشكل المقترح: {mvp.mvpTypeAr}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Build Now */}
        <div className="p-4 rounded-xl bg-[#040405] border border-[#F5BF1E]/40 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#F5BF1E]">
            <Rocket className="w-4 h-4" />
            <span>ابنِ دول دلوقتي بس (Build Now):</span>
          </div>
          <ul className="space-y-2 text-xs text-[#FCFCFA]">
            {mvp.buildNow.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-[#F5BF1E] shrink-0 mt-0.5" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Do NOT Build Yet */}
        <div className="p-4 rounded-xl bg-[#040405] border border-[#A7690C]/40 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#A7690C]">
            <X className="w-4 h-4 text-[#F5BF1E]" />
            <span>متبنيش دول لسه خالص (Do Not Build Yet):</span>
          </div>
          <ul className="space-y-2 text-xs text-[#C8C5BA]">
            {mvp.doNotBuildYet.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-[#A7690C] font-bold shrink-0">✕</span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="p-3.5 rounded-xl bg-[#23170D] border border-[#4A2F15]/50 text-xs text-[#C8C5BA] leading-relaxed">
        <strong>الفلسفة الاستشارية: </strong>
        {mvp.rationaleAr}
      </div>
    </div>
  );
};

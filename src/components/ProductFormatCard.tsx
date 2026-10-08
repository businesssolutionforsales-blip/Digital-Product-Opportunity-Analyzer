import React from 'react';
import { ProductFormatInfo, AvoidFormatInfo } from '../types';
import { Check, XCircle, ArrowUpRight, Clock, BatteryCharging } from 'lucide-react';

interface ProductFormatCardProps {
  primary: ProductFormatInfo;
  secondary?: ProductFormatInfo;
  avoid: AvoidFormatInfo[];
}

export const ProductFormatCard: React.FC<ProductFormatCardProps> = ({
  primary,
  secondary,
  avoid,
}) => {
  return (
    <div className="space-y-6 text-right">
      {/* Recommended Primary Format */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[#23170D] to-[#040405] border border-[#F5BF1E]/50 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-[#F5BF1E] font-medium tracking-wide">
            شكل المنتج الموصى به أولاً (Recommended Format)
          </span>
          <span className="text-xs text-[#FCFCFA] font-bold bg-[#F5BF1E]/10 border border-[#F5BF1E]/30 px-2.5 py-0.5 rounded-md">
            الخيار الأول
          </span>
        </div>

        <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-[#FCFCFA] mb-1">
          {primary.titleAr}
        </h3>
        <div className="text-xs text-[#A7690C] font-mono mb-4">{primary.titleEn}</div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-5">
          <div className="p-3 rounded-xl bg-[#040405]/80 border border-[#4A2F15]/40 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#F5BF1E] shrink-0" />
            <div>
              <span className="text-[#797979] block text-[11px]">سرعة الوصول لأول نتيجة:</span>
              <span className="text-[#FCFCFA] font-semibold">{primary.speedToFirstValue}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#040405]/80 border border-[#4A2F15]/40 flex items-center gap-2">
            <BatteryCharging className="w-4 h-4 text-[#F5BF1E] shrink-0" />
            <div>
              <span className="text-[#797979] block text-[11px]">العبء التشغيلي عليك:</span>
              <span className="text-[#FCFCFA] font-semibold">{primary.deliveryBurden}</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#23170D]/60 border border-[#4A2F15]/50">
          <div className="text-xs font-bold text-[#FBD052] mb-1.5 flex items-center gap-1.5">
            <Check className="w-4 h-4 text-[#F5BF1E]" />
            <span>ليه الشكل ده مناسب لحالتك تحديدًا؟</span>
          </div>
          <p className="text-xs sm:text-sm text-[#FCFCFA] leading-relaxed">
            {primary.whyFitAr}
          </p>
        </div>

        {/* Secondary Alternative if present */}
        {secondary && (
          <div className="mt-4 pt-4 border-t border-[#4A2F15]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <span className="text-[#C8C5BA]">
              <strong>البديل الثاني المحتمل:</strong> {secondary.titleAr}
            </span>
            <span className="text-[11px] text-[#A7690C]">{secondary.whyFitAr}</span>
          </div>
        )}
      </div>

      {/* What NOT to build yet */}
      <div className="p-6 rounded-2xl bg-[#040405] border border-[#4A2F15]/60">
        <div className="mb-4">
          <span className="text-xs text-[#A7690C] font-semibold">
            توجيه استشاري صريح
          </span>
          <h4 className="font-heading font-bold text-base text-[#FCFCFA] mt-0.5">
            ليه مش أنصحك بالأشكال دي دلوقتي؟
          </h4>
        </div>

        <div className="space-y-3">
          {avoid.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-[#23170D]/30 border border-[#4A2F15]/40 flex items-start gap-3 text-xs"
            >
              <XCircle className="w-4 h-4 text-[#A7690C] shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-[#FCFCFA] mb-1">
                  {item.titleAr}
                </div>
                <div className="text-[#C8C5BA] leading-relaxed">
                  {item.whyNotAr}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

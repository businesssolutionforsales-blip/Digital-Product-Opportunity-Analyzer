import React from 'react';
import { Layers, Printer, Share2, RotateCcw } from 'lucide-react';

interface BrandHeaderProps {
  onReset?: () => void;
  onPrint?: () => void;
  onShare?: () => void;
  hasReport?: boolean;
}

export const BrandHeader: React.FC<BrandHeaderProps> = ({
  onReset,
  onPrint,
  onShare,
  hasReport,
}) => {
  return (
    <header className="border-b border-[#4A2F15]/40 bg-[#040405]/90 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
        {/* Left / Brand Identity */}
        <div className="flex items-center gap-3.5">
          <button
            onClick={onReset}
            className="text-right group flex items-center gap-3 focus:outline-none"
            title="الرئيسية"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#23170D] to-[#040405] border border-[#F5BF1E]/30 flex items-center justify-center text-[#F5BF1E] font-bold text-sm tracking-wider shadow-inner group-hover:border-[#F5BF1E] transition-colors">
              MA
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-sm sm:text-base text-[#FCFCFA] tracking-wide">
                  Mohamed Adel
                </span>
                <span className="text-xs text-[#797979] hidden sm:inline" aria-hidden="true">·</span>
                <span className="text-xs text-[#F5BF1E]/90 hidden sm:inline font-medium">
                  Sales Funnel Architect
                </span>
              </div>
              <div className="text-[11px] text-[#C8C5BA]/80 hidden md:block mt-0.5">
                محلل فرصة المنتج الرقمي — Growth OS <span className="text-[#A7690C]">| Mod 1: Creator</span>
              </div>
            </div>
          </button>
        </div>

        {/* Right / Quick Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {hasReport && (
            <>
              {onPrint && (
                <button
                  onClick={onPrint}
                  className="px-3 py-1.5 rounded-lg border border-[#4A2F15] bg-[#23170D]/60 hover:bg-[#23170D] text-xs text-[#FCFCFA] flex items-center gap-1.5 transition-colors"
                  title="طباعة التقرير كوثيقة استراتيجية"
                >
                  <Printer className="w-3.5 h-3.5 text-[#F5BF1E]" />
                  <span className="hidden sm:inline">طباعة / PDF</span>
                </button>
              )}

              {onShare && (
                <button
                  onClick={onShare}
                  className="px-3 py-1.5 rounded-lg border border-[#4A2F15] bg-[#23170D]/60 hover:bg-[#23170D] text-xs text-[#FCFCFA] flex items-center gap-1.5 transition-colors"
                  title="مشاركة بطاقة النتيجة"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#F5BF1E]" />
                  <span className="hidden sm:inline">مشاركة</span>
                </button>
              )}

              {onReset && (
                <button
                  onClick={onReset}
                  className="px-2.5 py-1.5 rounded-lg text-xs text-[#C8C5BA] hover:text-[#FCFCFA] hover:bg-[#23170D]/50 transition-colors flex items-center gap-1"
                  title="تحليل جديد"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">تحليل جديد</span>
                </button>
              )}
            </>
          )}

          {!hasReport && (
            <div className="text-xs text-[#C8C5BA] hidden sm:flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-[#F5BF1E]" />
              <span>نظام تشخيصي استراتيجي</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

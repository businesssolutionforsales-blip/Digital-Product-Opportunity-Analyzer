import React from 'react';
import { Layers, ShieldCheck, Heart } from 'lucide-react';

interface BrandFooterProps {
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
}

export const BrandFooter: React.FC<BrandFooterProps> = ({ onOpenPrivacy, onOpenTerms }) => {
  return (
    <footer className="border-t border-[#4A2F15]/40 bg-[#040405] text-[#C8C5BA] py-12 px-4 sm:px-6 transition-colors">
      <div className="max-w-6xl mx-auto space-y-10 text-right">
        {/* Growth OS Ecosystem Roadmap */}
        <div className="p-6 rounded-2xl bg-[#23170D]/40 border border-[#4A2F15]/50 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#4A2F15]/30 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#F5BF1E]" />
              <h4 className="font-heading font-bold text-sm text-[#FCFCFA]">
                منظومة Mohamed Adel Growth OS
              </h4>
            </div>
            <span className="text-[11px] text-[#A7690C] font-mono">
              رحلة التحول الكاملة من الخبرة للتوسع
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {/* Module 1 */}
            <div className="p-3 rounded-xl bg-[#040405] border border-[#F5BF1E]/50">
              <span className="text-[#F5BF1E] font-bold block mb-1">01. Creator (نشط)</span>
              <p className="text-[11px] text-[#FCFCFA] leading-relaxed">
                محلل فرصة المنتج والتحقق المبكر من الفكرة
              </p>
            </div>

            {/* Module 2 */}
            <div className="p-3 rounded-xl bg-[#040405]/50 border border-[#4A2F15]/30 opacity-70">
              <span className="text-[#C8C5BA] font-bold block mb-1">02. Seller (قريبًا)</span>
              <p className="text-[11px] text-[#797979] leading-relaxed">
                هندسة مسار البيع وعرض القيمة المرتفع
              </p>
            </div>

            {/* Module 3 */}
            <div className="p-3 rounded-xl bg-[#040405]/50 border border-[#4A2F15]/30 opacity-70">
              <span className="text-[#C8C5BA] font-bold block mb-1">03. Operator (قريبًا)</span>
              <p className="text-[11px] text-[#797979] leading-relaxed">
                أتمتة التشغيل والتسليم وتجربة العميل
              </p>
            </div>

            {/* Module 4 */}
            <div className="p-3 rounded-xl bg-[#040405]/50 border border-[#4A2F15]/30 opacity-70">
              <span className="text-[#C8C5BA] font-bold block mb-1">04. Scaler (قريبًا)</span>
              <p className="text-[11px] text-[#797979] leading-relaxed">
                التحسين المستمر ومضاعفة العائد
              </p>
            </div>
          </div>
        </div>

        {/* Brand Bottom info */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4 border-t border-[#4A2F15]/30 text-xs">
          <div className="space-y-1 text-center md:text-right">
            <div className="font-heading font-bold text-sm text-[#FCFCFA]">
              Mohamed Adel — Sales Funnel Architect
            </div>
            <div className="text-[11px] text-[#797979]">
              &ldquo;أنا مش بصمم صفحة وخلاص، أنا بهندس رحلة بيع كاملة.&rdquo;
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-[#797979]">
            <button
              onClick={onOpenPrivacy}
              className="hover:text-[#F5BF1E] transition-colors cursor-pointer"
            >
              سياسة الخصوصية
            </button>
            <span>·</span>
            <button
              onClick={onOpenTerms}
              className="hover:text-[#F5BF1E] transition-colors cursor-pointer"
            >
              شروط الاستخدام
            </button>
            <span>·</span>
            <span className="text-[11px] font-mono">© {new Date().getFullYear()} Mohamed Adel</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

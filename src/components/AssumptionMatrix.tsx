import React from 'react';
import { AssumptionItem } from '../types';
import { CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';

interface AssumptionMatrixProps {
  assumptions: AssumptionItem[];
}

export const AssumptionMatrix: React.FC<AssumptionMatrixProps> = ({ assumptions }) => {
  const evidenceList = assumptions.filter((a) => a.category === 'evidence');
  const needsValidationList = assumptions.filter((a) => a.category === 'needs_validation');
  const highRiskList = assumptions.filter((a) => a.category === 'high_risk');

  return (
    <div className="p-6 rounded-2xl bg-[#23170D]/30 border border-[#4A2F15]/60 text-right space-y-5">
      <div>
        <span className="text-xs text-[#F5BF1E] font-medium tracking-wide">
          تفكيك المخاطر والفرضيات (Assumption Map)
        </span>
        <h3 className="font-heading font-bold text-lg text-[#FCFCFA] mt-0.5 mb-1">
          خريطة الافتراضات الحرجة
        </h3>
        <p className="text-xs text-[#C8C5BA]">
          تصنيف الافتراضات الأساسية للمشروع لتمييز ما هو مثبت بدليل واقعي عما يحتاج للاختبار الفوري.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Column 1: Evidence */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[#4A2F15]/50 text-xs font-bold text-[#FCFCFA]">
            <CheckCircle2 className="w-4 h-4 text-[#F5BF1E]" />
            <span>عندنا دليل ({evidenceList.length})</span>
          </div>

          {evidenceList.length === 0 ? (
            <div className="text-xs text-[#797979] italic p-3">لا توجد أدلة مثبتة كافية حتى الآن.</div>
          ) : (
            evidenceList.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-[#040405] border border-[#4A2F15]/60 space-y-1.5"
              >
                <div className="text-xs font-semibold text-[#FCFCFA] leading-relaxed">
                  {item.textAr}
                </div>
                <div className="text-[11px] text-[#C8C5BA]/80">
                  {item.contextNoteAr}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Column 2: Needs Validation */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[#4A2F15]/50 text-xs font-bold text-[#FBD052]">
            <AlertTriangle className="w-4 h-4 text-[#F5BF1E]" />
            <span>محتاج اختبار ({needsValidationList.length})</span>
          </div>

          {needsValidationList.length === 0 ? (
            <div className="text-xs text-[#797979] italic p-3">لا توجد نقاط معلقة.</div>
          ) : (
            needsValidationList.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-[#040405] border border-[#4A2F15]/60 space-y-1.5"
              >
                <div className="text-xs font-semibold text-[#FCFCFA] leading-relaxed">
                  {item.textAr}
                </div>
                <div className="text-[11px] text-[#C8C5BA]/80">
                  {item.contextNoteAr}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Column 3: High Risk */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[#A7690C]/50 text-xs font-bold text-[#F5BF1E]">
            <AlertOctagon className="w-4 h-4 text-[#F5BF1E]" />
            <span>مخاطرة عالية ({highRiskList.length})</span>
          </div>

          {highRiskList.length === 0 ? (
            <div className="text-xs text-[#C8C5BA] p-3 bg-[#040405] rounded-xl border border-[#4A2F15]/40">
              لا توجد فرضيات حرجة عالية المخاطرة غير مغطاة.
            </div>
          ) : (
            highRiskList.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-[#23170D] border border-[#A7690C]/60 space-y-1.5"
              >
                <div className="text-xs font-semibold text-[#FCFCFA] leading-relaxed">
                  {item.textAr}
                </div>
                <div className="text-[11px] text-[#C8C5BA]">
                  {item.contextNoteAr}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

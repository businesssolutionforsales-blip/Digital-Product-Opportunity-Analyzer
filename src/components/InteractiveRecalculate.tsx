import React, { useState } from 'react';
import { QuestionnaireAnswers, EvidenceType } from '../types';
import { Sliders, RefreshCw, X } from 'lucide-react';

interface InteractiveRecalculateProps {
  answers: QuestionnaireAnswers;
  onUpdateAnswers: (updated: QuestionnaireAnswers) => void;
  onClose: () => void;
}

export const InteractiveRecalculate: React.FC<InteractiveRecalculateProps> = ({
  answers,
  onUpdateAnswers,
  onClose,
}) => {
  const [draft, setDraft] = useState<QuestionnaireAnswers>({ ...answers });

  const handleApply = () => {
    onUpdateAnswers(draft);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#040405]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#23170D] border border-[#F5BF1E]/40 rounded-3xl max-w-xl w-full p-6 text-right shadow-2xl relative space-y-5 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 rounded-full bg-[#040405] text-[#C8C5BA] hover:text-[#FCFCFA] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="border-b border-[#4A2F15]/40 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#F5BF1E]">
            <Sliders className="w-4 h-4" />
            <span>محاكاة السيناريوهات الاستراتيجية (Scenario Simulator)</span>
          </div>
          <h3 className="font-heading font-bold text-lg text-[#FCFCFA] mt-1">
            تعديل المتغيرات وإعادة حساب النتائج
          </h3>
          <p className="text-xs text-[#C8C5BA]">
            غير الافتراضات الحالية واكتشف كيف يتغير تقييم الفرصة ودرجة الثقة وشكل المنتج فورًا.
          </p>
        </div>

        {/* 1. Specificity */}
        <div className="space-y-1.5 text-xs">
          <label className="font-bold text-[#FCFCFA] block">درجة تحديد الجمهور المستهدف:</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'narrow_specific', label: 'شريحة ضيقة' },
              { id: 'moderate', label: 'متوسطة' },
              { id: 'broad_general', label: 'عامة وواسعة' },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setDraft({ ...draft, isBuyerBroadOrSpecific: opt.id as any })}
                className={`py-2 px-2.5 rounded-xl border text-center transition-colors cursor-pointer ${
                  draft.isBuyerBroadOrSpecific === opt.id
                    ? 'border-[#F5BF1E] bg-[#040405] text-[#FCFCFA] font-bold'
                    : 'border-[#4A2F15]/40 bg-[#040405]/40 text-[#797979]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Frequency */}
        <div className="space-y-1.5 text-xs">
          <label className="font-bold text-[#FCFCFA] block">معدل تكرار المشكلة عند العميل:</label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'daily', label: 'يوميًا' },
              { id: 'weekly', label: 'أسبوعيًا' },
              { id: 'monthly', label: 'شهريًا' },
              { id: 'occasional', label: 'أحيانًا' },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setDraft({ ...draft, problemFrequency: opt.id as any })}
                className={`py-2 px-2 rounded-xl border text-center transition-colors cursor-pointer ${
                  draft.problemFrequency === opt.id
                    ? 'border-[#F5BF1E] bg-[#040405] text-[#FCFCFA] font-bold'
                    : 'border-[#4A2F15]/40 bg-[#040405]/40 text-[#797979]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Delivery Time */}
        <div className="space-y-1.5 text-xs">
          <label className="font-bold text-[#FCFCFA] block">الوقت المخصص لكل عميل:</label>
          <select
            value={draft.creatorTimePerCustomer}
            onChange={(e: any) => setDraft({ ...draft, creatorTimePerCustomer: e.target.value })}
            className="w-full p-2.5 rounded-xl bg-[#040405] border border-[#4A2F15] text-[#FCFCFA] focus:outline-none"
          >
            <option value="almost_none">شبه منعدم (ذاتي الاستهلاك)</option>
            <option value="under_30m">أقل من 30 دقيقة</option>
            <option value="1_to_2h">ساعة إلى ساعتين</option>
            <option value="high_touch">متابعة مكثفة فردية</option>
          </select>
        </div>

        {/* 4. Audience Access */}
        <div className="space-y-1.5 text-xs">
          <label className="font-bold text-[#FCFCFA] block">الوصول المباشر للعميل المستهدف:</label>
          <select
            value={draft.audienceAccessLevel}
            onChange={(e: any) => setDraft({ ...draft, audienceAccessLevel: e.target.value })}
            className="w-full p-2.5 rounded-xl bg-[#040405] border border-[#4A2F15] text-[#FCFCFA] focus:outline-none"
          >
            <option value="direct_daily">أقدر أوصل لهم بشكل مباشر ومتكرر</option>
            <option value="occasional">أقدر أوصل لبعضهم أحيانًا</option>
            <option value="indirect_communities">أعرف فين موجودين لكن مفيش وصول مباشر</option>
            <option value="none_yet">معنديش وصول حاليًا</option>
            <option value="unsure">مش متأكد</option>
          </select>
        </div>

        {/* 5. Toggles */}
        <div className="grid grid-cols-2 gap-3 text-xs pt-1">
          <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl bg-[#040405] border border-[#4A2F15]">
            <input
              type="checkbox"
              checked={Boolean(draft.requiresPersonalFeedback)}
              onChange={(e) => setDraft({ ...draft, requiresPersonalFeedback: e.target.checked })}
              className="accent-[#F5BF1E]"
            />
            <span className="text-[#C8C5BA]">يحتاج Feedback شخصي</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl bg-[#040405] border border-[#4A2F15]">
            <input
              type="checkbox"
              checked={Boolean(draft.hasExistingPayingClients)}
              onChange={(e) => setDraft({ ...draft, hasExistingPayingClients: e.target.checked })}
              className="accent-[#F5BF1E]"
            />
            <span className="text-[#C8C5BA]">عندي عملاء دفعوا سابقًا</span>
          </label>
        </div>

        {/* CTA */}
        <div className="pt-3 border-t border-[#4A2F15]/40 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-[#797979] hover:text-[#FCFCFA]"
          >
            إلغاء
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="px-6 py-2.5 rounded-xl font-heading font-bold text-xs bg-[#F5BF1E] text-[#040405] hover:brightness-105 flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-[#F5BF1E]/10"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>تحديث التقرير والدرجات الآن</span>
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { DiscoveredCandidate, IdeaDiscoveryAnswers } from '../types';
import { ShieldCheck, Sparkles, ArrowRight, ArrowLeft, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

interface HypothesisReviewStepProps {
  candidate: DiscoveredCandidate;
  discoveryAnswers: IdeaDiscoveryAnswers;
  isAiGenerated: boolean;
  onConfirm: (confirmedData: {
    workingTitle: string;
    targetBuyer: string;
    coreProblem: string;
    desiredTransformation: string;
    productDirection: string;
    uniqueMethodType: 'proprietary_framework' | 'general_skills_only' | 'developing_now' | 'not_selected';
    uniqueMethodOrProcess: string;
  }) => void;
  onBackToSuggestions: () => void;
}

export const HypothesisReviewStep: React.FC<HypothesisReviewStepProps> = ({
  candidate,
  discoveryAnswers,
  isAiGenerated,
  onConfirm,
  onBackToSuggestions,
}) => {
  const [workingTitle, setWorkingTitle] = useState(candidate.title || '');
  const [targetBuyer, setTargetBuyer] = useState(candidate.targetAudience || '');
  const [coreProblem, setCoreProblem] = useState(candidate.coreProblem || '');
  const [desiredTransformation, setDesiredTransformation] = useState(candidate.desiredTransformation || '');
  const [productDirection, setProductDirection] = useState(candidate.possibleFormat || '');

  // Requirement: Neutral default 'not_selected' requiring explicit user choice
  const [uniqueMethodType, setUniqueMethodType] = useState<
    'proprietary_framework' | 'general_skills_only' | 'developing_now' | 'not_selected'
  >('not_selected');
  const [uniqueMethodText, setUniqueMethodText] = useState('');
  const [methodValidationError, setMethodValidationError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (uniqueMethodType === 'not_selected') {
      setMethodValidationError('يرجى تحديد طبيعة خبرتك: هل تمتلك إطار عمل خاص أم تعتمد على مهارات عامة؟');
      return;
    }
    if (uniqueMethodType === 'proprietary_framework' && !uniqueMethodText.trim()) {
      setMethodValidationError('يرجى كتابة اسم المنهجية أو خطوات إطار العمل الخاص بك.');
      return;
    }
    setMethodValidationError('');

    onConfirm({
      workingTitle: workingTitle.trim(),
      targetBuyer: targetBuyer.trim(),
      coreProblem: coreProblem.trim(),
      desiredTransformation: desiredTransformation.trim(),
      productDirection: productDirection.trim(),
      uniqueMethodType,
      uniqueMethodOrProcess:
        uniqueMethodType === 'proprietary_framework'
          ? uniqueMethodText.trim()
          : uniqueMethodType === 'developing_now'
          ? 'قيد التوثيق والتطوير حاليًا'
          : '',
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 text-right">
      {/* Header Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#F5BF1E]/40 bg-[#23170D] text-xs font-semibold text-[#F5BF1E] mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>بوابة النزاهة الاستشارية — تدقيق الفرضيات</span>
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#FCFCFA] mb-3">
          راجع الفرضيات قبل ما نحسب أي درجة
        </h1>
        <p className="text-xs sm:text-sm text-[#C8C5BA] max-w-xl mx-auto leading-relaxed">
          {isAiGenerated
            ? 'فرضية أولية مولدة بالذكاء الاصطناعي — تحتاج تأكيدك. لا نمنح أي نقاط جودة أو ثقة لمجرد أن النظام صاغ جملة تبدو احترافية. راجع كل نقطة، عدّلها لتطابق واقعك، وأكدها لتكون أساس التشخيص.'
            : 'اقتراح أولي مبني على قواعد الأداة — يحتاج تأكيدك. لا نمنح أي نقاط جودة أو ثقة دون تدقيقك المباشر. راجع كل نقطة، عدّلها لتطابق واقعك، وأكدها لتكون أساس التشخيص.'}
        </p>
      </div>

      {/* Advisory Callout */}
      <div className="p-4 rounded-xl bg-[#23170D]/70 border border-[#F5BF1E]/30 mb-8 flex items-start gap-3 text-xs leading-relaxed">
        {isAiGenerated ? (
          <Sparkles className="w-4 h-4 text-[#F5BF1E] shrink-0 mt-0.5" />
        ) : (
          <Layers className="w-4 h-4 text-[#A7690C] shrink-0 mt-0.5" />
        )}
        <div className="text-[#C8C5BA]">
          <strong className="text-[#FCFCFA] block mb-0.5">
            {isAiGenerated
              ? 'فرضية أولية مولدة بالذكاء الاصطناعي — تحتاج تأكيدك'
              : 'اقتراح أولي مبني على قواعد الأداة — يحتاج تأكيدك'}
          </strong>
          {isAiGenerated
            ? 'مبدأ النزاهة: البلاغة ليست دليلاً (AI Verbosity Is Not Evidence). البيانات المقترحة هنا ولّدها نموذج الذكاء الاصطناعي كفرضية عمل. التعديل الآن يضمن لك تقريرًا حقيقيًا يحميك من إهدار أسابيع في بناء منتج لا يريده أحد.'
            : 'مبدأ النزاهة: هذا الاقتراح ناتج عن القواعد المنطقية للأداة بناءً على ما أدخلته. لن نحسب أي درجة حتى تراجع الصياغات وتؤكد مطابقتها لواقع عملك وجمهورك المستهدف.'}
        </div>
      </div>

      {/* Editable Review Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-[#23170D]/40 border border-[#4A2F15]/70 rounded-2xl p-5 sm:p-7 space-y-6">
          {/* 1. Working Title */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#FCFCFA]">
                عنوان أو اتجاه الفكرة المقترحة <span className="text-[#F5BF1E]">*</span>
              </label>
              <span className="text-[11px] text-[#A7690C] bg-[#040405] px-2 py-0.5 rounded border border-[#4A2F15]/50">
                {isAiGenerated ? 'فرضية أولية مولدة بالذكاء الاصطناعي' : 'اقتراح مبني على قواعد الأداة'}
              </span>
            </div>
            <input
              type="text"
              required
              value={workingTitle}
              onChange={(e) => setWorkingTitle(e.target.value)}
              placeholder="مثال: ورشة تدريبية لعلاج تشتت مسار البيع..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#040405] border border-[#4A2F15] focus:border-[#F5BF1E] text-sm text-[#FCFCFA] focus:outline-none"
            />
          </div>

          {/* 2. Target Buyer */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#FCFCFA]">
                الجمهور المستهدف المقترح (المشتري) <span className="text-[#F5BF1E]">*</span>
              </label>
              <span className="text-[11px] text-[#A7690C] bg-[#040405] px-2 py-0.5 rounded border border-[#4A2F15]/50">
                {isAiGenerated ? 'فرضية قابلة للتعديل (AI)' : 'فرضية قابلة للتعديل (Rules)'}
              </span>
            </div>
            <textarea
              rows={2}
              required
              value={targetBuyer}
              onChange={(e) => setTargetBuyer(e.target.value)}
              placeholder="مثال: أصحاب الخدمات الاستشارية الذين يملكون عملاء حاليين ولكن يعانون من استنزاف الوقت..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#040405] border border-[#4A2F15] focus:border-[#F5BF1E] text-xs sm:text-sm text-[#FCFCFA] focus:outline-none"
            />
            <p className="text-[11px] text-[#797979] mt-1">
              تجنب الصياغات العامة مثل «كل الناس» أو «أي حد عايز يزود دخله». حدد الفئة بسياقها ومرحلتها الحالية.
            </p>
          </div>

          {/* 3. Core Problem */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#FCFCFA]">
                المشكلة الجوهرية المفترضة <span className="text-[#F5BF1E]">*</span>
              </label>
              <span className="text-[11px] text-[#A7690C] bg-[#040405] px-2 py-0.5 rounded border border-[#4A2F15]/50">
                فرضية ألم
              </span>
            </div>
            <textarea
              rows={2}
              required
              value={coreProblem}
              onChange={(e) => setCoreProblem(e.target.value)}
              placeholder="مثال: قضاء ساعات طويلة في مكالمات استكشافية غير مؤهلة تؤدي لرفض السعر أو التردد..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#040405] border border-[#4A2F15] focus:border-[#F5BF1E] text-xs sm:text-sm text-[#FCFCFA] focus:outline-none"
            />
            <p className="text-[11px] text-[#797979] mt-1">
              المشكلة يجب أن تكون مؤلمة بما يكفي ليدفع العميل مالاً للتخلص منها، وليست مجرد رغبة ترفيهية.
            </p>
          </div>

          {/* 4. Desired Transformation */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#FCFCFA]">
                التحول والنتيجة بعد الاستخدام <span className="text-[#F5BF1E]">*</span>
              </label>
              <span className="text-[11px] text-[#A7690C] bg-[#040405] px-2 py-0.5 rounded border border-[#4A2F15]/50">
                فرضية نتيجة
              </span>
            </div>
            <textarea
              rows={2}
              required
              value={desiredTransformation}
              onChange={(e) => setDesiredTransformation(e.target.value)}
              placeholder="مثال: امتلاك مسار تصفية تلقائي ومؤتمت يضمن أن من يصل للمكالمة جاهز ومستعد للدفع..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#040405] border border-[#4A2F15] focus:border-[#F5BF1E] text-xs sm:text-sm text-[#FCFCFA] focus:outline-none"
            />
          </div>

          {/* 5. Product Direction */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#FCFCFA]">
                اتجاه شكل المنتج المقترح
              </label>
              <span className="text-[11px] text-[#A7690C] bg-[#040405] px-2 py-0.5 rounded border border-[#4A2F15]/50">
                صيغة تسليم مقترحة
              </span>
            </div>
            <input
              type="text"
              value={productDirection}
              onChange={(e) => setProductDirection(e.target.value)}
              placeholder="مثال: حزمة قوالب وأدوات، ورشة عمل تفاعلية، معسكر تطبيقي..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#040405] border border-[#4A2F15] focus:border-[#F5BF1E] text-xs sm:text-sm text-[#FCFCFA] focus:outline-none"
            />
          </div>

          {/* 6. Requirement #3: Explicit Check for Unique Method vs General Skills */}
          <div className="pt-2 border-t border-[#4A2F15]/50">
            <div className="mb-2">
              <label className="block text-xs font-semibold text-[#FCFCFA] mb-1">
                هل تملك منهجية خاصة أو إطار عمل محدد (Proprietary Framework)؟
              </label>
              <p className="text-[11px] text-[#C8C5BA]">
                امتلاك مهارة عامة (مثل التسويق أو التصميم) لا يعني وجود منهجية خاصة. المنهجية هي خطوات مسماة ومجربة لنقل العميل من نقطة أ إلى ب.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <label
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  uniqueMethodType === 'general_skills_only'
                    ? 'border-[#F5BF1E] bg-[#23170D] text-[#FCFCFA]'
                    : 'border-[#4A2F15]/50 bg-[#040405] text-[#C8C5BA]'
                }`}
              >
                <input
                  type="radio"
                  name="uniqueMethodType"
                  checked={uniqueMethodType === 'general_skills_only'}
                  onChange={() => setUniqueMethodType('general_skills_only')}
                  className="mt-0.5 accent-[#F5BF1E]"
                />
                <div>
                  <span className="font-semibold block">أعتمد على مهاراتي وخبرتي العامة فقط حاليًا (لا أملك إطار عمل مسمى)</span>
                  <span className="text-[11px] text-[#797979] block mt-0.5">
                    الخيار الأكثر أماناً للمبتدئين — لن نحتسب نقاط منهجية، وسنرشدك في التقرير لكيفية استخلاصها.
                  </span>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  uniqueMethodType === 'developing_now'
                    ? 'border-[#F5BF1E] bg-[#23170D] text-[#FCFCFA]'
                    : 'border-[#4A2F15]/50 bg-[#040405] text-[#C8C5BA]'
                }`}
              >
                <input
                  type="radio"
                  name="uniqueMethodType"
                  checked={uniqueMethodType === 'developing_now'}
                  onChange={() => setUniqueMethodType('developing_now')}
                  className="mt-0.5 accent-[#F5BF1E]"
                />
                <div>
                  <span className="font-semibold block">أعمل حاليًا على استخلاص وتوثيق المنهجية من أعمالي السابقة</span>
                  <span className="text-[11px] text-[#797979] block mt-0.5">
                    قيد التطوير — تحتاج لتسمية المراحل واختبارها على أول 3 عملاء.
                  </span>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  uniqueMethodType === 'proprietary_framework'
                    ? 'border-[#F5BF1E] bg-[#23170D] text-[#FCFCFA]'
                    : 'border-[#4A2F15]/50 bg-[#040405] text-[#C8C5BA]'
                }`}
              >
                <input
                  type="radio"
                  name="uniqueMethodType"
                  checked={uniqueMethodType === 'proprietary_framework'}
                  onChange={() => setUniqueMethodType('proprietary_framework')}
                  className="mt-0.5 accent-[#F5BF1E]"
                />
                <div>
                  <span className="font-semibold block">نعم، لدي خطوات ومنهجية عمل مسماة ومحددة بالفعل</span>
                  <span className="text-[11px] text-[#797979] block mt-0.5">
                    مثل: نظام من 4 مراحل، مصفوفة متكاملة، بروتوكول تدريبي محدد المراحل.
                  </span>
                </div>
              </label>
            </div>

            {uniqueMethodType === 'proprietary_framework' && (
              <div className="mt-3">
                <label className="block text-xs font-semibold text-[#F5BF1E] mb-1">
                  اذكر اسم المنهجية أو لخص خطواتها الأساسية:
                </label>
                <input
                  type="text"
                  required
                  value={uniqueMethodText}
                  onChange={(e) => setUniqueMethodText(e.target.value)}
                  placeholder="مثال: نظام الخطوات الأربع لتأهيل العملاء (تحليل - تصفية - جذب - إغلاق)..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#040405] border border-[#F5BF1E]/60 text-xs sm:text-sm text-[#FCFCFA] focus:outline-none"
                />
              </div>
            )}
            {methodValidationError && (
              <div className="mt-3 p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{methodValidationError}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={onBackToSuggestions}
            className="px-4 py-2.5 rounded-xl text-xs text-[#C8C5BA] hover:text-[#FCFCFA] hover:bg-[#23170D] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>الرجوع للفرص المرشحة</span>
          </button>

          <button
            type="submit"
            className="px-6 py-3 rounded-xl font-heading font-bold text-xs sm:text-sm bg-[#F5BF1E] text-[#040405] hover:brightness-105 transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-[#F5BF1E]/15"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>تأكيد الفرضيات والانتقال للتشخيص الكامل</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

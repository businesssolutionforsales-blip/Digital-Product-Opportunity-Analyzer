import React from 'react';
import { StrategicReport } from '../types';
import { isValidAiInterpretation } from './AiStrategicInsight';
import { Printer, ArrowRight, Check, Sparkles } from 'lucide-react';

interface PrintableReportViewProps {
  report: StrategicReport;
  onClose: () => void;
}

export const PrintableReportView: React.FC<PrintableReportViewProps> = ({ report, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(report.createdAt).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 bg-[#FCFCFA] text-[#040405] overflow-y-auto font-['Cairo',sans-serif]">
      {/* Top action toolbar (Hidden during print) */}
      <div className="no-print sticky top-0 z-10 bg-[#FCFCFA]/90 backdrop-blur-md border-b border-[#E5E5E0] px-6 py-4 flex items-center justify-between shadow-xs">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-xs font-semibold text-[#040405] hover:text-[#A7690C] transition-colors cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span>الرجوع للشاشة التفاعلية</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs text-[#797979] hidden sm:inline">
            نسخة المستند للطباعة أو الحفظ كـ PDF
          </span>
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-lg bg-[#040405] text-[#FCFCFA] hover:bg-[#23170D] font-heading font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
          >
            <Printer className="w-4 h-4 text-[#F5BF1E]" />
            <span>طباعة المستند / حفظ PDF</span>
          </button>
        </div>
      </div>

      {/* Main Document Body */}
      <div className="max-w-4xl mx-auto px-8 py-10 text-right leading-relaxed">
        {/* Document Header */}
        <div className="border-b-2 border-[#040405] pb-6 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-[#A7690C] tracking-wide mb-1 font-heading">
              MOHAMED ADEL — GROWTH OS · MODULE 1: CREATOR
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#040405]">
              تقرير تقييم فرصة المنتج الرقمي
            </h1>
            <div className="text-sm text-[#555] mt-1">
              Digital Product Opportunity Diagnostic Report
            </div>
          </div>

          <div className="text-xs text-[#555] space-y-0.5 sm:text-left">
            <div><strong>رقم التقرير:</strong> {report.id}</div>
            <div><strong>تاريخ الإصدار:</strong> {formattedDate}</div>
            <div><strong>المستشار المصمم:</strong> Mohamed Adel</div>
          </div>
        </div>

        {/* 1. Executive Summary & Scores Box */}
        <div className="border border-[#D5D2C9] bg-[#F7F6F2] rounded-xl p-6 mb-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#A7690C] block">
              درجة فرصة المنتج (Opportunity Score)
            </span>
            <div className="text-4xl font-extrabold font-heading text-[#040405]">
              {report.opportunityScore} <span className="text-lg font-normal text-[#797979]">/ 100</span>
            </div>
            <div className="text-sm font-bold text-[#A7690C]">
              {report.opportunityBand.labelAr}
            </div>
            <p className="text-xs text-[#555] leading-relaxed">
              {report.opportunityBand.descriptionAr}
            </p>
          </div>

          <div className="space-y-2 border-t sm:border-t-0 sm:border-r border-[#D5D2C9] pt-4 sm:pt-0 sm:pr-6">
            <span className="text-xs font-bold text-[#555] block">
              درجة الثقة في التحليل (الأدلة المتوفرة)
            </span>
            <div className="text-4xl font-extrabold font-heading text-[#040405]">
              {report.confidenceScore} <span className="text-lg font-normal text-[#797979]">/ 100</span>
            </div>
            <div className="text-sm font-bold text-[#040405]">
              {report.confidenceBand.labelAr}
            </div>
            <p className="text-xs text-[#555] leading-relaxed">
              {report.confidenceBand.descriptionAr}
            </p>
          </div>
        </div>

        {/* 2. Executive Diagnosis */}
        <section className="mb-8 space-y-3">
          <h2 className="font-heading font-bold text-lg text-[#040405] border-b border-[#E5E5E0] pb-2">
            1. تشخيص الفرصة في 60 ثانية
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-lg border border-[#E5E5E0] bg-white">
              <span className="font-bold text-[#A7690C] block mb-1">أقوى نقطة:</span>
              <p className="text-[#333] leading-relaxed">{report.executiveDiagnosis.strongestAspectAr}</p>
            </div>
            <div className="p-4 rounded-lg border border-[#E5E5E0] bg-white">
              <span className="font-bold text-[#A7690C] block mb-1">أكبر مخاطرة:</span>
              <p className="text-[#333] leading-relaxed">{report.executiveDiagnosis.biggestRiskAr}</p>
            </div>
            <div className="p-4 rounded-lg border border-[#E5E5E0] bg-white">
              <span className="font-bold text-[#040405] block mb-1">القرار الفوري:</span>
              <p className="text-[#040405] font-semibold leading-relaxed">{report.executiveDiagnosis.immediateDecisionAr}</p>
            </div>
          </div>
        </section>

        {/* AI Strategic Interpretation (Rendered only when hybrid_ai and valid) */}
        {report.analysisMode === 'hybrid_ai' &&
          isValidAiInterpretation(report.aiInterpretation) && (
            <section className="mb-8 space-y-3 p-5 rounded-xl border border-[#D5D2C9] bg-[#F7F6F2]">
              <div className="flex items-center justify-between border-b border-[#D5D2C9] pb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#A7690C]" />
                  <h2 className="font-heading font-bold text-lg text-[#040405]">
                    الرؤية الاستراتيجية التحليلية المعززة بذكاء Gemini
                  </h2>
                </div>
                <span className="text-[10px] text-[#797979]">
                  قراءة تفسيرية مبنية على البيانات دون المساس بالأوزان القطعية
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-white rounded-lg border border-[#E5E5E0]">
                  <span className="font-bold text-[#A7690C] block mb-1">
                    التقييم الاستشاري لوضع الفكرة ونضجها:
                  </span>
                  <p className="text-[#040405] leading-relaxed font-medium">
                    {report.aiInterpretation.strategic_interpretation}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded-lg border border-[#E5E5E0]">
                    <span className="font-bold text-[#A7690C] block mb-1">
                      الفجوة في الأدلة السوقية (Evidence Gap):
                    </span>
                    <p className="text-[#333] leading-relaxed">
                      {report.aiInterpretation.evidence_gap}
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-[#E5E5E0]">
                    <span className="font-bold text-[#A7690C] block mb-1">
                      تحذير استشاري خاص بحالتك (إياك أن تفعل):
                    </span>
                    <p className="text-[#333] leading-relaxed">
                      {report.aiInterpretation.what_not_to_do}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-white rounded-lg border border-[#E5E5E0] space-y-1">
                  <span className="font-bold text-[#A7690C] block">
                    أقل اختبار ميداني سريع ومباشر للتحقق:
                  </span>
                  <p className="text-[#040405] font-semibold">
                    {report.aiInterpretation.recommended_test}
                  </p>
                  <p className="text-[#555] text-[11px] border-t border-[#E5E5E0] pt-1 mt-1">
                    <strong>السبب الاستراتيجي: </strong>
                    {report.aiInterpretation.recommended_test_reason}
                  </p>
                </div>

                <div className="p-3 bg-white rounded-lg border border-[#E5E5E0]">
                  <span className="font-bold text-[#040405] block mb-0.5">
                    السؤال الاستراتيجي الأهم لتطرحه على نفسك الليلة:
                  </span>
                  <p className="text-[#040405] font-bold">
                    &ldquo;{report.aiInterpretation.next_best_question}&rdquo;
                  </p>
                </div>
              </div>
            </section>
          )}

        {/* 3. Product Concept & Positioning */}
        <section className="mb-8 space-y-3">
          <h2 className="font-heading font-bold text-lg text-[#040405] border-b border-[#E5E5E0] pb-2">
            2. توصيف المنتج والتموضع الاستراتيجي
          </h2>
          <div className="p-5 rounded-lg border border-[#E5E5E0] bg-white space-y-3 text-xs">
            <div>
              <span className="font-bold text-[#555] block">الشكل الموصى به:</span>
              <span className="font-bold text-sm text-[#040405]">{report.formatRecommendation.primary.titleAr}</span>
              <p className="text-[#555] mt-1">{report.formatRecommendation.primary.whyFitAr}</p>
            </div>

            <div className="border-t border-[#E5E5E0] pt-2">
              <span className="font-bold text-[#555] block">عرض القيمة الأولي:</span>
              <p className="text-[#040405] font-medium mt-0.5">&ldquo;{report.productConcept.initialValueProposition}&rdquo;</p>
            </div>

            <div className="border-t border-[#E5E5E0] pt-2">
              <span className="font-bold text-[#555] block">معادلة التموضع (Positioning Statement):</span>
              <p className="text-[#333] font-mono mt-0.5 bg-[#F7F6F2] p-2.5 rounded border border-[#E5E5E0]">
                {report.positioning.formulaVersionAr}
              </p>
            </div>
          </div>
        </section>

        {/* 4. MVP Recommendation */}
        <section className="mb-8 space-y-3">
          <h2 className="font-heading font-bold text-lg text-[#040405] border-b border-[#E5E5E0] pb-2">
            3. النسخة الأولية للاختبار (Minimum Testable Product)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-lg border border-[#D5D2C9] bg-white">
              <span className="font-bold text-[#A7690C] block mb-2">ابنِ الآن فقط:</span>
              <ul className="space-y-1.5 list-disc list-inside text-[#333]">
                {report.mvp.buildNow.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="p-4 rounded-lg border border-[#D5D2C9] bg-white">
              <span className="font-bold text-[#797979] block mb-2">متبنيش لسه:</span>
              <ul className="space-y-1.5 list-disc list-inside text-[#666]">
                {report.mvp.doNotBuildYet.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 5. 7-Day Sprint */}
        <section className="mb-8 space-y-3">
          <h2 className="font-heading font-bold text-lg text-[#040405] border-b border-[#E5E5E0] pb-2">
            4. {report.sprintModeLabelAr ? `خطة التحقق: ${report.sprintModeLabelAr}` : 'خطة التحقق خلال 7 أيام (Action Plan)'}
          </h2>
          <div className="space-y-2.5 text-xs">
            {report.validationSprint.map((day) => (
              <div key={day.dayNumber} className="p-3.5 rounded-lg border border-[#E5E5E0] bg-white flex items-start gap-3">
                <span className="w-6 h-6 rounded bg-[#040405] text-[#FCFCFA] font-bold flex items-center justify-center shrink-0 text-xs">
                  {day.dayNumber}
                </span>
                <div className="flex-1">
                  <span className="font-bold text-[#040405]">{day.dayTitleAr}</span>
                  <span className="text-[#797979] block text-[11px] mb-1">{day.focusAr}</span>
                  <div className="text-[#555] text-[11px]">
                    <strong>المخرج: </strong>{day.expectedOutputAr}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. 7 Discovery Questions */}
        <section className="mb-8 space-y-3">
          <h2 className="font-heading font-bold text-lg text-[#040405] border-b border-[#E5E5E0] pb-2">
            5. أسئلة الاكتشاف الـ 7 للمقابلات السلوكية
          </h2>
          <div className="space-y-2 text-xs">
            {report.discoveryQuestions.map((q) => (
              <div key={q.id} className="p-3 rounded-lg border border-[#E5E5E0] bg-white">
                <div className="font-bold text-[#040405] mb-0.5">س{q.id}: &ldquo;{q.questionAr}&rdquo;</div>
                <div className="text-[11px] text-[#555]">
                  <strong>الهدف: </strong>{q.objectiveAr} · <strong>انتبه لـ: </strong>{q.whatToListenForAr}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 7. Stop / Go Rules & What Not To Do */}
        <section className="mb-8 space-y-3">
          <h2 className="font-heading font-bold text-lg text-[#040405] border-b border-[#E5E5E0] pb-2">
            6. محاذير ومعايير القرار
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-lg border border-[#E5E5E0] bg-white">
              <span className="font-bold text-[#040405] block mb-2">استمر في البناء إذا:</span>
              <ul className="space-y-1 list-disc list-inside text-[#333]">
                {report.stopGoRules.continueIf.map((rule, idx) => (
                  <li key={idx}>{rule}</li>
                ))}
              </ul>
            </div>
            <div className="p-4 rounded-lg border border-[#E5E5E0] bg-white">
              <span className="font-bold text-[#A7690C] block mb-2">متعملش إيه دلوقتي:</span>
              <ul className="space-y-1 list-disc list-inside text-[#333]">
                {report.whatNotToDo.map((item, idx) => (
                  <li key={idx}><strong>{item.headlineAr}:</strong> {item.rationaleAr}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Document Footer */}
        <div className="border-t-2 border-[#040405] pt-6 mt-12 text-center text-xs text-[#797979] space-y-1">
          <div className="font-bold text-[#040405]">Mohamed Adel — Sales Funnel Architect</div>
          <div>&ldquo;أنا مش بصمم صفحة وخلاص، أنا بهندس رحلة بيع كاملة.&rdquo;</div>
          <div className="text-[10px] text-[#999] pt-1">
            هذا التقرير مخصص لصاحب الفكرة للاستخدام الاستراتيجي الشخصي.
          </div>
        </div>
      </div>
    </div>
  );
};

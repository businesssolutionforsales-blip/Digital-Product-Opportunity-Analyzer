import React, { useState, useEffect } from 'react';
import { QuestionnaireAnswers, EvidenceType, ProblemFrequency, TimePerCustomer, UserPath } from '../types';
import { trackEvent } from '../services/analytics';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';

interface StrategicQuestionnaireProps {
  initialAnswers: Partial<QuestionnaireAnswers>;
  userPath: UserPath;
  onSubmit: (answers: QuestionnaireAnswers) => void;
  onBackToPath: () => void;
  savedSection?: number;
}

export const StrategicQuestionnaire: React.FC<StrategicQuestionnaireProps> = ({
  initialAnswers,
  userPath,
  onSubmit,
  onBackToPath,
  savedSection = 0,
}) => {
  const [currentSection, setCurrentSection] = useState<number>(savedSection);

  // STRICT INTEGRITY: All fields start with neutral, unselected states. No biased defaults!
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({
    userPath,
    productNameOrWorkingTitle: initialAnswers.productNameOrWorkingTitle || '',

    // Section A — Creator Advantage
    expertiseDomain: initialAnswers.expertiseDomain || '',
    yearsOfExperience: initialAnswers.yearsOfExperience || '',
    qualificationEvidence: initialAnswers.qualificationEvidence || [],
    uniqueMethodOrProcess: initialAnswers.uniqueMethodOrProcess || '',
    audienceAccessLevel: initialAnswers.audienceAccessLevel || 'not_selected',

    // Section B — Buyer Clarity
    targetBuyerDescription: initialAnswers.targetBuyerDescription || '',
    buyerStageAndSituation: initialAnswers.buyerStageAndSituation || '',
    buyerCurrentBehavior: initialAnswers.buyerCurrentBehavior || '',
    isBuyerBroadOrSpecific: initialAnswers.isBuyerBroadOrSpecific || 'not_selected',

    // Section C — Problem Quality
    coreProblemDescription: initialAnswers.coreProblemDescription || '',
    problemFrequency: initialAnswers.problemFrequency || 'not_selected',
    costOfInaction: initialAnswers.costOfInaction || [],
    currentAlternativesAndWorkarounds: initialAnswers.currentAlternativesAndWorkarounds || '',

    // Section D — Demand Evidence
    demandEvidenceList: initialAnswers.demandEvidenceList || [],
    evidenceNotes: initialAnswers.evidenceNotes || '',

    // Section E — Transformation
    beforeState: initialAnswers.beforeState || '',
    afterState: initialAnswers.afterState || '',
    transformationRealism: initialAnswers.transformationRealism || 'not_selected',

    // Section F — Product Mechanism
    deliveryMechanism: initialAnswers.deliveryMechanism || [],
    creatorMethodSummary: initialAnswers.creatorMethodSummary || '',

    // Section G — Delivery Constraints
    creatorTimePerCustomer: initialAnswers.creatorTimePerCustomer || 'not_selected',
    requiresPersonalFeedback: initialAnswers.requiresPersonalFeedback ?? null,
    requiresOneOnOneAccountability: initialAnswers.requiresOneOnOneAccountability ?? null,

    // Section H — Monetization Context
    expectedPriceTier: initialAnswers.expectedPriceTier || 'not_selected',
    productRoleInBusiness: initialAnswers.productRoleInBusiness || 'not_selected',
    existingAudienceChannel: initialAnswers.existingAudienceChannel || '',
    hasExistingPayingClients: initialAnswers.hasExistingPayingClients ?? null,

    // Provenance & Strategic Rigor
    fieldProvenance: initialAnswers.fieldProvenance || {},
    uniqueMethodType: initialAnswers.uniqueMethodType || 'not_selected',
    hasConfirmedHypotheses: initialAnswers.hasConfirmedHypotheses || false,
  });

  // Autosave draft to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        'ma_analyzer_draft',
        JSON.stringify({
          answers,
          currentSection,
          selectedPath: userPath,
          timestamp: Date.now(),
        })
      );
    } catch (e) {
      // ignore
    }
  }, [answers, currentSection, userPath]);

  const sectionsMeta = [
    { id: 'creator', labelAr: 'ميزة صاحب الخبرة', en: 'Creator Advantage' },
    { id: 'buyer', labelAr: 'وضوح المشتري', en: 'Buyer Clarity' },
    { id: 'problem', labelAr: 'قوة وجودة المشكلة', en: 'Problem Quality' },
    { id: 'demand', labelAr: 'دليل الطلب في السوق', en: 'Demand Evidence' },
    { id: 'transformation', labelAr: 'التحول والنتيجة', en: 'Transformation' },
    { id: 'mechanism', labelAr: 'آلية عمل المنتج', en: 'Mechanism' },
    { id: 'delivery', labelAr: 'قيود التنفيذ والوقت', en: 'Delivery Constraints' },
    { id: 'monetization', labelAr: 'سياق التسعير والدخل', en: 'Monetization' },
  ];

  // Mutual-exclusivity for Qualification Evidence (Requirement #10)
  const toggleQualification = (id: string) => {
    const current = answers.qualificationEvidence || [];
    if (id === 'none_yet') {
      setAnswers({ ...answers, qualificationEvidence: ['none_yet'] });
    } else {
      const withoutNone = current.filter((x) => x !== 'none_yet');
      if (withoutNone.includes(id)) {
        setAnswers({ ...answers, qualificationEvidence: withoutNone.filter((x) => x !== id) });
      } else {
        setAnswers({ ...answers, qualificationEvidence: [...withoutNone, id] });
      }
    }
  };

  // Mutual-exclusivity for Demand Evidence (Requirement #10)
  const toggleDemandEvidence = (id: EvidenceType) => {
    const current = answers.demandEvidenceList || [];
    if (id === 'none_yet') {
      setAnswers({ ...answers, demandEvidenceList: ['none_yet'] });
    } else {
      const withoutNone = current.filter((x) => x !== 'none_yet');
      if (withoutNone.includes(id)) {
        setAnswers({ ...answers, demandEvidenceList: withoutNone.filter((x) => x !== id) });
      } else {
        setAnswers({ ...answers, demandEvidenceList: [...withoutNone, id] });
      }
    }
  };

  const toggleCostOfInaction = (id: string) => {
    const current = answers.costOfInaction || [];
    if (current.includes(id)) {
      setAnswers({ ...answers, costOfInaction: current.filter((x) => x !== id) });
    } else {
      setAnswers({ ...answers, costOfInaction: [...current, id] });
    }
  };

  const toggleDeliveryMechanism = (id: string) => {
    const current = answers.deliveryMechanism || [];
    if (current.includes(id)) {
      setAnswers({ ...answers, deliveryMechanism: current.filter((x) => x !== id) });
    } else {
      setAnswers({ ...answers, deliveryMechanism: [...current, id] });
    }
  };

  const handleNext = () => {
    trackEvent('questionnaire_section_completed', {
      section_index: currentSection,
      section_id: sectionsMeta[currentSection].id,
    });

    if (currentSection < sectionsMeta.length - 1) {
      setCurrentSection(currentSection + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Clean up draft on submission
      try {
        localStorage.removeItem('ma_analyzer_draft');
      } catch (e) {}
      onSubmit(answers);
    }
  };

  const handlePrev = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onBackToPath();
    }
  };

  // Section validation checks
  const canProceedSection = (): boolean => {
    switch (currentSection) {
      case 0:
        return Boolean(answers.expertiseDomain.trim());
      case 1:
        return Boolean(answers.targetBuyerDescription.trim());
      case 2:
        return Boolean(answers.coreProblemDescription.trim());
      case 3:
        return answers.demandEvidenceList.length > 0;
      case 4:
        return Boolean(answers.beforeState.trim() && answers.afterState.trim());
      default:
        return true;
    }
  };

  const progressPercent = Math.round(((currentSection + 1) / sectionsMeta.length) * 100);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 text-right">
      {/* Step / Section Navigation Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs text-[#C8C5BA] mb-2.5">
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-[#F5BF1E]">
              القسم {currentSection + 1} من {sectionsMeta.length}
            </span>
            <span className="text-[#797979]">·</span>
            <span className="text-[#FCFCFA] font-medium">{sectionsMeta[currentSection].labelAr}</span>
          </div>
          <span className="text-[#797979] font-mono text-[11px]">{progressPercent}% مكتمل</span>
        </div>

        {/* Progress bar line */}
        <div className="w-full h-1.5 bg-[#23170D] rounded-full overflow-hidden border border-[#4A2F15]/40">
          <div
            className="h-full bg-gradient-to-l from-[#F5BF1E] to-[#A7690C] transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Dynamic Section Contents */}
      <div className="bg-[#23170D]/40 border border-[#4A2F15]/60 rounded-2xl p-5 sm:p-7 shadow-lg backdrop-blur-sm mb-8">
        {/* ========================================================
            SECTION 0: CREATOR ADVANTAGE
        ======================================================== */}
        {currentSection === 0 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs text-[#A7690C] font-semibold tracking-wider">
                المحور الأول: ميزة صاحب الخبرة (Creator Advantage)
              </span>
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#FCFCFA] mt-1 mb-2">
                إيه اللي يخليك مؤهل تساعد الناس في المشكلة دي؟
              </h2>
              <p className="text-xs sm:text-sm text-[#C8C5BA] leading-relaxed">
                الهدف هو فهم أرضيتك المعرفية وسلطتك في المجال، ومصادر مصداقيتك أمام المشتري المحتمل.
              </p>
            </div>

            {/* Field: Working Title / Idea */}
            <div>
              <label className="block text-xs font-semibold text-[#FCFCFA] mb-1.5">
                اسم أو عنوان مبدئي لفكرة المنتج (اختياري)
              </label>
              <input
                type="text"
                value={answers.productNameOrWorkingTitle || ''}
                onChange={(e) => setAnswers({ ...answers, productNameOrWorkingTitle: e.target.value })}
                placeholder="مثال: ورشة هندسة صفحات البيع، حزمة قوالب إدارة المشاريع..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#040405] border border-[#4A2F15] focus:border-[#F5BF1E] text-sm text-[#FCFCFA] placeholder-[#797979] focus:outline-none"
              />
            </div>

            {/* Field: Expertise Domain */}
            <div>
              <label className="block text-xs font-semibold text-[#FCFCFA] mb-1.5">
                مجال خبرتك الأساسي <span className="text-[#F5BF1E]">*</span>
              </label>
              <input
                type="text"
                required
                value={answers.expertiseDomain}
                onChange={(e) => setAnswers({ ...answers, expertiseDomain: e.target.value })}
                placeholder="مثال: هندسة مسارات البيع (Sales Funnels)، تسويق إلكتروني، استشارات تغذية..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#040405] border border-[#4A2F15] focus:border-[#F5BF1E] text-sm text-[#FCFCFA] placeholder-[#797979] focus:outline-none"
              />
            </div>

            {/* Field: Years of Experience */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#FCFCFA] mb-1.5">
                  سنوات ممارسة هذا المجال
                </label>
                <select
                  value={answers.yearsOfExperience}
                  onChange={(e) => setAnswers({ ...answers, yearsOfExperience: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#040405] border border-[#4A2F15] focus:border-[#F5BF1E] text-xs text-[#FCFCFA] focus:outline-none"
                >
                  <option value="">اختر عدد السنوات...</option>
                  <option value="أقل من سنتين">أقل من سنتين</option>
                  <option value="2-4 سنوات">2 إلى 4 سنوات</option>
                  <option value="5-8 سنوات">5 إلى 8 سنوات</option>
                  <option value="+8 سنوات">+8 سنوات من الممارسة المكثفة</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#FCFCFA] mb-1.5">
                  قد إيه تقدر توصل بشكل مباشر لأشخاص ينطبق عليهم وصف العميل المستهدف؟
                </label>
                <select
                  value={answers.audienceAccessLevel}
                  onChange={(e: any) =>
                    setAnswers({
                      ...answers,
                      audienceAccessLevel: e.target.value,
                      fieldProvenance: {
                        ...answers.fieldProvenance,
                        audienceAccess: 'user_explicit',
                      },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#040405] border border-[#4A2F15] focus:border-[#F5BF1E] text-xs text-[#FCFCFA] focus:outline-none"
                >
                  <option value="not_selected">اختر مدى وصولك للعميل المستهدف...</option>
                  <option value="direct_daily">أقدر أوصل لهم بشكل مباشر ومتكرر</option>
                  <option value="occasional">أقدر أوصل لبعضهم أحيانًا</option>
                  <option value="indirect_communities">أعرف فين موجودين لكن مفيش وصول مباشر</option>
                  <option value="none_yet">معنديش وصول حاليًا</option>
                  <option value="unsure">مش متأكد</option>
                </select>
              </div>
            </div>

            {/* Field: Qualification Evidence (Mutually Exclusive none_yet) */}
            <div>
              <label className="block text-xs font-semibold text-[#FCFCFA] mb-2">
                إيه الدليل الواقعي على كفاءتك في تحقيق نتائج بهذا المجال؟ (اختر كل ما ينطبق)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { id: 'client_results', label: 'نتائج وتجارب نجاح حقيقية لعملاء سابقين' },
                  { id: 'personal_results', label: 'حققت النتيجة بنفسي في شغلي ومشاريعي الخاصة' },
                  { id: 'professional_credentials', label: 'دراسة وتراخيص أو خبرة مؤسسية موثقة' },
                  { id: 'audience_access', label: 'جمهور يتابع نصائحي ويثق في آرائي بانتظام' },
                  { id: 'none_yet', label: 'معنديش نتائج موثقة حتى الآن (أبدأ من الصفر)' },
                ].map((item) => {
                  const isChecked = (answers.qualificationEvidence || []).includes(item.id);
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => toggleQualification(item.id)}
                      className={`p-3 rounded-xl border text-right text-xs transition-colors cursor-pointer flex items-center justify-between ${
                        isChecked
                          ? 'border-[#F5BF1E] bg-[#23170D] text-[#FCFCFA]'
                          : 'border-[#4A2F15]/50 bg-[#040405] text-[#C8C5BA] hover:border-[#4A2F15]'
                      }`}
                    >
                      <span>{item.label}</span>
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                          isChecked ? 'border-[#F5BF1E] bg-[#F5BF1E] text-[#040405]' : 'border-[#4A2F15]'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Field: Unique Method vs General Skills (Requirement #3) */}
            <div className="space-y-3 pt-2 border-t border-[#4A2F15]/40">
              <div>
                <label className="block text-xs font-semibold text-[#FCFCFA] mb-1">
                  هل عندك منهجية خاصة أو إطار عمل محدد ومجرب (Proprietary Framework)؟
                </label>
                <p className="text-[11px] text-[#C8C5BA]">
                  تنبيه استشاري: امتلاك مهارات عامة (مثل التسويق أو التصميم أو البرمجة) لا يُعد منهجية. المنهجية هي خطوات مسلسلة ومسماة لنقل العميل من نقطة أ إلى نقطة ب.
                </p>
              </div>

              <div className="space-y-2">
                {[
                  {
                    id: 'general_skills_only',
                    title: 'أعتمد على مهاراتي وخبرتي العامة فقط حاليًا (لا أملك منهجية مسماة حتى الآن)',
                    sub: 'الخيار الصادق للمبتدئين — لن تُحتسب نقاط تميز لمنهجية غير موجودة، وسنرشدك في التقرير لكيفية استخلاصها.',
                  },
                  {
                    id: 'proprietary_framework',
                    title: 'نعم، أمتلك منهجية أو إطار عمل محدد الخطوات ومجرب (Framework)',
                    sub: 'خطوات مسلسلة من 3 إلى 5 مراحل تُميز عرضك وتمنحك سلطة إقناعية عالية.',
                  },
                  {
                    id: 'developing_now',
                    title: 'أعمل حاليًا على استخلاص وتوثيق المنهجية من نتائجي السابقة',
                    sub: 'قيد التطوير — تحتاج لتسمية المراحل وتجربتها على أول 3 عملاء.',
                  },
                ].map((item) => {
                  const isChosen =
                    answers.uniqueMethodType === item.id ||
                    (!answers.uniqueMethodType && item.id === 'general_skills_only');
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => {
                        const newType = item.id as any;
                        setAnswers({
                          ...answers,
                          uniqueMethodType: newType,
                          uniqueMethodOrProcess:
                            newType === 'general_skills_only' ? '' : answers.uniqueMethodOrProcess,
                          fieldProvenance: {
                            ...answers.fieldProvenance,
                            uniqueMethod: 'user_explicit',
                          },
                        });
                      }}
                      className={`w-full p-3 rounded-xl border text-right transition-colors cursor-pointer flex items-start gap-3 ${
                        isChosen
                          ? 'border-[#F5BF1E] bg-[#23170D] text-[#FCFCFA]'
                          : 'border-[#4A2F15]/50 bg-[#040405] text-[#C8C5BA] hover:border-[#4A2F15]'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center shrink-0 ${
                          isChosen ? 'border-[#F5BF1E] bg-[#F5BF1E]' : 'border-[#4A2F15]'
                        }`}
                      >
                        {isChosen && <div className="w-1.5 h-1.5 rounded-full bg-[#040405]" />}
                      </div>
                      <div>
                        <div className="text-xs font-semibold">{item.title}</div>
                        <div className="text-[11px] text-[#797979] mt-0.5">{item.sub}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {answers.uniqueMethodType === 'proprietary_framework' && (
                <div className="mt-2.5">
                  <label className="block text-xs font-semibold text-[#F5BF1E] mb-1.5">
                    اسم المنهجية أو تلخيص لمراحلها الأساسية:
                  </label>
                  <input
                    type="text"
                    value={answers.uniqueMethodOrProcess}
                    onChange={(e) =>
                      setAnswers({
                        ...answers,
                        uniqueMethodOrProcess: e.target.value,
                        fieldProvenance: {
                          ...answers.fieldProvenance,
                          uniqueMethod: 'user_explicit',
                        },
                      })
                    }
                    placeholder="مثال: إطار عمل الخطوات الأربع (تحليل - هندسة - إطلاق - تحسين)..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#040405] border border-[#F5BF1E]/60 focus:border-[#F5BF1E] text-xs sm:text-sm text-[#FCFCFA] placeholder-[#797979] focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            SECTION 1: BUYER CLARITY
        ======================================================== */}
        {currentSection === 1 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs text-[#A7690C] font-semibold tracking-wider">
                المحور الثاني: وضوح المشتري (Buyer Clarity)
              </span>
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#FCFCFA] mt-1 mb-2">
                مين الشخص اللي المنتج معمول له تحديدًا؟
              </h2>
              <p className="text-xs sm:text-sm text-[#C8C5BA] leading-relaxed">
                كل ما كان المشتري محددًا في مرحلة وسياق واضح، كل ما كانت رسالتك أقوى وفرصة التحويل أعلى.
              </p>
            </div>

            {/* Warning if broad */}
            {answers.targetBuyerDescription.includes('أي حد') ||
            answers.targetBuyerDescription.includes('الجميع') ||
            answers.targetBuyerDescription.includes('كل الناس') ? (
              <div className="p-3.5 rounded-xl bg-[#23170D] border border-[#F5BF1E]/50 flex items-start gap-2.5 text-xs text-[#FBD052]">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#F5BF1E]" />
                <div>
                  <strong>ملاحظة استراتيجية:</strong> الإجابة دي واسعة شوية — بيع منتج رقمي للجميع غالبًا ما
                  ينتهي بعدم بيعه لأحد. حاول تضييق الشريحة لوظيفة أو مرحلة محددة.
                </div>
              </div>
            ) : null}

            <div>
              <label className="block text-xs font-semibold text-[#FCFCFA] mb-1.5">
                وصف المشتري المستهدف بدقة <span className="text-[#F5BF1E]">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={answers.targetBuyerDescription}
                onChange={(e) => setAnswers({ ...answers, targetBuyerDescription: e.target.value })}
                placeholder="مثال محدد: مدرب لياقة أونلاين عنده أول 10-30 عميل لكنه بيقضي وقت كبير في المتابعة اليدوية ومحتاج يقلل ساعات المتابعة."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#040405] border border-[#4A2F15] focus:border-[#F5BF1E] text-xs sm:text-sm text-[#FCFCFA] placeholder-[#797979] focus:outline-none"
              />
            </div>

            {/* Specificity Self-rating (Unselected by default) */}
            <div>
              <label className="block text-xs font-semibold text-[#FCFCFA] mb-2">
                درجة خصوصية هذا الجمهور في تقييمك؟
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'narrow_specific', label: 'شريحة ضيقة ومحددة جدًا', desc: 'مهنة وظروف معينة يسهل استهدافها' },
                  { id: 'moderate', label: 'شريحة متوسطة التحديد', desc: 'فئة معروفة ولكن تشمل عدة مستويات' },
                  { id: 'broad_general', label: 'جمهور عام وواسع', desc: 'مفتوح لأي مهتم بالمجال' },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setAnswers({ ...answers, isBuyerBroadOrSpecific: item.id as any })}
                    className={`p-3 rounded-xl border text-right transition-colors cursor-pointer ${
                      answers.isBuyerBroadOrSpecific === item.id
                        ? 'border-[#F5BF1E] bg-[#23170D] text-[#FCFCFA]'
                        : 'border-[#4A2F15]/50 bg-[#040405] text-[#C8C5BA]'
                    }`}
                  >
                    <div className="font-heading font-bold text-xs mb-1">{item.label}</div>
                    <div className="text-[11px] text-[#797979]">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Buyer current situation */}
            <div>
              <label className="block text-xs font-semibold text-[#FCFCFA] mb-1.5">
                إيه الوضع أو اللحظة اللي بيمر بيها المشتري دلوقتي وبتخليه يدور على حل؟
              </label>
              <input
                type="text"
                value={answers.buyerStageAndSituation}
                onChange={(e) => setAnswers({ ...answers, buyerStageAndSituation: e.target.value })}
                placeholder="مثال: وصل للحد الأقصى من الساعات ومش قادر يستقبل عملاء جدد..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#040405] border border-[#4A2F15] focus:border-[#F5BF1E] text-xs sm:text-sm text-[#FCFCFA] placeholder-[#797979] focus:outline-none"
              />
            </div>

            {/* Buyer current behavior */}
            <div>
              <label className="block text-xs font-semibold text-[#FCFCFA] mb-1.5">
                إيه الإجراء أو السلوك الفعلي اللي بيعمله المشتري حاليًا للتعامل مع المشكلة؟
              </label>
              <input
                type="text"
                value={answers.buyerCurrentBehavior}
                onChange={(e) => setAnswers({ ...answers, buyerCurrentBehavior: e.target.value })}
                placeholder="مثال: بيحاول يدير المتابعة يدويًا بملفات إكسيل ورسائل واتساب مشتتة..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#040405] border border-[#4A2F15] focus:border-[#F5BF1E] text-xs sm:text-sm text-[#FCFCFA] placeholder-[#797979] focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* ========================================================
            SECTION 2: PROBLEM QUALITY
        ======================================================== */}
        {currentSection === 2 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs text-[#A7690C] font-semibold tracking-wider">
                المحور الثالث: جودة وقوة المشكلة (Problem Quality)
              </span>
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#FCFCFA] mt-1 mb-2">
                إيه المشكلة المحددة اللي المنتج المفروض يحلها؟
              </h2>
              <p className="text-xs sm:text-sm text-[#C8C5BA] leading-relaxed">
                المنتجات الرقمية الناجحة لا تبيع &ldquo;معلومات&rdquo;، بل تبيع علاجًا لألم محدد واختصارًا للوقت والمال.
              </p>
            </div>

            {/* Core problem */}
            <div>
              <label className="block text-xs font-semibold text-[#FCFCFA] mb-1.5">
                وصف المشكلة الأساسية <span className="text-[#F5BF1E]">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={answers.coreProblemDescription}
                onChange={(e) => setAnswers({ ...answers, coreProblemDescription: e.target.value })}
                placeholder="مثال: ضعف معدل تحويل صفحات الهبوط وإهدار ميزانية الإعلانات دون معرفة سبب خروج الزوار..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#040405] border border-[#4A2F15] focus:border-[#F5BF1E] text-xs sm:text-sm text-[#FCFCFA] placeholder-[#797979] focus:outline-none"
              />
            </div>

            {/* Frequency (No biased default) */}
            <div>
              <label className="block text-xs font-semibold text-[#FCFCFA] mb-2">
                المشكلة دي بتواجه العميل كل قد إيه تقريبًا؟
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                {[
                  { id: 'daily', label: 'يوميًا' },
                  { id: 'weekly', label: 'أسبوعيًا' },
                  { id: 'monthly', label: 'شهريًا' },
                  { id: 'occasional', label: 'أحيانًا' },
                  { id: 'unsure', label: 'مش متأكد لسه' },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setAnswers({ ...answers, problemFrequency: item.id as ProblemFrequency })}
                    className={`py-2 px-3 rounded-xl border text-center transition-colors cursor-pointer ${
                      answers.problemFrequency === item.id
                        ? 'border-[#F5BF1E] bg-[#23170D] text-[#FCFCFA] font-bold'
                        : 'border-[#4A2F15]/50 bg-[#040405] text-[#C8C5BA]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Cost of Inaction (Multi select, empty by default) */}
            <div>
              <label className="block text-xs font-semibold text-[#FCFCFA] mb-2">
                لو الشخص محلّش المشكلة دي، إيه اللي بيخسره بالتحديد؟ (اختر كل ما ينطبق)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                {[
                  { id: 'money', label: 'خسارة فلوس أو تكلفة مباشرة' },
                  { id: 'time', label: 'إهدار وقت طويل وساعات إضافية' },
                  { id: 'opportunity', label: 'ضياع فرص نمو وصفقات مهمة' },
                  { id: 'stress', label: 'ضغط نفسي وتشتت وإحباط مستمر' },
                  { id: 'performance', label: 'ضعف الأداء وتراجع جودة العمل' },
                  { id: 'status', label: 'تأثر السمعة أو المكانة المهنية' },
                ].map((cost) => {
                  const isChecked = (answers.costOfInaction || []).includes(cost.id);
                  return (
                    <button
                      type="button"
                      key={cost.id}
                      onClick={() => toggleCostOfInaction(cost.id)}
                      className={`p-3 rounded-xl border text-right transition-colors cursor-pointer flex items-center justify-between ${
                        isChecked
                          ? 'border-[#F5BF1E] bg-[#23170D] text-[#FCFCFA]'
                          : 'border-[#4A2F15]/50 bg-[#040405] text-[#C8C5BA]'
                      }`}
                    >
                      <span>{cost.label}</span>
                      {isChecked && <Check className="w-3.5 h-3.5 text-[#F5BF1E] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Existing Workarounds */}
            <div>
              <label className="block text-xs font-semibold text-[#FCFCFA] mb-1.5">
                الناس بتحاول تحل المشكلة دي دلوقتي بإيه؟ (البدائل الحالية)
              </label>
              <input
                type="text"
                value={answers.currentAlternativesAndWorkarounds}
                onChange={(e) => setAnswers({ ...answers, currentAlternativesAndWorkarounds: e.target.value })}
                placeholder="مثال: بيجربوا قوالب مجانية غير مناسبة، أو بيعينوا فريلانسر غير متخصص..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#040405] border border-[#4A2F15] focus:border-[#F5BF1E] text-xs sm:text-sm text-[#FCFCFA] placeholder-[#797979] focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* ========================================================
            SECTION 3: DEMAND EVIDENCE (Strict Integrity & Mutually Exclusive)
        ======================================================== */}
        {currentSection === 3 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs text-[#A7690C] font-semibold tracking-wider">
                المحور الرابع: دليل الطلب (Demand Evidence)
              </span>
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#FCFCFA] mt-1 mb-2">
                إيه الدليل الواقعي اللي عندك إن الناس مهتمة ومستعدة تدفع؟
              </h2>
              <p className="text-xs sm:text-sm text-[#C8C5BA] leading-relaxed">
                لا نختلق دليلاً من الفراغ. التحليل بيعتمد حصرًا على الوقائع الحقيقية اللي عندك.
              </p>
            </div>

            {/* Evidence Checklist (Empty by default, none_yet mutually exclusive) */}
            <div className="space-y-2.5">
              {[
                {
                  id: 'preorders_deposits',
                  title: 'حجوزات مسبقة أو دفعات مالية مدفوعة فعليًا (Pre-orders / Deposits)',
                  level: 'المستوى الأول: أقوى دليل سوقي ممكن',
                },
                {
                  id: 'sold_related_work',
                  title: 'بعت خدمات أو استشارات سابقة لنفس المشكلة وحققت منها دخلاً',
                  level: 'المستوى الثاني: دليل مالي قوي',
                },
                {
                  id: 'existing_clients_ask',
                  title: 'عملاء حاليون طلبوا مني هذا الحل بالاسم بشكل متكرر',
                  level: 'المستوى الثاني: طلب داخلي مباشر',
                },
                {
                  id: 'waitlist_subscribers',
                  title: 'عندي قائمة انتظار (Waitlist) فيها إيميلات أو أرقام أشخاص منتظرين العرض',
                  level: 'المستوى الثاني: اهتمام مؤكد',
                },
                {
                  id: 'people_ask_me',
                  title: 'ناس بتبعتلي أسئلة واستفسارات عن كيفية حل المشكلة في الرسائل',
                  level: 'المستوى الثالث: مؤشر اهتمام أولي',
                },
                {
                  id: 'audience_comments',
                  title: 'تفاعل وتعليقات على منشوراتي ومقاطعي حول هذا الموضوع',
                  level: 'المستوى الثالث: فضول محتوائي',
                },
                {
                  id: 'competitors_sell',
                  title: 'منافسون في نفس المجال يبيعون دورات أو حلولاً مشابهة',
                  level: 'المستوى الرابع: مؤشر على نشاط تجاري في الفئة (لا يثبت الطلب على عرضك تحديدًا)',
                },
                {
                  id: 'search_community_discussions',
                  title: 'نقاشات وبحث متكرر في مجتمعات وجروبات مهنية',
                  level: 'المستوى الرابع: مؤشر عام للمجال',
                },
                {
                  id: 'none_yet',
                  title: 'معنديش أي دليل واقعي حتى الآن (الفكرة مبنية على فرضية شخصية فقط)',
                  level: 'المستوى الخامس: فرضية تحتاج لاختبار أولاً',
                },
              ].map((ev) => {
                const isSelected = (answers.demandEvidenceList || []).includes(ev.id as EvidenceType);
                return (
                  <button
                    type="button"
                    key={ev.id}
                    onClick={() => toggleDemandEvidence(ev.id as EvidenceType)}
                    className={`w-full p-3.5 rounded-xl border text-right transition-colors cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-[#F5BF1E] bg-[#23170D] text-[#FCFCFA]'
                        : 'border-[#4A2F15]/40 bg-[#040405] text-[#C8C5BA] hover:border-[#4A2F15]'
                    }`}
                  >
                    <div className="flex-1 pl-3">
                      <div className="text-xs sm:text-sm font-semibold">{ev.title}</div>
                      <div className="text-[11px] text-[#A7690C] mt-0.5">{ev.level}</div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border ${
                        isSelected ? 'border-[#F5BF1E] bg-[#F5BF1E] text-[#040405]' : 'border-[#4A2F15]'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Evidence notes */}
            <div>
              <label className="block text-xs font-semibold text-[#FCFCFA] mb-1.5">
                ملاحظات أو تفاصيل إضافية حول الأدلة دي (أرقام، محادثات، روابط)
              </label>
              <textarea
                rows={2}
                value={answers.evidenceNotes}
                onChange={(e) => setAnswers({ ...answers, evidenceNotes: e.target.value })}
                placeholder="مثال: تواصلت مع 3 عملاء وطلبوا قالبًا منظمًا، ومفيش لسه دفعات مسبقة..."
                className="w-full px-3.5 py-2 rounded-xl bg-[#040405] border border-[#4A2F15] focus:border-[#F5BF1E] text-xs text-[#FCFCFA] placeholder-[#797979] focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* ========================================================
            SECTION 4: TRANSFORMATION (BEFORE -> AFTER)
        ======================================================== */}
        {currentSection === 4 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs text-[#A7690C] font-semibold tracking-wider">
                المحور الخامس: التحول والنتيجة (Transformation)
              </span>
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#FCFCFA] mt-1 mb-2">
                بعد استخدام المنتج، إيه التغيير اللي المفروض يحصل؟
              </h2>
              <p className="text-xs sm:text-sm text-[#C8C5BA] leading-relaxed">
                حدد التباين الواضح بين نقطة البداية (قبل المنتج) والوصول للنتيجة (بعد المنتج) دون وعود خيالية.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Before */}
              <div className="p-4 rounded-xl bg-[#040405] border border-[#4A2F15]/70">
                <div className="flex items-center gap-2 mb-2 text-xs font-bold text-[#C8C5BA]">
                  <span className="w-2 h-2 rounded-full bg-[#797979]" />
                  <span>قبل استخدام المنتج (نقطة الألم):</span>
                </div>
                <textarea
                  rows={3}
                  required
                  value={answers.beforeState}
                  onChange={(e) => setAnswers({ ...answers, beforeState: e.target.value })}
                  placeholder="مثال: مشتت ومش عارف يصمم مسار البيع، كل زيارة بتضيع ومعدل التحويل ضعيف..."
                  className="w-full p-2.5 rounded-lg bg-[#23170D]/40 border border-[#4A2F15]/40 text-xs text-[#FCFCFA] focus:outline-none focus:border-[#F5BF1E]"
                />
              </div>

              {/* After */}
              <div className="p-4 rounded-xl bg-[#040405] border border-[#F5BF1E]/40">
                <div className="flex items-center gap-2 mb-2 text-xs font-bold text-[#F5BF1E]">
                  <span className="w-2 h-2 rounded-full bg-[#F5BF1E]" />
                  <span>بعد استخدام المنتج (التحول الملموس):</span>
                </div>
                <textarea
                  rows={3}
                  required
                  value={answers.afterState}
                  onChange={(e) => setAnswers({ ...answers, afterState: e.target.value })}
                  placeholder="مثال: مسار بيع متكامل جاهز وواضح، صفحة هبوط مجربة ترفع التحويل بثقة..."
                  className="w-full p-2.5 rounded-lg bg-[#23170D]/40 border border-[#4A2F15]/40 text-xs text-[#FCFCFA] focus:outline-none focus:border-[#F5BF1E]"
                />
              </div>
            </div>

            {/* Realism level (Unselected by default) */}
            <div>
              <label className="block text-xs font-semibold text-[#FCFCFA] mb-2">
                مدى واقعية وسيطرة العميل على تحقيق هذه النتيجة؟
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {[
                  {
                    id: 'highly_controllable',
                    title: 'تحت سيطرة العميل بالكامل',
                    desc: 'تعتمد فقط على تطبيقه للخطوات والأدوات',
                  },
                  {
                    id: 'moderate',
                    title: 'واقعية ومعتدلة',
                    desc: 'تحتاج التزامًا مع بعض العوامل السوقية',
                  },
                  {
                    id: 'depends_on_many_external_factors',
                    title: 'تعتمد على عوامل خارجية كثيرة',
                    desc: 'قد يصعب ضمان رضا كل المشترين',
                  },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setAnswers({ ...answers, transformationRealism: item.id as any })}
                    className={`p-3 rounded-xl border text-right transition-colors cursor-pointer ${
                      answers.transformationRealism === item.id
                        ? 'border-[#F5BF1E] bg-[#23170D] text-[#FCFCFA]'
                        : 'border-[#4A2F15]/50 bg-[#040405] text-[#C8C5BA]'
                    }`}
                  >
                    <div className="font-bold mb-1">{item.title}</div>
                    <div className="text-[11px] text-[#797979]">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            SECTION 5: PRODUCT MECHANISM
        ======================================================== */}
        {currentSection === 5 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs text-[#A7690C] font-semibold tracking-wider">
                المحور السادس: آلية المنتج (Product Mechanism)
              </span>
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#FCFCFA] mt-1 mb-2">
                إيه اللي هيخلي المنتج يساعد الشخص يوصل للنتيجة؟
              </h2>
              <p className="text-xs sm:text-sm text-[#C8C5BA] leading-relaxed">
                حدد العناصر التي يحصل عليها العميل بالفعل لضمان التطبيق السريع وتقليل الحشو النظري.
              </p>
            </div>

            {/* Delivery components (Empty by default) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {[
                { id: 'framework_steps', label: 'خطوات ومنهجية عمل مسلسلة (Framework)' },
                { id: 'templates_tools', label: 'نماذج وقوالب جاهزة للتعبئة (Templates)' },
                { id: 'live_coaching', label: 'جلسات تفاعلية مباشرة مع أسئلة وأجوبة (Q&A)' },
                { id: 'critique_feedback', label: 'ملاحظات وتقييم مباشر لأعمال المشتركين (Feedback)' },
                { id: 'accountability', label: 'متابعة التزام ومهام محددة المواعيد (Accountability)' },
                { id: 'community', label: 'مجتمع ونقاشات تفاعلية بين الأعضاء' },
              ].map((mech) => {
                const isSelected = (answers.deliveryMechanism || []).includes(mech.id);
                return (
                  <button
                    type="button"
                    key={mech.id}
                    onClick={() => toggleDeliveryMechanism(mech.id)}
                    className={`p-3 rounded-xl border text-right transition-colors cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-[#F5BF1E] bg-[#23170D] text-[#FCFCFA]'
                        : 'border-[#4A2F15]/50 bg-[#040405] text-[#C8C5BA]'
                    }`}
                  >
                    <span>{mech.label}</span>
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                        isSelected ? 'border-[#F5BF1E] bg-[#F5BF1E] text-[#040405]' : 'border-[#4A2F15]'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Creator method summary */}
            <div>
              <label className="block text-xs font-semibold text-[#FCFCFA] mb-1.5">
                لخص الآلية الأساسية في جملة (اتركها فارغة إذا لم تكن محددة بعد)
              </label>
              <input
                type="text"
                value={answers.creatorMethodSummary}
                onChange={(e) => setAnswers({ ...answers, creatorMethodSummary: e.target.value })}
                placeholder="مثال: قوالب كتابة صفحات الهبوط مدعومة بمراجعة فيديو تفاعلية..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#040405] border border-[#4A2F15] focus:border-[#F5BF1E] text-xs sm:text-sm text-[#FCFCFA] placeholder-[#797979] focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* ========================================================
            SECTION 6: DELIVERY CONSTRAINTS
        ======================================================== */}
        {currentSection === 6 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs text-[#A7690C] font-semibold tracking-wider">
                المحور السابع: قيود التنفيذ والوقت (Delivery Constraints)
              </span>
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#FCFCFA] mt-1 mb-2">
                قد إيه من وقتك تقدر تخصصه لكل عميل يشتري؟
              </h2>
              <p className="text-xs sm:text-sm text-[#C8C5BA] leading-relaxed">
                المنتج الرقمي يجب أن يحرر وقتك، وليس أن يتحول لوظيفة استشارية أخرى تستنزف يومك.
              </p>
            </div>

            {/* Time per customer (Unselected by default) */}
            <div className="space-y-2.5">
              {[
                {
                  id: 'almost_none',
                  title: 'شبه منعدم (تسليم رقمي وتطبيق ذاتي بالكامل)',
                  desc: 'العميل يستلم المحتوى والأدوات ويطبق بنفسه 100%',
                },
                {
                  id: 'under_30m',
                  title: 'أقل من 30 دقيقة لكل عميل',
                  desc: 'مراجعة سريعة أو إجابة على سؤال محدد عبر الرسائل',
                },
                {
                  id: '1_to_2h',
                  title: 'ساعة إلى ساعتين لكل عميل',
                  desc: 'جلسة توجيه أو تقييم مفصل للعمل',
                },
                {
                  id: 'recurring_support',
                  title: 'متابعة مستمرة دورية (أسبوعية أو شهرية)',
                  desc: 'تتطلب تواجدك الدائم على المنصة',
                },
                {
                  id: 'high_touch',
                  title: 'تدخل شخصي مكثف (High-Touch)',
                  desc: 'النتيجة تعتمد على متابعتك الفردية خطوة بخطوة',
                },
              ].map((timeOpt) => {
                const isSelected = answers.creatorTimePerCustomer === timeOpt.id;
                return (
                  <button
                    type="button"
                    key={timeOpt.id}
                    onClick={() => setAnswers({ ...answers, creatorTimePerCustomer: timeOpt.id as TimePerCustomer })}
                    className={`w-full p-3.5 rounded-xl border text-right transition-colors cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-[#F5BF1E] bg-[#23170D] text-[#FCFCFA]'
                        : 'border-[#4A2F15]/40 bg-[#040405] text-[#C8C5BA]'
                    }`}
                  >
                    <div>
                      <div className="text-xs sm:text-sm font-semibold">{timeOpt.title}</div>
                      <div className="text-[11px] text-[#797979] mt-0.5">{timeOpt.desc}</div>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-[#F5BF1E] bg-[#F5BF1E]' : 'border-[#4A2F15]'
                      }`}
                    >
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#040405]" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Tri-state Toggles (No biased pre-checked values) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-[#040405] border border-[#4A2F15] space-y-2">
                <div className="text-xs font-bold text-[#FCFCFA]">
                  هل المنتج محتاج Feedback (ملاحظات شخصية منك)؟
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setAnswers({ ...answers, requiresPersonalFeedback: true })}
                    className={`py-2 px-3 rounded-lg border text-center transition-colors cursor-pointer ${
                      answers.requiresPersonalFeedback === true
                        ? 'border-[#F5BF1E] bg-[#23170D] text-[#FCFCFA] font-bold'
                        : 'border-[#4A2F15]/40 bg-[#040405] text-[#C8C5BA]'
                    }`}
                  >
                    نعم، يحتاج مراجعة
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnswers({ ...answers, requiresPersonalFeedback: false })}
                    className={`py-2 px-3 rounded-lg border text-center transition-colors cursor-pointer ${
                      answers.requiresPersonalFeedback === false
                        ? 'border-[#F5BF1E] bg-[#23170D] text-[#FCFCFA] font-bold'
                        : 'border-[#4A2F15]/40 bg-[#040405] text-[#C8C5BA]'
                    }`}
                  >
                    لا، تعلم ذاتي
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#040405] border border-[#4A2F15] space-y-2">
                <div className="text-xs font-bold text-[#FCFCFA]">
                  هل النتيجة تعتمد على متابعة فردية 1-on-1 مكثفة؟
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setAnswers({ ...answers, requiresOneOnOneAccountability: true })}
                    className={`py-2 px-3 rounded-lg border text-center transition-colors cursor-pointer ${
                      answers.requiresOneOnOneAccountability === true
                        ? 'border-[#F5BF1E] bg-[#23170D] text-[#FCFCFA] font-bold'
                        : 'border-[#4A2F15]/40 bg-[#040405] text-[#C8C5BA]'
                    }`}
                  >
                    نعم، تعتمد عليها
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnswers({ ...answers, requiresOneOnOneAccountability: false })}
                    className={`py-2 px-3 rounded-lg border text-center transition-colors cursor-pointer ${
                      answers.requiresOneOnOneAccountability === false
                        ? 'border-[#F5BF1E] bg-[#23170D] text-[#FCFCFA] font-bold'
                        : 'border-[#4A2F15]/40 bg-[#040405] text-[#C8C5BA]'
                    }`}
                  >
                    لا، يمكن استيعابها جماعيًا
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            SECTION 7: MONETIZATION CONTEXT
        ======================================================== */}
        {currentSection === 7 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs text-[#A7690C] font-semibold tracking-wider">
                المحور الثامن: سياق التسعير والدخل (Monetization Context)
              </span>
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#FCFCFA] mt-1 mb-2">
                إيه نطاق السعر المتوقع ودور المنتج في خطتك؟
              </h2>
              <p className="text-xs sm:text-sm text-[#C8C5BA] leading-relaxed">
                مش لازم تكون مستقر على السعر النهائي — اختر النطاق الأقرب لمنطق القيمة.
              </p>
            </div>

            {/* Price tiers (Unselected by default) */}
            <div>
              <label className="block text-xs font-semibold text-[#FCFCFA] mb-2">
                النطاق السعري التقريبي المستهدف:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                {[
                  { id: 'micro_under_50', label: 'أقل من $50', desc: 'دخول سريع' },
                  { id: 'low_50_150', label: '$50 إلى $150', desc: 'ورش وقوالب' },
                  { id: 'mid_150_500', label: '$150 إلى $500', desc: 'معسكرات مركزة' },
                  { id: 'premium_500_plus', label: '+500$', desc: 'برامج احترافية' },
                  { id: 'not_sure_yet', label: 'مش متأكد لسه', desc: 'بعد التحقق' },
                ].map((tier) => (
                  <button
                    type="button"
                    key={tier.id}
                    onClick={() => setAnswers({ ...answers, expectedPriceTier: tier.id as any })}
                    className={`p-3 rounded-xl border text-center transition-colors cursor-pointer ${
                      answers.expectedPriceTier === tier.id
                        ? 'border-[#F5BF1E] bg-[#23170D] text-[#FCFCFA]'
                        : 'border-[#4A2F15]/40 bg-[#040405] text-[#C8C5BA]'
                    }`}
                  >
                    <div className="font-bold text-xs">{tier.label}</div>
                    <div className="text-[10px] text-[#797979] mt-0.5">{tier.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Role in business */}
            <div>
              <label className="block text-xs font-semibold text-[#FCFCFA] mb-2">
                دور هذا المنتج في مسار عملك:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                {[
                  {
                    id: 'core_flagship',
                    title: 'المنتج الرئيسي المستقل (Flagship)',
                    desc: 'هو مصدر الدخل والتركيز الأساسي',
                  },
                  {
                    id: 'lead_tripwire',
                    title: 'منتج مدخل وبناء ثقة (Entry Offer)',
                    desc: 'لاكتساب مشترين وتحويلهم لخدماتك',
                  },
                  {
                    id: 'backend_service_feeder',
                    title: 'تأهيل وتغذية خدمة ذات سعر أعلى',
                    desc: 'يصفي العملاء الجادين للاستشارات والخدمات',
                  },
                ].map((role) => (
                  <button
                    type="button"
                    key={role.id}
                    onClick={() => setAnswers({ ...answers, productRoleInBusiness: role.id as any })}
                    className={`p-3.5 rounded-xl border text-right transition-colors cursor-pointer ${
                      answers.productRoleInBusiness === role.id
                        ? 'border-[#F5BF1E] bg-[#23170D] text-[#FCFCFA]'
                        : 'border-[#4A2F15]/40 bg-[#040405] text-[#C8C5BA]'
                    }`}
                  >
                    <div className="font-bold mb-1">{role.title}</div>
                    <div className="text-[11px] text-[#797979]">{role.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Existing clients toggle */}
            <div className="p-4 rounded-xl bg-[#040405] border border-[#4A2F15] space-y-2">
              <div className="text-xs font-bold text-[#FCFCFA]">
                هل لديك عملاء دفعوا لك بالفعل مقابل خدمات أو استشارات سابقة؟
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setAnswers({ ...answers, hasExistingPayingClients: true })}
                  className={`py-2 px-3 rounded-lg border text-center transition-colors cursor-pointer ${
                    answers.hasExistingPayingClients === true
                      ? 'border-[#F5BF1E] bg-[#23170D] text-[#FCFCFA] font-bold'
                      : 'border-[#4A2F15]/40 bg-[#040405] text-[#C8C5BA]'
                  }`}
                >
                  نعم، لدي عملاء سابقون
                </button>
                <button
                  type="button"
                  onClick={() => setAnswers({ ...answers, hasExistingPayingClients: false })}
                  className={`py-2 px-3 rounded-lg border text-center transition-colors cursor-pointer ${
                    answers.hasExistingPayingClients === false
                      ? 'border-[#F5BF1E] bg-[#23170D] text-[#FCFCFA] font-bold'
                      : 'border-[#4A2F15]/40 bg-[#040405] text-[#C8C5BA]'
                  }`}
                >
                  لا، أبدأ للمرة الأولى
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={handlePrev}
          className="px-4 py-2.5 rounded-xl text-xs sm:text-sm text-[#C8C5BA] hover:text-[#FCFCFA] hover:bg-[#23170D] flex items-center gap-2 transition-colors cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span>{currentSection === 0 ? 'رجوع لاختيار المسار' : 'القسم السابق'}</span>
        </button>

        <button
          type="button"
          disabled={!canProceedSection()}
          onClick={handleNext}
          className={`px-6 py-3 rounded-xl font-heading font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
            canProceedSection()
              ? 'bg-[#F5BF1E] text-[#040405] hover:brightness-105 shadow-md shadow-[#F5BF1E]/10'
              : 'bg-[#23170D] text-[#797979] border border-[#4A2F15]/40 opacity-60 cursor-not-allowed'
          }`}
        >
          <span>
            {currentSection === sectionsMeta.length - 1 ? 'بدء التحليل الاستراتيجي الفوري' : 'متابعة للقسم التالي'}
          </span>
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { IdeaDiscoveryAnswers, DiscoveredCandidate } from '../types';
import { generateCandidateOpportunities } from '../data/discoveryTemplates';
import { discoverCandidateIdeasAi } from '../services/aiService';
import { trackEvent } from '../services/analytics';
import { Sparkles, ArrowLeft, ArrowRight, RotateCcw, AlertCircle, Layers, CheckCircle2, Loader2 } from 'lucide-react';

interface IdeaDiscoveryWizardProps {
  onSelectCandidate: (candidate: DiscoveredCandidate, discoveryAnswers: IdeaDiscoveryAnswers) => void;
  onBack: () => void;
}

export const IdeaDiscoveryWizard: React.FC<IdeaDiscoveryWizardProps> = ({
  onSelectCandidate,
  onBack,
}) => {
  const [step, setStep] = useState<'input' | 'candidates'>('input');
  const [isLoading, setIsLoading] = useState(false);
  const [isAiGenerated, setIsAiGenerated] = useState(false);

  // Neutral initial state — zero biased defaults
  const [answers, setAnswers] = useState<IdeaDiscoveryAnswers>({
    expertiseArea: '',
    yearsOfExperience: '',
    coreSkills: '',
    repeatedQuestions: '',
    problemsFrequentlySolved: '',
    audiencesBestUnderstood: '',
    credibleResultsCreated: '',
    contentOrAudiencePresence: 'not_selected',
    preferredDeliveryStyle: 'not_selected',
    availableWeeklyHours: 'not_selected',
    scalabilityPreference: 'not_selected',
  });

  const [candidates, setCandidates] = useState<DiscoveredCandidate[]>([]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answers.expertiseArea.trim()) return;

    setIsLoading(true);
    trackEvent('tool_started', { mode: 'idea_discovery' });

    try {
      // 1. Try Structured Gemini AI Generator
      const aiCandidates = await discoverCandidateIdeasAi(answers);
      if (aiCandidates && aiCandidates.length > 0) {
        setCandidates(aiCandidates.map((c) => ({ ...c, source: 'ai_generated' })));
        setIsAiGenerated(true);
      } else {
        // 2. Fallback to deterministic rules
        const fallback = generateCandidateOpportunities(answers);
        setCandidates(fallback.map((c) => ({ ...c, source: 'rules_fallback' })));
        setIsAiGenerated(false);
      }
    } catch (err) {
      const fallback = generateCandidateOpportunities(answers);
      setCandidates(fallback.map((c) => ({ ...c, source: 'rules_fallback' })));
      setIsAiGenerated(false);
    } finally {
      setIsLoading(false);
      setStep('candidates');
      trackEvent('idea_discovery_completed');
    }
  };

  const handleResetSuggestions = () => {
    setStep('input');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {step === 'input' && (
        <form onSubmit={handleGenerate} className="space-y-6">
          <div className="text-center mb-8">
            <span className="text-xs text-[#F5BF1E] font-medium tracking-wide">
              استكشاف الأفكار الأولية (Idea Discovery)
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#FCFCFA] mt-1.5 mb-2">
              استخراج فرص المنتجات من خبرتك الحالية
            </h2>
            <p className="text-sm text-[#C8C5BA] max-w-lg mx-auto">
              مش محتاج فكرة جاهزة — جاوب على الأسئلة السريعة دي، وهنستخرج لك 3 نماذج منتجات حقيقية قابلة للاختبار.
            </p>
          </div>

          {/* Grid of Inputs */}
          <div className="space-y-5 bg-[#23170D]/40 border border-[#4A2F15]/50 rounded-2xl p-5 sm:p-6 text-right">
            {/* 1. Expertise Domain */}
            <div>
              <label className="block text-xs font-semibold text-[#FCFCFA] mb-1.5">
                إيه هو مجال تخصصك أو مهارتك الرئيسية؟ <span className="text-[#F5BF1E]">*</span>
              </label>
              <input
                type="text"
                required
                value={answers.expertiseArea}
                onChange={(e) => setAnswers({ ...answers, expertiseArea: e.target.value })}
                placeholder="مثال: هندسة مسارات البيع (Sales Funnels)، تدريب اللياقة البدنية، كتابة المحتوى التسويقي..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#040405] border border-[#4A2F15] focus:border-[#F5BF1E] text-sm text-[#FCFCFA] placeholder-[#797979] focus:outline-none transition-colors"
              />
            </div>

            {/* 2. Years + Target Audience */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#FCFCFA] mb-1.5">
                  سنوات الخبرة العملية
                </label>
                <select
                  value={answers.yearsOfExperience}
                  onChange={(e) => setAnswers({ ...answers, yearsOfExperience: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#040405] border border-[#4A2F15] focus:border-[#F5BF1E] text-sm text-[#FCFCFA] focus:outline-none"
                >
                  <option value="">اختر عدد السنوات...</option>
                  <option value="سنة إلى سنتين">سنة إلى سنتين</option>
                  <option value="3-5 سنوات">3 إلى 5 سنوات</option>
                  <option value="6-10 سنوات">6 إلى 10 سنوات</option>
                  <option value="أكثر من 10 سنوات">أكثر من 10 سنوات</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#FCFCFA] mb-1.5">
                  مين الفئة اللي بتفهم مشاكلها كويس؟
                </label>
                <input
                  type="text"
                  value={answers.audiencesBestUnderstood}
                  onChange={(e) => setAnswers({ ...answers, audiencesBestUnderstood: e.target.value })}
                  placeholder="مثال: المدربون أصحاب أول 10 عملاء، أصحاب المتاجر الإلكترونية الصغيرة..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#040405] border border-[#4A2F15] focus:border-[#F5BF1E] text-sm text-[#FCFCFA] placeholder-[#797979] focus:outline-none"
                />
              </div>
            </div>

            {/* 3. Repeated Questions & Problems */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#FCFCFA] mb-1.5">
                  إيه أكثر سؤال أو طلب متكرر الناس بتسألك عنه؟
                </label>
                <input
                  type="text"
                  value={answers.repeatedQuestions}
                  onChange={(e) => setAnswers({ ...answers, repeatedQuestions: e.target.value })}
                  placeholder="مثال: إزاي أكتب صفحة هبوط تبيع؟ إزاي أنظم وقت التمرين مع الشغل؟"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#040405] border border-[#4A2F15] focus:border-[#F5BF1E] text-sm text-[#FCFCFA] placeholder-[#797979] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#FCFCFA] mb-1.5">
                  أكبر مشكلة بتساعد الناس في حلها؟
                </label>
                <input
                  type="text"
                  value={answers.problemsFrequentlySolved}
                  onChange={(e) => setAnswers({ ...answers, problemsFrequentlySolved: e.target.value })}
                  placeholder="مثال: تشتت الرسالة التسويقية وضعف التحويل، ثبات الوزن بعد الحمية..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#040405] border border-[#4A2F15] focus:border-[#F5BF1E] text-sm text-[#FCFCFA] placeholder-[#797979] focus:outline-none"
                />
              </div>
            </div>

            {/* 4. Results created */}
            <div>
              <label className="block text-xs font-semibold text-[#FCFCFA] mb-1.5">
                إيه أفضل نتيجة واقعية قدرت تحققها لنفسك أو لعملاء سابقين؟
              </label>
              <input
                type="text"
                value={answers.credibleResultsCreated}
                onChange={(e) => setAnswers({ ...answers, credibleResultsCreated: e.target.value })}
                placeholder="مثال: زيادة معدل تحويل صفحة البيع بنسبة 30%، تنظيم نظام تمرين يوفر 5 ساعات أسبوعيًا..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#040405] border border-[#4A2F15] focus:border-[#F5BF1E] text-sm text-[#FCFCFA] placeholder-[#797979] focus:outline-none"
              />
            </div>

            {/* 5. Audience presence, Delivery style, Weekly hours & Scalability */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-[#FCFCFA] mb-1.5">
                  حجم جمهورك الحالي
                </label>
                <select
                  value={answers.contentOrAudiencePresence}
                  onChange={(e: any) => setAnswers({ ...answers, contentOrAudiencePresence: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#040405] border border-[#4A2F15] text-xs text-[#FCFCFA] focus:outline-none"
                >
                  <option value="not_selected">لسه مش محدد</option>
                  <option value="no_audience">صفر متابعين حالياً</option>
                  <option value="small_following">متابعون قليلون (أقل من 1,000)</option>
                  <option value="growing_audience">جمهور متوسط (1,000 - 5,000)</option>
                  <option value="strong_audience">جمهور متفاعل كبير (+5,000)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#FCFCFA] mb-1.5">
                  الوقت الأسبوعي المتاح
                </label>
                <select
                  value={answers.availableWeeklyHours}
                  onChange={(e: any) => setAnswers({ ...answers, availableWeeklyHours: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#040405] border border-[#4A2F15] text-xs text-[#FCFCFA] focus:outline-none"
                >
                  <option value="not_selected">لسه مش محدد</option>
                  <option value="under_5">أقل من 5 ساعات (مضغوط)</option>
                  <option value="5_to_10">5 إلى 10 ساعات أسبوعيًا</option>
                  <option value="10_to_20">10 إلى 20 ساعة</option>
                  <option value="full_time">متاح بشكل كامل تقريبًا</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#FCFCFA] mb-1.5">
                  أسلوب التسليم المفضل
                </label>
                <select
                  value={answers.preferredDeliveryStyle}
                  onChange={(e: any) => setAnswers({ ...answers, preferredDeliveryStyle: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#040405] border border-[#4A2F15] text-xs text-[#FCFCFA] focus:outline-none"
                >
                  <option value="not_selected">لسه مش محدد</option>
                  <option value="templates_tools">قوالب وأدوات تنفيذية (ذاتي)</option>
                  <option value="recorded_video">فيديوهات مسجلة وشروحات</option>
                  <option value="live_interactive">ورشة تفاعلية مباشرة مع أسئلة</option>
                  <option value="cohort_community">معسكر تطبيقي مع مراجعات</option>
                  <option value="hybrid">مزيج مرن (مسجل + دعم دوري)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#FCFCFA] mb-1.5">
                  تفضيل قابلية التوسع
                </label>
                <select
                  value={answers.scalabilityPreference}
                  onChange={(e: any) => setAnswers({ ...answers, scalabilityPreference: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#040405] border border-[#4A2F15] text-xs text-[#FCFCFA] focus:outline-none"
                >
                  <option value="not_selected">لسه مش محدد</option>
                  <option value="maximum_scalable">أقصى قابلية للتوسع (قوالب وأدوات)</option>
                  <option value="balanced">متوازن (ورشة تفاعلية أو دورة مدعومة)</option>
                  <option value="high_touch_premium">منتج عالي التدخل وتذكرة سعر أعلى</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2.5 rounded-xl text-xs text-[#C8C5BA] hover:text-[#FCFCFA] hover:bg-[#23170D] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
              <span>رجوع للمسارات</span>
            </button>

            <button
              type="submit"
              disabled={isLoading || !answers.expertiseArea.trim()}
              className="px-6 py-3 rounded-xl font-heading font-bold text-xs sm:text-sm bg-[#F5BF1E] text-[#040405] hover:brightness-105 transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-[#F5BF1E]/10 disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري تحليل واستخراج الفرص...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>استخراج 3 فرص منتجات مرشحة</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {step === 'candidates' && (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full border border-[#4A2F15] bg-[#23170D] mb-2">
              {isAiGenerated ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-[#F5BF1E]" />
                  <span className="text-[#F5BF1E]">اقتراحات مولدة عبر الذكاء الاصطناعي الاستراتيجي</span>
                </>
              ) : (
                <>
                  <Layers className="w-3.5 h-3.5 text-[#A7690C]" />
                  <span className="text-[#C8C5BA]">اقتراحات أولية مبنية على قواعد الأداة</span>
                </>
              )}
            </div>
            <h2 className="font-heading text-2xl font-bold text-[#FCFCFA] mt-1 mb-2">
              اختر فرصة واحدة لاختبارها استراتيجيًا
            </h2>
            <p className="text-xs sm:text-sm text-[#C8C5BA] max-w-lg mx-auto">
              هذه فرص أولية؛ التشخيص القادم سيفكك الفكرة المختارة ويكشف مدى جاهزية السوق لدفع المال مقابلها.
            </p>
          </div>

          {/* Candidate Cards */}
          <div className="space-y-4 text-right">
            {candidates.map((cand, idx) => (
              <div
                key={cand.id || idx}
                className="p-5 rounded-2xl border border-[#4A2F15]/70 bg-[#23170D]/40 hover:border-[#F5BF1E]/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#23170D] border border-[#F5BF1E]/40 text-[#F5BF1E] text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h3 className="font-heading font-bold text-base text-[#FCFCFA]">
                      {cand.title}
                    </h3>
                  </div>
                  <span className="text-xs text-[#A7690C] font-medium hidden sm:inline">
                    {cand.possibleFormat}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mb-4">
                  <div className="p-3 rounded-xl bg-[#040405]/60 border border-[#4A2F15]/30">
                    <span className="text-[#F5BF1E] font-medium block mb-0.5">الجمهور المستهدف:</span>
                    <span className="text-[#C8C5BA]">{cand.targetAudience}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#040405]/60 border border-[#4A2F15]/30">
                    <span className="text-[#F5BF1E] font-medium block mb-0.5">المشكلة والتحول:</span>
                    <span className="text-[#C8C5BA]">{cand.desiredTransformation}</span>
                  </div>
                </div>

                {/* Evidence, Risk & Test */}
                <div className="space-y-2 text-xs mb-4">
                  <div className="text-[#C8C5BA]">
                    <span className="text-[#FCFCFA] font-semibold">ليه مناسبة ليك: </span>
                    {cand.fitRationale}
                  </div>
                  {cand.strongestEvidence && (
                    <div className="text-[#C8C5BA] text-[11px]">
                      <span className="text-[#FBD052] font-semibold">أقوى مؤشر متوفر: </span>
                      {cand.strongestEvidence}
                    </div>
                  )}
                  {cand.missingEvidence && (
                    <div className="text-[#C8C5BA] text-[11px]">
                      <span className="text-[#A7690C] font-semibold">الدليل الناقص: </span>
                      {cand.missingEvidence}
                    </div>
                  )}
                  <div className="text-[#C8C5BA] flex items-start gap-1.5 text-[11px] text-[#A7690C]">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span><strong>الافتراض الأكبر:</strong> {cand.biggestRisk}</span>
                  </div>
                  {cand.easiestValidationTest && (
                    <div className="text-[11px] text-[#F5BF1E] bg-[#23170D] p-2 rounded-lg border border-[#4A2F15]">
                      <strong>أسهل اختبار تحقق (48 ساعة): </strong> {cand.easiestValidationTest}
                    </div>
                  )}
                </div>

                {/* Choose button */}
                <div className="flex justify-end pt-2 border-t border-[#4A2F15]/30">
                  <button
                    onClick={() => onSelectCandidate(cand, answers)}
                    className="px-5 py-2 rounded-xl text-xs font-heading font-bold bg-[#F5BF1E] text-[#040405] hover:brightness-105 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-[#F5BF1E]/10"
                  >
                    <span>اختر هذه الفرصة للتشخيص الكامل</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Reset / Modify suggestions */}
          <div className="pt-4 flex items-center justify-between border-t border-[#4A2F15]/40">
            <button
              onClick={handleResetSuggestions}
              className="text-xs text-[#C8C5BA] hover:text-[#F5BF1E] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>ولا فكرة مناسبة — عدّل الاقتراحات</span>
            </button>

            <button
              onClick={onBack}
              className="text-xs text-[#797979] hover:text-[#C8C5BA]"
            >
              الرجوع لاختيار المسار
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

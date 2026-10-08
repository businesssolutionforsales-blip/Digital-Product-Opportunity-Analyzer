import React from 'react';
import { Target, ShieldAlert, CalendarClock, ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';

interface HeroSectionProps {
  onStart: () => void;
  onExplorePaths?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onStart }) => {
  return (
    <div className="relative overflow-hidden py-10 sm:py-16 md:py-20 px-4 sm:px-6">
      {/* Subtle radial ambient background */}
      <div className="absolute top-0 right-1/2 translate-x-1/2 w-96 h-96 bg-[#A7690C]/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto text-center">
        {/* Creator Brand Kicker */}
        <div className="inline-flex items-center gap-2 mb-6 px-3.5 py-1.5 rounded-full border border-[#4A2F15] bg-[#23170D]/70 text-xs text-[#C8C5BA]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F5BF1E] animate-pulse" />
          <span className="text-[#FCFCFA] font-medium">Mohamed Adel</span>
          <span className="text-[#797979]">·</span>
          <span>Sales Funnel Architect</span>
        </div>

        {/* Hero Headline */}
        <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#FCFCFA] leading-[1.3] tracking-tight mb-6">
          اختبر فرصة منتجك الرقمي <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FBD052] via-[#F5BF1E] to-[#A7690C]">
            قبل ما تقضي أسابيع في بنائه
          </span>
        </h1>

        {/* Supporting Copy */}
        <p className="text-base sm:text-lg md:text-xl text-[#C8C5BA] leading-relaxed max-w-2xl mx-auto mb-10">
          جاوب على مجموعة أسئلة استراتيجية، وخلال دقائق هتحصل على تحليل مخصص لفكرتك،
          درجة قوة الفرصة، أكبر المخاطر، أفضل شكل للمنتج، وخطة تحقق عملية قبل التنفيذ.
        </p>

        {/* Primary CTA Block */}
        <div className="flex flex-col items-center justify-center gap-4 mb-8">
          <button
            onClick={onStart}
            className="w-full sm:w-auto min-w-[280px] px-8 py-4 rounded-xl font-heading font-bold text-base text-[#040405] bg-gradient-to-r from-[#F5BF1E] to-[#FBD052] hover:brightness-105 shadow-lg shadow-[#F5BF1E]/10 active:scale-[0.99] transition-all flex items-center justify-center gap-3 group cursor-pointer"
          >
            <span>ابدأ تحليل فرصتك</span>
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </button>

          {/* Secondary Microcopy */}
          <div className="text-xs text-[#797979] text-center leading-relaxed">
            مش اختبار ترفيهي · ومش وعد بمبيعات <br />
            الهدف إنك تعرف إيه اللي يستحق الاختبار قبل ما تبدأ البناء
          </div>
        </div>

        {/* Ecosystem Stage & Free by Mohamed Adel notice */}
        <div className="flex items-center justify-center gap-2 text-xs text-[#C8C5BA]/70 mb-14">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#F5BF1E]" />
          <span>متاح مجانًا ضمن منظومة Growth OS من Mohamed Adel للمدربين والخبراء وصناع المحتوى</span>
        </div>

        {/* 3 Compact Value Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-right">
          {/* Card 1 */}
          <div className="p-5 rounded-2xl border border-[#4A2F15]/60 bg-[#23170D]/40 backdrop-blur-sm hover:border-[#F5BF1E]/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#23170D] border border-[#4A2F15] flex items-center justify-center text-[#F5BF1E] mb-3.5">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-[#FCFCFA] text-base mb-1">
              Opportunity Score
            </h3>
            <div className="text-xs text-[#F5BF1E] font-medium mb-2">درجة فرصة المنتج (0-100)</div>
            <p className="text-xs text-[#C8C5BA] leading-relaxed">
              تقييم استراتيجي مركب يحلل قوة المشكلة، وضوح المشتري، وقابلية التسليم والربحية بدون انحياز أو تفاؤل زائف.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-5 rounded-2xl border border-[#4A2F15]/60 bg-[#23170D]/40 backdrop-blur-sm hover:border-[#F5BF1E]/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#23170D] border border-[#4A2F15] flex items-center justify-center text-[#F5BF1E] mb-3.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-[#FCFCFA] text-base mb-1">
              Risk Diagnosis
            </h3>
            <div className="text-xs text-[#F5BF1E] font-medium mb-2">تشخيص المخاطر والافتراضات</div>
            <p className="text-xs text-[#C8C5BA] leading-relaxed">
              كشف الافتراض الأكبر اللي لو سقط تسقط معاه جدوى المنتج، وما يجب تجنب بنائه فورًا لتفادي إهدار الوقت.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-5 rounded-2xl border border-[#4A2F15]/60 bg-[#23170D]/40 backdrop-blur-sm hover:border-[#F5BF1E]/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#23170D] border border-[#4A2F15] flex items-center justify-center text-[#F5BF1E] mb-3.5">
              <CalendarClock className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-[#FCFCFA] text-base mb-1">
              7-Day Validation Plan
            </h3>
            <div className="text-xs text-[#F5BF1E] font-medium mb-2">خطة تحقق مخصصة للأسبوع القادم</div>
            <p className="text-xs text-[#C8C5BA] leading-relaxed">
              خارطة طريق تنفيذية من 7 أيام وأسئلة اكتشاف سلوكية لاختبار استعداد السوق للشراء قبل كتابة كلمة واحدة.
            </p>
          </div>
        </div>

        {/* Strategic Quote */}
        <div className="mt-14 pt-8 border-t border-[#4A2F15]/40 text-center">
          <blockquote className="text-xs sm:text-sm text-[#C8C5BA] italic max-w-xl mx-auto">
            &ldquo;أنا مش بصمم صفحة وخلاص، أنا بهندس رحلة بيع كاملة.&rdquo;
            <span className="block mt-1 font-medium text-[#F5BF1E] not-italic text-xs">
              — Mohamed Adel
            </span>
          </blockquote>
        </div>
      </div>
    </div>
  );
};

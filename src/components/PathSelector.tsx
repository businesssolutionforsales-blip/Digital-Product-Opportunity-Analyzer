import React from 'react';
import { UserPath } from '../types';
import { Compass, Lightbulb, CheckSquare, Briefcase, Users, ArrowLeft } from 'lucide-react';

interface PathSelectorProps {
  selectedPath: UserPath | null;
  onSelectPath: (path: UserPath) => void;
  onProceed: () => void;
}

interface PathOption {
  id: UserPath;
  letter: string;
  titleAr: string;
  subtitleAr: string;
  icon: React.ReactNode;
  hintAr: string;
}

export const PathSelector: React.FC<PathSelectorProps> = ({
  selectedPath,
  onSelectPath,
  onProceed,
}) => {
  const options: PathOption[] = [
    {
      id: 'expert_no_idea',
      letter: 'A',
      titleAr: 'عندي خبرة أو مهارة لكن لسه مش محدد المنتج',
      subtitleAr: 'أنت خبير، مستشار، أو متخصص وعندك نتائج عملية لكن محتار إزاي تعبئها في منتج رقمي.',
      icon: <Compass className="w-5 h-5 text-[#F5BF1E]" />,
      hintAr: 'سنبدأ بجلسة استكشاف سريعة لاقتراح 3 فرص منتجات تناسب خبرتك.',
    },
    {
      id: 'multiple_ideas',
      letter: 'B',
      titleAr: 'عندي كذا فكرة ومش عارف أختار',
      subtitleAr: 'أفكار كتير في بالك ومش متأكد مين فيهم الأقوى طلبًا والأسرع في التحقق.',
      icon: <Lightbulb className="w-5 h-5 text-[#F5BF1E]" />,
      hintAr: 'سنساعدك في تصفية الأفكار والتركيز على الفرصة الأكثر قابلية للاختبار.',
    },
    {
      id: 'specific_idea',
      letter: 'C',
      titleAr: 'عندي فكرة منتج محددة وعايز أختبرها',
      subtitleAr: 'في بالك فكرة دورة تدريبية، ورشة، قالب، أو دليل، وعايز تقيم جدواها قبل البناء.',
      icon: <CheckSquare className="w-5 h-5 text-[#F5BF1E]" />,
      hintAr: 'سندخل مباشرة في التشخيص الاستراتيجي العميق لفكرتك.',
    },
    {
      id: 'service_to_product',
      letter: 'D',
      titleAr: 'عندي خدمة وعايز أحول جزء منها لمنتج رقمي',
      subtitleAr: 'تقدم خدمات أو استشارات فردية وتريد منتجًا رقميًا يقلل اعتماد دخلك على ساعاتك.',
      icon: <Briefcase className="w-5 h-5 text-[#F5BF1E]" />,
      hintAr: 'سنركز على تحويل خطوات خدمتك إلى نظام قابل للتكرار والقياس.',
    },
    {
      id: 'audience_no_product',
      letter: 'E',
      titleAr: 'عندي جمهور وعايز أعرف أنسب منتج أقدمه له',
      subtitleAr: 'لديك متابعون أو مجتمع ولكنك لم تقدم لهم بعد عرضًا رقميًا مدفوعًا ومجربًا.',
      icon: <Users className="w-5 h-5 text-[#F5BF1E]" />,
      hintAr: 'سنركز على مطابقة المشكلة الأكثر إلحاحًا لدى جمهورك مع المنتج الأنسب.',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <span className="text-xs text-[#F5BF1E] font-medium tracking-wide">
          الخطوة 1 من التحليل الاستراتيجي
        </span>
        <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#FCFCFA] mt-2 mb-3">
          أنت واقف فين دلوقتي؟
        </h2>
        <p className="text-sm text-[#C8C5BA] max-w-lg mx-auto">
          اختر المسار الأقرب لوضعك الحالي حتى نكيف صياغة الأسئلة وتركيز التحليل بما يخدم احتياجك الفعلي.
        </p>
      </div>

      {/* Options List */}
      <div className="space-y-3.5 mb-8">
        {options.map((option) => {
          const isSelected = selectedPath === option.id;
          return (
            <div
              key={option.id}
              onClick={() => onSelectPath(option.id)}
              className={`p-4 sm:p-5 rounded-xl border text-right transition-all cursor-pointer relative ${
                isSelected
                  ? 'border-[#F5BF1E] bg-[#23170D] shadow-md shadow-[#F5BF1E]/5'
                  : 'border-[#4A2F15]/60 bg-[#040405] hover:border-[#4A2F15] hover:bg-[#23170D]/40'
              }`}
            >
              <div className="flex items-start gap-3.5">
                {/* Radio / Letter Indicator */}
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-heading font-bold text-xs transition-colors ${
                    isSelected
                      ? 'bg-[#F5BF1E] text-[#040405]'
                      : 'bg-[#23170D] border border-[#4A2F15] text-[#C8C5BA]'
                  }`}
                >
                  {option.letter}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3
                      className={`font-heading text-sm sm:text-base font-bold ${
                        isSelected ? 'text-[#FCFCFA]' : 'text-[#FCFCFA]'
                      }`}
                    >
                      {option.titleAr}
                    </h3>
                  </div>

                  <p className="text-xs text-[#C8C5BA] leading-relaxed mb-2">
                    {option.subtitleAr}
                  </p>

                  <div className="text-[11px] text-[#A7690C] flex items-center gap-1.5 font-medium">
                    <span>←</span>
                    <span>{option.hintAr}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Continue CTA */}
      <div className="flex items-center justify-between pt-4 border-t border-[#4A2F15]/40">
        <span className="text-xs text-[#797979]">
          {selectedPath ? 'تم اختيار المسار' : 'يرجى اختيار أحد الخيارات للمتابعة'}
        </span>
        <button
          disabled={!selectedPath}
          onClick={onProceed}
          className={`px-7 py-3 rounded-xl font-heading font-bold text-sm flex items-center gap-2 transition-all cursor-pointer ${
            selectedPath
              ? 'bg-[#F5BF1E] text-[#040405] hover:brightness-105 shadow-md shadow-[#F5BF1E]/10'
              : 'bg-[#23170D] text-[#797979] border border-[#4A2F15]/40 cursor-not-allowed opacity-60'
          }`}
        >
          <span>المتابعة للأسئلة</span>
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

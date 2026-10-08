import React from 'react';
import { X, ShieldCheck } from 'lucide-react';

interface LegalModalProps {
  type: 'privacy' | 'terms' | null;
  onClose: () => void;
}

export const LegalModals: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#040405]/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#23170D] border border-[#4A2F15] rounded-3xl max-w-lg w-full p-6 text-right shadow-2xl relative space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 rounded-full bg-[#040405] text-[#C8C5BA] hover:text-[#FCFCFA] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 text-xs font-bold text-[#F5BF1E]">
          <ShieldCheck className="w-4 h-4" />
          <span>{type === 'privacy' ? 'سياسة الخصوصية وأمان البيانات' : 'شروط الاستخدام'}</span>
        </div>

        <h3 className="font-heading font-bold text-lg text-[#FCFCFA]">
          {type === 'privacy' ? 'حماية بياناتك الاستراتيجية' : 'إخلاء المسؤولية وشروط الاستخدام'}
        </h3>

        <div className="text-xs text-[#C8C5BA] space-y-3 leading-relaxed max-h-80 overflow-y-auto pr-1">
          {type === 'privacy' ? (
            <>
              <p>
                نحن في مؤسسة <strong>Mohamed Adel</strong> نحترم سرية أفكارك وبياناتك المهنية. كافة المدخلات
                التي تقدمها خلال تشخيص فرصة المنتج تُعامل بسرية تامة.
              </p>
              <p>
                لا يتم بيع أو تأجير أو مشاركة بريدك الإلكتروني مع أي طرف خارجي. نستخدم بياناتك فقط لإرسال التقرير
                ورسائل تعليمية استراتيجية متخصصة في هندسة مسارات البيع والمنتجات الرقمية، ويمكنك إلغاء الاشتراك
                بنقرة واحدة في أي وقت.
              </p>
            </>
          ) : (
            <>
              <p>
                أداة <strong>&ldquo;محلل فرصة المنتج الرقمي&rdquo;</strong> هي أداة استشارية وتشخيصية مصممة
                لمساعدتك على اتخاذ قرارات مبنية على الأدلة والتحقق السريع.
              </p>
              <p>
                هذا التقييم لا يشكل ضمانًا قانونيًا أو ماليًا لتحقيق أرباح أو مبيعات، فالنتائج الميدانية تعتمد
                على دقة التنفيذ واستجابة السوق الفعلية. استخدامك للأداة يعني فهمك لطبيعة العملية الاستشارية
                والتزامك بإجراء خطوات التحقق الواقعية.
              </p>
            </>
          )}
        </div>

        <div className="pt-2 text-left">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#040405] border border-[#4A2F15] text-[#FCFCFA] hover:border-[#F5BF1E] transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

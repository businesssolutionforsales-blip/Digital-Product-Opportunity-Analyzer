import React, { useState } from 'react';
import { StrategicReport } from '../types';
import { submitLeadReport } from '../services/leadService';
import { Mail, Check, ArrowLeft, ShieldCheck, Download, Send } from 'lucide-react';

interface LeadCaptureCardProps {
  report: StrategicReport;
  onUnlocked: () => void;
  isUnlocked: boolean;
  onPrint: () => void;
}

export const LeadCaptureCard: React.FC<LeadCaptureCardProps> = ({
  report,
  onUnlocked,
  isUnlocked,
  onPrint,
}) => {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !email.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await submitLeadReport(firstName, email, businessType, marketingConsent, report);
      setSubmittedMessage(res.message);
      onUnlocked();
    } catch (err) {
      onUnlocked();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isUnlocked) {
    return (
      <div className="p-5 rounded-2xl bg-[#23170D]/40 border border-[#4A2F15]/60 text-right flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#F5BF1E] mb-1">
            <Check className="w-4 h-4" />
            <span>تم فتح وحفظ التقرير الاستراتيجي وخطة الـ 7 أيام</span>
          </div>
          <p className="text-xs text-[#C8C5BA]">
            يمكنك الآن تصفح كافة المحاور أدناه، أو طباعة التقرير كوثيقة استراتيجية بصيغة PDF.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onPrint}
            className="px-5 py-2.5 rounded-xl font-heading font-bold text-xs bg-[#F5BF1E] text-[#040405] hover:brightness-105 transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-[#F5BF1E]/10"
          >
            <Download className="w-4 h-4" />
            <span>تحميل التقرير الكامل / PDF</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#23170D] to-[#040405] border border-[#F5BF1E]/50 text-right shadow-2xl relative overflow-hidden">
      <div className="max-w-xl mx-auto space-y-5">
        <div className="text-center sm:text-right">
          <span className="text-xs text-[#F5BF1E] font-medium tracking-wide">
            احتفظ بتحليلك وخطة العمل
          </span>
          <h3 className="font-heading font-bold text-xl sm:text-2xl text-[#FCFCFA] mt-1 mb-2">
            احفظ تحليلك وخد التقرير الكامل وخطة الـ 7 أيام
          </h3>
          <p className="text-xs sm:text-sm text-[#C8C5BA] leading-relaxed">
            احصل على النسخة الشاملة التي تتضمن: تفكيك الافتراضات، أسئلة الاكتشاف الـ 7 للمقابلات،
            توصيات الـ MVP، وما يجب تجنب بنائه الآن.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#FCFCFA] mb-1">
                الاسم الأول <span className="text-[#F5BF1E]">*</span>
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="مثال: أحمد"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#040405] border border-[#4A2F15] focus:border-[#F5BF1E] text-xs sm:text-sm text-[#FCFCFA] placeholder-[#797979] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#FCFCFA] mb-1">
                البريد الإلكتروني <span className="text-[#F5BF1E]">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#040405] border border-[#4A2F15] focus:border-[#F5BF1E] text-xs sm:text-sm text-[#FCFCFA] placeholder-[#797979] focus:outline-none text-left"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#FCFCFA] mb-1">
              طبيعة شغلك الحالي (اختياري)
            </label>
            <select
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#040405] border border-[#4A2F15] focus:border-[#F5BF1E] text-xs sm:text-sm text-[#FCFCFA] focus:outline-none"
            >
              <option value="">اختر طبيعة شغلك...</option>
              <option value="كورس / تدريب أونلاين">كورس / تدريب أونلاين (Course Creator)</option>
              <option value="كوتشينج أو استشارات">كوتشينج أو استشارات (Coach / Consultant)</option>
              <option value="مقدم خدمات / فريلانسر">مقدم خدمات / فريلانسر يريد الانتقال لمنتج</option>
              <option value="صانع محتوى لديه متابعين">صانع محتوى لديه متابعين</option>
              <option value="خبير أو متخصص يبدأ لأول مرة">خبير أو متخصص يبدأ لأول مرة</option>
            </select>
          </div>

          {/* Separate Marketing Consent Checkbox (Optional, not pre-checked) */}
          <div className="pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer text-right">
              <input
                type="checkbox"
                checked={marketingConsent}
                onChange={(e) => setMarketingConsent(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-[#4A2F15] bg-[#040405] text-[#F5BF1E] accent-[#F5BF1E] focus:ring-0"
              />
              <span className="text-xs text-[#C8C5BA] leading-relaxed">
                موافق على استقبال رسائل تعليمية واستراتيجية إضافية عبر البريد الإلكتروني (يمكن إلغاء الاشتراك في أي وقت).
              </span>
            </label>
          </div>

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !firstName.trim() || !email.trim()}
              className="w-full py-3.5 rounded-xl font-heading font-bold text-sm bg-gradient-to-r from-[#F5BF1E] to-[#FBD052] text-[#040405] hover:brightness-105 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#F5BF1E]/10 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span>{isSubmitting ? 'جاري فتح التقرير...' : 'عرض التقرير الكامل وخطة الـ 7 أيام'}</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="text-[11px] text-[#797979] text-center flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#F5BF1E]" />
            <span>بنستخدم بياناتك لحفظ وإرسال التقرير والتواصل معاك حسب موافقتك، وفق سياسة الخصوصية.</span>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { StrategicReport } from '../types';
import { X, Copy, Check, Share2 } from 'lucide-react';

interface ShareCardModalProps {
  report: StrategicReport;
  onClose: () => void;
}

export const ShareCardModal: React.FC<ShareCardModalProps> = ({ report, onClose }) => {
  const [copied, setCopied] = useState(false);

  const shareText = `حللت فكرة منتجي الرقمي بواسطة "محلل فرصة المنتج الرقمي" من Mohamed Adel!
النتيجة: ${report.opportunityScore}/100 (${report.opportunityBand.labelAr})
درجة الثقة: ${report.confidenceScore}/100
الشكل المقترح: ${report.formatRecommendation.primary.titleAr}
اختبر فكرتك مجانًا: ${window.location.origin}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#040405]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#23170D] border border-[#F5BF1E]/40 rounded-3xl max-w-md w-full p-6 text-right shadow-2xl relative space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 rounded-full bg-[#040405] text-[#C8C5BA] hover:text-[#FCFCFA] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center pt-2">
          <span className="text-xs text-[#F5BF1E] font-medium tracking-wide">
            بطاقة مشاركة النتيجة (Share Card)
          </span>
          <h3 className="font-heading font-bold text-lg text-[#FCFCFA] mt-0.5">
            شارك نتيجتك مع شبكتك
          </h3>
        </div>

        {/* The Visual Share Card */}
        <div className="p-6 rounded-2xl bg-[#040405] border border-[#4A2F15] text-center space-y-4 shadow-inner">
          <div className="inline-flex items-center gap-2 text-[11px] text-[#C8C5BA] font-medium border border-[#4A2F15] px-3 py-1 rounded-full bg-[#23170D]">
            <span>Mohamed Adel</span>
            <span className="text-[#F5BF1E]">·</span>
            <span>Sales Funnel Architect</span>
          </div>

          <div>
            <div className="text-xs text-[#797979] mb-1 font-medium">Digital Product Opportunity Score</div>
            <div className="flex items-baseline justify-center gap-1">
              <span className="font-heading font-extrabold text-5xl text-[#FCFCFA]">
                {report.opportunityScore}
              </span>
              <span className="text-lg text-[#797979]">/ 100</span>
            </div>
            <div className="text-xs font-bold text-[#FBD052] mt-2 font-heading">
              {report.opportunityBand.labelAr}
            </div>
          </div>

          <div className="border-t border-[#4A2F15]/50 pt-3 text-xs text-[#C8C5BA] space-y-1">
            <div>
              <span className="text-[#797979]">الشكل الموصى به: </span>
              <span className="text-[#FCFCFA] font-medium">{report.formatRecommendation.primary.titleAr}</span>
            </div>
            <div>
              <span className="text-[#797979]">درجة الثقة في الأدلة: </span>
              <span className="text-[#FCFCFA] font-mono">{report.confidenceScore}/100</span>
            </div>
          </div>

          <div className="text-[10px] text-[#A7690C] pt-1">
            محلل فرصة المنتج الرقمي — Growth OS
          </div>
        </div>

        {/* Copy Share Text Button */}
        <div className="space-y-2">
          <button
            onClick={handleCopy}
            className="w-full py-3 rounded-xl font-heading font-bold text-xs bg-[#F5BF1E] text-[#040405] hover:brightness-105 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-[#F5BF1E]/10"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'تم نسخ نص المشاركة بنجاح' : 'نسخ ملخص النتيجة للمشاركة'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

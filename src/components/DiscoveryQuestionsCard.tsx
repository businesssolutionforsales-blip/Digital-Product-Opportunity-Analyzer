import React, { useState } from 'react';
import { DiscoveryQuestion } from '../types';
import { MessageSquare, Copy, Check, HelpCircle } from 'lucide-react';

interface DiscoveryQuestionsCardProps {
  questions: DiscoveryQuestion[];
}

export const DiscoveryQuestionsCard: React.FC<DiscoveryQuestionsCardProps> = ({ questions }) => {
  const [copiedAll, setCopiedAll] = useState(false);

  const handleCopyAll = () => {
    const text = questions
      .map(
        (q) =>
          `السؤال ${q.id}: ${q.questionAr}\nالهدف: ${q.objectiveAr}\nانتبه لـ: ${q.whatToListenForAr}\n`
      )
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="p-6 rounded-2xl bg-[#23170D]/40 border border-[#4A2F15]/70 text-right space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#4A2F15]/40 pb-3">
        <div>
          <span className="text-xs text-[#F5BF1E] font-medium tracking-wide">
            دليل المقابلات السلوكية (Discovery Script)
          </span>
          <h3 className="font-heading font-bold text-lg text-[#FCFCFA] mt-0.5">
            7 أسئلة لاستكشاف العميل بدون مجاملات
          </h3>
        </div>
        <button
          onClick={handleCopyAll}
          className="text-xs text-[#FCFCFA] bg-[#040405] hover:text-[#F5BF1E] border border-[#4A2F15] px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
        >
          {copiedAll ? <Check className="w-3.5 h-3.5 text-[#F5BF1E]" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedAll ? 'تم نسخ كل الأسئلة' : 'نسخ الأسئلة الـ 7'}</span>
        </button>
      </div>

      <div className="space-y-3">
        {questions.map((q) => (
          <div
            key={q.id}
            className="p-4 rounded-xl bg-[#040405] border border-[#4A2F15]/50 space-y-2 text-xs"
          >
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#23170D] border border-[#F5BF1E]/40 text-[#F5BF1E] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                {q.id}
              </span>
              <div className="flex-1">
                <div className="font-semibold text-[#FCFCFA] text-xs sm:text-sm leading-relaxed mb-1">
                  &ldquo;{q.questionAr}&rdquo;
                </div>
                <div className="text-[11px] text-[#A7690C] mb-1">
                  <strong>الهدف من السؤال: </strong>
                  {q.objectiveAr}
                </div>
                <div className="text-[11px] text-[#C8C5BA] bg-[#23170D]/40 p-2 rounded-lg border border-[#4A2F15]/30">
                  <strong>إيه اللي تركز عليه في إجابته: </strong>
                  {q.whatToListenForAr}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

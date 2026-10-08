import React, { useState } from 'react';
import { ValidationDay } from '../types';
import { Calendar, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

interface ValidationSprintViewProps {
  sprint: ValidationDay[];
}

export const ValidationSprintView: React.FC<ValidationSprintViewProps> = ({ sprint }) => {
  const [activeDay, setActiveDay] = useState<number>(1);

  return (
    <div className="p-6 rounded-2xl bg-[#23170D]/40 border border-[#4A2F15]/70 text-right space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#4A2F15]/40 pb-3">
        <div>
          <span className="text-xs text-[#F5BF1E] font-medium tracking-wide">
            خطة التحقق الميدانية (Action Plan)
          </span>
          <h3 className="font-heading font-bold text-lg text-[#FCFCFA] mt-0.5">
            خطة تحقق مكثفة خلال 7 أيام
          </h3>
        </div>
        <div className="text-xs text-[#C8C5BA] flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-[#F5BF1E]" />
          <span>مخصصة لظروف وصولك للجمهور</span>
        </div>
      </div>

      {/* Days Tabs / Accordion */}
      <div className="space-y-3">
        {sprint.map((day) => {
          const isOpen = activeDay === day.dayNumber;

          return (
            <div
              key={day.dayNumber}
              className={`rounded-xl border transition-all ${
                isOpen
                  ? 'border-[#F5BF1E]/50 bg-[#040405] shadow-sm'
                  : 'border-[#4A2F15]/50 bg-[#040405]/50 hover:border-[#4A2F15]'
              }`}
            >
              <button
                type="button"
                onClick={() => setActiveDay(isOpen ? 0 : day.dayNumber)}
                className="w-full p-4 flex items-center justify-between text-right cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-heading font-bold text-xs ${
                      isOpen
                        ? 'bg-[#F5BF1E] text-[#040405]'
                        : 'bg-[#23170D] border border-[#4A2F15] text-[#C8C5BA]'
                    }`}
                  >
                    {day.dayNumber}
                  </span>
                  <div>
                    <h4 className="font-heading font-bold text-xs sm:text-sm text-[#FCFCFA]">
                      {day.dayTitleAr}
                    </h4>
                    <p className="text-[11px] text-[#A7690C] mt-0.5">{day.focusAr}</p>
                  </div>
                </div>

                <div className="text-[#C8C5BA]">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-1 border-t border-[#4A2F15]/30 space-y-3">
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-[#FBD052] block">
                      المهام والخطوات التنفيذية:
                    </span>
                    <ul className="space-y-1.5 text-xs text-[#C8C5BA]">
                      {day.actionItems.map((task, tidx) => (
                        <li key={tidx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#F5BF1E] shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 rounded-lg bg-[#23170D]/60 border border-[#4A2F15]/40 text-xs">
                    <span className="text-[#F5BF1E] font-semibold block mb-0.5">المخرج النهائي المطلوب لهذا اليوم:</span>
                    <span className="text-[#FCFCFA]">{day.expectedOutputAr}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

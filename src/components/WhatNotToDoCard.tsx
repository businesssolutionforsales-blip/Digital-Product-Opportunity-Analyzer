import React from 'react';
import { WhatNotToDoItem } from '../types';
import { AlertOctagon } from 'lucide-react';

interface WhatNotToDoCardProps {
  items: WhatNotToDoItem[];
}

export const WhatNotToDoCard: React.FC<WhatNotToDoCardProps> = ({ items }) => {
  return (
    <div className="p-6 rounded-2xl bg-[#040405] border border-[#4A2F15]/70 text-right space-y-5">
      <div className="border-b border-[#4A2F15]/40 pb-3">
        <span className="text-xs text-[#A7690C] font-semibold tracking-wide">
          تنبيهات استشارية حاسمة
        </span>
        <h3 className="font-heading font-bold text-lg text-[#FCFCFA] mt-0.5">
          متعملش إيه دلوقتي؟ (3 أخطاء شائعة توقف عنها فورًا)
        </h3>
      </div>

      <div className="space-y-3">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-[#23170D]/40 border border-[#4A2F15]/50 flex items-start gap-3 text-xs"
          >
            <div className="w-6 h-6 rounded-full bg-[#23170D] border border-[#A7690C] text-[#F5BF1E] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
              {idx + 1}
            </div>
            <div>
              <div className="font-heading font-bold text-sm text-[#FCFCFA] mb-1">
                {item.headlineAr}
              </div>
              <p className="text-[#C8C5BA] leading-relaxed">
                {item.rationaleAr}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

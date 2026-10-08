import React from 'react';
import { Zap, ShieldAlert, CheckCircle } from 'lucide-react';

interface ExecutiveDiagnosisProps {
  diagnosis: {
    strongestAspectAr: string;
    biggestRiskAr: string;
    immediateDecisionAr: string;
  };
}

export const ExecutiveDiagnosis: React.FC<ExecutiveDiagnosisProps> = ({ diagnosis }) => {
  return (
    <div className="p-6 rounded-2xl bg-[#23170D]/40 border border-[#4A2F15]/70 text-right space-y-5">
      <div className="border-b border-[#4A2F15]/40 pb-3">
        <span className="text-xs text-[#F5BF1E] font-medium tracking-wide">
          الخلاصة التنفيذية للمستشار
        </span>
        <h3 className="font-heading font-bold text-lg text-[#FCFCFA] mt-0.5">
          تشخيص الفرصة في 60 ثانية
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Strongest aspect */}
        <div className="p-4 rounded-xl bg-[#040405] border border-[#4A2F15]/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#F5BF1E] mb-2">
              <Zap className="w-4 h-4" />
              <span>أقوى حاجة في الفكرة:</span>
            </div>
            <p className="text-xs sm:text-sm text-[#FCFCFA] leading-relaxed">
              {diagnosis.strongestAspectAr}
            </p>
          </div>
        </div>

        {/* 2. Biggest risk */}
        <div className="p-4 rounded-xl bg-[#040405] border border-[#A7690C]/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#FBD052] mb-2">
              <ShieldAlert className="w-4 h-4 text-[#F5BF1E]" />
              <span>أكبر مخاطرة:</span>
            </div>
            <p className="text-xs sm:text-sm text-[#FCFCFA] leading-relaxed">
              {diagnosis.biggestRiskAr}
            </p>
          </div>
        </div>

        {/* 3. Immediate decision */}
        <div className="p-4 rounded-xl bg-[#23170D] border border-[#F5BF1E]/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#FCFCFA] mb-2">
              <CheckCircle className="w-4 h-4 text-[#F5BF1E]" />
              <span>القرار الآن:</span>
            </div>
            <p className="text-xs sm:text-sm text-[#FBD052] font-semibold leading-relaxed">
              {diagnosis.immediateDecisionAr}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

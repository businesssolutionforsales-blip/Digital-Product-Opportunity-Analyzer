import React from 'react';
import { StrategicReport } from '../types';
import { ShieldCheck, Target, AlertCircle, HelpCircle } from 'lucide-react';

interface ScoreDashboardProps {
  report: StrategicReport;
}

export const ScoreDashboard: React.FC<ScoreDashboardProps> = ({ report }) => {
  const { opportunityScore, opportunityBand, confidenceScore, confidenceBand, dimensions } = report;

  const dimensionList = [
    dimensions.problemStrength,
    dimensions.demandEvidence,
    dimensions.buyerClarity,
    dimensions.transformationStrength,
    dimensions.monetizationPotential,
    dimensions.creatorAdvantage,
    dimensions.deliveryFeasibility,
  ];

  return (
    <div className="space-y-6">
      {/* Dual Score Showcase Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Opportunity Score */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#23170D] to-[#040405] border border-[#F5BF1E]/40 text-right relative overflow-hidden shadow-lg">
          <div className="absolute top-0 left-0 w-28 h-28 bg-[#F5BF1E]/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-[#F5BF1E] flex items-center gap-1.5">
              <Target className="w-4 h-4" />
              <span>درجة فرصة المنتج</span>
            </span>
            <span className="text-[11px] text-[#797979] font-mono">0 - 100</span>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="font-heading font-extrabold text-5xl sm:text-6xl text-[#FCFCFA] tracking-tight">
              {opportunityScore}
            </span>
            <span className="text-xl text-[#797979] font-light">/ 100</span>
          </div>

          {/* Decision Badge */}
          <div className="inline-block py-1 px-3 rounded-lg border text-xs font-bold font-heading mb-3 transition-colors border-[#F5BF1E]/50 bg-[#23170D] text-[#FBD052]">
            {opportunityBand.labelAr}
          </div>

          <p className="text-xs text-[#C8C5BA] leading-relaxed mb-3">
            {opportunityBand.descriptionAr}
          </p>

          <div className="text-[11px] text-[#797979] border-t border-[#4A2F15]/40 pt-2.5">
            الدرجة تعبر عن امتلاك الفكرة لخصائص استراتيجية قوية، وليست وعدًا بمبيعات مؤكدة.
          </div>
        </div>

        {/* 2. Confidence Score */}
        <div className="p-6 rounded-2xl bg-[#040405] border border-[#4A2F15] text-right relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-[#C8C5BA] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#A7690C]" />
              <span>درجة الثقة في التحليل (الأدلة)</span>
            </span>
            <span className="text-[11px] text-[#797979] font-mono">0 - 100</span>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="font-heading font-extrabold text-5xl sm:text-6xl text-[#FCFCFA] tracking-tight">
              {confidenceScore}
            </span>
            <span className="text-xl text-[#797979] font-light">/ 100</span>
          </div>

          {/* Confidence Badge & Validation Maturity */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="inline-block py-1 px-3 rounded-lg border text-xs font-bold font-heading border-[#4A2F15] bg-[#23170D]/80 text-[#FCFCFA]">
              {confidenceBand.labelAr}
            </div>
            {report.validationMaturity && (
              <div className="inline-block py-1 px-2.5 rounded-lg border text-[11px] font-semibold border-[#F5BF1E]/30 bg-[#23170D]/40 text-[#FBD052]">
                {report.validationMaturity.labelAr}
              </div>
            )}
          </div>

          <p className="text-xs text-[#C8C5BA] leading-relaxed mb-3">
            {confidenceBand.descriptionAr}
          </p>

          {confidenceScore < 60 ? (
            <div className="text-[11px] text-[#FBD052] bg-[#23170D]/80 border border-[#F5BF1E]/30 rounded-lg p-2.5 flex items-start gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-[#F5BF1E] shrink-0 mt-0.5" />
              <span>
                <strong>تنبيه استراتيجي:</strong> الفكرة تبدو واعدة، لكن الأدلة الحالية غير كافية. أهم خطوة
                الآن مش البناء — أهم خطوة جمع الدليل الناقص.
              </span>
            </div>
          ) : (
            <div className="text-[11px] text-[#797979] border-t border-[#4A2F15]/40 pt-2.5">
              مستوى الأدلة المتاحة يوفر أرضية صلبة لتوجيه الاختبار الميداني.
            </div>
          )}
        </div>
      </div>

      {/* 7 Dimensions Visualization */}
      <div className="p-6 rounded-2xl bg-[#23170D]/30 border border-[#4A2F15]/60 text-right">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-heading font-bold text-base text-[#FCFCFA]">
              توزيع الأبعاد الاستراتيجية السبعة
            </h3>
            <p className="text-xs text-[#C8C5BA]">
              تحليل مركب للأوزان السبعة المحددة لفرصة المنتج الرقمي
            </p>
          </div>
          <span className="text-[11px] text-[#A7690C] font-mono hidden sm:inline">Total = 100%</span>
        </div>

        <div className="space-y-4">
          {dimensionList.map((dim, idx) => {
            const isStrong = dim.score >= 70;
            const isWeak = dim.score < 45;

            return (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#FCFCFA]">{dim.nameAr}</span>
                    <span className="text-[#797979] text-[11px]">({dim.weightPercent}%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-[#FCFCFA]">{dim.score}</span>
                    <span className="text-[11px] text-[#797979]">/ 100</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-[#040405] rounded-full overflow-hidden border border-[#4A2F15]/40">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isStrong
                        ? 'bg-gradient-to-l from-[#F5BF1E] to-[#A7690C]'
                        : isWeak
                        ? 'bg-[#797979]'
                        : 'bg-[#C8C5BA]'
                    }`}
                    style={{ width: `${dim.score}%` }}
                  />
                </div>

                <div className="text-[11px] text-[#C8C5BA]/80 pr-1">
                  {dim.notesAr}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

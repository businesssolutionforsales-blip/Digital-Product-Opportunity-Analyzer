import React from 'react';
import { ProductConcept } from '../types';
import { Tag, Ban, Compass, CheckCircle2 } from 'lucide-react';

interface ProductConceptDraftProps {
  concept: ProductConcept;
}

export const ProductConceptDraft: React.FC<ProductConceptDraftProps> = ({ concept }) => {
  return (
    <div className="p-6 rounded-2xl bg-[#23170D]/40 border border-[#4A2F15]/70 text-right space-y-6">
      <div className="border-b border-[#4A2F15]/40 pb-3">
        <span className="text-xs text-[#F5BF1E] font-medium tracking-wide">
          المسودة الاستراتيجية الأولى (Product Concept)
        </span>
        <h3 className="font-heading font-bold text-lg text-[#FCFCFA] mt-0.5">
          هيكل وتوصيف المنتج المقترح
        </h3>
      </div>

      {/* 3 Name Directions */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-[#FCFCFA] mb-2.5">
          <Tag className="w-3.5 h-3.5 text-[#F5BF1E]" />
          <span>3 اتجاهات عملية لتسمية المنتج (بدون مبالغة):</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {concept.nameDirections.map((name, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-[#040405] border border-[#4A2F15]/50 text-xs text-[#FCFCFA] font-medium flex items-center gap-2"
            >
              <span className="w-5 h-5 rounded-full bg-[#23170D] text-[#F5BF1E] flex items-center justify-center font-bold text-[10px] shrink-0">
                {idx + 1}
              </span>
              <span>{name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Concept Breakdown Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-[#040405] border border-[#4A2F15]/50">
          <span className="text-[#F5BF1E] font-semibold block mb-1">الجمهور المحدد:</span>
          <p className="text-[#C8C5BA] leading-relaxed">{concept.targetAudience}</p>
        </div>

        <div className="p-3.5 rounded-xl bg-[#040405] border border-[#4A2F15]/50">
          <span className="text-[#F5BF1E] font-semibold block mb-1">المشكلة التي يحلها:</span>
          <p className="text-[#C8C5BA] leading-relaxed">{concept.coreProblem}</p>
        </div>

        <div className="p-3.5 rounded-xl bg-[#040405] border border-[#4A2F15]/50">
          <span className="text-[#F5BF1E] font-semibold block mb-1">التحول المنشود (النتيجة):</span>
          <p className="text-[#C8C5BA] leading-relaxed">{concept.desiredTransformation}</p>
        </div>

        <div className="p-3.5 rounded-xl bg-[#040405] border border-[#4A2F15]/50">
          <span className="text-[#F5BF1E] font-semibold block mb-1">آلية وشكل التسليم:</span>
          <p className="text-[#C8C5BA] leading-relaxed">{concept.productFormat} — {concept.productMechanism}</p>
        </div>
      </div>

      {/* Initial Value Proposition */}
      <div className="p-4 rounded-xl bg-[#23170D] border border-[#F5BF1E]/40">
        <span className="text-xs font-bold text-[#FBD052] block mb-1">
          عرض القيمة الأولي (Initial Value Proposition):
        </span>
        <p className="text-xs sm:text-sm text-[#FCFCFA] leading-relaxed font-medium">
          &ldquo;{concept.initialValueProposition}&rdquo;
        </p>
      </div>

      {/* What it should NOT include right now */}
      <div className="p-4 rounded-xl bg-[#040405] border border-[#4A2F15]">
        <div className="flex items-center gap-2 text-xs font-bold text-[#A7690C] mb-2.5">
          <Ban className="w-4 h-4 text-[#F5BF1E]" />
          <span>ما لا يحتاج المنتج إضافته الآن (حماية من التعقيد والحشو):</span>
        </div>
        <ul className="space-y-1.5 text-xs text-[#C8C5BA]">
          {concept.whatNotToInclude.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-[#A7690C] font-bold">✕</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

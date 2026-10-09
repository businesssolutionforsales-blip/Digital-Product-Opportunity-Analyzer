// api/analyze-ai.ts - Self-contained Vercel Node.js Serverless Function
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

function setCorsHeaders(res: any) {
  if (res && typeof res.setHeader === 'function') {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );
  }
}

function parseBody(req: any): any {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
}

export default async function handler(req: any, res: any) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') {
    return typeof res.end === 'function' ? res.status(200).end() : res.status(200).json({});
  }
  if (req.method && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({
        available: false,
        message: 'GEMINI_API_KEY is not set',
      });
    }

    const body = parseBody(req);
    const { structuredContext } = body;
    if (!structuredContext) {
      return res.status(400).json({ error: 'structuredContext is required' });
    }

    const prompt = `
أنت مستشار استراتيجي رفيع المستوى في هندسة المنتجات الرقمية ومسارات البيع لصناع المحتوى والخبراء، ملتزم بدقة التحليل الاستشاري وفق مدرسة Mohamed Adel — Sales Funnel Architect.
مهمتك: تقديم قراءة نقدية استراتيجية مبنية بدقة وحصر على الوقائع والأدلة التي قدمها المستخدم، دون اختلاق وقائع أو تفاؤل مفرط أو مصطلحات تحفيزية جوفاء.

البيانات المحسوبة والمحققة قطعيًا (Deterministic Core):
${JSON.stringify(structuredContext, null, 2)}

قواعد صارمة:
1. لا تغير الدرجات المحسوبة أو تعيد اختراع أرقام.
2. ميز بوضوح تام بين: الحقائق المثبتة بدليل واقعي (FACTS / USER-PROVIDED EVIDENCE)، والافتراضات غير المختبرة (ASSUMPTIONS)، والبيانات الناقصة (MISSING DATA).
3. لا تختلق اقتباسات عملاء، أرقام مبيعات، أو منافسين غير مذكورين.
4. إذا لم يذكر المستخدم منهجية خاصة، قل صراحة إن المنهجية لم تحدد بعد ويجب توثيقها من الممارسة الواقعية.
5. اللهجة: مصرية بيضاء استشارية رفيعة المستوى وهادئة ومباشرة.

أرجع إجابتك حصراً بصيغة JSON صالح بالشكل التالي:
{
  "strongest_underused_advantage": "جملة مكثفة توضح أقوى ميزة كامنة في معطيات المستخدم الحقيقية",
  "highest_risk_assumption": "جملة استشارية تحدد الفرضية الأخطر التي لو سقطت يسقط المشروع",
  "evidence_gap": "توصيف دقيق للنقص في الأدلة السوقية وما يجب التحقق منه فورًا",
  "strategic_interpretation": "فقرة مقتضبة (سطرين إلى 3 أسطر) تقيم وضع الفكرة ونضجها بالنسبة لمرحلة صانع المحتوى",
  "recommended_test": "اسم وشكل أقل اختبار ميداني سريع ممكن (مثلاً: محادثة مع 5 عملاء سابقين، ورشة تفاعلية محدودة، مسودة قالب)",
  "recommended_test_reason": "السبب الاستراتيجي لاختيار هذا الاختبار بالتحديد",
  "what_not_to_do": "تحذير استشاري محدد وموجه لحالة هذا المستخدم يمنعه من إهدار الوقت",
  "next_best_question": "السؤال الاستراتيجي الأكثر إلحاحاً الذي يجب أن يوجهه المستخدم لنفسه هذا المساء"
}
`;

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '';
    try {
      const parsed = JSON.parse(responseText);
      return res.status(200).json({
        available: true,
        interpretation: parsed,
      });
    } catch (parseErr) {
      console.warn('[AI JSON PARSE WARNING]', responseText);
      return res.status(200).json({
        available: false,
        message: 'Invalid JSON returned from AI',
      });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[AI ANALYZE ERROR]', err);
    return res.status(200).json({
      available: false,
      error: message,
    });
  }
}

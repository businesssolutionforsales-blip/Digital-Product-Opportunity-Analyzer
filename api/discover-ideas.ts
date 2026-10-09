// api/discover-ideas.ts - Self-contained Vercel Node.js Serverless Function
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
      return res.status(200).json({ available: false });
    }

    const body = parseBody(req);
    const { discoveryInput } = body;
    if (!discoveryInput) {
      return res.status(400).json({ error: 'discoveryInput is required' });
    }

    const prompt = `
بصفتك مستشار استراتيجي لـ Mohamed Adel — Sales Funnel Architect، حلل بيانات هذا الخبير واستخرج له 3 فرص منتجات رقمية مرشحة، مختلفة جوهرياً في زاوية المشكلة والشكل، وليست مجرد تكرار لنفس الفكرة في قوالب جاهزة:
البيانات:
${JSON.stringify(discoveryInput, null, 2)}

الشروط:
1. أعد 3 فرص مرشحة متباينة حقًا تناسب ظروفه (المشكلة، الجمهور، النتيجة، والشكل الأنسب).
2. لا تختلق ادعاءات أن لديه منهجية جاهزة إذا لم يذكر ذلك.
3. حدد لكل فرصة: الدليل المتوفر، الدليل الناقص، الافتراض الأكبر، وأسهل اختبار تحقق.

أرجع حصراً JSON صالح بمصفوفة من 3 عناصر:
[
  {
    "id": "cand-1",
    "title": "عنوان المنتج المقترح",
    "targetAudience": "الجمهور المحدد بدقة",
    "coreProblem": "المشكلة الحقيقية المؤلمة",
    "desiredTransformation": "التحول الملموس بعد الاستخدام",
    "possibleFormat": "الشكل الرقمي الأنسب لحالته",
    "fitRationale": "لماذا يناسب هذا الخبير وساعاته وظروفه",
    "strongestEvidence": "أقوى مؤشر ذكره في إجاباته يدعم هذه الفكرة",
    "missingEvidence": "الدليل الناقص الذي يجب جمعه",
    "biggestRisk": "الافتراض الأكبر الواجب اختباره",
    "easiestValidationTest": "أسهل اختبار عملي خلال 48 ساعة"
  }
]
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
      const candidates = JSON.parse(responseText);
      if (Array.isArray(candidates) && candidates.length > 0) {
        const candidatesWithSource = candidates.map((c: any) => ({
          ...c,
          source: 'ai_generated',
        }));
        return res.status(200).json({
          available: true,
          candidates: candidatesWithSource,
        });
      }
    } catch (e) {
      console.warn('[AI DISCOVER PARSE FAILED]', responseText);
    }

    return res.status(200).json({ available: false });
  } catch (err: unknown) {
    console.error('[AI DISCOVER ERROR]', err);
    return res.status(200).json({ available: false });
  }
}

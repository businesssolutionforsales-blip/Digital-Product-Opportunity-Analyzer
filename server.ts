import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '10mb' }));

  // API Route: Lead Webhook & Storage
  app.post('/api/leads', async (req, res) => {
    try {
      const leadData = req.body;
      const webhookUrl = process.env.LEAD_WEBHOOK_URL;

      console.log('[LEAD RECEIVED]', {
        email: leadData.email,
        name: leadData.first_name,
        report_delivery_requested: leadData.report_delivery_requested ?? true,
        marketing_consent: Boolean(leadData.marketing_consent),
        score: leadData.opportunity_score,
        band: leadData.opportunity_band,
        time: new Date().toISOString()
      });

      let webhookDelivered = false;
      let webhookError: string | null = null;

      if (webhookUrl && webhookUrl.startsWith('http')) {
        try {
          const resp = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(leadData),
          });
          webhookDelivered = resp.ok;
          if (!resp.ok) {
            webhookError = `HTTP ${resp.status}: ${resp.statusText}`;
          }
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Unknown error';
          console.error('[WEBHOOK ERROR]', message);
          webhookError = message;
        }
      }

      return res.status(200).json({
        success: true,
        message: 'تم حفظ بياناتك بنجاح',
        webhookDelivered,
        webhookConfigured: Boolean(webhookUrl && webhookUrl.startsWith('http')),
        webhookError
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[LEAD ROUTE ERROR]', err);
      return res.status(500).json({ success: false, error: message });
    }
  });

  // API Route: AI Structured Strategic Interpretation
  app.post('/api/analyze-ai', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(200).json({
          available: false,
          message: 'GEMINI_API_KEY is not set'
        });
      }

      const { structuredContext } = req.body;
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
          responseMimeType: 'application/json'
        }
      });

      const responseText = response.text || '';
      try {
        const parsed = JSON.parse(responseText);
        return res.status(200).json({
          available: true,
          interpretation: parsed
        });
      } catch (parseErr) {
        console.warn('[AI JSON PARSE WARNING]', responseText);
        return res.status(200).json({
          available: false,
          message: 'Invalid JSON returned from AI'
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[AI ANALYZE ERROR]', err);
      return res.status(200).json({
        available: false,
        error: message
      });
    }
  });

  // API Route: AI Structured Candidate Ideas Discovery
  app.post('/api/discover-ideas', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(200).json({ available: false });
      }

      const { discoveryInput } = req.body;
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
          responseMimeType: 'application/json'
        }
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
            candidates: candidatesWithSource
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
  });

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

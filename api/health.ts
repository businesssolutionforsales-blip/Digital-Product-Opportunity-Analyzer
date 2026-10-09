// api/health.ts - Completely self-contained Vercel Node.js Serverless Function
// Independent of Gemini, Systeme.io, scoring engine, and external local imports.

export default async function handler(req: any, res: any) {
  // CORS support
  if (res && typeof res.setHeader === 'function') {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,HEAD');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );
  }

  if (req.method === 'OPTIONS') {
    return typeof res.end === 'function' ? res.status(200).end() : res.status(200).json({});
  }

  if (req.method && req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const crmSecretConfigured = Boolean(process.env.SYSTEME_IO_API_KEY && process.env.SYSTEME_IO_API_KEY.trim().length > 0);
  const geminiSecretConfigured = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);

  return res.status(200).json({
    ok: true,
    server: 'dpoa',
    crmSecretConfigured,
    geminiSecretConfigured,
  });
}

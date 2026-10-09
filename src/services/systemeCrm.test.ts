// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { syncLeadToSysteme, MANAGED_FIELDS } from './systemeCrm';
import { analyzeOpportunity } from '../data/strategicEngine';

describe('Systeme CRM Contact Field & Sync Validation', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('Payloads for contact field creation must use fieldName and slug, not name', async () => {
    const fetchCalls: Array<{ url: string; body: any }> = [];
    const mockFetch = vi.fn().mockImplementation((url: string, init: any) => {
      let bodyObj = null;
      if (init?.body) {
        try {
          bodyObj = JSON.parse(init.body);
        } catch {
          bodyObj = init.body;
        }
      }
      fetchCalls.push({ url, body: bodyObj });

      // If fetching collections
      if (url.includes('/tags')) {
        return Promise.resolve(new Response(JSON.stringify({ items: [{ id: 1, name: 'SOURCE | Digital Product Opportunity Analyzer' }] }), { status: 200 }));
      }
      if (url.includes('/contact_fields') && init?.method === 'GET') {
        return Promise.resolve(new Response(JSON.stringify({ items: [] }), { status: 200 }));
      }
      if (url.includes('/contact_fields') && init?.method === 'POST') {
        return Promise.resolve(new Response(JSON.stringify({ id: 99, slug: bodyObj?.slug }), { status: 200 }));
      }
      if (url.includes('/contacts?email=')) {
        return Promise.resolve(new Response(JSON.stringify({ items: [] }), { status: 200 }));
      }
      if (url.includes('/contacts') && init?.method === 'POST') {
        return Promise.resolve(new Response(JSON.stringify({ id: 501 }), { status: 200 }));
      }
      if (url.includes('/contacts/501/tags')) {
        return Promise.resolve(new Response(JSON.stringify({ success: true }), { status: 200 }));
      }

      return Promise.resolve(new Response(JSON.stringify({}), { status: 200 }));
    });

    globalThis.fetch = mockFetch as any;
    process.env.SYSTEME_IO_API_KEY = 'test_key';

    const authReport = analyzeOpportunity({ userPath: 'expert_no_idea' } as any, null);
    const result = await syncLeadToSysteme({
      email: 'valid_test@gmail.com',
      firstName: 'Test',
      businessType: 'كورس / تدريب أونلاين',
      marketingConsent: false,
      authoritativeReport: authReport,
    });

    const fieldPostCalls = fetchCalls.filter(c => c.url.includes('/contact_fields') && c.body?.fieldName);
    expect(fieldPostCalls.length).toBe(MANAGED_FIELDS.length);
    for (const call of fieldPostCalls) {
      expect(call.body).toHaveProperty('fieldName');
      expect(call.body).toHaveProperty('slug');
      expect(call.body).not.toHaveProperty('name');
    }
  });

  it('HTTP 422 on field creation is not treated as success if field is absent on refetch', async () => {
    const mockFetch = vi.fn().mockImplementation((url: string, init: any) => {
      if (url.includes('/tags')) {
        return Promise.resolve(new Response(JSON.stringify({ items: [] }), { status: 200 }));
      }
      if (url.includes('/contact_fields') && init?.method === 'GET') {
        return Promise.resolve(new Response(JSON.stringify({ items: [] }), { status: 200 }));
      }
      if (url.includes('/contact_fields') && init?.method === 'POST') {
        // Return 422 error
        return Promise.resolve(new Response(JSON.stringify({ detail: 'fieldName is invalid' }), { status: 422 }));
      }
      return Promise.resolve(new Response(JSON.stringify({}), { status: 200 }));
    });

    globalThis.fetch = mockFetch as any;
    process.env.SYSTEME_IO_API_KEY = 'test_key';

    const authReport = analyzeOpportunity({ userPath: 'expert_no_idea' } as any, null);
    const result = await syncLeadToSysteme({
      email: 'valid_test@gmail.com',
      firstName: 'Test',
      businessType: 'كورس / تدريب أونلاين',
      marketingConsent: false,
      authoritativeReport: authReport,
    });

    expect(result.synced).toBe(false);
    expect(result.error).toContain('Missing required DPOA contact fields');
  });

  it('Missing custom fields prevent sending invalid contact PATCH requests', async () => {
    let patchAttempted = false;
    const mockFetch = vi.fn().mockImplementation((url: string, init: any) => {
      if (url.includes('/tags')) {
        return Promise.resolve(new Response(JSON.stringify({ items: [] }), { status: 200 }));
      }
      if (url.includes('/contact_fields') && init?.method === 'GET') {
        return Promise.resolve(new Response(JSON.stringify({ items: [] }), { status: 200 }));
      }
      if (url.includes('/contact_fields') && init?.method === 'POST') {
        return Promise.resolve(new Response(JSON.stringify({ error: 'creation rejected' }), { status: 500 }));
      }
      if (init?.method === 'PATCH') {
        patchAttempted = true;
        return Promise.resolve(new Response(JSON.stringify({}), { status: 200 }));
      }
      return Promise.resolve(new Response(JSON.stringify({}), { status: 200 }));
    });

    globalThis.fetch = mockFetch as any;
    process.env.SYSTEME_IO_API_KEY = 'test_key';

    const authReport = analyzeOpportunity({ userPath: 'expert_no_idea' } as any, null);
    const result = await syncLeadToSysteme({
      email: 'valid_test@gmail.com',
      firstName: 'Test',
      businessType: 'كورس / تدريب أونلاين',
      marketingConsent: false,
      authoritativeReport: authReport,
    });

    expect(patchAttempted).toBe(false);
    expect(result.synced).toBe(false);
  });

  it('Report remains accessible with success: true when CRM sync fails', async () => {
    const mod = await import('../server/apiHandlers');
    let status = 0;
    let jsonResp: any = null;
    const res = {
      setHeader() {},
      status(c: number) { status = c; return this; },
      json(j: any) { jsonResp = j; return this; }
    };

    const req = {
      method: 'POST',
      body: {
        email: 'user_fallback@example.com',
        first_name: 'Sara',
        business_type: 'كورس / تدريب أونلاين',
        marketing_consent: true,
        answers: { userPath: 'expert_no_idea' }
      }
    };

    await mod.handleLeads(req, res);
    expect(status).toBe(200);
    expect(jsonResp.success).toBe(true);
    expect(jsonResp.crm.attempted).toBe(true);
  });
});

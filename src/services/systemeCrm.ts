import { QuestionnaireAnswers, StrategicReport } from '../types';
import { analyzeOpportunity } from '../data/strategicEngine';

export interface SystemeCrmResult {
  attempted: boolean;
  synced: boolean;
  contactId?: number | string;
  isExisting?: boolean;
  tagsApplied?: string[];
  fieldsUpdated?: string[];
  error?: string;
}

interface SystemeTag {
  id?: number | string;
  name?: string;
}

interface SystemeContactField {
  id?: number | string;
  name?: string;
  slug?: string;
}

interface SystemeContact {
  id: number | string;
  email: string;
  fields?: Array<{ slug: string; value: string }>;
  tags?: Array<{ id: number | string; name?: string }>;
}

export const MANAGED_TAGS = {
  SOURCE: 'SOURCE | Digital Product Opportunity Analyzer',
  MARKETING_ELIGIBLE: 'DPOA | Marketing Eligible',
  ROUTE: 'DPOA | Route',
} as const;

export const MANAGED_FIELDS: Array<{ name: string; slug: string }> = [
  { name: 'DPOA Opportunity Score', slug: 'dpoa_opportunity_score' },
  { name: 'DPOA Opportunity Band', slug: 'dpoa_opportunity_band' },
  { name: 'DPOA Confidence Score', slug: 'dpoa_confidence_score' },
  { name: 'DPOA Confidence Band', slug: 'dpoa_confidence_band' },
  { name: 'DPOA Validation Stage', slug: 'dpoa_validation_stage' },
  { name: 'DPOA Sprint Mode', slug: 'dpoa_sprint_mode' },
  { name: 'DPOA Creator Path', slug: 'dpoa_creator_path' },
  { name: 'DPOA Recommended Format', slug: 'dpoa_recommended_format' },
  { name: 'DPOA Next Step', slug: 'dpoa_next_step' },
  { name: 'DPOA Business Type', slug: 'dpoa_business_type' },
];

/**
 * Strict whitelist for business types coming from the frontend dropdown.
 * If anything else is received, defaults to 'غير محدد'.
 */
export const ALLOWED_BUSINESS_TYPES = new Set([
  'كورس / تدريب أونلاين',
  'كوتشينج أو استشارات',
  'مقدم خدمات / فريلانسر',
  'صانع محتوى لديه متابعين',
  'خبير أو متخصص يبدأ لأول مرة',
]);

export function sanitizeBusinessType(input?: string): string {
  const trimmed = (input || '').trim();
  if (ALLOWED_BUSINESS_TYPES.has(trimmed)) {
    return trimmed;
  }
  return 'غير محدد';
}

/**
 * Recomputes the authoritative deterministic diagnostic result server-side.
 * Never trusts client-submitted scores, bands, stages, sprints, paths, or next steps.
 */
export function recomputeAuthoritativeDiagnosis(
  answers: QuestionnaireAnswers
): StrategicReport {
  return analyzeOpportunity(answers, null);
}

/**
 * Safe fetch helper for Systeme.io API
 */
async function systemeFetch<T>(
  apiKey: string,
  endpoint: string,
  options: {
    method?: string;
    body?: any;
    mergePatch?: boolean;
  } = {}
): Promise<{ ok: boolean; status: number; data?: T; errorText?: string }> {
  const url = `https://api.systeme.io/api${endpoint}`;
  const headers: Record<string, string> = {
    'X-API-Key': apiKey,
    Accept: 'application/json',
  };

  if (options.body) {
    headers['Content-Type'] = options.mergePatch
      ? 'application/merge-patch+json'
      : 'application/json';
  }

  try {
    const res = await fetch(url, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const text = await res.text();
    let data: T | undefined = undefined;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        // Response was not JSON
      }
    }

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        data,
        errorText: `HTTP ${res.status}: ${text.slice(0, 300)}`,
      };
    }

    return { ok: true, status: res.status, data };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Network failure';
    return { ok: false, status: 0, errorText: msg };
  }
}

interface PaginatedCollectionResult<T> {
  success: boolean;
  items: T[];
  error?: string;
}

/**
 * Retrieves all pages for a Systeme.io collection using limit=100 and startingAfter.
 * Continues until hasMore is false.
 */
async function fetchAllCollectionPages<T extends { id?: number | string }>(
  apiKey: string,
  baseEndpoint: string
): Promise<PaginatedCollectionResult<T>> {
  const allItems: T[] = [];
  let startingAfter: number | string | undefined = undefined;
  let hasMore = true;
  let pageCount = 0;
  const maxPages = 50;

  while (hasMore && pageCount < maxPages) {
    pageCount++;
    const separator = baseEndpoint.includes('?') ? '&' : '?';
    let url = `${baseEndpoint}${separator}limit=100`;
    if (startingAfter != null) {
      url += `&startingAfter=${encodeURIComponent(String(startingAfter))}`;
    }

    const res = await systemeFetch<{
      items?: T[];
      data?: T[];
      hasMore?: boolean;
    }>(apiKey, url);

    if (!res.ok) {
      return {
        success: false,
        items: allItems,
        error: res.errorText || `Failed to fetch collection page for ${baseEndpoint} (HTTP ${res.status})`,
      };
    }

    const pageItems: T[] =
      (res.data && (res.data.items || res.data.data)) ||
      (Array.isArray(res.data) ? res.data : []);

    allItems.push(...pageItems);

    const receivedHasMore = Boolean(res.data && res.data.hasMore);
    if (receivedHasMore && pageItems.length > 0) {
      const lastItem = pageItems[pageItems.length - 1];
      if (lastItem && lastItem.id != null) {
        startingAfter = lastItem.id;
        hasMore = true;
      } else {
        hasMore = false;
      }
    } else {
      hasMore = false;
    }
  }

  return {
    success: true,
    items: allItems,
  };
}

interface EnsureTagsResult {
  success: boolean;
  tagMap: Map<string, number | string>;
  error?: string;
}

/**
 * Get all existing tags across all pages, creating missing ones automatically.
 * Fails safely if listing tags fails.
 */
async function getOrCreateTags(
  apiKey: string,
  tagNamesToEnsure: string[]
): Promise<EnsureTagsResult> {
  const tagMap = new Map<string, number | string>();

  // 1. Fetch all pages of tags
  const tagsFetch = await fetchAllCollectionPages<SystemeTag>(apiKey, '/tags');
  if (!tagsFetch.success) {
    return {
      success: false,
      tagMap,
      error: `Could not load existing tags: ${tagsFetch.error}`,
    };
  }

  for (const t of tagsFetch.items) {
    if (t?.name && t.id != null) {
      tagMap.set(t.name.trim(), t.id);
    }
  }

  // 2. Only after all pages have been checked, create missing managed tags
  for (const name of tagNamesToEnsure) {
    const trimmed = name.trim();
    if (!tagMap.has(trimmed)) {
      try {
        const createRes = await systemeFetch<SystemeTag>(apiKey, '/tags', {
          method: 'POST',
          body: { name: trimmed },
        });
        if (createRes.ok && createRes.data?.id != null) {
          tagMap.set(trimmed, createRes.data.id);
        }
      } catch (e) {
        console.warn(`[SYSTEME CRM] Failed to create tag "${trimmed}":`, e);
      }
    }
  }

  return {
    success: true,
    tagMap,
  };
}

interface EnsureContactFieldsResult {
  success: boolean;
  existingSlugs: Set<string>;
  error?: string;
}

/**
 * Ensures all managed contact fields exist in Systeme.io using /contact_fields across all pages.
 * Detection is based strictly on `slug` (does NOT depend on numeric field IDs).
 * Fails safely if listing contact fields fails.
 */
async function ensureContactFields(
  apiKey: string
): Promise<EnsureContactFieldsResult> {
  const existingSlugs = new Set<string>();

  // 1. Fetch all pages of contact fields
  const fieldsFetch = await fetchAllCollectionPages<SystemeContactField>(apiKey, '/contact_fields');
  if (!fieldsFetch.success) {
    return {
      success: false,
      existingSlugs,
      error: `Could not load existing contact fields: ${fieldsFetch.error}`,
    };
  }

  for (const f of fieldsFetch.items) {
    if (f && typeof f.slug === 'string' && f.slug.trim()) {
      existingSlugs.add(f.slug.trim().toLowerCase());
    }
  }

  // 2. Only after all pages have been checked, create missing managed fields
  // Payload: { "name": "<field display name>", "slug": "<field slug>" }
  // Do NOT send fieldName and do NOT send type: "text".
  for (const target of MANAGED_FIELDS) {
    const slugKey = target.slug.trim().toLowerCase();
    if (!existingSlugs.has(slugKey)) {
      try {
        const createRes = await systemeFetch<SystemeContactField>(
          apiKey,
          '/contact_fields',
          {
            method: 'POST',
            body: {
              name: target.name,
              slug: target.slug,
            },
          }
        );

        if (createRes.ok) {
          existingSlugs.add(slugKey);
        } else if (createRes.status === 422 || createRes.status === 409) {
          // If already exists, mark present
          existingSlugs.add(slugKey);
        }
      } catch (e) {
        console.warn(`[SYSTEME CRM] Failed to create contact field "${target.slug}":`, e);
      }
    }
  }

  return {
    success: true,
    existingSlugs,
  };
}

/**
 * Find contact by email
 */
async function findContactByEmail(
  apiKey: string,
  email: string
): Promise<SystemeContact | null> {
  const enc = encodeURIComponent(email);
  const res = await systemeFetch<{ items?: SystemeContact[]; data?: SystemeContact[] }>(
    apiKey,
    `/contacts?email=${enc}`
  );

  if (res.ok && res.data) {
    const list = res.data.items || res.data.data || (Array.isArray(res.data) ? res.data : []);
    const match = list.find(
      (c) => c?.email && c.email.trim().toLowerCase() === email
    );
    if (match && match.id != null) return match;
  }

  return null;
}

/**
 * Assign a tag to a contact using ONLY POST /contacts/{contactId}/tags.
 * No PUT fallback is used. Returns false if assignment fails.
 */
async function assignTagToContact(
  apiKey: string,
  contactId: number | string,
  tagId: number | string
): Promise<boolean> {
  const postRes = await systemeFetch(apiKey, `/contacts/${contactId}/tags`, {
    method: 'POST',
    body: { tagId },
  });

  return postRes.ok;
}

/**
 * Main CRM sync function for a lead submission.
 * Non-blocking, completely fault-tolerant.
 */
export async function syncLeadToSysteme(params: {
  email: string;
  firstName?: string;
  businessType?: string;
  marketingConsent: boolean;
  authoritativeReport: StrategicReport;
}): Promise<SystemeCrmResult> {
  const apiKey = process.env.SYSTEME_IO_API_KEY;

  if (!apiKey || !apiKey.trim()) {
    return {
      attempted: false,
      synced: false,
      error: 'SYSTEME_IO_API_KEY is not configured',
    };
  }

  const normalizedEmail = params.email.trim().toLowerCase();
  const rep = params.authoritativeReport;
  const safeBusinessType = sanitizeBusinessType(params.businessType);

  // Prepare custom field values for contact
  const customFieldEntries: Array<{ slug: string; value: string }> = [
    { slug: 'dpoa_opportunity_score', value: String(rep.opportunityScore) },
    { slug: 'dpoa_opportunity_band', value: rep.opportunityBand.labelAr },
    { slug: 'dpoa_confidence_score', value: String(rep.confidenceScore) },
    { slug: 'dpoa_confidence_band', value: rep.confidenceBand.labelAr },
    {
      slug: 'dpoa_validation_stage',
      value: `المرحلة ${rep.validationMaturity?.stageNumber ?? 0}: ${rep.validationMaturity?.labelAr ?? 'غير محدد'}`,
    },
    {
      slug: 'dpoa_sprint_mode',
      value: rep.sprintModeLabelAr || rep.sprintMode || 'غير محدد',
    },
    {
      slug: 'dpoa_creator_path',
      value: rep.answers.userPath || 'غير محدد',
    },
    {
      slug: 'dpoa_recommended_format',
      value: rep.formatRecommendation?.primary?.titleAr || 'غير محدد',
    },
    {
      slug: 'dpoa_next_step',
      value: rep.personalizedNextStep?.headlineAr || 'غير محدد',
    },
    {
      slug: 'dpoa_business_type',
      value: safeBusinessType,
    },
  ];

  // Store first name using the standard Systeme.io contact field slug "first_name" inside fields
  const trimmedFirstName = (params.firstName || '').trim();
  if (trimmedFirstName) {
    customFieldEntries.push({
      slug: 'first_name',
      value: trimmedFirstName,
    });
  }

  try {
    // 1. Ensure tags and contact fields exist after full pagination inspection
    const [tagsResult, fieldsResult] = await Promise.all([
      getOrCreateTags(apiKey, [
        MANAGED_TAGS.SOURCE,
        MANAGED_TAGS.MARKETING_ELIGIBLE,
        MANAGED_TAGS.ROUTE,
      ]),
      ensureContactFields(apiKey),
    ]);

    // If listing tags or contact fields fails completely, fail safely without attempting mass recreation
    if (!tagsResult.success) {
      return {
        attempted: true,
        synced: false,
        error: tagsResult.error || 'Failed to list tags from Systeme.io',
      };
    }
    if (!fieldsResult.success) {
      return {
        attempted: true,
        synced: false,
        error: fieldsResult.error || 'Failed to list contact fields from Systeme.io',
      };
    }

    const tagMap = tagsResult.tagMap;

    // 2. Find existing contact by normalized email
    const existing = await findContactByEmail(apiKey, normalizedEmail);

    let contactId: number | string | undefined = existing?.id;
    let isExisting = Boolean(existing && existing.id != null);

    // 3. Create or Update contact
    // Note: Do NOT send firstName as a top-level property; it is sent in fields as slug "first_name"
    if (isExisting && contactId) {
      // Update contact via PATCH /contacts/{id} with application/merge-patch+json
      const updatePayload: Record<string, any> = {
        email: normalizedEmail,
        fields: customFieldEntries,
      };

      const patchRes = await systemeFetch(apiKey, `/contacts/${contactId}`, {
        method: 'PATCH',
        mergePatch: true,
        body: updatePayload,
      });

      // Contact update integrity:
      // If that update fails, do NOT silently return synced: true.
      if (!patchRes.ok) {
        return {
          attempted: true,
          synced: false,
          contactId,
          isExisting: true,
          error: patchRes.errorText || `Failed to update contact ${contactId} in Systeme.io (HTTP ${patchRes.status})`,
        };
      }
    } else {
      // Create contact via POST /contacts
      const createPayload: Record<string, any> = {
        email: normalizedEmail,
        fields: customFieldEntries,
      };

      const createRes = await systemeFetch<SystemeContact>(
        apiKey,
        '/contacts',
        {
          method: 'POST',
          body: createPayload,
        }
      );

      if (createRes.ok && createRes.data?.id != null) {
        contactId = createRes.data.id;
      } else {
        // If create failed (e.g. race condition where contact exists), attempt lookup and PATCH
        const refetch = await findContactByEmail(apiKey, normalizedEmail);
        if (refetch?.id != null) {
          contactId = refetch.id;
          isExisting = true;
          const patchRetry = await systemeFetch(apiKey, `/contacts/${contactId}`, {
            method: 'PATCH',
            mergePatch: true,
            body: createPayload,
          });
          if (!patchRetry.ok) {
            return {
              attempted: true,
              synced: false,
              contactId,
              isExisting: true,
              error: patchRetry.errorText || `Failed to update existing contact ${contactId} on retry`,
            };
          }
        } else {
          return {
            attempted: true,
            synced: false,
            error: createRes.errorText || 'Failed to create contact in Systeme.io',
          };
        }
      }
    }

    if (!contactId) {
      return {
        attempted: true,
        synced: false,
        error: 'Contact ID could not be resolved',
      };
    }

    // 4. Tagging logic
    const appliedTags: string[] = [];

    // Tag 1: Always add SOURCE tag to successfully synced contacts
    const sourceTagId = tagMap.get(MANAGED_TAGS.SOURCE);
    if (sourceTagId != null) {
      const ok = await assignTagToContact(apiKey, contactId, sourceTagId);
      if (ok) appliedTags.push(MANAGED_TAGS.SOURCE);
    }

    // Tag 2: Add MARKETING_ELIGIBLE only if marketingConsent is true.
    // If contact already has it and consent is false, we DO NOT remove it!
    if (params.marketingConsent) {
      const mktTagId = tagMap.get(MANAGED_TAGS.MARKETING_ELIGIBLE);
      if (mktTagId != null) {
        const ok = await assignTagToContact(apiKey, contactId, mktTagId);
        if (ok) appliedTags.push(MANAGED_TAGS.MARKETING_ELIGIBLE);
      }
    }

    // Tag 3: DPOA | Route is INTENTIONALLY NOT ADDED in this patch (Routing disabled)

    return {
      attempted: true,
      synced: true,
      contactId,
      isExisting,
      tagsApplied: appliedTags,
      fieldsUpdated: customFieldEntries.map((f) => f.slug),
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown CRM error';
    console.error('[SYSTEME CRM SYNC ERROR]', msg);
    return {
      attempted: true,
      synced: false,
      error: msg,
    };
  }
}

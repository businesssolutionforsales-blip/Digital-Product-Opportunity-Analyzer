import { LeadSubmission, StrategicReport } from '../types';

/**
 * Lead capture & analytics submission service
 * Dispatches structured lead data with UTM attribution and dynamic scoring tags.
 */

export function parseUtmParams(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get('utm_source') || '',
    utm_medium: params.get('utm_medium') || '',
    utm_campaign: params.get('utm_campaign') || '',
    utm_content: params.get('utm_content') || '',
    utm_term: params.get('utm_term') || '',
    page_url: window.location.href,
  };
}

export async function submitLeadReport(
  firstName: string,
  email: string,
  businessType: string,
  marketingConsent: boolean,
  report: StrategicReport
): Promise<{ success: boolean; message: string; webhookDelivered?: boolean }> {
  const utms = parseUtmParams();

  // Score Tag format
  let scoreTag = 'SCORE | Needs Refinement';
  if (report.opportunityScore >= 85) {
    scoreTag = 'SCORE | Strong Opportunity';
  } else if (report.opportunityScore >= 70) {
    scoreTag = 'SCORE | Promising';
  } else if (report.opportunityScore < 55) {
    scoreTag = 'SCORE | Weak Signal';
  }

  const payload: LeadSubmission = {
    first_name: firstName.trim(),
    email: email.trim().toLowerCase(),
    business_type: businessType.trim(),
    report_delivery_requested: true,
    marketing_consent: Boolean(marketingConsent),
    consent_given: Boolean(marketingConsent), // backward compatibility
    created_at: new Date().toISOString(),
    tool_name: 'Digital Product Opportunity Analyzer',
    stage: 'Creator',
    opportunity_score: report.opportunityScore,
    confidence_score: report.confidenceScore,
    opportunity_band: scoreTag,
    recommended_format: report.formatRecommendation.primary.titleAr,
    primary_risk: report.executiveDiagnosis.biggestRiskAr,
    creator_path: report.answers.userPath,
    analysis_mode: report.analysisMode,
    ...utms,
  };

  // 1. Save locally for report session continuity
  try {
    const unlockedReports = JSON.parse(localStorage.getItem('ma_unlocked_reports') || '[]');
    if (!unlockedReports.includes(report.id)) {
      unlockedReports.push(report.id);
      localStorage.setItem('ma_unlocked_reports', JSON.stringify(unlockedReports));
    }
    localStorage.setItem(`ma_report_${report.id}`, JSON.stringify(report));
    localStorage.setItem('ma_last_user_info', JSON.stringify({ firstName, email, marketingConsent }));
  } catch (e) {
    console.warn('Could not store lead locally', e);
  }

  // 2. Dispatch to server-side webhook proxy
  try {
    const response = await fetch('/api/leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        message: 'تم حفظ بياناتك وفتح التقرير بنجاح.',
        webhookDelivered: data.webhookDelivered,
      };
    }
  } catch (err) {
    console.warn('Network call to /api/leads failed, stored locally instead', err);
  }

  return {
    success: true,
    message: 'تم حفظ التقرير في متصفحك وفتحه بنجاح.',
    webhookDelivered: false,
  };
}

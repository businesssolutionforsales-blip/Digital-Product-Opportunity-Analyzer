import { parseUtmParams } from './leadService';

/**
 * Analytics Abstraction Layer
 * Safe, privacy-preserving event tracker with UTM preservation and silent fallback.
 */

export type AnalyticsEvent =
  | 'tool_started'
  | 'path_selected'
  | 'idea_discovery_completed'
  | 'questionnaire_section_completed'
  | 'analysis_requested'
  | 'analysis_completed'
  | 'analysis_mode'
  | 'lead_capture_viewed'
  | 'lead_submitted'
  | 'report_unlocked'
  | 'report_viewed'
  | 'report_downloaded'
  | 'validation_plan_viewed'
  | 'cta_clicked';

export function trackEvent(
  eventName: AnalyticsEvent,
  properties: Record<string, any> = {}
): void {
  try {
    const utms = parseUtmParams();
    const eventPayload = {
      event: eventName,
      timestamp: new Date().toISOString(),
      properties: {
        ...properties,
        ...utms,
      },
    };

    // 1. Console log in dev for traceability
    if (typeof window !== 'undefined' && (window as any).__DEV__) {
      console.debug('[ANALYTICS EVENT]', eventName, eventPayload);
    }

    // 2. Dispatch to custom window event if any tag manager or listener is present
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('ma_analytics_event', { detail: eventPayload })
      );

      // Support dataLayer if configured by website wrapper
      if (Array.isArray((window as any).dataLayer)) {
        (window as any).dataLayer.push(eventPayload);
      }
    }
  } catch (e) {
    // Fail completely silently to never block application execution
  }
}

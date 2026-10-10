export type CtaTargetModule = 'creator_validation' | 'creator_mvp' | 'reassessment' | 'seller_offer';

export interface CtaNavigationResolution {
  targetModule: CtaTargetModule;
  action: 'scroll_to_section' | 'open_recalculate' | 'open_external_url';
  targetSectionId?: string;
  externalUrl?: string;
  isExternalConfigured: boolean;
  fallbackNoticeAr?: string;
  resolvedButtonLabelAr?: string;
}

/**
 * Validates configured Offer Lab URL using native URL parser.
 * Accepts valid HTTPS in production, and allows HTTP only for local development (localhost / 127.0.0.1).
 */
export function isValidOfferLabUrl(urlStr?: string | null): boolean {
  if (!urlStr || typeof urlStr !== 'string') return false;
  const trimmed = urlStr.trim();
  if (!trimmed) return false;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'https:') {
      return Boolean(parsed.hostname && parsed.hostname.length > 0);
    }
    if (parsed.protocol === 'http:') {
      const hostname = parsed.hostname.toLowerCase();
      const isLocal =
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname === '[::1]' ||
        hostname.endsWith('.localhost');
      return isLocal;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Resolves typed, meaningful navigation for the personalized CTA.
 * Avoids arbitrary pixel coordinates and ensures destinations exist.
 */
export function resolveCtaNavigation(
  targetModule: CtaTargetModule,
  configuredOfferLabUrl?: string | null,
  defaultButtonLabelAr?: string
): CtaNavigationResolution {
  switch (targetModule) {
    case 'creator_validation':
      return {
        targetModule: 'creator_validation',
        action: 'scroll_to_section',
        targetSectionId: 'section-validation-sprint',
        isExternalConfigured: true,
        resolvedButtonLabelAr: defaultButtonLabelAr || 'ابدأ خطة التحقق السريعة (7 أيام)',
      };

    case 'creator_mvp':
      return {
        targetModule: 'creator_mvp',
        action: 'scroll_to_section',
        targetSectionId: 'section-mvp-recommendation',
        isExternalConfigured: true,
        resolvedButtonLabelAr: defaultButtonLabelAr || 'صمم النسخة الأولية (MVP)',
      };

    case 'reassessment':
      return {
        targetModule: 'reassessment',
        action: 'open_recalculate',
        isExternalConfigured: true,
        resolvedButtonLabelAr: defaultButtonLabelAr || 'عدّل معطيات الفكرة وأعد التقييم',
      };

    case 'seller_offer': {
      const trimmedUrl = configuredOfferLabUrl?.trim();
      const isConfigured = isValidOfferLabUrl(trimmedUrl);

      if (isConfigured && trimmedUrl) {
        return {
          targetModule: 'seller_offer',
          action: 'open_external_url',
          externalUrl: trimmedUrl,
          isExternalConfigured: true,
          resolvedButtonLabelAr:
            defaultButtonLabelAr || 'انتقل لمعمل هندسة العروض (Offer Architecture)',
        };
      }

      // Truthful fallback: Route to in-report MVP Recommendation section without broken links
      // Accurately describes the in-report MVP section BEFORE clicking
      return {
        targetModule: 'seller_offer',
        action: 'scroll_to_section',
        targetSectionId: 'section-mvp-recommendation',
        isExternalConfigured: false,
        fallbackNoticeAr:
          'معمل هندسة العروض المتقدم غير مهيأ كرابط خارجي حاليًا. تم توجيهك إلى قسم نموذج النسخة الأولية (MVP) وصياغة العرض في تقريرك.',
        resolvedButtonLabelAr: 'استعرض نموذج النسخة الأولية وصياغة العرض (MVP)',
      };
    }

    default:
      return {
        targetModule: 'creator_validation',
        action: 'scroll_to_section',
        targetSectionId: 'section-validation-sprint',
        isExternalConfigured: true,
        resolvedButtonLabelAr: defaultButtonLabelAr || 'ابدأ خطة التحقق السريعة (7 أيام)',
      };
  }
}


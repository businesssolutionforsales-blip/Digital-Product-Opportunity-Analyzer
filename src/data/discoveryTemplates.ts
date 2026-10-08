import { IdeaDiscoveryAnswers, DiscoveredCandidate } from '../types';

/**
 * Intelligent generator for candidate digital product ideas
 * Transforms raw creator domain experience into 3 concrete, non-fluff product concepts.
 */
export function generateCandidateOpportunities(
  answers: IdeaDiscoveryAnswers
): DiscoveredCandidate[] {
  const domain = answers.expertiseArea.trim() || 'المجال التخصصي';
  const repeated = answers.repeatedQuestions.trim() || 'حل التحدي الأساسي خطوة بخطوة';
  const target = answers.audiencesBestUnderstood.trim() || 'المهنيون وأصحاب الأعمال في نفس مجالك';
  const results = answers.credibleResultsCreated.trim() || 'توفير الوقت والوصول لنتائج أسرع';
  const problems = answers.problemsFrequentlySolved.trim() || 'غياب منهجية واضحة ومشتتات التنفيذ';

  // Candidate 1: Implementation System / Toolkit
  const candidate1: DiscoveredCandidate = {
    id: 'cand-toolkit',
    title: `نظام تطبيقي وقوالب تنفيذية: ${domain}`,
    targetAudience: target,
    coreProblem: `إهدار ساعات طويلة في تكرار العمل يدويًا دون نموذج عملي لتنفيذ ${repeated}.`,
    desiredTransformation: `امتلاك حزمة أدوات جاهزة ومجربة تُمكّن العميل من إنجاز ${results} بأقل جهد وتشتت.`,
    possibleFormat: 'Toolkit & Templates (حزمة قوالب وأدلة تنفيذية)',
    fitRationale: `تناسب رغبتك في تقليل ساعات التسليم بعد البناء وتحويل خبرتك في ${domain} لأصل ذاتي الاستهلاك.`,
    biggestRisk: 'افتراض أن القوالب وحدها كافية للمشتري دون إرشادات فيديو تطبيقية لسياق استخدامها.',
    strongestEvidence: answers.coreSkills ? `مهارتك العملية المحددة في: ${answers.coreSkills}` : 'خبرتك المباشرة في المجال',
    missingEvidence: 'جمع دليل على أن المستهدفين يدفعون لأدوات جاهزة بدل الاكتفاء بالبحث عن قوالب مجانية.',
    easiestValidationTest: 'عرض عينة مجانية مصغرة من قالب واحد وقياس عدد من يطلبون الحزمة الكاملة.',
    source: 'rules_fallback',
  };

  // Candidate 2: Intensive Problem-Solving Workshop
  const candidate2: DiscoveredCandidate = {
    id: 'cand-workshop',
    title: `ورشة عمل تفاعلية مركزة: علاج ${problems}`,
    targetAudience: target,
    coreProblem: `المعاناة من ${problems} وصعوبة الوصول لحل جذري دون توجيه وإجابة على التساؤلات الحرجة.`,
    desiredTransformation: `الخروج من الورشة بنتيجة ملموسة وواضحة لحل المشكلة خلال ساعات معدودة مع إجابة كافة التساؤلات.`,
    possibleFormat: 'Live Workshop (ورشة عمل تطبيقية تفاعلية)',
    fitRationale: `أسرع وسيلة لاختبار رغبة الجمهور في الدفع واكتشاف لغتهم الحقيقية في الشراء قبل تسجيل أي محتوى.`,
    biggestRisk: 'الحاجة لتسويق حدث مباشر في موعد محدد والتأكد من توفر جمهور مهتم بالحضور التفاعلي.',
    strongestEvidence: answers.repeatedQuestions ? `تكرار سؤال الناس لك حول: ${answers.repeatedQuestions}` : 'الاهتمام المتكرر بالموضوع',
    missingEvidence: 'تأكيد استعداد 5 إلى 10 أشخاص لحجز مقاعد مدفوعة في توقيت محدد.',
    easiestValidationTest: 'فتح باب الحجز المبكر لـ 10 مقاعد فقط بالسعر التجريبي قبل إعداد شرائح الورشة.',
    source: 'rules_fallback',
  };

  // Candidate 3: Playbook / Cohort
  const isHighTouch = answers.scalabilityPreference === 'high_touch_premium' || answers.availableWeeklyHours !== 'under_5';
  const candidate3: DiscoveredCandidate = {
    id: isHighTouch ? 'cand-cohort' : 'cand-playbook',
    title: isHighTouch
      ? `معسكر تطبيقي مكثف (Implementation Sprint): احتراف ${domain}`
      : `دليل استراتيجي مدمج وخارطة طريق (Actionable Playbook) لـ ${domain}`,
    targetAudience: target,
    coreProblem: `التشتت بين المصادر المجانية وغياب خطة واضحة ومترابطة تقود خطوة بخطوة للنتيجة المطلوبة.`,
    desiredTransformation: `الانتقال من مرحلة التخبط إلى تطبيق خطة متكاملة لـ ${results} بثقة واستقلالية.`,
    possibleFormat: isHighTouch
      ? 'Intensive Cohort / Sprint (معسكر تطبيقي مع مراجعات)'
      : 'Actionable Playbook & Framework (دليل عملي وخرائط سير)',
    fitRationale: isHighTouch
      ? `يستفيد من قدرتك على المتابعة ويسعّر بقيمة أعلى، وهو مدخل لاختبار تحويل الاستشارات لبرنامج جماعي.`
      : `منتج معرفي مركّز وسريع الاستهلاك يدعم سلطتك المعرفية ويرفع مستوى ثقة المشترين في عرضك القادم.`,
    biggestRisk: isHighTouch
      ? 'استهلاك وقت إشراف شخصي ملحوظ في مراجعة مهام المشتركين.'
      : 'صعوبة إبراز القيمة العالية للدليل المكتوب إذا لم يكن مخصصًا لمشكلة ذات أثر مالي مباشر.',
    strongestEvidence: answers.credibleResultsCreated ? `سجل النتائج السابقة: ${answers.credibleResultsCreated}` : 'القدرة على تحقيق النتيجة',
    missingEvidence: 'معرفة مدى رغبة العميل في التعلم الذاتي مقابل حاجته لمتابعة لصيقة.',
    easiestValidationTest: 'مشاركة مسودة فهرس الدليل أو المعسكر مع 3 من المهتمين لقياس مدى حماسهم للتطبيق.',
    source: 'rules_fallback',
  };

  return [candidate1, candidate2, candidate3];
}

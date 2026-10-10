import React, { useState, useEffect } from 'react';
import {
  UserPath,
  QuestionnaireAnswers,
  StrategicReport,
  IdeaDiscoveryAnswers,
  DiscoveredCandidate,
  AiStrategicInterpretation,
} from './types';
import { analyzeOpportunity } from './data/strategicEngine';
import { queryStructuredAiInterpretation, computeAiInputFingerprint } from './services/aiService';
import { trackEvent } from './services/analytics';
import { BrandHeader } from './components/BrandHeader';
import { HeroSection } from './components/HeroSection';
import { PathSelector } from './components/PathSelector';
import { IdeaDiscoveryWizard } from './components/IdeaDiscoveryWizard';
import { StrategicQuestionnaire } from './components/StrategicQuestionnaire';
import { AnalysisLoadingView, RealAnalysisStage } from './components/AnalysisLoadingView';
import { ScoreDashboard } from './components/ScoreDashboard';
import { ExecutiveDiagnosis } from './components/ExecutiveDiagnosis';
import { AssumptionMatrix } from './components/AssumptionMatrix';
import { ProductFormatCard } from './components/ProductFormatCard';
import { ProductConceptDraft } from './components/ProductConceptDraft';
import { PositioningStatementCard } from './components/PositioningStatementCard';
import { MvpRecommendationCard } from './components/MvpRecommendationCard';
import { ValidationSprintView } from './components/ValidationSprintView';
import { DiscoveryQuestionsCard } from './components/DiscoveryQuestionsCard';
import { StopGoRulesCard } from './components/StopGoRulesCard';
import { WhatNotToDoCard } from './components/WhatNotToDoCard';
import { MissingDataCard } from './components/MissingDataCard';
import { LeadCaptureCard } from './components/LeadCaptureCard';
import { PrintableReportView } from './components/PrintableReportView';
import { ShareCardModal } from './components/ShareCardModal';
import { InteractiveRecalculate } from './components/InteractiveRecalculate';
import { LegalModals } from './components/LegalModals';
import { BrandFooter } from './components/BrandFooter';
import { HypothesisReviewStep } from './components/HypothesisReviewStep';
import { AiStrategicInsight, isValidAiInterpretation } from './components/AiStrategicInsight';
import { Sliders, ArrowLeft, RotateCcw, Share2, Printer, Sparkles, AlertCircle } from 'lucide-react';

type AppStep =
  | 'landing'
  | 'path_select'
  | 'idea_discovery'
  | 'hypothesis_review'
  | 'questionnaire'
  | 'analyzing'
  | 'report';

interface AutosaveDraft {
  answers: QuestionnaireAnswers;
  currentSection: number;
  selectedPath: UserPath;
  timestamp: number;
}

export default function App() {
  const [step, setStep] = useState<AppStep>('landing');
  const [selectedPath, setSelectedPath] = useState<UserPath | null>(null);
  const [discoveredCandidate, setDiscoveredCandidate] = useState<DiscoveredCandidate | null>(null);
  const [discoveryAnswers, setDiscoveryAnswers] = useState<IdeaDiscoveryAnswers | null>(null);
  const [questionnaireDraft, setQuestionnaireDraft] = useState<Partial<QuestionnaireAnswers>>({});
  const [currentSectionIndex, setCurrentSectionIndex] = useState<number>(0);
  const [activeReport, setActiveReport] = useState<StrategicReport | null>(null);

  // Per-Report Unlock Management (Requirement #6)
  const [unlockedReportIds, setUnlockedReportIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('ma_unlocked_reports') || '[]');
    } catch {
      return [];
    }
  });

  // Real Loading Stage (Requirement #5)
  const [analysisStage, setAnalysisStage] = useState<RealAnalysisStage>('deterministic_scoring');

  // Cache and race-condition refs for AI interpretations
  const aiInterpretationCacheRef = React.useRef<Map<string, AiStrategicInterpretation>>(new Map());
  const recalculateSequenceRef = React.useRef<number>(0);
  const latestTargetFingerprintRef = React.useRef<string>('');

  // Autosave resume prompt (Requirement #15)
  const [pendingResumeDraft, setPendingResumeDraft] = useState<AutosaveDraft | null>(null);

  // Modals
  const [showPrintView, setShowPrintView] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [showSimulator, setShowSimulator] = useState<boolean>(false);
  const [legalModalType, setLegalModalType] = useState<'privacy' | 'terms' | null>(null);

  // Check autosave on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ma_analyzer_draft');
      if (saved) {
        const parsed = JSON.parse(saved) as AutosaveDraft;
        // If saved within the last 7 days and has content
        if (parsed && parsed.answers && parsed.timestamp && Date.now() - parsed.timestamp < 7 * 86400000) {
          setPendingResumeDraft(parsed);
        }
      }
    } catch (e) {
      // ignore
    }
    trackEvent('tool_started', { entry_point: 'landing' });
  }, []);

  const isCurrentReportUnlocked = Boolean(
    activeReport && unlockedReportIds.includes(activeReport.id)
  );

  // Resume unfinished analysis
  const handleResumeAnalysis = () => {
    if (!pendingResumeDraft) return;
    setSelectedPath(pendingResumeDraft.selectedPath);
    setQuestionnaireDraft(pendingResumeDraft.answers);
    setCurrentSectionIndex(pendingResumeDraft.currentSection || 0);
    setPendingResumeDraft(null);
    setStep('questionnaire');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDismissResume = () => {
    try {
      localStorage.removeItem('ma_analyzer_draft');
    } catch (e) {}
    setPendingResumeDraft(null);
  };

  // 1. Start from Landing
  const handleStart = () => {
    setStep('path_select');
    trackEvent('tool_started', { action: 'start_clicked' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 2. Select Path
  const handleSelectPath = (path: UserPath) => {
    setSelectedPath(path);
    trackEvent('path_selected', { path });
  };

  const handleProceedPath = () => {
    if (!selectedPath) return;

    if (selectedPath === 'expert_no_idea' || selectedPath === 'multiple_ideas') {
      setStep('idea_discovery');
    } else {
      setQuestionnaireDraft({
        fieldProvenance: {
          productTitle: 'user_explicit',
          targetBuyer: 'user_explicit',
          coreProblem: 'user_explicit',
          desiredTransformation: 'user_explicit',
          uniqueMethod: 'user_explicit',
          demandEvidence: 'user_explicit',
          qualification: 'user_explicit',
        },
      });
      setStep('questionnaire');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 3. Candidate selected from Idea Discovery -> Review Hypotheses first (Requirement #2)
  const handleCandidateSelected = (
    candidate: DiscoveredCandidate,
    discovery: IdeaDiscoveryAnswers
  ) => {
    setDiscoveredCandidate(candidate);
    setDiscoveryAnswers(discovery);
    setStep('hypothesis_review');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 3b. Confirm Hypotheses after explicit user audit (Zero invented facts, Zero fake method)
  const handleConfirmHypotheses = (confirmed: {
    workingTitle: string;
    targetBuyer: string;
    coreProblem: string;
    desiredTransformation: string;
    productDirection: string;
    uniqueMethodType: 'proprietary_framework' | 'general_skills_only' | 'developing_now' | 'not_selected';
    uniqueMethodOrProcess: string;
  }) => {
    setQuestionnaireDraft({
      productNameOrWorkingTitle: confirmed.workingTitle,
      expertiseDomain: discoveryAnswers?.expertiseArea || '',
      yearsOfExperience: discoveryAnswers?.yearsOfExperience || '',
      targetBuyerDescription: confirmed.targetBuyer,
      coreProblemDescription: confirmed.coreProblem,
      beforeState: '',
      afterState: confirmed.desiredTransformation,
      uniqueMethodType: confirmed.uniqueMethodType,
      uniqueMethodOrProcess: confirmed.uniqueMethodOrProcess,
      // Zero biased defaults or cross-concept inferences (Requirements #1 & #2)
      creatorTimePerCustomer: 'not_selected',
      audienceAccessLevel: 'not_selected',
      // Strict integrity: Evidence is NEVER assumed from discovery
      qualificationEvidence: [],
      demandEvidenceList: [],
      fieldProvenance: {
        productTitle: 'confirmed_by_user',
        targetBuyer: 'confirmed_by_user',
        coreProblem: 'confirmed_by_user',
        desiredTransformation: 'confirmed_by_user',
        uniqueMethod:
          confirmed.uniqueMethodType === 'proprietary_framework' ? 'confirmed_by_user' : 'user_explicit',
        demandEvidence: 'user_explicit',
        qualification: 'user_explicit',
      },
      hasConfirmedHypotheses: true,
    });
    setStep('questionnaire');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 4. Submit Questionnaire -> Real Multi-Stage Analysis (Requirement #3, #4, #5)
  const handleQuestionnaireSubmit = async (answers: QuestionnaireAnswers) => {
    setQuestionnaireDraft(answers);
    setStep('analyzing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    trackEvent('analysis_requested');

    try {
      // Stage 1: Deterministic numerical scoring
      setAnalysisStage('deterministic_scoring');
      await new Promise((r) => setTimeout(r, 150));

      // Stage 2: Gaps and contradiction mapping
      setAnalysisStage('detecting_gaps');
      const deterministicCore = analyzeOpportunity(answers, null);

      // Stage 3: Real AI Strategic Interpretation Request
      setAnalysisStage('requesting_ai');
      const aiInterpretation = await queryStructuredAiInterpretation(
        deterministicCore,
        answers
      );

      // Stage 4: Merging verified analysis
      setAnalysisStage('merging_report');
      const inputFingerprint = computeAiInputFingerprint(answers);
      const hasValidAi = aiInterpretation && isValidAiInterpretation(aiInterpretation);

      if (hasValidAi) {
        aiInterpretationCacheRef.current.set(inputFingerprint, aiInterpretation);
      }

      const finalReport = analyzeOpportunity(answers, hasValidAi ? aiInterpretation : null, {
        aiFingerprint: hasValidAi ? inputFingerprint : undefined,
      });

      // Stage 5: Finalize
      setAnalysisStage('finalizing');
      await new Promise((r) => setTimeout(r, 100));

      setActiveReport(finalReport);
      setStep('report');
      window.scrollTo({ top: 0, behavior: 'smooth' });

      trackEvent('analysis_completed', {
        opportunity_score: finalReport.opportunityScore,
        confidence_score: finalReport.confidenceScore,
        analysis_mode: finalReport.analysisMode,
      });
      trackEvent('analysis_mode', { mode: finalReport.analysisMode });
      trackEvent('report_viewed', { report_id: finalReport.id });
    } catch (err) {
      // Fail-safe: Always deliver deterministic report if anything fails
      const fallbackReport = analyzeOpportunity(answers, null);
      setActiveReport(fallbackReport);
      setStep('report');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 5. Unlock Report upon valid lead submission (Per-report basis)
  const handleReportUnlocked = (reportId: string) => {
    const updated = [...unlockedReportIds, reportId];
    setUnlockedReportIds(updated);
    try {
      localStorage.setItem('ma_unlocked_reports', JSON.stringify(updated));
    } catch (e) {}
    trackEvent('report_unlocked', { report_id: reportId });
  };

  // 6. Recalculate Scenario update with Stale AI Invalidation and Race-Condition Protection
  const handleUpdateAnswers = (updatedAnswers: QuestionnaireAnswers) => {
    if (!activeReport) return;

    setQuestionnaireDraft(updatedAnswers);
    const newFingerprint = computeAiInputFingerprint(updatedAnswers);
    const prevFingerprint = activeReport.aiFingerprint;

    // 1. If AI-relevant inputs haven't changed and existing AI is valid, keep it
    if (
      prevFingerprint &&
      prevFingerprint === newFingerprint &&
      activeReport.aiInterpretation &&
      isValidAiInterpretation(activeReport.aiInterpretation)
    ) {
      const retainedReport = analyzeOpportunity(updatedAnswers, activeReport.aiInterpretation, {
        reportId: activeReport.id,
        createdAt: activeReport.createdAt,
        aiFingerprint: newFingerprint,
      });
      setActiveReport(retainedReport);
      return;
    }

    // 2. If we have a cached AI interpretation that exactly matches this new input fingerprint, reuse it safely
    const cachedMatchingAi = aiInterpretationCacheRef.current.get(newFingerprint);
    if (cachedMatchingAi && isValidAiInterpretation(cachedMatchingAi)) {
      const cachedReport = analyzeOpportunity(updatedAnswers, cachedMatchingAi, {
        reportId: activeReport.id,
        createdAt: activeReport.createdAt,
        aiFingerprint: newFingerprint,
      });
      setActiveReport(cachedReport);
      return;
    }

    // 3. Stale AI Invalidation:
    // When inputs change, immediately invalidate previous AI interpretation and display
    // authoritative deterministic report with zero delay.
    const immediateDeterministicReport = analyzeOpportunity(updatedAnswers, null, {
      reportId: activeReport.id,
      createdAt: activeReport.createdAt,
      isAiRecalculating: true,
    });
    setActiveReport(immediateDeterministicReport);

    // 4. Race-condition protection: increment sequence ID and record target fingerprint
    const sequenceId = ++recalculateSequenceRef.current;
    latestTargetFingerprintRef.current = newFingerprint;

    // 5. Request fresh AI interpretation asynchronously in background
    (async () => {
      try {
        const freshAiInterpretation = await queryStructuredAiInterpretation(
          immediateDeterministicReport,
          updatedAnswers
        );

        // Discard stale or mismatched responses (race-condition protection)
        if (recalculateSequenceRef.current !== sequenceId) {
          return;
        }
        if (latestTargetFingerprintRef.current !== newFingerprint) {
          return;
        }

        if (freshAiInterpretation && isValidAiInterpretation(freshAiInterpretation)) {
          aiInterpretationCacheRef.current.set(newFingerprint, freshAiInterpretation);

          setActiveReport((prev) => {
            if (!prev || prev.id !== activeReport.id) return prev;
            return analyzeOpportunity(updatedAnswers, freshAiInterpretation, {
              reportId: activeReport.id,
              createdAt: activeReport.createdAt,
              aiFingerprint: newFingerprint,
              isAiRecalculating: false,
            });
          });
        } else {
          setActiveReport((prev) => {
            if (!prev || prev.id !== activeReport.id) return prev;
            return {
              ...prev,
              isAiRecalculating: false,
              analysisMode: 'rules_only',
              aiInterpretation: undefined,
              aiFingerprint: undefined,
            };
          });
        }
      } catch (err) {
        setActiveReport((prev) => {
          if (!prev || prev.id !== activeReport.id) return prev;
          return {
            ...prev,
            isAiRecalculating: false,
            analysisMode: 'rules_only',
            aiInterpretation: undefined,
            aiFingerprint: undefined,
          };
        });
      }
    })();
  };

  // Reset to landing
  const handleReset = () => {
    if (window.confirm('هل تريد بدء تحليل جديد ومسح البيانات الحالية؟')) {
      setActiveReport(null);
      setSelectedPath(null);
      setQuestionnaireDraft({});
      setCurrentSectionIndex(0);
      try {
        localStorage.removeItem('ma_analyzer_draft');
      } catch (e) {}
      setStep('landing');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#040405] text-[#FCFCFA] flex flex-col font-['Cairo',sans-serif] selection:bg-[#F5BF1E]/30 selection:text-[#FBD052]">
      {/* Brand Header: Print is strictly hidden if current report is not unlocked (Requirement #6) */}
      <BrandHeader
        onReset={handleReset}
        onPrint={isCurrentReportUnlocked ? () => setShowPrintView(true) : undefined}
        onShare={() => setShowShareModal(true)}
        hasReport={step === 'report' && Boolean(activeReport)}
      />

      {/* Main Container */}
      <main className="flex-1">
        {/* Autosave Resume Notification Banner (Requirement #15) */}
        {pendingResumeDraft && step === 'landing' && (
          <div className="bg-[#23170D] border-b border-[#F5BF1E]/40 px-4 py-3 text-right">
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-[#FCFCFA]">
                <AlertCircle className="w-4 h-4 text-[#F5BF1E] shrink-0" />
                <span>
                  <strong>عندك تحليل غير مكتمل — تحب تكمل من آخر نقطة؟</strong> (تم الحفظ تلقائيًا)
                </span>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={handleResumeAnalysis}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#F5BF1E] text-[#040405] hover:brightness-105 transition-colors cursor-pointer"
                >
                  كمل التحليل
                </button>
                <button
                  onClick={handleDismissResume}
                  className="px-3 py-1.5 rounded-lg text-xs text-[#797979] hover:text-[#FCFCFA] transition-colors cursor-pointer"
                >
                  ابدأ تحليل جديد
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'landing' && <HeroSection onStart={handleStart} />}

        {step === 'path_select' && (
          <PathSelector
            selectedPath={selectedPath}
            onSelectPath={handleSelectPath}
            onProceed={handleProceedPath}
          />
        )}

        {step === 'idea_discovery' && (
          <IdeaDiscoveryWizard
            onSelectCandidate={handleCandidateSelected}
            onBack={() => setStep('path_select')}
          />
        )}

        {step === 'hypothesis_review' && discoveredCandidate && discoveryAnswers && (
          <HypothesisReviewStep
            candidate={discoveredCandidate}
            discoveryAnswers={discoveryAnswers}
            isAiGenerated={discoveredCandidate.source === 'ai_generated'}
            onConfirm={handleConfirmHypotheses}
            onBackToSuggestions={() => setStep('idea_discovery')}
          />
        )}

        {step === 'questionnaire' && (
          <StrategicQuestionnaire
            userPath={selectedPath || 'specific_idea'}
            initialAnswers={questionnaireDraft}
            savedSection={currentSectionIndex}
            onSubmit={handleQuestionnaireSubmit}
            onBackToPath={() => setStep('path_select')}
          />
        )}

        {step === 'analyzing' && (
          <AnalysisLoadingView stage={analysisStage} />
        )}

        {step === 'report' && activeReport && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
            {/* Report Top Meta & Scenario Simulator Trigger */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#23170D]/40 border border-[#4A2F15]/40 rounded-2xl p-4 text-right">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs text-[#A7690C] font-semibold">
                    تقرير التقييم الاستراتيجي · رقم {activeReport.id}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full border border-[#4A2F15] bg-[#040405] text-[#C8C5BA] inline-flex items-center gap-1.5">
                    {activeReport.isAiRecalculating ? (
                      <>
                        <Sparkles className="w-3 h-3 text-[#F5BF1E] animate-spin" />
                        <span>جاري تحديث الرؤية الذكية...</span>
                      </>
                    ) : activeReport.analysisMode === 'hybrid_ai' ? (
                      'تحليل هجين معزز بالذكاء الاستراتيجي'
                    ) : (
                      'تحليل قطعي مبني على القواعد'
                    )}
                  </span>
                </div>
                <h2 className="font-heading font-bold text-base sm:text-lg text-[#FCFCFA]">
                  {activeReport.answers.productNameOrWorkingTitle || 'فرصة المنتج الرقمي المقترح'}
                </h2>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                {isCurrentReportUnlocked && (
                  <button
                    onClick={() => setShowSimulator(true)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#23170D] border border-[#F5BF1E]/40 text-[#F5BF1E] hover:bg-[#23170D]/80 transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="تعديل الفرضيات واختبار السيناريوهات"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>محاكاة السيناريوهات</span>
                  </button>
                )}

                <button
                  onClick={() => setShowShareModal(true)}
                  className="p-2 rounded-xl text-xs bg-[#040405] border border-[#4A2F15] text-[#C8C5BA] hover:text-[#FCFCFA] transition-colors cursor-pointer"
                  title="مشاركة بطاقة النتيجة"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>

                {isCurrentReportUnlocked && (
                  <button
                    onClick={() => {
                      setShowPrintView(true);
                      trackEvent('report_downloaded', { report_id: activeReport.id });
                    }}
                    className="p-2 rounded-xl text-xs bg-[#040405] border border-[#4A2F15] text-[#C8C5BA] hover:text-[#FCFCFA] transition-colors cursor-pointer"
                    title="طباعة التقرير / PDF"
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* VALUE FIRST: ALWAYS VISIBLE BEFORE LEAD CAPTURE (Requirement #6) */}
            {/* 1. Opportunity & Confidence Scores */}
            <ScoreDashboard report={activeReport} />

            {/* 2. Executive Diagnosis in 60s */}
            <ExecutiveDiagnosis diagnosis={activeReport.executiveDiagnosis} />

            {/* 3. Lead Capture Gate (Unlocks the rest of the report for this specific report ID) */}
            <LeadCaptureCard
              report={activeReport}
              isUnlocked={isCurrentReportUnlocked}
              onUnlocked={() => handleReportUnlocked(activeReport.id)}
              onPrint={() => {
                setShowPrintView(true);
                trackEvent('report_downloaded', { report_id: activeReport.id });
              }}
            />

            {/* FULL STRATEGIC SECTIONS: STRICTLY HIDDEN UNTIL UNLOCKED (Requirement #6) */}
            {isCurrentReportUnlocked ? (
              <div className="space-y-8 pt-4">
                {/* AI Strategic Insight (Rendered strictly when hybrid_ai mode and valid interpretation exist) */}
                {activeReport.analysisMode === 'hybrid_ai' &&
                  isValidAiInterpretation(activeReport.aiInterpretation) && (
                    <AiStrategicInsight interpretation={activeReport.aiInterpretation} />
                  )}

                {/* 4. Assumption Matrix */}
                <AssumptionMatrix assumptions={activeReport.assumptionMap} />

                {/* 5. Product Format Recommender */}
                <ProductFormatCard
                  primary={activeReport.formatRecommendation.primary}
                  secondary={activeReport.formatRecommendation.secondary}
                  avoid={activeReport.formatRecommendation.avoid}
                />

                {/* 6. Product Concept Draft */}
                <ProductConceptDraft concept={activeReport.productConcept} />

                {/* 7. Positioning Statement */}
                <PositioningStatementCard positioning={activeReport.positioning} />

                {/* 8. MVP Recommendation */}
                <MvpRecommendationCard mvp={activeReport.mvp} />

                {/* 9. 7-Day Validation Sprint */}
                <ValidationSprintView
                  sprint={activeReport.validationSprint}
                  sprintModeLabelAr={activeReport.sprintModeLabelAr}
                />

                {/* 10. 7 Customer Discovery Questions */}
                <DiscoveryQuestionsCard questions={activeReport.discoveryQuestions} />

                {/* 11. Stop / Go Rules */}
                <StopGoRulesCard rules={activeReport.stopGoRules} />

                {/* 12. What NOT To Do */}
                <WhatNotToDoCard items={activeReport.whatNotToDo} />

                {/* 13. Missing Data & Next 3 Questions */}
                <MissingDataCard
                  missingData={activeReport.missingData}
                  nextThreeQuestions={activeReport.nextThreeQuestions}
                />

                {/* 14. Personalized Next Step Box */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-[#23170D] to-[#040405] border border-[#F5BF1E]/50 text-right space-y-4 shadow-xl">
                  <div>
                    <span className="text-xs text-[#F5BF1E] font-medium tracking-wide">
                      التوجيه الاستشاري الحاسم
                    </span>
                    <h3 className="font-heading font-bold text-lg sm:text-xl text-[#FCFCFA] mt-1 mb-1">
                      {activeReport.personalizedNextStep.headlineAr}
                    </h3>
                    <p className="text-xs text-[#C8C5BA] leading-relaxed">
                      {activeReport.personalizedNextStep.subtextAr}
                    </p>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                    <button
                      onClick={() => {
                        window.scrollTo({ top: 800, behavior: 'smooth' });
                        trackEvent('cta_clicked', { target: activeReport.personalizedNextStep.targetModule });
                      }}
                      className="w-full sm:w-auto px-7 py-3 rounded-xl font-heading font-bold text-xs sm:text-sm bg-[#F5BF1E] text-[#040405] hover:brightness-105 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#F5BF1E]/10"
                    >
                      <span>{activeReport.personalizedNextStep.buttonLabelAr}</span>
                      <ArrowLeft className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        setShowPrintView(true);
                        trackEvent('report_downloaded', { report_id: activeReport.id });
                      }}
                      className="w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-semibold bg-[#040405] border border-[#4A2F15] text-[#FCFCFA] hover:border-[#F5BF1E] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#F5BF1E]" />
                      <span>حفظ كملف استراتيجي PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </main>

      {/* Brand Footer */}
      <BrandFooter
        onOpenPrivacy={() => setLegalModalType('privacy')}
        onOpenTerms={() => setLegalModalType('terms')}
      />

      {/* Modals */}
      {showPrintView && activeReport && isCurrentReportUnlocked && (
        <PrintableReportView
          report={activeReport}
          onClose={() => setShowPrintView(false)}
        />
      )}

      {showShareModal && activeReport && (
        <ShareCardModal
          report={activeReport}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {showSimulator && activeReport && isCurrentReportUnlocked && (
        <InteractiveRecalculate
          answers={activeReport.answers}
          onUpdateAnswers={handleUpdateAnswers}
          onClose={() => setShowSimulator(false)}
        />
      )}

      <LegalModals
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
      />
    </div>
  );
}

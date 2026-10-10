import { QuestionnaireAnswers, AiStrategicInterpretation, StrategicReport } from '../types';
import { analyzeOpportunity } from '../data/strategicEngine';
import { computeAiInputFingerprint, isValidAiInterpretation } from './aiService';

export interface CoordinatorState {
  activeReport: StrategicReport | null;
  step: 'landing' | 'path_select' | 'idea_discovery' | 'hypothesis_review' | 'questionnaire' | 'analyzing' | 'report';
  selectedPath: string | null;
  questionnaireDraft: Partial<QuestionnaireAnswers>;
}

export type AiFetcher = (
  deterministicCore: StrategicReport,
  answers: QuestionnaireAnswers
) => Promise<AiStrategicInterpretation | null>;

/**
 * Creates an instance of the request coordination controller matching App.tsx logic.
 * This encapsulates the activeAnalysisSessionIdRef, recalculateSequenceRef,
 * latestTargetFingerprintRef, latestTargetReportIdRef, and aiInterpretationCacheRef.
 */
export function createAnalysisCoordinator(initialState?: Partial<CoordinatorState>) {
  let state: CoordinatorState = {
    activeReport: null,
    step: 'landing',
    selectedPath: null,
    questionnaireDraft: {},
    ...initialState,
  };

  const aiInterpretationCache = new Map<string, AiStrategicInterpretation>();
  let recalculateSequence = 0;
  let latestTargetFingerprint = '';
  let latestTargetReportId = '';
  let activeAnalysisSessionId = 0;

  const invalidatePendingAiRequests = () => {
    recalculateSequence++;
    activeAnalysisSessionId++;
    latestTargetFingerprint = '';
    latestTargetReportId = '';
  };

  const getState = (): Readonly<CoordinatorState> => state;
  const getCache = () => aiInterpretationCache;
  const getSessionId = () => activeAnalysisSessionId;
  const getRecalculateSequence = () => recalculateSequence;

  // Navigation handlers
  const handleStart = () => {
    invalidatePendingAiRequests();
    state.step = 'path_select';
  };

  const handleResumeAnalysis = (savedAnswers: QuestionnaireAnswers, path: string) => {
    invalidatePendingAiRequests();
    state.selectedPath = path;
    state.questionnaireDraft = savedAnswers;
    state.step = 'questionnaire';
  };

  const handleReset = () => {
    invalidatePendingAiRequests();
    state.activeReport = null;
    state.selectedPath = null;
    state.questionnaireDraft = {};
    state.step = 'landing';
  };

  // Original Analysis Submission (handleQuestionnaireSubmit)
  const handleQuestionnaireSubmit = async (
    answers: QuestionnaireAnswers,
    aiFetcher: AiFetcher
  ) => {
    invalidatePendingAiRequests();
    const sessionId = activeAnalysisSessionId;
    const initialFingerprint = computeAiInputFingerprint(answers);

    state.questionnaireDraft = answers;
    state.step = 'analyzing';

    try {
      const deterministicCore = analyzeOpportunity(answers, null);

      if (activeAnalysisSessionId !== sessionId) return;

      const aiInterpretation = await aiFetcher(deterministicCore, answers);

      // Async boundary check: if user reset, started another analysis, or superseded this request
      if (activeAnalysisSessionId !== sessionId) return;

      const inputFingerprint = computeAiInputFingerprint(answers);
      if (inputFingerprint !== initialFingerprint) return;

      const hasValidAi = aiInterpretation && isValidAiInterpretation(aiInterpretation);

      if (hasValidAi) {
        aiInterpretationCache.set(inputFingerprint, aiInterpretation);
      }

      const finalReport = analyzeOpportunity(answers, hasValidAi ? aiInterpretation : null, {
        aiFingerprint: hasValidAi ? inputFingerprint : undefined,
      });

      // Final boundary check before state mutation
      if (activeAnalysisSessionId !== sessionId) return;

      state.activeReport = finalReport;
      state.step = 'report';
    } catch (err) {
      if (activeAnalysisSessionId !== sessionId) return;
      const fallbackReport = analyzeOpportunity(answers, null);
      state.activeReport = fallbackReport;
      state.step = 'report';
    }
  };

  // Interactive Recalculation (handleUpdateAnswers)
  const handleUpdateAnswers = (
    updatedAnswers: QuestionnaireAnswers,
    aiFetcher?: AiFetcher
  ) => {
    if (!state.activeReport) return;

    state.questionnaireDraft = updatedAnswers;
    const newFingerprint = computeAiInputFingerprint(updatedAnswers);
    const targetReportId = state.activeReport.id;

    // STEP 1: ALWAYS invalidate any outstanding in-flight AI requests FIRST on EVERY answer-update event
    const sequenceId = ++recalculateSequence;
    latestTargetFingerprint = newFingerprint;
    latestTargetReportId = targetReportId;

    const prevFingerprint = state.activeReport.aiFingerprint;

    // STEP 2: If AI-relevant inputs haven't changed and existing AI is valid, keep it
    if (
      prevFingerprint &&
      prevFingerprint === newFingerprint &&
      state.activeReport.aiInterpretation &&
      isValidAiInterpretation(state.activeReport.aiInterpretation)
    ) {
      const retainedReport = analyzeOpportunity(updatedAnswers, state.activeReport.aiInterpretation, {
        reportId: targetReportId,
        createdAt: state.activeReport.createdAt,
        aiFingerprint: newFingerprint,
        isAiRecalculating: false,
      });
      state.activeReport = retainedReport;
      return;
    }

    // STEP 3: If we have a cached AI interpretation that exactly matches this new input fingerprint, reuse it safely
    const cachedMatchingAi = aiInterpretationCache.get(newFingerprint);
    if (cachedMatchingAi && isValidAiInterpretation(cachedMatchingAi)) {
      const cachedReport = analyzeOpportunity(updatedAnswers, cachedMatchingAi, {
        reportId: targetReportId,
        createdAt: state.activeReport.createdAt,
        aiFingerprint: newFingerprint,
        isAiRecalculating: false,
      });
      state.activeReport = cachedReport;
      return;
    }

    // STEP 4: Stale AI Invalidation: immediate deterministic report
    const immediateDeterministicReport = analyzeOpportunity(updatedAnswers, null, {
      reportId: targetReportId,
      createdAt: state.activeReport.createdAt,
      isAiRecalculating: true,
    });
    state.activeReport = immediateDeterministicReport;

    const isRequestStillCurrent = (current: StrategicReport | null): boolean => {
      if (!current) return false;
      if (current.id !== targetReportId) return false;
      if (recalculateSequence !== sequenceId) return false;
      if (latestTargetFingerprint !== newFingerprint) return false;
      if (latestTargetReportId !== targetReportId) return false;
      if (computeAiInputFingerprint(current.answers) !== newFingerprint) return false;
      return true;
    };

    // STEP 5: Request fresh AI interpretation asynchronously in background
    if (aiFetcher) {
      return (async () => {
        try {
          const freshAiInterpretation = await aiFetcher(
            immediateDeterministicReport,
            updatedAnswers
          );

          if (
            recalculateSequence !== sequenceId ||
            latestTargetFingerprint !== newFingerprint ||
            latestTargetReportId !== targetReportId
          ) {
            return; // Discard stale/superseded response
          }

          if (freshAiInterpretation && isValidAiInterpretation(freshAiInterpretation)) {
            aiInterpretationCache.set(newFingerprint, freshAiInterpretation);

            if (isRequestStillCurrent(state.activeReport)) {
              state.activeReport = analyzeOpportunity(updatedAnswers, freshAiInterpretation, {
                reportId: targetReportId,
                createdAt: state.activeReport.createdAt,
                aiFingerprint: newFingerprint,
                isAiRecalculating: false,
              });
            }
          } else {
            if (isRequestStillCurrent(state.activeReport)) {
              state.activeReport = {
                ...state.activeReport,
                isAiRecalculating: false,
                analysisMode: 'rules_only',
                aiInterpretation: undefined,
                aiFingerprint: undefined,
              };
            }
          }
        } catch (err) {
          if (isRequestStillCurrent(state.activeReport)) {
            state.activeReport = {
              ...state.activeReport,
              isAiRecalculating: false,
              analysisMode: 'rules_only',
              aiInterpretation: undefined,
              aiFingerprint: undefined,
            };
          }
        }
      })();
    }
  };

  return {
    getState,
    getCache,
    getSessionId,
    getRecalculateSequence,
    invalidatePendingAiRequests,
    handleStart,
    handleResumeAnalysis,
    handleReset,
    handleQuestionnaireSubmit,
    handleUpdateAnswers,
  };
}

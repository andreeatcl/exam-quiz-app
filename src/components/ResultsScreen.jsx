import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CORRECT_STREAK_TO_CLEAR,
  formatDuration,
  getGrade,
  useQuiz,
} from "../hooks/useQuiz.js";
import { useStorage } from "../hooks/useStorage.js";

const ResultsScreen = () => {
  const navigate = useNavigate();
  const { session, quitSession } = useQuiz();
  const [animatedScore, setAnimatedScore] = useState(0);
  const [saved, setSaved] = useState(false);
  const [wrongSummary, setWrongSummary] = useState({ added: 0, removed: 0 });

  useEffect(() => {
    if (!session) {
      navigate("/config", { replace: true });
    }
  }, [session, navigate]);

  const scoreData = useMemo(() => {
    if (!session) {
      return null;
    }

    const correct = session.questions.filter((q) => q.isCorrect).length;
    const percentage = Math.round((correct / session.questions.length) * 100);
    const durationSeconds =
      session.timedMode && session.finishedAt
        ? Math.max(
            1,
            Math.floor(
              (new Date(session.finishedAt) - new Date(session.startedAt)) /
                1000,
            ),
          )
        : null;

    return {
      correct,
      percentage,
      durationSeconds,
      grade: getGrade(percentage),
    };
  }, [session]);

  const storage = useStorage(session?.subjectId ?? "drept");

  useEffect(() => {
    if (!session || !scoreData || saved) {
      return;
    }

    const history = storage.getHistory();
    const existingEntry = history.find((entry) => entry.id === session.id);
    if (existingEntry) {
      setWrongSummary(existingEntry.wrongSummary ?? { added: 0, removed: 0 });
      setSaved(true);
      return;
    }
    const wrongPool = storage.getWrong();
    const clearedPool = storage.getCleared();
    const streaks = storage.getStreak();

    let added = 0;
    let removed = 0;

    const updatedWrongPool = [...wrongPool];
    const updatedCleared = [...clearedPool];
    const updatedStreaks = { ...streaks };

    session.questions.forEach((question) => {
      if (!question.isCorrect) {
        if (!updatedWrongPool.includes(question.id)) {
          updatedWrongPool.push(question.id);
          added += 1;
        }
        updatedStreaks[question.id] = 0;
        return;
      }

      if (updatedWrongPool.includes(question.id)) {
        updatedStreaks[question.id] = (updatedStreaks[question.id] ?? 0) + 1;
        if (updatedStreaks[question.id] >= CORRECT_STREAK_TO_CLEAR) {
          const index = updatedWrongPool.indexOf(question.id);
          if (index !== -1) {
            updatedWrongPool.splice(index, 1);
            removed += 1;
          }
          if (!updatedCleared.includes(question.id)) {
            updatedCleared.push(question.id);
          }
        }
      }
    });

    storage.setWrong(updatedWrongPool);
    storage.setCleared(updatedCleared);
    storage.setStreak(updatedStreaks);

    const resultEntry = {
      id: session.id,
      date: new Date().toISOString(),
      subjectId: session.subjectId,
      mode: session.mode,
      questionCount: session.questions.length,
      score: scoreData.correct,
      percentage: scoreData.percentage,
      durationSeconds: scoreData.durationSeconds,
      questions: session.questions.map((question) => ({
        id: question.id,
        question: question.question,
        selectedAnswer:
          question.selectedIndex === null
            ? null
            : question.answers[question.selectedIndex],
        correctAnswer: question.correctAnswer,
        isCorrect: question.isCorrect,
        answers: question.answers,
      })),
      wrongSummary: {
        added,
        removed,
      },
    };

    storage.setHistory([resultEntry, ...history]);
    setWrongSummary({ added, removed });
    setSaved(true);
  }, [session, scoreData, saved, storage]);

  useEffect(() => {
    if (!scoreData) {
      return;
    }

    let start = null;
    const duration = 1000;
    const animate = (timestamp) => {
      if (!start) {
        start = timestamp;
      }
      const progress = Math.min((timestamp - start) / duration, 1);
      setAnimatedScore(Math.floor(progress * scoreData.percentage));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [scoreData]);

  if (!session || !scoreData) {
    return null;
  }

  return (
    <section className="space-y-6 animate-rise">
      <div className="app-surface rounded-3xl p-6 md:p-10">
        <p className="text-xs uppercase tracking-[0.3em] text-muted">
          Rezultat
        </p>
        <div className="mt-6 grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-6xl font-semibold text-white">
              {animatedScore}%
            </p>
            <p className="mt-2 text-sm text-muted">
              {scoreData.correct}/{session.questions.length} corecte
            </p>
            <p className="mt-4 text-lg text-white">
              Nota: {scoreData.grade.letter} - {scoreData.grade.label}
            </p>
            {scoreData.durationSeconds && (
              <p className="mt-2 text-sm text-muted">
                Timp: {formatDuration(scoreData.durationSeconds)}
              </p>
            )}
          </div>
          <div className="app-surface-elevated rounded-2xl px-4 py-4 text-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">
              Wrong pool update
            </p>
            <p className="mt-3 text-white">Adaugate: {wrongSummary.added}</p>
            <p className="text-white">Eliminate: {wrongSummary.removed}</p>
            <p className="mt-4 text-xs text-muted">
              Ai nevoie de {CORRECT_STREAK_TO_CLEAR} raspunsuri corecte
              consecutive pentru a elimina o intrebare.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <button
          type="button"
          onClick={() => navigate("/review", { state: { session } })}
          className="flex-1 rounded-2xl bg-[var(--accent)] px-6 py-4 text-base font-semibold text-white"
        >
          Review answers
        </button>
        <button
          type="button"
          onClick={() => {
            quitSession();
            navigate("/config");
          }}
          className="flex-1 rounded-2xl border border-[var(--border)] px-6 py-4 text-base font-semibold text-white"
        >
          New quiz
        </button>
      </div>
    </section>
  );
};

export default ResultsScreen;

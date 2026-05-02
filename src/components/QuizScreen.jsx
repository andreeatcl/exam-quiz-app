import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuiz } from "../hooks/useQuiz.js";
import { formatDuration } from "../hooks/useQuiz.js";
import { getPrefs } from "../hooks/useStorage.js";

const QuizScreen = () => {
  const navigate = useNavigate();
  const {
    session,
    answerQuestion,
    nextQuestion,
    completeSession,
    quitSession,
  } = useQuiz();
  const [timeLeft, setTimeLeft] = useState(null);
  const prefs = useMemo(() => getPrefs(), []);

  useEffect(() => {
    if (!session) {
      navigate("/config", { replace: true });
      return;
    }

    if (session.timedMode && session.durationSeconds) {
      const startedAt = new Date(session.startedAt).getTime();
      setTimeLeft(session.durationSeconds);
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startedAt) / 1000);
        const remaining = Math.max(session.durationSeconds - elapsed, 0);
        setTimeLeft(remaining);
        if (remaining === 0) {
          completeSession();
          navigate("/results");
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [session, navigate, nextQuestion, completeSession]);

  if (!session) {
    return null;
  }

  const currentQuestion = session.questions[session.currentIndex];
  const total = session.questions.length;
  const answeredCount = session.questions.filter(
    (q) => q.selectedIndex !== null,
  ).length;
  const correctCount = session.questions.filter((q) => q.isCorrect).length;
  const progressPercent = total ? Math.round((answeredCount / total) * 100) : 0;
  const correctPercent = answeredCount
    ? Math.round((correctCount / answeredCount) * 100)
    : 0;
  const reveal = currentQuestion.selectedIndex !== null;
  const timerPercent = session.timedMode
    ? Math.max((timeLeft / session.durationSeconds) * 100, 0)
    : null;

  const handleSelect = useCallback(
    (index) => {
      if (reveal) {
        return;
      }

      answerQuestion(index);

      if (prefs.autoAdvance) {
        setTimeout(() => {
          if (session.currentIndex + 1 >= total) {
            completeSession();
            navigate("/results");
          } else {
            nextQuestion();
          }
        }, 1200);
      }
    },
    [
      reveal,
      answerQuestion,
      prefs.autoAdvance,
      session.currentIndex,
      total,
      nextQuestion,
      navigate,
      completeSession,
    ],
  );

  const handleNext = useCallback(() => {
    if (session.currentIndex + 1 >= total) {
      completeSession();
      navigate("/results");
      return;
    }
    nextQuestion();
  }, [session.currentIndex, total, completeSession, navigate, nextQuestion]);

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key >= "1" && event.key <= "4") {
        handleSelect(Number(event.key) - 1);
      }
      if (event.key === "Enter" || event.key === " ") {
        if (reveal) {
          handleNext();
        }
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [reveal, handleSelect, handleNext]);

  const timerClass = session.timedMode
    ? timerPercent <= 10
      ? "text-red-400"
      : timerPercent <= 20
        ? "text-amber-300"
        : "text-white"
    : "";

  return (
    <section className="space-y-6 animate-rise">
      <div className="app-surface rounded-3xl p-4 md:p-6">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            Progres
          </p>
          <div className="text-right">
            {session.timedMode && timeLeft !== null && (
              <p className={`text-xs font-semibold ${timerClass}`}>
                Timp: {formatDuration(timeLeft)}
              </p>
            )}
            <p className="text-sm font-semibold text-white">
              Corecte: {correctCount} / {answeredCount} ({correctPercent}%)
            </p>
          </div>
        </div>
        <div className="mt-3 h-2 w-full rounded-full bg-[#1f2333]">
          <div
            className="h-2 rounded-full bg-[var(--accent)] transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="app-surface rounded-3xl p-6 md:p-10">
        <div className="flex items-center justify-between text-sm text-muted">
          <div className="flex flex-col gap-1">
            <span>Intrebarea {session.currentIndex + 1}</span>
            <span className="text-xs text-muted">Total: {total}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Renunti la sesiune?")) {
                quitSession();
                navigate("/config");
              }
            }}
            className="text-xs uppercase tracking-[0.3em] text-red-300"
          >
            Quit
          </button>
        </div>
        <h2 className="mt-4 text-xl font-semibold text-white md:text-2xl">
          {currentQuestion.question}
        </h2>

        <div className="mt-6 grid gap-4">
          {currentQuestion.answers.map((answer, index) => {
            const isSelected = currentQuestion.selectedIndex === index;
            const isCorrect = currentQuestion.correctIndex === index;
            const isWrong = reveal && isSelected && !isCorrect;
            const isHighlight = reveal && !isSelected && isCorrect;

            return (
              <button
                key={answer}
                type="button"
                onClick={() => handleSelect(index)}
                className={`answer-card rounded-2xl px-4 py-4 text-left text-sm md:text-base ${
                  isSelected && !reveal ? "answer-selected" : ""
                } ${isCorrect && reveal ? "answer-correct" : ""} ${
                  isWrong ? "answer-wrong" : ""
                } ${isHighlight ? "answer-highlight" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <span>{answer}</span>
                  {reveal && isCorrect && (
                    <span className="text-xs uppercase tracking-[0.2em] text-green-200">
                      Corect
                    </span>
                  )}
                  {reveal && isWrong && (
                    <span className="text-xs uppercase tracking-[0.2em] text-red-200">
                      Gresit
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {currentQuestion.explanation && reveal && (
          <div className="app-surface-elevated mt-6 rounded-2xl px-4 py-3 text-sm text-muted">
            {currentQuestion.explanation}
          </div>
        )}

        {reveal && !prefs.autoAdvance && (
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleNext}
              className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white"
            >
              {session.currentIndex + 1 >= total ? "Finalizeaza" : "Urmatoarea"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default QuizScreen;

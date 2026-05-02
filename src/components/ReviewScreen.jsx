import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuiz } from "../hooks/useQuiz.js";
import { useStorage } from "../hooks/useStorage.js";

const TABS = [
  { id: "all", label: "Toate" },
  { id: "correct", label: "Corecte" },
  { id: "incorrect", label: "Gresite" },
];

const ReviewScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { session } = useQuiz();
  const [expanded, setExpanded] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const reviewSession = location.state?.session || session;

  if (!reviewSession) {
    return (
      <section className="app-surface rounded-3xl p-6 md:p-10">
        <h2 className="text-xl font-semibold text-white">
          Nu exista sesiune pentru review.
        </h2>
        <button
          type="button"
          onClick={() => navigate("/history")}
          className="mt-6 rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-white"
        >
          Vezi istoricul
        </button>
      </section>
    );
  }

  const storage = useStorage(reviewSession.subjectId);
  const wrongPool = storage.getWrong();

  const questions = useMemo(() => {
    const base = reviewSession.questions;
    if (activeTab === "correct") {
      return base.filter((question) => question.isCorrect);
    }
    if (activeTab === "incorrect") {
      return base.filter((question) => !question.isCorrect);
    }
    return base;
  }, [activeTab, reviewSession.questions]);

  const handleAddWrong = (questionId) => {
    if (wrongPool.includes(questionId)) {
      return;
    }
    const next = [...wrongPool, questionId];
    storage.setWrong(next);
  };

  return (
    <section className="space-y-6 animate-rise">
      <div className="app-surface rounded-3xl p-6 md:p-10">
        <p className="text-xs uppercase tracking-[0.3em] text-muted">Review</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
                activeTab === tab.id
                  ? "bg-[var(--accent)] text-white"
                  : "app-surface-elevated text-muted"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((question) => (
          <div key={question.id} className="app-surface rounded-3xl p-5 md:p-6">
            <button
              type="button"
              onClick={() =>
                setExpanded(expanded === question.id ? null : question.id)
              }
              className="flex w-full items-start justify-between text-left"
            >
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted">
                  Intrebarea {question.id}
                </p>
                <h3 className="mt-2 text-base font-semibold text-white md:text-lg">
                  {question.question}
                </h3>
              </div>
              <span className="text-xs text-muted">
                {expanded === question.id ? "Inchide" : "Deschide"}
              </span>
            </button>

            {expanded === question.id && (
              <div className="mt-4 space-y-3 text-sm">
                {question.answers.map((answer) => {
                  const selectedAnswer =
                    question.selectedAnswer ??
                    (question.selectedIndex !== null
                      ? question.answers[question.selectedIndex]
                      : null);
                  const isCorrect = answer === question.correctAnswer;
                  const isSelected = answer === selectedAnswer;

                  return (
                    <div
                      key={answer}
                      className={`rounded-2xl border px-4 py-3 ${
                        isCorrect
                          ? "border-green-500/70 bg-green-900/30"
                          : "border-[var(--border)] bg-[#131623]"
                      } ${
                        isSelected && !isCorrect
                          ? "border-red-500/70 bg-red-900/30"
                          : ""
                      }`}
                    >
                      {answer}
                    </div>
                  );
                })}
                <button
                  type="button"
                  onClick={() => handleAddWrong(question.id)}
                  className="rounded-full border border-[var(--border)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-white"
                >
                  Add to wrong pool
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default ReviewScreen;

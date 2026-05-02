import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CORRECT_STREAK_TO_CLEAR, useQuiz } from "../hooks/useQuiz.js";
import { useStorage } from "../hooks/useStorage.js";
import { SUBJECTS } from "../subjects.js";

const WrongAnswersPool = () => {
  const navigate = useNavigate();
  const { subjectId } = useQuiz();
  const storage = useStorage(subjectId);
  const [wrongPool, setWrongPool] = useState(storage.getWrong());
  const streaks = storage.getStreak();

  const questions = useMemo(() => {
    const subject = SUBJECTS[subjectId];
    return subject.questions.filter((question) =>
      wrongPool.includes(question.id),
    );
  }, [subjectId, wrongPool]);

  const handleRemove = (id) => {
    const next = wrongPool.filter((item) => item !== id);
    setWrongPool(next);
    storage.setWrong(next);
  };

  if (wrongPool.length === 0) {
    return (
      <section className="app-surface rounded-3xl p-6 md:p-10">
        <h2 className="text-2xl font-semibold text-white">Wrong pool gol</h2>
        <p className="mt-2 text-muted">
          Nu ai intrebari gresite momentan. Continua cu un quiz nou.
        </p>
        <button
          type="button"
          onClick={() => navigate("/config")}
          className="mt-6 rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white"
        >
          Start quiz
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-6 animate-rise">
      <div className="app-surface rounded-3xl p-6 md:p-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted">
              Wrong Pool
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              {wrongPool.length} intrebari
            </h2>
          </div>
          <button
            type="button"
            onClick={() =>
              navigate("/config", { state: { mode: "wrong-pool" } })
            }
            className="rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-white"
          >
            Quiz from wrong pool
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((question) => (
          <div key={question.id} className="app-surface rounded-3xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted">
                  Intrebarea {question.id}
                </p>
                <h3 className="mt-2 text-base font-semibold text-white">
                  {question.question}
                </h3>
                <p className="mt-2 text-xs text-muted">
                  Streak: {streaks[question.id] ?? 0} /{" "}
                  {CORRECT_STREAK_TO_CLEAR}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(question.id)}
                className="rounded-full border border-[var(--border)] px-3 py-1 text-xs uppercase tracking-[0.2em] text-white"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WrongAnswersPool;

import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuiz } from "../hooks/useQuiz.js";
import { getPrefs, setPrefs, useStorage } from "../hooks/useStorage.js";
import { SUBJECTS } from "../subjects.js";

const QUESTION_OPTIONS = [25, 50, 100, "all"];

const QuizConfig = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { subjectId, startSession } = useQuiz();
  const subject = SUBJECTS[subjectId];
  const storage = useStorage(subjectId);
  const [mode, setMode] = useState("normal");
  const [count, setCount] = useState(25);
  const [customCount, setCustomCount] = useState("25");
  const [timed, setTimed] = useState(false);
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [prefs, setLocalPrefs] = useState(getPrefs());

  const wrongPool = storage.getWrong();
  const history = storage.getHistory();
  const bestScore = history.reduce(
    (acc, item) => (item.percentage > acc ? item.percentage : acc),
    0,
  );

  useEffect(() => {
    if (location.state?.mode === "wrong-pool") {
      setMode("wrong-pool");
    }
  }, [location.state]);

  const totalQuestions = subject.questions.length;
  const questionCountLabel = count === "all" ? totalQuestions : count;
  const canUseWrongPool = wrongPool.length > 0;
  useEffect(() => {
    if (count === "all") {
      setCustomCount("");
      return;
    }
    setCustomCount(String(count));
  }, [count]);

  const stats = useMemo(
    () => [
      { label: "Total intrebari", value: totalQuestions },
      { label: "In pool greseli", value: wrongPool.length },
      { label: "Sesiuni", value: history.length },
      { label: "Best", value: `${bestScore}%` },
    ],
    [totalQuestions, wrongPool.length, history.length, bestScore],
  );

  const handleStart = () => {
    if (mode === "wrong-pool" && !canUseWrongPool) {
      return;
    }

    const selectedIds = mode === "wrong-pool" ? wrongPool : null;
    startSession({
      mode,
      count: count === "all" ? "all" : Number(count),
      timed,
      durationSeconds: durationMinutes * 60,
      questionIds: selectedIds,
    });
    navigate("/quiz");
  };

  const updatePrefs = (next) => {
    setLocalPrefs(next);
    setPrefs(next);
  };

  return (
    <section className="space-y-6 animate-rise">
      <div className="app-surface rounded-3xl p-6 md:p-10">
        <p className="text-xs uppercase tracking-[0.3em] text-muted">Config</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">
          {subject.label} - Setup quiz
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {stats.map((item) => (
            <div
              key={item.label}
              className="app-surface-elevated rounded-2xl px-4 py-3"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-muted">
                {item.label}
              </p>
              <p className="mt-1 text-lg font-semibold text-white">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="app-surface rounded-3xl p-6 md:p-8">
          <h3 className="text-lg font-semibold text-white">Intrebari</h3>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            {QUESTION_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setCount(option)}
                className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  count === option
                    ? "bg-[var(--accent)] text-white"
                    : "app-surface-elevated text-muted hover:text-white"
                }`}
              >
                {option === "all" ? `Toate (${totalQuestions})` : option}
              </button>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <label className="text-xs uppercase tracking-[0.2em] text-muted">
              Custom
            </label>
            <input
              type="number"
              min={1}
              max={totalQuestions}
              value={customCount}
              onChange={(event) => {
                const nextRaw = event.target.value;
                setCustomCount(nextRaw);
                if (nextRaw === "") {
                  return;
                }
                const parsed = Number(nextRaw);
                if (Number.isNaN(parsed)) {
                  return;
                }
                const nextValue = Math.min(Math.max(parsed, 1), totalQuestions);
                setCount(nextValue);
              }}
              onBlur={() => {
                if (customCount === "") {
                  const fallback = count === "all" ? totalQuestions : count;
                  setCustomCount(String(fallback));
                }
              }}
              className="w-28 rounded-xl border border-[var(--border)] bg-[#111420] px-3 py-2 text-sm text-white"
            />
            <span className="text-xs text-muted">max {totalQuestions}</span>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold text-white">Mod</h3>
            <div className="mt-4 grid gap-3">
              <button
                type="button"
                onClick={() => setMode("normal")}
                className={`flex items-center justify-between rounded-2xl px-4 py-3 text-left transition ${
                  mode === "normal"
                    ? "bg-[var(--accent)] text-white"
                    : "app-surface-elevated text-muted hover:text-white"
                }`}
              >
                <span>Normal - aleator din tot setul</span>
                <span className="text-xs">{questionCountLabel} intrebari</span>
              </button>
              <button
                type="button"
                disabled={!canUseWrongPool}
                onClick={() => setMode("wrong-pool")}
                className={`flex items-center justify-between rounded-2xl px-4 py-3 text-left transition ${
                  mode === "wrong-pool"
                    ? "bg-[var(--accent)] text-white"
                    : "app-surface-elevated text-muted hover:text-white"
                } ${!canUseWrongPool ? "cursor-not-allowed opacity-40" : ""}`}
              >
                <span>Wrong pool - doar intrebari gresite</span>
                <span className="text-xs">{wrongPool.length} intrebari</span>
              </button>
              {!canUseWrongPool && (
                <p className="text-xs text-muted">
                  Nu ai inca intrebari in wrong pool.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="app-surface rounded-3xl p-6 md:p-8">
            <h3 className="text-lg font-semibold text-white">Timp</h3>
            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setTimed((prev) => !prev)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  timed
                    ? "bg-[var(--amber)] text-white"
                    : "app-surface-elevated text-muted hover:text-white"
                }`}
              >
                {timed ? "Timed mode activ" : "Timed mode inactiv"}
              </button>
              <div className="text-sm text-muted">
                {timed ? `${durationMinutes} min` : "Fara timp"}
              </div>
            </div>
            {timed && (
              <input
                type="range"
                min={10}
                max={120}
                step={5}
                value={durationMinutes}
                onChange={(event) =>
                  setDurationMinutes(Number(event.target.value))
                }
                className="mt-4 w-full accent-[var(--amber)]"
              />
            )}
          </div>

          <div className="app-surface rounded-3xl p-6 md:p-8">
            <h3 className="text-lg font-semibold text-white">Preferinte</h3>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Auto-advance</p>
                <p className="text-xs text-muted">
                  Treci automat la urmatoarea intrebare.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  updatePrefs({
                    ...prefs,
                    autoAdvance: !prefs.autoAdvance,
                  })
                }
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                  prefs.autoAdvance
                    ? "bg-[var(--accent)] text-white"
                    : "app-surface-elevated text-muted hover:text-white"
                }`}
              >
                {prefs.autoAdvance ? "On" : "Off"}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleStart}
            className="w-full rounded-2xl bg-[var(--accent)] px-6 py-4 text-base font-semibold text-white shadow-glow transition hover:brightness-110"
          >
            Start quiz
          </button>
        </div>
      </div>
    </section>
  );
};

export default QuizConfig;

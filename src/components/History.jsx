import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuiz } from "../hooks/useQuiz.js";
import { formatDuration, getGrade } from "../hooks/useQuiz.js";
import { useStorage } from "../hooks/useStorage.js";
import { SUBJECTS } from "../subjects.js";

const History = () => {
  const navigate = useNavigate();
  const { subjectId } = useQuiz();
  const storage = useStorage(subjectId);
  const [history, setHistory] = useState(storage.getHistory());

  const chartValues = useMemo(() => history.slice(0, 10).reverse(), [history]);

  return (
    <section className="space-y-6 animate-rise">
      <div className="app-surface rounded-3xl p-6 md:p-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted">
              Istoric
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Sesiuni recente
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Stergi istoricul?")) {
                storage.setHistory([]);
                setHistory([]);
              }
            }}
            className="rounded-full border border-[var(--border)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-muted"
          >
            Clear history
          </button>
        </div>

        <div className="mt-6">
          <div className="flex h-32 items-end gap-2">
            {chartValues.map((entry) => (
              <div
                key={entry.id}
                className="flex-1 rounded-full bg-[var(--accent)]/30"
                style={{ height: `${entry.percentage}%` }}
                title={`${entry.percentage}%`}
              />
            ))}
            {chartValues.length === 0 && (
              <p className="text-sm text-muted">Nicio sesiune inca.</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {history.map((entry) => {
          const grade = getGrade(entry.percentage);
          return (
            <button
              key={entry.id}
              type="button"
              onClick={() => navigate("/review", { state: { session: entry } })}
              className="app-surface w-full rounded-3xl p-5 text-left transition hover:-translate-y-1 hover:border-[var(--accent)]"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted">
                    {new Date(entry.date).toLocaleString()}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-white">
                    {SUBJECTS[entry.subjectId]?.label ?? entry.subjectId} -{" "}
                    {entry.mode === "wrong-pool" ? "Wrong Pool" : "Normal"} -{" "}
                    {entry.percentage}%
                  </h3>
                </div>
                <div className="text-sm text-muted">
                  <p>
                    {entry.score}/{entry.questionCount} corecte
                  </p>
                  {entry.durationSeconds && (
                    <p>{formatDuration(entry.durationSeconds)}</p>
                  )}
                  <p>
                    {grade.letter} - {grade.label}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default History;

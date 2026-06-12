import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuiz } from "../hooks/useQuiz.js";
import { useStorage } from "../hooks/useStorage.js";
import { SUBJECTS } from "../subjects.js";

const sortOptions = {
  idAsc: "ID (crescator)",
  idDesc: "ID (descrescator)",
  textAsc: "Text (A-Z)",
  textDesc: "Text (Z-A)",
  viewedAsc: "Vazut (crescator)",
  viewedDesc: "Vazut (descrescator)",
  correctDesc: "Corecte (descrescator)",
  incorrectDesc: "Gresite (descrescator)",
  accuracyDesc: "Procentaj (descrescator)",
  accuracyAsc: "Procentaj (crescator)",
};

const StudyScreen = () => {
  const { subjectId, startSession } = useQuiz();
  const navigate = useNavigate();
  const subject = SUBJECTS[subjectId];
  const [query, setQuery] = useState("");
  const [includeAnswers, setIncludeAnswers] = useState(true);
  const [sortKey, setSortKey] = useState("idAsc");
  const storage = useMemo(() => useStorage(subjectId), [subjectId]);
  const stats = storage.getStats();

  const getStatsForQuestion = (questionId) =>
    stats[questionId] ?? { seen: 0, correct: 0, incorrect: 0 };

  const getAccuracyStyle = (accuracy) => {
    const hue = Math.round((accuracy / 100) * 120);
    return {
      background: `linear-gradient(135deg, hsla(${hue}, 70%, 45%, 0.35), hsla(${hue}, 70%, 25%, 0.35))`,
      borderColor: `hsla(${hue}, 70%, 50%, 0.5)`,
    };
  };

  const questions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    let list = subject.questions;

    if (normalizedQuery) {
      list = list.filter((question) => {
        const inQuestion = question.question
          .toLowerCase()
          .includes(normalizedQuery);
        if (inQuestion) {
          return true;
        }

        if (!includeAnswers) {
          return false;
        }

        return question.answers.some((answer) =>
          answer.text.toLowerCase().includes(normalizedQuery),
        );
      });
    }

    const sorted = [...list];
    const accuracy = (question) => {
      const info = getStatsForQuestion(question.id);
      if (!info.seen) {
        return 0;
      }
      return Math.round((info.correct / info.seen) * 100);
    };

    sorted.sort((a, b) => {
      const statsA = getStatsForQuestion(a.id);
      const statsB = getStatsForQuestion(b.id);
      if (sortKey === "idAsc") {
        return a.id - b.id;
      }
      if (sortKey === "idDesc") {
        return b.id - a.id;
      }
      if (sortKey === "textDesc") {
        return b.question.localeCompare(a.question, "ro", {
          sensitivity: "base",
        });
      }
      if (sortKey === "viewedAsc") {
        return statsA.seen - statsB.seen;
      }
      if (sortKey === "viewedDesc") {
        return statsB.seen - statsA.seen;
      }
      if (sortKey === "correctDesc") {
        return statsB.correct - statsA.correct;
      }
      if (sortKey === "incorrectDesc") {
        return statsB.incorrect - statsA.incorrect;
      }
      if (sortKey === "accuracyAsc") {
        return accuracy(a) - accuracy(b);
      }
      if (sortKey === "accuracyDesc") {
        return accuracy(b) - accuracy(a);
      }
      return a.question.localeCompare(b.question, "ro", {
        sensitivity: "base",
      });
    });

    return sorted;
  }, [subject.questions, query, includeAnswers, sortKey, stats]);

  return (
    <section className="space-y-6 animate-rise">
      <div className="app-surface rounded-3xl p-6 md:p-10">
        <p className="text-xs uppercase tracking-[0.3em] text-muted">Study</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">
          {subject.label} - toate intrebarile
        </h2>
        <p className="mt-2 text-sm text-muted">
          Vezi toate intrebarile cu raspunsurile corecte evidentiate.
        </p>
        <div className="mt-6 grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="app-surface-elevated flex flex-col gap-3 rounded-2xl px-4 py-3">
            <label className="text-xs uppercase tracking-[0.2em] text-muted">
              Cauta
            </label>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cauta in intrebari si raspunsuri"
              className="w-full rounded-xl border border-[var(--border)] bg-[#111420] px-3 py-2 text-sm text-white"
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-muted">
                <input
                  type="checkbox"
                  checked={includeAnswers}
                  onChange={(event) => setIncludeAnswers(event.target.checked)}
                  className="accent-[var(--accent)]"
                />
                Include raspunsuri in cautare
              </label>
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-xs uppercase tracking-[0.2em] text-muted"
              >
                Clear
              </button>
            </div>
          </div>
          <div className="app-surface-elevated flex flex-col gap-3 rounded-2xl px-4 py-3">
            <label className="text-xs uppercase tracking-[0.2em] text-muted">
              Sortare
            </label>
            <select
              value={sortKey}
              onChange={(event) => setSortKey(event.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[#111420] px-3 py-2 text-sm text-white"
            >
              {Object.entries(sortOptions).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted">{questions.length} rezultate</p>
          </div>
        </div>
        {questions.length > 0 && (
          <button
            type="button"
            onClick={() => {
              startSession({
                mode: "filtered",
                count: "all",
                timed: false,
                durationSeconds: null,
                questionIds: questions.map((q) => q.id),
              });
              navigate("/quiz");
            }}
            className="mt-4 w-full rounded-2xl bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:brightness-110"
          >
            Quiz cu cele {questions.length} intrebari filtrate
          </button>
        )}
      </div>

      <div className="space-y-4">
        {questions.length === 0 && (
          <div className="app-surface rounded-3xl p-6 text-sm text-muted">
            Nu exista rezultate pentru filtrul curent.
          </div>
        )}
        {questions.map((question) => (
          <div key={question.id} className="app-surface rounded-3xl p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-muted">
              Intrebarea {question.id}
            </p>
            <h3 className="mt-2 text-base font-semibold text-white">
              {question.question}
            </h3>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              {(() => {
                const info = getStatsForQuestion(question.id);
                const accuracy = info.seen
                  ? Math.round((info.correct / info.seen) * 100)
                  : 0;
                return (
                  <>
                    <span className="chip rounded-full px-3 py-1">
                      Vazut: {info.seen}
                    </span>
                    <span className="chip rounded-full px-3 py-1">
                      Corecte: {info.correct}
                    </span>
                    <span className="chip rounded-full px-3 py-1">
                      Gresite: {info.incorrect}
                    </span>
                    <span
                      className="chip rounded-full border px-3 py-1 text-white"
                      style={getAccuracyStyle(accuracy)}
                    >
                      Procentaj: {accuracy}%
                    </span>
                  </>
                );
              })()}
            </div>
            <div className="mt-4 grid gap-3 text-sm">
              {question.answers.map((answer) => (
                <div
                  key={answer.text}
                  className={`rounded-2xl border px-4 py-3 ${
                    answer.isCorrect
                      ? "border-green-500/70 bg-green-900/30"
                      : "border-[var(--border)] bg-[#131623]"
                  }`}
                >
                  {answer.text}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StudyScreen;

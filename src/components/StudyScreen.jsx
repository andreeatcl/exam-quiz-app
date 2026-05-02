import { useMemo, useState } from "react";
import { useQuiz } from "../hooks/useQuiz.js";
import { SUBJECTS } from "../subjects.js";

const sortOptions = {
  idAsc: "ID (crescator)",
  idDesc: "ID (descrescator)",
  textAsc: "Text (A-Z)",
  textDesc: "Text (Z-A)",
};

const StudyScreen = () => {
  const { subjectId } = useQuiz();
  const subject = SUBJECTS[subjectId];
  const [query, setQuery] = useState("");
  const [includeAnswers, setIncludeAnswers] = useState(true);
  const [sortKey, setSortKey] = useState("idAsc");

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
    sorted.sort((a, b) => {
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
      return a.question.localeCompare(b.question, "ro", {
        sensitivity: "base",
      });
    });

    return sorted;
  }, [subject.questions, query, includeAnswers, sortKey]);

  return (
    <section className="space-y-6 animate-rise">
      <div className="app-surface rounded-3xl p-6 md:p-10">
        <p className="text-xs uppercase tracking-[0.3em] text-muted">Study</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">
          {subject.label} - toate intrebarile
        </h2>
        <p className="mt-2 text-sm text-muted">
          Vezi toate intrebarile cu raspunsurile corecte evidentiated.
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

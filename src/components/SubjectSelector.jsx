import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { SUBJECTS } from "../subjects.js";
import { useQuiz } from "../hooks/useQuiz.js";
import { useStorage } from "../hooks/useStorage.js";

const SubjectCard = ({ subject, onSelect }) => {
  const storage = useStorage(subject.id);
  const history = storage.getHistory();
  const lastSession = history[0];
  const bestScore = history.reduce(
    (acc, item) => (item.percentage > acc ? item.percentage : acc),
    0,
  );

  return (
    <button
      type="button"
      onClick={onSelect}
      className="app-surface w-full rounded-2xl p-6 text-left transition hover:-translate-y-1 hover:border-[var(--accent)]"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            Subject
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">
            {subject.label}
          </h2>
        </div>
        <span className="chip rounded-full px-3 py-1 text-xs">
          {subject.questions.length} intrebari
        </span>
      </div>
      <div className="mt-6 grid gap-3 text-sm text-muted">
        <p>Ultima sesiune: {lastSession?.percentage ?? 0}%</p>
        <p>Cel mai bun scor: {bestScore}%</p>
      </div>
    </button>
  );
};

const SubjectSelector = () => {
  const navigate = useNavigate();
  const { setSubjectId } = useQuiz();
  const subjects = useMemo(() => Object.values(SUBJECTS), []);

  useEffect(() => {
    if (subjects.length === 1) {
      setSubjectId(subjects[0].id);
      navigate("/config", { replace: true });
    }
  }, [subjects, navigate, setSubjectId]);

  if (subjects.length === 1) {
    return null;
  }

  return (
    <section className="space-y-6 animate-rise">
      <div className="app-surface rounded-3xl p-6 md:p-10">
        <h1 className="text-2xl font-semibold text-white md:text-3xl">
          Alege materia
        </h1>
        <p className="mt-2 text-muted">
          Selecteaza un set de intrebari si incepe un nou antrenament.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {subjects.map((subject) => (
          <SubjectCard
            key={subject.id}
            subject={subject}
            onSelect={() => {
              setSubjectId(subject.id);
              navigate("/config");
            }}
          />
        ))}
      </div>
    </section>
  );
};

export default SubjectSelector;

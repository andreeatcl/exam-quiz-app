import { NavLink, Outlet } from "react-router-dom";
import { useQuiz } from "./hooks/useQuiz.js";
import { SUBJECTS } from "./subjects.js";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/config", label: "Quiz" },
  { to: "/study", label: "Study" },
  { to: "/wrong-pool", label: "Wrong Pool" },
  { to: "/history", label: "History" },
];

function App() {
  const { subjectId } = useQuiz();
  const subjectLabel = SUBJECTS[subjectId]?.label ?? "Subject";

  return (
    <div className="min-h-screen text-sm md:text-base">
      <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[#0f1117]/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 md:px-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted">
              Exam Quiz
            </p>
            <h1 className="text-lg font-semibold text-white">{subjectLabel}</h1>
          </div>
          <nav className="hidden gap-4 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-full px-3 py-1.5 text-sm transition ${
                    isActive
                      ? "bg-[var(--accent)] text-white shadow-glow"
                      : "text-muted hover:text-white"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 pb-24 pt-6 md:px-6">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-[var(--border)] bg-[#111420]/95 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-full px-3 py-1 text-xs font-medium transition ${
                  isActive
                    ? "bg-[var(--accent)] text-white"
                    : "text-muted hover:text-white"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default App;

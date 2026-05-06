import dreptCursQuestions from "./data/grile-drept-curs.json";
import dreptSeminarQuestions from "./data/grile-drept-seminar.json";

export const SUBJECTS = {
  "drept-curs": {
    id: "drept-curs",
    label: "Drept (curs)",
    questions: dreptCursQuestions,
    color: "indigo",
  },
  "drept-seminar": {
    id: "drept-seminar",
    label: "Drept (seminar)",
    questions: dreptSeminarQuestions,
    color: "emerald",
  },
};

export const DEFAULT_SUBJECT = "drept-curs";

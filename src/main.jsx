import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createHashRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import SubjectSelector from "./components/SubjectSelector.jsx";
import QuizConfig from "./components/QuizConfig.jsx";
import QuizScreen from "./components/QuizScreen.jsx";
import ResultsScreen from "./components/ResultsScreen.jsx";
import ReviewScreen from "./components/ReviewScreen.jsx";
import History from "./components/History.jsx";
import WrongAnswersPool from "./components/WrongAnswersPool.jsx";
import StudyScreen from "./components/StudyScreen.jsx";
import { QuizProvider } from "./hooks/useQuiz.js";

const router = createHashRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <SubjectSelector /> },
      { path: "config", element: <QuizConfig /> },
      { path: "quiz", element: <QuizScreen /> },
      { path: "results", element: <ResultsScreen /> },
      { path: "review", element: <ReviewScreen /> },
      { path: "history", element: <History /> },
      { path: "wrong-pool", element: <WrongAnswersPool /> },
      { path: "study", element: <StudyScreen /> },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QuizProvider>
      <RouterProvider router={router} />
    </QuizProvider>
  </StrictMode>,
);

import React, { createContext, useContext, useMemo, useState } from "react";
import { DEFAULT_SUBJECT, SUBJECTS } from "../subjects.js";

export const CORRECT_STREAK_TO_CLEAR = 2;

const QuizContext = createContext(null);

const shuffle = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const buildSessionQuestions = ({ questions, count }) => {
  const shuffledPool = shuffle(questions);
  const picked = count === "all" ? shuffledPool : shuffledPool.slice(0, count);

  return picked.map((question) => {
    const answers = question.answers.map((answer) => answer.text);
    const correctAnswer = question.answers.find(
      (answer) => answer.isCorrect,
    )?.text;
    const shuffledAnswers = shuffle(answers);
    const correctIndex = shuffledAnswers.indexOf(correctAnswer);

    return {
      id: question.id,
      question: question.question,
      explanation: question.explanation || null,
      answers: shuffledAnswers,
      correctIndex,
      correctAnswer,
      selectedIndex: null,
      isCorrect: null,
    };
  });
};

const createSession = ({ subjectId, mode, count, timed, durationSeconds }) => {
  const subject = SUBJECTS[subjectId];
  const total = subject?.questions?.length ?? 0;
  const finalCount = count === "all" ? total : count;

  return {
    id: crypto.randomUUID(),
    subjectId,
    mode,
    questionCount: finalCount,
    timedMode: timed,
    durationSeconds: timed ? durationSeconds : null,
    startedAt: new Date().toISOString(),
    currentIndex: 0,
    completed: false,
    questions: buildSessionQuestions({
      questions: subject.questions,
      count: count === "all" ? "all" : finalCount,
    }),
  };
};

export const QuizProvider = ({ children }) => {
  const [subjectId, setSubjectId] = useState(DEFAULT_SUBJECT);
  const [session, setSession] = useState(null);

  const startSession = ({
    mode,
    count,
    timed,
    durationSeconds,
    questionIds,
  }) => {
    const subject = SUBJECTS[subjectId];
    const pool = questionIds?.length
      ? subject.questions.filter((question) =>
          questionIds.includes(question.id),
        )
      : subject.questions;

    const questions = buildSessionQuestions({
      questions: pool,
      count,
    });

    setSession({
      id: crypto.randomUUID(),
      subjectId,
      mode,
      questionCount: questions.length,
      timedMode: timed,
      durationSeconds: timed ? durationSeconds : null,
      startedAt: new Date().toISOString(),
      currentIndex: 0,
      completed: false,
      questions,
    });
  };

  const answerQuestion = (answerIndex) => {
    setSession((prev) => {
      if (!prev) {
        return prev;
      }

      const questions = prev.questions.map((question, index) => {
        if (index !== prev.currentIndex || question.selectedIndex !== null) {
          return question;
        }

        const isCorrect = answerIndex === question.correctIndex;
        return {
          ...question,
          selectedIndex: answerIndex,
          isCorrect,
        };
      });

      return { ...prev, questions };
    });
  };

  const nextQuestion = () => {
    setSession((prev) => {
      if (!prev) {
        return prev;
      }

      const nextIndex = prev.currentIndex + 1;
      if (nextIndex >= prev.questions.length) {
        return {
          ...prev,
          completed: true,
          finishedAt: new Date().toISOString(),
        };
      }

      return { ...prev, currentIndex: nextIndex };
    });
  };

  const completeSession = () => {
    setSession((prev) => {
      if (!prev) {
        return prev;
      }

      return { ...prev, completed: true, finishedAt: new Date().toISOString() };
    });
  };

  const quitSession = () => {
    setSession(null);
  };

  const value = useMemo(
    () => ({
      subjectId,
      setSubjectId,
      session,
      startSession,
      answerQuestion,
      nextQuestion,
      completeSession,
      quitSession,
    }),
    [subjectId, session],
  );

  return React.createElement(QuizContext.Provider, { value }, children);
};

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error("useQuiz must be used within QuizProvider");
  }
  return context;
};

export const getGrade = (percentage) => {
  if (percentage >= 90) {
    return { letter: "A", label: "Excelent" };
  }
  if (percentage >= 75) {
    return { letter: "B", label: "Bine" };
  }
  if (percentage >= 60) {
    return { letter: "C", label: "Satisfacator" };
  }
  return { letter: "F", label: "Insuficient" };
};

export const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainder
    .toString()
    .padStart(2, "0")}`;
};

export const createQuizSession = createSession;

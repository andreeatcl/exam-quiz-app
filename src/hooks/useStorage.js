const STORAGE_PREFIX = "quiz";

const readJson = (key, fallback) => {
  if (typeof window === "undefined") {
    return fallback;
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    return fallback;
  }
};

const writeJson = (key, value) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
};

const subjectKey = (subjectId, name) =>
  `${STORAGE_PREFIX}_${name}_${subjectId}`;

export const getPrefs = () =>
  readJson(`${STORAGE_PREFIX}_prefs`, {
    autoAdvance: false,
    studyMode: false,
  });

export const setPrefs = (prefs) => writeJson(`${STORAGE_PREFIX}_prefs`, prefs);

export const useStorage = (subjectId) => {
  const historyKey = subjectKey(subjectId, "history");
  const wrongKey = subjectKey(subjectId, "wrong");
  const clearedKey = subjectKey(subjectId, "wrong_cleared");
  const streakKey = subjectKey(subjectId, "streak");

  return {
    getHistory: () => readJson(historyKey, []),
    setHistory: (value) => writeJson(historyKey, value),
    getWrong: () => readJson(wrongKey, []),
    setWrong: (value) => writeJson(wrongKey, value),
    getCleared: () => readJson(clearedKey, []),
    setCleared: (value) => writeJson(clearedKey, value),
    getStreak: () => readJson(streakKey, {}),
    setStreak: (value) => writeJson(streakKey, value),
  };
};

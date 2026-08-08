"use client";

import { useEffect, useState } from "react";

const THEME_STORAGE_KEY = "gabrielos-theme";

type ThemePreference = "system" | "light" | "dark";

const options: Array<{ value: ThemePreference; label: string }> = [
  { value: "system", label: "Sistema" },
  { value: "light", label: "Claro" },
  { value: "dark", label: "Oscuro" },
];

function applyTheme(preference: ThemePreference) {
  const resolvedTheme =
    preference === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : preference;

  document.documentElement.dataset.theme = resolvedTheme;
  document.documentElement.style.colorScheme = resolvedTheme;
}

export function ThemeSelector() {
  const [preference, setPreference] = useState<ThemePreference>("system");

  useEffect(() => {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    const initialPreference: ThemePreference =
      stored === "light" || stored === "dark" || stored === "system"
        ? stored
        : "system";
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const updatePreference = (event: Event) => {
      const nextPreference = (event as CustomEvent<ThemePreference>).detail;
      setPreference(nextPreference);
    };
    const updateSystemTheme = () => {
      if ((window.localStorage.getItem(THEME_STORAGE_KEY) ?? "system") === "system") {
        applyTheme("system");
      }
    };

    queueMicrotask(() => setPreference(initialPreference));
    applyTheme(initialPreference);
    mediaQuery.addEventListener("change", updateSystemTheme);
    window.addEventListener("gabrielos-theme-change", updatePreference);

    return () => {
      mediaQuery.removeEventListener("change", updateSystemTheme);
      window.removeEventListener("gabrielos-theme-change", updatePreference);
    };
  }, []);

  function selectTheme(nextPreference: ThemePreference) {
    window.localStorage.setItem(THEME_STORAGE_KEY, nextPreference);
    setPreference(nextPreference);
    applyTheme(nextPreference);
    window.dispatchEvent(
      new CustomEvent<ThemePreference>("gabrielos-theme-change", {
        detail: nextPreference,
      }),
    );
  }

  return (
    <div className="theme-control" role="group" aria-label="Tema visual">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={preference === option.value}
          onClick={() => selectTheme(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

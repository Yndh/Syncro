"use client";

import { ReactNode, useContext, useEffect, useState } from "react";
import { createContext } from "react";

interface Theme {
  theme: "dark" | "light";
  setTheme: (theme: "dark" | "light") => void | undefined;
}

const ThemeContext = createContext<Theme | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const [loading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const theme = localStorage.getItem("theme");
      if (theme == "dark" || theme == "light") {
        setTheme(theme);
        setIsLoading(false);
        return;
      }

      const prefersDarkScheme = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      if (prefersDarkScheme) {
        setTheme("dark");
        setIsLoading(false);
        return;
      } else {
        setTheme("light");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Failed to get theme");
    }
  }, []);

  useEffect(() => {
    try {
      if (!loading) localStorage.setItem("theme", theme);
    } catch (error) {
      console.error("Failed to save theme");
    }
  }, [theme, loading]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
      }}
    >
      <div className={`themeContainer ${theme}`}>{children}</div>
    </ThemeContext.Provider>
  );
};

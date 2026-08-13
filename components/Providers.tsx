"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { SessionProvider, useSession } from "next-auth/react";

interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
  resolvedTheme: string;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  setTheme: () => {},
  resolvedTheme: "dark",
});

export const useTheme = () => useContext(ThemeContext);

function SessionMonitor() {
  const { data: session } = useSession();

  useEffect(() => {
    if ((session as any)?.error === "RefreshAccessTokenError") {
      window.location.href = "/api/auth/signin";
    }
  }, [session]);

  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  // Page load hote hi localStorage se saved theme uthayenge, agar nahi hai toh default "dark"
  const [theme, setThemeState] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || "dark";
    }
    return "dark";
  });
  
  const [resolvedTheme, setResolvedTheme] = useState<string>(theme);

  // Theme change hone par localStorage me save karne ke liye custom setter
  const setTheme = (newTheme: string) => {
    setThemeState(newTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", newTheme);
    }
  };

  useEffect(() => {
    const updateTheme = () => {
      if (theme === "system") {
        const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        setResolvedTheme(systemPrefersDark ? "dark" : "light");
      } else {
        setResolvedTheme(theme);
      }
    };

    updateTheme();

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      mediaQuery.addEventListener("change", updateTheme);
      return () => mediaQuery.removeEventListener("change", updateTheme);
    }
  }, [theme]);

  return (
    <SessionProvider>
      <SessionMonitor />
      <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
        <div className={resolvedTheme}>
          {children}
        </div>
      </ThemeContext.Provider>
    </SessionProvider>
  );
}
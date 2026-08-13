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

// Session monitor jo background me token expiration check karega
function SessionMonitor() {
  const { data: session } = useSession();

  useEffect(() => {
    // Agar refresh token error aati hai toh turant re-login trigger karein
    if ((session as any)?.error === "RefreshAccessTokenError") {
      window.location.href = "/api/auth/signin";
    }
  }, [session]);

  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState("dark"); // "light" | "dark" | "system"
  const [resolvedTheme, setResolvedTheme] = useState("dark");

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
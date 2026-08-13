"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon, Laptop } from "lucide-react";

export default function ThemeToggle({ theme, setTheme }: { theme: string; setTheme: (val: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-xl border border-gray-700 bg-[#151c2e] text-gray-300 hover:text-white flex items-center gap-2 text-xs"
      >
        {theme === "dark" && <Moon className="w-4 h-4 text-emerald-400" />}
        {theme === "light" && <Sun className="w-4 h-4 text-amber-400" />}
        {theme === "system" && <Laptop className="w-4 h-4 text-blue-400" />}
        <span className="capitalize">{theme}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 rounded-xl bg-[#111625] border border-gray-700 shadow-xl py-1 z-50">
          <button 
            onClick={() => { setTheme("light"); setIsOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            <Sun className="w-3.5 h-3.5 text-amber-400" /> Light Mode
          </button>
          <button 
            onClick={() => { setTheme("dark"); setIsOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            <Moon className="w-3.5 h-3.5 text-emerald-400" /> Dark Mode
          </button>
          <button 
            onClick={() => { setTheme("system"); setIsOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            <Laptop className="w-3.5 h-3.5 text-blue-400" /> System Default
          </button>
        </div>
      )}
    </div>
  );
}
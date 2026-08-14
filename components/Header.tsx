"use client";

import React, { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Sun, Moon, Laptop, ChevronDown, Menu, X, Layers } from "lucide-react";
import { useTheme } from "@/components/Providers";
import Image from "next/image"; // Next.js ka optimized image component
import styles from "./Header.module.css";

interface HeaderProps {
  isDark: boolean;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export default function Header({ isDark, mobileMenuOpen, setMobileMenuOpen }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const [currentMarket, setCurrentMarket] = useState("share");

  useEffect(() => {
    const updateMarket = () => {
      const market = localStorage.getItem("selectedMarket") || "share";
      setCurrentMarket(market);
    };

    updateMarket();

    window.addEventListener("marketChange", updateMarket);
    return () => window.removeEventListener("marketChange", updateMarket);
  }, []);

  const currentDateFormatted = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  return (
    <header className={`px-6 py-3.5 flex items-center justify-between sticky top-0 z-40 ${isDark ? styles.headerDark : styles.headerLight}`}>
      <div className="flex items-center gap-3">
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className={styles.mobileMenuBtn}>
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
        
       <div className="flex items-center gap-3">
  {/* Direct HTML img tag for instant load */}
  <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-emerald-500/20 bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center p-0.5">
    <img 
      src="/logo.png" 
      alt="Logo" 
      className="w-full h-full object-cover rounded-lg"
    />
  </div>
  <div>
    <h1 className="font-extrabold text-sm tracking-wide leading-tight">MY TRADING</h1>
    <p className="text-[10px] text-emerald-400 font-bold tracking-widest leading-tight">DASHBOARD</p>
  </div>
</div>
      </div>

      <div className="flex items-center gap-3">
        {/* Date Badge */}
        <div className={isDark ? styles.dateBadgeDark : styles.dateBadgeLight}>
          <CalendarIcon className="w-3.5 h-3.5 text-emerald-400" />
          <span>{currentDateFormatted}</span>
        </div>

        {/* Current Selected Market Badge */}
        <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold uppercase border ${
          isDark ? "border-gray-700 bg-[#151c2e] text-emerald-400" : "border-slate-300 bg-slate-100 text-emerald-600"
        }`}>
          <Layers className="w-3.5 h-3.5" />
          <span>{currentMarket} Market</span>
        </div>

        {/* Theme Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs border transition-colors cursor-pointer ${
              isDark ? "border-gray-700 bg-[#151c2e] text-gray-300" : "border-slate-300 bg-slate-100 text-slate-700"
            }`}
          >
            {theme === "dark" && <Moon className="w-3.5 h-3.5 text-emerald-400" />}
            {theme === "light" && <Sun className="w-3.5 h-3.5 text-amber-500" />}
            {theme === "system" && <Laptop className="w-3.5 h-3.5 text-blue-400" />}
            <span className="capitalize hidden sm:inline">{theme}</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {isThemeDropdownOpen && (
            <div className={`absolute right-0 mt-2 w-36 rounded-xl border shadow-xl py-1 z-50 ${isDark ? "bg-[#111625] border-gray-700 text-gray-300" : "bg-white border-slate-200 text-slate-700"}`}>
              <button onClick={() => { setTheme("light"); setIsThemeDropdownOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-emerald-500/10 hover:text-emerald-500 cursor-pointer bg-transparent border-none">
                <Sun className="w-3.5 h-3.5 text-amber-500" /> Light Mode
              </button>
              <button onClick={() => { setTheme("dark"); setIsThemeDropdownOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-emerald-500/10 hover:text-emerald-500 cursor-pointer bg-transparent border-none">
                <Moon className="w-3.5 h-3.5 text-emerald-400" /> Dark Mode
              </button>
              <button onClick={() => { setTheme("system"); setIsThemeDropdownOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-emerald-500/10 hover:text-emerald-500 cursor-pointer bg-transparent border-none">
                <Laptop className="w-3.5 h-3.5 text-blue-400" /> System Default
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
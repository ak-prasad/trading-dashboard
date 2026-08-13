"use client";

import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Calendar as CalendarIcon, 
  TrendingUp, 
  Receipt,
  FilePlus, 
  Settings as SettingsIcon,
  RefreshCw,
  LogOut,
  ChevronDown,
  ChevronUp,
  X
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "@/components/Providers";
import styles from "./Sidebar.module.css";
import { fetchWithAuth } from "@/utils/apiClient";

interface SidebarProps {
  isDark: boolean;
  session: any;
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
  onOpenAddTrade?: () => void;
  onOpenDeposit?: () => void;
  onOpenWithdrawal?: () => void;
}

export default function Sidebar({ 
  isDark, 
  session, 
  mobileMenuOpen, 
  setMobileMenuOpen,
  onOpenAddTrade,
  onOpenDeposit,
  onOpenWithdrawal
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useTheme();

  const [entryOpen, setEntryOpen] = useState(false);

  const [todaysPnl, setTodaysPnl] = useState(0);
  const [todaysPercentage, setTodaysPercentage] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);
  const [currentMarket, setCurrentMarket] = useState("share");
  const [isSyncing, setIsSyncing] = useState(false);

  // Dynamic Currency Symbol based on Market
  const currencySymbol = currentMarket === "crypto" ? "$" : "₹";

  useEffect(() => {
    const fetchSidebarData = async () => {
      const market = localStorage.getItem("selectedMarket") || "share";
      setCurrentMarket(market);

      const apiEndpoint = `/api/sheet-data?market=${market}`;
      const cacheKey = `cache_${apiEndpoint}`;

      // Pehle local cache check karo taaki blank ya zero na dikhe
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        try {
          const parsed = JSON.parse(cachedData);
          if (parsed && parsed.length > 0) {
            processRows(parsed);
          }
        } catch (e) {
          console.error("Cache parse error:", e);
        }
      }

      // fetchWithAuth use karein jo automatic token refresh handle karega
      try {
        const data = await fetchWithAuth(apiEndpoint);
        if (data && data.values) {
          processRows(data.values);
          localStorage.setItem(cacheKey, JSON.stringify(data.values));
        }
      } catch (err) {
        console.error("Error fetching P&L data:", err);
      }
    };

    const processRows = (rows: any[]) => {
      const todayStr = new Date().toISOString().split("T")[0];

      let todayNet = 0;
      let totalDeposit = 0;
      let totalWithdrawal = 0;
      let cumulativeNetPnl = 0;

      rows.forEach((row: any) => {
        const dateStr = String(row[0] || "");
        const deposit = parseFloat(row[2]) || 0;
        const withdrawal = parseFloat(row[3]) || 0;
        const netPnl = parseFloat(row[12]) || 0;

        totalDeposit += deposit;
        totalWithdrawal += withdrawal;
        cumulativeNetPnl += netPnl;

        if (dateStr === todayStr) {
          todayNet += netPnl;
        }
      });

      const calculatedBalance = totalDeposit + cumulativeNetPnl - totalWithdrawal;
      const percentage = calculatedBalance !== 0 ? (todayNet / Math.abs(calculatedBalance)) * 100 : 0;

      setTodaysPnl(todayNet);
      setTodaysPercentage(percentage);
      setTotalBalance(calculatedBalance);
    };

    fetchSidebarData();

    // Listen to market changes from Settings
    window.addEventListener("marketChange", fetchSidebarData);
    return () => window.removeEventListener("marketChange", fetchSidebarData);
  }, []);

  // Sync Handler to refresh data and reload page
  const handleSyncData = () => {
    setIsSyncing(true);
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  const content = (
    <div className="pt-2 flex flex-col h-full justify-between gap-4">
      <div className="space-y-4">
        {/* Today's P&L Card with Dynamic Currency & Thin High Glow Line Chart */}
        <div className={isDark ? styles.todaysPnlDark : styles.todaysPnlLight}>
          <span className="text-[10px] font-bold tracking-wider opacity-70 uppercase block mb-1">Today's P&L</span>
          <div className={styles.pnlCardBody}>
            <div className={styles.pnlTextContent}>
              <h3 className={`text-base font-extrabold ${todaysPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {todaysPnl >= 0 ? `+ ${currencySymbol}${todaysPnl.toLocaleString()}` : `- ${currencySymbol}${Math.abs(todaysPnl).toLocaleString()}`}
              </h3>
              <p className={`text-[10px] font-bold mt-0.5 ${todaysPercentage >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {todaysPercentage >= 0 ? `+${todaysPercentage.toFixed(2)}%` : `${todaysPercentage.toFixed(2)}%`}
              </p>
            </div>

            <div className={styles.pnlChartContainer}>
              <svg className="w-full h-full overflow-visible" viewBox="0 0 120 45" preserveAspectRatio="none">
                <path 
                  d={todaysPnl >= 0 ? "M 2 38 L 22 28 L 42 32 L 68 14 L 88 22 L 118 6" : "M 2 8 L 22 18 L 42 14 L 68 32 L 88 26 L 118 40"} 
                  fill="none" 
                  stroke={todaysPnl >= 0 ? "#10b981" : "#ef4444"} 
                  strokeWidth="1.8" 
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={todaysPnl >= 0 ? styles.highGlowPathGreen : styles.highGlowPathRed}
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1.5 text-xs">
          <button
            onClick={() => {
              router.push("/dashboard");
              if (setMobileMenuOpen) setMobileMenuOpen(false);
            }}
            className={`${isDark ? styles.navButtonDark : styles.navButtonLight} ${pathname === "/dashboard" ? styles.activeNav : ""}`}
          >
            <div className="flex items-center gap-3">
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </div>
          </button>

          <button
            onClick={() => {
              router.push("/calendar");
              if (setMobileMenuOpen) setMobileMenuOpen(false);
            }}
            className={`${isDark ? styles.navButtonDark : styles.navButtonLight} ${pathname === "/calendar" ? styles.activeNav : ""}`}
          >
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-4 h-4" />
              <span>P&L Calendar</span>
            </div>
          </button>

          <button
            onClick={() => {
              router.push("/trades");
              if (setMobileMenuOpen) setMobileMenuOpen(false);
            }}
            className={`${isDark ? styles.navButtonDark : styles.navButtonLight} ${pathname === "/trades" ? styles.activeNav : ""}`}
          >
            <div className="flex items-center gap-3">
              <TrendingUp className="w-4 h-4" />
              <span>Trades</span>
            </div>
          </button>

          <button
            onClick={() => {
              router.push("/transactions");
              if (setMobileMenuOpen) setMobileMenuOpen(false);
            }}
            className={`${isDark ? styles.navButtonDark : styles.navButtonLight} ${pathname === "/transactions" ? styles.activeNav : ""}`}
          >
            <div className="flex items-center gap-3">
              <Receipt className="w-4 h-4" />
              <span>Transactions</span>
            </div>
          </button>

          <div>
            <button
              onClick={() => setEntryOpen(!entryOpen)}
              className={isDark ? styles.navButtonDark : styles.navButtonLight}
            >
              <div className="flex items-center gap-3">
                <FilePlus className="w-4 h-4" />
                <span>Entry</span>
              </div>
              {entryOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {entryOpen && (
              <div className={styles.subNavContainer}>
                <button
                  onClick={() => {
                    if (onOpenAddTrade) onOpenAddTrade();
                    setEntryOpen(false); // Dropdown close karne ke liye
                    if (setMobileMenuOpen) setMobileMenuOpen(false);
                  }}
                  className={isDark ? styles.subNavItemDark : styles.subNavItemLight}
                >
                  <span className={styles.bulletDot} />
                  <span>Add Trade</span>
                </button>
                <button
                  onClick={() => {
                    if (onOpenDeposit) onOpenDeposit();
                    setEntryOpen(false); // Dropdown close karne ke liye
                    if (setMobileMenuOpen) setMobileMenuOpen(false);
                  }}
                  className={isDark ? styles.subNavItemDark : styles.subNavItemLight}
                >
                  <span className={styles.bulletDot} />
                  <span>Deposit/ Invest</span>
                </button>
                <button
                  onClick={() => {
                    if (onOpenWithdrawal) onOpenWithdrawal();
                    setEntryOpen(false); // Dropdown close karne ke liye
                    if (setMobileMenuOpen) setMobileMenuOpen(false);
                  }}
                  className={isDark ? styles.subNavItemDark : styles.subNavItemLight}
                >
                  <span className={styles.bulletDot} />
                  <span>Withdrawal</span>
                </button>
              </div>
            )}
          </div>

          {/* Settings moved to Navigation Menu */}
          <button
            onClick={() => {
              router.push("/settings");
              if (setMobileMenuOpen) setMobileMenuOpen(false);
            }}
            className={`${isDark ? styles.navButtonDark : styles.navButtonLight} ${pathname === "/settings" ? styles.activeNav : ""}`}
          >
            <div className="flex items-center gap-3">
              <SettingsIcon className="w-4 h-4" />
              <span>Settings</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Profile Card with Dynamic Balance & Sync/Logout Buttons in 50-50 Row */}
      <div className={isDark ? styles.profileCardDark : styles.profileCardLight}>
        <div className="flex items-center gap-2.5 mb-2.5">
          {session?.user?.image ? (
            <img 
              src={session.user.image} 
              alt="Profile" 
              className="w-9 h-9 rounded-xl object-cover shrink-0 border border-emerald-500/30" 
            />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
              {session?.user?.name?.[0] || "A"}
            </div>
          )}
          <div className="truncate">
            <p className="text-xs font-bold truncate">{session?.user?.name || "Ankit Kumar"}</p>
            <p className="text-[10px] text-emerald-400 font-medium truncate">{session?.user?.email || "ankitknv35@gmail.com"}</p>
          </div>
        </div>

        <div className="mb-2.5 pt-2 border-t border-gray-700/30">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Balance</p>
          <p className="text-sm font-extrabold">{currencySymbol}{totalBalance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>

        {/* Sync & Logout Buttons in Exact 50-50 Row */}
        <div className={styles.buttonRow}>
          <div className={styles.buttonWrapper}>
            <button 
              onClick={handleSyncData}
              disabled={isSyncing}
              className={isDark ? styles.profileActionButtonDark : styles.profileActionButtonLight}
              title="Sync Data & Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${isSyncing ? "animate-spin" : ""}`} />
              <span className="truncate">{isSyncing ? "Syncing..." : "Sync"}</span>
            </button>
          </div>

          <div className={styles.buttonWrapper}>
            <button 
              onClick={() => signOut({ callbackUrl: "/" })} 
              className={styles.logoutButton}
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className={isDark ? styles.sidebarDark : styles.sidebarLight}>
        {content}
      </aside>

      {mobileMenuOpen && (
        <div className={styles.mobileOverlay} onClick={() => setMobileMenuOpen && setMobileMenuOpen(false)}>
          <div 
            className={isDark ? styles.mobileDrawerDark : styles.mobileDrawerLight} 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-gray-800/50">
              <span className="font-extrabold text-xs tracking-wider">NAVIGATION</span>
              <button 
                onClick={() => setMobileMenuOpen && setMobileMenuOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {content}
          </div>
        </div>
      )}
    </>
  );
}
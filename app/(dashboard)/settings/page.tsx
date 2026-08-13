"use client";

import React, { useState, useEffect } from "react";
import { 
  Sun, 
  Moon, 
  Monitor, 
  TrendingUp, 
  Coins, 
  RefreshCw, 
  Download, 
  Upload, 
  CheckCircle2, 
  Database 
} from "lucide-react";
import { useTheme } from "@/components/Providers";
import styles from "./settings.module.css";
import { fetchWithAuth } from "@/utils/apiClient";

export default function SettingsPage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // 1. Market Switch State (localStorage me save rahega taaki refresh par bhi retain rahe)
  const [selectedMarket, setSelectedMarket] = useState("share");

  useEffect(() => {
    const savedMarket = localStorage.getItem("selectedMarket");
    if (savedMarket) {
      setSelectedMarket(savedMarket);
    }
  }, []);

  const handleMarketChange = (market: string) => {
    setSelectedMarket(market);
    localStorage.setItem("selectedMarket", market);
    window.dispatchEvent(new Event("marketChange")); // Trigger event for other components if needed
  };

  // 2. Mock Sync State
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState("Synced just now");

  const handleManualSync = () => {
    setIsSyncing(true);
    setSyncStatus("Syncing with Google Sheets...");
    setTimeout(() => {
      setIsSyncing(false);
      setSyncStatus("Successfully synchronized!");
    }, 1500);
  };

  // 3. Functional Data Export with Native Save Dialog using fetchWithAuth
  const handleExportData = async () => {
    try {
      const market = localStorage.getItem("selectedMarket") || "share";
      const data = await fetchWithAuth(`/api/sheet-data?market=${market}`);

      if (!data || !data.values || data.values.length === 0) {
        alert("No data available to export.");
        return;
      }

      // Convert rows to CSV format string
      const rows = data.values;
      let csvContent = "";
      rows.forEach((row: any[]) => {
        const rowString = row.map(val => `"${String(val || "").replace(/"/g, '""')}"`).join(",");
        csvContent += rowString + "\r\n";
      });

      const fileName = `Trading_Journal_${selectedMarket.toUpperCase()}_Backup.csv`;

      // Check if browser supports File System Access API (Native Save As Dialog)
      if ('showSaveFilePicker' in window) {
        try {
          const options = {
            suggestedName: fileName,
            types: [{
              description: 'CSV Files',
              accept: { 'text/csv': ['.csv'] },
            }],
          };
          const handle = await (window as any).showSaveFilePicker(options);
          const writable = await handle.createWritable();
          await writable.write(csvContent);
          await writable.close();
          return;
        } catch (err: any) {
          if (err.name === 'AbortError') return;
          console.log("File Picker skipped, using fallback download.");
        }
      }

      // Fallback method agar browser support na kare
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to export data.");
    }
  };

  const handleImportData = () => {
    alert("Import feature: Please select a backup file to restore.");
  };

  return (
    <div className={`${styles.container} ${isDark ? styles.darkTheme : styles.lightTheme}`}>
      <div className={styles.headerSection}>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.subtitle}>Manage your trading journal preferences, markets, and data backups.</p>
      </div>

      <div className={styles.settingsGrid}>
        
        {/* 1. Appearance Section */}
        <div className={isDark ? styles.cardDark : styles.cardLight}>
          <div className={styles.cardHeader}>
            <Sun className="w-5 h-5 text-amber-500" />
            <h2>Appearance</h2>
          </div>
          <p className={styles.cardDesc}>Customize how the dashboard looks on your device.</p>
          
          <div className={styles.optionGroup}>
            <button
              onClick={() => setTheme("light")}
              className={`${styles.selectOption} ${theme === "light" ? styles.activeOption : ""}`}
            >
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Light Mode</span>
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`${styles.selectOption} ${theme === "dark" ? styles.activeOption : ""}`}
            >
              <Moon className="w-4 h-4 text-emerald-400" />
              <span>Dark Mode</span>
            </button>
            <button
              onClick={() => setTheme("system")}
              className={`${styles.selectOption} ${theme === "system" ? styles.activeOption : ""}`}
            >
              <Monitor className="w-4 h-4 text-blue-400" />
              <span>System Default</span>
            </button>
          </div>
        </div>

        {/* 2. Market Selection Section (Functional Switch) */}
        <div className={isDark ? styles.cardDark : styles.cardLight}>
          <div className={styles.cardHeader}>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <h2>Default Market</h2>
          </div>
          <p className={styles.cardDesc}>Choose your primary trading market for entries and tables.</p>
          
          <div className={styles.optionGroup}>
            <button
              onClick={() => handleMarketChange("share")}
              className={`${styles.selectOption} ${selectedMarket === "share" ? styles.activeOption : ""}`}
            >
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span>Share Market (NSE/BSE)</span>
            </button>
            <button
              onClick={() => handleMarketChange("crypto")}
              className={`${styles.selectOption} ${selectedMarket === "crypto" ? styles.activeOption : ""}`}
            >
              <Coins className="w-4 h-4 text-amber-500" />
              <span>Crypto Market</span>
            </button>
          </div>
        </div>

        {/* 3. Data Management Section */}
        <div className={`${isDark ? styles.cardDark : styles.cardLight} ${styles.fullWidthCard}`}>
          <div className={styles.cardHeader}>
            <Database className="w-5 h-5 text-purple-500" />
            <h2>Data Management & Backup</h2>
          </div>
          <p className={styles.cardDesc}>Monitor Google Sheets sync status, create manual backups, or import/export data.</p>
          
          <div className={styles.dataManagementContent}>
            {/* Sync Status Row */}
            <div className={styles.syncRow}>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <div>
                  <p className="text-xs font-bold">Google Sheets Sync Status</p>
                  <p className="text-[11px] text-gray-400">{syncStatus}</p>
                </div>
              </div>
              <button 
                onClick={handleManualSync}
                disabled={isSyncing}
                className={styles.syncButton}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                <span>{isSyncing ? "Syncing..." : "Sync Now"}</span>
              </button>
            </div>

            {/* Export & Import Actions */}
            <div className={styles.actionRow}>
              <div className={styles.actionBox}>
                <div>
                  <h3 className="text-xs font-bold">Export Trade Data</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">Download all your records as a secure backup file.</p>
                </div>
                <button onClick={handleExportData} className={styles.secondaryButton}>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Backup (.CSV / .XLS)</span>
                </button>
              </div>

              <div className={styles.actionBox}>
                <div>
                  <h3 className="text-xs font-bold">Import Backup</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">Restore your journal data from a previous file.</p>
                </div>
                <button onClick={handleImportData} className={styles.secondaryButton}>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import File</span>
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Copyright Footer */}
      <footer className="mt-12 pt-6 border-t border-gray-800/40 text-center text-xs text-gray-400">
        <p>© 2026 ANKIT KUMAR. All rights reserved.</p>
      </footer>
    </div>
  );
}
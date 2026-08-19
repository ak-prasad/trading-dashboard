"use client";
import "../globals.css";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "@/components/Providers";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import EntryModals from "@/components/EntryModals";
import styles from "./dashboardLayout.module.css";
import { fetchWithAuth } from "@/utils/apiClient";

export default function DashboardSharedLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // State to track which specific modal is open
  const [activeModal, setActiveModal] = useState<"addTrade" | "deposit" | "withdrawal" | null>(null);

  // 1. Save Trade
  const handleSaveTrade = async (data: any) => {
    try {
      const response = await fetchWithAuth("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response || response.ok === false) {
        throw new Error("Failed to save trade.");
      }

      return true;
    } catch (error) {
      console.error("Error saving trade:", error);
      return false;
    }
  };

// 2. Save Deposit
  const handleSaveDeposit = async (data: any) => {
    try {
      const response = await fetchWithAuth("/api/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response || response.ok === false) {
        throw new Error("Failed to save deposit.");
      }

      return true;
    } catch (error) {
      console.error("Error saving deposit:", error);
      return false;
    }
  };

// 3. Save Withdrawal
  const handleSaveWithdrawal = async (data: any) => {
    try {
      const response = await fetchWithAuth("/api/withdrawal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response || response.ok === false) {
        throw new Error("Failed to save withdrawal.");
      }

      return true;
    } catch (error) {
      console.error("Error saving withdrawal:", error);
      return false;
    }
  };

  return (
    <div className={`${styles.dashboardLayout} ${isDark ? styles.darkTheme : styles.lightTheme}`}>
      <div className={styles.headerWrapper}>
        <Header 
          isDark={isDark} 
          mobileMenuOpen={mobileMenuOpen} 
          setMobileMenuOpen={setMobileMenuOpen} 
        />
      </div>

      <div className={styles.bodyContainer}>
        <Sidebar 
          isDark={isDark} 
          session={session} 
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          onOpenAddTrade={() => setActiveModal("addTrade")}
          onOpenDeposit={() => setActiveModal("deposit")}
          onOpenWithdrawal={() => setActiveModal("withdrawal")}
        />

        <div className={styles.mainContentArea}>
          {children}
        </div>
      </div>

      {/* Entry Modals (Add Trade, Deposit, Withdrawal) */}
      <EntryModals 
        key={activeModal} 
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
        isDark={isDark}
        onSaveTrade={handleSaveTrade}
        onSaveDeposit={handleSaveDeposit}
        onSaveWithdrawal={handleSaveWithdrawal}
      />
    </div>
  );
}
import React from "react";
import { Wallet, ArrowUpRight, TrendingUp, TrendingDown, LineChart } from "lucide-react";
import styles from "./StatsCards.module.css";

export default function StatsCards({ darkMode }: { darkMode: boolean }) {
  const baseCardStyle = `${styles.card} ${darkMode ? styles.darkCard : styles.lightCard}`;
  const netCardStyle = `${styles.card} ${darkMode ? styles.netCardDark : styles.netCardLight}`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <div className={baseCardStyle}>
        <div className={styles.iconBoxBlue}><Wallet className="w-4 h-4" /></div>
        <p className="text-xs text-gray-400 font-medium">INVEST</p>
        <h3 className="text-lg font-bold mt-1">₹ 5,75,000</h3>
        <p className="text-[11px] text-blue-500 mt-1 font-medium">Total Invested</p>
      </div>

      <div className={baseCardStyle}>
        <div className={styles.iconBoxAmber}><ArrowUpRight className="w-4 h-4" /></div>
        <p className="text-xs text-gray-400 font-medium">WITHDRAWAL</p>
        <h3 className="text-lg font-bold mt-1">₹ 1,25,000</h3>
        <p className="text-[11px] text-amber-500 mt-1 font-medium">Total Withdrawal</p>
      </div>

      <div className={baseCardStyle}>
        <div className={styles.iconBoxEmerald}><TrendingUp className="w-4 h-4" /></div>
        <p className="text-xs text-gray-400 font-medium">TOTAL PROFIT</p>
        <h3 className="text-lg font-bold mt-1 text-emerald-500">₹ 2,45,680</h3>
        <p className="text-[11px] text-emerald-500 mt-1 font-medium">+24.56%</p>
      </div>

      <div className={baseCardStyle}>
        <div className={styles.iconBoxRose}><TrendingDown className="w-4 h-4" /></div>
        <p className="text-xs text-gray-400 font-medium">TOTAL LOSS</p>
        <h3 className="text-lg font-bold mt-1 text-rose-500">₹ 1,12,320</h3>
        <p className="text-[11px] text-rose-500 mt-1 font-medium">-11.23%</p>
      </div>

      <div className={netCardStyle}>
        <div className={styles.iconBoxBlue}><LineChart className="w-4 h-4" /></div>
        <p className="text-xs text-gray-400 font-medium">NET P&L</p>
        <h3 className="text-lg font-bold mt-1 text-blue-400">₹ 1,33,360</h3>
        <p className="text-[11px] text-blue-400 mt-1 font-medium">+13.33%</p>
      </div>
    </div>
  );
}
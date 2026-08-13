"use client";

import React, { useState, useEffect } from "react";
import { X, PlusCircle, ArrowDownRight, ArrowUpRight, RotateCcw } from "lucide-react";
import styles from "./EntryModals.module.css";

interface EntryModalsProps {
  activeModal: "addTrade" | "deposit" | "withdrawal" | null;
  onClose: () => void;
  isDark: boolean;
  onSaveTrade?: (data: any) => void;
  onSaveDeposit?: (data: any) => void;
  onSaveWithdrawal?: (data: any) => void;
}

export default function EntryModals({
  activeModal,
  onClose,
  isDark,
  onSaveTrade,
  onSaveDeposit,
  onSaveWithdrawal
}: EntryModalsProps) {
  const [currentMarket, setCurrentMarket] = useState("share");

  // Fetch current selected market and listen to changes
  useEffect(() => {
    const market = localStorage.getItem("selectedMarket") || "share";
    setCurrentMarket(market);

    const handleMarketChange = () => {
      const updatedMarket = localStorage.getItem("selectedMarket") || "share";
      setCurrentMarket(updatedMarket);
    };

    window.addEventListener("marketChange", handleMarketChange);
    return () => window.removeEventListener("marketChange", handleMarketChange);
  }, []);

  // Dynamic brokers list based on market type
  const brokers = currentMarket === "crypto" 
    ? ["DeltaExchange", "XM", "CoinDCX", "Binance"] 
    : ["Algo", "Angel One", "Dhan", "Groww", "SAHI", "Lemonn", "Upstox"];

  // Dynamic currency symbol
  const currencySymbol = currentMarket === "crypto" ? "$" : "₹";

  const initialTradeState = {
    date: new Date().toISOString().split("T")[0],
    broker: "",
    tradeName: "",
    qty: "",
    buyPrice: "",
    sellPrice: "",
    brokerage: "",
    market: currentMarket
  };
  const [tradeData, setTradeData] = useState(initialTradeState);

  const initialDepositState = {
    date: new Date().toISOString().split("T")[0],
    broker: "",
    amount: "",
    market: currentMarket
  };
  const [depositData, setDepositData] = useState(initialDepositState);

  const initialWithdrawalState = {
    date: new Date().toISOString().split("T")[0],
    broker: "",
    amount: "",
    market: currentMarket
  };
  const [withdrawalData, setWithdrawalData] = useState(initialWithdrawalState);

  // Reset or attach market type whenever market changes or modal opens
  useEffect(() => {
    setTradeData(prev => ({ ...prev, market: currentMarket, broker: "" }));
    setDepositData(prev => ({ ...prev, market: currentMarket, broker: "" }));
    setWithdrawalData(prev => ({ ...prev, market: currentMarket, broker: "" }));
  }, [currentMarket, activeModal]);

  if (!activeModal) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div 
        className={isDark ? styles.modalContentDark : styles.modalContentLight} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800/40 mb-4">
          <h3 className="font-bold text-sm tracking-wide">
            {activeModal === "addTrade" && `New Trade Entry (${currentMarket.toUpperCase()})`}
            {activeModal === "deposit" && `Deposit / Invest Funds (${currentMarket.toUpperCase()})`}
            {activeModal === "withdrawal" && `Withdraw Funds (${currentMarket.toUpperCase()})`}
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. ADD TRADE FORM */}
        {activeModal === "addTrade" && (
          <form 
            onSubmit={(e) => { 
              e.preventDefault(); 
              if (onSaveTrade) onSaveTrade(tradeData); 
              setTradeData(initialTradeState);
            }} 
            className="space-y-3.5 text-xs sm:text-sm"
          >
            <div className={styles.formGrid}>
              
              {/* Date & Broker (Always 2 columns) */}
              <div>
                <label className="text-gray-400 font-medium mb-1 block">Date</label>
                <input 
                  type="date" 
                  value={tradeData.date}
                  onChange={(e) => setTradeData({...tradeData, date: e.target.value})}
                  className={isDark ? styles.inputDark : styles.inputLight}
                  required
                />
              </div>
              <div>
                <label className="text-gray-400 font-medium mb-1 block">Broker</label>
                <select 
                  value={tradeData.broker}
                  onChange={(e) => setTradeData({...tradeData, broker: e.target.value})}
                  className={isDark ? styles.inputDark : styles.inputLight}
                  required
                >
                  <option value="" disabled>Select Broker</option>
                  {brokers.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* Trade Name */}
              <div className={styles.tradeField}>
                <label className="text-gray-400 font-medium mb-1 block">Trade</label>
                <input 
                  type="text" 
                  placeholder={currentMarket === "crypto" ? "e.g. BTCUSDT / ETH" : "e.g. Nifty 11 Aug 24550 Call"}
                  value={tradeData.tradeName}
                  onChange={(e) => setTradeData({...tradeData, tradeName: e.target.value})}
                  className={isDark ? styles.inputDark : styles.inputLight}
                  required
                />
              </div>

              {/* Quantity */}
              <div>
                <label className="text-gray-400 font-medium mb-1 block">Quantity</label>
                <input 
                  type="number" 
                  step="any"
                  placeholder={currentMarket === "crypto" ? "e.g. 0.001" : "e.g. 65"}
                  value={tradeData.qty}
                  onChange={(e) => setTradeData({...tradeData, qty: e.target.value})}
                  className={isDark ? styles.inputDark : styles.inputLight}
                  required
                />
              </div>

              {/* Buy Price */}
              <div>
                <label className="text-gray-400 font-medium mb-1 block">Buy Price ({currencySymbol})</label>
                <input 
                  type="number" 
                  step="any"
                  placeholder="0.00"
                  value={tradeData.buyPrice}
                  onChange={(e) => setTradeData({...tradeData, buyPrice: e.target.value})}
                  className={isDark ? styles.inputDark : styles.inputLight}
                  required
                />
              </div>

              {/* Sell Price */}
              <div>
                <label className="text-gray-400 font-medium mb-1 block">Sell Price ({currencySymbol})</label>
                <input 
                  type="number" 
                  step="any"
                  placeholder="0.00"
                  value={tradeData.sellPrice}
                  onChange={(e) => setTradeData({...tradeData, sellPrice: e.target.value})}
                  className={isDark ? styles.inputDark : styles.inputLight}
                  required
                />
              </div>

              {/* Brokerage & Charges */}
              <div>
                <label className="text-gray-400 font-medium mb-1 block">Brokerage & Charges</label>
                <input 
                  type="number" 
                  step="any"
                  placeholder="e.g. 40"
                  value={tradeData.brokerage}
                  onChange={(e) => setTradeData({...tradeData, brokerage: e.target.value})}
                  className={isDark ? styles.inputDark : styles.inputLight}
                  required
                />
              </div>

            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5 pt-2">
              <button 
                type="button" 
                onClick={() => setTradeData(initialTradeState)}
                className="w-1/3 bg-gradient-to-r from-rose-600 to-rose-500 text-white font-semibold py-2.5 rounded-xl shadow-lg shadow-rose-500/20 hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Clear
              </button>
              <button 
                type="submit" 
                className="w-2/3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-4 h-4" /> Save Trade
              </button>
            </div>
          </form>
        )}

        {/* 2. DEPOSIT / INVEST FORM */}
        {activeModal === "deposit" && (
          <form 
            onSubmit={(e) => { 
              e.preventDefault(); 
              if (onSaveDeposit) onSaveDeposit(depositData); 
              setDepositData(initialDepositState);
            }} 
            className="space-y-3.5 text-xs"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-gray-400 font-medium mb-1 block">Date</label>
                <input 
                  type="date" 
                  value={depositData.date}
                  onChange={(e) => setDepositData({...depositData, date: e.target.value})}
                  className={isDark ? styles.inputDark : styles.inputLight}
                  required
                />
              </div>
              <div>
                <label className="text-gray-400 font-medium mb-1 block">Broker</label>
                <select 
                  value={depositData.broker}
                  onChange={(e) => setDepositData({...depositData, broker: e.target.value})}
                  className={isDark ? styles.inputDark : styles.inputLight}
                  required
                >
                  <option value="" disabled>Select Broker</option>
                  {brokers.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-gray-400 font-medium mb-1 block">Amount ({currencySymbol})</label>
                <input 
                  type="number" 
                  step="any"
                  placeholder="Enter deposit amount"
                  value={depositData.amount}
                  onChange={(e) => setDepositData({...depositData, amount: e.target.value})}
                  className={isDark ? styles.inputDark : styles.inputLight}
                  required
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5 pt-2">
              <button 
                type="button" 
                onClick={() => setDepositData(initialDepositState)}
                className="w-1/3 bg-gradient-to-r from-rose-600 to-rose-500 text-white font-semibold py-2.5 rounded-xl shadow-lg shadow-rose-500/20 hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Clear
              </button>
              <button 
                type="submit" 
                className="w-2/3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold py-2.5 rounded-xl shadow-lg shadow-blue-500/20 hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-2"
              >
                <ArrowDownRight className="w-4 h-4" /> Confirm Deposit
              </button>
            </div>
          </form>
        )}

        {/* 3. WITHDRAWAL FORM */}
        {activeModal === "withdrawal" && (
          <form 
            onSubmit={(e) => { 
              e.preventDefault(); 
              if (onSaveWithdrawal) onSaveWithdrawal(withdrawalData); 
              setWithdrawalData(initialWithdrawalState);
            }} 
            className="space-y-3.5 text-xs"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-gray-400 font-medium mb-1 block">Date</label>
                <input 
                  type="date" 
                  value={withdrawalData.date}
                  onChange={(e) => setWithdrawalData({...withdrawalData, date: e.target.value})}
                  className={isDark ? styles.inputDark : styles.inputLight}
                  required
                />
              </div>
              <div>
                <label className="text-gray-400 font-medium mb-1 block">Broker</label>
                <select 
                  value={withdrawalData.broker}
                  onChange={(e) => setWithdrawalData({...withdrawalData, broker: e.target.value})}
                  className={isDark ? styles.inputDark : styles.inputLight}
                  required
                >
                  <option value="" disabled>Select Broker</option>
                  {brokers.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-gray-400 font-medium mb-1 block">Amount ({currencySymbol})</label>
                <input 
                  type="number" 
                  step="any"
                  placeholder="Enter withdrawal amount"
                  value={withdrawalData.amount}
                  onChange={(e) => setWithdrawalData({...withdrawalData, amount: e.target.value})}
                  className={isDark ? styles.inputDark : styles.inputLight}
                  required
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5 pt-2">
              <button 
                type="button" 
                onClick={() => setWithdrawalData(initialWithdrawalState)}
                className="w-1/3 bg-gradient-to-r from-rose-600 to-rose-500 text-white font-semibold py-2.5 rounded-xl shadow-lg shadow-rose-500/20 hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Clear
              </button>
              <button 
                type="submit" 
                className="w-2/3 bg-gradient-to-r from-amber-600 to-amber-500 text-white font-semibold py-2.5 rounded-xl shadow-lg shadow-amber-500/20 hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-2"
              >
                <ArrowUpRight className="w-4 h-4" /> Confirm Withdrawal
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
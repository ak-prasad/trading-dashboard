"use client";

import React, { useState, useEffect } from "react";
import { X, PlusCircle, ArrowDownRight, ArrowUpRight, RotateCcw, CheckCircle2, ChevronDown } from "lucide-react";
import CTADatePicker from "@/style/CTADatePicker";
import styles from "./EntryModals.module.css";
import { getBrokersByMarket } from "@/utils/brokersList";

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
  type SavedEntryType = "trade" | "deposit" | "withdrawal";
  const [savedEntryType, setSavedEntryType] = useState<SavedEntryType | null>(null);
  const [openBrokerDropdown, setOpenBrokerDropdown] = useState<"trade" | "deposit" | "withdrawal" | null>(null);

  const formatNumber = (value: string) => {
    if (value === "") return "";
    const [integer, decimal] = value.split(".");
    const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return decimal !== undefined ? `${formattedInteger}.${decimal}` : formattedInteger;
  };

  const normalizeNumber = (value: string) => {
    const clean = value.replace(/,/g, "").replace(/[^0-9.]/g, "");
    const [integer = "", ...decimals] = clean.split(".");
    return decimals.length ? `${integer}.${decimals.join("")}` : integer;
  };

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

// Dynamic broker list using centralized utility
  const rawBrokers = getBrokersByMarket(currentMarket);

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
            {activeModal === "addTrade" && `New Trade Entry (${currentMarket.toUpperCase()} Market)`}
            {activeModal === "deposit" && `Deposit / Invest Funds (${currentMarket.toUpperCase()} Market)`}
            {activeModal === "withdrawal" && `Withdraw Funds (${currentMarket.toUpperCase()} Market)`}
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
              setTradeData({ ...initialTradeState, market: currentMarket });
              setSavedEntryType("trade");
            }} 
            className="space-y-3.5 text-xs sm:text-sm"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Date Input with CTADatePicker */}
              <div>
                <label className="text-gray-400 font-medium mb-1 block">Date</label>
                <CTADatePicker 
                  selectedDate={tradeData.date}
                  onSelectDate={(date) => setTradeData({...tradeData, date})}
                  isDark={isDark}
                  width="100%"
                />
              </div>

              {/* Broker Dropdown */}
              <div>
                <label className="text-gray-400 font-medium mb-1 block">Broker</label>
                <div className={styles.customDropdown}>
                  <button type="button" className={`${isDark ? styles.inputDark : styles.inputLight} ${styles.dropdownTrigger}`}
                    onClick={() => setOpenBrokerDropdown(openBrokerDropdown === "trade" ? null : "trade")}
                    aria-expanded={openBrokerDropdown === "trade"}>
                    <span className={tradeData.broker ? "" : styles.dropdownPlaceholder}>{tradeData.broker || "Select broker"}</span>
                    <ChevronDown className={`${styles.dropdownChevron} ${openBrokerDropdown === "trade" ? styles.dropdownChevronOpen : ""}`} size={16} />
                  </button>
                  {openBrokerDropdown === "trade" && (
                    <div className={isDark ? styles.dropdownMenuDark : styles.dropdownMenuLight}>
                      {rawBrokers.map((broker) => (
                        <button key={broker} type="button" className={styles.dropdownOption}
                          onClick={() => { setTradeData({ ...tradeData, broker }); setOpenBrokerDropdown(null); }}>
                          {broker}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Trade Name (Full width on small screens if needed, ya baaki fields ki tarah set karein) */}
              <div className="sm:col-span-2">
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
                  type="text"
                  inputMode="decimal"
                  placeholder={currentMarket === "crypto" ? "e.g. 0.001" : "e.g. 65"}
                  value={formatNumber(tradeData.qty)}
                  onChange={(e) => setTradeData({...tradeData, qty: normalizeNumber(e.target.value)})}
                  className={isDark ? styles.inputDark : styles.inputLight}
                  required
                />
              </div>

              {/* Brokerage & Charges */}
              <div>
                <label className="text-gray-400 font-medium mb-1 block">Brokerage & Charges</label>
                <input 
                  type="text"
                  inputMode="decimal"
                  placeholder="e.g. 40"
                  value={formatNumber(tradeData.brokerage)}
                  onChange={(e) => setTradeData({...tradeData, brokerage: normalizeNumber(e.target.value)})}
                  className={isDark ? styles.inputDark : styles.inputLight}
                  required
                />
              </div>

              {/* Buy Price */}
              <div>
                <label className="text-gray-400 font-medium mb-1 block">Buy Price ({currencySymbol})</label>
                <input 
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={formatNumber(tradeData.buyPrice)}
                  onChange={(e) => setTradeData({...tradeData, buyPrice: normalizeNumber(e.target.value)})}
                  className={isDark ? styles.inputDark : styles.inputLight}
                  required
                />
              </div>

              {/* Sell Price */}
              <div>
                <label className="text-gray-400 font-medium mb-1 block">Sell Price ({currencySymbol})</label>
                <input 
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={formatNumber(tradeData.sellPrice)}
                  onChange={(e) => setTradeData({...tradeData, sellPrice: normalizeNumber(e.target.value)})}
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
              setDepositData({ ...initialDepositState, market: currentMarket });
              setSavedEntryType("deposit");
            }} 
            className="space-y-3.5 text-xs"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-gray-400 font-medium mb-1 block">Date</label>
                <CTADatePicker 
                  selectedDate={depositData.date}
                  onSelectDate={(date) => setDepositData({...depositData, date})}
                  isDark={isDark}
                  width="100%"
                />
              </div>
              <div>
                <label className="text-gray-400 font-medium mb-1 block">Broker</label>
                <div className={styles.customDropdown}>
                  <button type="button" className={`${isDark ? styles.inputDark : styles.inputLight} ${styles.dropdownTrigger}`}
                    onClick={() => setOpenBrokerDropdown(openBrokerDropdown === "deposit" ? null : "deposit")}
                    aria-expanded={openBrokerDropdown === "deposit"}>
                    <span className={depositData.broker ? "" : styles.dropdownPlaceholder}>{depositData.broker || "Select broker"}</span>
                    <ChevronDown className={`${styles.dropdownChevron} ${openBrokerDropdown === "deposit" ? styles.dropdownChevronOpen : ""}`} size={16} />
                  </button>
                  {openBrokerDropdown === "deposit" && (
                    <div className={isDark ? styles.dropdownMenuDark : styles.dropdownMenuLight}>
                      {rawBrokers.map((broker) => (
                        <button key={broker} type="button" className={styles.dropdownOption}
                          onClick={() => { setDepositData({ ...depositData, broker }); setOpenBrokerDropdown(null); }}>
                          {broker}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-gray-400 font-medium mb-1 block">Amount ({currencySymbol})</label>
                <input 
                  type="text"
                  inputMode="decimal"
                  placeholder="Enter deposit amount"
                  value={formatNumber(depositData.amount)}
                  onChange={(e) => setDepositData({...depositData, amount: normalizeNumber(e.target.value)})}
                  className={isDark ? styles.inputDark : styles.inputLight}
                  required
                />
              </div>
            </div>

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
              setWithdrawalData({ ...initialWithdrawalState, market: currentMarket });
              setSavedEntryType("withdrawal");
            }} 
            className="space-y-3.5 text-xs"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-gray-400 font-medium mb-1 block">Date</label>
                <CTADatePicker 
                  selectedDate={withdrawalData.date}
                  onSelectDate={(date) => setWithdrawalData({...withdrawalData, date})}
                  isDark={isDark}
                  width="100%"
                />
              </div>
              <div>
                <label className="text-gray-400 font-medium mb-1 block">Broker</label>
                <div className={styles.customDropdown}>
                  <button type="button" className={`${isDark ? styles.inputDark : styles.inputLight} ${styles.dropdownTrigger}`}
                    onClick={() => setOpenBrokerDropdown(openBrokerDropdown === "withdrawal" ? null : "withdrawal")}
                    aria-expanded={openBrokerDropdown === "withdrawal"}>
                    <span className={withdrawalData.broker ? "" : styles.dropdownPlaceholder}>{withdrawalData.broker || "Select broker"}</span>
                    <ChevronDown className={`${styles.dropdownChevron} ${openBrokerDropdown === "withdrawal" ? styles.dropdownChevronOpen : ""}`} size={16} />
                  </button>
                  {openBrokerDropdown === "withdrawal" && (
                    <div className={isDark ? styles.dropdownMenuDark : styles.dropdownMenuLight}>
                      {rawBrokers.map((broker) => (
                        <button key={broker} type="button" className={styles.dropdownOption}
                          onClick={() => { setWithdrawalData({ ...withdrawalData, broker }); setOpenBrokerDropdown(null); }}>
                          {broker}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-gray-400 font-medium mb-1 block">Amount ({currencySymbol})</label>
                <input 
                  type="text"
                  inputMode="decimal"
                  placeholder="Enter withdrawal amount"
                  value={formatNumber(withdrawalData.amount)}
                  onChange={(e) => setWithdrawalData({...withdrawalData, amount: normalizeNumber(e.target.value)})}
                  className={isDark ? styles.inputDark : styles.inputLight}
                  required
                />
              </div>
            </div>

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

        {savedEntryType && (
          <div className={styles.successOverlay}>
            <div
              className={isDark ? styles.successDialogDark : styles.successDialogLight}
              role="dialog"
              aria-modal="true"
              aria-labelledby="entry-saved-title"
            >
              <div className={styles.successIcon}>
                <CheckCircle2 size={34} />
              </div>

              <h3 id="entry-saved-title">
                {savedEntryType === "trade" && "Trade Saved"}
                {savedEntryType === "deposit" && "Deposit Saved"}
                {savedEntryType === "withdrawal" && "Withdrawal Saved"}
              </h3>

              <p>
                {savedEntryType === "trade" && "Your trade has been saved successfully."}
                {savedEntryType === "deposit" && "Your deposit has been saved successfully."}
                {savedEntryType === "withdrawal" && "Your withdrawal has been saved successfully."}
              </p>

              <div className={styles.successActions}>
                <button
                  type="button"
                  className={styles.addMoreButton}
                  onClick={() => setSavedEntryType(null)}
                >
                  <PlusCircle size={17} />
                  More Entry
                </button>

                <button
                  type="button"
                  className={styles.closeSuccessButton}
                  onClick={() => {
                    setSavedEntryType(null);
                    onClose();
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
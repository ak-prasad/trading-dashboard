"use client";

import { useEffect, useState, useRef } from "react";
import { Wallet, Plus, RefreshCw, FileText, ArrowDownRight } from "lucide-react";
import { useTheme } from "@/components/Providers";
import styles from "./dashboard.module.css";
import EntryModals from "@/components/EntryModals";

import TotalAssetsCard from "@/components/dashboard/TotalAssetsCard";
import PerformanceOverviewChart from "@/components/dashboard/PerformanceOverviewChart";
import BottomMetricsCard from "@/components/dashboard/BottomMetricsCard";
import BrokerTradingDaysCard from "@/components/dashboard/BrokerTradingDaysCard";
import { BROKER_COLOR_MAP, getBrokerColor, globalColorsList } from "@/utils/brokerColors";
import { fetchWithAuth } from "@/utils/apiClient";

export default function DashboardPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [allData, setAllData] = useState<any[]>([]);
  const [currentMarket, setCurrentMarket] = useState("share");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [entryMenuOpen, setEntryMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<"addTrade" | "deposit" | "withdrawal" | null>(null);
  
  const [pnlMode, setPnlMode] = useState<"monthly" | "daily">("monthly");
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
  const [selectedMonth, setSelectedMonth] = useState("08");
  const [isChartExpanded, setIsChartExpanded] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<{ label: string; value: number; x: number; y: number } | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setEntryMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currencySymbol = currentMarket === "crypto" ? "$" : "₹";

  const fetchMarketData = async () => {
    setIsRefreshing(true);
    const market = localStorage.getItem("selectedMarket") || "share";
    setCurrentMarket(market);

    const cachedData = localStorage.getItem(`sheetData_${market}`);
    if (cachedData && allData.length === 0) {
      try {
        setAllData(JSON.parse(cachedData));
      } catch (e) {
        console.error("Cache parse error:", e);
      }
    }

    const data = await fetchWithAuth(`/api/sheet-data?market=${market}`);
    
    if (data && data.values) {
      setAllData(data.values);
      localStorage.setItem(`sheetData_${market}`, JSON.stringify(data.values));
    }
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchMarketData();
    window.addEventListener("marketChange", fetchMarketData);
    return () => window.removeEventListener("marketChange", fetchMarketData);
  }, []);

  const uniqueYears = Array.from(new Set(allData.map(row => {
    const dateStr = String(row[0] || "");
    const parts = dateStr.split(/[-/]/);
    return parts[0].length === 4 ? parts[0] : (parts[2]?.length === 4 ? parts[2] : null);
  }))).filter(Boolean) as string[];

  const currentYearNum = new Date().getFullYear();
  const dynamicYears = uniqueYears.length > 0 
    ? Array.from(new Set([...uniqueYears, String(currentYearNum)])).sort((a, b) => Number(b) - Number(a))
    : [String(currentYearNum), String(currentYearNum - 1), String(currentYearNum - 2)];

  let totalInvest = 0;
  let totalWithdrawal = 0;
  let totalProfit = 0;
  let totalLoss = 0;
  let totalBrokerage = 0;

  const brokerInvestMap: { [key: string]: number } = {};

  allData.forEach((row) => {
    const deposit = parseFloat(row[2]) || 0;
    const withdrawal = parseFloat(row[3]) || 0;
    const broker = String(row[1] || "Unknown").trim();
    const brokerage = parseFloat(row[8]) || 0;
    const profit = parseFloat(row[9]) || 0;
    const loss = parseFloat(row[10]) || 0;

    totalInvest += deposit;
    totalWithdrawal += withdrawal;
    totalBrokerage += brokerage;
    totalProfit += profit;
    totalLoss += loss;

    if (deposit > 0) {
      brokerInvestMap[broker] = (brokerInvestMap[broker] || 0) + deposit;
    }
  });

  const topBrokers = Object.entries(brokerInvestMap).sort((a, b) => b[1] - a[1]);

  const netBalance = totalInvest - totalWithdrawal + totalProfit - totalLoss - totalBrokerage;
  const netPnlTotal = totalProfit - totalLoss;

  const totalInvestPercentage = totalInvest > 0 ? ((netPnlTotal / totalInvest) * 100).toFixed(2) : "0.00";
  const pnlPercentageVal = totalInvest > 0 ? ((netPnlTotal / totalInvest) * 100).toFixed(2) : "0.00";
  
  const colorsList = globalColorsList;

  const monthsList = [
    { value: "01", label: "January" }, { value: "02", label: "February" }, { value: "03", label: "March" },
    { value: "04", label: "April" }, { value: "05", label: "May" }, { value: "06", label: "June" },
    { value: "07", label: "July" }, { value: "08", label: "August" }, { value: "09", label: "September" },
    { value: "10", label: "October" }, { value: "11", label: "November" }, { value: "12", label: "December" },
  ];

  const monthsShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  let chartPoints: { label: string; value: number }[] = [];

  if (pnlMode === "monthly") {
    const monthlyMap: { [key: string]: number } = {};
    monthsShort.forEach(m => monthlyMap[m] = 0);

    allData.forEach(row => {
      const dateStr = String(row[0] || "").trim();
      if (dateStr.startsWith(selectedYear) || dateStr.includes(selectedYear)) {
        const parts = dateStr.split(/[-/]/);
        let monthIdx = -1;
        if (parts.length === 3) {
          const mNum = parseInt(parts[1], 10);
          monthIdx = mNum - 1;
        }
        if (monthIdx >= 0 && monthIdx < 12) {
          const netPnl = parseFloat(row[12]) || ((parseFloat(row[9]) || 0) - (parseFloat(row[10]) || 0));
          monthlyMap[monthsShort[monthIdx]] += netPnl;
        }
      }
    });

    chartPoints = monthsShort.map(m => ({ label: m, value: monthlyMap[m] }));
  } else {
    const targetPrefix = `${selectedYear}-${selectedMonth}`;
    const dailyMap: { [key: string]: number } = {};

    allData.forEach(row => {
      const dateStr = String(row[0] || "").trim();
      if (dateStr.startsWith(targetPrefix) || dateStr.includes(`-${selectedMonth}-`) || dateStr.includes(`/${selectedMonth}/`)) {
        const netPnl = parseFloat(row[12]) || ((parseFloat(row[9]) || 0) - (parseFloat(row[10]) || 0));
        const parts = dateStr.split(/[-/]/);
        if (parts.length === 3) {
          const dayStr = parts[2].padStart(2, '0');
          dailyMap[dayStr] = (dailyMap[dayStr] || 0) + netPnl;
        }
      }
    });

    chartPoints = Object.entries(dailyMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([day, val]) => ({ label: day, value: val }));

    if (chartPoints.length === 0) {
      chartPoints = Array.from({ length: 10 }, (_, i) => ({ label: String(i + 1).padStart(2, '0'), value: 0 }));
    }
  }

  const rawMax = Math.max(...chartPoints.map(d => d.value), 0);
  const rawMin = Math.min(...chartPoints.map(d => d.value), 0);

  let maxVal = 10;
  if (rawMax > 0) {
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawMax)));
    const normalized = rawMax / magnitude;
    let roundedNormalized = 10;
    if (normalized <= 1) roundedNormalized = 1;
    else if (normalized <= 2) roundedNormalized = 2;
    else if (normalized <= 5) roundedNormalized = 5;
    else roundedNormalized = 10;
    maxVal = roundedNormalized * magnitude;
  } else {
    maxVal = 10;
  }

  let minVal = 0;
  if (pnlMode === 'daily' && rawMin < 0) {
    const absMin = Math.abs(rawMin);
    const magnitude = Math.pow(10, Math.floor(Math.log10(absMin)));
    const normalized = absMin / magnitude;
    let roundedNormalized = 10;
    if (normalized <= 1) roundedNormalized = 1;
    else if (normalized <= 2) roundedNormalized = 2;
    else if (normalized <= 5) roundedNormalized = 5;
    else roundedNormalized = 10;
    minVal = -(roundedNormalized * magnitude);
  } else {
    minVal = 0;
  }

  const range = maxVal - minVal || 1;
  
  const svgHeight = isChartExpanded ? 430 : 200;
  const svgWidth = 600;

  const svgPoints = chartPoints.map((d, index) => {
    const x = (index / (chartPoints.length - 1 || 1)) * (svgWidth - 40) + 20;
    const y = svgHeight - ((d.value - minVal) / range) * (svgHeight - 40) - 20;
    return { x, y, ...d };
  });

  const pathString = svgPoints.reduce((acc, pt, idx) => idx === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`, '');
  const areaString = `${pathString} L ${svgWidth},${svgHeight} L 0,${svgHeight} Z`;

  const [bottomMetric, setBottomMetric] = useState<"profit" | "loss">("profit");

  return (
    <div className={`${styles.container} ${isDark ? styles.darkTheme : styles.lightTheme}`} ref={menuRef}>

    {/* Top Header Section: Left me Heading, Right me Balance aur Action Buttons */}
      <div className={styles.topHeaderBar}>
        <div className={styles.mainHeadingSection}>
          <h1 className={styles.pageTitle}>Dashboard</h1>
          <p className={styles.pageSubTitle}>Happy to see you again. Get update of your asset today!</p>
        </div>

        <div className={styles.topRightGroup} style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div className={styles.balanceSectionGroup}>
            <div className={styles.balanceLabel}>Balance</div>
            <div className={isDark ? styles.balancePillDark : styles.balancePillLight}>
              <Wallet size={16} color="#3b82f6" />
              <span>{currencySymbol}{netBalance.toLocaleString()}</span>
            </div>
          </div>

          <div className={styles.topActionButtons}>
            <div style={{ position: "relative" }}>
              <button 
                className={styles.plusIconButton}
                onClick={() => setEntryMenuOpen(!entryMenuOpen)}
                title="Add New Entry"
              >
                <Plus size={18} />
              </button>

              {entryMenuOpen && (
                <div 
                  className={isDark ? styles.dropdownMenuDark : styles.dropdownMenuLight}
                  style={{
                    position: "absolute", top: "45px", right: "0", zIndex: 50,
                    width: "210px", borderRadius: "12px", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.4)", overflow: "hidden"
                  }}
                >
                  <div style={{ padding: "10px", fontSize: "11px", opacity: 0.6, borderBottom: isDark ? "1px solid #1f2937" : "1px solid #e2e8f0" }}>
                    Select Entry Type
                  </div>
                  <div 
                    className={isDark ? styles.dropdownItemDark : styles.dropdownItemLight}
                    style={{ padding: "12px", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}
                    onClick={() => { setActiveModal("addTrade"); setEntryMenuOpen(false); }}
                  >
                    <FileText size={16} color="#3b82f6" /> Add Trade
                  </div>
                  <div 
                    className={isDark ? styles.dropdownItemDark : styles.dropdownItemLight}
                    style={{ padding: "12px", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}
                    onClick={() => { setActiveModal("deposit"); setEntryMenuOpen(false); }}
                  >
                    <Wallet size={16} color="#10b981" /> Deposit / Invest
                  </div>
                  <div 
                    className={isDark ? styles.dropdownItemDark : styles.dropdownItemLight}
                    style={{ padding: "12px", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}
                    onClick={() => { setActiveModal("withdrawal"); setEntryMenuOpen(false); }}
                  >
                    <ArrowDownRight size={16} color="#eab308" /> Withdrawal
                  </div>
                </div>
              )}
            </div>

            <button onClick={fetchMarketData} className={styles.iconButtonAction} title="Sync Data">
              <RefreshCw size={16} className={isRefreshing ? styles.spinning : ""} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Left and Right Cards */}
      <div className={styles.dashboardGrid}>
        <TotalAssetsCard 
          isDark={isDark}
          currencySymbol={currencySymbol}
          totalInvest={totalInvest}
          totalInvestPercentage={totalInvestPercentage}
          topBrokers={topBrokers}
          colorsList={colorsList}
        />

        <PerformanceOverviewChart 
          isDark={isDark}
          currencySymbol={currencySymbol}
          isChartExpanded={isChartExpanded}
          setIsChartExpanded={setIsChartExpanded}
          pnlMode={pnlMode}
          setPnlMode={setPnlMode}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          dynamicYears={dynamicYears}
          monthsList={monthsList}
          netPnlTotal={netPnlTotal}
          pnlPercentageVal={pnlPercentageVal}
          maxVal={maxVal}
          minVal={minVal}
          svgWidth={svgWidth}
          svgHeight={svgHeight}
          svgPoints={svgPoints}
          pathString={pathString}
          areaString={areaString}
          hoveredPoint={hoveredPoint}
          setHoveredPoint={setHoveredPoint}
        />
      </div>

      {/* Grid: Bottom Metrics & Promo Card */}
      <div className={styles.dashboardGridBottom}>
        <BottomMetricsCard 
          isDark={isDark}
          currencySymbol={currencySymbol}
          bottomMetric={bottomMetric}
          setBottomMetric={setBottomMetric}
          allData={allData}
          dynamicYears={dynamicYears}
          monthsList={monthsList}
        />

        <BrokerTradingDaysCard 
          isDark={isDark}
          allData={allData}
          colorsList={colorsList}
        />
      </div>

      <EntryModals 
        activeModal={activeModal} 
        onClose={() => setActiveModal(null)} 
        isDark={isDark}
        onSaveTrade={() => { setActiveModal(null); fetchMarketData(); }} 
        onSaveDeposit={() => { setActiveModal(null); fetchMarketData(); }}
        onSaveWithdrawal={() => { setActiveModal(null); fetchMarketData(); }}
      />
    </div>
  );
}
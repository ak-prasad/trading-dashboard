import { useState } from "react";
import { TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react";
import CTADropDown from "@/style/CTADropDown";
import styles from "./BottomMetricsCard.module.css";

interface BottomMetricsCardProps {
  isDark: boolean;
  currencySymbol: string;
  bottomMetric: "profit" | "loss";
  setBottomMetric: (metric: "profit" | "loss") => void;
  allData: any[];
  dynamicYears: string[];
  monthsList: { value: string; label: string }[];
}

export default function BottomMetricsCard({
  isDark,
  currencySymbol,
  bottomMetric,
  setBottomMetric,
  allData,
  dynamicYears,
  monthsList,
}: BottomMetricsCardProps) {
  const safeData = Array.isArray(allData) ? allData : [];
  
  
  const extractedYears = Array.from(new Set(safeData.map(row => {
    const dateStr = String(row[0] || "");
    const parts = dateStr.split(/[-/]/);
    return parts[0].length === 4 ? parts[0] : (parts[2]?.length === 4 ? parts[2] : null);
  }))).filter(Boolean) as string[];

  const now = new Date();
  const currentYearStr = String(new Date().getFullYear());
  
  const finalDynamicYears = Array.from(new Set([...extractedYears, currentYearStr]))
    .sort((a, b) => Number(b) - Number(a));

  const defaultYear = finalDynamicYears[0] || currentYearStr;
  const defaultMonth = String(now.getMonth() + 1).padStart(2, '0');

  const getMonthWeeksMap = (yearStr: string, monthStr: string) => {
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    
    const firstDayOfMonth = new Date(year, month - 1, 1);
    const lastDayOfMonth = new Date(year, month, 0);

    const jsFirstDay = firstDayOfMonth.getDay();
    const mondayBasedStartDay = (jsFirstDay + 6) % 7;

    const weeks: { weekLabel: string; days: { dayNum: number; monthOffset: number; label: string }[] }[] = [];
    let currentDate = new Date(year, month - 1, 1 - mondayBasedStartDay);
    let weekCounter = 1;

    while (currentDate <= lastDayOfMonth || currentDate.getDay() !== 1) {
      const currentWeekDays: { dayNum: number; monthOffset: number; label: string }[] = [];
      
      for (let i = 0; i < 7; i++) {
        const dNum = currentDate.getDate();
        const mOffset = currentDate.getMonth() - (month - 1);
        const mObj = monthsList.find(m => m.value === String(currentDate.getMonth() + 1).padStart(2, '0'));
        const mShort = mObj ? mObj.label.slice(0, 3) : "";
        
        currentWeekDays.push({
          dayNum: dNum,
          monthOffset: mOffset,
          label: `${String(dNum).padStart(2, '0')} ${mShort}`
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      weeks.push({
        weekLabel: `Week ${weekCounter}`,
        days: currentWeekDays
      });

      weekCounter++;

      if (currentDate > lastDayOfMonth && currentDate.getDay() === 1) {
        break;
      }
    }

    return weeks;
  };

  const computeDefaultWeek = (yr: string, mth: string) => {
    const weeks = getMonthWeeksMap(yr, mth);
    const currentDayNum = now.getDate();
    const matched = weeks.find(w => w.days.some(d => d.dayNum === currentDayNum && d.monthOffset === 0));
    return matched ? matched.weekLabel : (weeks[0]?.weekLabel || "Week 1");
  };

  const [filterMode, setFilterMode] = useState<"D" | "W" | "M" | "Y">("D");
  
  const [selectedYear, setSelectedYear] = useState<string>(defaultYear);
  const [selectedMonth, setSelectedMonth] = useState<string>(defaultMonth);
  const [selectedWeek, setSelectedWeek] = useState<string>(computeDefaultWeek(defaultYear, defaultMonth));

  const [bottomDropdownOpen, setBottomDropdownOpen] = useState(false);

  const currentMonthWeeks = getMonthWeeksMap(selectedYear, selectedMonth);
  const weeksDropdownOptions = currentMonthWeeks.map(w => ({ value: w.weekLabel, label: w.weekLabel }));

  let chartData: { label: string; val: number }[] = [];

  if (filterMode === "D") {
    const matchedWeek = currentMonthWeeks.find(w => w.weekLabel === selectedWeek) || currentMonthWeeks[0];
    const weekDays = matchedWeek ? matchedWeek.days : [];

    const dailyMap: { [key: string]: number } = {};
    weekDays.forEach(d => {
      dailyMap[d.label] = 0;
    });

    safeData.forEach(row => {
      const dateStr = String(row[0] || "").trim();
      const parts = dateStr.split(/[-/]/);
      if (parts.length === 3) {
        const rYear = parts[0].length === 4 ? parts[0] : parts[2];
        const rMonth = parts[1].padStart(2, '0');
        const rDay = parseInt(parts[0].length === 4 ? parts[2] : parts[0], 10);

        const foundDayObj = weekDays.find(d => d.dayNum === rDay);
        if (foundDayObj && rYear === selectedYear && rMonth === selectedMonth) {
          const profit = parseFloat(row[9]) || 0;
          const loss = parseFloat(row[10]) || 0;
          const val = bottomMetric === "profit" ? profit : loss;
          if (dailyMap[foundDayObj.label] !== undefined) {
            dailyMap[foundDayObj.label] += val;
          }
        }
      }
    });

    chartData = Object.entries(dailyMap).map(([label, val]) => ({ label, val }));
  } 
  else if (filterMode === "W") {
    const weekMap: { [key: string]: number } = {};
    currentMonthWeeks.forEach(w => weekMap[w.weekLabel] = 0);

    safeData.forEach(row => {
      const dateStr = String(row[0] || "").trim();
      const parts = dateStr.split(/[-/]/);
      if (parts.length === 3) {
        let rYear = parts[0].length === 4 ? parts[0] : parts[2];
        let rMonth = parts[1].padStart(2, '0');
        let rDay = parseInt(parts[0].length === 4 ? parts[2] : parts[0], 10);

        if (rYear === selectedYear && rMonth === selectedMonth) {
          const foundWeek = currentMonthWeeks.find(w => w.days.some(d => d.dayNum === rDay && d.monthOffset === 0));
          if (foundWeek) {
            const profit = parseFloat(row[9]) || 0;
            const loss = parseFloat(row[10]) || 0;
            const val = bottomMetric === "profit" ? profit : loss;
            weekMap[foundWeek.weekLabel] += val;
          }
        }
      }
    });

    chartData = Object.entries(weekMap).map(([label, val]) => ({ label, val }));
  } 
  else if (filterMode === "M") {
    const monthsShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthMap: { [key: string]: number } = {};
    monthsShort.forEach(m => monthMap[m] = 0);

    safeData.forEach(row => {
      const dateStr = String(row[0] || "").trim();
      if (dateStr.includes(selectedYear)) {
        const parts = dateStr.split(/[-/]/);
        if (parts.length === 3) {
          const mNum = parseInt(parts[1], 10) - 1;
          if (mNum >= 0 && mNum < 12) {
            const profit = parseFloat(row[9]) || 0;
            const loss = parseFloat(row[10]) || 0;
            const val = bottomMetric === "profit" ? profit : loss;
            monthMap[monthsShort[mNum]] += val;
          }
        }
      }
    });

    chartData = monthsShort.map(label => ({ label, val: monthMap[label] }));
  } 
  else if (filterMode === "Y") {
    const yearMap: { [key: string]: number } = {};
    finalDynamicYears.forEach(y => yearMap[y] = 0);

    safeData.forEach(row => {
      const dateStr = String(row[0] || "").trim();
      const parts = dateStr.split(/[-/]/);
      let rYear = parts[0].length === 4 ? parts[0] : (parts[2]?.length === 4 ? parts[2] : "");
      if (rYear && yearMap[rYear] !== undefined) {
        const profit = parseFloat(row[9]) || 0;
        const loss = parseFloat(row[10]) || 0;
        const val = bottomMetric === "profit" ? profit : loss;
        yearMap[rYear] += val;
      }
    });

    chartData = finalDynamicYears.sort().map(label => ({ label, val: yearMap[label] }));
  }

  const maxBarVal = Math.max(...chartData.map(d => d.val), 100);
  const totalMetricVal = chartData.reduce((acc, curr) => acc + curr.val, 0);

  return (
    <div className={styles.dashboardGridBottom}>
      <div className={isDark ? styles.cardDark : styles.cardLight}>
        
        <div className={styles.cardHeaderTop}>
          
          <div style={{ position: "relative" }}>
            <button 
              className={styles.metricSelectDropdownBtn}
              onClick={() => setBottomDropdownOpen(!bottomDropdownOpen)}
            >
              {bottomMetric === "profit" ? <TrendingUp size={16} color="#10b981" /> : <TrendingDown size={16} color="#ef4444" />}
              <span>{bottomMetric === "profit" ? "Total Profits" : "Total Losses"}</span>
            </button>

            {bottomDropdownOpen && (
              <div className={isDark ? styles.dropdownMenuDark : styles.dropdownMenuLight} style={{ position: "absolute", top: "40px", left: "0", zIndex: 40, width: "160px", borderRadius: "10px", overflow: "hidden" }}>
                <div 
                  className={isDark ? styles.dropdownItemDark : styles.dropdownItemLight}
                  style={{ padding: "10px 12px", fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
                  onClick={() => { setBottomMetric("profit"); setBottomDropdownOpen(false); }}
                >
                  <TrendingUp size={14} color="#10b981" /> Total Profits
                </div>
                <div 
                  className={isDark ? styles.dropdownItemDark : styles.dropdownItemLight}
                  style={{ padding: "10px 12px", fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
                  onClick={() => { setBottomMetric("loss"); setBottomDropdownOpen(false); }}
                >
                  <TrendingDown size={14} color="#ef4444" /> Total Losses
                </div>
              </div>
            )}
          </div>

          <div className={styles.filterControlsRight}>
            
            {filterMode === "D" && (
              <div style={{ display: "flex", gap: "8px" }}>
                <CTADropDown 
                  options={weeksDropdownOptions.length > 0 ? weeksDropdownOptions : [{ value: "Week 1", label: "Week 1" }]}
                  selectedValue={selectedWeek}
                  onSelect={setSelectedWeek}
                  isDark={isDark}
                  width="100px"
                />
                <CTADropDown 
                  options={monthsList}
                  selectedValue={selectedMonth}
                  onSelect={setSelectedMonth}
                  isDark={isDark}
                  width="110px"
                />
                <CTADropDown 
                  options={finalDynamicYears.map(y => ({ value: y, label: y }))}
                  selectedValue={selectedYear}
                  onSelect={setSelectedYear}
                  isDark={isDark}
                  width="90px"
                />
              </div>
            )}

            {filterMode === "W" && (
              <div style={{ display: "flex", gap: "8px" }}>
                <CTADropDown 
                  options={monthsList}
                  selectedValue={selectedMonth}
                  onSelect={setSelectedMonth}
                  isDark={isDark}
                  width="110px"
                />
                <CTADropDown 
                  options={finalDynamicYears.map(y => ({ value: y, label: y }))}
                  selectedValue={selectedYear}
                  onSelect={setSelectedYear}
                  isDark={isDark}
                  width="90px"
                />
              </div>
            )}

            {filterMode === "M" && (
              <CTADropDown 
                options={finalDynamicYears.map(y => ({ value: y, label: y }))}
                selectedValue={selectedYear}
                onSelect={setSelectedYear}
                isDark={isDark}
                width="95px"
              />
            )}

            <div className={styles.dwmToggleContainer}>
              {(["D", "W", "M", "Y"] as const).map((mode) => (
                <button
                  key={mode}
                  className={`${styles.dwmBtn} ${filterMode === mode ? styles.dwmBtnActive : ""}`}
                  onClick={() => setFilterMode(mode)}
                >
                  {mode}
                </button>
              ))}
            </div>

          </div>
        </div>

        <div className={styles.cardMainValVal}>
          {currencySymbol}{totalMetricVal.toLocaleString()}
        </div>
        <div className={styles.growthBadge} style={{ color: bottomMetric === "profit" ? "#10b981" : "#ef4444", backgroundColor: bottomMetric === "profit" ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)" }}>
          <ArrowUpRight size={14} /> {bottomMetric === "profit" ? "Net Profit Overview" : "Net Loss Overview"}
        </div>

        <div className={styles.profitBarsContainer}>
          {chartData.map((item, idx) => {
            const heightPercent = maxBarVal > 0 ? (item.val / maxBarVal) * 100 : 0;
            const isProfit = bottomMetric === "profit";

            return (
              <div className={styles.barItem} key={idx}>
                <span className={styles.barTopAmount}>
                  {item.val !== 0 ? `${currencySymbol}${Math.abs(item.val) > 1000 ? (item.val / 1000).toFixed(1) + 'K' : item.val}` : "0"}
                </span>
                
                <div 
                  className={styles.barFill} 
                  style={{ 
                    height: `${Math.max(heightPercent, 10)}%`, 
                    background: isProfit 
                      ? "linear-gradient(180deg, #10b981 0%, rgba(16, 185, 129, 0.2) 100%)" 
                      : "linear-gradient(180deg, #ef4444 0%, rgba(239, 68, 68, 0.2) 100%)",
                    boxShadow: isProfit ? "0 0 12px rgba(16, 185, 129, 0.25)" : "0 0 12px rgba(239, 68, 68, 0.25)"
                  }}
                ></div>
                <small className={styles.barLabel}>{item.label}</small>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
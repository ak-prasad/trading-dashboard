"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTheme } from "@/components/Providers";
import CTADropDown from "@/style/CTADropDown";
import styles from "./calendar.module.css";
import { fetchWithAuth } from "@/utils/apiClient";
import { getBrokersByMarket } from "@/utils/brokersList";

export default function CalendarPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [currentMarket, setCurrentMarket] = useState("share");
  const [allData, setAllData] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 1));
  const [selectedDateStr, setSelectedDateStr] = useState("");
  const [selectedBroker, setSelectedBroker] = useState("ALL");

  // Market switch event listener
  useEffect(() => {
    const updateMarketFromStorage = () => {
      const market = localStorage.getItem("selectedMarket") || "share";
      setCurrentMarket(market);
      setSelectedBroker("ALL");
    };

    updateMarketFromStorage();

    window.addEventListener("marketChange", updateMarketFromStorage);
    return () => window.removeEventListener("marketChange", updateMarketFromStorage);
  }, []);

  const brokers = getBrokersByMarket(currentMarket);
  const currencySymbol = currentMarket === "crypto" ? "$" : "₹";

  const formatNumber = (value: number) => {
  return Number(value).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });
};

  // Fetch data with market parameter and clean non-flickering cache sync
  useEffect(() => {
    let isMounted = true;
    const marketParam = currentMarket === "crypto" ? "crypto" : "share";
    const apiEndpoint = `/api/sheet-data?market=${marketParam}`;

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const currentTodayStr = `${yyyy}-${mm}-${dd}`;

    const cacheKey = `cache_calendar_${marketParam}`;
    const cachedData = localStorage.getItem(cacheKey);

    // 1. Agar cache mil gaya toh turant set karein taaki blank na ho
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        if (Array.isArray(parsed) && isMounted) {
          setAllData(parsed);
          setSelectedDateStr(currentTodayStr);
          setCurrentDate(new Date(yyyy, Number(mm) - 1, 1));
        }
      } catch (error) {
        console.error("Cache parse error:", error);
      }
    } else {
      if (isMounted) setAllData([]);
    }

    // 2. Background me fresh fetch karein bina UI ko flicker kiye
    fetchWithAuth(apiEndpoint)
      .then((data) => {
        if (isMounted && data?.values && Array.isArray(data.values)) {
          setAllData(data.values);
          setSelectedDateStr(currentTodayStr);
          setCurrentDate(new Date(yyyy, Number(mm) - 1, 1));
          localStorage.setItem(cacheKey, JSON.stringify(data.values));
        }
      })
      .catch((error) => {
        console.error("Failed to fetch sheet data:", error);
      });

    return () => {
      isMounted = false;
    };
  }, [currentMarket]);

  // Filter rows strictly by selected Broker AND Market/Brokers List
  const filteredByBrokerData = allData.filter((row) => {
    const rowBroker = String(row[1] || "").trim().toLowerCase();
    
    // 1. Broker Filter
    const matchesBroker = 
      selectedBroker === "ALL" || 
      rowBroker === selectedBroker.trim().toLowerCase();

    // 2. Strict Market Filter (Validates if row broker belongs to current market list or explicit market column)
    const validBrokersForMarket = brokers.map(b => b.toLowerCase());
    const isRowInCurrentMarket = validBrokersForMarket.includes(rowBroker);

    return matchesBroker && isRowInCurrentMarket;
  });

  const dateWiseData: Record<string, any[]> = {};

  filteredByBrokerData.forEach((row) => {
    const date = row[0];

    if (!date) return;

    if (!dateWiseData[date]) {
      dateWiseData[date] = [];
    }

    dateWiseData[date].push(row);
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const selectedRows = dateWiseData[selectedDateStr] || [];

  const selectedTrades = selectedRows.filter((row) => {
    const tradeName = row[4];
    return tradeName && tradeName !== "-" && tradeName.trim() !== "";
  });

  let netPnl = 0;
  let grossPnl = 0;
  let brokerage = 0;

  selectedRows.forEach((row) => {
    netPnl += parseFloat(row[12]) || 0;
    grossPnl += parseFloat(row[11]) || 0;
    brokerage += parseFloat(row[8]) || 0;
  });

  const brokerOptions = [
    { value: "ALL", label: "All Brokers" },
    ...brokers.map((broker) => ({ value: broker, label: broker })),
  ];

  return (
    <div className={`${styles.container} ${isDark ? styles.darkTheme : styles.lightTheme}`}>
      <div className={styles.pageHeader} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
  <div>
    <h1 className={styles.pageTitle}>P&amp;L Calendar</h1>
    <p className={styles.pageSubtitle} style={{ fontSize: "13px", color: "var(--calendar-muted, #94a3b8)", margin: "4px 0 0 0" }}>
      Track your daily trading performance, profits, and losses.
    </p>
  </div>

  <div className={styles.brokerFilter}>
    <span>Broker:</span>
    <CTADropDown
      options={brokerOptions}
      selectedValue={selectedBroker}
      onSelect={(value) => setSelectedBroker(value)}
      isDark={isDark}
      width="150px"
    />
  </div>
</div>

      <div className={styles.layoutGrid}>
        <div className={isDark ? styles.cardDark : styles.cardLight}>
          <div className={styles.calendarHeader}>
            <span className={styles.calendarTitle}>
              {monthNames[month]} {year}
            </span>

            <div className={styles.calendarNavigation}>
              <button
                onClick={handlePrevMonth}
                className={styles.navButton}
                aria-label="Previous month"
              >
                <ChevronLeft size={16} />
              </button>

              <button
                onClick={handleNextMonth}
                className={styles.navButton}
                aria-label="Next month"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className={styles.weekDaysGrid}>
            <span>SUN</span>
            <span>MON</span>
            <span>TUE</span>
            <span>WED</span>
            <span>THU</span>
            <span>FRI</span>
            <span>SAT</span>
          </div>

          <div className={styles.daysGrid}>
            {Array.from({ length: firstDayIndex }).map((_, index) => (
              <div key={`empty-${index}`} />
            ))}

            {Array.from({ length: totalDays }).map((_, index) => {
              const dayNum = index + 1;
              const formattedDay = String(dayNum).padStart(2, "0");
              const formattedMonth = String(month + 1).padStart(2, "0");
              const dateKey = `${year}-${formattedMonth}-${formattedDay}`;

              const dayRows = dateWiseData[dateKey] || [];
              const dayTotalPnl = dayRows.reduce(
                (sum, row) => sum + (parseFloat(row[12]) || 0),
                0
              );

              const isSelected = selectedDateStr === dateKey;
              const hasData = dayRows.length > 0;

              const bgClass = hasData
                ? dayTotalPnl >= 0
                  ? styles.profitDayBg
                  : styles.lossDayBg
                : "";

              return (
                <button
                  type="button"
                  key={dateKey}
                  onClick={() => setSelectedDateStr(dateKey)}
                  className={`${styles.dayCell} ${bgClass} ${
                    isSelected ? styles.selectedDay : ""
                  }`}
                >
                  <span className={styles.dayNumber}>{dayNum}</span>

                  {hasData && (
                    <span className={styles.dayPnlAmount}>
                      {dayTotalPnl >= 0
                        ? `+${formatNumber(dayTotalPnl)}`
                        : `-${formatNumber(Math.abs(dayTotalPnl))}`}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className={styles.detailsSection}>
          <div>
            <h3 className={styles.sectionTitle}>
              Summary ({selectedDateStr || "Select a date"})
            </h3>

            <div className={isDark ? styles.summaryBoxDark : styles.summaryBoxLight}>
              <div className={styles.summaryItemLeft}>
                <p className={styles.summaryItemLabel}>Net P&amp;L</p>
                <p
                  className={`${styles.summaryItemValue} ${
                    netPnl >= 0 ? styles.profitText : styles.lossText
                  }`}
                >
                  {netPnl >= 0
                    ? `+${currencySymbol}${netPnl.toLocaleString()}`
                    : `-${currencySymbol}${Math.abs(netPnl).toLocaleString()}`}
                </p>
              </div>

              <div className={styles.summaryItemRight}>
                <p className={styles.summaryItemLabel}>Gross P&amp;L</p>
                <p
                  className={`${styles.summaryItemValue} ${
                    grossPnl >= 0 ? styles.profitText : styles.lossText
                  }`}
                >
                  {grossPnl >= 0
                    ? `+${currencySymbol}${grossPnl.toLocaleString()}`
                    : `-${currencySymbol}${Math.abs(grossPnl).toLocaleString()}`}
                </p>
              </div>

              <div className={styles.summaryItemLeft}>
                <p className={styles.summaryItemLabel}>Brokerage</p>
                <p className={styles.summaryItemValue}>
                  {currencySymbol}
                  {brokerage.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className={styles.sectionTitle}>Trades</h3>

            <div className={styles.tradesContainer}>
              {selectedTrades.length > 0 ? (
                selectedTrades.map((trade, idx) => {
                  const brokerName = trade[1] || "Broker";
                  const tradeName = trade[4] || "Trade Entry";
                  const qty = trade[5] || "0";
                  const buyAvg = trade[6] || "0";
                  const sellAvg = trade[7] || "0";
                  const pnl = parseFloat(trade[11]) || 0;

                  const percentage =
                    parseFloat(buyAvg) > 0
                      ? (
                          (pnl / (parseFloat(buyAvg) * parseFloat(qty))) *
                          100
                        ).toFixed(1)
                      : "0.0";

                  return (
                    <article
                      key={idx}
                      className={`${
                        isDark ? styles.tradeCardDark : styles.tradeCardLight
                      } ${
                        pnl >= 0 ? styles.tradeProfitCard : styles.tradeLossCard
                      }`}
                    >
                      <span className={styles.tradeAccent} />

                      <div className={styles.tradeHeader}>
                        <div className={styles.tradeTitleGroup}>
                          <span className={styles.tradeName}>{tradeName}</span>
                          <span className={styles.tradeBroker}>
                            {brokerName}
                          </span>
                        </div>

                        <div className={styles.tradePnlGroup}>
                          <span
                            className={`${styles.tradePnl} ${
                              pnl >= 0 ? styles.profitText : styles.lossText
                            }`}
                          >
                            {pnl >= 0
                              ? `+${currencySymbol}${pnl.toLocaleString()}`
                              : `-${currencySymbol}${Math.abs(pnl).toLocaleString()}`}
                          </span>

                          <span
                            className={`${styles.tradePercent} ${
                              pnl >= 0 ? styles.profitBadge : styles.lossBadge
                            }`}
                          >
                            {pnl >= 0 ? "+" : ""}
                            {percentage}%
                          </span>
                        </div>
                      </div>

                      <div className={styles.tradeDetails}>
                        <span>
                          Qty: <strong>{qty}</strong>
                        </span>
                        <span className={styles.tradeSeparator}>•</span>
                        <span>
                          Buy avg: <strong>{currencySymbol}{buyAvg}</strong>
                        </span>
                        <span className={styles.tradeSeparator}>•</span>
                        <span>
                          Sell avg: <strong>{currencySymbol}{sellAvg}</strong>
                        </span>
                      </div>
                    </article>
                  );
                })
              ) : (
                <div
                  className={`${
                    isDark ? styles.cardDark : styles.cardLight
                  } ${styles.emptyState}`}
                >
                  No trades found for this date.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
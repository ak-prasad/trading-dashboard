"use client";

import { useEffect, useState } from "react";
import { Wallet, TrendingUp, TrendingDown, ArrowDownRight, ChevronLeft, ChevronRight, Layers } from "lucide-react";
import { useTheme } from "@/components/Providers";
import CTADropDown from "@/style/CTADropDown";
import styles from "./transaction.module.css";
import { fetchWithAuth } from "@/utils/apiClient";

export default function TransactionsPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [allData, setAllData] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState("08"); // Default August (08)
  const [selectedYear, setSelectedYear] = useState("2026");
  const [filterType, setFilterType] = useState("ALL");
  const [currentMarket, setCurrentMarket] = useState("share");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const currencySymbol = currentMarket === "crypto" ? "$" : "₹";

  useEffect(() => {
    const fetchMarketData = async () => {
      const market = localStorage.getItem("selectedMarket") || "share";
      setCurrentMarket(market);

      const apiEndpoint = `/api/sheet-data?market=${market}`;
      const cacheKey = `cache_${apiEndpoint}`;

      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        try {
          const parsed = JSON.parse(cachedData);
          if (parsed && parsed.length > 0) {
            setAllData(parsed);
          }
        } catch (e) {
          console.error("Cache parse error:", e);
        }
      }

      try {
        const data = await fetchWithAuth(apiEndpoint);
        if (data && data.values) {
          setAllData(data.values);
          localStorage.setItem(cacheKey, JSON.stringify(data.values));
        }
      } catch (err) {
        console.error("Failed to fetch sheet data:", err);
      }
    };

    fetchMarketData();

    window.addEventListener("marketChange", fetchMarketData);
    return () => window.removeEventListener("marketChange", fetchMarketData);
  }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const parts = dateStr.split(/[-/]/);
    if (parts.length === 3) {
      let year = parts[0];
      let month = parts[1];
      let day = parts[2];

      if (parts[0].length !== 4) {
        day = parts[0];
        month = parts[1];
        year = parts[2];
      }

      const monthNamesShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthIndex = parseInt(month, 10) - 1;
      
      if (monthIndex >= 0 && monthIndex < 12) {
        return `${day}-${monthNamesShort[monthIndex]}-${year}`;
      }
    }
    return dateStr;
  };

  const filteredByDate = allData.filter((row) => {
    const dateStr = String(row[0] || "").trim();
    if (!dateStr) return false;

    if (dateStr.startsWith(`${selectedYear}-${selectedMonth}`)) {
      return true;
    }

    const parts = dateStr.split(/[-/]/);
    if (parts.length === 3) {
      const year = parts[0].length === 4 ? parts[0] : parts[2];
      const month = parts[1];
      return year === selectedYear && month === selectedMonth;
    }

    return dateStr.includes(`-${selectedMonth}-`) && dateStr.includes(selectedYear);
  });

  const finalFilteredData = filteredByDate.filter((row) => {
    const deposit = parseFloat(row[2]) || 0;
    const withdrawal = parseFloat(row[3]) || 0;
    const profit = parseFloat(row[9]) || 0;
    const loss = parseFloat(row[10]) || 0;

    if (filterType === "INVEST") return deposit > 0;
    if (filterType === "WITHDRAWAL") return withdrawal > 0;
    if (filterType === "PROFIT") return profit > 0;
    if (filterType === "LOSS") return loss > 0;
    return true;
  });

  const totalPages = Math.ceil(finalFilteredData.length / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentTransactionsSlice = finalFilteredData.slice(startIndex, startIndex + rowsPerPage);

  let totalInvest = 0;
  let totalWithdrawal = 0;
  let totalProfit = 0;
  let totalLoss = 0;
  let totalBrokerage = 0;

  filteredByDate.forEach((row) => {
    totalInvest += parseFloat(row[2]) || 0;
    totalWithdrawal += parseFloat(row[3]) || 0;
    totalBrokerage += parseFloat(row[8]) || 0;
    totalProfit += parseFloat(row[9]) || 0;
    totalLoss += parseFloat(row[10]) || 0;
  });

  const monthsList = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const uniqueYears = Array.from(new Set(allData.map(row => {
    const dateStr = String(row[0] || "");
    const parts = dateStr.split(/[-/]/);
    return parts[0].length === 4 ? parts[0] : (parts[2]?.length === 4 ? parts[2] : null);
  }))).filter(Boolean) as string[];

  const currentYearNum = new Date().getFullYear();
  const dynamicYears = uniqueYears.length > 0 
    ? Array.from(new Set([...uniqueYears, String(currentYearNum)])).sort((a, b) => Number(b) - Number(a))
    : [String(currentYearNum), String(currentYearNum - 1), String(currentYearNum - 2)];

  const filterOptionsList = [
    { value: "ALL", label: "All Transactions" },
    { value: "INVEST", label: "Invest / Deposit" },
    { value: "WITHDRAWAL", label: "Withdrawal" },
    { value: "PROFIT", label: "Profit Only" },
    { value: "LOSS", label: "Loss Only" },
  ];

  return (
    <div className={`${styles.container} ${isDark ? styles.darkTheme : styles.lightTheme}`}>
      
      {/* 1. Top Heading Section */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Transactions History</h1>
          <p className={styles.pageSubtitle}>Monitor all fund deposits, withdrawals, and ledger flow ({currentMarket.toUpperCase()} MARKET)</p>
        </div>
      </div>

      {/* 2. Summary Cards Grid (Pehle kar diya gaya hai) */}
      <div className={styles.summaryGrid}>
        <div className={`${isDark ? styles.cardDark : styles.cardLight} ${styles.investCard}`}
          style={{ "--currency-symbol": `"${currencySymbol}"` } as React.CSSProperties}
        >
          <div className={styles.cardHeader}>
            <Wallet size={15} color="#3b82f6" /> INVEST
          </div>
          <div className={styles.cardValue}>{currencySymbol}{totalInvest.toLocaleString()}</div>
          <div className={styles.cardSubText}>Total Invested</div>
        </div>

        <div className={isDark ? styles.cardDark : styles.cardLight}>
          <div className={styles.cardHeader}>
            <ArrowDownRight size={15} color="#eab308" /> WITHDRAWAL
          </div>
          <div className={styles.cardValue}>{currencySymbol}{totalWithdrawal.toLocaleString()}</div>
          <div className={styles.cardSubText}>Total Withdrawal</div>
        </div>

        <div className={isDark ? styles.cardDark : styles.cardLight}>
          <div className={styles.cardHeader}>
            <TrendingUp size={15} color="#10b981" /> TOTAL PROFIT
          </div>
          <div className={`${styles.cardValue} ${styles.profitText}`}>{currencySymbol}{totalProfit.toLocaleString()}</div>
          <div className={styles.cardSubText}>Filtered Month</div>
        </div>

        <div className={isDark ? styles.cardDark : styles.cardLight}>
          <div className={styles.cardHeader}>
            <TrendingDown size={15} color="#ef4444" /> TOTAL LOSS
          </div>
          <div className={`${styles.cardValue} ${styles.lossText}`}>{currencySymbol}{totalLoss.toLocaleString()}</div>
          <div className={styles.cardSubText}>Filtered Month</div>
        </div>

        <div className={isDark ? styles.cardDark : styles.cardLight}>
          <div className={styles.cardHeader}>
            <Layers size={15} color="#a855f7" /> BROKERAGE
          </div>
          <div className={`${styles.cardValue} ${styles.brokerageText}`}>{currencySymbol}{totalBrokerage.toLocaleString()}</div>
          <div className={styles.cardSubText}>Broker Fees</div>
        </div>
      </div>

      {/* 3. Month, Year & Filter Dropdown Section (Ab cards ke niche aa gaya hai) */}
      <div className={isDark ? styles.filterCardDark : styles.filterCardLight}>
        <div className={styles.filterGroup}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span className={styles.label}>Month:</span>
            <CTADropDown 
              options={monthsList}
              selectedValue={selectedMonth}
              onSelect={(val) => {
                setSelectedMonth(val);
                setCurrentPage(1);
              }}
              isDark={isDark}
              width="125px"
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span className={styles.label}>Year:</span>
            <CTADropDown 
              options={dynamicYears.map(y => ({ value: y, label: y }))}
              selectedValue={selectedYear}
              onSelect={(val) => {
                setSelectedYear(val);
                setCurrentPage(1);
              }}
              isDark={isDark}
              width="90px"
            />
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span className={styles.label}>Filter:</span>
          <CTADropDown 
            options={filterOptionsList}
            selectedValue={filterType}
            onSelect={(val) => {
              setFilterType(val);
              setCurrentPage(1);
            }}
            isDark={isDark}
            width="160px"
          />
        </div>
      </div>

      {/* 4. Transactions Table & Mobile Cards Section */}
      <div className={isDark ? styles.tableWrapperDark : styles.tableWrapperLight}>
        <div className={styles.tableTitleBar}>
          <h2>
            Transactions Ledger ({currentMarket.toUpperCase()}) — {
              monthsList.find(m => m.value === selectedMonth)?.label
            } {selectedYear}
          </h2>
          <span className={styles.entryCount}>{finalFilteredData.length} Entries</span>
        </div>

        {/* Desktop Table View */}
        <div className={`${styles.tableContainer} ${styles.desktopTableOnly}`}>
          <table className={styles.table}>
            <thead className={isDark ? styles.tableHeaderDark : styles.tableHeaderLight}>
              <tr>
                <th className={styles.tableCell}>S.No</th>
                <th className={styles.tableCell}>Date</th>
                <th className={styles.tableCell}>Broker</th>
                <th className={styles.tableCell}>Trade</th>
                <th className={styles.tableCell}>Profit ({currencySymbol})</th>
                <th className={styles.tableCell}>Loss ({currencySymbol})</th>
                <th className={styles.tableCell}>Invest ({currencySymbol})</th>
                <th className={styles.tableCell}>Withdrawal ({currencySymbol})</th>
                <th className={styles.tableCell}>Brokerage</th>
                <th className={styles.tableCell}>Net P&L ({currencySymbol})</th>
              </tr>
            </thead>
            <tbody>
              {finalFilteredData.length > 0 ? (
                currentTransactionsSlice.map((row, index) => {
                  const netPnlVal = parseFloat(row[12]) || 0;
                  return (
                    <tr key={index} className={isDark ? styles.tableRowDark : styles.tableRowLight}>
                      <td className={styles.tableCell}>{startIndex + index + 1}</td>
                      <td className={styles.tableCell}>{formatDate(row[0])}</td>
                      <td className={styles.tableCell}>
                        <span className={styles.brokerBadge}>{row[1] || "-"}</span>
                      </td>
                      <td className={`${styles.tableCell} ${styles.boldText}`}>{row[4] || "-"}</td>
                      <td className={`${styles.tableCell} ${styles.profitText}`}>{row[9] || 0}</td>
                      <td className={`${styles.tableCell} ${styles.lossText}`}>{row[10] || 0}</td>
                      <td className={`${styles.tableCell} ${styles.investText}`}>{row[2] || 0}</td>
                      <td className={`${styles.tableCell} ${styles.withdrawalText}`}>{row[3] || 0}</td>
                      <td className={styles.tableCell}>{row[8] || 0}</td>
                      <td className={`${styles.tableCell}`}>
                        <span className={`${styles.pnlBadge} ${netPnlVal >= 0 ? styles.profitBadge : styles.lossBadge}`}>
                          {netPnlVal >= 0 ? `+${currencySymbol}${row[12] || 0}` : `-${currencySymbol}${Math.abs(netPnlVal)}`}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className={styles.emptyCell}>
                    No transactions found for this month/filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

       {/* Mobile Card List View */}
        <div className={styles.mobileCardList}>
          {finalFilteredData.length > 0 ? (
            currentTransactionsSlice.map((row, index) => {
              const netPnlVal = parseFloat(row[12]) || 0;
              const brokerName = row[1] || "-";
              const tradeName = row[4] || "-";
              const profitVal = parseFloat(row[9]) || 0;
              const lossVal = parseFloat(row[10]) || 0;
              const brokerageVal = parseFloat(row[8]) || 0;
              
              return (
                <div key={index} className={isDark ? styles.mobileCardDark : styles.mobileCardLight}>
                  
                  {/* Section 1: Top (S.No, Date & Broker Badge) */}
                  <div className={styles.mobileCardHeader}>
                    <span className={styles.mobileDateText}>
                      S.No: {startIndex + index + 1} — {formatDate(row[0])}
                    </span>
                    <span className={styles.brokerBadge}>{brokerName}</span>
                  </div>
                  
                  {/* Section 2: Middle (Trade Name Big & Brokerage Small) */}
                  <div className={styles.mobileCardBody}>
                    <div className={styles.mobileInfoRow}>
                      <span className={styles.mobileTradeTitle}>{tradeName}</span>
                      {profitVal > 0 && (
                        <span className={styles.profitText}>+{currencySymbol}{profitVal}</span>
                      )}
                      {lossVal > 0 && (
                        <span className={styles.lossText}>-{currencySymbol}{lossVal}</span>
                      )}
                    </div>
                    <div className={styles.mobileInfoRow}>
                      <span className={styles.mobileBrokerageSmall}>Brokerage: {currencySymbol}{brokerageVal}</span>
                    </div>
                  </div>

                  {/* Section 3: Bottom (NET P&L) */}
                  <div className={styles.mobileCardFooter}>
                    <span className="text-xs font-bold text-gray-400 uppercase">NET P&L</span>
                    <span className={`${styles.pnlBadge} ${netPnlVal >= 0 ? styles.profitBadge : styles.lossBadge}`}>
                      {netPnlVal >= 0 ? `+${currencySymbol}${netPnlVal}` : `-${currencySymbol}${Math.abs(netPnlVal)}`}
                    </span>
                  </div>

                </div>
              );
            })
          ) : (
            <div className={styles.emptyCellMobile}>
              No transactions found for this month/filter.
            </div>
          )}
        </div>

      </div>

      {/* 5. Pagination Section */}
      {finalFilteredData.length > 0 && (
        <div className={styles.paginationContainer}>
          <span className={styles.pageInfoText}>
            Showing <strong>{startIndex + 1}</strong> to{" "}
            <strong>{Math.min(startIndex + rowsPerPage, finalFilteredData.length)}</strong> of{" "}
            <strong>{finalFilteredData.length}</strong> entries
          </span>

          <div className={styles.paginationButtons}>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={styles.pageNavBtn}
            >
              <ChevronLeft size={16} /> Prev
            </button>

            <span className={styles.pageNumberIndicator}>
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={styles.pageNavBtn}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
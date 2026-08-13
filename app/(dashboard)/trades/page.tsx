"use client";

import { useEffect, useState } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Layers, 
  ShieldCheck, 
  DollarSign,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useTheme } from "@/components/Providers";
import CTADropDown from "@/style/CTADropDown";
import { fetchWithAuth } from "@/utils/apiClient";
import styles from "./trades.module.css";

export default function TradesPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [currentMarket, setCurrentMarket] = useState("share");
  const [allData, setAllData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBroker, setSelectedBroker] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, WIN, LOSS

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10; // Ek baar me kitne trades dikhenge

  // Market switch event listener
  useEffect(() => {
    const updateMarketFromStorage = () => {
      const market = localStorage.getItem("selectedMarket") || "share";
      setCurrentMarket(market);
      setSelectedBroker("ALL");
      setCurrentPage(1);
    };

    updateMarketFromStorage();
    window.addEventListener("marketChange", updateMarketFromStorage);
    return () => window.removeEventListener("marketChange", updateMarketFromStorage);
  }, []);

  const brokers =
    currentMarket === "crypto"
      ? ["DeltaExchange", "XM", "CoinDCX", "Binance"]
      : ["Algo", "Angel One", "Dhan", "Groww", "SAHI", "Lemonn", "Upstox"];

  const currencySymbol = currentMarket === "crypto" ? "$" : "₹";

  // Fetch data with cache sync
  useEffect(() => {
    let isMounted = true;
    const marketParam = currentMarket === "crypto" ? "crypto" : "share";
    const apiEndpoint = `/api/sheet-data?market=${marketParam}`;
    const cacheKey = `cache_trades_${marketParam}`;

    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        if (Array.isArray(parsed) && isMounted) {
          setAllData(parsed);
        }
      } catch (error) {
        console.error("Cache parse error:", error);
      }
    }

    fetchWithAuth(apiEndpoint)
      .then((data) => {
        if (isMounted && data?.values && Array.isArray(data.values)) {
          setAllData(data.values);
          localStorage.setItem(cacheKey, JSON.stringify(data.values));
        }
      })
      .catch((error) => {
        console.error("Failed to fetch trades data:", error);
      });

    return () => {
      isMounted = false;
    };
  }, [currentMarket]);

  // Valid trades filtering
  const validTrades = allData.filter((row) => {
    const tradeName = row[4];
    return tradeName && tradeName !== "-" && tradeName.trim() !== "";
  });

  // Filter by Broker, Search, and Status (Win/Loss)
  const filteredTrades = validTrades.filter((row) => {
    const broker = String(row[1] || "").trim();
    const tradeName = String(row[4] || "").toLowerCase();
    const pnl = parseFloat(row[12]) || 0;

    const matchesBroker = selectedBroker === "ALL" || broker.toLowerCase() === selectedBroker.toLowerCase();
    const matchesSearch = tradeName.includes(searchQuery.toLowerCase()) || broker.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter === "WIN") matchesStatus = pnl >= 0;
    if (statusFilter === "LOSS") matchesStatus = pnl < 0;

    return matchesBroker && matchesSearch && matchesStatus;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredTrades.length / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentTradesSlice = filteredTrades.slice(startIndex, startIndex + rowsPerPage);

  // Filter ya search change hone par page ko 1 par reset karein
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleBrokerChange = (val: string) => {
    setSelectedBroker(val);
    setCurrentPage(1);
  };

  // Calculate Summary Metrics
  let totalTradesCount = validTrades.length;
  let winningTradesCount = validTrades.filter(row => (parseFloat(row[12]) || 0) >= 0).length;
  let winRate = totalTradesCount > 0 ? ((winningTradesCount / totalTradesCount) * 100).toFixed(1) : "0.0";
  let totalBrokerage = validTrades.reduce((sum, row) => sum + (parseFloat(row[8]) || 0), 0);
  let totalNetPnl = validTrades.reduce((sum, row) => sum + (parseFloat(row[12]) || 0), 0);

  const brokerOptions = [
    { value: "ALL", label: "All Brokers" },
    ...brokers.map((b) => ({ value: b, label: b })),
  ];

  return (
    <div className={`${styles.container} ${isDark ? styles.darkTheme : styles.lightTheme}`}>
      
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Trades Management</h1>
          <p className={styles.pageSubtitle}>Comprehensive log of all executed orders ({currentMarket.toUpperCase()} MARKET)</p>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className={styles.kpiGrid}>
        <div className={isDark ? styles.kpiCardDark : styles.kpiCardLight}>
          <div className="flex items-center justify-between">
            <span className={styles.kpiLabel}>Total Trades</span>
            <Layers className="w-4 h-4 text-emerald-500" />
          </div>
          <p className={styles.kpiValue}>{totalTradesCount}</p>
        </div>

        <div className={isDark ? styles.kpiCardDark : styles.kpiCardLight}>
          <div className="flex items-center justify-between">
            <span className={styles.kpiLabel}>Win Rate</span>
            <ShieldCheck className="w-4 h-4 text-blue-500" />
          </div>
          <p className={styles.kpiValue}>{winRate}%</p>
        </div>

        <div className={isDark ? styles.kpiCardDark : styles.kpiCardLight}>
          <div className="flex items-center justify-between">
            <span className={styles.kpiLabel}>Total Brokerage</span>
            <DollarSign className="w-4 h-4 text-amber-500" />
          </div>
          <p className={styles.kpiValue}>{currencySymbol}{totalBrokerage.toLocaleString()}</p>
        </div>

        <div className={isDark ? styles.kpiCardDark : styles.kpiCardLight}>
          <div className="flex items-center justify-between">
            <span className={styles.kpiLabel}>Net Performance</span>
            {totalNetPnl >= 0 ? <TrendingUp className="w-4 h-4 text-emerald-500" /> : <TrendingDown className="w-4 h-4 text-rose-500" />}
          </div>
          <p className={`${styles.kpiValue} ${totalNetPnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {totalNetPnl >= 0 ? `+${currencySymbol}${totalNetPnl.toLocaleString()}` : `-${currencySymbol}${Math.abs(totalNetPnl).toLocaleString()}`}
          </p>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input 
            type="text" 
            placeholder="Search trade or broker..." 
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterGroup}>
          <div className={styles.statusToggle}>
            <button 
              onClick={() => handleStatusChange("ALL")} 
              className={`${styles.statusBtn} ${statusFilter === "ALL" ? styles.activeStatus : ""}`}
            >
              All
            </button>
            <button 
              onClick={() => handleStatusChange("WIN")} 
              className={`${styles.statusBtn} ${statusFilter === "WIN" ? styles.activeStatus : ""}`}
            >
              Wins
            </button>
            <button 
              onClick={() => handleStatusChange("LOSS")} 
              className={`${styles.statusBtn} ${statusFilter === "LOSS" ? styles.activeStatus : ""}`}
            >
              Losses
            </button>
          </div>

          <CTADropDown 
            options={brokerOptions}
            selectedValue={selectedBroker}
            onSelect={(val) => handleBrokerChange(val)}
            isDark={isDark}
            width="130px"
          />
        </div>
      </div>

      {/* Responsive View: Desktop Table + Mobile Stacked Cards */}
      <div className={styles.contentSection}>
        {currentTradesSlice.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className={`${isDark ? styles.tableContainerDark : styles.tableContainerLight} ${styles.desktopTableWrapper}`}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Broker</th>
                    <th>Trade Asset / Name</th>
                    <th>Qty</th>
                    <th>Buy Avg</th>
                    <th>Sell Avg</th>
                    <th>Brokerage</th>
                    <th>Net P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTradesSlice.map((row, idx) => {
                    const date = row[0] || "-";
                    const broker = row[1] || "-";
                    const tradeName = row[4] || "-";
                    const qty = row[5] || "0";
                    const buyAvg = parseFloat(row[6]) || 0;
                    const sellAvg = parseFloat(row[7]) || 0;
                    const brokerage = parseFloat(row[8]) || 0;
                    const pnl = parseFloat(row[12]) || 0;

                    return (
                      <tr key={idx} className={styles.tableRow}>
                        <td className="text-gray-400 font-medium">{date}</td>
                        <td><span className={styles.brokerBadge}>{broker}</span></td>
                        <td className="font-bold text-white">{tradeName}</td>
                        <td>{qty}</td>
                        <td>{currencySymbol}{buyAvg.toLocaleString()}</td>
                        <td>{currencySymbol}{sellAvg.toLocaleString()}</td>
                        <td className="text-gray-400">{currencySymbol}{brokerage.toLocaleString()}</td>
                        <td>
                          <span className={`${styles.pnlBadge} ${pnl >= 0 ? styles.profitBadge : styles.lossBadge}`}>
                            {pnl >= 0 ? `+${currencySymbol}${pnl.toLocaleString()}` : `-${currencySymbol}${Math.abs(pnl).toLocaleString()}`}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className={styles.mobileCardList}>
              {currentTradesSlice.map((row, idx) => {
                const date = row[0] || "-";
                const broker = row[1] || "-";
                const tradeName = row[4] || "-";
                const qty = row[5] || "0";
                const buyAvg = parseFloat(row[6]) || 0;
                const sellAvg = parseFloat(row[7]) || 0;
                const brokerage = parseFloat(row[8]) || 0;
                const pnl = parseFloat(row[12]) || 0;

                return (
                  <div key={idx} className={isDark ? styles.mobileCardDark : styles.mobileCardLight}>
                    <div className={styles.mobileCardHeader}>
                      <div>
                        <span className={styles.mobileTradeName}>{tradeName}</span>
                        <p className={styles.mobileDateText}>{date}</p>
                      </div>
                      <span className={styles.brokerBadge}>{broker}</span>
                    </div>

                    <div className={styles.mobileCardBody}>
                      <div className={styles.mobileInfoRow}>
                        <span className="text-gray-400">Quantity</span>
                        <span className="font-semibold">{qty}</span>
                      </div>
                      <div className={styles.mobileInfoRow}>
                        <span className="text-gray-400">Buy / Sell Avg</span>
                        <span className="font-semibold">{currencySymbol}{buyAvg} / {currencySymbol}{sellAvg}</span>
                      </div>
                      <div className={styles.mobileInfoRow}>
                        <span className="text-gray-400">Brokerage</span>
                        <span className="text-gray-400">{currencySymbol}{brokerage}</span>
                      </div>
                    </div>

                    <div className={styles.mobileCardFooter}>
                      <span className="text-xs font-bold text-gray-400 uppercase">Net P&L</span>
                      <span className={`${styles.pnlBadge} ${pnl >= 0 ? styles.profitBadge : styles.lossBadge}`}>
                        {pnl >= 0 ? `+${currencySymbol}${pnl.toLocaleString()}` : `-${currencySymbol}${Math.abs(pnl).toLocaleString()}`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            <div className={styles.paginationContainer}>
              <span className={styles.pageInfoText}>
                Showing <strong>{startIndex + 1}</strong> to <strong>{Math.min(startIndex + rowsPerPage, filteredTrades.length)}</strong> of <strong>{filteredTrades.length}</strong> trades
              </span>

              <div className={styles.paginationButtons}>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={styles.pageNavBtn}
                >
                  <ChevronLeft size={16} /> Prev
                </button>

                <span className={styles.pageNumberIndicator}>
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={styles.pageNavBtn}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className={styles.emptyStateContainer}>
            <p>No trades match your filter criteria.</p>
          </div>
        )}
      </div>

    </div>
  );
}
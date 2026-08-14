import { Maximize2, X } from "lucide-react";
import CTADropDown from "@/style/CTADropDown";
import styles from "./PerformanceOverviewChart.module.css";

interface PerformanceOverviewChartProps {
  isDark: boolean;
  currencySymbol: string;
  isChartExpanded: boolean;
  setIsChartExpanded: (val: boolean) => void;
  pnlMode: "monthly" | "daily";
  setPnlMode: (mode: "monthly" | "daily") => void;
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  dynamicYears: string[];
  monthsList: { value: string; label: string }[];
  netPnlTotal: number;
  pnlPercentageVal: string;
  maxVal: number;
  minVal: number;
  svgWidth: number;
  svgHeight: number;
  svgPoints: any[];
  pathString: string;
  areaString: string;
  hoveredPoint: any;
  setHoveredPoint: (pt: any) => void;
}

export default function PerformanceOverviewChart({
  isDark,
  currencySymbol,
  isChartExpanded,
  setIsChartExpanded,
  pnlMode,
  setPnlMode,
  selectedYear,
  setSelectedYear,
  selectedMonth,
  setSelectedMonth,
  dynamicYears,
  monthsList,
  netPnlTotal,
  pnlPercentageVal,
  maxVal,
  minVal,
  svgWidth,
  svgHeight,
  svgPoints,
  pathString,
  areaString,
  hoveredPoint,
  setHoveredPoint,
}: PerformanceOverviewChartProps) {
  
  const formatVal = (v: number) => {
    const absV = Math.abs(v);
    const prefix = v < 0 ? "-" : "";

    if (absV >= 1000) {
      const inK = absV / 1000;
      return `${prefix}${currencySymbol}${inK.toFixed(Number.isInteger(inK) ? 0 : 1).replace(/\.0$/, "")}K`;
    }

    return `${prefix}${currencySymbol}${absV.toFixed(0)}`;
  };

  const hasPositive = maxVal > 0;
  const hasNegative = minVal < 0;

  let yAxisValues: number[] = [];

  if (hasPositive && hasNegative) {
    yAxisValues = [
      maxVal,
      maxVal * 0.5,
      0,
      minVal * 0.5,
      minVal,
    ];
  } else if (hasPositive) {
    yAxisValues = [
      maxVal,
      maxVal * 0.75,
      maxVal * 0.5,
      maxVal * 0.25,
      0,
    ];
  } else if (hasNegative) {
    yAxisValues = [
      0,
      minVal * 0.25,
      minVal * 0.5,
      minVal * 0.75,
      minVal,
    ];
  } else {
    yAxisValues = [100, 75, 50, 25, 0];
  }

  return (
    <div className={`${styles.rightColumn} ${isChartExpanded ? styles.expandedChartCard : ""}`}>
      <div className={isDark ? styles.cardDark : styles.cardLight} style={{ height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
        
        <div className={styles.perfHeaderBox}>
          <div>
            <span className={styles.cardTitleText}>PERFORMANCE OVERVIEW</span>
            <div className={styles.perfOverviewHeader}>
              <span className={styles.perfSubTitle}>
                {pnlMode === 'monthly' ? `Monthly Net P&L (${selectedYear})` : `Daily Net P&L (${monthsList.find(m => m.value === selectedMonth)?.label} ${selectedYear})`}
              </span>
            </div>
            <div className={styles.perfMainVal}>
              {currencySymbol}{netPnlTotal.toLocaleString()}
              <span className={styles.perfPercentage}>
                {Number(pnlPercentageVal) >= 0 ? `+${pnlPercentageVal}%` : `${pnlPercentageVal}%`}
              </span>
            </div>
          </div>

          <div className={styles.perfHeaderRightControls}>
            {pnlMode === "monthly" ? (
              <CTADropDown 
                options={dynamicYears.map(y => ({ value: y, label: y }))}
                selectedValue={selectedYear}
                onSelect={(val) => setSelectedYear(val)}
                isDark={isDark}
                width="95px"
              />
            ) : (
              <CTADropDown 
                options={monthsList}
                selectedValue={selectedMonth}
                onSelect={(val) => setSelectedMonth(val)}
                isDark={isDark}
                width="125px"
              />
            )}

            <div className={styles.pnlToggleTabs}>
              <button 
                className={`${styles.pnlTabBtn} ${pnlMode === "monthly" ? styles.pnlTabActive : ""}`}
                onClick={() => setPnlMode("monthly")}
              >
                Monthly P&L
              </button>
              <button 
                className={`${styles.pnlTabBtn} ${pnlMode === "daily" ? styles.pnlTabActive : ""}`}
                onClick={() => setPnlMode("daily")}
              >
                Daily P&L
              </button>
            </div>

            <button 
              className={styles.expandBtnInline}
              onClick={() => setIsChartExpanded(!isChartExpanded)}
              title={isChartExpanded ? "Minimize Chart" : "Expand Chart"}
            >
              {isChartExpanded ? <X size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>
        </div>

       <div className={styles.perfChartContainer}>
          {/* Dynamic Y-Axis Labels */}
          <div
            className={styles.yAxisLabels}
            style={{
              height: isChartExpanded ? "430px" : "200px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxSizing: "border-box",
              padding: "20px 0",
            }}
          >
            {yAxisValues.map((value, index) => (
              <span
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  height: "1px",
                  justifyContent: "flex-end",
                  overflow: "visible",
                }}
              >
                {formatVal(value)}
              </span>
            ))}
          </div>
         
          <div className={styles.chartWithXAxisWrapper}>
            <div className={styles.perfLineVisual} style={{ height: isChartExpanded ? '430px' : '200px', position: 'relative' }}>
              
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none', boxSizing: 'border-box', padding: '20px 0' }}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    style={{
                      width: '100%',
                      borderTop: index === 2
                        ? '1px solid rgba(255, 255, 255, 0.18)'
                        : '1px dashed rgba(255, 255, 255, 0.08)'
                    }}
                  />
                ))}
              </div>

              <svg className={styles.svgChart} viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="none" style={{ position: 'relative', zIndex: 2, overflow: 'visible' }}>
                <defs>
                  <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                <path d={areaString} fill="url(#pnlGrad)" />
                <path d={pathString} fill="none" stroke="#10b981" strokeWidth="2.5" />
              </svg>

              <div className={styles.htmlDotsOverlay} style={{ zIndex: 3 }}>
                {svgPoints.map((pt: any, idx: number) => {
                  const leftPercent = (pt.x / svgWidth) * 100;
                  const topPercent = (pt.y / svgHeight) * 100;
                  const isHovered = hoveredPoint?.label === pt.label;
                  const isProfit = pt.value >= 0;

                  return (
                    <div
                      key={idx}
                      className={styles.absoluteDotWrapper}
                      style={{ left: `${leftPercent}%`, top: `${topPercent}%`, position: 'absolute', transform: 'translate(-50%, -50%)' }}
                      onMouseEnter={() => setHoveredPoint(pt)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    >
                      {isHovered && (
                      <div className={`${styles.chartHoverTooltip} ${isDark ? styles.tooltipDark : styles.tooltipLight}`}>
                          <span className={styles.tooltipHoverDate}>{pt.label}</span>
                          <span className={isProfit ? styles.profitText : styles.lossText}>
                            {isProfit ? `+${currencySymbol}${pt.value.toLocaleString()}` : `${currencySymbol}${pt.value.toLocaleString()}`}
                          </span>
                        </div>
                      )}

                      <div 
                        className={styles.perfectCircleDot}
                        style={{
                          backgroundColor: isProfit ? "#10b981" : "#ef4444",
                          width: isHovered ? "12px" : "9px",
                          height: isHovered ? "12px" : "9px",
                          boxShadow: isProfit ? "0 0 8px #10b981" : "0 0 8px #ef4444",
                          borderRadius: "50%"
                        }}
                      />
                    </div>
                  );
                })}
              </div>

            </div>

            <div className={styles.perfXAxisExternal} style={{ marginBottom: isChartExpanded ? "15px" : "0px" }}>
              {svgPoints.map((pt: any, idx: number) => {
                const leftPercent = (pt.x / svgWidth) * 100;
                return (
                  <span key={idx} style={{ left: `${leftPercent}%`, position: 'absolute', transform: 'translateX(-50%)' }} className={styles.xAxisLabelItem}>
                    {pt.label}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        <div className={styles.perfLegendRow}>
          <div className={styles.perfLegendItem}><span className={styles.dotProfit}></span> Profit</div>
          <div className={styles.perfLegendItem}><span className={styles.dotLoss}></span> Loss</div>
          <div className={styles.perfLegendItem}><span className={styles.lineIndicator}></span> Net P&L Trend</div>
        </div>

      </div>
    </div>
  );
}
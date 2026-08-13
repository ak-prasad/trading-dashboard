import React, { useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import styles from "./BrokerTradingDaysCard.module.css";
import { BROKER_COLOR_MAP, globalColorsList } from "@/utils/brokerColors";

interface BrokerDaysProps {
  isDark: boolean;
  allData: any[];
  colorsList: string[];
}

export default function BrokerTradingDaysCard({
  isDark,
  allData,
  colorsList,
}: BrokerDaysProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const predefinedBrokers = ["Algo", "Angel One", "Dhan", "Groww", "SAHI", "Lemonn", "Upstox", "DeltaExchange", "XM", "CoinDCX", "Binance"];
  
  const allUniqueDates = new Set<string>();
  const brokerDaysMap: Record<string, Set<string>> = {};

  allData.forEach((row) => {
    const date = String(row[0] || "").trim();
    const broker = String(row[1] || "Unknown").trim();

    if (!date || !broker) return;

    allUniqueDates.add(date);
    if (!brokerDaysMap[broker]) brokerDaysMap[broker] = new Set();
    brokerDaysMap[broker].add(date);
  });

  const overallTradingDays = allUniqueDates.size;

  // Sirf active brokers (days > 0) ko filter karein aur global BROKER_COLOR_MAP se exact synchronized color assign karein
  const rawBrokerData = predefinedBrokers.map((broker, idx) => {
    const daysSet = brokerDaysMap[broker];
    const days = daysSet ? daysSet.size : 0;
    
    const color = BROKER_COLOR_MAP[broker] || colorsList[idx % colorsList.length] || globalColorsList[idx % globalColorsList.length];

    return {
      broker,
      days,
      color,
    };
  }).filter((item) => item.days > 0);

  const totalActualDays = rawBrokerData.reduce((sum, item) => sum + item.days, 0);

  // Descending order me sort karein
  const brokerData = [...rawBrokerData].sort((a, b) => b.days - a.days);

  let cumulativeAngle = 0;

  const slices = brokerData.map((item) => {
    const share = totalActualDays ? item.days / totalActualDays : 0;
    const percentVal = totalActualDays > 0 ? ((item.days / totalActualDays) * 100).toFixed(1) + "%" : "0%";
    
    const startAngle = cumulativeAngle * Math.PI * 2 - Math.PI / 2;
    cumulativeAngle += share;
    const endAngle = cumulativeAngle * Math.PI * 2 - Math.PI / 2;
    const middleAngle = startAngle + (endAngle - startAngle) / 2;

    const startX = Math.cos(startAngle);
    const startY = Math.sin(startAngle);
    const endX = Math.cos(endAngle);
    const endY = Math.sin(endAngle);
    
    const labelRadius = 0.82;
    const largeArcFlag = share > 0.5 ? 1 : 0;

    return {
      ...item,
      percentVal,
      pathData: `M ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} L 0 0`,
      labelX: Math.cos(middleAngle) * labelRadius,
      labelY: Math.sin(middleAngle) * labelRadius,
    };
  });

  const card = (
    <section
      className={`${isDark ? styles.cardDark : styles.cardLight} ${
        isExpanded ? styles.expandedModal : ""
      }`}
    >
      <header className={styles.headerSection}>
        <div>
          <h2 className={styles.cardTitle}>Total Trading Days</h2>
          <p className={styles.subTitleText}>
            Overview of all trading activities
          </p>
        </div>

        <button
          type="button"
          className={styles.expandBtn}
          onClick={() => setIsExpanded((value) => !value)}
          aria-label={isExpanded ? "Collapse trading days" : "Expand trading days"}
          aria-expanded={isExpanded}
          title={isExpanded ? "Minimize" : "Expand"}
        >
          {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={16} />}
        </button>
      </header>

      <div className={styles.contentBody}>
        <div className={isExpanded ? styles.chartLarge : styles.chartNormal}>
          <div className={styles.chartGlow} />

          <svg viewBox="-1.22 -1.22 2.44 2.44" className={styles.donutSvg}>
            {slices.length === 0 ? (
              <circle cx="0" cy="0" r="1" className={styles.zeroStateRing} />
            ) : (
              slices.map((slice, i) => (
                <path
                  key={`slice-path-${i}-${slice.broker}`}
                  d={slice.pathData}
                  fill={slice.color}
                  className={styles.donutSlice}
                  style={{
                    filter: `drop-shadow(0 0 0.055px ${slice.color})`,
                  }}
                />
              ))
            )}

            {slices.map((slice, i) =>
              slice.days > 0 ? (
                <text
                  key={`slice-text-${i}-${slice.broker}`}
                  x={slice.labelX}
                  y={slice.labelY}
                  className={styles.sliceDaysLabel}
                >
                  {slice.days} {slice.days === 1 ? "Day" : "Days"}
                </text>
              ) : null
            )}

            <circle className={styles.donutHole} cx="0" cy="0" r="0.63" />
          </svg>

          <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', pointerEvents: 'none', zIndex: 2 }}>
            <span className={styles.centerNumber}>{overallTradingDays}</span>
            <span className={styles.centerLabel}>Days</span>
            <span className={styles.centerSubLabel}>Overall Trading Days</span>
          </div>
        </div>

        {isExpanded ? (
          <div className={styles.expandedLegendList}>
            {slices.length ? (
              slices.map((item, i) => (
                <article
                  className={styles.legendCard}
                  key={`exp-${i}-${item.broker}`}
                  style={{ "--broker-color": item.color } as React.CSSProperties}
                >
                  <span className={styles.legendColorBar} />
                  <span className={styles.brokerName}>{item.broker}</span>

                  <div className={styles.legendStats}>
                    <span className={styles.brokerDays}>
                      {item.days} {item.days === 1 ? "Day" : "Days"}
                    </span>
                    <span className={styles.brokerPercent} style={{ color: item.color }}>
                      {item.percentVal}
                    </span>
                  </div>
                </article>
              ))
            ) : (
              <p className={styles.noDataText}>No broker data available</p>
            )}
          </div>
        ) : (
          <div className={styles.inlineBrokerList}>
            {slices.length ? (
              slices.map((item, i) => (
                <div className={styles.inlineItem} key={`inline-${i}-${item.broker}`}>
                  <span
                    className={styles.inlineDot}
                    style={{ backgroundColor: item.color }}
                  />
                  <span className={styles.inlineName}>{item.broker}</span>
                </div>
              ))
            ) : (
              <p className={styles.noDataText}>No data available</p>
            )}
          </div>
        )}
      </div>
    </section>
  );

  return isExpanded ? <div className={styles.modalOverlay}>{card}</div> : card;
}
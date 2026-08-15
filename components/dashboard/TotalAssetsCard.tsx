import { ArrowUpRight } from "lucide-react";
import styles from "./TotalAssetsCard.module.css";


interface TotalAssetsCardProps {
  isDark: boolean;
  currencySymbol: string;
  totalInvest: number;
  totalInvestPercentage: string;
  topBrokers: [string, number][];
  colorsList: string[];
}

export default function TotalAssetsCard({
  isDark,
  currencySymbol,
  totalInvest,
  totalInvestPercentage,
  topBrokers,
  colorsList,
}: TotalAssetsCardProps) {
  return (
    <div className={styles.leftColumn}>
      <div 
        className={`${isDark ? styles.cardDark : styles.cardLight} ${styles.totalAssetsCard}`}
        style={{ "--currency-symbol": `"${currencySymbol}"` } as React.CSSProperties}
      >
        <div className={styles.cardHeaderTop}>
          <span className={styles.cardTitleText}>Total Assets (Total Invest)</span>
        </div>
        <div className={styles.mainAssetValue}>{currencySymbol}{totalInvest.toLocaleString()}</div>
        <div className={styles.growthBadge}>
          <ArrowUpRight size={14} /> {Number(totalInvestPercentage) >= 0 ? `+${totalInvestPercentage}%` : `${totalInvestPercentage}%`} <span className={styles.growthSub}>in this year</span>
        </div>

        <div className={styles.distributionSection}>
          <div className={styles.distributionTitle}>Brokers Breakdown (Deposits)</div>
          
          <div className={styles.progressBarWrapper}>
            {topBrokers.map(([broker, amt], idx) => {
              const percentage = totalInvest > 0 ? (amt / totalInvest) * 100 : 0;
              return (
                <div 
                  key={broker} 
                  style={{ width: `${percentage}%`, backgroundColor: colorsList[idx % colorsList.length] }}
                ></div>
              );
            })}
          </div>

          <div className={styles.distributionLegend}>
            {topBrokers.length > 0 ? (
              topBrokers.map(([broker, amt], idx) => (
                <div className={styles.legendItem} key={broker}>
                  <span style={{ backgroundColor: colorsList[idx % colorsList.length] }} className={styles.dotStock}></span> 
                  {broker} 
                  <span className={styles.legendVal}>{currencySymbol}{amt.toLocaleString()}</span>
                </div>
              ))
            ) : (
              <div className={styles.emptyBrokerText}>No broker deposit records found</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
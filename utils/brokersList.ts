export const BROKERS_CONFIG = {
  crypto: ["DeltaExchange", "XM", "CoinDCX", "Binance"] as const,
  share: ["Bigul Algo", "Angel One", "Dhan", "Groww", "SAHI", "Lemonn", "Upstox"] as const,
};

export type CryptoBroker = typeof BROKERS_CONFIG.crypto[number];
export type ShareBroker = typeof BROKERS_CONFIG.share[number];
export type MarketType = keyof typeof BROKERS_CONFIG;

// Helper function jo current market ke anusaar brokers ki list dega
export const getBrokersByMarket = (market: string): string[] => {
  const normalizedMarket = market.toLowerCase() === "crypto" ? "crypto" : "share";
  return [...BROKERS_CONFIG[normalizedMarket]];
};

// Sabhi brokers ki combined list (agar kabhi sabhi ki zaroorat ho)
export const ALL_BROKERS = [
  ...BROKERS_CONFIG.share,
  ...BROKERS_CONFIG.crypto,
];
// Har broker ka ek fixed aur individual color yahan define kar diya gaya hai
export const BROKER_COLOR_MAP: Record<string, string> = {
  "Bigul Algo": "#06b6d4",     
  "Angel One": "#3b82f6",  
  "Dhan": "#eab308",       
  "Groww": "#10b981",    
  "SAHI": "#ec4899",    
  "Lemonn": "#84cc16",     
  "Upstox": "#8b5cf6",     

  "DeltaExchange": "#84cc16",
  "XM": "#f43f5e",
  "CoinDCX": "#38bdf8",
  "Binance": "#fbbf24"
};

// Fallback colors list agar koi naya broker aa jaye
export const globalColorsList = [
  "#3b82f6",  
  "#10b981", 
  "#eab308", 
  "#ec4899", 
  "#06b6d4", 
  "#f97316", 
  "#84cc16", 
  "#8b5cf6"
];

// Helper function jo kisi bhi broker ka exact fixed color dega
export function getBrokerColor(brokerName: string, index: number = 0): string {
  const cleanedName = brokerName.trim();
  if (BROKER_COLOR_MAP[cleanedName]) {
    return BROKER_COLOR_MAP[cleanedName];
  }
  // Agar list me nahi hai toh global colors se fallback le lega
  return globalColorsList[index % globalColorsList.length];
}
import { useState, useEffect } from "react";

export function useMarket() {
  const [market, setMarket] = useState("share");

  useEffect(() => {
    const current = localStorage.getItem("selectedMarket") || "share";
    setMarket(current);

    const handleStorageChange = () => {
      setMarket(localStorage.getItem("selectedMarket") || "share");
    };

    window.addEventListener("marketChange", handleStorageChange);
    return () => window.removeEventListener("marketChange", handleStorageChange);
  }, []);

  return market;
}
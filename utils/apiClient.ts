import { signOut } from "next-auth/react";

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  let response = await fetch(url, options);

  // Agar token expire ho gaya hai aur 401 Unauthorized milta hai
  if (response.status === 401) {
    try {
      // Refresh token endpoint ko call karein (NextAuth session refresh)
      const refreshRes = await fetch("/api/auth/session?update");
      
      if (refreshRes.ok) {
        // Dobara original request try karein naye session ke sath
        response = await fetch(url, options);
      } else {
        // Agar refresh bhi fail ho jaye, tabhi logout karke login page par bhejain
        signOut({ callbackUrl: "/" });
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
      signOut({ callbackUrl: "/" });
    }
  }

  return response.json();
}
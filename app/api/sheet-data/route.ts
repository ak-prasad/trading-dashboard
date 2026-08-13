import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const SHEET_NAME = "My Trading Journal";

// Helper function jo Google Sheets API request handle karega with automatic access token retry
async function fetchSheetValues(accessToken: string, spreadsheetId: string, sheetTabName: string) {
  const sheetRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetTabName}!A:M`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  return sheetRes;
}

export async function GET(request: Request) {
  try {
    let session: any = await getServerSession(authOptions);
    if (!session || !session.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let accessToken = session.accessToken;

    const { searchParams } = new URL(request.url);
    const market = searchParams.get("market") || "share";
    const sheetTabName = market === "crypto" ? "CryptoData" : "Sheet1";

    // 1. Find Spreadsheet ID
    let searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${SHEET_NAME}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    // Agar token expire ho gaya ho (401), toh ek baar session refresh/retry karne ki koshish karein
    if (searchRes.status === 401) {
      console.warn("Access token expired. Requesting session update...");
      
      // NextAuth session update trigger karne ke liye internal session endpoint hit karein
      // (Note: Server-side par next-auth ka automated refresh agar configured hai toh session cookie ke zariye naya token mil jayega)
      const freshSession: any = await getServerSession(authOptions);
      if (freshSession && freshSession.accessToken) {
        accessToken = freshSession.accessToken;
        
        // Search request ko naye token ke sath dobara try karein
        searchRes = await fetch(
          `https://www.googleapis.com/drive/v3/files?q=name='${SHEET_NAME}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
      }
    }

    const searchData = await searchRes.json();

    if (!searchData.files || searchData.files.length === 0) {
      return NextResponse.json({ values: [] });
    }

    const spreadsheetId = searchData.files[0].id;

    // 2. Fetch values dynamically based on selected market tab
    let sheetRes = await fetchSheetValues(accessToken, spreadsheetId, sheetTabName);

    // Agar sheet data fetch karte waqt bhi 401 aaye toh ek aur baar retry mechanism
    if (sheetRes.status === 401) {
      const freshSession: any = await getServerSession(authOptions);
      if (freshSession && freshSession.accessToken) {
        accessToken = freshSession.accessToken;
        sheetRes = await fetchSheetValues(accessToken, spreadsheetId, sheetTabName);
      }
    }

    const sheetData = await sheetRes.json();

    const rows = sheetData.values || [];
    const headers = rows[0] || [];
    const dataRows = rows.slice(1);

    return NextResponse.json({ headers, values: dataRows });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
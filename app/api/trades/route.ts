import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const SHEET_NAME = "My Trading Journal";

export async function POST(request: Request) {
  try {
    const session: any = await getServerSession(authOptions);
    if (!session || !session.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accessToken = session.accessToken;
    const body = await request.json();

    // Automatically route DeltaExchange or crypto entries to CryptoData, others to Sheet1
    const brokerName = (body.broker || "").trim().toLowerCase();
    const isCrypto = body.market === "crypto" || brokerName.includes("delta") || brokerName.includes("crypto");
    const sheetTabName = isCrypto ? "CryptoData" : "Sheet1";

    // Values parsing & Calculations
    const qty = parseFloat(body.qty || 0);
    const buyPrice = parseFloat(body.buyPrice || 0);
    const sellPrice = parseFloat(body.sellPrice || 0);
    const brokerage = parseFloat(body.brokerage || 0);

    const buyTotal = qty * buyPrice;
    const sellTotal = qty * sellPrice;
    
    // Total P&L before brokerage
    const diff = sellTotal - buyTotal;

    // Profit, Loss, Gross P&L, Net P&L formulas
    const profitVal = diff > 0 ? diff.toFixed(2) : "-";
    const lossVal = diff < 0 ? Math.abs(diff).toFixed(2) : "-";
    const grossPnL = diff; 
    const netPnL = grossPnL - brokerage;

    // 1. Find Spreadsheet
    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${SHEET_NAME}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const searchData = await searchRes.json();
    let spreadsheetId = "";

    const headersArray = [
      "Date", "Broker", "Deposit", "Withdrawal", "Trade", 
      "Qty", "Buy Price", "Sell Price", "Brokerage", 
      "Profit", "Loss", "Gross P&L", "Net P&L"
    ];

    if (searchData.files && searchData.files.length > 0) {
      spreadsheetId = searchData.files[0].id;

      // Check if specific sheet tab exists, if not create it
      const metaRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const metaData = await metaRes.json();
      const sheetExists = metaData.sheets.some((s: any) => s.properties.title === sheetTabName);

      if (!sheetExists) {
        // Add new sheet tab
        await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            requests: [{ addSheet: { properties: { title: sheetTabName } } }]
          }),
        });

        // Set Headers for the new tab
        await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetTabName}!A1:M1?valueInputOption=USER_ENTERED`,
          {
            method: "PUT",
            headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
            body: JSON.stringify({ values: [headersArray] }),
          }
        );
      }
    } else {
      // Create Spreadsheet if not exists with both tabs
      const createRes = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ 
          properties: { title: SHEET_NAME },
          sheets: [
            { properties: { title: "Sheet1" } },
            { properties: { title: "CryptoData" } }
          ]
        }),
      });
      const createData = await createRes.json();
      spreadsheetId = createData.spreadsheetId;

      // Set Headers for both Sheet1 and CryptoData
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1:M1?valueInputOption=USER_ENTERED`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({ values: [headersArray] }),
        }
      );

      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/CryptoData!A1:M1?valueInputOption=USER_ENTERED`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({ values: [headersArray] }),
        }
      );
    }

    // 2. Row Values (13 columns matching the exact order)
    const rowValues = [
      body.date || "",
      body.broker || "",
      "-",            // Deposit
      "-",            // Withdrawal
      body.tradeName || "",   // Trade
      body.qty || "",         // Qty
      body.buyPrice || "",    // Buy Price
      body.sellPrice || "",   // Sell Price
      body.brokerage || "",   // Brokerage
      profitVal,              // Profit
      lossVal,                // Loss
      grossPnL.toFixed(2),    // Gross P&L
      netPnL.toFixed(2)       // Net P&L
    ];

    // 3. Append Data to the specific Google Sheet Tab
    const appendRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetTabName}!A:M:append?valueInputOption=USER_ENTERED`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ 
          range: `${sheetTabName}!A:M`,
          majorDimension: "ROWS",
          values: [rowValues] 
        }),
      }
    );

    const appendData = await appendRes.json();
    if (!appendRes.ok) {
      console.error("Google Sheets API Append Error:", appendData);
      return NextResponse.json({ success: false, error: appendData.error?.message || "Failed to append" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Trade saved successfully!" });
  } catch (error: any) {
    console.error("Server Error in Trade Route:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
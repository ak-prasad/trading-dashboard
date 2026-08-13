import { google } from "googleapis";

// 1. Google Sheet se saare trades fetch karne ka function
export async function getTradesFromGoogleSheet(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const sheets = google.sheets({ version: "v4", auth });
  const drive = google.drive({ version: "v3", auth });

  try {
    // Check karein ki "Trading Journal" sheet exist karti hai ya nahi
    const response = await drive.files.list({
      q: "name = 'Trading Journal' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false",
      fields: "files(id, name)",
    });

    const spreadsheetId = response.data.files?.[0]?.id;
    if (!spreadsheetId) {
      return { success: true, trades: [] }; // Agar sheet nahi hai toh empty array return karein
    }

    // Sheet ke "Trades" tab se saara data get karein
    const rowsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: "Trades!A2:H", // Headers chhod kar data uthayenge
    });

    const rows = rowsResponse.data.values || [];
    
    // Rows ko proper JSON object array me convert karein
    const trades = rows.map((row, index) => ({
      id: index + 1,
      date: row[1] || "",
      broker: row[2] || "",
      profit: row[3] || "-",
      loss: row[4] || "-",
      invest: row[5] || "-",
      withdrawal: row[6] || "-",
      net: row[7] || "0",
    }));

    return { success: true, trades };
  } catch (error) {
    console.error("Error fetching from Google Sheet:", error);
    return { success: false, trades: [] };
  }
}

// 2. Naya trade save karne ka function (jo pehle banaya tha)
export async function saveTradeToGoogleSheet(accessToken: string, tradeData: {
  date: string;
  broker: string;
  profit: string;
  loss: string;
  invest: string;
  withdrawal: string;
  net: string;
}) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const sheets = google.sheets({ version: "v4", auth });
  const drive = google.drive({ version: "v3", auth });

  try {
    const response = await drive.files.list({
      q: "name = 'Trading Journal' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false",
      fields: "files(id, name)",
    });

    let spreadsheetId = response.data.files?.[0]?.id;

    if (!spreadsheetId) {
      const createResponse = await sheets.spreadsheets.create({
        requestBody: {
          properties: { title: "Trading Journal" },
          sheets: [{ properties: { title: "Trades" } }],
        },
      });
      spreadsheetId = createResponse.data.spreadsheetId;

      await sheets.spreadsheets.values.append({
        spreadsheetId: spreadsheetId!,
        range: "Trades!A1:H1",
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [["S. No.", "Date", "Broker", "Profit (₹)", "Loss (₹)", "Invest (₹)", "Withdrawal (₹)", "Net P&L (₹)"]],
        },
      });
    }

    const currentRows = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId!,
      range: "Trades!A:A",
    });
    const nextSNo = (currentRows.data.values?.length || 1);

    await sheets.spreadsheets.values.append({
      spreadsheetId: spreadsheetId!,
      range: "Trades!A:H",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          nextSNo,
          tradeData.date,
          tradeData.broker,
          tradeData.profit,
          tradeData.loss,
          tradeData.invest,
          tradeData.withdrawal,
          tradeData.net,
        ]],
      },
    });

    return { success: true, message: "Trade saved successfully!" };
  } catch (error) {
    console.error("Error saving to Google Sheet:", error);
    return { success: false, error: "Failed to save trade" };
  }
}
// วางโค้ดนี้ใน Google Sheet > ส่วนขยาย (Extensions) > Apps Script
// แล้ว Deploy เป็น Web app (ดูขั้นตอนใน README.md)

const SECRET = "ตั้งรหัสอะไรก็ได้"; // ต้องตรงกับ SHEET_SECRET ใน Vercel

const LABELS = {
  opened: "เปิดจดหมายแล้ว",
  yes: "กด ลองคุยกันนะ 💗",
  message: "ฝากข้อความมา 💌",
};

function doPost(e) {
  let data = {};
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return ContentService.createTextOutput("bad request");
  }
  if (SECRET && data.secret !== SECRET) {
    return ContentService.createTextOutput("forbidden");
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["เวลา", "เหตุการณ์", "ชื่อในลิงก์", "ไล่จับปุ่มเพื่อนไปกี่ครั้ง", "ข้อความ"]);
  }

  // กันข้อความที่ขึ้นต้นด้วย = + - @ ไม่ให้ Sheet ตีความเป็นสูตร
  let message = String(data.message || "");
  if (/^[=+\-@]/.test(message)) message = "'" + message;

  sheet.appendRow([
    new Date(),
    LABELS[data.event] || data.event,
    data.to || "-",
    data.dodges || 0,
    message,
  ]);

  return ContentService.createTextOutput("ok");
}

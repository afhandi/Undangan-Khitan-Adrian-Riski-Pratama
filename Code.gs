const SHEET_NAME = "RSVP Khitan";

function getSheet_() {
  const props = PropertiesService.getScriptProperties();
  const spreadsheetId = props.getProperty("SPREADSHEET_ID");
  if (!spreadsheetId) throw new Error("SPREADSHEET_ID belum diatur di Script Properties.");
  const ss = SpreadsheetApp.openById(spreadsheetId);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(["Timestamp", "Nama", "Kehadiran", "Ucapan", "ID"]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function doPost(e) {
  let result;
  try {
    const p = (e && e.parameter) ? e.parameter : {};
    const name = String(p.name || "").trim().slice(0, 80);
    const attendance = String(p.attendance || "").trim();
    const message = String(p.message || "").trim().slice(0, 500);
    const token = String(p.token || Utilities.getUuid()).slice(0, 100);

    if (!name || !message || !["Hadir", "Tidak hadir"].includes(attendance)) {
      throw new Error("Data RSVP tidak lengkap atau tidak valid.");
    }

    const sheet = getSheet_();
    sheet.appendRow([new Date(), name, attendance, message, token]);
    result = { ok: true, id: token, message: "Tersimpan" };
  } catch (err) {
    result = { ok: false, message: err.message || "Gagal menyimpan RSVP." };
  }

  // Include the submitted token in the response event so the correct browser form can confirm.
  const token = (e && e.parameter && e.parameter.token) ? String(e.parameter.token) : "";
  const safeResult = JSON.stringify({ type: "khitan-rsvp-result", token: token, ...result }).replace(/</g, "\\u003c");
  return HtmlService.createHtmlOutput(`<!doctype html><html><body><script>window.top.postMessage(${safeResult}, "*");</script></body></html>`)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doGet(e) {
  const params = (e && e.parameter) ? e.parameter : {};
  const callback = String(params.callback || "").replace(/[^a-zA-Z0-9_$]/g, "");
  if (params.action !== "list" || !callback) {
    return ContentService.createTextOutput("RSVP Khitan Adrian Riski Pratama").setMimeType(ContentService.MimeType.TEXT);
  }
  let wishes = [];
  try {
    const sheet = getSheet_();
    const last = sheet.getLastRow();
    if (last > 1) {
      const rows = sheet.getRange(2, 1, last - 1, 5).getValues();
      wishes = rows.reverse().slice(0, 100).map(row => ({
        date: Utilities.formatDate(new Date(row[0]), Session.getScriptTimeZone(), "dd MMM yyyy"),
        name: String(row[1]),
        attendance: String(row[2]),
        message: String(row[3]),
        id: String(row[4])
      }));
    }
  } catch (err) {
    // Return an empty list if the sheet has not been configured yet.
  }
  const output = `${callback}(${JSON.stringify({ wishes: wishes }).replace(/</g, "\\u003c")});`;
  return ContentService.createTextOutput(output).setMimeType(ContentService.MimeType.JAVASCRIPT);
}

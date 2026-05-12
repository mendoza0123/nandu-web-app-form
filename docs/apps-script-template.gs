/**
 * Nandu Web App Form — Google Sheets sync receiver.
 *
 * Setup:
 *  1. Open your Google Sheet.
 *  2. Extensions → Apps Script. Paste this whole file.
 *  3. Top-of-file: set SHEET_NAME to the target tab name (default 'Interviews').
 *  4. Deploy → New deployment → Type: Web app.
 *     - Execute as: Me (your account)
 *     - Who has access: Anyone
 *  5. Copy the Web app URL.
 *  6. In Vercel project settings, add env var
 *     GOOGLE_SHEETS_WEBHOOK_URL = <that URL>.
 *  7. Redeploy the Vercel app so the env var is loaded.
 *
 * The Nandu form POSTs one payload per completed session. This script appends
 * one row per answered question. The summary text is written only on the first
 * row of each session so the sheet stays readable.
 */

const SHEET_NAME = 'Interviews';

const HEADER = [
  'session_id',
  'respondent_name',
  'role',
  'role_label',
  'company',
  'completed_at',
  'question_id',
  'section',
  'question_text',
  'answer_text',
  'audio_url',
  'audio_duration_seconds',
  'summary_text',
  'model',
];

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || '{}');
    const rows = Array.isArray(body.rows) ? body.rows : [];
    if (rows.length === 0) {
      return json({ ok: false, error: 'no rows' });
    }

    const sheet = getOrCreateSheet();
    const values = rows.map((r) => HEADER.map((col) => (col in r ? r[col] : '')));
    sheet.getRange(sheet.getLastRow() + 1, 1, values.length, HEADER.length).setValues(values);

    return json({ ok: true, appended: values.length });
  } catch (err) {
    return json({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADER.length).setValues([HEADER]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

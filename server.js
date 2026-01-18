const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});



// ----------------------
// Google Sheets Setup
// ----------------------
const KEYFILEPATH = path.join(__dirname, 'gatekeeper-key.json'); // JSON key file
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
// const SPREADSHEET_ID = 'YOUR_SHEET_ID'; // <-- replace with your actual Sheet ID
const SPREADSHEET_ID = '10Hu6HPf8h7jIAr6ENU-JDctFg5IDesp9169wPN5TFtA';

// https://docs.google.com/spreadsheets/d/10Hu6HPf8h7jIAr6ENU-JDctFg5IDesp9169wPN5TFtA/edit?gid=0#gid=0
const SHEET_NAME = 'Sheet1';             // <-- replace with your tab name if different

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});

// Helper: read sheet
async function readSheet() {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: SHEET_NAME,
  });
  return res.data.values || [];
}

// Helper: write sheet (overwrite all rows)
async function writeSheet(data) {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: SHEET_NAME,
    valueInputOption: 'RAW',
    requestBody: {
      values: data,
    },
  });
}

// ----------------------
// Routes
// ----------------------

// GET /load → return current table
app.get('/load', async (req, res) => {
  try {
    const data = await readSheet();
    console.log('Data from Sheets:', data);
    res.json(data);
  } catch (err) {
    console.error('Sheets API error:', err.response ? err.response.data : err);
    res.status(500).json({ error: 'Failed to read data', details: err.message });
  }
});


// POST /save → save table data
app.post('/save', async (req, res) => {
  try {
    const data = req.body; // expected to be an array of rows
    await writeSheet(data);
    res.json({ status: 'ok' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save data to Google Sheets' });
  }
});


// Serve frontend files
app.use(express.static(path.join(__dirname))); // serves index.html, styles.css, app.js, icons/, etc.

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});



// ----------------------
// Start Server
// ----------------------
app.listen(PORT, () => {
  console.log(`Gatekeeper backend running on port ${PORT}`);
});

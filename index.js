require('dotenv').config();
const express = require('express');
const multer = require('multer');
const { google } = require('googleapis');
const fs = require('fs');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Google API setup
const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/spreadsheets',
];
const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json', // Update with your JSON file
  scopes: SCOPES,
});
const drive = google.drive({ version: 'v3', auth });
const sheets = google.sheets({ version: 'v4', auth });

const UPLOAD_FOLDER = './uploads';
const upload = multer({ dest: UPLOAD_FOLDER });

const SHEET_ID = '1BF5hTOHCrus1no1k_ESWb8l2McI3rjQtNnZ-8zOyHUg'; // Replace with Google Sheet ID
const SEPARATE_SHEET_ID = '1BF5hTOHCrus1no1k_ESWb8l2McI3rjQtNnZ-8zOyHUg'; // Replace with Separate Sheet ID
const DRIVE_FOLDER_ID = '1W5T-Jb93N6I3zpCyYYF2wk4pu-uGpKZX'; // Replace with Google Drive folder ID

// Upload Resume to Google Drive
app.post('/upload-resume', upload.single('resume'), async (req, res) => {
  try {
    const fileMetadata = {
      name: req.file.originalname,
      parents: [DRIVE_FOLDER_ID],
    };
    const media = {
      mimeType: req.file.mimetype,
      body: fs.createReadStream(req.file.path),
    };

    const file = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: 'id',
    });

    const fileUrl = 'https://drive.google.com/file/d/${file.data.id}/view ';

    res.json({ success: true, fileUrl });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Store Form Data in Separate Sheet
app.post('/save-to-sheet', async (req, res) => {
  try {
    const {
      email,
      phone,
      age,

      contract_type,

      country,

      degree,

      degree_recent,

      degree_type,

      experience,

      fileContent,

      filename,

      fullName,

      ongoing_studies,

      partner_nationality,

      related_degree,

      residence,

      salary,

      seniority,
    } = req.body;

    await sheets.spreadsheets.values.append({
      spreadsheetId: SEPARATE_SHEET_ID,
      range: 'Sheet1!A:C',
      valueInputOption: 'RAW',
      requestBody: {
        values: [
          [
            email,
            phone,
            age,
      
            contract_type,
      
            country,
      
            degree,
      
            degree_recent,
      
            degree_type,
      
            experience,
      
            fileContent,
      
            filename,
      
            fullName,
      
            ongoing_studies,
      
            partner_nationality,
      
            related_degree,
      
            residence,
      
            salary,
      
            seniority,
          ],
        ],
      },
    });

    res.json({ success: true, message: 'Data stored successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Store Resume URL in Supertasheet
app.post('/store-url', async (req, res) => {
  try {
    const { name, fileUrl } = req.body;

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:B',
      valueInputOption: 'RAW',
      requestBody: { values: [[name, fileUrl]] },
    });

    res.json({ success: true, message: 'URL stored successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.listen(5000, () => console.log('Server running on port 5000'));

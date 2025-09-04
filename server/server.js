
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');

// Load environment variables. 
// This must be done before accessing process.env.
const dotenvResult = require('dotenv').config();

if (dotenvResult.error) {
    if (dotenvResult.error.code === 'ENOENT') {
        console.error("FATAL ERROR: .env file not found. Please rename '.env.example' to '.env' and fill in your API_KEY.");
    } else {
        console.error("FATAL ERROR: Could not parse .env file.", dotenvResult.error);
    }
    process.exit(1);
}

const app = express();
const port = process.env.PORT || 3001;
const dbFilePath = path.join(__dirname, 'data.json');
const uploadsDir = path.join(__dirname, 'uploads');
const apiKey = process.env.API_KEY;

if (!apiKey || apiKey === 'your-super-secret-key-here') {
    console.error("FATAL ERROR: API_KEY is not defined or is not set in your .env file.");
    console.error("Please make sure your .env file contains a line like: API_KEY=your-secret-key-here");
    process.exit(1);
}

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // Increase limit for potentially large data blobs
app.use('/files', express.static(uploadsDir)); // Serve uploaded files statically

// Multer storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // To prevent filename conflicts and special character issues
        const safeOriginalName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
        cb(null, `${Date.now()}-${safeOriginalName}`);
    }
});
const upload = multer({ storage });


// API Key Auth Middleware
const authenticateKey = (req, res, next) => {
    const keyFromHeader = req.header('x-api-key');
    const keyFromQuery = req.query.apiKey;
    if (keyFromHeader === apiKey || keyFromQuery === apiKey) {
        return next();
    }
    return res.status(401).json({ error: 'Unauthorized: Invalid API Key' });
};

// Apply auth to all data-mutating or sensitive endpoints
app.use('/data', authenticateKey);
app.use('/upload', authenticateKey);

// Utility functions
const readData = () => {
    try {
        if (!fs.existsSync(dbFilePath)) {
            // If the file doesn't exist, create it with an empty object
            fs.writeFileSync(dbFilePath, JSON.stringify({}, null, 2));
            return {};
        }
        const rawData = fs.readFileSync(dbFilePath);
        // If file is empty, return empty object
        if (rawData.length === 0) {
            return {};
        }
        return JSON.parse(rawData);
    } catch (error) {
        console.error("Error reading data file:", error);
        return {};
    }
};

const writeData = (data) => {
    try {
        fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error writing data file:", error);
    }
};

// API Endpoints
// GET /data - Retrieve the entire database
app.get('/data', (req, res) => {
    const data = readData();
    // Check if data is empty object
    if (Object.keys(data).length === 0) {
       return res.status(404).send('No data found. Push data from the kiosk first.');
    }
    res.json(data);
});

// POST /data - Overwrite the entire database
app.post('/data', (req, res) => {
    const newData = req.body;
    writeData(newData);
    res.status(200).json({ message: 'Data saved successfully' });
});

// POST /upload - Upload a single file
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file provided.' });
    }
    // Return the generated filename so the client can reference it
    res.status(200).json({ filename: req.file.filename });
});

// Add a public status route to check if the server is live
app.get('/status', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: Date.now() });
});

// Add a root route to show a status page
app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Kiosk API Server Status</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
                    background-color: #f0f2f5;
                    color: #333;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                }
                .container {
                    background-color: white;
                    padding: 40px;
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    text-align: center;
                    max-width: 600px;
                }
                h1 {
                    color: #2ecc71;
                    font-size: 2em;
                    margin-bottom: 10px;
                }
                p {
                    font-size: 1.1em;
                    line-height: 1.6;
                }
                code {
                    background-color: #e8e8e8;
                    padding: 3px 6px;
                    border-radius: 4px;
                    font-family: "Courier New", Courier, monospace;
                }
                .endpoint {
                    margin-top: 1.5em;
                    text-align: left;
                    font-size: 0.9em;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>✓ API Server is Running</h1>
                <p>
                    This is the backend API server for the Interactive Kiosk. It's working correctly!
                </p>
                <div class="endpoint">
                    <p><strong>Database:</strong> <code>/data</code> (Accepts GET and POST)</p>
                    <p><strong>File Uploads:</strong> <code>/upload</code> (Accepts POST with multipart/form-data)</p>
                    <p><strong>Uploaded Files:</strong> <code>/files/:filename</code> (Serves static assets)</p>
                    <p><strong>Health Check:</strong> <code>/status</code> (Returns JSON status)</p>
                </div>
            </div>
        </body>
        </html>
    `);
});


app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
  console.log('Protecting endpoints with API_KEY.');
});
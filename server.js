const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// --- ADD THIS LINE TO FIX 404 ERRORS ---
// This serves your Novely.html and /img folder to the browser
app.use(express.static('./')); 

app.post('/generate-content', async (req, res) => {
    const { prompt, systemInstruction } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'API Key not found in server configuration.' });
    }

    // Updated to gemini-1.5-flash for broader compatibility
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: {
            parts: [{ text: systemInstruction }]
        },
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API call failed: ${errorData.error.message || response.status}`);
        }

        const result = await response.json();
        const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
        res.json({ text });
    } catch (error) {
        console.error("Gemini API call error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
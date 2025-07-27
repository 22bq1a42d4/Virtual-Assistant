// server.js
require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const multer = require('multer'); // For handling multipart/form-data (image uploads)
const { GoogleGenerativeAI } = require('@google/generative-ai'); // For Gemini API
// const twilio = require('twilio'); // THIS LINE MUST BE COMMENTED OUT OR REMOVED

// Initialize Firebase Admin SDK
// Make sure your serviceAccountKey.json is in the same directory as server.js
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore(); // Get a reference to the Firestore database
const app = express();
const port = process.env.PORT || 3000;

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Use gemini-2.0-flash for text and image understanding

// THESE TWILIO INITIALIZATION LINES MUST BE COMMENTED OUT OR REMOVED
// const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
// const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // For parsing application/json

// Multer setup for file uploads (images)
const upload = multer({ storage: multer.memoryStorage() }); // Store file in memory as a Buffer

// Middleware to verify Firebase ID Token
const verifyToken = async (req, res, next) => {
    const idToken = req.headers.authorization ? req.headers.authorization.split('Bearer ')[1] : req.body.idToken;

    if (!idToken) {
        if (req.path === '/api/query') {
            console.log('Unauthenticated request to /api/query');
            req.user = null; // Mark as unauthenticated
            return next();
        }
        return res.status(401).json({ error: 'Unauthorized: No token provided.' });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.user = decodedToken; // Attach user info to request
        next();
    } catch (error) {
        console.error("Error verifying ID token:", error);
        return res.status(403).json({ error: 'Unauthorized: Invalid token.' });
    }
};

// Helper function to convert image buffer to base64 for Gemini API
function bufferToGenerativePart(buffer, mimeType) {
    return {
        inlineData: {
            data: buffer.toString('base64'),
            mimeType
        },
    };
}

// API Endpoint for AI Assistant Queries (text and image)
app.post('/api/query', verifyToken, upload.single('image'), async (req, res) => {
    const userQuestion = req.body.question || '';
    const imageFile = req.file; // This will be the image buffer if uploaded

    console.log(`Received query from user ${req.user ? req.user.uid : 'unauthenticated'}: "${userQuestion}"`);

    let chatHistory = [];
    let parts = [{ text: userQuestion }];

    if (imageFile) {
        console.log(`Image received: ${imageFile.mimetype}`);
        parts.push(bufferToGenerativePart(imageFile.buffer, imageFile.mimetype));
    }

    chatHistory.push({ role: "user", parts: parts });

    try {
        const payload = { contents: chatHistory };
        const result = await model.generateContent(payload);
        const response = result.response;
        const text = response.text();

        res.json({ answer: text });
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        res.status(500).json({ error: "Failed to get response from AI." });
    }
});

// API Endpoint for Call Bot functionality
app.post('/api/call', verifyToken, async (req, res) => {
    const { phoneNumber } = req.body;
    let targetPhoneNumber = phoneNumber;

    if (!req.user) {
        if (!targetPhoneNumber) {
            return res.status(400).json({ error: "Phone number is required for unauthenticated calls." });
        }
    } else {
        try {
            const userDocRef = db.collection('users').doc(req.user.uid);
            const userDocSnap = await userDocRef.get();

            if (userDocSnap.exists && userDocSnap.data().phoneNumber) {
                targetPhoneNumber = userDocSnap.data().phoneNumber;
                console.log(`Using stored phone number for user ${req.user.uid}: ${targetPhoneNumber}`);
            } else if (!targetPhoneNumber) {
                return res.status(400).json({ error: "No phone number stored and none provided for call." });
            }
        } catch (error) {
            console.error("Error fetching user phone number:", error);
            if (!targetPhoneNumber) {
                return res.status(500).json({ error: "Failed to retrieve stored phone number and none provided." });
            }
        }
    }

    if (!targetPhoneNumber) {
        return res.status(400).json({ error: "A phone number is required to make a call." });
    }

    // Basic phone number format validation
    if (!targetPhoneNumber.match(/^\+\d{10,15}$/)) {
        return res.status(400).json({ error: "Invalid phone number format. Must include country code (e.g., +1234567890)." });
    }

    // --- Call Simulation Logic --- (This is the only logic in this block)
    console.log(`Simulating call to: ${targetPhoneNumber}`);
    res.json({ message: `Call simulation initiated to ${targetPhoneNumber}. (No actual call made)` });
});


// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

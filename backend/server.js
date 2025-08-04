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

// FAQ data and matching logic
const faqs = [
  { 
    questions: [
      'forgot my password', 'reset password', 'can’t log in', 'can not log in', 'can not login', 'forgot password', 'lost password', 'recover password'
    ],
    answer: 'To reset your password, click on the “Forgot Password” link on the login page and follow the instructions sent to your email or phone.'
  },
  {
    questions: [
      'change my account information', 'update my profile', 'edit my account', 'change email', 'change phone', 'update address', 'edit profile'
    ],
    answer: 'You can update your account information in the account settings or profile section after logging in.'
  },
  {
    questions: [
      'account locked', 'why is my account locked', 'unlock my account', 'account suspended', 'account blocked'
    ],
    answer: 'Your account may be locked due to multiple failed login attempts or suspicious activity. Please contact support to unlock it.'
  },
  {
    questions: [
      'charged twice', 'double charge', 'duplicate payment', 'billed twice'
    ],
    answer: 'Sorry for the confusion. Please share your transaction ID(s) and we’ll investigate and refund any duplicate charges.'
  },
  {
    questions: [
      'copy of my invoice', 'get invoice', 'download invoice', 'need invoice', 'billing statement'
    ],
    answer: 'You can download your invoices from the "Billing" or "Orders" section after logging in.'
  },
  {
    questions: [
      'payment failed', 'can’t pay', 'payment not working', 'transaction failed', 'payment error'
    ],
    answer: 'Please check your card or UPI details and try again. You can also use a different payment method.'
  },
  {
    questions: [
      'where is my order', 'track my order', 'order status', 'order not delivered', 'order tracking'
    ],
    answer: 'You can track your order using the tracking link in your confirmation email or in the “My Orders” section.'
  },
  {
    questions: [
      'cancel my order', 'change my order', 'edit my order', 'modify my order', 'order cancellation'
    ],
    answer: 'You can cancel or modify your order within 30 minutes of placing it in the “My Orders” section.'
  },
  {
    questions: [
      'wrong item', 'received wrong product', 'incorrect item', 'wrong order'
    ],
    answer: 'Sorry for the mix-up. Please share a photo of the wrong item and we’ll send the correct one or offer a refund.'
  },
  {
    questions: [
      'app isn’t working', 'website isn’t working', 'site not loading', 'app not working', 'technical issue', 'site down'
    ],
    answer: 'Try refreshing the page or restarting the app. If the issue persists, clear your cache or reinstall the app.'
  },
  {
    questions: [
      'error code', 'getting an error', 'error message', 'what does this error mean'
    ],
    answer: 'Please share the exact error code or message so we can assist you with a specific solution.'
  },
  {
    questions: [
      'install your product', 'how to install', 'installation guide', 'setup instructions'
    ],
    answer: 'You can find the installation guide in the Help section or documentation page of our website.'
  },
  {
    questions: [
      'upgrade my plan', 'change my plan', 'upgrade subscription', 'switch plan'
    ],
    answer: 'Go to your account > Subscription/Plans section and choose the plan you want to upgrade to.'
  },
  {
    questions: [
      'cancel my subscription', 'stop subscription', 'end subscription', 'unsubscribe'
    ],
    answer: 'You can cancel your subscription anytime from the Subscription page. Your access will continue until the end of the billing cycle.'
  },
  {
    questions: [
      'charged for auto-renewal', 'auto-renewal charge', 'subscription renewed', 'auto renewal'
    ],
    answer: 'Our subscriptions renew automatically unless canceled. You can disable auto-renewal in your account settings.'
  },
  {
    questions: [
      'account hacked', 'my account was hacked', 'compromised account', 'security breach'
    ],
    answer: 'Please reset your password immediately and contact support to secure your account.'
  },
  {
    questions: [
      'handle my data', 'privacy policy', 'data privacy', 'how is my data used', 'data security'
    ],
    answer: 'We follow strict privacy standards and never share your data with third parties without your consent. See our privacy policy for more.'
  },
  {
    questions: [
      'talk to a human', 'connect to agent', 'live agent', 'real person', 'customer support'
    ],
    answer: 'Sure, I can connect you to a live agent. Please wait a moment...'
  },
  {
    questions: [
      'didn’t get a response', 'no response', 'no reply', 'not answered'
    ],
    answer: 'Sorry about that! Please summarize your issue again and we’ll help you.'
  },
  {
    questions: [
      'escalate this issue', 'speak to manager', 'escalate', 'senior representative'
    ],
    answer: 'I’ll escalate this to a senior representative who will get back to you shortly.'
  },
  {
    questions: [
      'return policy', 'how to return', 'can I return', 'return an item'
    ],
    answer: 'You can return items within 7 days of delivery if they’re unused and in original condition. See our Return Policy page for more.'
  },
  {
    questions: [
      'refund time', 'how long for refund', 'when will I get refund', 'refund process'
    ],
    answer: 'Refunds typically take 5–7 business days to reflect in your account, depending on your bank.'
  },
  {
    questions: [
      'customer service hours', 'support hours', 'when are you open', 'working hours'
    ],
    answer: 'Our support is available 9 AM – 9 PM, Monday to Saturday.'
  },
  {
    questions: [
      'where are you located', 'office location', 'company location', 'head office'
    ],
    answer: 'We operate online but our head office is in [Your City/Country]. Visit our Contact Us page for details.'
  },
  {
    questions: [
      'support multiple languages', 'languages supported', 'other languages', 'multilingual'
    ],
    answer: 'Yes! We currently support English, Hindi, and [Add your languages].'
  },
  {
    questions: [
      'contact you directly', 'how do I contact', 'support email', 'customer care number', 'call support'
    ],
    answer: 'You can reach us at support@[yourdomain].com or call +91-XXXXXXXXXX.'
  },
  {
    questions: [
      'give feedback', 'feedback form', 'how to give feedback', 'send feedback'
    ],
    answer: 'We’d love to hear from you! You can fill our feedback form in the Help or Contact section.'
  },
  {
    questions: [
      'refer a friend', 'referral program', 'invite friend', 'get referral rewards'
    ],
    answer: 'Use your referral link in your profile. You and your friend both get rewards!'
  },
  {
    questions: [
      'mobile app', 'is there an app', 'download app', 'app available'
    ],
    answer: 'Yes! Download our app from the Play Store or App Store by searching “[App Name]”.'
  },
  {
    questions: [
      'response time', 'how fast do you reply', 'how long for response', 'reply time'
    ],
    answer: 'We usually respond within 24 hours on weekdays and 48 hours over weekends.'
  }
];

function findFaqAnswer(userQuestion) {
  const normalized = userQuestion.toLowerCase();
  for (const faq of faqs) {
    for (const q of faq.questions) {
      if (normalized.includes(q)) {
        return faq.answer;
      }
    }
  }
  return null;
}

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

    // FAQ matching logic
    const faqAnswer = findFaqAnswer(userQuestion);
    if (faqAnswer) {
      return res.json({ answer: faqAnswer });
    }

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

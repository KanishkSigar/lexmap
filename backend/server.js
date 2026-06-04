require('dotenv').config();
const express       = require('express');
const cors          = require('cors');
const bodyParser    = require('body-parser');
const jwt           = require('jsonwebtoken');
const processRoutes = require('./routes/process');
const chatRoutes    = require('./routes/chat');
const uploadRoutes  = require('./routes/upload');

const app  = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));

// Phase 1 routes (Text Processing)
app.use('/api/process', processRoutes);

// Chat (Lex AI assistant)
app.use('/api/chat', chatRoutes);

// PDF upload & text extraction
app.use('/api/upload-pdf', uploadRoutes);

// Simple JWT Auth
const JWT_SECRET = process.env.JWT_SECRET || 'ethereal_archive_secret_key_123';

app.post('/api/login', (req, res) => {
    const { name, email } = req.body;
    if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required.' });
    }
    // Issue a simple token valid for 24 hours
    const token = jwt.sign({ name, email }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { name, email } });
});

app.get('/api/verify', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.status(401).json({ error: 'No token provided' });
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token' });
        res.json({ valid: true, user });
    });
});


// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', phase: 2, timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`[Server] LexMap backend running on http://localhost:${PORT}`);
    console.log(`[Server] Phase 2 – Enhanced NLP engine enabled.`);
});

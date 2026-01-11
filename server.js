import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(cors());

// חיבור ל-MongoDB
const MONGO_URI = "mongodb://mongo:fuXtLUJfejdmyazKTgClwAytHgRwLUEV@mongodb.railway.internal:27017";

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ Connection error:', err));

// מודלים (Schemas)
const Donor = mongoose.model('Donor', new mongoose.Schema({
  name: String, phone: String, email: String, totalDonated: Number, packageId: String
}));

const Prize = mongoose.model('Prize', new mongoose.Schema({
  titleHE: String, value: Number, media: Array, order: Number
}));

const Package = mongoose.model('Package', new mongoose.Schema({
  nameHE: String, minAmount: Number, rules: Array, color: String
}));

// API Routes
app.post('/api/donors', async (req, res) => {
  try { const d = await Donor.create(req.body); res.status(201).send(d); } catch (e) { res.status(400).send(e); }
});

app.get('/api/donors', async (req, res) => { res.send(await Donor.find()); });

app.post('/api/prizes', async (req, res) => {
  try { const p = await Prize.create(req.body); res.status(201).send(p); } catch (e) { res.status(400).send(e); }
});

app.post('/api/packages', async (req, res) => {
  try { const pkg = await Package.create(req.body); res.status(201).send(pkg); } catch (e) { res.status(400).send(e); }
});

// --- הגשת קבצי ה-Frontend (React) ---
// אומרים לשרת להשתמש בקבצים שנמצאים בתיקיית dist
app.use(express.static(path.join(__dirname, 'dist')));

// בכל נתיב אחר שלא מצאנו (כמו דף הבית), נשלח את ה-index.html של React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
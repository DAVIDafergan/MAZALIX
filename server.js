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

// הכתובת הפנימית של Railway
const MONGO_URI = "mongodb://mongo:fuXtLUJfejdmyazKTgClwAytHgRwLUEV@mongodb.railway.internal:27017";

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Successfully'))
  .catch(err => console.error('❌ Connection error:', err));

// --- סכמות (Schemas) ---

// הוספת מודל לקוחות
const Client = mongoose.model('Client', new mongoose.Schema({
  name: String, phone: String, email: String, user: String, pass: String, createdAt: { type: Date, default: Date.now }
}));

const Donor = mongoose.model('Donor', new mongoose.Schema({
  name: String, phone: String, email: String, totalDonated: Number, packageId: String, clientId: String
}));

const Prize = mongoose.model('Prize', new mongoose.Schema({
  titleHE: String, value: Number, media: Array, order: Number, clientId: String
}));

const Package = mongoose.model('Package', new mongoose.Schema({
  nameHE: String, minAmount: Number, rules: Array, color: String, clientId: String
}));

// --- API Routes ---

// ניהול לקוחות
app.post('/api/clients', async (req, res) => {
  try { const c = await Client.create(req.body); res.status(201).send(c); } catch (e) { res.status(400).send(e); }
});
app.get('/api/clients', async (req, res) => { res.send(await Client.find()); });

// נתיבים קיימים (תורמים, פרסים, מסלולים)
app.post('/api/donors', async (req, res) => {
  try { const d = await Donor.create(req.body); res.status(201).send(d); } catch (e) { res.status(400).send(e); }
});
app.get('/api/donors', async (req, res) => { res.send(await Donor.find()); });

app.post('/api/prizes', async (req, res) => {
  try { const p = await Prize.create(req.body); res.status(201).send(p); } catch (e) { res.status(400).send(e); }
});
app.post('/api/packages', async (req, res) => {
  try { const p = await Package.create(req.body); res.status(201).send(p); } catch (e) { res.status(400).send(e); }
});

// הגשת קבצי ה-Frontend
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => { res.sendFile(path.join(__dirname, 'dist', 'index.html')); });

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
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

const MONGO_URI = "mongodb://mongo:fuXtLUJfejdmyazKTgClwAytHgRwLUEV@mongodb.railway.internal:27017";

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Successfully'))
  .catch(err => console.error('❌ Connection error:', err));

// סכמות גמישות כדי שלא יחסר מידע
const Client = mongoose.model('Client', new mongoose.Schema({}, { strict: false }));
const Donor = mongoose.model('Donor', new mongoose.Schema({}, { strict: false }));
const Prize = mongoose.model('Prize', new mongoose.Schema({}, { strict: false }));
const Package = mongoose.model('Package', new mongoose.Schema({}, { strict: false }));

// API Routes עם הדפסות לדיבאג
app.post('/api/:collection', async (req, res) => {
  const { collection } = req.params;
  try {
    console.log(`📩 Received data for ${collection}:`, req.body);
    let model;
    if (collection === 'clients') model = Client;
    else if (collection === 'prizes') model = Prize;
    else if (collection === 'donors') model = Donor;
    else if (collection === 'packages') model = Package;

    const doc = await model.create(req.body);
    res.status(201).send(doc);
  } catch (e) {
    console.error(`❌ Error saving to ${collection}:`, e);
    res.status(400).send(e);
  }
});

app.get('/api/:collection', async (req, res) => {
  const { collection } = req.params;
  try {
    let model = (collection === 'clients') ? Client : (collection === 'prizes' ? Prize : (collection === 'donors' ? Donor : Package));
    const data = await model.find();
    res.send(data);
  } catch (e) { res.status(500).send(e); }
});

app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
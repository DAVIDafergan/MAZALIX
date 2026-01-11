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

// פונקציית עזר לקבלת המודל הנכון לפי שם ה-collection
const getModel = (name) => {
  if (name === 'clients') return Client;
  if (name === 'prizes') return Prize;
  if (name === 'donors') return Donor;
  if (name === 'packages') return Package;
  return null;
};

// --- נתיב ספציפי לעדכון הגדרות קמפיין של לקוח ---
app.put('/api/clients/:id/campaign', async (req, res) => {
  try {
    const { id } = req.params;
    const { campaign } = req.body;
    
    const updatedClient = await Client.findOneAndUpdate(
      { id: id }, 
      { $set: { campaign: campaign } },
      { new: true }
    );
    
    if (!updatedClient) return res.status(404).send({ message: "Client not found" });
    res.send(updatedClient);
  } catch (e) {
    console.error("❌ Error updating campaign:", e);
    res.status(500).send(e);
  }
});

// API Routes עם הדפסות לדיבאג
app.post('/api/:collection', async (req, res) => {
  const { collection } = req.params;
  try {
    console.log(`📩 Received data for ${collection}:`, req.body);
    let model = getModel(collection);

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
    let model = getModel(collection);
    const data = await model.find();
    res.send(data);
  } catch (e) { res.status(500).send(e); }
});

// --- נתיב עדכון כללי (עבור פרסים, חבילות וכו') ---
app.put('/api/:collection/:id', async (req, res) => {
  const { collection, id } = req.params;
  try {
    const model = getModel(collection);
    const updatedDoc = await model.findOneAndUpdate(
      { id: id },
      { $set: req.body },
      { new: true }
    );
    res.send(updatedDoc);
  } catch (e) {
    console.error(`❌ Error updating ${collection}:`, e);
    res.status(500).send(e);
  }
});

// --- נתיב מחיקה ---
app.delete('/api/:collection/:id', async (req, res) => {
  const { collection, id } = req.params;
  try {
    const model = getModel(collection);
    await model.findOneAndDelete({ id: id });
    res.send({ message: "Successfully deleted" });
  } catch (e) {
    console.error(`❌ Error deleting from ${collection}:`, e);
    res.status(500).send(e);
  }
});

app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
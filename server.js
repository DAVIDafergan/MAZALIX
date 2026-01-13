import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// הגדרת נתיבים עבור ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- Middleware ---
app.use(express.json({ limit: '50mb' }));
app.use(cors());

// --- חיבור למסד הנתונים ---
const MONGO_URI = process.env.MONGO_URI || "mongodb://mongo:fuXtLUJfejdmyazKTgClwAytHgRwLUEV@mongodb.railway.internal:27017";

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Successfully'))
  .catch(err => console.error('❌ Connection error:', err));

// --- סכמות ומודלים (Schemas & Models) ---
const Client = mongoose.model('Client', new mongoose.Schema({}, { strict: false }));
const Donor = mongoose.model('Donor', new mongoose.Schema({}, { strict: false }));
const Prize = mongoose.model('Prize', new mongoose.Schema({}, { strict: false }));
const Package = mongoose.model('Package', new mongoose.Schema({}, { strict: false }));
const Ticket = mongoose.model('Ticket', new mongoose.Schema({}, { strict: false }));
// טבלה להגדרות קמפיין כלליות
const Setting = mongoose.model('Setting', new mongoose.Schema({}, { strict: false }), 'settings');

const getModel = (name) => {
  if (name === 'clients') return Client;
  if (name === 'prizes') return Prize;
  if (name === 'donors') return Donor;
  if (name === 'packages') return Package;
  if (name === 'tickets') return Ticket;
  if (name === 'settings') return Setting;
  return null;
};

// --- לוגיקת מנהל על (Super Admin) ---
const ADMIN_CREDENTIALS = {
  username: 'DA1234',
  password: 'DA1234',
  token: 'mazalix-admin-super-token-2026'
};

// נתיב התחברות
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    return res.json({ 
      success: true, 
      token: ADMIN_CREDENTIALS.token,
      isSuperAdmin: true,
      clientId: 'super' 
    });
  }

  try {
    const client = await Client.findOne({ 
      $or: [{ username: username }, { displayName: username }], 
      password: password 
    });

    if (client) {
      res.json({ 
        success: true, 
        token: 'client-token-' + (client.id || client._id), 
        isSuperAdmin: false,
        clientId: client.id || client._id 
      });
    } else {
      res.status(401).json({ success: false, message: "פרטי התחברות שגויים" });
    }
  } catch (e) {
    res.status(500).json({ success: false, message: "שגיאת שרת פנימית" });
  }
});

const requireAdmin = (req, res, next) => {
  const token = req.headers['x-admin-token'];
  if (token === ADMIN_CREDENTIALS.token) {
    next();
  } else {
    res.status(403).json({ message: "גישה חסומה" });
  }
};

// --- API ROUTES ---

app.put('/api/settings/global', async (req, res) => {
  try {
    const updatedSetting = await Setting.findOneAndUpdate(
      {},
      { $set: req.body },
      { upsert: true, new: true }
    );
    res.send(updatedSetting);
  } catch (e) {
    res.status(500).send(e);
  }
});

app.put('/api/clients/:id/campaign', async (req, res) => {
  try {
    const { id } = req.params;
    const { campaign } = req.body;
    
    const updatedClient = await Client.findOneAndUpdate(
      { $or: [{ id: id }, { _id: mongoose.isValidObjectId(id) ? id : null }] }, 
      { $set: { campaign: campaign } },
      { new: true, strict: false }
    );
    
    if (!updatedClient) return res.status(404).send({ message: "Client not found" });
    res.send(updatedClient);
  } catch (e) {
    res.status(500).send(e);
  }
});

app.post('/api/:collection', async (req, res) => {
  const { collection } = req.params;
  try {
    let model = getModel(collection);
    if (!model) return res.status(404).send({ message: "Collection not found" });
    const doc = await model.create(req.body);
    res.status(201).send(doc);
  } catch (e) {
    res.status(400).send(e);
  }
});

app.get('/api/:collection', async (req, res) => {
  const { collection } = req.params;
  try {
    let model = getModel(collection);
    if (!model) return res.status(404).send({ message: "Collection not found" });
    const data = await model.find();
    res.send(data);
  } catch (e) {
    res.status(500).send(e);
  }
});

app.put('/api/:collection/:id', async (req, res) => {
  const { collection, id } = req.params;
  try {
    const model = getModel(collection);
    if (!model) return res.status(404).send({ message: "Collection not found" });
    
    // חיפוש חסין לפי id (מחרוזת) או _id (אובייקט מונגו)
    const query = { $or: [{ id: id }, { _id: mongoose.isValidObjectId(id) ? id : null }] };
    
    const updatedDoc = await model.findOneAndUpdate(
      query,
      { $set: req.body },
      { new: true }
    );
    res.send(updatedDoc);
  } catch (e) {
    res.status(500).send(e);
  }
});

app.delete('/api/:collection/:id', async (req, res) => {
  const { collection, id } = req.params;
  try {
    const model = getModel(collection);
    if (!model) return res.status(404).send({ message: "Collection not found" });
    
    // חיפוש חסין למחיקה סופית מהמסד
    const query = { $or: [{ id: id }, { _id: mongoose.isValidObjectId(id) ? id : null }] };
    
    const deletedDoc = await model.findOneAndDelete(query);
    
    if (deletedDoc) {
      res.send({ message: "Deleted successfully", deletedId: id });
    } else {
      res.status(404).send({ message: "Record not found" });
    }
  } catch (e) {
    res.status(500).send(e);
  }
});

// --- הגשת קבצים סטטיים ---
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
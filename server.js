import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(cors());

// הכתובת הפנימית של Railway שסיפקת
const MONGO_URI = "mongodb://mongo:fuXtLUJfejdmyazKTgClwAytHgRwLUEV@mongodb.railway.internal:27017";

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Successfully'))
  .catch(err => console.error('❌ Connection error:', err));

// הגדרת סכמות (Schemas) - זה מה שיוצר את הטבלאות
const donorSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: String,
  totalDonated: Number,
  packageId: String
});

const prizeSchema = new mongoose.Schema({
  titleHE: String,
  titleEN: String,
  descriptionHE: String,
  descriptionEN: String,
  value: Number,
  media: Array,
  status: String,
  order: Number,
  isFeatured: Boolean,
  isFullPage: Boolean
});

const packageSchema = new mongoose.Schema({
  nameHE: String,
  nameEN: String,
  minAmount: Number,
  rules: Array,
  image: String,
  color: String
});

// יצירת המודלים
const Donor = mongoose.model('Donor', donorSchema);
const Prize = mongoose.model('Prize', prizeSchema);
const Package = mongoose.model('Package', packageSchema);

// API Routes
app.post('/api/donors', async (req, res) => {
  try {
    const donor = new Donor(req.body);
    await donor.save();
    res.status(201).send(donor);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get('/api/donors', async (req, res) => {
  try {
    const donors = await Donor.find();
    res.send(donors);
  } catch (error) {
    res.status(500).send(error);
  }
});

// נתיבים נוספים לפרסים ומסלולים
app.post('/api/prizes', async (req, res) => {
  try {
    const prize = new Prize(req.body);
    await prize.save();
    res.status(201).send(prize);
  } catch (error) { res.status(400).send(error); }
});

app.post('/api/packages', async (req, res) => {
  try {
    const pkg = new Package(req.body);
    await pkg.save();
    res.status(201).send(pkg);
  } catch (error) { res.status(400).send(error); }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));
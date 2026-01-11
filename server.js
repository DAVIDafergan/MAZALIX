const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json({ limit: '50mb' })); // תמיכה בהעלאת קבצים גדולים (Base64)
app.use(cors());

// התחברות למסד הנתונים
const MONGO_URI = "mongodb://mongo:fuXtLUJfejdmyazKTgClwAytHgRwLUEV@mongodb.railway.internal:27017";
// הערה: אם אתה מריץ את השרת מהמחשב בבית, השתמש בכתובת ה-Proxy החיצונית ש-Railway נותן לך

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB on Railway'))
  .catch(err => console.error('❌ Connection error:', err));

// הגדרת מבנה הטבלאות (Schemas)
const DonorSchema = new mongoose.Schema({
  name: String, phone: String, email: String, totalDonated: Number, packageId: String
});

const PrizeSchema = new mongoose.Schema({
  titleHE: String, titleEN: String, descriptionHE: String, descriptionEN: String,
  value: Number, media: Array, status: String, order: Number, isFeatured: Boolean, isFullPage: Boolean
});

const PackageSchema = new mongoose.Schema({
  nameHE: String, nameEN: String, minAmount: Number, rules: Array, image: String, color: String
});

const Donor = mongoose.model('Donor', DonorSchema);
const Prize = mongoose.model('Prize', PrizeSchema);
const Package = mongoose.model('Package', PackageSchema);

// API Routes - שמירה ושליפה
app.post('/api/donors', async (req, res) => {
  const donor = new Donor(req.body);
  await donor.save();
  res.send(donor);
});

app.get('/api/donors', async (req, res) => {
  const donors = await Donor.find();
  res.send(donors);
});

app.post('/api/prizes', async (req, res) => {
  const prize = new Prize(req.body);
  await prize.save();
  res.send(prize);
});

app.get('/api/prizes', async (req, res) => {
  const prizes = await Prize.find();
  res.send(prizes);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
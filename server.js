
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mazalix')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('DB Connection Error:', err));

// --- SCHEMAS ---

const ClientSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  displayName: String,
  isActive: { type: Boolean, default: true },
  campaign: {
    nameHE: { type: String, default: 'הקמפיין שלי' },
    nameEN: { type: String, default: 'My Campaign' },
    logo: String,
    banner: String,
    drawDate: { type: String, default: '2025-12-31' },
    primaryColor: { type: String, default: '#C2A353' },
    donationUrl: String
  }
}, { timestamps: true });

const PrizeSchema = new mongoose.Schema({
  clientId: { type: String, required: true, index: true },
  titleHE: String,
  titleEN: String,
  descriptionHE: String,
  descriptionEN: String,
  value: Number,
  media: [{ type: { type: String }, url: String }],
  status: { type: String, default: 'OPEN' },
  winnerId: String,
  isFeatured: Boolean,
  isFullPage: Boolean,
  order: Number
});

const PackageSchema = new mongoose.Schema({
  clientId: { type: String, required: true, index: true },
  nameHE: String,
  nameEN: String,
  minAmount: Number,
  rules: [{ prizeId: String, count: Number }],
  image: String,
  color: String
});

const DonorSchema = new mongoose.Schema({
  clientId: { type: String, required: true, index: true },
  name: String,
  phone: String,
  email: String,
  totalDonated: Number,
  packageId: String
});

const TicketSchema = new mongoose.Schema({
  clientId: { type: String, required: true, index: true },
  donorId: String,
  prizeId: String,
  createdAt: { type: Number, default: Date.now }
});

const Client = mongoose.model('Client', ClientSchema);
const Prize = mongoose.model('Prize', PrizeSchema);
const Package = mongoose.model('Package', PackageSchema);
const Donor = mongoose.model('Donor', DonorSchema);
const Ticket = mongoose.model('Ticket', TicketSchema);

// --- API ROUTES ---

// Auth
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  // USER REQUIREMENT: Super Admin DA1234 / DA1234
  if (username === 'DA1234' && password === 'DA1234') {
    return res.json({ isLoggedIn: true, isSuperAdmin: true, clientId: 'super' });
  }
  const client = await Client.findOne({ username, password });
  if (client) {
    if (!client.isActive) return res.status(403).json({ message: 'Account disabled' });
    res.json({ isLoggedIn: true, isSuperAdmin: false, clientId: client._id });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Global Donor Search across all campaigns by phone
app.get('/api/donors/search/:phone', async (req, res) => {
  const { phone } = req.params;
  try {
    const donorRecords = await Donor.find({ phone });
    const results = await Promise.all(donorRecords.map(async (d) => {
      const client = await Client.findById(d.clientId);
      return {
        donor: d,
        campaign: client ? {
          id: client._id,
          nameHE: client.campaign.nameHE,
          nameEN: client.campaign.nameEN,
          logo: client.campaign.logo
        } : null
      };
    }));
    res.json(results.filter(r => r.campaign !== null));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Super Admin: Clients management
app.get('/api/clients', async (req, res) => {
  const clients = await Client.find({}, '-password');
  res.json(clients);
});

app.post('/api/clients', async (req, res) => {
  const client = new Client(req.body);
  await client.save();
  res.json(client);
});

app.put('/api/clients/:id', async (req, res) => {
  const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(client);
});

app.delete('/api/clients/:id', async (req, res) => {
  const clientId = req.params.id;
  await Client.findByIdAndDelete(clientId);
  await Promise.all([
    Prize.deleteMany({ clientId }),
    Package.deleteMany({ clientId }),
    Donor.deleteMany({ clientId }),
    Ticket.deleteMany({ clientId })
  ]);
  res.json({ success: true });
});

// Campaign Settings
app.put('/api/clients/:id/campaign', async (req, res) => {
  const client = await Client.findByIdAndUpdate(
    req.params.id,
    { $set: { campaign: req.body } },
    { new: true }
  );
  res.json(client.campaign);
});

// Bulk Data Fetch
app.get('/api/data/:clientId', async (req, res) => {
  const { clientId } = req.params;
  try {
    const [client, prizes, packages, donors, tickets] = await Promise.all([
      Client.findById(clientId),
      Prize.find({ clientId }).sort('order'),
      Package.find({ clientId }),
      Donor.find({ clientId }),
      Ticket.find({ clientId })
    ]);
    res.json({ campaign: client?.campaign, prizes, packages, donors, tickets });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Prize CRUD
app.post('/api/prizes', async (req, res) => {
  const prize = new Prize(req.body);
  await prize.save();
  res.json(prize);
});

app.put('/api/prizes/:id', async (req, res) => {
  const prize = await Prize.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(prize);
});

app.delete('/api/prizes/:id', async (req, res) => {
  await Prize.findByIdAndDelete(req.params.id);
  await Ticket.deleteMany({ prizeId: req.params.id });
  res.json({ success: true });
});

// Package CRUD
app.post('/api/packages', async (req, res) => {
  const pkg = new Package(req.body);
  await pkg.save();
  res.json(pkg);
});

app.delete('/api/packages/:id', async (req, res) => {
  await Package.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Donor Registration & Automated Ticket Mapping
app.post('/api/donors', async (req, res) => {
  const { clientId, donor, tickets } = req.body;
  const updatedDonor = await Donor.findOneAndUpdate(
    { clientId, phone: donor.phone },
    { ...donor, clientId },
    { upsert: true, new: true }
  );
  await Ticket.deleteMany({ clientId, donorId: updatedDonor._id });
  if (tickets && tickets.length > 0) {
    const ticketDocs = tickets.map(t => ({ ...t, clientId, donorId: updatedDonor._id }));
    await Ticket.insertMany(ticketDocs);
  }
  res.json(updatedDonor);
});

// Static Serving
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

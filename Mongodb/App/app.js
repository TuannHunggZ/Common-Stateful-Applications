const express = require('express');
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');
const path = require('path');
const User = require('./models/User');

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.json());

const mongoURI = 'mongodb://mongo1:27017,mongo2:27017,mongo3:27017/?replicaSet=myReplicaSet';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB Replica Set"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// Serve HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// API: Get all users
app.get('/api/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// API: Add user
app.post('/api/users', async (req, res) => {
  const { name, email } = req.body;
  const user = await User.create({ name, email });
  res.status(201).json(user);
});

// API: Delete user
app.delete('/api/users/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

// API: Replica status
app.get('/api/replica-status', async (req, res) => {
  const client = new MongoClient(mongoURI, { useUnifiedTopology: true });
  try {
    await client.connect();
    const adminDb = client.db().admin();
    const status = await adminDb.command({ replSetGetStatus: 1 });

    const members = status.members.map(m => ({
      name: m.name,
      stateStr: m.stateStr,
      health: m.health
    }));

    res.json({ setName: status.set, members });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await client.close();
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});

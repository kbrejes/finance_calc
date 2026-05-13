const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 8080;
const DB_FILE = path.join(__dirname, 'db.json');

app.use(express.json());
app.use(express.static(__dirname));

// ---------- Helpers ----------

function readDB() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  } catch {
    return { spending: [], students: [] };
  }
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Initialize db.json if it doesn't exist
if (!fs.existsSync(DB_FILE)) {
  writeDB({ spending: [], students: [] });
}

// ---------- API ----------

app.get('/api/spending', (req, res) => {
  const db = readDB();
  res.json(db.spending);
});

app.post('/api/spending', (req, res) => {
  const db = readDB();
  db.spending = req.body;
  writeDB(db);
  res.json({ ok: true });
});

app.get('/api/students', (req, res) => {
  const db = readDB();
  res.json(db.students);
});

app.post('/api/students', (req, res) => {
  const db = readDB();
  db.students = req.body;
  writeDB(db);
  res.json({ ok: true });
});

// ---------- Start ----------

app.listen(PORT, () => {
  console.log(`Finance Calc server running at http://localhost:${PORT}`);
});

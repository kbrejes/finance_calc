import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = 3005
const DB_FILE = path.join(__dirname, 'db.json')

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

// ---------- SPENDING ENDPOINTS ----------

app.get('/api/spending', (req, res) => {
  const db = readDB();
  res.json(db.spending);
});

app.post('/api/spending', (req, res) => {
  const db = readDB();
  const newItem = {
    id: Date.now(),
    ...req.body
  };
  db.spending.push(newItem);
  writeDB(db);
  res.json(newItem);
});

app.delete('/api/spending/:id', (req, res) => {
  const db = readDB();
  const id = parseInt(req.params.id);
  db.spending = db.spending.filter(item => item.id !== id);
  writeDB(db);
  res.json({ ok: true });
});

app.put('/api/spending/:id', (req, res) => {
  const db = readDB();
  const id = parseInt(req.params.id);
  const idx = db.spending.findIndex(item => item.id === id);
  if (idx >= 0) {
    db.spending[idx] = { ...db.spending[idx], ...req.body };
    writeDB(db);
    res.json(db.spending[idx]);
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

// ---------- STUDENTS ENDPOINTS ----------

app.get('/api/students', (req, res) => {
  const db = readDB();
  res.json(db.students);
});

app.post('/api/students', (req, res) => {
  const db = readDB();
  const newStudent = {
    id: Date.now(),
    ...req.body
  };
  db.students.push(newStudent);
  writeDB(db);
  res.json(newStudent);
});

app.delete('/api/students/:id', (req, res) => {
  const db = readDB();
  const id = parseInt(req.params.id);
  db.students = db.students.filter(s => s.id !== id);
  writeDB(db);
  res.json({ ok: true });
});

app.put('/api/students/:id', (req, res) => {
  const db = readDB();
  const id = parseInt(req.params.id);
  const idx = db.students.findIndex(s => s.id === id);
  if (idx >= 0) {
    db.students[idx] = { ...db.students[idx], ...req.body };
    writeDB(db);
    res.json(db.students[idx]);
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

// ---------- Start ----------

app.listen(PORT, () => {
  console.log(`Finance Calc server running at http://localhost:${PORT}`);
});

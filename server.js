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
const BACKUP_DIR = path.join(__dirname, 'backups')

// Ensure directories exist
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// ---------- Helpers ----------

function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) return { spending: [], students: [] };
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  } catch (error) {
    console.error('Error reading DB:', error);
    return { spending: [], students: [] };
  }
}

import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

// ... existing code ...

async function syncToGithub() {
  try {
    // 1. Add the ignored db.json specifically
    await execAsync('git add -f db.json');
    // 2. Create a temporary backup commit
    const timestamp = new Date().toISOString();
    await execAsync(`git commit -m "data: cloud backup ${timestamp}"`);
    // 3. Push to a dedicated backup branch (force push to keep it simple)
    await execAsync('git push origin master:data-backup -f');
    // 4. Undo the commit locally so the server stays clean for next deploy
    await execAsync('git reset HEAD~1');
    // 5. Re-ignore the file locally
    await execAsync('git rm --cached db.json');
    console.log('Cloud Sync: Success');
  } catch (error) {
    // Error is expected if there are no changes to commit
    if (!error.message.includes('nothing to commit')) {
      console.error('Cloud Sync Failed:', error.message);
    }
  }
}

function writeDB(data) {
  try {
    // 1. Create a versioned backup before writing
    if (fs.existsSync(DB_FILE)) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(BACKUP_DIR, `db_${timestamp}.json`);
      fs.copyFileSync(DB_FILE, backupPath);

      // 2. Keep only the last 100 backups to save space
      const backups = fs.readdirSync(BACKUP_DIR)
        .filter(f => f.startsWith('db_'))
        .sort()
        .reverse();
      
      if (backups.length > 100) {
        backups.slice(100).forEach(f => fs.unlinkSync(path.join(BACKUP_DIR, f)));
      }
    }

    // 3. Atomic Write: Write to temp file first, then rename
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);

    // 4. Trigger Cloud Sync in the background
    syncToGithub();
  } catch (error) {
    console.error('CRITICAL: Failed to write to DB:', error);
  }
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

// ---------- ASSETS ENDPOINTS ----------

app.get('/api/assets', (req, res) => {
  const db = readDB();
  res.json(db.assets || { physical: [], financial: [], vitals: [], digital: [] });
});

app.post('/api/assets', (req, res) => {
  const db = readDB();
  db.assets = req.body;
  writeDB(db);
  res.json(db.assets);
});

// ---------- Start ----------

app.listen(PORT, () => {
  console.log(`Finance Calc server running at http://localhost:${PORT}`);
});

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: true,
}));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function ensureTables() {
  await pool.query(`CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    domain TEXT NOT NULL,
    port INT NOT NULL,
    password TEXT NOT NULL,
    obfs TEXT,
    package_name TEXT,
    expired_at TIMESTAMP,
    limit_conn INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`);
  await pool.query(`CREATE TABLE IF NOT EXISTS connections (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    ip_address TEXT,
    connected_at TIMESTAMP,
    disconnected_at TIMESTAMP,
    bytes_sent BIGINT DEFAULT 0,
    bytes_received BIGINT DEFAULT 0
  );`);
}

ensureTables().catch(console.error);

function auth(req, res, next) {
  if (req.session && req.session.loggedIn) return next();
  res.status(401).json({ error: 'Unauthorized' });
}

app.post('/api/login', (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) {
    req.session.loggedIn = true;
    return res.json({ ok: true });
  }
  res.status(401).json({ error: 'Invalid password' });
});

app.use('/api', auth);

app.post('/api/users', async (req, res) => {
  const { domain, port, password, obfs, package_name, expired_at, limit_conn } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO users(domain, port, password, obfs, package_name, expired_at, limit_conn) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [domain, port, password, obfs, package_name, expired_at, limit_conn]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM users');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { is_active, expired_at } = req.body;
  try {
    const { rows } = await pool.query('UPDATE users SET is_active=$1, expired_at=$2 WHERE id=$3 RETURNING *', [is_active, expired_at, id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM users WHERE id=$1', [id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/stats/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM connections WHERE user_id=$1', [id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 3100;
app.listen(port, () => console.log(`Backend running on ${port}`));

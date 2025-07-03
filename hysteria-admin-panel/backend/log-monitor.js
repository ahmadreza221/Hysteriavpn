const fs = require('fs');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const logFile = '/var/log/hysteria.log';

fs.watchFile(logFile, async () => {
  const data = fs.readFileSync(logFile, 'utf8');
  const lines = data.trim().split('\n');
  const last = lines[lines.length - 1];
  const match = last.match(/client (\d+) connected from ([^ ]+)/);
  if (match) {
    const userId = parseInt(match[1]);
    const ip = match[2];
    await pool.query('INSERT INTO connections(user_id, ip_address, connected_at) VALUES($1,$2,NOW())', [userId, ip]);
  }
});

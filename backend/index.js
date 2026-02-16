require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { run, get, all } = require('./db');
const initDb = require('./models/init-db');

const app = express();
const corsOptions = process.env.FRONTEND_ORIGIN ? { origin: process.env.FRONTEND_ORIGIN } : undefined;
app.use(cors(corsOptions));
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

initDb().catch(err => console.error('DB init error', err));

// auth
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  if (typeof password !== 'string' || password.length < 6) return res.status(400).json({ error: 'password must be at least 6 characters' });
  const hashed = await bcrypt.hash(password, 10);
  try {
    const r = await run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name || '', email, hashed]);
    const user = await get('SELECT id, name, email, created_at FROM users WHERE id = ?', [r.id]);
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user, token });
  } catch (err) {
    if (err && err.message && err.message.includes('UNIQUE')) return res.status(400).json({ error: 'email already exists' });
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await get('SELECT * FROM users WHERE email = ?', [email]);
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ user: { id: user.id, name: user.name, email: user.email }, token });
});

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });
  const token = auth.split(' ')[1];
  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.userId = data.id;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// events: list, detail, create (admin-like), register, cancel
app.get('/api/events', async (req, res) => {
  let { q, category, location, date, page = 1, limit = 10 } = req.query;
  page = parseInt(page) || 1;
  limit = Math.min(100, Math.max(1, parseInt(limit) || 10));
  const offset = (page - 1) * limit;

  let where = [];
  const params = [];
  if (q) { where.push('(name LIKE ? OR description LIKE ?)'); params.push(`%${q}%`, `%${q}%`); }
  if (category) { where.push('category = ?'); params.push(category); }
  if (location) { where.push('location = ?'); params.push(location); }
  if (date) { where.push("date(datetime) = date(?)"); params.push(date); }

  const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : '';
  const totalRow = await get(`SELECT COUNT(*) as total FROM events ${whereSql}`, params);
  const total = totalRow ? totalRow.total : 0;
  const rows = await all(`SELECT * FROM events ${whereSql} ORDER BY datetime LIMIT ? OFFSET ?`, [...params, limit, offset]);
  res.json({ events: rows, page, limit, total });
});

app.get('/api/events/:id', async (req, res) => {
  const ev = await get('SELECT * FROM events WHERE id = ?', [req.params.id]);
  if (!ev) return res.status(404).json({ error: 'Not found' });
  // count registrations
  const regCount = await get('SELECT COUNT(*) as c FROM registrations WHERE event_id = ?', [ev.id]);
  ev.registered = regCount ? regCount.c : 0;
  res.json(ev);
});

app.post('/api/events', authMiddleware, async (req, res) => {
  // create event (any authenticated user can create for now)
  const { name, organizer, location, datetime, description, capacity, category } = req.body;
  if (!name || !datetime) return res.status(400).json({ error: 'name and datetime are required' });
  const cap = parseInt(capacity) || 0;
  try {
    const r = await run(
      'INSERT INTO events (name, organizer, location, datetime, description, capacity, category) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, organizer || '', location || '', datetime, description || '', cap, category || '']
    );
    const ev = await get('SELECT * FROM events WHERE id = ?', [r.id]);
    res.json(ev);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.post('/api/events/:id/register', authMiddleware, async (req, res) => {
  const eventId = req.params.id;
  const userId = req.userId;
  const ev = await get('SELECT * FROM events WHERE id = ?', [eventId]);
  if (!ev) return res.status(404).json({ error: 'Event not found' });
  const regCount = await get('SELECT COUNT(*) as c FROM registrations WHERE event_id = ?', [eventId]);
  const registered = regCount ? regCount.c : 0;
  if (ev.capacity && registered >= ev.capacity) return res.status(400).json({ error: 'Event is full' });
  try {
    const r = await run('INSERT INTO registrations (user_id, event_id) VALUES (?, ?)', [userId, eventId]);
    res.json({ success: true, registrationId: r.id, registered: registered + 1 });
  } catch (err) {
    if (err && err.message && err.message.includes('UNIQUE')) return res.status(400).json({ error: 'Already registered' });
    res.status(400).json({ error: 'Registration error' });
  }
});

app.delete('/api/events/:id/register', authMiddleware, async (req, res) => {
  const eventId = req.params.id;
  const userId = req.userId;
  await run('DELETE FROM registrations WHERE user_id = ? AND event_id = ?', [userId, eventId]);
  res.json({ success: true });
});

app.get('/api/me/registrations', authMiddleware, async (req, res) => {
  const rows = await all(
    `SELECT e.* , r.registered_at FROM events e JOIN registrations r ON e.id = r.event_id WHERE r.user_id = ? ORDER BY e.datetime DESC`,
    [req.userId]
  );
  res.json({ registrations: rows });
});

app.get('/api/me', authMiddleware, async (req, res) => {
  const user = await get('SELECT id, name, email, created_at FROM users WHERE id = ?', [req.userId]);
  res.json({ user });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log('Backend running on', PORT));

const bcrypt = require('bcryptjs');
const { run, get, all } = require('./db');
const initDb = require('./models/init-db');

async function seed() {
  await initDb();
  // create demo user
  const email = 'demo@bellcorp.test';
  const existing = await get('SELECT * FROM users WHERE email = ?', [email]);
  if (!existing) {
    const hashed = await bcrypt.hash('password123', 10);
    await run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', ['Demo User', email, hashed]);
    console.log('Created demo user:', email);
  }

  // sample events
  const sample = [
    ['React Conf', 'React Org', 'San Francisco', '2026-06-10 09:00:00', 'A conference about React.', 200, 'conference'],
    ['Node Summit', 'Node Org', 'New York', '2026-05-05 10:00:00', 'Node.js best practices.', 150, 'conference'],
    ['Music Fest', 'Music Ltd', 'Austin', '2026-07-20 18:00:00', 'Three days of music.', 5000, 'music']
  ];

  for (const s of sample) {
    const existingEvent = await get('SELECT * FROM events WHERE name = ? AND datetime = ?', [s[0], s[3]]);
    if (!existingEvent) {
      await run('INSERT INTO events (name, organizer, location, datetime, description, capacity, category) VALUES (?, ?, ?, ?, ?, ?, ?)', s);
      console.log('Inserted event', s[0]);
    }
  }
  console.log('Seeding complete');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });

const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(session({
  secret: 'blackrose-secret',
  resave: false,
  saveUninitialized: true,
}));

// 🥷 Syndicate Members (Updated: One Dashboard for All)
const users = {
  Don:       { alias: 'Don',       passcode: 'powerlegacy',   role: 'Don' },
  LaFiera:   { alias: 'LaFiera',   passcode: 'crownrose',     role: 'Donna (First Lady)' },
  Massimo:   { alias: 'Massimo',   passcode: 'rosequeen',     role: 'Consigliere' },
  Vesper:    { alias: 'Vesper',    passcode: 'venomblade',    role: 'Underboss' },
  Ghostwire: { alias: 'Ghostwire', passcode: 'rosesfall2025', role: 'Tech Officer' },
  Reaper:    { alias: 'Reaper',    passcode: 'blackveil',     role: 'Special Ops' },
  Kunoichi:  { alias: 'Kunoichi',  passcode: 'shadowslip',    role: 'Infiltration' },
  Spectra:   { alias: 'Spectra',   passcode: 'opticnet',      role: 'Surveillance' },
  Rocco:     { alias: 'Rocco',     passcode: 'ironfist',      role: 'Enforcer' }
};


// 📥 Login Page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/login.html'));
});

// 🔐 Login Handler
app.post('/login', (req, res) => {
  const { alias, passcode } = req.body;
  console.log('🛂 Login Attempt:');
  console.log('Alias:', alias);
  console.log('Passcode:', passcode);

  const user = users[alias];
  console.log('Matched User:', user);

  if (user && user.passcode === passcode) {
    console.log(`✅ Login success for ${alias}`);
    req.session.user = user;
    res.redirect('/dashboard');
  } else {
    console.log(`❌ Login failed for ${alias}`);
    res.send('❌ Access Denied. Wrong alias or passcode.');
  }
});

// 🖥️ Unified Dashboard Route
app.get('/dashboard', (req, res) => {
  if (req.session.user) {
    res.sendFile(path.join(__dirname, 'public/dashboard.html'));
  } else {
    res.redirect('/');
  }
});

// ⚙️ Session Info (for displaying alias/role in dashboard)
app.get('/session-info', (req, res) => {
  if (req.session.user) {
    res.json({ alias: req.session.user.alias, role: req.session.user.role });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// 🚪 Logout Route
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

// 🔥 Server Start

const http = require('http').createServer(app);
const io = require('socket.io')(http);

io.on('connection', (socket) => {
  console.log('💬 A user connected');

  socket.on('chat message', (data) => {
    io.emit('chat message', data); // Broadcast to all users
  });

  socket.on('disconnect', () => {
    console.log('🚪 A user disconnected');
  });
});

http.listen(PORT, () => {
  console.log(`🌹 Black Rose Syndicate live at http://localhost:${PORT}`);
});

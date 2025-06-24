const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
const io = new Server(server);

// Middleware - note: session before static
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: 'blackrose-secret',
  resave: false,
  saveUninitialized: true,
}));

app.use(express.static('public'));

// Syndicate Members (Uppercase aliases)
const users = {
  DON:       { alias: 'DON',       passcode: 'powerlegacy',   role: 'Don' },
  LAFIERA:   { alias: 'LAFIERA',   passcode: 'crownrose',    role: 'Donna (First Lady)' },
  MASSIMO:   { alias: 'MASSIMO',   passcode: 'rosequeen',    role: 'Consigliere' },
  VESPER:    { alias: 'VESPER',    passcode: 'venomblade',   role: 'Underboss' },
  GHOSTWIRE: { alias: 'GHOSTWIRE', passcode: 'rosesfall2025',role: 'Tech Officer' },
  REAPER:    { alias: 'REAPER',    passcode: 'blackveil',    role: 'Special Ops' },
  KUNOICHI:  { alias: 'KUNOICHI',  passcode: 'shadowslip',   role: 'Infiltration' },
  SPECTRA:   { alias: 'SPECTRA',   passcode: 'opticnet',     role: 'Surveillance' },
  ROCCO:     { alias: 'ROCCO',     passcode: 'ironfist',     role: 'Enforcer' }
};

// Login Page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/login.html'));
});

// Login Handler
app.post('/login', (req, res) => {
  const rawAlias = req.body.alias;
  const passcodeInput = req.body.passcode;
  const aliasInput = rawAlias.toUpperCase();
  const user = users[aliasInput];

  console.log("🔍 Login attempt:", {
    rawAlias,
    normalizedAlias: aliasInput,
    passcodeInput,
    userFound: !!user,
    correctPasscode: user?.passcode === passcodeInput
  });

  if (user && user.passcode === passcodeInput) {
    req.session.user = user;
    res.redirect('/dashboard');
  } else {
    res.send('❌ Access Denied. Wrong alias or passcode.');
  }
});

// Dashboard Route
app.get('/dashboard', (req, res) => {
  if (req.session.user) {
    res.sendFile(path.join(__dirname, 'public/dashboard.html'));
  } else {
    res.redirect('/');
  }
});

// Session Info for alias/role display
app.get('/session-info', (req, res) => {
  if (req.session.user) {
    res.json({ alias: req.session.user.alias, role: req.session.user.role });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// Logout Route
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

// Socket.io for chat
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('chat message', (data) => {
    console.log('Chat message:', data);
    io.emit('chat message', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🌹 Black Rose Syndicate running at http://localhost:${PORT}`);
});

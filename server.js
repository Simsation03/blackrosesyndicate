const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Log every request - method, URL, headers, and body
app.use(express.json()); // just in case JSON ever comes in
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`\n=== Incoming Request ===`);
  console.log(`${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

app.use(session({
  secret: 'blackrose-secret',
  resave: false,
  saveUninitialized: true,
}));

app.use(express.static('public'));

// Syndicate Members with uppercase aliases
const users = {
  DON:       { alias: 'DON',       passcode: 'powerlegacy',    role: 'Don' },
  LAFIERA:   { alias: 'LAFIERA',   passcode: 'crownrose',     role: 'Donna (First Lady)' },
  MASSIMO:   { alias: 'MASSIMO',   passcode: 'rosequeen',     role: 'Consigliere' },
  VESPER:    { alias: 'VESPER',    passcode: 'venomblade',    role: 'Underboss' },
  GHOSTWIRE: { alias: 'GHOSTWIRE', passcode: 'rosesfall2025', role: 'Tech Officer' },
  REAPER:    { alias: 'REAPER',    passcode: 'blackveil',     role: 'Special Ops' },
  KUNOICHI:  { alias: 'KUNOICHI',  passcode: 'shadowslip',    role: 'Infiltration' },
  SPECTRA:   { alias: 'SPECTRA',   passcode: 'opticnet',      role: 'Surveillance' },
  ROCCO:     { alias: 'ROCCO',     passcode: 'ironfist',      role: 'Enforcer' }
};

// Serve login page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/login.html'));
});

// Login handler
app.post('/login', (req, res) => {
  const rawAlias = req.body.alias;
  const rawPasscode = req.body.passcode;

  // Defensive trimming & uppercase normalization
  const aliasInput = rawAlias ? rawAlias.trim().toUpperCase() : '';
  const passcodeInput = rawPasscode ? rawPasscode.trim() : '';

  const user = users[aliasInput];

  console.log('🔍 Login attempt:', {
    rawAlias,
    aliasInput,
    rawPasscode,
    passcodeInput,
    userFound: !!user,
    correctPasscode: user ? (user.passcode === passcodeInput) : false
  });

  if (user && user.passcode === passcodeInput) {
    req.session.user = user;
    return res.redirect('/dashboard');
  } else {
    return res.status(401).send('❌ Access Denied. Wrong alias or passcode.');
  }
});

// Dashboard route
app.get('/dashboard', (req, res) => {
  if (req.session.user) {
    res.sendFile(path.join(__dirname, 'public/dashboard.html'));
  } else {
    res.redirect('/');
  }
});

// Session info API
app.get('/session-info', (req, res) => {
  if (req.session.user) {
    res.json({ alias: req.session.user.alias, role: req.session.user.role });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🌹 Black Rose Syndicate running at http://localhost:${PORT}`);
});

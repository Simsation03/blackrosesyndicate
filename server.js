const express = require('express');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.post('/login', async (req, res) => {
  const { alias, password } = req.body;
  const users = JSON.parse(fs.readFileSync('users.json'));
  const user = users.find(u => u.alias === alias);
  if (!user) return res.send("Access Denied");

  const valid = await bcrypt.compare(password, user.hash);
  if (!valid) return res.send("Invalid Credentials");

  res.redirect('/dashboard.html');
});

app.listen(3000, () => {
  console.log("Live on http://localhost:3000");
});
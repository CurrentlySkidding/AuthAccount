const express = require("express");
const fs = require("fs");
const app = express();
app.use(express.json());

const API_KEY = "1234";

app.post("/auth", (req, res) => {
  const { username, password, hwid, apiKey } = req.body;

  // Block requests without the API key
  if (apiKey !== API_KEY) {
    return res.status(401).json({ success: false, message: "Unauthorized." });
  }

  // Load accounts fresh every request
  let data;
  try {
    data = JSON.parse(fs.readFileSync("accounts.json", "utf8"));
  } catch {
    return res.status(500).json({ success: false, message: "Server error." });
  }

  // Find account
  const account = data.accounts.find(
    (a) => a.username.toLowerCase() === username.toLowerCase()
  );

  if (!account) {
    return res.status(401).json({ success: false, message: "Username not found." });
  }

  // Check password
  if (account.password !== password) {
    return res.status(401).json({ success: false, message: "Wrong password." });
  }

  // Check HWID
  if (account.hwid.toLowerCase() !== hwid.toLowerCase()) {
    return res.status(401).json({ success: false, message: "HWID mismatch." });
  }

  // Check expiry
  const expiry = new Date(account.expires);
  const now = new Date();
  if (now > expiry) {
    return res.status(401).json({ success: false, message: "Account expired." });
  }

  const remaining = expiry - now;
  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));

  return res.status(200).json({
    success: true,
    message: "Access granted.",
    username: account.username,
    daysLeft: days
  });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Auth server running.");
});

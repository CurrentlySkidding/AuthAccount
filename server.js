const express = require("express");
const fs = require("fs");
const app = express();
app.use(express.json());

const API_KEY = "sk_9c1e3b7f8f6d4a2c1a0e5d7c9b8a6f4d3e2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3a6f9c2d1e8b7f4a5c3d6e9b2f1a0c7d8e5f6a3b4c1d2e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0";

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

const express = require("express");
const fs = require("fs");
const app = express();
app.use(express.json());

const API_KEY = "z83b265un2v28dawf7751c7oo8213xlwr9ntwloucdpq8ay3e4sx7fbq8du4u8m388i3q92apkilhcoyncl7itlbkcsy7cjbnqn5yjf676qovlzxig3ezs63kkiwffbj784f35f9xjx5n0ieyh5szxfbf615o1ziwxfs5q05vum1unq0qyff701ozfjpiddlrqp9mgq1k282uu7ww6x3zdmt7nqlleqy1gco6wj33uwkwje07cz1eg0cbw";

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

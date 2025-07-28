const express = require("express");
const router = express.Router();
const { sendVerificationEmail } = require("../utils/email");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");

// File to store tokens
const tokensFile = path.join(__dirname, "../../data/tokens.json");

// Helper to read tokens file
function readTokens() {
  if (!fs.existsSync(tokensFile)) return {};
  return JSON.parse(fs.readFileSync(tokensFile));
}

// Helper to write tokens file
function writeTokens(tokens) {
  fs.writeFileSync(tokensFile, JSON.stringify(tokens, null, 2));
}

// POST /verify - receives form data and sends verification email
router.post("/", async (req, res) => {
  const { firstName, lastName, email } = req.body;

  // Basic validation
  if (
    !firstName ||
    !lastName ||
    !email ||
    !email.endsWith("@city.ac.uk")
  ) {
    return res.status(400).json({ error: "Invalid input or email domain" });
  }

  // Generate unique token
  const token = uuidv4();

  // Read existing tokens
  const tokens = readTokens();

  // Save token with user info and timestamp
  tokens[token] = {
    firstName,
    lastName,
    email,
    verified: false,
    createdAt: Date.now(),
  };

  writeTokens(tokens);

  try {
    // Send verification email
    await sendVerificationEmail(email, token, firstName);

    return res.json({ message: "Verification email sent." });
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({ error: "Failed to send email" });
  }
});

// GET /verify/:token - called when user clicks verification link
router.get("/:token", (req, res) => {
  const token = req.params.token;

  const tokens = readTokens();

  if (!tokens[token]) {
    return res.status(404).send("Invalid or expired token.");
  }

  tokens[token].verified = true;

  writeTokens(tokens);

  // Show a simple HTML page with WhatsApp invite
  return res.send(`
    <h1>Email Verified ✅</h1>
    <p>Welcome, ${tokens[token].firstName}! You can now join the WhatsApp group:</p>
    <a href="${process.env.GROUP_LINK}" target="_blank">Join WhatsApp Group</a>
  `);
});

module.exports = router;

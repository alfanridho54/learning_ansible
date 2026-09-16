// Encrypt DATABASE_URL (and related secrets) into config.enc — AES-256-CBC.
// Usage:
//   node encrypt-config.js "postgresql://user:pass@host:5432/db" "32-character-secret-key-here!!" [outPath]
//
// Never commit plaintext .env. Keep config.enc outside the Nginx web root.

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

const encryptConfig = (databaseUrl, secretKey, outPath) => {
  if (!secretKey || secretKey.length !== 32) {
    console.error("ERROR: Secret key MUST be exactly 32 characters.");
    process.exit(1);
  }

  const config = { DATABASE_URL: databaseUrl };
  const configString = JSON.stringify(config);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(secretKey),
    iv
  );

  let encrypted = cipher.update(configString);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  const encryptedData = iv.toString("hex") + ":" + encrypted.toString("hex");
  const dest = outPath || path.join(process.cwd(), "config.enc");
  fs.writeFileSync(dest, encryptedData, { mode: 0o600 });
  console.log(`File "${dest}" created successfully.`);
};

const args = process.argv.slice(2);

if (args.length >= 2) {
  encryptConfig(args[0], args[1], args[2]);
} else {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question("DATABASE_URL: ", (databaseUrl) => {
    rl.question("SECRET_KEY (32 chars): ", (secretKey) => {
      encryptConfig(databaseUrl, secretKey);
      rl.close();
    });
  });
}

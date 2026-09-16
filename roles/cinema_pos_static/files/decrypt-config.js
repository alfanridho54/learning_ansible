// Decrypt config.enc (AES-256-CBC). For ops / app runtime — not served by Nginx.
// Usage:
//   node decrypt-config.js /opt/cinema-pos/config.enc "32-character-secret-key-here!!"
// Or set CONFIG_DECRYPTION_KEY env var.

const fs = require("fs");
const crypto = require("crypto");
const readline = require("readline");

const decryptConfig = (configPath, decryptionKey) => {
  const key = decryptionKey || process.env.CONFIG_DECRYPTION_KEY;
  if (!key || key.length !== 32) {
    throw new Error(
      "CONFIG_DECRYPTION_KEY missing or invalid (must be 32 characters)."
    );
  }

  const encryptedData = fs.readFileSync(configPath, "utf8").trim();
  const [ivHex, encryptedHex] = encryptedData.split(":");
  if (!ivHex || !encryptedHex) {
    throw new Error('Invalid format. Expected "iv:data".');
  }

  const iv = Buffer.from(ivHex, "hex");
  const encryptedText = Buffer.from(encryptedHex, "hex");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(key),
    iv
  );
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return JSON.parse(decrypted.toString());
};

const args = process.argv.slice(2);
if (args.length >= 2) {
  console.log(JSON.stringify(decryptConfig(args[0], args[1]), null, 2));
} else {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question("Path to config.enc: ", (filePath) => {
    rl.question("SECRET_KEY (32 chars): ", (secretKey) => {
      try {
        console.log(JSON.stringify(decryptConfig(filePath, secretKey), null, 2));
      } catch (e) {
        console.error(e.message);
        process.exitCode = 1;
      }
      rl.close();
    });
  });
}

module.exports = { decryptConfig };

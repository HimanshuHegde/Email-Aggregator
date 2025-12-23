import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();
const algorithm = "aes-256-ctr";
const secretKey = process.env.ENCRYPTION_KEY!; 
const iv = crypto.randomBytes(16);

export function decrypt(hash: { iv: string; content: string }) {
    console.log(secretKey);
  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(secretKey),
    Buffer.from(hash.iv, "hex")
  );
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(hash.content, "hex")),
    decipher.final(),
  ]);
  return decrypted.toString();
}

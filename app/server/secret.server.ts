import crypto from "node:crypto";
import { createId } from "@paralleldrive/cuid2";
import { prisma } from "./db.server";

const DEFAULT_EXPIRY = 1000 * 60 * 60 * 24 * 7;

export async function encrypt(text: string) {
  const key = crypto.randomBytes(32);
  const iv = crypto.randomBytes(16);
  const cuid = createId();

  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const id = createId();
  await prisma.secret.create({
    data: {
      id,
      cuid,
      encrytedSecret: encrypted,
      iv: iv.toString("hex"),
      expiresAt: new Date(Date.now() + DEFAULT_EXPIRY),
    },
  });

  return {
    key: `${cuid}/${key.toString("hex")}`,
    id,
  };
}

// encrypt("sarvani sanaboyina");

export async function decrypt(key: string) {
  const [cuid, cipherKey] = key.split("/");

  const start = Date.now();
  const message = await prisma.secret.findFirst({ where: { cuid } });

  if (message == null) {
    throw new Error("No message found");
  }

  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(cipherKey, "hex"),
    Buffer.from(message.iv, "hex")
  );
  let decrypted = decipher.update(message.encrytedSecret, "hex", "utf8");
  decrypted += decipher.final("utf8");

  console.log({ decrypted, duration: Date.now() - start });

  return decrypted;
}

// async function run() {
// 	await decrypt(
// 		"hlzkfcdxdb2oythn4xthouil/3fe1bb8ad4cb3fabfc152f76c931ede55de348ec71d659a07635de69ab27fb9e",
// 	);

// 	await decrypt(
// 		"hlzkfcdxdb2oythn4xthouil/3fe1bb8ad4cb3fabfc152f76c931ede55de348ec71d659a07635de69ab27fb9e",
// 	);
// 	await decrypt(
// 		"hlzkfcdxdb2oythn4xthouil/3fe1bb8ad4cb3fabfc152f76c931ede55de348ec71d659a07635de69ab27fb9e",
// 	);
// 	await decrypt(
// 		"hlzkfcdxdb2oythn4xthouil/3fe1bb8ad4cb3fabfc152f76c931ede55de348ec71d659a07635de69ab27fb9e",
// 	);
// }

// run();

import crypto from "node:crypto";
import { createId } from "@paralleldrive/cuid2";
import { prisma } from "./db.server";

const DEFAULT_EXPIRY = 1000 * 60 * 60 * 24 * 7;

export async function encrypt({ text }: { text: string }) {
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
    secretUrl: `${cuid}/${key.toString("hex")}`,
    id,
  };
}

export async function decrypt({ cuid, key }: { cuid: string; key: string }) {
  // TODO: Use a transaction to update the secret and return the decrypted value
  // Otherwise, there can be a race condition where the secret is decrypted multiple times
  const message = await prisma.secret.findFirst({ where: { cuid } });
  if (message == null) {
    return {
      success: false,
      message: "Secret not found",
    };
  }

  if (message.expiresAt < new Date() && !message.burnedAt) {
    return {
      success: false,
      message: "Secret is not available anymore",
    } as const;
  }

  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(key, "hex"),
    Buffer.from(message.iv, "hex")
  );
  let decrypted = decipher.update(message.encrytedSecret, "hex", "utf8");
  decrypted += decipher.final("utf8");

  await expireSecret(message.id);

  return { success: true, secretValue: decrypted } as const;
}

export async function expireSecret(id: string) {
  await prisma.secret.update({
    where: { id },
    data: {
      encrytedSecret: "",
      expiresAt: new Date(),
    },
  });
}

export async function burnSecret(id: string) {
  await prisma.secret.update({
    where: { id },
    data: {
      encrytedSecret: "",
      burnedAt: new Date(),
    },
  });
}

export async function getSecretPublicData(
  data: { cuid: string } | { id: string }
) {
  const secret = await prisma.secret.findFirst({
    where: data,
    select: { expiresAt: true, burnedAt: true },
  });

  if (secret == null) {
    return {
      success: false,
      message: "Secret not found",
    } as const;
  }

  return {
    success: true,
    data: secret,
  } as const;
}

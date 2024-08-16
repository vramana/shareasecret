import crypto from "crypto";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const GLOBAL_SALT = process.env["GLOBAL_SALT"] || "changeme";

export async function encrypt(text: string) {
	const key = crypto.randomBytes(32);
	const iv = crypto.randomBytes(16);
	const hashedKey = await bcrypt.hash(key.toString("hex"), GLOBAL_SALT);
	const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
	let encrypted = cipher.update(text, "utf8", "hex");
	encrypted += cipher.final("hex");

	await prisma.message.create({
		data: {
			text: encrypted,
			hashedKey,
			iv: iv.toString("hex"),
		},
	});
	return key.toString("hex");
}

// encrypt("sarvani sanaboyina");

export async function decrypt(key: string) {
	const hashedKey = await bcrypt.hash(key, GLOBAL_SALT);
	let message = await prisma.message.findUnique({
		where: {
			hashedKey: hashedKey,
		},
	});

	if (message == null) {
		throw new Error("No message found");
	}

	const decipher = crypto.createDecipheriv(
		"aes-256-cbc",
		Buffer.from(key, "hex"),
		Buffer.from(message.iv, "hex"),
	);
	let decrypted = decipher.update(message.text, "hex", "utf8");
	decrypted += decipher.final("utf8");
	return decrypted;
}
// decrypt("1ebdb0030ffa3a73e7dc65a9f10bc4908a5135efd2275cd549d9a3ce9b76511e");

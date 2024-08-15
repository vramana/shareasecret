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
	console.log({
		text: encrypted,
		hashedKey,
		iv: iv.toString("hex"),
	});
	await prisma.message.create({
		data: {
			text: encrypted,
			hashedKey,
			iv: iv.toString("hex"),
		},
	});
	console.log("created", key.toString("hex"));
	return key.toString("hex");
}

// encrypt("I Love U")

export async function decrypt(key: string) {
	let message = await prisma.message.findUnique({
		where: {
			hashedKey: key,
		},
	});

	if (message == null) {
		throw new Error("");
	}

	const result = await bcrypt.compare(key, message.hashedKey);
	const decipher = crypto.createDecipheriv(
		"aes-256-cbc",
		Buffer.from(key, "hex"),
		Buffer.from(message.iv, "hex"),
	);
	let decrypted = decipher.update(message.text, "hex", "utf8");
	decrypted += decipher.final("utf8");
	return decrypted;
}
// decrypt("c965abe35ab38baaedbc79f0415a69dd0d15b37ba8915de65620ca97f260ebcb")

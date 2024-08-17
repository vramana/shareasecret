import crypto from "node:crypto";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { createId } from "@paralleldrive/cuid2";

const prisma = new PrismaClient();

export async function encrypt(text: string) {
	const key = crypto.randomBytes(32);
	const iv = crypto.randomBytes(16);
	const cuid = createId();

	const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
	let encrypted = cipher.update(text, "utf8", "hex");
	encrypted += cipher.final("hex");

	const hashedKey = await bcrypt.hash(key.toString("hex"), 12);
	await prisma.message.create({
		data: {
			cuid,
			text: encrypted,
			hashedKey,
			iv: iv.toString("hex"),
		},
	});

	console.log({ cuid, hashedKey });
	console.log(`${cuid}/${key.toString("hex")}`);
	return `${cuid}/${key.toString("hex")}`;
}

// encrypt("sarvani sanaboyina");

export async function decrypt(key: string) {
	const [cuid, cipherKey] = key.split("/");

	const start = Date.now();
	const message = await prisma.message.findFirst({ where: { cuid } });

	if (message == null) {
		throw new Error("No message found");
	}

	const result = await bcrypt.compare(cipherKey, message.hashedKey);

	console.log({ cipherKey, hashedKey: message.hashedKey });

	if (!result) {
		throw new Error("No secret found");
	}

	const decipher = crypto.createDecipheriv(
		"aes-256-cbc",
		Buffer.from(cipherKey, "hex"),
		Buffer.from(message.iv, "hex"),
	);
	let decrypted = decipher.update(message.text, "hex", "utf8");
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

import crypto from "crypto"
import bcrypt from "bcrypt"
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function encrypt(text) {
    try {
    const key = crypto.randomBytes(32); 
    const iv = crypto.randomBytes(16);
    const salt = await bcrypt.genSalt(10);
    const hashedKey = await bcrypt.hash(key.toString("hex"), salt);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    console.log( {
        text: encrypted,
        hashedKey,
       iv: iv.toString("hex")
      })
    await prisma.message.create({
        data: {
          text: encrypted,
          hashedKey,
         iv: iv.toString("hex")
        },
      })
      console.log("created", key.toString('hex'))
      return {key: key.toString('hex')}
 } catch(err) {
    console.log({err})
    return {err}
 }

}

 
encrypt("I Love U")





export async function decrypt(key) {
  try {
    let allMessages = await prisma.message.findMany();
    allMessages.forEach(async(r) => {
    await bcrypt.compare(key, r.hashedKey,  function(err, result) {
      if (result) {
            const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), Buffer.from(r.iv, 'hex'));
            let decrypted = decipher.update(r.text, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            console.log({decrypted})
            return decrypted;
      }
    }) 
           
    });
 
  }  catch(err) {
    console.log({err})
    return {err}
  }
  
}
decrypt("c965abe35ab38baaedbc79f0415a69dd0d15b37ba8915de65620ca97f260ebcb")
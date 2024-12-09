import * as crypto from "crypto";
const salt = crypto.randomBytes(6).toString('base64');
 const encryption = (value: string, salt: string) =>
    crypto.pbkdf2Sync(value, salt, 1000, 18, "sha256").toString("hex");
 export default encryption;
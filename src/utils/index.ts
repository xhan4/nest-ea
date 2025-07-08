import * as crypto from "crypto";
const creatSalt =()=> crypto.randomBytes(6).toString('base64');
const encryption = (value: string, salt: string) => crypto.pbkdf2Sync(value, salt, 1000, 18, "sha256").toString("hex");
const randomNickName=(length: number): string =>{
  return "用户"+ crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
}
 export {
   creatSalt,
   encryption,
   randomNickName
};
import { GenderEnum } from "src/core/enums/gender.enum";

export class CreateCharacterDto {
  name: string;
  userId: number; // 用户ID
  balance: number;
  // 基础属性
  strength?: number;
  agility?: number;
  intelligence?: number;
  vitality?: number;
  
  // 新增字段
  gender: GenderEnum;
  comprehension: number;
  spiritRoots: string[];
}
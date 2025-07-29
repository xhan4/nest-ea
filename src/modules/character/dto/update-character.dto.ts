import { GenderEnum } from "src/core/enums/gender.enum";

export class UpdateCharacterDto {
  name?: string;
  level?: number;
  experience?: number;
  balance?: number;
  // 基础属性
  strength?: number;
  agility?: number;
  intelligence?: number;
  vitality?: number;
  
  // 寿命相关
  maxLifespan?: number;
  age?: number;
  
  // 新增字段
  gender?: GenderEnum;
  comprehension?: number;
  spiritRoots?: string[];
  userId?: number;
}
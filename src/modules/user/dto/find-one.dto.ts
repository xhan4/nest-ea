import { RoleEnum } from "src/core/enums/roles.enum";

export class FindOneDto {
  userId: number;
  username: string;
  avatar: string;
  roles: RoleEnum[];
  nickname: string;
  active: number;
  create_time: Date;
  update_time: Date;
  characterId: number;
}

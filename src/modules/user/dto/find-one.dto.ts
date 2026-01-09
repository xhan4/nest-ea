import { RoleEnum } from "src/core/enums/roles.enum";
import { MembershipEnum } from "src/core/enums/membership.enum";

export class FindOneDto {
  userId: number;
  username: string;
  avatar: string;
  roles: RoleEnum[];
  nickname: string;
  active: number;
  points: number;
  membership: MembershipEnum;
  create_time: Date;
  update_time: Date;
}
import { MembershipEnum } from "src/core/enums/membership.enum";
import { RoleEnum } from "src/core/enums/roles.enum";
import { UserStatusEnum } from "src/core/enums/user-status.enum";

export class FindOneDto {
  userId: number;
  username: string;
  avatar: string;
  roles: RoleEnum[];
  nickname: string;
  active: UserStatusEnum;
  points: number;
  membership: MembershipEnum;
  create_time: Date;
  update_time: Date;
}
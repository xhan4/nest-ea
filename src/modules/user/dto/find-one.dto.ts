import { UserRole } from "src/entities/user.entity";


export class FindOneDto {
  userId: number;
  username: string;
  avatar: string;
  roles: UserRole[];
  nickname: string;
  active: number;
  create_time: Date;
  update_time: Date;
  balance: number;
}

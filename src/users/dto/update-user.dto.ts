import { Role } from '../../common/enums/role.enum';

export class UpdateUserDto {
  email?: string;
  password?: string;
  fullName?: string;
  role?: Role;
}

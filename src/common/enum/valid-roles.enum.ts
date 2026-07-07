import { registerEnumType } from '@nestjs/graphql';

export enum ValidRoles {
  ROOT = 'root',
  ADMIN = 'admin',
  USER = 'user',
}

registerEnumType(ValidRoles, { name: 'ValidRoles' });

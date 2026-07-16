import { registerEnumType } from '@nestjs/graphql';

export enum ValidRoles {
  ROOT = 'root',
  ADMIN = 'admin',
  DOCTOR = 'doctor',
  RECEPTIONIST = 'receptionist',
}

registerEnumType(ValidRoles, { name: 'ValidRoles' });

import { Request } from 'express';
import { hr_users_role } from '@prisma/client';

export interface RequestWithUser extends Request {
  user: {
    userId: number;
    email: string;
    role: hr_users_role;
    companyId: number;
    employeeId?: number;
  };
}

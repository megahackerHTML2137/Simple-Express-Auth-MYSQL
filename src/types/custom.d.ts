import { RowDataPacket } from 'mysql2';

interface UserRow extends RowDataPacket {
  name: string;  
  hashedPassword: string;
}

declare module "express-session" {
    interface SessionData {
      user: UserRow[] | null;
    }
}
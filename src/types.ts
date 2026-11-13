import type { Folder } from "./generated/prisma/client.ts";

declare global {
  namespace Express {
    interface User {
      id: number;
      name: string;
      surname: string;
      email: string;
    }
    interface Request {
      folder?: Folder;
    }
  }
}

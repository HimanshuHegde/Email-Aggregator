import { createContext } from "react"
import type { Dispatch, SetStateAction } from "react";
/* eslint-disable @typescript-eslint/no-explicit-any */

type UserContextType = {
 
  createAccounts: any[];
  setCreateAccounts: Dispatch<SetStateAction<any[]>>;
};

export const UserContext = createContext<UserContextType|null>(null);
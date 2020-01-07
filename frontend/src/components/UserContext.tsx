import React from "react";

export class UserContext {
  isLoggedIn = false;
  isStaff = false;
  memberId = '';
  userId = '';
  fullname = '';
  settings!: {
    minSignups: number;
    latestBookableDate: Date;
  };
  myDelistRequests = 0;
  unansweredDelistRequests = 0;
  notifications: { message:string, link:string}[] = [];
  tasksSummary: number[] = [];
}

export const userContext = React.createContext(new UserContext());

export const UserProvider = userContext.Provider
export const UserConsumer = userContext.Consumer

import React from "react";

export class UserContext {
  isLoggedIn = false;
  isStaff = false;
  memberId = '';
  userId = '';
  fullname = '';
  minSignups = 0;
  myDelistRequests = 0;
  unansweredDelistRequests = 0;
  notifications: { message:string, link:string}[] = [];
  completedTasks = 0;
  bookedTasks = 0;
}

export const userContext = React.createContext(new UserContext());

export const UserProvider = userContext.Provider
export const UserConsumer = userContext.Consumer

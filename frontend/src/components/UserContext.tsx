import React from "react";
import { Member } from "../Models";

export class UserContext {
  isLoggedIn = false;
  isStaff = false;

  member? : Member;

  memberId = '';
  userId = '';
  fullname = '';
  minSignups = 0;

  myDelistRequests = 0;
  unansweredDelistRequests = 0;

  notifications: { message:string, link:string}[] = [];

  completedTasks = 0;
  bookedTasks = 0;
  hasMemberCard = false;
  hasProxies = false;
}

export const userContext = React.createContext(new UserContext());

export const UserProvider = userContext.Provider
export const UserConsumer = userContext.Consumer

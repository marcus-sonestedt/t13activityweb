import React from "react";
import { Member } from "../Models";
import { Type } from "class-transformer";

export class UserContext {
  isLoggedIn = false;
  isStaff = false;

  @Type(() => Member)
  member? : Member;

  memberId = '';
  userId = '';
  fullname = '';
  minSignups = 0;

  myDelistRequests = 0;
  unansweredDelistRequests = 0;

  notifications: { message:string, link:string }[] = [];

  completedWeight = 0;
  bookedWeight = 0;

  hasMemberCard = false;
  hasProxies = false;
}

export const userContext = React.createContext(new UserContext());

export const UserProvider = userContext.Provider
export const UserConsumer = userContext.Consumer

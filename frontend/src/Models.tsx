import React from "react";

export interface IdValue
{
    id:string;
}

export class Activity implements IdValue {
    id: string = "";
    name: string = "";
    comment: string = "";
    start_time: Date = new Date();
    end_time: Date | null = null;
    weight: number = 1;
    completed: boolean = false;
    type: ActivityType | null = null;
}

export class ActivityType implements IdValue {
    id: string = "";
    name: string = "";
    description: string = "";
    image_url :string = "";
}

export class T13Event implements IdValue {
    id: string = "";
    name: string = "";
    comment: string ="";
    start_date: Date = new Date();
    end_date: Date = new Date();
    image_url: string | null = null;
}

export default { Activity, ActivityType, T13Event };
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
    image = <img/>;
}

export default Activity;
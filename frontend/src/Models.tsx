import { Type } from "class-transformer";
import "reflect-metadata"

export class PagedValues<T>
{
    count: number = 0;
    next: any = null;
    previous: any = null;
    results: T[] = [];
}

export interface IdValue {
    id: string;
}

export class Member implements IdValue {
    id: string = "";
    fullname: string = "";
    phone: string = "";
    email: string = "";
    image_url: string | null = null;

    url = () => process.env.PUBLIC_URL + "member/" + this.id;
    adminUrl = () => '/admin/app/member/' + this.id;
    static apiUrl = (id: string) => `/api/member/${id}`;
}

export class Activity implements IdValue {
    id: string = "";
    name: string = "";
    comment: string = "";
    date: Date = new Date();
    start_time: Date = new Date();
    end_time: Date | null = null;
    weight: number = 1;
    completed: boolean = false;
    @Type(() => ActivityType)
    type: ActivityType | null = null;
    @Type(() => T13Event)
    event: T13Event = new T13Event();
    @Type(() => Member)
    assigned: Member | null = null;
    assigned_at: Date | null = null;

    url = () => process.env.PUBLIC_URL + "activity/" + this.id;
    adminUrl = () => '/admin/app/activity/' + this.id;
    static apiUrl = (id: string) => `/api/activity/${id}`;
}

export class ActivityType implements IdValue {
    id: string = "";
    name: string = "";
    description: string = "";
    image: string = "";

    url = () => process.env.PUBLIC_URL + "activity_type/" + this.id;
    adminUrl = () => '/admin/app/activitytype/' + this.id;
    static apiUrl = (id: string) => `/api/activity_type/${id}`;
}

export class T13EventType implements IdValue {
    id: string = "";
    name: string = "";
    description: string = "";
    image: string = "";

    url = () => process.env.PUBLIC_URL + "event_type/" + this.id;
    adminUrl = () => '/admin/app/eventtype/' + this.id;
    static apiUrl = (id: string) => `/api/event_type/${id}`;
}

export class T13Event implements IdValue {
    id: string = "";
    name: string = "";
    description: string = "";
    comment: string = "";
    date: Date = new Date();
    image_url: string | null = null;
    @Type(() => T13EventType)
    type: T13EventType | null = null;
    @Type(() => Activity)
    activities: Activity[] = [];

    url = () => process.env.PUBLIC_URL + "event/" + this.id;
    adminUrl = () => '/admin/app/event/' + this.id;
    static apiUrl = (id: string) => `/api/event/${id}`;
}

export class PagedT13Events extends PagedValues<T13Event> {
    @Type(() => T13Event)
    results: T13Event[] = [];
}

export class PagedActivities extends PagedValues<Activity> {
    @Type(() => Activity)
    results: Activity[] = [];
}

export class PagedMembers extends PagedValues<Member> {
    @Type(() => Member)
    results: Member[] = [];
}

export class PagedActivityTypes extends PagedValues<ActivityType> {
    @Type(() => ActivityType)
    results: ActivityType[] = [];
}


export class PagedEventTypes extends PagedValues<T13EventType> {
    @Type(() => T13EventType)
    results: T13EventType[] = [];
}

export default {
    Member, Activity, ActivityType, T13Event, T13EventType,
    PagedT13Events, PagedMembers, PagedActivities, PagedEventTypes
};
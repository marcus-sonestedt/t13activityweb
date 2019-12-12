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

    url = () =>`/frontend/member/${this.id}/${this.fullname.replace(/ /g,'-').toLowerCase()}`;
    adminUrl = () => '/admin/app/member/' + this.id;
    static apiUrl = (id: string) => `/api/member/${id}`;
}

export class PagedMembers extends PagedValues<Member> {
    @Type(() => Member)
    results: Member[] = [];
}

export class Activity implements IdValue {
    id: string = "";
    name: string = "";
    comment: string = "";
    date: Date = new Date(0);
    start_time: Date = new Date(0);
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

    time = () => {
        if (this.end_time === null)
            return this.start_time

        return this.start_time + " - " + this.end_time
    }

    url = () =>`/frontend/activity/${this.id}/${this.name.replace(/ /g,'-').toLowerCase()}`;
    adminUrl = () => '/admin/app/activity/' + this.id;
    static apiUrl = (id: string) => `/api/activity/${id}`;
}


export class PagedActivities extends PagedValues<Activity> {
    @Type(() => Activity)
    results: Activity[] = [];
}

export class ActivityType implements IdValue {
    id: string = "";
    name: string = "";
    description: string = "";
    image: string = "";

    url = () =>`/frontend/activity_type/${this.id}/${this.name.replace(/ /g,'-').toLowerCase()}`;
    adminUrl = () => `/admin/app/activitytype/${this.id}`;
    static apiUrl = (id: string) => `/api/activity_type/${id}`;
    static apiUrlAll = () => `/api/activity_type`;
}


export class PagedActivityTypes extends PagedValues<ActivityType> {
    @Type(() => ActivityType)
    results: ActivityType[] = [];
}


export class T13EventType implements IdValue {
    id: string = "";
    name: string = "";
    description: string = "";
    image: string = "";

    url = () =>`/frontend/event_type/${this.id}/${this.name.replace(/ /g,'-').toLowerCase()}`;
    adminUrl = () => '/admin/app/eventtype/' + this.id;
    static apiUrl = (id: string) => `/api/event_type/${id}`;
    static apiUrlAll = () => `/api/event_type`;
}

export class PagedEventTypes extends PagedValues<T13EventType> {
    @Type(() => T13EventType)
    results: T13EventType[] = [];
}

export class T13Event implements IdValue {
    id: string = "";
    name: string = "";
    description: string = "";
    comment: string = "";
    start_date: Date = new Date(0);
    end_date: Date = new Date(0);
    image_url: string | null = null;
    @Type(() => T13EventType)
    type: T13EventType | null = null;
    @Type(() => Activity)
    activities: Activity[] = [];

    date = () => {
        if (this.start_date === this.end_date)
            return this.start_date

        return `${this.start_date} - ${this.end_date}`
    }

    url = () =>`/frontend/event/${this.id}/${this.name.replace(/ /g,'-').toLowerCase()}`;
    adminUrl = () => `admin/app/event/${this.id}`;
    static apiUrl = (id: string) => `/api/event/${id}`;
}

export class PagedT13Events extends PagedValues<T13Event> {
    @Type(() => T13Event)
    results: T13Event[] = [];
}

export class ActivityDelistRequest implements IdValue {
    constructor(member: Member, activity: Activity) {
        this.member = member;
        this.activity = activity;
    }

    id: string = '';
    member: Member;
    activity: Activity;
    reason: string = '';
    approver: Member | null = null;
    approved: boolean | null = null;

    url = () =>`/frontend/delistrequest/${this.id}`
    adminUrl = () => `/admin/app/delistrequest/${this.id}`
    apiUrl = () => ActivityDelistRequest.apiUrlForId(this.id)
    static apiUrlForId = (id: string) => `/api/delistrequest/${id}`
}

export class PagedADR extends PagedValues<ActivityDelistRequest>
{
    @Type(() => ActivityDelistRequest)
    results: ActivityDelistRequest[] = [];
}

export default {
    Member, Activity, ActivityType, T13Event, T13EventType,
    PagedT13Events, PagedMembers, PagedActivities, PagedEventTypes
};
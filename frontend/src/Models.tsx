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

    url = () => `/frontend/member/${this.id}/${this.fullname.replace(/ /g, '-').toLowerCase()}`;
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

    date = () => { return this.event.date() };

    start_time: string = '';
    end_time: string = '';

    weight: number = 1;
    completed: boolean = false;
    bookable: boolean = false;

    @Type(() => ActivityType)
    type: ActivityType | null = null;

    @Type(() => T13Event)
    event: T13Event = new T13Event();

    @Type(() => Member)
    assigned: Member | null = null;

    @Type(() => Date)
    assigned_at: Date | null = null;

    @Type(() => ActivityDelistRequest)
    delistRequest: ActivityDelistRequest | null = null;

    time = () => {
        if (this.end_time === null || this.end_time === this.start_time)
            return this.start_time

        return this.start_time + " - " + this.end_time
    }

    toString = () =>  `${this.name} - ${this.event.date()} - ${this.time()}` 

    url = () => `/frontend/activity/${this.id}/${this.name.replace(/ /g, '-').toLowerCase()}`;
    adminUrl = () => '/admin/app/activity/' + this.id;
    apiUrl = () => Activity.apiUrlFromId(this.id);
    static apiUrlFromId = (id: string) => `/api/activity/${id}`;
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

    url = () => `/frontend/activity_type/${this.id}/${this.name.replace(/ /g, '-').toLowerCase()}`;
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

    url = () => `/frontend/event_type/${this.id}/${this.name.replace(/ /g, '-').toLowerCase()}`;
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

    @Type(() => Date)
    start_date: Date = new Date(0);

    @Type(() => Date)
    end_date: Date = new Date(0);

    image_url: string | null = null;

    @Type(() => T13EventType)
    type: T13EventType | null = null;

    @Type(() => Activity)
    activities: Activity[] = [];

    activities_count? : number;
    activities_available_count? : number;

    date = () => {
        if (this.start_date.toDateString() === this.end_date.toDateString() ||this.end_date === null)
            return this.start_date.toLocaleDateString('sv-SE')

        return `${this.start_date.toLocaleDateString('sv-SE')} - ${this.end_date.toLocaleDateString('sv-SE')}`
    }

    url = () => `/frontend/event/${this.id}/${this.name.replace(/ /g, '-').toLowerCase()}`;
    adminUrl = () => `/admin/app/event/${this.id}`;
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
    
    @Type(() => Member)
    member: Member;

    @Type(() => Activity)
    activity: Activity;
    
    reason: string = '';
    
    @Type(() => Member)
    approver: Member | null = null;
    
    approved: boolean | null = null;

    url = () => `/frontend/delistrequest/${this.id}`
    adminUrl = () => `/admin/app/delistrequest/${this.id}`
    apiUrl = () => ActivityDelistRequest.apiUrlForId(this.id)
    static apiUrlForId = (id: string) => `${ActivityDelistRequest.apiUrlAll()}/${id}`
    static apiUrlAll = () => `/api/activity_delist_request`
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
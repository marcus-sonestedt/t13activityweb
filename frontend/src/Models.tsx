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

export class Activity implements IdValue {
    id: string = "";
    name: string = "";
    comment: string = "";
    start_time: Date = new Date();
    end_time: Date | null = null;
    weight: number = 1;
    completed: boolean = false;
    @Type(() => ActivityType)
    type: ActivityType | null = null;
    @Type(() => T13Event)
    event: T13Event | null = null;

    url = () => process.env.PUBLIC_URL + "activity/" + this.id;
}

export class ActivityType implements IdValue {
    id: string = "";
    name: string = "";
    description: string = "";
    image: string = "";

    url = () => process.env.PUBLIC_URL + "activity_type/" + this.id;
}

export class T13EventType implements IdValue {
    id: string = "";
    name: string = "";
    description: string = "";
    image: string = "";

    url = () => process.env.PUBLIC_URL + "event_type/" + this.id;
}

export class T13Event implements IdValue {
    id: string = "";
    name: string = "";
    comment: string = "";
    start_date: Date = new Date();
    end_date: Date = new Date();
    image_url: string | null = null;
    @Type(() => T13EventType)
    type: T13EventType | null = null;

    url = () => process.env.PUBLIC_URL + "event/" + this.id;
}

export class PagedT13Events extends PagedValues<T13Event> {
    @Type(() => T13Event)
    results: T13Event[] = [];
}

export default { Activity, ActivityType, T13Event, T13EventType, PagedT13Events };
import { Type } from "class-transformer";
import "reflect-metadata"
import { isoWeek } from './components/Utilities';

const slugify = (s?: string) =>
    s?.toLowerCase()
        .replace(/[åä]/g, 'a')
        .replace('ö', 'o')
        .replace(' ', '_')
        .replace(/[\W]/g, '-') ?? '_'

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

export class LicenseType implements IdValue {
    id: string = "";
    name: string = "";
    description: string = "";
    start_level: string = "";
    end_level: string = "";

    apiUrl = () => LicenseType.apiUrlForId(this.id);

    static apiUrlLíst = '/api/licensetype'
    static apiUrlForId = (id: string) => `/api/licensetype/${id}`
}

export class PagedLicenseTypes extends PagedValues<LicenseType> {
    @Type(() => LicenseType)
    results: LicenseType[] = [];
}

export class License  {
    id: string = "";
    type: string = "";
    member: string = "";
    level: string = ""; 

    apiUrl = () => License.apiUrlForId(this.member, this.id);
    
    static apiUrlForId = (member: string, id: string) => `/api/member/${member}/license/${id}`;          
}

export class PagedLicenses  extends PagedValues<License> {
    @Type(() => License)
    results: License[] = [];
}


export class CarClass implements IdValue {
    id: string = "";
    name: string = "";
    abbrev: string = "";
    comment: string = "";
    min_age: number = 0;
    max_age: number = 999;
    min_weight: number = 0;

    url = () => CarClass.urlForId(this.id, this.abbrev);
    adminUrl = () => CarClass.adminUrlForId(this.id);
    apiUrl = () => CarClass.apiUrlForId(this.id);

    static urlForId = (id:string, abbrev: string) => `/frontend/carclass/${id}/${abbrev}`;
    static adminUrlForId = (id: string) => `/admin/app/carclass/${id}`;
    static apiUrlForId = (id: string) => `/api/carclass/${id}`;      
}


export class PagedCarClasses extends PagedValues<CarClass> {
    @Type(() => CarClass)
    results: CarClass[] = [];
}


export class Driver implements IdValue {
    id: string = "";
    member: string = "";
    name: string = "";
    number: number = 0;
    klass: string = "";
    @Type(() => Date)
    birthday: Date | null = null;

    url = () => Driver.urlForId(this.id, this.name);
    adminUrl = () => Driver.adminUrlForId(this.id);
    apiUrl = () => Driver.apiUrlForId(this.id);

    static urlForId = (id: string, fullname?: string) => `/frontend/driver/${id}/${slugify(fullname)}`;
    static adminUrlForId = (id: string) => `/admin/app/driver/${id}`;
    static apiUrlForId = (id: string) => `/api/driver/${id}`;    
}


export class PagedDrivers extends PagedValues<Driver> {
    @Type(() => Driver)
    results: Driver[] = [];
}

export class Member implements IdValue {
    id: string = "";
    user_id: string = "";
    fullname: string = "";
    phone_number?: string;
    email: string = "";
    image_url?: string;
    comment?: string;

    membercard_number: string = '';

    booked_weight_year?: number;
    booked_weight?: number;

    email_verified = false;
    phone_verified = false;

    @Type(() => License)
    license_set: License[] = [];

    @Type(() => Driver)
    driver_set: Driver[] = [];

    url = () => Member.urlForId(this.id, this.fullname);
    adminUrl = () => Member.adminUrlForId(this.user_id);
    apiUrl = () => Member.apiUrlForId(this.id);

    static urlForId = (id: string, fullname?: string) => `/frontend/member/${id}/${slugify(fullname)}`;
    static adminUrlForId = (user_id: string) => `/admin/auth/user/${user_id}`;
    static apiUrlForId = (id: string) => `/api/member/${id}`;

}

export class PagedMembers extends PagedValues<Member> {
    @Type(() => Member)
    results: Member[] = [];
}

export class User implements IdValue {
    id = '';
    emali = '';
    first_name = '';
    last_name = '';
}

export class Attachment implements IdValue {
    id = '';
    file = '';
    comment = '';
    uploader?: User;

    created?: Date;
    modified?: Date;
}

export class Activity implements IdValue {
    id: string = "";
    name: string = "";
    comment: string = "";

    date = () => { return this.event?.date() };

    start_time: string = '';
    end_time: string = '';

    weight: number = 1;

    completed: boolean | null = null;
    bookable: boolean = false;
    cancelled: boolean = false;

    @Type(() => ActivityType)
    type: ActivityType | null = null;

    @Type(() => T13Event)
    event: T13Event = new T13Event();

    @Type(() => Member)
    assigned: Member | null = null;
    assigned_for_proxy?: string;
    
    @Type(() => Date)
    assigned_at: Date | null = null;

    @Type(() => ActivityDelistRequest)
    active_delist_request?: ActivityDelistRequest;

    @Type(() => Date)
    earliest_bookable_date?: Date;

    @Type(() => Attachment)
    attachments: Attachment[] = []

    time = () => {
        if (this.end_time === null || this.end_time === this.start_time)
            return this.start_time

        return this.start_time + " - " + this.end_time
    }

    toString = () => `${this.name} - ${this.event.date()} - ${this.time()}`

    url = () => `/frontend/activity/${this.id}/${slugify(this.name)}`;
    adminUrl = () => '/admin/app/activity/' + this.id;
    apiUrl = () => Activity.apiUrlFromId(this.id);

    static apiUrlFromId = (id: string) => `/api/activity/${id}`;
    static urlForId = (id: string) => `/frontend/activity/${id}/_`
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

    @Type(() => Attachment)
    attachments: Attachment[] = []

    fee_reimbursed = false;
    food_included = false;
    rental_kart = false;

    url = () => `/frontend/activity_type/${this.id}/${slugify(this.name)}`;
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
    @Type(() => Attachment)
    attachments: Attachment[] = []

    url = () => `/frontend/event_type/${this.id}/${slugify(this.name)}`;
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

    @Type(() => Attachment)
    attachments: Attachment[] = []

    @Type(() => Date)
    start_date: Date = new Date(0);

    @Type(() => Date)
    end_date: Date = new Date(0);

    image_url: string | null = null;

    @Type(() => T13EventType)
    type: T13EventType | null = null;

    @Type(() => Activity)
    activities: Activity[] = [];

    activities_count?: number;
    activities_available_count?: number;
    has_bookable_activities?: boolean;

    @Type(() => Member)
    coordinators: Member[] = [];

    cancelled: boolean = false;
    current_user_assigned: boolean = false;

    date = () => {
        const startDate = this.start_date.toLocaleDateString('sv-SE');
        const endDate = this.end_date.toLocaleDateString('sv-SE')

        if (startDate === endDate) {
            const weekday = this.start_date.toLocaleDateString('sv-SE', { weekday: 'long' })
            return `${startDate} ${weekday} v${isoWeek(this.start_date)}`;
        }

        const range = `${startDate} - ${endDate}`;
        const startWeek = isoWeek(this.start_date);
        const endWeek = isoWeek(this.end_date);

        return startWeek === endWeek ? `${range} v${startWeek}` : range;
    }

    url = () => `/frontend/event/${this.id}/${slugify(this.name)}`;
    adminUrl = () => `/admin/app/event/${this.id}`;

    static apiUrl = (id: string) => `/api/event/${id}`;
    static urlForId = (id: string) => `/frontend/event/${id}/_`;

}

export class PagedT13Events extends PagedValues<T13Event> {
    @Type(() => T13Event)
    results: T13Event[] = [];
}

export class ActivityDelistRequest implements IdValue {
    id: string = '';

    @Type(() => Member)
    member?: Member | string;

    @Type(() => Activity)
    activity?: Activity | string;

    reason: string = '';
    reject_reason?: string;

    @Type(() => Member)
    approver?: Member | string;
    approved: boolean | null = null;

    url = () => ActivityDelistRequest.urlForId(this.id);
    adminUrl = () => `/admin/app/activitydelistrequest/${this.id}`;
    apiUrl = () => ActivityDelistRequest.apiUrlForId(this.id);

    static urlForId = (id: string) => `/frontend/delistrequest/?highlight=${id}`;
    static apiUrlForId = (id: string) => `${ActivityDelistRequest.apiUrlAll()}/${id}`;
    static apiUrlForActivityId = (id: string) => `${ActivityDelistRequest.apiUrlAll()}/activity/${id}`;
    static apiUrlAll = () => `/api/activity_delist_request`;
}

export class PagedADR extends PagedValues<ActivityDelistRequest>
{
    @Type(() => ActivityDelistRequest)
    results: ActivityDelistRequest[] = [];
}

export class FAQ implements IdValue {
    id!: string;
    question!: string;
    answer!: string;

    url = () => `/frontend/faq/${this.id}`;
    adminUrl = () => `/admin/app/faq/${this.id}`;
    static adminCreateUrl = '/admin/app/faq/add';
    static apiUrlsForAll = '/api/faq';
}

export class PagedFAQs extends PagedValues<FAQ>
{
    @Type(() => FAQ)
    results: FAQ[] = [];
}

export default {
    Member, Activity, ActivityType, T13Event, T13EventType,
    PagedT13Events, PagedMembers, PagedActivities, PagedEventTypes
};

export class DoubleBookedTask {
    assigned_id!: string;
    assigned_fullname!: string;
    event_id!: string;
    event_name!: string;
    activity_id!: string;
    activity_name!: string;
    activity_comment!: string;
}

export class PagedDoubleBookedTasks extends PagedValues<DoubleBookedTask>
{
    @Type(() => DoubleBookedTask)
    results: DoubleBookedTask[] = [];
}

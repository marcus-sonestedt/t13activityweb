import React, { useState, SyntheticEvent, useMemo } from "react";
import { Table, Button, Pagination, Row, Col } from 'react-bootstrap'
import { useHistory } from "react-router-dom";
import RBC, { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'moment/locale/sv';

import { HoverTooltip, PageItems } from "./Utilities";
import { PagedT13Events, T13Event } from '../Models'

import 'react-big-calendar/lib/css/react-big-calendar.css';
import './Table.css'
import './Calendar.css'

export interface MyProps {
    events: PagedT13Events;
    title?: string
}

const localizer = momentLocalizer(moment);
const msecPerWeek = 7 * 24 * 60 * 60 * 1000;

const Check = () => <span role='img' aria-label='check' style={{ color: 'lightgreen' }}>✔</span>;
const Cross = () => <span role='img' aria-label='cross'>❌</span>

function hsv2rgb(h: number, s: number, v: number) {
    let f = (n: number, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
    return [f(5), f(3), f(1)];
}

const intToRgb = (i: number) => {
    const [r, g, b] = hsv2rgb(i * 563456223.0 % 360, 0.8, 0.4);
    const [rr, gg, bb] = [Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255)]
    return `#${(rr).toString(16)}${(gg).toString(16)}${(bb).toString(16)}`
}


class MyAgendaEvent extends React.Component<any, {}> {
    render = () => {
        const event = this.props.event;
        const typeIndex = parseInt(event.type?.id) + 1 ?? 0;
        const bgColor = intToRgb(typeIndex);

        return <div className={'event ' + (event.has_bookable_activities ? 'bookable' : 'locked')}
            style={{ backgroundColor: bgColor }}>
            <a href={event.url()}>
                {event.name} {event.type ? ' - ' : null} {event.type?.name}
            </a>
        </div>
    }
}

class MyEvent extends React.Component<any, {}> {
    render = () => {
        const event = this.props.event;

        const typeIndex = parseInt(event.type?.id) + 1 ?? 0;
        const bgColor = intToRgb(typeIndex);

        const tooltip = <div>{event.name}
            <br />{event.type?.name ?? ''}
            <br />{event.has_bookable_activities
                ? 'Har bokningsbara uppgifter' : 'Inga bokningsbara uppgifter'}
        </div>

        return <HoverTooltip tooltip={tooltip}>
            <div className={'event ' + (event.has_bookable_activities ? 'bookable' : 'locked')}
                style={{ backgroundColor: bgColor }}>
                <a href={event.url()}>{event.name}</a>
            </div>
        </HoverTooltip >
    }
}


const LS_EVENTCAL_VIEW_KEY = 'eventcal-view';
const LS_EVENTCAL_DATE_KEY = 'eventcal-range';

export const EventsCalendar = (props: { events: PagedT13Events }) => {
    const { events } = props;

    const bcViewJson = localStorage.getItem(LS_EVENTCAL_VIEW_KEY);
    const bcViewStored = (bcViewJson === null ? 'month' : JSON.parse(bcViewJson)) as RBC.View;

    const lsDateString = localStorage.getItem(LS_EVENTCAL_DATE_KEY);
    const lsDateStored = lsDateString === null ? new Date() : new Date(lsDateString);

    const [view, setView] = useState(bcViewStored);
    const [date, setDate] = useState(lsDateStored);

    const history = useHistory();
    const eventClicked = (event: T13Event, e: SyntheticEvent) =>
        history.push(event.url());

    const components = {
        event: MyEvent,
        agenda: { event: MyAgendaEvent }
    }

    const weekOrShorterEvents = useMemo(() => events.results.filter((e: T13Event) =>
        (e.end_date.getTime() - e.start_date.getTime()) <= msecPerWeek),
        [events]);

    return <Calendar
        culture='sv-SE'
        localizer={localizer}
        events={weekOrShorterEvents}
        startAccessor="start_date"
        endAccessor="end_date"
        allDayAccessor={() => true}
        titleAccessor="name"
        onSelectEvent={eventClicked}
        components={components}
        defaultView={view}
        onView={v => {
            localStorage.setItem(LS_EVENTCAL_VIEW_KEY, JSON.stringify(v));
            setView(v);
        }}
        defaultDate={date}
        onNavigate={date => {
            localStorage.setItem(LS_EVENTCAL_DATE_KEY, date.toISOString());
            setDate(date);
        }}
    />
}

export const EventsTable = (props: {
    events: PagedT13Events,
    count: number
}) => {
    const { events, count = 10 } = props;
    const [page, setPage] = useState(1);
    const [bookableFilter, setBookableFilter] = useState<boolean | null>(null);
    const [typeFilter, setTypeFilter] = useState<string | null>(null);
    const [year, setYear] = useState(new Date().getFullYear());

    const history = useHistory();

    const renderRow = (model: T13Event) => {
        const type = model.type === null ? '-' :
            <a href={model.type.url()}>{model.type.name}</a>

        const typeIndex = parseInt(model?.type?.id ?? '0') + 1 ?? 0;
        const bgColor = intToRgb(typeIndex);

        return (
            <tr key={model.id} className='clickable-row'
                onClick={() => history.push(model.url())}>
                <td style={{ backgroundColor: bgColor }}><a href={model.url()}>{model.name}</a></td>
                <td className='nowrap'>{model.date()}</td>
                <td>{type}</td>
                <td style={{ textAlign: 'center' }}>{model.has_bookable_activities ? <Check /> : <Cross />}</td>
            </tr>
        );
    }

    const toggleBookableFilter = () => {
        const next = bookableFilter === null ? true :
            bookableFilter === true ? false : null;
        setBookableFilter(next);
    }

    const types = useMemo(() => {
        const set = new Set(events.results.map(e => e.type?.name));
        const values = new Array(set.size);
        const x = set.values();
        for (let i = 0; i < values.length; ++i)
            values[i] = x.next().value;
        return values;
    }, [events]);

    const toggleTypeFilter = () => {
        let next = null;
        if (typeFilter === null)
            next = types[0];
        else if (typeFilter === types[types.length - 1])
            next = null;
        else
            next = types[types.findIndex(t => t === typeFilter) + 1];

        setTypeFilter(next);
    }

    const filteredEvents = useMemo(() =>
        events.results
            .filter(e => bookableFilter === null ? true : bookableFilter === e.has_bookable_activities)
            .filter(e => typeFilter === null ? true : typeFilter === e.type?.name)
            .filter(e => e.start_date.getFullYear() === year || e.end_date.getFullYear() === year)
        , [events, typeFilter, bookableFilter, year]);


    const YearHeader = () =>
        <>
            Datum{' '}
            <Button onClick={() => setYear(year - 1)} size='sm' variant='outline-info'>-</Button>
            <HoverTooltip tooltip="Aktivitetens datum. Klicka för att gå till nuvarande år."
                placement='bottom'>
                <Button onClick={() => setYear(new Date().getFullYear())} size='sm' variant='outline-info'>
                    {year}
                </Button>
            </HoverTooltip>
            <Button onClick={() => setYear(year + 1)} size='sm' variant='outline-info'>+</Button>
        </>

    const TypeHeader = () =>
        <HoverTooltip tooltip="Typ av aktivitet. Klicka för att filtrera."
            placement='bottom'>
            <Button onClick={toggleTypeFilter} size='sm'
                variant='outline-info' block={true}>
                Typ{' '}{typeFilter?.toString()}
            </Button>
        </HoverTooltip>

    const BookableHeader = () =>
        <HoverTooltip tooltip="Om aktiviteten har lediga uppgifter samt kan bokas idag."
            placement='bottom'>
            <Button onClick={toggleBookableFilter} size='sm'
                variant='outline-info' block={true}>
                Bokningsbar{' '}
                {bookableFilter === null ? null :
                    bookableFilter === true ? <Check /> : <Cross />}
            </Button>
        </HoverTooltip>

    return <>
        <Table striped hover size='sm' responsive className='event-table'>
            <thead>
                <tr>
                    <th>Namn</th>
                    <th><YearHeader /></th>
                    <th><TypeHeader /></th>
                    <th><BookableHeader /></th>
                </tr>
            </thead>
            <tbody>
                {filteredEvents
                    .slice((page - 1) * count, page * count)
                    .map(renderRow)}
            </tbody>
        </Table >
        <Pagination>
            <PageItems count={filteredEvents.length} pageSize={count}
                currentPage={page} setFunc={setPage} />
        </Pagination>
    </>
}

export interface EventProps {
    events: PagedT13Events;
    title?: string,
    height?: string
}

const LS_CALMODE_KEY = "event-calendar-mode";

export const EventsComponent = (props: EventProps) => {
    const { events, title = 'Kommande händelser', height = '75vh' } = props;

    const storedViewModeJson = localStorage.getItem(LS_CALMODE_KEY);
    const storedViewMode = storedViewModeJson === null
        ? false : JSON.parse(storedViewModeJson);
    const [viewMode, setViewMode] = useState(storedViewMode);

    const toggleViewMode = () => setViewMode((x: boolean) => {
        x = !x;
        localStorage.setItem(LS_CALMODE_KEY, JSON.stringify(x));
        return x;
    });

    return <div className="table-container">
        <Row>
            <Col>
                <h3>{title}</h3>
            </Col>
            <Col style={{ textAlign: 'center' }}>
                <HoverTooltip tooltip='Byt mellan kalender och tabellvy' placement='left'>
                    <Button variant='outline-info'
                        onClick={toggleViewMode}>
                        {!viewMode ? 'Kalender' : 'Tabell'}
                    </Button>
                </HoverTooltip>
            </Col>
            <Col style={{ textAlign: 'right' }}>
                <h5>
                    Visar {events.results.length} / {events.count} st
                        &nbsp;
                </h5>
            </Col>
        </Row>
        <div style={{ height: height }}>
            {viewMode
                ? <EventsCalendar events={events} />
                : <EventsTable events={events} count={20} />
            }
        </div>
    </div>
}

export default EventsComponent;


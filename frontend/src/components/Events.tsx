import React, { useState, SyntheticEvent } from "react";
import { Table, Button, Pagination, Row, Col } from 'react-bootstrap'
import { useHistory } from "react-router-dom";
import RBC, { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'moment/locale/sv';

import { PagedT13Events, T13Event } from '../Models'

import 'react-big-calendar/lib/css/react-big-calendar.css';
import './Table.css'
import './Calendar.css'
import { HoverTooltip, PageItems } from "./Utilities";

export interface MyProps {
    events: PagedT13Events;
    title?: string
}

const localizer = momentLocalizer(moment);

class MyAgendaEvent extends React.Component<any, {}> {
    render = () =>
        <a href={this.props.event.url()}>{this.props.event.name}</a>
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

    const components = { agenda: { event: MyAgendaEvent } }

    return <Calendar
        culture='sv-SE'
        localizer={localizer}
        events={events.results}
        startAccessor="start_date"
        endAccessor="end_date"
        allDayAccessor={() => true}
        titleAccessor="name"
        tooltipAccessor={x => `${x.name}\n${x.type?.name ?? ''}`}
        resourceAccessor={x => x.url()}
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

export const UpcomingEventsTable = (props: {
    events: PagedT13Events,
    count: number
}) => {
    const { events, count = 10 } = props;
    const [page, setPage] = useState(1);
    const history = useHistory();

    const renderRow = (model: T13Event) => {
        const type = model.type === null ? '-' :
            <a href={model.type.url()}>{model.type.name}</a>

        return (
            <tr key={model.id} className='clickable-row' onClick={() => history.push(model.url())}>
                <td><a href={model.url()}>{model.name}</a></td>
                <td className='nowrap'>{model.date()}</td>
                <td>{type}</td>
                <td>
                    {model.has_bookable_activities
                        ? <span role='img' aria-label='check' style={{ color: 'lightgreen' }}>✔</span>
                        : <span role='img' aria-label='cross'>❌</span>
                    }
                </td>
            </tr>
        );
    }

    return <>
        <Table striped hover>
            <thead>
                <tr>
                    <th>Namn</th>
                    <th>Datum</th>
                    <th>Typ</th>
                    <th>Bokningsbar</th>
                </tr>
            </thead>
            <tbody>
                {events.results.slice((page - 1) * count, page * count).map(renderRow)}
            </tbody>
        </Table>
        <Pagination>
            <PageItems count={events.results.length} pageSize={10} currentPage={page} setFunc={setPage} />
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
                        {viewMode ? 'Kalender' : 'Tabell'}
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
                : <UpcomingEventsTable events={events} count={10} />
            }
        </div>
    </div>
}

export default EventsComponent;


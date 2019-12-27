import React, { useState, SyntheticEvent } from "react";
import { Table, Button } from 'react-bootstrap'
import { PagedT13Events, T13Event } from '../Models'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import { useHistory } from "react-router";
import moment from 'moment'
import 'moment/locale/sv';
import './Table.css'
import 'react-big-calendar/lib/css/react-big-calendar.css';

export interface MyProps {
    events: PagedT13Events;
    title?: string
}

const localizer = momentLocalizer(moment);

export const UpcomingEventsCalendar = (props: { events: PagedT13Events }) => {
    const { events } = props;
    const history = useHistory();
    const eventClicked = (event: T13Event, e: SyntheticEvent) =>
        history.push(event.url());

    return <Calendar
        culture='sv-SE'
        localizer={localizer}
        events={events.results}
        startAccessor="start_date"
        endAccessor="end_date"
        allDayAccessor={() => true}
        titleAccessor="name"
        tooltipAccessor="name"
        onSelectEvent={eventClicked}
    />
}

export const UpcomingEventsTable = (props: { events: PagedT13Events }) => {
    const { events } = props;

    const renderRow = (model: T13Event) => {
        const type = model.type === null ? null :
            <a href={model.type.url()}>{model.type.name}</a>

        return (
            <tr key={model.id}>
                <td><a href={model.url()}>{model.name}</a></td>
                <td className='nowrap'>{model.date()}</td>
                <td>{type}</td>
                <td></td>
            </tr>
        );
    }

    return (
        <Table>
            <thead>
                <tr>
                    <th>Namn</th>
                    <th>Datum</th>
                    <th>Typ</th>
                    <th>Uppgifter</th>
                </tr>
            </thead>
            <tbody>
                {events.results.map(renderRow)}
            </tbody>
        </Table>
    );
}

export interface EventProps {
    events: PagedT13Events;
    title?: string
}


export const UpcomingEvents = (props: EventProps) => {
    const { events, title = 'Kommande händelser' } = props;
    const storedViewModeJson = localStorage.getItem("cal-mode");
    const storedViewMode = storedViewModeJson === null
        ? false : JSON.parse(storedViewModeJson);
    const [viewMode, setViewMode] = useState(storedViewMode);

    const toggleViewMode = () => setViewMode((x: boolean) => {
        x = !x;
        localStorage.setItem("cal-mode", JSON.stringify(x));
        return x;
    });

    return <div className="table-container">
        <h3>
            <span className="table-title">{title}</span>
            <span className="table-count">
                ({events.results.length}/{events.count})
                &nbsp;
                <Button variant='outline-info' size='sm'
                    onClick={toggleViewMode}>
                    {viewMode ? 'Kalender' : 'Tabell'}
                </Button>
            </span>
        </h3>
        <div style={{ height: '65vh' }}>
            {viewMode
                ? <UpcomingEventsCalendar events={events} />
                : <UpcomingEventsTable events={events} />
            }
        </div>
    </div>
}

export default UpcomingEvents;


import React, { useState, SyntheticEvent } from "react";
import { Table, Button, Pagination } from 'react-bootstrap'
import { useHistory } from "react-router-dom";
import RBC, { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'moment/locale/sv';

import { PagedT13Events, T13Event } from '../Models'
import { pageItems } from "../views/MemberHomeView";

import './Table.css'
import 'react-big-calendar/lib/css/react-big-calendar.css';

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

export const UpcomingEventsCalendar = (props: { events: PagedT13Events }) => {
    const { events } = props;
    const bcViewJson = localStorage.getItem(LS_EVENTCAL_VIEW_KEY);
    const bcViewStored = (bcViewJson === null ? 'month' : JSON.parse(bcViewJson)) as RBC.View;
    const [bcView, setBCView] = useState<RBC.View>(bcViewStored);
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
        view={bcView}
        onView={v => {
            localStorage.setItem(LS_EVENTCAL_VIEW_KEY, JSON.stringify(v));
            setBCView(v);
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
                    <a href={model.url()}>
                        <span className='text'>{model.activities_count}
                            <span className='text-tooltip'>Totalt antal uppgifter</span>
                        </span>
                        {' / '}
                        <span className='text'>{model.activities_available_count}
                            <span className='text-tooltip'>Lediga uppgifter</span>
                        </span>
                    </a>
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
                    <th>Uppgifter</th>
                </tr>
            </thead>
            <tbody>
                {events.results.slice((page - 1) * count, page * count).map(renderRow)}
            </tbody>
        </Table>
        <Pagination>
            {pageItems(events.results.length, 10, page, setPage)}
        </Pagination>
    </>
}

export interface EventProps {
    events: PagedT13Events;
    title?: string,
    height?: string
}

const LS_CALMODE_KEY = "event-calendar-mode";

export const UpcomingEvents = (props: EventProps) => {
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
        <h3>
            <span className="table-title">{title}</span>
            <span className="table-count">
                Visar {events.results.length} / {events.count} st
                &nbsp;
                <Button variant='outline-info' size='sm'
                    onClick={toggleViewMode}>
                    {viewMode ? 'Kalender' : 'Tabell'}
                </Button>
            </span>
        </h3>
        <div style={{ height: height }}>
            {viewMode
                ? <UpcomingEventsCalendar events={events} />
                : <UpcomingEventsTable events={events} count={10} />
            }
        </div>
    </div>
}

export default UpcomingEvents;


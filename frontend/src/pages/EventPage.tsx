import React, { useState, useEffect, useContext, useCallback, useMemo } from "react"
import { useParams, useHistory } from 'react-router-dom';
import { Table, Container, Row, Col, Button, Badge, Pagination } from 'react-bootstrap'
import { deserialize } from "class-transformer";
import { PagedT13Events, T13Event, PagedActivities, Activity, Member } from '../Models'
import '../components/Table.css'
import { userContext } from "../components/UserContext";
import { MarkDown, HoverTooltip, PageItems } from '../components/Utilities';
import { Attachments } from "../components/AttachmentComponent";
import { Reimbursements } from "./ActivityTypePage";
import { BookButtons } from "../logic/TaskActions";
import { DataProvider } from "../components/DataProvider";

export const EventPage = () => {
    const { id } = useParams();
    const [event, setEvent] = useState<T13Event>();
    const onLoaded = useCallback(data => setEvent(data.results[0]), []);

    useEffect(() => {
        document.title = event
            ? `T13 - ${event.name} - ${event.date()}`
            : `T13 - Aktivitet id ${id}`
    }, [id, event]);

    const url = `/api/events/${id}`;

    return (
        <Container fluid key={id}>
            <DataProvider<PagedT13Events>
                url={url}
                ctor={json => deserialize(PagedT13Events, json)}
                onLoaded={onLoaded}
            >
                <Row>
                    <Col md={12}>
                        <Header event={event} />
                    </Col>
                </Row>
                <Row>
                    <Col md={12} lg={5}>
                        <EventDetails event={event} />
                    </Col>
                    <Col md={12} lg={7}>
                        <ActivitiesTable event={event} />
                    </Col>
                </Row>
            </DataProvider>
        </Container>
    )
}

const Header = (props: { event?: T13Event }) => {
    const { event } = props;
    const user = useContext(userContext);

    if (!event)
        return null

    return <Row>
        <Col>
            <a href={event.url()}><h1>{event.name}</h1></a>
        </Col>
        <Col style={{ textAlign: 'right' }}>
            <h2>
                {user.isLoggedIn ?
                    <Badge
                        variant={(event.activities_available_count) ? 'success' : 'dark'}>
                        {event.activities_count} totalt
                        {', '}
                        {event.activities_available_count} ledig
                        {event.activities_available_count !== 1 ? 'a' : ''}
                    </Badge>
                    : null}
                {' '}
                {user.isStaff ?
                    <Button href={event.adminUrl()} variant='outline-secondary'>
                        Editera
                    </Button>
                    : null}
            </h2>
        </Col>
    </Row>
}

const EventDetails = (props: { event?: T13Event }) => {
    const { event } = props;
    const user = useContext(userContext);

    if (!event)
        return <p>Laddar...</p>

    const eventType = event.type ?
        <a href={event.type.url()}>{event.type.name}</a> : '-';

    const renderCoordinator = (member: Member) =>
        <li key={member.id}>
            <a href={member.url()}>{member.fullname}</a>{' - '}
            <a href={`mailto:${member.email}`}>{member.email}</a>{' - '}
            <a href={`tel:${member.phone_number}`}>{member.phone_number}</a>
        </li>

    return <>
        <h3>Datum {event.date()}</h3>
        <div className='div-group'>
            <h5>Typ {eventType}</h5>
            {event.description ? <>
                <h5>Beskrivning</h5>
                <MarkDown source={event.description} />
            </> : null}
            {event.coordinators.length === 0
                ? <>
                    <h5>Ingen koordinator</h5>
                    <p>Kolla med kanslet på <a href="mailto:info@team13.se">info@team13.se</a>.</p>
                </>
                : <>
                    <h5>Koordinator{event.coordinators.length > 1 ? 'er' : ''}</h5>
                    {user.isLoggedIn
                        ? <ul>{event.coordinators.map(renderCoordinator)}</ul>
                        : <p>Logga in för att se koordinator</p>
                    }
                </>}
            <Attachments models={event.attachments} />
            <h5>Övrig info</h5>
            {event.comment ? <MarkDown source={event.comment} /> : <p>¯\_(ツ)_/¯</p>}
        </div>
    </>


}

const ActivitiesTable = (props: { event?: T13Event }) => {
    const { event } = props;
    const [activities, setActivities] = useState(new PagedActivities());
    const [page, setPage] = useState(1);
    const pageSize = 8;
    const user = useContext(userContext);
    const history = useHistory();

    // TODO: Compute for all activities, not just current page! Maybe on server?
    const memberAlreadyBooked = useMemo(() =>
        activities.results.filter(a => a.assigned?.id === user.memberId).length
        , [activities, user.memberId]);

    const renderActivityRow = (activity: Activity) => {
        const type = activity.type !== null
            ? <a href={activity.type.url()}>{activity.type.name}</a>
            : '-';

        const className =
            (user.isLoggedIn && activity.assigned?.id === user.memberId) ? 'my-task' : null;

        let assigned = <span>{activity.assigned?.fullname}</span>

        if (user.isLoggedIn) {
            if (activity.assigned !== null) {
                assigned = <a href={activity.assigned.url()}>{activity.assigned.fullname}</a>
            }

            if (activity.active_delist_request || activity.bookable) {
                assigned = <>
                    {assigned}
                    {' '}
                    <BookButtons activity={activity} canBookSelf={!memberAlreadyBooked} />
                </>
            }
        }

        const rowClicked = () => history.push(activity.url());

        return (
            <tr key={activity.id} className={'linked ' + className} onClick={rowClicked}>
                <td><a href={activity.url()}>{activity.name}</a></td>
                <td>{type}</td>
                <td className='nowrap'>
                    {event?.date()}<br />{activity.time()}
                </td>
                <td>
                    {activity.weight === 1 ? null :
                        <HoverTooltip tooltip="Denna aktivitet räknas som flera">
                            <span className='weight'>{activity.weight}</span>
                        </HoverTooltip>}
                    {' '}
                    <Reimbursements model={activity.type} /></td>
                <td>{assigned}</td>
            </tr>
        )
    }

    if (!event)
        return null;

    const url = `/api/event_activities/${event?.id}?page=${page}&page_size=${pageSize}`;

    return <DataProvider<PagedActivities>
        url={url}
        ctor={json => deserialize(PagedActivities, json)}
        onLoaded={setActivities}>
        <>
            <Row>
                <Col sm={4}>
                    <h3>Uppgifter</h3>
                </Col>
                <Col sm={4} style={{ display: 'flex', justifyContent: 'center' }}>
                    <Pagination>
                        <PageItems count={activities.count} pageSize={pageSize} currentPage={page} setFunc={setPage} />
                    </Pagination>
                </Col>
                <Col sm={4} style={{ textAlign: 'right' }}>
                    <h3>
                        {(page - 1) * pageSize + 1}
                        {'-'}
                        {Math.min(page * pageSize, activities.count)}
                        {' / '}
                        {activities.count}
                        {' st'}
                    </h3>
                </Col>
            </Row>
            <Table hover striped responsive='lg'>
                <thead>
                    <tr>
                        <th>Beskrivning</th>
                        <th>Typ</th>
                        <th>Tid</th>
                        <th>Övrigt</th>
                        <th>Tilldelad</th>
                    </tr>
                </thead>
                <tbody>
                    {activities.results.map(renderActivityRow)}
                </tbody>
            </Table>
        </>
    </DataProvider>
}

export default EventPage;
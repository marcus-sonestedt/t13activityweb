import React, { useState, useEffect, useContext, useCallback } from "react"
import { useParams, useHistory } from 'react-router-dom';
import { Table, Container, Row, Col, Button, Badge, Pagination } from 'react-bootstrap'
import { deserialize } from "class-transformer";
import { PagedT13Events, T13Event, PagedActivities, Activity, Member } from '../Models'
import '../components/Table.css'
import { userContext } from "../components/UserContext";
import { MarkDown, HoverTooltip, PageItems } from '../components/Utilities';
import { Attachments } from "../components/AttachmentComponent";
import { claimActivity } from '../logic/ADRActions';
import { Reimbursements } from "./ActivityTypePage";
import DataProvider from "../components/DataProvider";

export const EventPage = () => {
    const [event, setEvent] = useState<T13Event>();
    const { id } = useParams();
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
                    <ul>{event.coordinators.map(renderCoordinator)}</ul>
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

    const claimActivityClick = (
        e: React.MouseEvent<HTMLElement>, model: Activity) => {
        e.stopPropagation();
        claimActivity(model, history);
    }

    const renderActivityRow = (model: Activity) => {
        const type = model.type !== null
            ? <a href={model.type.url()}>{model.type.name}</a>
            : '-';

        const className =
            (user.isLoggedIn && model.assigned?.id === user.memberId) ? 'my-task' : null;

        const ClaimButton = (props: { text: string }) =>
            <Button onClick={(e: React.MouseEvent<HTMLElement>) => claimActivityClick(e, model)}>{props.text}</Button>

        const assigned =
            !user.isLoggedIn
                ? <span>{model.assigned?.fullname}</span>
                : model.assigned !== null
                    ? <>
                        <a href={model.assigned.url()}>{model.assigned.fullname}</a>
                        {(model.active_delist_request && user.isLoggedIn) ? <>
                            <span className='spacer' />
                            <ClaimButton text='Överta' />
                        </> : null}
                    </>
                    : (model.bookable && user.isLoggedIn)
                        ? <ClaimButton text='Boka' />
                        : null;

        const rowClicked = () => history.push(model.url());

        return (
            <tr key={model.id} className={'linked ' + className} onClick={rowClicked}>
                <td><a href={model.url()}>{model.name}</a></td>
                <td>{type}</td>
                <td className='nowrap'>
                    {event?.date()}<br />{model.time()}
                </td>
                <td>
                    {model.weight === 1 ? null :
                        <HoverTooltip tooltip="Denna aktivitet räknas som flera">
                            <span className='weight'>{model.weight}</span>
                        </HoverTooltip>}
                    {' '}
                    <Reimbursements model={model.type} /></td>
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
import React, { useState, useEffect, useContext, useMemo } from "react"
import { useParams, useHistory } from 'react-router-dom';
import { Table, Container, Row, Col, Button, Badge } from 'react-bootstrap'
import { deserialize } from "class-transformer";
import { PagedT13Events, T13Event, PagedActivities, Activity, Member } from '../Models'
import '../components/Table.css'
import Cookies from 'universal-cookie';
import { userContext } from "../components/UserContext";
import { MarkDown } from '../components/Utilities';

export const EventPage = () => {
    const [event, setEvent] = useState<T13Event | null>(null);
    const [activities, setActivities] = useState<Activity[]>([]);

    const [error, setError] = useState('');
    const [htmlError, setHtmlError] = useState('');

    const { id } = useParams();
    const user = useContext(userContext);
    const history = useHistory();

    if (event !== null)
        activities.forEach(a => a.event = event);

    useEffect(() => {
        if (event === null || event === undefined)
            document.title = `T13 - Aktivitet id ${id}`
        else
            document.title = `T13 - ${event.name} - ${event.date()}`
    }, [id, event]);

    useEffect(() => {
        const controller = new AbortController();
        const url = `/api/events/${id}`;
        const gotEvent = (t: string) => {
            const newEvent = deserialize(PagedT13Events, t).results[0];
            setEvent(newEvent);
        }
        fetch(url, { signal: controller.signal, cache: 'no-store' })
            .then(
                r => r.status === 200
                    ? r.text().then(gotEvent)
                    : (setError(`${url}: HTTP ${r.status}: ${r.statusText}`),
                        r.text().then(setHtmlError))
            ).catch(e => {
                if (e.name === 'AbortError')
                    return;
                setError(e.toString());
            });

        return function cleanup() { controller.abort(); }
    }, [id]);

    useEffect(() => {
        const controller = new AbortController();
        const gotActivities = (t: any) => {
            let r = deserialize(PagedActivities, t).results;
            setActivities(r);
        }

        const url2 = `/api/event_activities/${id}`;
        fetch(url2, { signal: controller.signal, cache: 'no-store' })
            .then(
                r => r.status === 200
                    ? r.text().then(gotActivities) : (setError(`${url2}: HTTP ${r.status}: ${r.statusText}`),
                        r.text().then(setHtmlError))
            ).catch(e => {
                if (e.name === 'AbortError')
                    return;
                setError(e.toString());
            });

        return function cleanup() { controller.abort(); }
    }, [id]);

    const memberAlreadyBooked = useMemo(() =>
        activities.filter(a => a.assigned?.id === user.memberId).length
        , [activities, user.memberId]);

    if (error !== '')
        return (
            <Container>
                <h2>Hittar inte händelsen.</h2>
                <p>{error}</p>
                <div dangerouslySetInnerHTML={{ __html: htmlError }} />
            </Container>
        )

    if (event === null)
        return <Container><p>Laddar ...</p></Container>


    const claimActivityClick = (
        e: React.MouseEvent<HTMLElement>, model: Activity) => {
        e.stopPropagation();
        const cookies = new Cookies();
        fetch(`/api/activity_enlist/${model.id}`,
            {
                method: 'POST',
                headers: { 'X-CSRFToken': cookies.get('csrftoken') }
            })
            .then(r => {
                if (r.status !== 200)
                    throw r.statusText;
                history.push(`/frontend/home?tab=my-tasks?highlight-task=${model.id}`)
            }, r => { throw r })
            .catch(e => {
                console.error(e);
                alert("Något gick fel! :(\n" + e);
                window.location.reload();
            });
    }

    const renderActivityRow = (model: Activity) => {
        const type = model.type !== null
            ? <a href={model.type.url()}>{model.type.name}</a>
            : '-';

        const assigned = model.assigned !== null
            ? <a href={model.assigned.url()}>{model.assigned.fullname}</a>
            : (!memberAlreadyBooked && model.bookable)
                ? <Button onClick={(e: React.MouseEvent<HTMLElement>) => claimActivityClick(e, model)}>Boka</Button>
                : null;

        const rowClicked = () => history.push(model.url());

        return (
            <tr key={model.id} className='linked' onClick={rowClicked}>
                <td><a href={model.url()}>{model.name}</a></td>
                <td>{type}</td>
                <td className='nowrap'>
                    {model.date()}<br />{model.time()}
                </td>
                <td>{assigned}</td>
            </tr>
        )
    }

    const eventType = event.type !== null ?
        <a href={event.type.url()}>{event.type.name}</a> : '-';

    const renderCoordinator = (member: Member) =>
        <li key={member.id}>
            <a href={member.url()}>{member.fullname}</a>{' - '}
            <a href={`mailto:${member.email}`}>{member.email}</a>{' - '}
            <a href={`tel:${member.phone_number}`}>{member.phone_number}</a>
        </li>

    return (
        <Container fluid>
            <Row>
                <Col md={12}>
                    <div className="model-header">
                        <a href={event.url()}><h1>{event.name}</h1></a>
                        {user.isStaff ?
                            <a href={event.adminUrl()}><Button variant='secondary'>Editera</Button></a>
                            : null}
                    </div>
                    <hr />
                </Col>
            </Row>
            <Row>
                <Col md={12} lg={5}>
                    <div className='div-group'>
                        <h5>Datum {event.date()} Typ {eventType}</h5>
                        {event.description ? <>
                            <h5>Beskrivning</h5>
                            <MarkDown source={event.description} />
                        </> : null}
                        {event.coordinators.length === 0
                            ? <h5>Ingen koordinator än</h5>
                            : <>
                                <h5>Koordinator{event.coordinators.length > 1 ? 'er' : ''}</h5>
                                <ul>{event.coordinators.map(renderCoordinator)}</ul>
                            </>}
                        {event.comment ? <>
                            <h5>Övrig info</h5>
                            <MarkDown source={event.comment} />
                        </> : null}
                    </div>
                </Col>
                <Col md={12} lg={7}>
                    <div className="model-header">
                        <h3>Uppgifter</h3>
                        <h3><Badge
                            variant={(event.activities_available_count && !memberAlreadyBooked) ? 'success' : 'dark'}>
                            {event.activities_count} totalt
                            {', '}
                            {event.activities_available_count} ledig
                            {event.activities_available_count !== 1 ? 'a' : ''}
                        </Badge></h3>
                    </div>
                    <Table hover striped responsive='lg'>
                        <thead>
                            <tr>
                                <th>Beskrivning</th>
                                <th>Typ</th>
                                <th>Tid</th>
                                <th>Tilldelad</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activities.map(renderActivityRow)}
                        </tbody>
                    </Table>
                </Col>
            </Row>
        </Container>
    )
}

export default EventPage;
import React, { useState, useEffect, useContext } from "react"
import { useParams, useHistory } from 'react-router-dom';
import { Table, Container, Row, Col, Button } from 'react-bootstrap'
import { deserialize } from "class-transformer";
import { PagedT13Events, T13Event, PagedActivities, Activity } from '../Models'
import '../components/Table.css'
import Cookies from 'universal-cookie';
import { userContext } from "../App";

export const EventView = () => {
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
        const cookies = new Cookies();
        fetch(`/api/activity_enlist/${model.id}`,
            {
                method: 'POST',
                headers: { 'X-CSRFToken': cookies.get('csrftoken') }
            })
            .then(r => {
                if (r.status !== 200)
                    throw r.statusText;
            }, r => { throw r })
            .catch(e => {
                console.error(e);
                alert("Något gick fel! :(\n" + e);
            })
            .finally(() => window.location.reload());
    }

    const renderActivityRow = (model: Activity) => {
        const type = model.type !== null
            ? <a href={model.type.url()}>{model.type.name}</a>
            : '-';

        const assigned = model.assigned !== null
            ? <a href={model.assigned.url()}>{model.assigned.fullname}</a>
            : model.bookable
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
        <a href={event.type.url()}>{event.type.name}</a> : null;

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
                <Col md={12} lg={6}>
                    <div className='div-group'>
                        <h4>Datum: {event.date()}</h4>
                        <h4>Typ: {eventType}</h4>
                        <h5>Beskrivning:</h5>
                        <p>{event.description}</p>
                        <h5>Övrigt:</h5>
                        <p>{event.comment}</p>
                    </div>
                </Col>
                <Col md={12} lg={6}>
                    <div className="model-header">
                        <h3>Uppgifter</h3>
                        <h4>({event.activities_count} totalt, {event.activities_available_count} lediga)</h4>
                    </div>
                    <Table hover>
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

export default EventView;
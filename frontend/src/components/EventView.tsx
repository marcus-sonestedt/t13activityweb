import React, { useState, useEffect } from "react"
import { useHistory, useParams } from 'react-router-dom';
import { Table, Container, Row, Col, Button } from 'react-bootstrap'
import { T13Event, Activity } from '../Models'
import './Table.css'

export const EventView = () => {
    const [event, setEvent] = useState<T13Event|null>(null);
    const [activities, setActivities] = useState<Activity[]>([]);

    const [error, setError] = useState('');
    const [htmlError, setHtmlError] = useState('');

    const { id }  = useParams();
    const history = useHistory();

    useEffect(() => {
        if (event === null)
            document.title = `T13 - Event id ${id}`
        else
            document.title = `T13 - ${event.name} - ${event.start_date}`
    }, [id, event]);

    useEffect(() => {
        const url = `/api/events?id=${id}`;
        fetch(url)
            .then(
                r => r.status === 200 ? r.json() : (setError(`${url}: HTTP ${r.status}: ${r.statusText}`), r.text()),
                r => r.json().then((json:any) => setError(json.toString()))
            ).then(json => {
                if (typeof json === 'string') {
                    setEvent(null);
                    setHtmlError(json);
                } else if (json !== undefined)
                    setEvent(json as T13Event);
                else
                    setEvent(null);
            });

        const url2 = `/api/activities?event_id=${id}`;
        fetch(url2)
            .then(
                r => r.status === 200 ? r.json() : (setError(`${url2}: HTTP ${r.status}: ${r.statusText}`), r.text()),
                r => r.json().then((json:any) => setError(json.toString()))
            ).then(json => {
                if (typeof json === 'string') {
                    setActivities([]);
                    setHtmlError(json);
                } else if (json !== undefined)
                    setActivities(json as Activity[]);
                else
                    setActivities([]);
            });

    }, [id]);

    if (error !== '')
        return (
            <Container>
                <h2>Hittar inte händelsen.</h2>
                <p>{error}</p>
                <div dangerouslySetInnerHTML={{ __html: htmlError}}/>
            </Container>
        )

    if (event === null)
        return <p>Laddar ...</p>

    const activityClick = (
        e: React.MouseEvent<HTMLTableRowElement, MouseEvent>, model:Activity) => {
            e.preventDefault();
            history.push(model.url())
        }

    const claimActivityClick = (
        e: React.MouseEvent<HTMLElement>, model:Activity) => {
            e.preventDefault();
            alert("yar");
        }

    const renderActivityRow = (model:Activity) => {
        const type = model.type !== null
            ? <a href={model.type.url()}>{model.type.name}</a>
            : null;

        const assigned = model.assigned !== null
            ? <a href={model.assigned.url()}>{model.assigned.fullname}</a>
            : <Button onClick={(e:React.MouseEvent<HTMLElement>) => claimActivityClick(e, model)}>Boka</Button>;

        return (
            <tr key={model.id} onClick={e => activityClick(e, model)}
                className='linked'>
                <td>{type}</td>
                <td>{model.name}</td>
                <td>{model.start_time} - {model.end_time}</td>
                <td>{assigned}</td>
            </tr>
        )}

    const eventType = event.type != null ? <h3>{event.type.name}</h3> : null;

    return (
        <Container>
            <Row>
                <Col md={12} lg={6}>
                    <h1>{event.name}</h1>
                    <h3>{event.start_date} - {event.end_date}</h3>
                    {eventType}
                    <p>{event.comment}</p>
                    <a href={`/admin/app/event/${id}/change/`}>
                        <Button>Editera</Button>
                    </a>
                </Col>
                <Col md={12} lg={6}>
                    <h2>Aktiviteter</h2>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Typ</th>
                                <th>Beskrivning</th>
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
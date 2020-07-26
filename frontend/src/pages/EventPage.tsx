import React, { useState, useEffect, useContext, useCallback } from "react"
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Button, Badge } from 'react-bootstrap'
import { deserialize } from "class-transformer";
import { PagedT13Events, T13Event, Member } from '../Models'
import { userContext } from "../components/UserContext";
import { MarkDown } from '../components/Utilities';
import { Attachments } from "../components/AttachmentComponent";
import { DataProvider } from "../components/DataProvider";
import { EventActivitiesTable } from "../components/EventActivitiesTable";

import '../components/Table.css'

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
                    <Col md={12} lg={4}>
                        <EventDetails event={event} />
                    </Col>
                    <Col md={12} lg={8}>
                        <EventActivitiesTable event={event} />
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
        {!user?.isStaff && event.coordinators.find(m => m.id !== user?.member?.id) ? null : 
            <>
                <Button href="export">Visa funktionärslista</Button>
                {' '}
                <Button href="export">Ladda funktionärslista (.CSV)</Button>
            </>
        }
    </>
}


export default EventPage;
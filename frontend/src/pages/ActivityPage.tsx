import { Activity, PagedActivities } from '../Models';
import React, { useState, useContext, useMemo, useCallback } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { ActivityTypeComponent } from "./ActivityTypePage";
import { useParams } from "react-router";
import { deserialize } from "class-transformer";
import DataProvider from "../components/DataProvider";
import { NotFound } from "../components/NotFound";
import { userContext } from "../components/UserContext";
import { MarkDown, HoverTooltip } from '../components/Utilities';
import { Attachments } from '../components/AttachmentComponent';
import { getJsonHeaders } from '../logic/ADRActions';

export const ActivityComponent = (props: { model?: Activity }) => {
    const { model } = props;

    if (!model)
        return null;

    const event = model.event !== null
        ? <h3>Händelse: <a href={model.event.url()}>{model.event.name}</a></h3>
        : null;

    const editComment = async () => {
        var comment = window.prompt("Uppdatera kommentaren:", model.comment);
        if (!comment) return;

        await fetch(model.apiUrl(),
        {
            method: 'PATCH',
            headers: getJsonHeaders(),
            body: JSON.stringify({
                comment: comment,
            })
        })
        .catch(e => alert("Något gick fel:\n\n" + e))
        .finally(() => window.location.reload());
    }

    return (
        <>
            <div className='div-group'>
                {event}
                <h5>Datum: {model.date()}</h5>
                {!model.time() ? null : <h5>Tid: {model.time()}</h5>}
                {model.earliest_bookable_date ?
                    <HoverTooltip tooltip="Den här uppgiften kan inte bokas förrän tidigast detta datum."
                        placement='bottom'>
                        <h5>
                            <>Bokningsbar från <u>{model.earliest_bookable_date.toLocaleDateString('sv-SE')}</u></>
                        </h5>
                    </HoverTooltip>
                    : null}
                <HoverTooltip tooltip="En uppgift kan räknas som fler eller färre än en, beroende på omfattning/ansvar."
                    placement='bottom'>
                    <h5>Värde: <b>{model.weight}</b></h5>
                </HoverTooltip>
                <h5>Tilldelad: {' '}
                    {!model.assigned
                        ? <Button variant='primary' href={model.event.url()} size='sm'>Boka?</Button>
                        : <a href={model.assigned.url()}>{model.assigned.fullname}</a>}
                </h5>
                <h5>Kommentar <Button variant='outline-secondary' onClick={editComment}>Editera</Button></h5>
                {model.comment ? <MarkDown source={model.comment} /> : <p>¯\_(ツ)_/¯</p>}
                <Attachments models={model.attachments} />
            </div>
        </>
    )
}

export const ActivityPage = () => {
    const { id } = useParams();
    const user = useContext(userContext);
    const [model, setModel] = useState<Activity | undefined>();
    const url = useMemo(() => id === undefined ? '' : Activity.apiUrlFromId(id), [id]);
    const ctorCallback = useCallback((json: string) => deserialize(PagedActivities, json), []);
    const setModelCallback = useCallback(data => setModel(data.results[0]), []);

    if (id === undefined || id === null)
        return <NotFound />

    const Title = () => {
        if (model === undefined)
            return null;

        return <>
            <div className='model-header'>
                <a href={model.url()}><h1>{model.name}</h1></a>
                {user.isStaff ?
                    <a href={model.adminUrl()}><Button variant='outline-secondary'>Editera</Button></a>
                    : null}
            </div>
            <hr />
        </>
    }

    return <Container>
        <DataProvider<PagedActivities>
            url={url}
            ctor={ctorCallback}
            onLoaded={setModelCallback}>
            <Row>
                <Col>
                    <Title />
                </Col>
            </Row>
            <Row>
                <Col md={12} lg={6}>
                    <ActivityComponent model={model} />
                </Col>
                <Col md={12} lg={6}>
                    <ActivityTypeComponent model={model?.type} />
                </Col>
            </Row>
        </DataProvider>
    </Container>
}

export default ActivityPage;
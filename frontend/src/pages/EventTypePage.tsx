import React, { useState, useContext, useCallback } from "react";
import { Container, Row, Col, Image, Button } from 'react-bootstrap'
import { T13EventType, PagedEventTypes } from "../Models";
import { deserialize } from "class-transformer";
import { useParams } from "react-router";
import DataProvider from "../components/DataProvider";
import NotFound from "../components/NotFound";
import { userContext } from "../components/UserContext";
import { MarkDown } from '../components/Utilities';
import { Attachments } from "../components/AttachmentComponent";



export const EventTypeComponent = (props: { model: T13EventType | null }) => {
    const { model } = props;
    const user = useContext(userContext);

    if (model === null)
        return null;

    return (<>
        <div className="model-header">
            <h1>{model.name}</h1>
            {user.isStaff ?
                <a href={model.adminUrl()}><Button variant='outline-secondary'>Editera</Button></a>
                : null}
        </div>
        <hr />
        <div className="div-group">
            <h4>Beskrivning</h4>
            <MarkDown source={model.description} />
            <Attachments models={model.attachments} />
        </div>
    </>)
}

export const EventTypePage = () => {
    const { id } = useParams();
    const [model, setModel] = useState<T13EventType | null>(null);
    const setModelCallback = useCallback((data: PagedEventTypes) => setModel(data.results[0]), []);

    if (id === undefined)
        return <NotFound />

    return (
        <Container>
            <Row>
                <Col sm={12} md={6}>
                    <DataProvider<PagedEventTypes>
                        ctor={t => deserialize(PagedEventTypes, t)}
                        onLoaded={setModelCallback}
                        url={T13EventType.apiUrl(id)}                    >
                        <EventTypeComponent model={model} />
                    </DataProvider>
                </Col>
                <Col sm={12} md={6}>
                    {model !== null ? <Image src={model.image} /> : null}
                </Col>
            </Row>
        </Container>
    )
}

export default EventTypePage;
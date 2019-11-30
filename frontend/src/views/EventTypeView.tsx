import React, { useState, useContext } from "react";
import { Container, Row, Col, Image, Button } from 'react-bootstrap'
import { T13EventType, PagedEventTypes } from "../Models";
import { deserialize } from "class-transformer";
import { useParams } from "react-router";
import DataProvider from "../components/DataProvider";
import NotFound from "../components/NotFound";
import { userContext } from "../App";

export const EventTypeComponent = (model: T13EventType | null) => {
    const user = useContext(userContext);

    if (model === null)
        return null;

    return (<>
        <div className="model-header">
            <h1>{model.name}</h1>
            {user.isStaff ?
                <a href={model.adminUrl()}><Button variant='secondary'>Editera</Button></a>
                : null}
        </div>
        <hr />
        <h4>Beskrivning:</h4>
        <p>{model.description}</p>
    </>)
}

export const EventTypeView = () => {
    const { id } = useParams();
    const [model, setModel] = useState<T13EventType | null>(null);

    if (id === undefined)
        return <NotFound />

    return (
        <Container>
            <Row>
                <Col sm={12} md={6}>
                    <DataProvider<PagedEventTypes>
                        ctor={t => deserialize(PagedEventTypes, t)}
                        onLoaded={x => setModel(x.results[0])}
                        endpoint={T13EventType.apiUrl(id)}
                    >
                        {model === null ? null :
                            <EventTypeComponent {...model} />
                        }
                    </DataProvider>
                </Col>
                <Col sm={12} md={6}>
                    {model !== null ? <Image src={model.image}/> : null}
                </Col>
            </Row>
        </Container>
    )
}

export default EventTypeView;
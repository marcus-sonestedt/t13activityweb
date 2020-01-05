import React, { useState, useContext, useCallback } from "react"
import { Container, Row, Col, Image, Button } from "react-bootstrap"
import { useParams } from "react-router";
import { deserialize } from "class-transformer";

import { ActivityType, PagedActivityTypes } from "../Models"
import DataProvider from "../components/DataProvider";
import NotFound from "../components/NotFound";
import { userContext } from "../components/UserContext";
import { MarkDown } from '../components/Utilities';

export const ActivityTypeComponent = (props: { model: ActivityType | null }) => {
    const user = useContext(userContext);
    const { model } = props;

    if (model == null)
        return null

    return (<>
        <div className="model-header">
            <a href={model.url()}><h2>{model.name}</h2></a>
            {user.isStaff ?
                <a href={model.adminUrl()}><Button variant='secondary'>Editera</Button></a>
                : null}
        </div>
        <hr />
        <div className="div-group">
            <h4>Beskrivning:</h4>
            <MarkDown source={model.description}/>
        </div>
    </>)
}

export const ActivityTypePage = () => {
    const { id } = useParams();
    const [model, setModel] = useState<ActivityType | null>(null);
    const setModelCallback = useCallback(x => setModel(x.results[0]), []);

    if (id === undefined)
        return <NotFound />


    return <Container>
        <Row>
            <Col md={12} lg={8}>
                <DataProvider<PagedActivityTypes>
                    ctor={json => deserialize(PagedActivityTypes, json)}
                    url={ActivityType.apiUrl(id)}
                    onLoaded={setModelCallback}>
                    <ActivityTypeComponent model={model} />
                </DataProvider>
            </Col>
            <Col md={12} lg={4}>
                {model !== null ? <Image src={model.image} /> : null}
            </Col>
        </Row>
    </Container>
}

export default [ActivityTypePage, ActivityTypeComponent];

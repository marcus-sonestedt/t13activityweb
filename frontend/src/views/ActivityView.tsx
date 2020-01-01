import { Activity, PagedActivities } from "../Models";
import React, { useState, useContext, useMemo, useCallback } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { ActivityTypeComponent } from "./ActivityTypeView";
import { useParams } from "react-router";
import { deserialize } from "class-transformer";
import DataProvider from "../components/DataProvider";
import { NotFound } from "../components/NotFound";
import { userContext } from "../App";

export const ActivityComponent = (props: { model: Activity | null }) => {
    const { model } = props;
    const user = useContext(userContext);

    if (model === null)
        return null;

    const event = model.event !== null
        ? <h3>Händelse: <a href={model.event.url()}>{model.event.name}</a></h3>
        : null;

    return (
        <>
            <div className='model-header'>
                <a href={model.url()}><h1>{model.name}</h1></a>
                {user.isStaff ?
                    <a href={model.adminUrl()}><Button variant='secondary'>Editera</Button></a>
                    : null}
            </div>
            <hr />
            {event}
            <h5>Datum: {model.date()}</h5>
            <h4>Tid: {model.time()}</h4>
            <p>{model.comment}</p>
        </>
    )
}

export const ActivityView = () => {
    const { id } = useParams();
    const [model, setModel] = useState<Activity | null>(null);
    const url = useMemo(() => id === undefined ? '' : Activity.apiUrlFromId(id), [id]);
    const ctorCallback = useCallback((json: string) => deserialize(PagedActivities, json), []);
    const setModelCallback = useCallback(data => setModel(data.results[0]), []);

    if (id === undefined || id === null)
        return <NotFound />

    return <Container>
        <Row>
            <DataProvider<PagedActivities>
                url={url}
                ctor={ctorCallback}
                onLoaded={setModelCallback}>
                <Col md={12} lg={6}>
                    <ActivityComponent model={model} />
                </Col>
                <Col md={12} lg={6}>
                    <ActivityTypeComponent model={model?.type ?? null} />
                </Col>
            </DataProvider>
        </Row>
    </Container>

}

export default ActivityView;
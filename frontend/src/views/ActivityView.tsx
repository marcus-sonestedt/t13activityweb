import { Activity, PagedActivities } from "../Models";
import React, { useState, useContext } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { ActivityTypeComponent } from "./ActivityTypeView";
import { useParams } from "react-router";
import { deserialize } from "class-transformer";
import DataProvider from "../components/DataProvider";
import { NotFound } from "../components/NotFound";
import { userContext } from "../App";

export const ActivityComponent = (model: Activity | null) => {
    const user = useContext(userContext);

    if (model === null)
        return null;

    const event = model.event !== null
        ? <h3>Händelse: <a href={"../" + model.event.url()}>{model.event.name}</a></h3>
        : null;

    let time = model.start_time === null ? ''
        : model.start_time;

    if (model.end_time !== null)
        time += " - " + model.end_time;

    return (
        <>
            <div className='model-header'>
                <a href={"../" + model.url()}><h1>{model.name}</h1></a>
                {user.isStaff ?
                <a href={model.adminUrl()}><Button variant='secondary'>Editera</Button></a>
                : null}
            </div>
            <hr />
            {event}
            <h5>Datum: {model.date}</h5>
            <h4>Tid: {time}</h4>
            <p>{model.comment}</p>
        </>
    )
}

export const ActivityView = () => {
    const { id } = useParams();
    const [model, setModel] = useState<Activity | null>(null);

    if (id === undefined)
        return <NotFound />

    return (
        <Container>
            <DataProvider<PagedActivities>
                endpoint={Activity.apiUrl(id)}
                ctor={t => deserialize(PagedActivities, t)}
                onLoaded={x => setModel(x.results[0])}>
                {model === null ? null :
                    <Row>
                        <Col>
                            <ActivityComponent {...model} />
                        </Col>
                        <Col>
                            {model.type !== null
                                ? <ActivityTypeComponent {...model.type} />
                                : null}
                        </Col>
                    </Row>
                }
            </DataProvider>
        </Container>
    )
}

export default ActivityView;
import { Activity, PagedActivities } from '../Models';
import React, { useState, useContext, useMemo, useCallback } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { ActivityTypeComponent } from "./ActivityTypePage";
import { useParams } from "react-router";
import { deserialize } from "class-transformer";
import DataProvider from "../components/DataProvider";
import { NotFound } from "../components/NotFound";
import { userContext } from "../components/UserContext";
import { MarkDown } from "../components/Utilities";

export const ActivityComponent = (props: { model?: Activity }) => {
    const { model } = props;

    if (model === undefined)
        return null;

    const event = model.event !== null
        ? <h3>Händelse: <a href={model.event.url()}>{model.event.name}</a></h3>
        : null;

    return (
        <>
            <div className='div-group'>
                {event}
                <h5>Datum {model.date()} Tid {model.time()}</h5>
                {model.earliest_bookable_date
                    ?
                    <h5>Bokningsbar från {model.earliest_bookable_date}</h5>
                    : null
                }
                {!model.assigned ? null : <>
                    <h5>Tilldelad {' '}
                        <a href={model.assigned.url()}>{model.assigned.fullname}</a>
                    </h5>
                </>}
                <h5>Information</h5>
                <MarkDown source={model.comment} />
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
                    <a href={model.adminUrl()}><Button variant='secondary'>Editera</Button></a>
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
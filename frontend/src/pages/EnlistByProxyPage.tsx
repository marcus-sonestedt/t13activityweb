import React, { useState, useCallback } from "react";
import { useParams } from 'react-router-dom';
import { Container, Row, Col } from "react-bootstrap";
import { deserialize } from 'class-transformer';

import { PagedActivities, Activity } from '../Models';
import DataProvider from "../components/DataProvider";
import NotFound from "../components/NotFound";
import { ActivityComponent } from './ActivityPage';
import { MyProxiesTable } from "../components/ProxiesTable";

export const EnlistByProxyPage = () => {
    const { activityId } = useParams();
    const [activity, setActivity] = useState<Activity>();
    const setActivityCallback = useCallback(data => setActivity(data.results[0]), []);

    if (!activityId) {
        return <NotFound />
    }

    return <Container>
        <Row>
            <Col sm={12} md={6}>
                <DataProvider<PagedActivities>
                    url={Activity.apiUrlFromId(activityId)}
                    ctor={json => deserialize(PagedActivities, json)}
                    onLoaded={setActivityCallback}>
                    <ActivityComponent model={activity} />
                </DataProvider>
            </Col>
            <Col sm={12} md={6}>
                <MyProxiesTable activity={activity}/>
            </Col>
        </Row>
    </Container>
}


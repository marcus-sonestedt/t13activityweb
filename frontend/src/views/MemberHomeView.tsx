import React, { useState } from "react";
import { Container, Row, Col } from 'react-bootstrap'
import { deserialize } from "class-transformer";
import { Activity, PagedT13Events, PagedActivities } from '../Models'
import { MyActivitiesTable } from '../components/MyActivitiesTable'
import { UpcomingEventsTable } from '../components/UpcomingEventsTable'
import { DataProvider } from '../components/DataProvider'
import { useHistory } from "react-router";



export const MemberHomeView = () => {
    const [myActivities, setMyActivities] = useState(new PagedActivities());
    const [events, setEvents] = useState(new PagedT13Events());
    const history = useHistory();

    const handleActivitySelect = (model: Activity) => {
        history.push(model.url())
    }

    return (
        <Container fluid >
            <Row>
                <Col sm={12} lg={6}>
                    <DataProvider< PagedActivities >
                        ctor={t => deserialize(PagedActivities, t)}
                        endpoint={"/api/myactivities"}
                        onLoaded={setMyActivities}>
                        <MyActivitiesTable
                            values={myActivities.results}
                            onRowClick={handleActivitySelect}
                        />
                    </DataProvider>
                </Col>
                <Col sm={12} lg={6}>
                    <DataProvider< PagedT13Events >
                        ctor={t => deserialize(PagedT13Events, t)}
                        endpoint={"/api/events"}
                        onLoaded={setEvents}>
                        <UpcomingEventsTable events={events} />
                    </DataProvider>
                </Col>
            </Row>
        </Container>
    );
}

export default MemberHomeView;

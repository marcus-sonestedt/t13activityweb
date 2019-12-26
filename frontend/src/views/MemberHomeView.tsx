import React, { useState, useCallback } from "react";
import { Container, Row, Col, Pagination } from 'react-bootstrap'
import { deserialize } from "class-transformer";
import { PagedT13Events, PagedActivities } from '../Models'
import { MyActivitiesTable } from '../components/MyActivitiesTable'
import { UpcomingEventsTable } from '../components/UpcomingEventsTable'
import { DataProvider } from '../components/DataProvider'

export const pageItems = (count: number, pagesize: number,
    currentPage: number, setFunc: ((page: number) => void)) => {

    const numPages = Math.ceil(count / pagesize)

    if (count <= pagesize)
        return null;

    const pageNumbers = Array.from(Array(numPages).keys())
        .map(i => i + 1)

    return pageNumbers.map(i =>
        <Pagination.Item key={i} active={i === currentPage}
            onClick={() => setFunc(i)}>
            {i}
        </Pagination.Item>)
}


export const MemberHomeView = () => {
    const [activities, setActivities] = useState(new PagedActivities());
    const [activitiesPage, setActivitiesPage] = useState(1);

    const [events, setEvents] = useState(new PagedT13Events());
    const [eventPage, setEventPage] = useState(1);
    const [reload, setReload] = useState(1);

    const incReload = () => setReload(reload + 1);
    const setActivitiesReload = useCallback((data: PagedActivities) => {
        if (reload > 0)
            setActivities(data);
    }, [reload]);

    const setEventsReload = useCallback((data: PagedT13Events) => {
        if (reload > 0)
            setEvents(data);
    }, [reload]);

    return (
        <Container fluid >
            <Row>
                <Col md={12} lg={6}>
                    <DataProvider< PagedActivities >
                        ctor={t => deserialize(PagedActivities, t)}
                        url={`/api/myactivities?page=${activitiesPage}`}
                        onLoaded={setActivitiesReload}>
                        <MyActivitiesTable
                            values={activities.results}
                            reload={incReload}
                        />
                        <Pagination>
                            {pageItems(activities.count, 10, activitiesPage, setActivitiesPage)}
                        </Pagination>
                    </DataProvider>
                </Col>
                <Col md={12} lg={6}>
                    <DataProvider< PagedT13Events >
                        ctor={t => deserialize(PagedT13Events, t)}
                        url={`/api/events?page=${eventPage}`}
                        onLoaded={setEventsReload}>
                        <UpcomingEventsTable events={events} />
                        <Pagination>
                            {pageItems(events.count, 10, eventPage, setEventPage)}
                        </Pagination>
                    </DataProvider>
                </Col>
            </Row>
        </Container>
    );
}

export default MemberHomeView;

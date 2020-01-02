import React, { useState, useCallback } from "react";
import { Container, Row, Col, Pagination } from 'react-bootstrap'
import { deserialize } from "class-transformer";
import { PagedT13Events, PagedActivities } from '../Models'
import { MyActivitiesTable } from '../components/MyActivitiesTable'
import { UpcomingEvents } from '../components/UpcomingEvents'
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


export const MyActiviesPage = () => {
    const [activities, setActivities] = useState(new PagedActivities());
    const [activitiesPage, setActivitiesPage] = useState(1);

    const [events, setEvents] = useState(new PagedT13Events());
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

    const ACTIVITIES_PAGE_SIZE = 10;

    return (
        <Container fluid >
            <Row>
                <Col md={12} lg={6}>
                    <DataProvider< PagedActivities >
                        ctor={t => deserialize(PagedActivities, t)}
                        url={`/api/myactivities?page=${activitiesPage}&page_size=${ACTIVITIES_PAGE_SIZE}`}
                        onLoaded={setActivitiesReload}>
                        <MyActivitiesTable
                            values={activities.results}
                            reload={incReload}
                        />
                        <Pagination>
                            {pageItems(activities.count, ACTIVITIES_PAGE_SIZE, activitiesPage, setActivitiesPage)}
                        </Pagination>
                    </DataProvider>
                </Col>
                <Col md={12} lg={6}>
                    <DataProvider< PagedT13Events >
                        ctor={t => deserialize(PagedT13Events, t)}
                        url={`/api/events?page_size=100`}
                        onLoaded={setEventsReload}>
                        <UpcomingEvents events={events} />
                    </DataProvider>
                </Col>
            </Row>
        </Container>
    );
}

export default MyActiviesPage;

import React, { useState } from "react";
import { Container, Row, Col, Pagination } from 'react-bootstrap'
import { deserialize } from "class-transformer";
import { PagedT13Events, PagedActivities } from '../Models'
import { MyActivitiesTable } from '../components/MyActivitiesTable'
import { UpcomingEventsTable } from '../components/UpcomingEventsTable'
import { DataProvider } from '../components/DataProvider'



export const MemberHomeView = () => {
    const [activities, setActivities] = useState(new PagedActivities());
    const [activitiesPage, setActivitiesPage] = useState(1);

    const [events, setEvents] = useState(new PagedT13Events());
    const [eventPage, setEventPage] = useState(1);

    const pageItems = (count: number, pagesize: number,
        currentPage: number, setFunc: ((page: number) => void)) => {

        const numPages = Math.floor(count / pagesize)
        const pageNumbers = Array.from(Array(numPages).keys())
            .map(i => i + 1)

        return pageNumbers.map(i =>
            <Pagination.Item key={i} active={i === currentPage}
                onClick={() => setFunc(i)}>
                {i}
            </Pagination.Item>)
    }

    return (
        <Container fluid >
            <Row>
                <Col md={12} lg={6}>
                    <DataProvider< PagedActivities >
                        ctor={t => deserialize(PagedActivities, t)}
                        url={`/api/myactivities?page=${activitiesPage}`}
                        onLoaded={setActivities}>
                        <MyActivitiesTable
                            values={activities.results}
                        />
                        <Pagination>
                            {pageItems(activities.count, 15, activitiesPage, setActivitiesPage)}
                        </Pagination>
                    </DataProvider>
                </Col>
                <Col md={12} lg={6}>
                    <DataProvider< PagedT13Events >
                        ctor={t => deserialize(PagedT13Events, t)}
                        url={`/api/events?page=${eventPage}`}
                        onLoaded={setEvents}>
                        <UpcomingEventsTable events={events} />
                        <Pagination>
                            {pageItems(events.count, 15, eventPage, setEventPage)}
                        </Pagination>
                    </DataProvider>
                </Col>
            </Row>
        </Container>
    );
}

export default MemberHomeView;

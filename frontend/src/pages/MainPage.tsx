import { Tab, Row, Col, Nav, Pagination, Badge } from "react-bootstrap"
import React, { useState, useCallback, useContext } from "react";
import { PagedActivities, PagedT13Events } from "../Models";
import DataProvider from "../components/DataProvider";
import { deserialize } from "class-transformer";
import { MyActivitiesTable } from "../components/MyActivitiesTable";
import { PageItems, HoverTooltip } from "../components/Utilities";
import UpcomingEvents from "../components/UpcomingEvents";
import { userContext } from "../components/UserContext";

export const MainPage = () => {
    const user = useContext(userContext);

    return <Tab.Container defaultActiveKey="overview">
        <Row>
            <Col sm={2}>
                <Nav variant="pills" className="flex-column">
                    <Nav.Item>
                        <Nav.Link eventKey="overview">Översikt</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="my-tasks">Mina uppgifter</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="upcoming-events">Kommade händelser</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="adrs">
                            Avbokningar
                            <span className='spacer' />
                            <HoverTooltip tooltip={
                                "Första siffran är antal av dina egna förfrågningar. \n" +
                                "Den andra är totalt antal obesvarade från alla medlemmar."
                            }>
                                <Badge variant='secondary'>
                                    {user.myDelistRequests}
                                    {!user.isStaff ? null : ` / ${user.unansweredDelistRequests}`}
                                </Badge>
                            </HoverTooltip>
                        </Nav.Link>
                    </Nav.Item>
                </Nav>
            </Col>
            <Col sm={1} />
            <Col sm={8}>
                <Tab.Content>
                    <Tab.Pane eventKey="overview">
                        <OverviewTab />
                    </Tab.Pane>
                    <Tab.Pane eventKey="my-tasks">
                        <MyTasksTab />
                    </Tab.Pane>
                    <Tab.Pane eventKey="upcoming-events">
                        <UpcomingEventsTab />
                    </Tab.Pane>
                    <Tab.Pane eventKey="upcoming-events">
                        <DelistRequestsTab />
                    </Tab.Pane>
                </Tab.Content>
            </Col>
        </Row>
    </Tab.Container>
}

const OverviewTab = () => {
    return <p>Vroom</p>
}

const MyTasksTab = () => {
    const [activities, setActivities] = useState(new PagedActivities());
    const [activitiesPage, setActivitiesPage] = useState(1);
    const [reload, setReload] = useState(1);

    const incReload = () => setReload(reload + 1);

    const setActivitiesReload = useCallback((data: PagedActivities) => {
        if (reload > 0)
            setActivities(data);
    }, [reload]);

    const ACTIVITIES_PAGE_SIZE = 10;

    return <DataProvider< PagedActivities >
        ctor={t => deserialize(PagedActivities, t)}
        url={`/api/myactivities?page=${activitiesPage}&page_size=${ACTIVITIES_PAGE_SIZE}`}
        onLoaded={setActivitiesReload}>
        <MyActivitiesTable
            values={activities.results}
            reload={incReload}
        />
        <Pagination>
            <PageItems count={activities.count}
                pageSize={ACTIVITIES_PAGE_SIZE}
                currentPage={activitiesPage}
                setFunc={setActivitiesPage} />
        </Pagination>
    </DataProvider>

}

const UpcomingEventsTab = () => {
    const [events, setEvents] = useState(new PagedT13Events());
    const EVENTS_PAGE_SIZE = 100;

    return <DataProvider< PagedT13Events >
        ctor={t => deserialize(PagedT13Events, t)}
        url={`/api/events?page_size=${EVENTS_PAGE_SIZE}`}
        onLoaded={setEvents}>
        <UpcomingEvents events={events} />
    </DataProvider>
}

const DelistRequestsTab = () => { return <p>todo</p> }
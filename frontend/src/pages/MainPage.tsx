import { Tab, Row, Col, Nav, Pagination, Badge, NavDropdown } from "react-bootstrap"
import React, { useState, useCallback, useContext } from "react";
import { useParams } from "react-router-dom";
import { deserialize } from "class-transformer";

import { PagedActivities, PagedT13Events } from "../Models";
import DataProvider from "../components/DataProvider";
import { MyActivitiesTable } from "../components/MyActivitiesTable";
import { PageItems, HoverTooltip } from "../components/Utilities";
import UpcomingEvents from "../components/UpcomingEvents";
import { userContext } from "../components/UserContext";
import { TaskTypesComponent } from "./ActivityTypesPage";
import { EventTypesComponent } from "./EventTypesPage";
import { ActivityDelistRequestsComponent } from "./ADRPage";

export const MainPage = () => {
    const { page } = useParams();

    const user = useContext(userContext);

    return <Tab.Container defaultActiveKey={page ?? 'overview'}>
        <Row>
            <Col md='auto'>
                <Nav variant="pills" className="flex-column">
                    <Nav.Item>
                        <Nav.Link eventKey="overview">Översikt</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="my-tasks">Uppgifter</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="my-adrs">
                            Avbokningar
                            <span className='spacer' />
                            <HoverTooltip tooltip={
                                "Antal obehandlade egna förfrågningar\n" +
                                (user.isStaff ? "respektive antal obehandlade från alla medlemmar." : '')}>
                                <Badge variant='secondary'>
                                    {user.myDelistRequests}
                                    {!user.isStaff ? null : ` / ${user.unansweredDelistRequests}`}
                                </Badge>
                            </HoverTooltip>
                        </Nav.Link>
                    </Nav.Item>
                    <NavDropdown.Divider />
                    <Nav.Item>
                        <Nav.Link eventKey="upcoming-events">Kommade händelser</Nav.Link>
                    </Nav.Item>
                    <NavDropdown.Divider />
                    <Nav.Item>
                        <Nav.Link eventKey="event-types">Aktivitetstyper</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="task-types">Uppgiftstyper</Nav.Link>
                    </Nav.Item>
                </Nav>
            </Col>
            <Col sm={0} md={1} />
            <Col sm={11} md={9}>
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
                    <Tab.Pane eventKey="my-adrs">
                        <ActivityDelistRequestsComponent />
                    </Tab.Pane>
                    <Tab.Pane eventKey="event-types">
                        <EventTypesComponent />
                    </Tab.Pane>
                    <Tab.Pane eventKey="task-types">
                        <TaskTypesComponent />
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


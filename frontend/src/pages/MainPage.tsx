import { Tab, Row, Col, Nav, Pagination, Badge, NavDropdown, Jumbotron } from "react-bootstrap"
import React, { useState, useCallback, useContext } from "react";
import { deserialize } from "class-transformer";

import { PagedActivities, PagedT13Events } from "../Models";
import DataProvider from "../components/DataProvider";
import { MyActivitiesTable } from "../components/MyActivitiesTable";
import { PageItems, HoverTooltip, ErrorBoundary, InfoText } from "../components/Utilities";
import EventsComponent from "../components/Events";
import { userContext } from "../components/UserContext";
import { ActivityDelistRequestsComponent } from "./ADRPage";
import { NotificationsComponent } from "./NotificationsPage";
import { useHistory } from "react-router-dom";

export const MainPage = () => {
    const tabMatch = window.location.search.match(/[?&]tab=([a-z-]+)/);
    const tab = tabMatch ? tabMatch[1] : 'overview';

    const user = useContext(userContext);
    const history = useHistory();
    const setQueryPage = (key: string) => {
        history.replace(`?tab=${key}`);
    }

    const taskBadgeVariant = user.bookedTasks >= user.minSignups ? 'success': 'warning';

    const taskBadgeText = `${user.completedTasks} / ${user.bookedTasks}`

    return <Tab.Container defaultActiveKey={tab}
        onSelect={setQueryPage}>
        <Row>
            <Col md='auto'>
                <Nav variant="pills" className="flex-column">
                    <Nav.Item>
                        <Nav.Link eventKey="overview">
                            Översikt
                            <span className='spacer' />
                            <HoverTooltip tooltip='Olästa notifieringar'>
                                <Badge variant={user.notifications.length ? 'info' : 'secondary'}>
                                    {user.notifications.length}
                                </Badge>
                            </HoverTooltip>
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="my-tasks">Uppgifter
                        <span className='spacer' />
                            <HoverTooltip tooltip={'Antal utförda/bokade uppgifter detta år'}>
                                <Badge variant={taskBadgeVariant}>
                                    {taskBadgeText}
                                </Badge>
                            </HoverTooltip>
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="my-adrs">
                            Avbokningar
                            <span className='spacer' />
                            <HoverTooltip tooltip={
                                "Antal obehandlade egna förfrågningar\n" +
                                (user.isStaff ? "respektive antal obehandlade från alla medlemmar." : '')}>
                                <Badge variant={(user.myDelistRequests ||
                                    user.unansweredDelistRequests) ? 'info' : 'secondary'}>
                                    {user.myDelistRequests}
                                    {!user.isStaff ? null : ` / ${user.unansweredDelistRequests}`}
                                </Badge>
                            </HoverTooltip>
                        </Nav.Link>
                    </Nav.Item>
                    <NavDropdown.Divider />
                    <Nav.Item>
                        <Nav.Link eventKey="upcoming-events">Aktivitetskalender</Nav.Link>
                    </Nav.Item>
                    <NavDropdown.Divider />
                </Nav>
            </Col>
            <Col sm={12} md={10}>
                <ErrorBoundary>
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
                    </Tab.Content>
                </ErrorBoundary>
            </Col>
        </Row>
    </Tab.Container >
}

const OverviewTab = () => {
    const user = useContext(userContext);
    return <Row>
        <Col>
            <Jumbotron>
                <InfoText textKey='overview' />
            </Jumbotron>
            <h4>Meddelanden</h4>
            {!user.notifications.length
                ? <p>Inga olästa notiser</p>
                : <NotificationsComponent />}
        </Col>
    </Row>


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
    const EVENTS_PAGE_SIZE = 150; // ~100-120 events/year typically

    return <DataProvider< PagedT13Events >
        ctor={t => deserialize(PagedT13Events, t)}
        url={`/api/events?page_size=${EVENTS_PAGE_SIZE}`}
        onLoaded={setEvents}>
        <EventsComponent events={events} title='Aktiviteter' />
    </DataProvider>
}


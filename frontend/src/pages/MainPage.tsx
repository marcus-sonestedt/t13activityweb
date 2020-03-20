import { Tab, Row, Col, Nav, Badge, NavDropdown, Jumbotron, Alert } from "react-bootstrap"
import React, { useState, useContext } from "react";
import { deserialize } from "class-transformer";

import { PagedT13Events } from "../Models";
import DataProvider from "../components/DataProvider";
import { HoverTooltip, ErrorBoundary, InfoText } from "../components/Utilities";
import EventsComponent from "../components/Events";
import { userContext } from "../components/UserContext";
import { ActivityDelistRequestsComponent } from "./ADRPage";
import { NotificationsComponent } from "./NotificationsPage";
import { useHistory } from "react-router-dom";
import { MemberActivitiesTable } from "../components/MemberActivitiesTable";

export const MainPage = () => {
    const tabMatch = window.location.search.match(/[?&]tab=([a-z-]+)/);
    const tab = tabMatch ? tabMatch[1] : 'overview';
    const user = useContext(userContext);
    const history = useHistory();
    const setQueryTab = (key: string) => { history.replace(`?tab=${key}`); }
    const taskBadgeVariant = user.bookedWeight >= user.minSignups ? 'success' : 'warning';
    const taskBadgeText = `${user.completedWeight} / ${user.bookedWeight} / ${user.minSignups}`
    const verified = user.member?.email_verified && user.member?.phone_verified;

    return <Tab.Container defaultActiveKey={tab}
        onSelect={setQueryTab}>
        <Row>
            <Col md='auto'>
                <Nav variant="pills" className="flex-column">
                    <Nav.Item>
                        <Nav.Link eventKey="overview">
                            Översikt
                            {' '}
                            <HoverTooltip tooltip='Olästa notifieringar'>
                                <Badge variant={user.notifications.length ? 'info' : 'secondary'}>
                                    {user.notifications.length}
                                </Badge>
                            </HoverTooltip>
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="my-tasks">Uppgifter
                        {' '}
                            <HoverTooltip tooltip={'Antal utförda, bokade & minsta antal uppgifter detta år'}>
                                <Badge variant={taskBadgeVariant}>
                                    {taskBadgeText}
                                </Badge>
                            </HoverTooltip>
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="my-adrs">
                            Avbokningar
                            {' '}
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
                </Nav>
            </Col>
            <Col sm={12} md={10}>
                <ErrorBoundary>
                    <Tab.Content>
                        <Tab.Pane eventKey="overview">
                            <OverviewTab />
                        </Tab.Pane>
                        <Tab.Pane eventKey="my-tasks">
                            {verified ? <MemberActivitiesTable memberId={user.memberId} /> : <UnverifiedNotice />}
                        </Tab.Pane>
                        <Tab.Pane eventKey="upcoming-events">
                            {verified ? <UpcomingEventsTab /> : <UnverifiedNotice />}
                        </Tab.Pane>
                        <Tab.Pane eventKey="my-adrs">
                            {verified ? <ActivityDelistRequestsComponent /> : <UnverifiedNotice />}
                        </Tab.Pane>
                    </Tab.Content>
                </ErrorBoundary>
            </Col>
        </Row>
    </Tab.Container >
}

const UnverifiedNotice = () => 
{
    return <Alert variant='warning'>
        Du måste verifera både din email-address och ditt telefonnummer
        innan du kan boka något!
    </Alert>
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

const UpcomingEventsTab = () => {
    const [events, setEvents] = useState(new PagedT13Events());

    const EVENTS_PAGE_SIZE = 150; // ~100-120 events/year typically

    return <DataProvider< PagedT13Events >
        ctor={t => deserialize(PagedT13Events, t)}
        url={`/api/events?page_size=${EVENTS_PAGE_SIZE}`}
        onLoaded={setEvents}>
        <EventsComponent events={events} title='Aktiviteter'
            showBookableStatus={true} />
    </DataProvider>
}


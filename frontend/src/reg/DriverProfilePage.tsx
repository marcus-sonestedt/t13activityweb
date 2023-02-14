import { Tab, Row, Col, Nav, Badge, Jumbotron, Alert, Container } from "react-bootstrap"
import React, { useState, useContext } from "react";
import { deserialize } from "class-transformer";

import DataProvider from "../components/DataProvider";
import { EditProfilePage } from "../pages/EditProfilePage"
import { HoverTooltip, ErrorBoundary, InfoText } from "../components/Utilities";
import { userContext } from "../components/UserContext";
import { NotificationsPage } from "../pages/NotificationsPage";
import { useHistory } from "react-router-dom";

export const DriverProfilePage = () => {
    const tabMatch = window.location.search.match(/[?&]tab=([a-z-]+)/);
    const tab = tabMatch ? tabMatch[1] : 'overview';
    const user = useContext(userContext);
    const history = useHistory();
    const setQueryTab = (key: string | null) => { history.replace(`?tab=${key}`); }
    const verified = (user.member?.email_verified && user.member?.phone_verified) ?? false;

    return <Tab.Container defaultActiveKey={tab}
        onSelect={setQueryTab}>
        <Row>
            <Col md='1'>
                <Nav variant="pills" className="flex-column">
                    <Nav.Item>
                        <Nav.Link eventKey="overview">
                            Översikt
                            <br />
                            <HoverTooltip tooltip='Olästa notifieringar'>
                                <Badge variant={user.notifications.length ? 'info' : 'secondary'}>
                                    {user.notifications.length}
                                </Badge>
                            </HoverTooltip>
                        </Nav.Link>
                    </Nav.Item>
                </Nav>
            </Col>
            <Col sm={12} md={11}>
                <ErrorBoundary>
                    <Tab.Content>
                        <Tab.Pane eventKey="overview">
                            <OverviewTab verified={verified} />
                        </Tab.Pane>
                    </Tab.Content>
                </ErrorBoundary>
            </Col>
        </Row>
    </Tab.Container >
}

const UnverifiedNotice = () => {
    return <Alert variant='warning'>
        Du måste verifera din email-address innan du kan boka något!
    </Alert>
}

const OverviewTab = (props: { verified: boolean }) => {
    const user = useContext(userContext);
    return <Container fluid>
        <Row>
            <Col lg={7} md={12}>
                {props.verified ? <EditProfilePage /> : <UnverifiedNotice />}
                {!user.notifications.length
                    ? <p>Inga olästa notiser</p>
                    : <NotificationsPage />}
            </Col>
            <Col lg={5} md={12}>
                <Jumbotron>
                    <InfoText textKey='overview' />
                </Jumbotron>
            </Col>
        </Row>
    </Container>
}

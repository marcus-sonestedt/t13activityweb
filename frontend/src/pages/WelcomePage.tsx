import React, { useState, useContext } from "react";
import { Container, Row, Col, Jumbotron, Image, Button } from 'react-bootstrap'
import { UpcomingEvents } from "../components/UpcomingEvents";
import DataProvider from "../components/DataProvider";
import { PagedT13Events } from "../Models";
import { deserialize } from "class-transformer";
import { userContext } from "../components/UserContext";
import './WelcomePage.css'
import { MarkDown, InfoText } from "../components/Utilities";

export const WelcomePage = () => {
    const [events, setEvents] = useState(new PagedT13Events());
    const user = useContext(userContext);

    if (user.isLoggedIn)
        return null;

    return (
        <Container fluid>
            <Row className="welcome">
                <Col md={12} lg={6}>
                    <Jumbotron>
                        <InfoText textKey='welcome' />
                        <br/>
                        <div style={{ textAlign: 'center' }}>
                            <Image src='/static/t13logo.jpg' className="App-logo" alt="team13 logo" fluid />
                        </div>
                        <div className="buttonContainer">
                            <a href="/app/login/">
                                <Button size='lg'>Logga in</Button>
                            </a>
                            <span className="spacer">&nbsp;</span>
                            <a href="/app/signup">
                                <Button size='lg'>Registrera konto</Button>
                            </a>
                        </div>
                    </Jumbotron>
                </Col>
                <Col md={12} lg={6}>
                    <DataProvider< PagedT13Events >
                        ctor={t => deserialize(PagedT13Events, t)}
                        url={"/api/events/upcoming?page_size=50"}
                        onLoaded={setEvents}>
                        <UpcomingEvents events={events}
                            title="Kommande aktiviteter" />
                    </DataProvider>
                </Col>
            </Row>
        </Container>
    );
}

export default WelcomePage;
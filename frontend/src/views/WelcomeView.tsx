import React, { useState, useContext } from "react";
import { Container, Row, Col, Jumbotron, Image, Button } from 'react-bootstrap'
import { UpcomingEventsTable } from "../components/UpcomingEventsTable";
import DataProvider from "../components/DataProvider";
import { PagedT13Events } from "../Models";
import { deserialize } from "class-transformer";
import './WelcomeView.css'
import { userContext } from "../App";

export const Welcome = () => {
    const [events, setEvents] = useState(new PagedT13Events());
    const user = useContext(userContext);

    if (user.isLoggedIn)
        return null;

    return (
        <Container>
            <Row className="welcome">
                <Col md={12} lg={6}>
                    <Jumbotron>
                        <WelcomeText />
                        <Image src='/static/t13logo.jpg' className="App-logo" alt="team13 logo" />
                    </Jumbotron>
                </Col>
                <Col md={12} lg={6}>
                    <DataProvider< PagedT13Events >
                        ctor={t => deserialize(PagedT13Events, t)}
                        endpoint={"/api/upcomingevents"}
                        onLoaded={setEvents}>
                        <UpcomingEventsTable events={events}
                            title="Kommande aktiviteter"/>
                    </DataProvider>
                    <div className="buttonContainer">
                        <a href="/app/login/">
                            <Button>Logga in</Button>
                        </a>
                        <span className="spacer">&nbsp;</span>
                        <a href="/app/signup">
                            <Button>Registrera konto</Button>
                        </a>
                    </div>
                </Col>
            </Row>
        </Container>
    );
}

export const WelcomeText = () => (
    <div>
        <h2>Välkommen till Team13's aktivitetswebb!</h2>
        <p>
            Har du inget konto kan du <a href="/app/signup">skapa ett nytt</a> med den e-mailadress som du registrerat hos klubben.

            Kontakta klubbens kansli på <a href="mailto:info@team13.se">info@team13.se</a> om du behöver hjälp.
    </p>
    </div>
);


export default Welcome;
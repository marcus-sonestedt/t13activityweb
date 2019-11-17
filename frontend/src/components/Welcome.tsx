import React, { useState } from "react";
import { Container, Row, Col, Jumbotron, Image, Button } from 'react-bootstrap'
import './Welcome.css'
import { UpcomingEventsTable } from "./UpcomingEventsTable";
import DataProvider from "./DataProvider";
import { PagedT13Events } from "../Models";
import { deserialize } from "class-transformer";

type Props =
    {

    };

export const Welcome = (props: Props) => {
    const [events, setEvents] = useState(new PagedT13Events());

    return (
        <Container>
            <Row className="welcome">
                <Col xs={12} lg={6}>
                    <Jumbotron>
                        <WelcomeText />
                        <Image src='/static/t13logo.jpg' className="App-logo" alt="team13 logo" />
                    </Jumbotron>
                </Col>
                <Col xs={4} lg={6}>
                    <DataProvider< PagedT13Events >
                        ctor={t => deserialize(PagedT13Events, t)}
                        endpoint={"/api/upcomingevents"}
                        onLoaded={setEvents}>
                        <UpcomingEventsTable events={events}
                            title="Kommande händelser"/>
                    </DataProvider>
                    <div>
                        <a href="/app/login/">
                            <Button>Logga in</Button>
                        </a>
                        <span className="spacer" />
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
            Har du inget konto kan du skapa ett nytt med den e-mailadress
            som du registrerat hos klubben.

        Kontakta klubbens kansli på <a href="mailto:info@team13.se">info@team13.se</a> om du behöver hjälp.
    </p>
    </div>
);


export default Welcome;
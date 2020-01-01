import React, { useState, useContext } from "react";
import { Container, Row, Col, Jumbotron, Image, Button } from 'react-bootstrap'
import { UpcomingEvents } from "../components/UpcomingEvents";
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
        <Container fluid>
            <Row className="welcome">
                <Col md={12} lg={6}>
                    <Jumbotron>
                        <WelcomeText />
                        <div style={{textAlign:'center'}}>
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

export const WelcomeText = () => (
    <div>
        <h2>Välkommen till Team13's webbaktivitetslista!</h2>
        <p>
            Har du inget konto kan du <a href="/app/signup">skapa ett nytt</a> med den e-mailadress som du registrerat hos klubben.

            Kontakta klubbens kansli på&nbsp;
            <a href="mailto:info@team13.se">info@team13.se</a>
            om du behöver hjälp.
        </p>
    </div>
);


export default Welcome;
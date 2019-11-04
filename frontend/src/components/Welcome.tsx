import React from "react";
import { Container, Row, Col, Jumbotron, Image } from 'react-bootstrap'
import { LoginForm, LoginProps } from '../forms/LoginForm'
import './Welcome.css'

export const Welcome = (loginProps: LoginProps) => (
    <Container>
        <Row className="welcome">
            <Col xs={12} md={8}>
                <Jumbotron>
                    <WelcomeText />
                    <Image src='/static/t13logo.jpg' className="App-logo" alt="team13 logo" />
                </Jumbotron>
            </Col>
            <Col xs={4} md={4} className="my-auto">
                <LoginForm {...loginProps} />
            </Col>
        </Row>
    </Container>
);

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
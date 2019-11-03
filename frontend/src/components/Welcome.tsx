import React from "react";
import { Container, Row, Col, Jumbotron } from 'react-bootstrap'
import { LoginForm, LoginProps } from '../forms/LoginForm'
import logo from '../t13logo.jpg'
import './Welcome.css'

export const Welcome = (loginProps: LoginProps) => (
    <Container>
        <Row className="welcome">
            <Col xs={12} md={8}>
                <Jumbotron>
                    <h2>Välkommen till Team13's aktivitetswebb!</h2>
                    <p>
                        Har du inget konto kan du skapa ett nytt med den e-mailadress
                        som du registrerat hos klubben.

                        Kontakta klubbens kansli på <a href="mailto:info@team13.se">info@team13.se</a> om du behöver hjälp.
                    </p>
                    <img src={logo} className="App-logo" alt="logo" />
                </Jumbotron>
            </Col>
            <Col xs={4} md={4} className="my-auto">
                <LoginForm {...loginProps} />
            </Col>
        </Row>
    </Container>
);


export default Welcome;
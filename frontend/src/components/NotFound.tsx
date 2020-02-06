import React from 'react';
import { Container, Row, Col, Image, Button } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';


export const NotFound = () => {
    const history = useHistory();

    return <Container>
        <Row>
            <Col md={12} lg={6}>
                <Image src='/static/offtrack.jpg' fluid />
            </Col>
            <Col md={12} lg={6}>
                <h3>Oops. Den sidan fanns inte!</h3>
                <p>
                    Hör av dig om det känns som en bugg i systemet. 
                    </p>
                    <p>
                        Denna sida: <a href={window.location.href}>{window.location.href}</a>
                    </p>
                <div>
                    <Button onClick={() => history.goBack()}>180 grader om &amp; tillbaka!</Button>
                </div>
            </Col>
        </Row>
    </Container>
}

export default NotFound;

import React from 'react';
import { Container, Row, Col, Image } from 'react-bootstrap';

export const NotFound = () => (
    <Container>
        <Row>
            <Col sm={12} lg={6}>
                <Image src='/static/offtrack.jpg' className="errorImage" />
            </Col>
            <Col lg={6}>
                <h3>Page not found</h3>
                <a href="/frontend">Return to Home</a>
            </Col>
        </Row>
    </Container>
);

export default NotFound;

import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Image } from 'react-bootstrap';

export const NotFound = () => (
    <Container>
        <Row>
            <Col sm={12} lg={6}>
                <Image src='/static/offtrack.jpg' style={{ width: 400, height: 400, display: 'block', margin: 'auto', position: 'relative' }} />
            </Col>
            <Col lg={6}>
                <h3>Page not found</h3>
                <a href="/frontend">Return to Home</a>
            </Col>
        </Row>
    </Container>
);

export default NotFound;

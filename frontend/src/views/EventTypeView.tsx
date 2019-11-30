import React  from "react";
import { Container, Row, Col, Image } from 'react-bootstrap'
import { T13EventType } from "../Models";

export const EventTypeView = (event: T13EventType) => {
    return (
        <Container>
            <Row>
                <Col sm={12} md={6}>
                    <h1>{event.name}</h1>
                    <p>{event.description}</p>
                </Col>
                <Col sm={12} md={6}>
                    <Image src={event.image} />
                </Col>
            </Row>
        </Container>
    )
}

export default EventTypeView;
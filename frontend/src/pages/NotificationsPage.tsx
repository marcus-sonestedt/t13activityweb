import React from 'react';
import { useContext } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';

import { userContext } from '../components/UserContext';

export const NotificationsComponent = () => {
    const user = useContext(userContext);

    // initially used only for verifying emails/phone number

    const renderRow = (n: { message: string, link: string }) => {
        return <div key={n.link}>
            <Row>
                <Col sm='auto'>
                    <a href={n.link}>
                        <Button variant='info'>{n.message}</Button>
                    </a>
                </Col>
            </Row>
            <Row>
                &nbsp;
            </Row>
        </div>
    }

    return <>
        {user.notifications.map(renderRow)}
    </>
}

export const NotificationsPage = () => {
    const user = useContext(userContext);
    return <Container>
        <Row>
            <Col>
                <h2>{user.notifications.length} notifiering(ar)</h2>
            </Col>
        </Row>
        <NotificationsComponent />
    </Container>
}

export default NotificationsPage;
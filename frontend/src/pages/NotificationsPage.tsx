import React from 'react';
import { useContext } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';

import { userContext } from '../components/UserContext';

export const NotificationsPage = () => {
    const user = useContext(userContext);

    // initially used only for verifying emails/phone number

    const renderRow = (n: { message: string, link: string }) =>
        <>
            <Row>
                <Col>
                    <span>{n.message}</span>
                    <span className='spacer'/>
                    <a href={n.link}><Button variant='primary'>Gå</Button></a>
                </Col>
            </Row>
            <Row>
                &nbsp;
            </Row>
        </>

    return <Container>
        <Row>
            <Col>
                <h2>{user.notifications.length} notifiering(ar)</h2>
            </Col>
        </Row>
        {user.notifications.map(renderRow)}
    </Container>
}

export default NotificationsPage;
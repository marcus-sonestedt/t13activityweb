import React from 'react';
import { useContext } from 'react';
import { Button } from 'react-bootstrap';

import { userContext } from '../components/UserContext';

export const NotificationsComponent = () => {
    const user = useContext(userContext);

    const renderRow = (n: { message: string, link: string }) => {
        return <Button href={n.link} variant='info'>{n.message}</Button>
    }

    return <>
        {user.notifications.map(renderRow)}
    </>
}

export const NotificationsPage = () => {
    const user = useContext(userContext);
    return <div>
      <h3>{user.notifications.length} notis(er)</h3>
        <NotificationsComponent />
    </div>
}

export default NotificationsPage;
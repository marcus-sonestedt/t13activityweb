import React, { useState, useContext, useCallback, } from "react";
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Button, Table } from "react-bootstrap";
import { deserialize } from 'class-transformer';

import { PagedActivities, Activity, Member, PagedMembers } from '../Models';
import DataProvider from "../components/DataProvider";
import NotFound from "../components/NotFound";
import { ActivityComponent } from './ActivityPage';
import { userContext } from "../components/UserContext";
import { HoverTooltip } from '../components/Utilities';
import { enlistActivityViaProxy, delistActivityViaProxy } from "../logic/TaskActions";
import { disconnectProxy } from "../logic/ProxyActions";

export const EnlistByProxyPage = () => {
    const { activityId } = useParams();
    const [activity, setActivity] = useState<Activity>();
    const [proxies, setProxies] = useState<Member[]>([]);
    const user = useContext(userContext);
    const setActivityCallback = useCallback(data => setActivity(data.results[0]), []);

    if (!activityId) {
        return <NotFound />
    }

    return <Container fluid>
        <Row>
            <Col sm={12} md={6}>
                <DataProvider<PagedActivities>
                    url={Activity.apiUrlFromId(activityId)}
                    ctor={json => deserialize(PagedActivities, json)}
                    onLoaded={setActivityCallback}>
                    <ActivityComponent model={activity} />
                </DataProvider>
            </Col>
            <Col sm={12} md={6}>
                <h2>Underhuggare</h2>
                <DataProvider<PagedMembers>
                    url={`/api/proxy/for_member/${user.memberId}`}
                    ctor={json => deserialize(PagedMembers, json)}
                    onLoaded={data => setProxies(data.results)}>
                    {activity
                        ? <ProxiesTable proxies={proxies} activity={activity} />
                        : null
                    }
                </DataProvider>
                <div>
                    <HoverTooltip tooltip="Skapa en ny användare i systemet som blir din underhuggare.">
                        <Button href='/frontend/profile/create' variant='success'>Skapa ny</Button>
                    </HoverTooltip>
                    {' '}
                    <HoverTooltip tooltip="Koppla en användare som redan finns in systemet för att bli din underhuggare.">
                        <Button onClick={connectExistingProxy} variant='secondary'>Koppla befintlig</Button>
                    </HoverTooltip>
                </div>
            </Col>
        </Row>
    </Container>
}

const ProxiesTable = (props: { proxies: Member[], activity: Activity }) => {
    const { proxies, activity } = props;
    const user = useContext(userContext);

    const renderRow = (proxy: Member) => {
        const enlistProxy = () => enlistActivityViaProxy(activity, proxy);
        const delistProxy = () => delistActivityViaProxy(activity, proxy);

        return <tr key={proxy.id}>
            <td><a href={proxy.url()}>{proxy.fullname}</a></td>
            <td><a href={`mailto:${proxy.email}`}>{proxy.email}</a></td>
            <td><a href={`tel:${proxy.phone_number}`}>{proxy.phone_number}</a></td>
            <td>
                {proxy.id !== activity.assigned?.id}
                ? <Button onClick={enlistProxy} size='sm' variant='success'>
                    Boka
                </Button>
                : <Button onClick={delistProxy} size='sm' variant='warning'>
                    Avboka
                </Button>
                }
                <Button href={`/frontend/proxy/edit/${proxy.id}`} size='sm' variant='secondary'>
                    Editera
                </Button>
                <Button onClick={() => disconnectProxy(proxy, user.fullname)} size='sm' variant='danger'>
                    Avsluta
                </Button>
            </td>
        </tr>
    }

    return <Table>
        <thead>
            <th>Namn</th>
            <th>Email</th>
            <th>Telefon</th>
            <th></th>
        </thead>
        <tbody>
            {proxies.map(renderRow)}
        </tbody>
    </Table>
}

const connectExistingProxy = () => {
    // addExistingProxy ...
}
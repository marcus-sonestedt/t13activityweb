import React, { useCallback, useState } from "react";
import DataProvider from "./DataProvider";
import { Member, Activity, PagedMembers } from '../Models';
import { useContext } from "react";
import { userContext } from "./UserContext";
import { enlistActivityViaProxy, delistActivityViaProxy } from "../logic/TaskActions";
import { Button, Table, Col, Row } from "react-bootstrap";
import { disconnectProxy } from "../logic/ProxyActions";
import { deserialize } from "class-transformer";
import { HoverTooltip } from "./Utilities";

export const MyProxiesTable = (props: {
    activity?: Activity,
    onProxySelected?: (proxy: Member) => void
}) => {
    const { activity, onProxySelected } = props;
    const [proxies, setProxies] = useState<Member[]>([]);
    const setProxiesCallback = useCallback(data => setProxies(data.results), []);

    const renderButtons = (proxy: Member) => {
        if (activity) {
            return proxy.id !== activity.assigned?.id
                ? <Button onClick={() => enlistActivityViaProxy(activity, proxy)} size='sm' variant='success'>Boka</Button>
                : <Button onClick={() => delistActivityViaProxy(activity, proxy)} size='sm' variant='warning'>Avboka</Button>
        }

        return <Button href={`/frontend/profile/edit/${proxy.id}`} size='sm' variant='secondary'>
            Editera
            </Button>
    }

    return <>
        <Row>
            <Col md={9}>
                <h2>Mina underhuggare</h2>
            </Col>
            <Col md={3} className='align-right'>
                <HoverTooltip tooltip="Skapa en ny användare i systemet som blir din underhuggare."
                    placement='bottom'>
                    <Button href='/frontend/profile/create' variant='success'>
                        Skapa ny
                    </Button>
                </HoverTooltip>
            </Col>
        </Row>
        <DataProvider<PagedMembers>
            url='/api/proxy/my/'
            ctor={json => deserialize(PagedMembers, json)}
            onLoaded={setProxiesCallback}>
            <ProxiesTable proxies={proxies}
                onProxySelected={onProxySelected}
                renderButtons={renderButtons} />
        </DataProvider>
        <div>
            {/* not implemented yet
            {' '}
            <HoverTooltip tooltip="Koppla en användare som redan finns in systemet för att bli din underhuggare."
                placement='bottom'>
                <Button onClick={NYI: connectExistingProxy} variant='secondary'>Koppla befintlig</Button>
            </HoverTooltip>
            */}
        </div>
    </>
}

export const MySuperProxiesTable = (props: {
    onProxySelected?: (proxy: Member) => void
}) => {
    const user = useContext(userContext);
    const [proxies, setProxies] = useState<Member[]>([]);
    const setProxiesCallback = useCallback(data => setProxies(data.results), []);

    const renderButtons = (proxy: Member) =>
        <Button onClick={() => disconnectProxy(proxy, user.fullname)} size='sm' variant='danger'>
            Avsluta
        </Button>

    return <>
        <h2>Medlemmar jag kan jobba åt</h2>
        <DataProvider<PagedMembers>
            url='/api/proxy/my_super/'
            ctor={json => deserialize(PagedMembers, json)}
            onLoaded={setProxiesCallback}>
            <ProxiesTable proxies={proxies} renderButtons={renderButtons} />
        </DataProvider>
    </>
}


export const ProxiesTable = (props: {
    proxies: Member[],
    onProxySelected?: (proxy: Member) => void,
    renderButtons?: (proxy: Member) => JSX.Element
}) => {
    const renderRow = (proxy: Member) => {
        const rowClicked = (e: any) => {
            //e.preventDefault();
            props.onProxySelected?.(proxy);
        }

        return <tr key={proxy.id} onClick={rowClicked}>
            <td><a href={proxy.url()}>{proxy.fullname}</a></td>
            <td><a href={`mailto:${proxy.email}`}>{proxy.email}</a></td>
            <td><a href={`tel:${proxy.phone_number}`}>{proxy.phone_number}</a></td>
            <td>
                {props.renderButtons?.(proxy)}
            </td>
        </tr>
    }

    return <Table>
        <thead>
            <tr>
                <th>Namn</th>
                <th>Email</th>
                <th>Telefon</th>
                <th></th>
            </tr>
        </thead>
        <tbody>
            {props.proxies.map(renderRow)}
        </tbody>
    </Table>
}


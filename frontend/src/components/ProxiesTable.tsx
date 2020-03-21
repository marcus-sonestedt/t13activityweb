import React, { useState, useContext } from "react";
import { Member, Activity } from '../Models';
import { changeActivityViaProxy } from "../logic/TaskActions";
import { Button, Table, Col, Row, Alert } from "react-bootstrap";
import { HoverTooltip } from "./Utilities";
import { createADR } from '../logic/ADRActions';
import { userContext } from "./UserContext";

export const MyProxiesTable = (props: {
    activity?: Activity,
    proxies: Member[],
    onProxySelected?: (proxy: Member) => void,
    onEnlistChanged?: () => void
}) => {
    const { activity, proxies, onProxySelected } = props;
    const user = useContext(userContext);
    const [error, setError] = useState<string>();

    const renderButtons = (proxy: Member) => {
        if (!activity)
            return <span />
        else if (proxy.id !== activity.assigned?.id)
            return <Button onClick={async () => {
                await changeActivityViaProxy('PUT', activity, proxy, setError);
                props.onEnlistChanged?.();
            }} size='sm' variant='success'>Boka</Button>
        else
            return <Button onClick={async () => {
                await createADR(activity, user.memberId);
                props.onEnlistChanged?.();
            }} size='sm' variant='outline-warning'>Avboka</Button>
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
        <ProxiesTable proxies={proxies}
            onProxySelected={onProxySelected}
            renderButtons={renderButtons} />
        <div>
            {/* not implemented yet
            {' '}
            <HoverTooltip tooltip="Koppla en användare som redan finns in systemet för att bli din underhuggare."
                placement='bottom'>
                <Button onClick={NYI: connectExistingProxy} variant='secondary'>Koppla befintlig</Button>
            </HoverTooltip>
            */}
        </div>
        {error ? <Alert variant='danger'>{error}</Alert> : null}
    </>
}

/*
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
*/

export const ProxiesTable = (props: {
    proxies: Member[],
    onProxySelected?: (proxy: Member) => void,
    renderButtons?: (proxy: Member) => JSX.Element
}) => {
    const renderRow = (proxy: Member) => {
        const rowClicked = (e: React.MouseEvent<HTMLElement>) => {
            e.stopPropagation();
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


import React, { useCallback, useState } from "react";
import DataProvider from "./DataProvider";
import { Member, Activity, PagedMembers } from '../Models';
import { useContext } from "react";
import { userContext } from "./UserContext";
import { enlistActivityViaProxy, delistActivityViaProxy } from "../logic/TaskActions";
import { Button, Table } from "react-bootstrap";
import { disconnectProxy } from "../logic/ProxyActions";
import { deserialize } from "class-transformer";
import { HoverTooltip } from "./Utilities";

const connectExistingProxy = () => { }

export const MyProxiesTable = (props: {
    activity?: Activity,
    onProxySelected?: (proxy: Member) => void
}) => {
    const { activity, onProxySelected } = props;
    const [proxies, setProxies] = useState<Member[]>([]);
    const setProxiesCallback = useCallback(data => setProxies(data.results), []);

    return <>
        <h2>Underhuggare</h2>
        <DataProvider<PagedMembers>
            url='/api/proxy/my/'
            ctor={json => deserialize(PagedMembers, json)}
            onLoaded={setProxiesCallback}>
            <ProxiesTable proxies={proxies} activity={activity} onProxySelected={onProxySelected} />
        </DataProvider>
        <div>
            <HoverTooltip tooltip="Skapa en ny användare i systemet som blir din underhuggare."
                placement='bottom'>
                <Button href='/frontend/profile/create' variant='success'>Skapa ny</Button>
            </HoverTooltip>
            {' '}
            <HoverTooltip tooltip="Koppla en användare som redan finns in systemet för att bli din underhuggare."
                placement='bottom'>
                <Button onClick={connectExistingProxy} variant='secondary'>Koppla befintlig</Button>
            </HoverTooltip>
        </div>
    </>
}

export const ProxiesTable = (props: {
    proxies: Member[],
    activity?: Activity,
    onProxySelected?: (proxy: Member) => void
}) => {
    const { proxies, activity } = props;
    const user = useContext(userContext);

    const renderRow = (proxy: Member) => {
        const AssignButtons = () => {
            if (!activity)
                return null;

            const enlistProxy = () => enlistActivityViaProxy(activity, proxy);
            const delistProxy = () => delistActivityViaProxy(activity, proxy);

            return proxy.id !== activity.assigned?.id
                ? <Button onClick={enlistProxy} size='sm' variant='success'>
                    Boka
            </Button>
                : <Button onClick={delistProxy} size='sm' variant='warning'>
                    Avboka
            </Button>
        }

        const rowClicked = (e: any) => {
            e.preventDefault();
            props.onProxySelected?.(proxy);
        }

        return <tr key={proxy.id} onClick={rowClicked}>
            <td><a href={proxy.url()}>{proxy.fullname}</a></td>
            <td><a href={`mailto:${proxy.email}`}>{proxy.email}</a></td>
            <td><a href={`tel:${proxy.phone_number}`}>{proxy.phone_number}</a></td>
            <td>
                <AssignButtons />
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
            <tr>
                <th>Namn</th>
                <th>Email</th>
                <th>Telefon</th>
                <th></th>
            </tr>
        </thead>
        <tbody>
            {proxies.map(renderRow)}
        </tbody>
    </Table>
}
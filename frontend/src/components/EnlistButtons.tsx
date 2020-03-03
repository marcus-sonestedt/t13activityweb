import { Activity, Member, PagedMembers } from "../Models";
import { useHistory } from "react-router-dom";
import React, { useContext, useState } from "react";
import { userContext } from "./UserContext";
import { claimActivity } from "../logic/TaskActions";
import { Modal, Button } from "react-bootstrap";
import DataProvider from "./DataProvider";
import { deserialize } from "class-transformer";
import { MyProxiesTable } from "./ProxiesTable";

export const EnlistButtons = (props: {
    activity: Activity,
    reloadActivity: () => void
}) => {
    const history = useHistory();
    const user = useContext(userContext);
    const [showProxyDialog, setShowProxyDialog] = useState(false);
    const [proxies, setProxies] = useState<Member[]>([]);

    const handleEnlistSelf = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        claimActivity(props.activity, true, history);
    }

    const handleEnlistProxy = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        setShowProxyDialog(true);
    }

    const handleHide = () => {
        setShowProxyDialog(false);
        props.reloadActivity();
    }

    const handleProxySelected = () => {
        setShowProxyDialog(false);
        props.reloadActivity();
    }

    return <>
        <Modal show={showProxyDialog} onHide={handleHide}>
            <Modal.Header closeButton>
                <Modal.Title>Boka underhuggare</Modal.Title>
                <Modal.Body>
                    <DataProvider<PagedMembers>
                        url={`/api/proxy/my`}
                        ctor={json => deserialize(PagedMembers, json)}
                        onLoaded={data => setProxies(data.results)}>
                        <MyProxiesTable proxies={proxies}
                            activity={props.activity}
                            onProxySelected={handleProxySelected} />
                    </DataProvider>
                </Modal.Body>
            </Modal.Header>
        </Modal>
        {props.activity.current_user_can_enlist
            ? <Button style={{ marginBottom: 3 }} onClick={handleEnlistSelf}>Boka själv</Button>
            : null}
        {' '}
        {user.hasProxies ?
            <Button variant="outline-primary" onClick={handleEnlistProxy}>Boka underhuggare</Button>
            : null}
    </>
}

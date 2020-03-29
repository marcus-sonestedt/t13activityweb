import { Activity, Member, PagedMembers } from '../Models';
import { useHistory } from "react-router-dom";
import React, { useContext, useState, useCallback } from "react";
import { userContext } from "./UserContext";
import { claimActivity } from "../logic/TaskActions";
import { Modal, Button } from "react-bootstrap";
import DataProvider from "./DataProvider";
import { deserialize } from "class-transformer";
import { MyProxiesTable } from "./ProxiesTable";
import { createADR, cancelADRByActivity } from '../logic/ADRActions';
import { RequestAdrButton, CancelAdrButton } from '../pages/ADRPage';
import { InfoText } from './Utilities';

export const EnlistButtons = (props: {
    activity: Activity,
    reloadActivity: () => void
}) => {
    const { activity } = props;
    const history = useHistory();
    const user = useContext(userContext);
    const [showProxyDialog, setShowProxyDialog] = useState(false);

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

    if (activity.assigned?.id === user.memberId || activity.assigned_for_proxy === user.memberId) {
        const buttonClick = (f: () => Promise<void>) => (e: any) => {
            e.stopPropagation();
            f().then(props.reloadActivity);
        }

        const canRequestUnlist = (user.bookedWeight - activity.weight) >= user.minSignups;

        if (activity.active_delist_request)
            return <CancelAdrButton onClick={buttonClick(() => cancelADRByActivity(activity.id))} />

        return <RequestAdrButton onClick={buttonClick(() => createADR(activity, user.memberId))}
            disabled={!canRequestUnlist} />
    }

    if (activity.assigned)
        return <></>;

    var r = [<Button style={{ marginBottom: 3 }} onClick={handleEnlistSelf}>Boka</Button>]

    if (user.hasProxies) {
        r.push(<>{' '}</>)
        r.push(<>
            <Button variant="outline-primary" onClick={handleEnlistProxy}>Boka underhuggare</Button>
            <ProxyDialog show={showProxyDialog} onHide={handleHide} activity={activity} />
        </>)
    }

    return <>{r}</>;
}


const ProxyDialog = (props: { show: boolean, onHide: () => void, activity: Activity }) => {
    const [proxies, setProxies] = useState<Member[]>([]);
    const handleLoaded = useCallback((data: PagedMembers) => setProxies(data.results), [])

    return <Modal show={props.show} onHide={props.onHide} size='lg'>
        <Modal.Header closeButton>
            Boka underhuggare
        </Modal.Header>
        <Modal.Body>
            <DataProvider<PagedMembers>
                url={`/api/proxy/my`}
                ctor={json => deserialize(PagedMembers, json)}
                onLoaded={handleLoaded}>
                <div>
                    <MyProxiesTable proxies={proxies}
                        activity={props.activity}
                        onEnlistChanged={() => window.location.reload()} />
                </div>
            </DataProvider>
        </Modal.Body>
        <Modal.Footer>
            <InfoText textKey="proxies-booking" />
        </Modal.Footer>
    </Modal>
}
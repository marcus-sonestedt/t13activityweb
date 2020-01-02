import React, { useState, useContext, useCallback, useMemo } from "react"
import { Container, Row, Col, Table, Button, Pagination, Badge } from "react-bootstrap";
import { deserialize } from "class-transformer";

import DataProvider from "../components/DataProvider";
import { userContext } from "../components/UserContext";
import { ActivityDelistRequest, PagedADR } from '../Models';
import { pageItems } from "./MemberHomeView";
import { cancelADR, rejectADR, approveADR, deleteADR } from "../logic/ADRActions"
import { useParams } from "react-router-dom";

export const RequestAdrButton = (props: {
    onClick: ((e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void),
    disabled: boolean
}) => {
    const user = useContext(userContext);

    return (
        <Button variant='outline-danger' size='sm' disabled={props.disabled} onClick={props.onClick}>
            Avboka?
            <div className='text-tooltip'>
                {!props.disabled
                    ? "Skapa en förfrågan om att att avboka dig från uppgiften"
                    : "Du kan inte begära att avboka dig då du skulle få mindre än "
                    + user.settings.minSignups + " uppgifter om det godkändes."}
            </div>
        </Button>
    );
}

export const CancelAdrButton = (props: { onClick: ((e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void) }) =>
    <Button variant='outline-warning' size='sm' onClick={props.onClick}>
        Återta
        <div className='text-tooltip'>
            Avbryt din begäran att avboka och återta dig uppgiften.
        </div>
    </Button>

export const DeleteAdrButton = (props: { onClick: ((e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void) }) =>
    <Button variant='outline-secondary' size='sm' onClick={props.onClick}>
        Radera
        <div className='text-tooltip'>
            Radera denna avbegäran.
        </div>
    </Button>

const AdrStatusBadge = (props: { model: ActivityDelistRequest }) => {
    const { model } = props;
    const approvedText = model.approved === true ? 'JA'
        : model.approved === false ? 'NEJ'
            : "-";

    const approvedVariant = model.approved === true ? 'success'
        : model.approved === false ? 'danger'
            : 'dark';

    return <Badge variant={approvedVariant}>{approvedText}</Badge>
}

export const ActivityDelistRequestComponent = (props: { model: ActivityDelistRequest | null }) => {
    const { model } = props;

    if (model === null)
        return null

    if (model.activity === null)
        return <p>Datafel, saknar uppgift</p>

    const approver = model.approver === null ? null :
        <span>
            /<a href={model.approver.url()}>{model.approver.fullname}</a>
        </span>


    return (
        <>
            <h5>Aktivitet</h5>
            <p>{model.activity.event.name}</p>
            <h5>Uppgift</h5>
            <p>{model.activity.name}</p>
            <h5>Avbokningsanledning</h5>
            <p>{model.reason}</p>
            <h5>Status <AdrStatusBadge model={model} /></h5>
            <div><p>{model.reject_reason}<br />{approver}</p></div>
        </>
    )
}

export const ActivityDelistRequestView = () => {
    const { id } = useParams();
    const user = useContext(userContext);

    const [currentReq, setCurrentReq] = useState<ActivityDelistRequest | null>(null);
    const [allRequests, setAllRequests] = useState<PagedADR | null>(null);
    const [page, setPage] = useState(1);
    const [reload, setReload] = useState(1);

    const currentId = currentReq?.id.toString() ?? id;
    const incReload = useCallback(() => setReload(reload + 1), [reload])
    const reloadHandler = useCallback((data: PagedADR) => {
        if (reload >= 0)
            setAllRequests(data);
        setCurrentReq(data.results.find(r => r.id.toString() === currentId) ?? null);
    }, [reload, currentId]);

    const myUnansweredRequests = useMemo(() =>
        allRequests?.results.filter(r => r.member.id === user.memberId && r.approved === null), [allRequests, user]);
    const myAnsweredRequests = useMemo(() =>
        allRequests?.results.filter(r => r.member.id === user.memberId && r.approved !== null), [allRequests, user]);

    const unhandledRequests = useMemo(() =>
        allRequests?.results.filter(r => r.member.id !== user.memberId && r.approved === null), [allRequests, user]);
    const myHandledRequests = useMemo(() =>
        allRequests?.results.filter(r => r.approver !== null && r.approver.id === user.memberId), [allRequests, user]);

    const delistRequestsTable = (reqs: PagedADR | null) => {
        if (reqs === null)
            return

        const rowClicked = (e: any, req: ActivityDelistRequest) => {
            if (e.target === null || e.target['tagName'] === 'A')
                return

            //e.preventDefault();
            setCurrentReq(req);
        }

        const renderRow = (model: ActivityDelistRequest) => {
            const cancelClicked = () => {
                setCurrentReq(model);
                setTimeout(() =>
                    cancelADR(model).then(() => {
                        setCurrentReq(null);
                        incReload();
                    }, incReload), 10);
            }

            const deleteClicked = () => deleteADR(model).then(() => window.location.reload());

            return <tr key={model.id} onClick={e => rowClicked(e, model)}
                className={'clickable-row ' + (model === currentReq ? 'active' : undefined)}>
                <td><a href={model.activity.event.url()}>{model.activity.event.name}</a></td>
                <td><a href={model.activity.url()}>{model.activity.name}</a></td>
                <td>{model.activity.event.date()}</td>
                <td><AdrStatusBadge model={model} /></td>
                <td>{model.member.id === user.memberId && model.approved !== true
                    ? <CancelAdrButton onClick={cancelClicked} />
                    : <DeleteAdrButton onClick={deleteClicked} />}
                </td>
            </tr>
        }

        const Separator = (props: { title: string }) =>
            <tr><td colSpan={5}>
                <h5>{props.title}</h5>
            </td></tr>

        return <Table hover striped>
            <thead>
                <tr>
                    <th>Aktivitet</th>
                    <th>Uppgift</th>
                    <th>Datum</th>
                    <th>Status</th>
                    <th>Åtgärd</th>
                </tr>
            </thead>
            <tbody>
                <Separator title={`Mina obesvarade förfrågningar (${myUnansweredRequests?.length})`} />
                {myUnansweredRequests?.map(renderRow)}
                <Separator title={`Mina besvarade förfrågningar (${myAnsweredRequests?.length})`} />
                {myAnsweredRequests?.map(renderRow)}
                {!user.isStaff ? null : <>
                    <Separator title={`Ohanterade förfrågningar (${unhandledRequests?.length})`} />
                    {unhandledRequests?.map(renderRow)}
                    <Separator title={`Förfrågningar hanterade av mig (${myHandledRequests?.length})`} />
                    {myHandledRequests?.map(renderRow)}
                </>}
            </tbody>
        </Table>
    }

    return (
        <Container>
            <Row>
                <Col md={12} lg={7}>
                    <h2>Avbokningsförfrågningar</h2>
                    <DataProvider url={ActivityDelistRequest.apiUrlAll() + `?page=${page}`}
                        ctor={json => deserialize(PagedADR, json)}
                        onLoaded={reloadHandler}>
                        {delistRequestsTable(allRequests)}
                        <Pagination>
                            {pageItems(allRequests !== null ? allRequests.count : 0, 10, page, setPage)}
                        </Pagination>
                    </DataProvider>
                </Col>
                <Col md={12} lg={5}>
                    <h2>Detaljer</h2>
                    <div className="div-group">
                        {currentReq === null
                            ? <p>Välj en förfrågan att visa</p>
                            : <ActivityDelistRequestComponent model={currentReq} />}
                        {(currentReq === null || !user.isStaff) ? null :
                            <div className='align-right'>
                                <span className="spacer">&nbsp;</span>
                                <ApproveAdrButton onClick={() => approveADR(currentReq, user).then(incReload)}
                                    disabled={currentReq.approved === true} />
                                <span className="spacer">&nbsp;</span>
                                <RejectAdrButton onClick={() => rejectADR(currentReq, user).then(incReload)}
                                    disabled={currentReq.approved === false} />
                            </div>
                        }
                    </div>
                </Col>
            </Row>
        </Container>
    )
}

const ApproveAdrButton = (props: { onClick: (e: any) => Promise<void>, disabled: boolean }) =>
    <Button variant='success' onClick={props.onClick} disabled={props.disabled}>
        Godkänn
        <div className='text-tooltip place-left'>
            Godkänn avbokningen och frigör medlemmen från sitt åtagande.
            Uppgiften kommer inte ha någon medlem tilldelad efter detta.
        </div>
    </Button>

const RejectAdrButton = (props: { onClick: (e: any) => Promise<void>, disabled: boolean }) =>
    <Button variant='danger' onClick={props.onClick} disabled={props.disabled}>
        Avvisa
        <div className='text-tooltip place-left'>
            Avvisa denna avbokningsförfrågan. Du behöver ange en anledning
            till varför du inte godtar anledningen som medlemmen angivit.
        </div>
    </Button>

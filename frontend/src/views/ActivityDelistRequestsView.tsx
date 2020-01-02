import React, { useState, useContext, useCallback, useMemo } from "react"
import { Container, Row, Col, Table, Button, Pagination } from "react-bootstrap";
import { deserialize } from "class-transformer";

import DataProvider from "../components/DataProvider";
import { userContext } from "../components/UserContext";
import { ActivityDelistRequest, PagedADR } from '../Models';
import { pageItems } from "./MemberHomeView";
import { cancelADR, rejectADR, approveADR } from "../logic/ADRActions"

export const CancelAdrButton = (props: { onClick: ((e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void) }) =>
    <Button variant='outline-warning' size='sm' onClick={props.onClick}>
        Återta
        <div className='text-tooltip'>
            Avbryt din begäran att avboka och återta dig uppgiften.
        </div>
    </Button>

export const ActivityDelistRequestComponent = (props: { model: ActivityDelistRequest | null }) => {
    const { model } = props;

    if (model === null)
        return null

    if (model.activity === null)
        return <p>Datafel, saknar uppgift</p>

    const approver = model.approver === null ? null :
        <span>av <a href={model.approver.url()}>{model.approver.fullname}</a></span>

    const approved = model.approved === true ? "JA"
        : model.approved === false ? "NEJ"
            : "Ej besvarad";

    return (
        <>
            <h4>Aktivitet</h4><p>{model.activity.event.name}</p>
            <h4>Uppgift</h4><p>{model.activity.name}</p>
            <h4>Godkänd</h4><p>{approved} {approver}</p>
            <h4>Anledning</h4><p>{model.reason}</p>
        </>
    )
}

export const ActivityDelistRequestView = () => {
    const [currentReq, setCurrentReq] = useState<ActivityDelistRequest | null>(null);
    const [allRequests, setAllRequests] = useState<PagedADR | null>(null);
    const [page, setPage] = useState(1);
    const user = useContext(userContext);
    const [reload, setReload] = useState(1);

    const incReload = useCallback(() => setReload(reload + 1), [reload])
    const reloadHandler = useCallback((data: PagedADR) => {
        if (reload >= 0) // just to force reload of data
            setAllRequests(data);
    }, [reload]);

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

            return <tr key={model.id} onClick={e => rowClicked(e, model)}
                className={'clickable-row ' + (model === currentReq ? 'active' : undefined)}>
                <td><a href={model.activity.event.url()}>{model.activity.event.name}</a></td>
                <td><a href={model.activity.url()}>{model.activity.name}</a></td>
                <td>{model.activity.event.date()}</td>
                <td>{model.approved === null ? null : (model.approved ? "JA" : "NEJ")}</td>
                <td>{model.member.id === user.memberId
                    ? <CancelAdrButton onClick={cancelClicked} />
                    : null}
                </td>
            </tr>
        }

        const Separator = (props: { title: string }) =>
            <tr><td colSpan={5}>
                <h4>{props.title}</h4>
            </td></tr>

        return <Table hover striped>
            <thead>
                <tr>
                    <th>Aktivitet</th>
                    <th>Uppgift</th>
                    <th>Datum</th>
                    <th>Godkänd</th>
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
                                <Button variant='success' onClick={() => approveADR(currentReq, user).then(incReload)}>
                                    Godkänn
                                    <span className='text-tooltip place-left'>
                                        Godkänn avbokningen och frigör medlemmen från sitt åtagande.
                                        Uppgiften kommer inte ha någon medlem tilldelad efter detta.
                                    </span>
                                    </Button>
                                <span className="spacer">&nbsp;</span>
                                <Button variant='danger' onClick={() => rejectADR(currentReq, user).then(incReload)}>
                                    Avvisa
                                    <span className='text-tooltip place-left'>
                                        Avvisa denna avbokningsförfrågan. Du behöver ange en anledning
                                        till varför du inte godtar anledningen som medlemmen angivit.
                                    </span>
                                    </Button>
                            </div>
                        }
                    </div>
                </Col>
            </Row>
        </Container>
    )
}
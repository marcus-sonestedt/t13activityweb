import React, { useState, useContext } from "react"
import { Container, Row, Col, Table, Button, Pagination } from "react-bootstrap";
import { userContext } from "../App";
import { ActivityDelistRequest, PagedADR } from '../Models';
import DataProvider from "../components/DataProvider";
import { deserialize } from "class-transformer";
import { pageItems } from "./MemberHomeView";
import { cancelADR, rejectADR, approveADR } from "../logic/ADRActions"

export const ActivityDelistRequestComponent = (props:{model: ActivityDelistRequest|null}) => {
    const { model } = props;
    
    if (model === null)
        return null
    
    if (model.activity === null)
        return <p>Datafel, saknar uppgift</p>

    const approver = model.approver === null ? null :
        <span>av <a href={model.approver.url()}>{model.approver.fullname}</a></span>

    return (
        <>
            <h3>Aktivitet: {model.activity.event.name}</h3>
            <h3>Uppgift: {model.activity.name}</h3>
            <h4>Godkänd: {model.approved ? "JA" : "NEJ"} {approver}</h4>
            <h4>Anledning:</h4>
            <p>{model.reason}</p>
        </>
    )
}

export const ActivityDelistRequestView = () => {
    const [currentReq, setCurrentReq] = useState<ActivityDelistRequest | null>(null);
    const [allRequests, setAllRequests] = useState<PagedADR | null>(null);
    const [page, setPage] = useState(1);
    const user = useContext(userContext);

    const delistRequestsTable = (reqs: PagedADR | null) => {
        if (reqs === null)
            return

        const rowClicked = (e: React.MouseEvent<HTMLTableRowElement, MouseEvent>, req: ActivityDelistRequest) => {
            if (e.target === null || e.currentTarget.tagName === 'a')
                return

            e.preventDefault();
            setCurrentReq(req);
        }

        const renderRow = (model: ActivityDelistRequest) => {
            return <tr key={model.id} onClick={e => rowClicked(e, model)}>
                <td><a href={model.activity.event.url()}>{model.activity.event.name}</a></td>
                <td><a href={model.activity.url()}>{model.activity.name}</a></td>
                <td>{model.activity.event.date()}</td>
                <td>{model.approved === null ? null : (model.approved ? "JA" : "NEJ")}</td>
                <td>{model.member.id === user.memberId
                    ? <Button variant='danger' size='sm' onClick={() => cancelADR(model)}>Avbryt</Button>
                    : null}
                </td>
            </tr>
        }

        const myRequests = reqs.results.filter(r => r.member.id === user.memberId)

        const unhandledRequests = reqs
            .results.filter(r => r.member.id !== user.memberId && r.approved === null)

        const myHandledRequests = reqs
            .results.filter(r => r.approver !== null && r.approver.id === user.memberId)

        const separator = (title: string) =>
            <tr><td colSpan={5}>
                <h4>{title}</h4>
            </td></tr>

        return <Table>
            <thead>
                <tr>
                    <th>Aktivitet</th>
                    <th>Uppgift</th>
                    <th>Datum</th>
                    <th>Godkänd</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {!user.isStaff ? null :
                    separator(`Mina förfrågningar (${myRequests.length})`)
                }
                {myRequests.map(renderRow)}
                {!user.isStaff ? null : <>
                    {separator(`Ohanterade förfrågningar (${unhandledRequests.length})`)}
                    {unhandledRequests.map(renderRow)}
                    {separator(`Förfrågningar hanterade av mig (${myHandledRequests.length})`)}
                    {myHandledRequests.map(renderRow)}
                </>}
            </tbody>
        </Table>
    }

    return (
        <Container fluid>
            <Row>
                <Col md={12} lg={7}>
                    <h2>Avbokningsförfrågningar</h2>
                    <DataProvider url={ActivityDelistRequest.apiUrlAll() + `?page=${page}`}
                        ctor={json => deserialize(PagedADR, json)}
                        onLoaded={setAllRequests}>
                        {delistRequestsTable(allRequests)}
                        <Pagination>
                            {pageItems(allRequests !== null ? allRequests.count : 0, 10, page, setPage)}
                        </Pagination>
                    </DataProvider>
                </Col>
                <Col md={12} lg={5}>
                    <h2>Detaljer</h2>
                    <ActivityDelistRequestComponent model={currentReq} />
                    {(currentReq === null || !user.isStaff) ? null : 
                        <div>
                            <Button variant='success' onClick={() => approveADR(currentReq, user)}>
                                Godkänn</Button>
                            <Button variant='danger' onClick={() => rejectADR(currentReq, user)}>
                                Avvisa</Button>
                        </div>
                    }                    
                </Col>
            </Row>
        </Container>
    )
}
import React, { useState, useContext } from "react"
import { Container, Row, Col, Table, Button } from "react-bootstrap";
import { userContext } from "../App";
import { ActivityDelistRequest, PagedADR } from '../Models';
import Cookies from "universal-cookie";
import DataProvider from "../components/DataProvider";
import { deserialize } from "class-transformer";

export const ActivityDelistRequestComponent = (model: ActivityDelistRequest) => {
    if (model.activity == null)
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
    const user = useContext(userContext);
    const cookies = new Cookies();

    const handleResponse = (resp: any, action: string, url: string) => {
        if (resp instanceof Response) {
            if (resp.status !== 200) {
                console.error(resp.statusText);
                resp.text().then(console.error);
                alert(`Misslyckades att ${action} förfrågan\nUPDATE ${url}: ${resp.statusText}`);
            }
        } else {
            console.error(resp);
            alert(`Misslyckades att ${action} förfrågan\n${url}: ${resp}`);
        }
        window.location.reload();
    };


    const cancel = (model: ActivityDelistRequest) => {
        if (!window.confirm(`Vill du verkligen radera din avbokningsförfrågan för\n${model}?`))
            return

        const handler = (r: any) => handleResponse(r, 'radera', model.apiUrl());

        fetch(model.apiUrl(), {
            method: 'DELETE',
            headers: { 'X-CSRFToken': cookies.get('csrftoken') }
        })
            .then(handler, handler);
    };

    const approve = (model: ActivityDelistRequest) => {
        if (!window.confirm(`Godkänn avbokningsförfrågan för\n${model}?`))
            return

        const handler = (r: any) => handleResponse(r, 'bekräfta', model.apiUrl());

        fetch(model.apiUrl(),
            {
                method: 'UPDATE',
                headers: { 'X-CSRFToken': cookies.get('csrftoken') },
                body: JSON.stringify({
                    approved: true,
                    approved_by: user.memberId
                })
            })
            .then(handler, handler);
    };

    const reject = (model: ActivityDelistRequest) => {
        var rejectReason = prompt(`Ange anledning att avvisa avbokningsförfrågan för\n${model}?`);
        if (rejectReason === null)
            return

        const handler = (r: any) => handleResponse(r, 'avvisa', model.apiUrl());

        fetch(model.apiUrl(), {
            method: 'UPDATE',
            headers: { 'X-CSRFToken': cookies.get('csrftoken') },
            body: JSON.stringify({
                approved: false,
                approved_by: user.memberId,
                reject_reason: rejectReason
            })
        })
            .then(handler, handler);
    };



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
            return <tr onClick={e => rowClicked(e, model)}>
                <td><a href={model.activity.event.url()}>{model.activity.event.name}</a></td>
                <td><a href={model.activity.url()}>{model.activity.name}</a></td>
                <td>{model.activity.event.date}</td>
                <td>{model.approved === null ? null : (model.approved ? "JA" : "NEJ")}</td>
                <td>{model.member.id === user.memberId
                    ? <Button variant='danger' size='sm' onClick={() => cancel(model)}>Avbryt</Button>
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
                <hr />
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
                {separator('Mina förfrågningar')}
                {myRequests.map(renderRow)}
                {!user.isStaff ? null : <>
                    {separator('Ohanterade förfrågningar')}
                    {unhandledRequests.map(renderRow)}
                    {separator('Fförfrågningar hanterade av mig')}
                    {myHandledRequests.map(renderRow)}
                </>}
            </tbody>
        </Table>
    }

    return (
        <Container fluid>
            <Row>
                <Col md={12} lg={16}>
                    <h1>Avbokningsförfrågningar</h1>
                    <DataProvider url="/api/activity_delist_requests"
                        ctor={json => deserialize(PagedADR, json)}
                        onLoaded={setAllRequests}>
                        {delistRequestsTable(allRequests)}
                    </DataProvider>
                </Col>
                <Col>
                    <h1>Detaljer</h1>
                    {currentReq === null ? null : <>
                        <ActivityDelistRequestComponent {...currentReq} />
                        {!user.isStaff ? null : <div>
                            <Button variant='success' onClick={() => approve(currentReq)}>
                                Godkänn</Button>
                            <Button variant='danger' onClick={() => reject(currentReq)}>
                                Avvisa</Button>
                        </div>}
                    </>}
                </Col>
            </Row>
        </Container>
    )
}
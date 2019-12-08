import React, { useState, useContext } from "react"
import { Container, Row, Col, Table, Button } from "react-bootstrap";
import { userContext } from "../App";
import { ActivityDelistRequest } from '../Models';

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
    const [allRequests, setAllRequests] = useState<ActivityDelistRequest[]>([]);
    const user = useContext(userContext);

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
        if (!confirm(`Vill du verkligen radera avbokningsförfrågan för\n${model}?`))
            return

        const handler = (r: any) => handleResponse(r, 'radera', model.apiUrl());

        fetch(model.apiUrl(), { method: 'DELETE' })
            .then(handler, handler);
    };

    const approve = (model: ActivityDelistRequest) => {
        if (!confirm(`Godkänn avbokningsförfrågan för\n${model}?`))
            return

        const handler = (r: any) => handleResponse(r, 'bekräfta', model.apiUrl());

        fetch(model.apiUrl(),
            {
                method: 'UPDATE',
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
            body: JSON.stringify({
                approved: false,
                approved_by: user.memberId,
                reject_reason: rejectReason
            })
        })
            .then(handler, handler);
    };

    const renderRow = (model: ActivityDelistRequest) => {
        return <tr>
            <td><a href={model.activity.event.url()}>{model.activity.event.name}</a></td>
            <td><a href={model.activity.url()}>{model.activity.name}</a></td>
            <td>{model.activity.event.date}</td>
            <td>{model.approved === null ? null : (model.approved ? "JA" : "NEJ")}</td>
            <td>{model.member.id === user.memberId
                ? <Button variant='danger' onClick={() => cancel(model)}>Avbryt</Button>
                : null}
            </td>
        </tr>
    }

    const myRequests = allRequests.filter(r => r.member.id === user.memberId)
    const otherRequests = allRequests.filter(r => r.member.id !== user.memberId)

    return (
        <Container fluid>
            <Row>
                <Col md={12} lg={16}>
                    <h1>Avbokningsförfrågningar</h1>
                    <Table>
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
                            {myRequests}
                            {myRequests.length === 0 || otherRequests.length === 0
                                ? null
                                : <tr><td colSpan={5}>---</td></tr>
                            }
                            {otherRequests}
                        </tbody>
                    </Table>
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
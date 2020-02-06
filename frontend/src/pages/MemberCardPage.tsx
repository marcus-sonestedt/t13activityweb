import { Tab, Row, Col, Nav, Table, Button, Container, Pagination } from 'react-bootstrap';
import React, { useState, useContext, useMemo } from "react";
import { deserialize } from "class-transformer";

import { Member, PagedMembers } from '../Models';
import DataProvider from "../components/DataProvider";
import { ErrorBoundary, InfoText, PageItems, HoverTooltip } from "../components/Utilities";
import { useHistory } from "react-router-dom";
import { userContext } from '../components/UserContext';
import { getJsonHeaders } from '../logic/ADRActions';

export const MemberCardPage = () => {
    const tabMatch = window.location.search.match(/[?&]tab=([a-z-]+)/);
    const tab = tabMatch ? tabMatch[1] : 'ready';
    const history = useHistory();
    const setQueryTab = (key: string) => { history.replace(`?tab=${key}`); }

    return <Tab.Container defaultActiveKey={tab}
        onSelect={setQueryTab}>
        <Row>
            <Col md={1}>
                <Nav variant="pills" className="flex-column">
                    <Nav.Item>
                        <Nav.Link eventKey="ready">
                            Dela ut
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="card-list">
                            Befintliga
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="need-tasks">
                            Ej klara
                        </Nav.Link>
                    </Nav.Item>
                </Nav>
            </Col>
            <Col sm={12} md={11}>
                <ErrorBoundary>
                    <Tab.Content>
                        <Tab.Pane eventKey="ready">
                            <ReadyTab />
                        </Tab.Pane>
                        <Tab.Pane eventKey="card-list">
                            <HasCardTab />
                        </Tab.Pane>
                        <Tab.Pane eventKey="need-tasks">
                            <NeedTasksTab />
                        </Tab.Pane>
                    </Tab.Content>
                </ErrorBoundary>
            </Col>
        </Row>
    </Tab.Container >
}

const ReadyTab = () => {
    const [members, setMembers] = useState(new PagedMembers())
    const [page, setPage] = useState(1)
    const pageSize = 10;

    const handoutCard = (member: Member) => {
        var number = prompt('Ange guldkortsnummer');
        if (!number) return

        fetch(member.apiUrl(),
            {
                method: 'PATCH',
                headers: getJsonHeaders(),
                body: JSON.stringify({ membercard_number: number })
            })
            .then(r => { if (r.status >= 300) throw r.statusText })
            .catch(e => alert("Något gick fel :/\n\n" + e))
            .finally(() => window.location.reload())
    }

    const rows = useMemo(() => {
        const renderRow = (member: Member) =>
            <tr key={member.id}>
                <td><a href={member.url()}>{member.fullname}</a></td>
                <td><a href={`mailto:${member.email}`}>{member.email}</a></td>
                <td><a href={`tel:${member.phone_number}`}>{member.phone_number}</a></td>
                <td>{member.booked_weight_year}</td>
                <td><Button onClick={() => handoutCard(member)} variant='success'>Lämna ut guldkort</Button></td>
                <td><Button href={member.adminUrl()} variant='secondary'>Administrera</Button></td>
            </tr>

        return members.results.map(renderRow)
    }, [members])

    return <Container fluid>
        <Row>
            <Col md={8}>
                <h1>Medlemmar som är redo att hämta ut guldkort</h1>
            </Col>
            <Col md={1}>
                <Pagination>
                    <PageItems count={members.count} pageSize={pageSize} currentPage={page} setFunc={setPage} />
                </Pagination>
            </Col>
            <Col md={3}>
                <h3>
                    {rows.length} / {members.count} st
                </h3>
            </Col>
        </Row>
        <Row>
            <Col md={9}>
                <h1>
                    <span className="table-title">
                    </span>
                </h1>
                <DataProvider<PagedMembers>
                    url={`/api/members/ready?page=${page}&page_size=${pageSize}`}
                    ctor={json => deserialize(PagedMembers, json)}
                    onLoaded={setMembers}>
                    <Table striped hover>
                        <thead>
                            <tr>
                                <th>Namn</th>
                                <th>Email</th>
                                <th>Telefon</th>
                                <th>Bokade uppgifter</th>
                                <th>Åtgärd</th>
                                <th>Admin</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows}
                        </tbody>
                    </Table>
                </DataProvider>
            </Col>
            <Col md={3}>
                <InfoText textKey="membercard-ready" />
            </Col>
        </Row>
    </Container >
}

const HasCardTab = () => {
    const [members, setMembers] = useState(new PagedMembers())
    const [page, setPage] = useState(1)
    const pageSize = 10;

    const recallCard = (member: Member) => {
        fetch(member.apiUrl(),
            {
                method: 'PATCH',
                headers: getJsonHeaders(),
                body: JSON.stringify({ membercard_number: "" })
            })
            .then(r => { if (r.status >= 300) throw r.statusText })
            .catch(e => alert("Något gick fel :/\n\n" + e))
            .finally(() => window.location.reload())
    }
    
    const rows = useMemo(() => {
        const renderRow = (member: Member) =>
            <tr key={member.id}>
                <td><a href={member.url()}>{member.fullname}</a></td>
                <td>{member.membercard_number}</td>
                <td><Button onClick={() => recallCard(member)} variant='danger'>Återkalla guldkort</Button></td>
                <td><Button href={member.adminUrl()}>Administrera</Button></td>
            </tr>

        return members.results
            .map(renderRow)
    }, [members, page])

    return <Container fluid>
        <Row>
            <Col md={8}>
                <h1>Medlemmar som har guldkort</h1>
            </Col>
            <Col md={1}>
                <Pagination>
                    <PageItems count={members.count} pageSize={pageSize} currentPage={page} setFunc={setPage} />
                </Pagination>
            </Col>
            <Col md={3}>
                <h3>
                    {rows.length} / {members.count} st
                </h3>
            </Col>
        </Row>
        <Row>
            <Col md={9}>
                <DataProvider<PagedMembers>
                    url={`/api/members/has_card?page=${page}&page_size=${pageSize}`}
                    ctor={json => deserialize(PagedMembers, json)}
                    onLoaded={setMembers}>
                    <Table>
                        <thead>
                            <tr>
                                <th>Namn</th>
                                <th>Guldkortsummer</th>
                                <th>Åtgärd</th>
                                <th>Admin</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows}
                        </tbody>
                    </Table>
                </DataProvider>
            </Col>
            <Col md={3}>
                <InfoText textKey="membercard-cardlist" />
            </Col>
        </Row>
    </Container>
}

const NeedTasksTab = () => {
    const [members, setMembers] = useState(new PagedMembers())
    const [page, setPage] = useState(1)
    const user = useContext(userContext);
    const pageSize = 10;
    const rows = useMemo(() => {
        const renderRow = (member: Member) =>
            <tr key={member.id}>
                <td><a href={member.url()}>{member.fullname}</a></td>
                <td>
                    {'Email: '}
                    {member.email_verified ? 'OK ✔' : 'SAKNAS ❌'}
                    <br />
                    {'Telefon: '}
                    {member.phone_verified ? 'OK ✔' : 'SAKNAS ❌'}
                </td>
                <td>
                    <HoverTooltip tooltip={`Skall vara minst ${user.minSignups}`} placement='top'>
                        <div>
                            {member.booked_weight_year}
                            <br />
                            {member.booked_weight_year
                                ? member.booked_weight_year >= user.minSignups
                                    ? 'OK'
                                    : 'OTILLRÄCKLIGT ❌'
                                : null}
                        </div>
                    </HoverTooltip>
                </td>
                <td><Button href={member.adminUrl()} variant='secondary'>Administrera</Button></td>
            </tr>

        return members.results.map(renderRow)
    }, [members, page, user])


    return <Container fluid>
        <Row>
            <Col md={8}>
                <h1>Medlemmar som inte är klara för guldkort</h1>
            </Col>
            <Col md={1}>
                <Pagination>
                    <PageItems count={members.count} pageSize={pageSize} currentPage={page} setFunc={setPage} />
                </Pagination>
            </Col>
            <Col md={3}>
                <h3>
                    {rows.length} / {members.count} st
                </h3>
            </Col>
        </Row>
        <Row>
            <Col md={9}>
                <DataProvider<PagedMembers>
                    url={`/api/members/not_ready?page=${page}&page_size=${pageSize}`}
                    ctor={json => deserialize(PagedMembers, json)}
                    onLoaded={setMembers}>
                    <Table>
                        <thead>
                            <tr>
                                <th>Namn</th>
                                <th>Verifiering</th>
                                <th>Bokade uppgifter</th>
                                <th>Admin</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows}
                        </tbody>
                    </Table>
                    <Pagination>
                        <PageItems count={members.count} pageSize={pageSize} currentPage={page} setFunc={setPage} />
                    </Pagination>
                </DataProvider>
            </Col>
            <Col md={3}>
                <InfoText textKey="membercard-needtasks" />
            </Col>
        </Row>
    </Container>
}
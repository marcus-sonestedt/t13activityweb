import React, { useState, useMemo } from "react";
import { PagedDoubleBookedTasks, DoubleBookedTask, Member, T13Event, Activity } from "../Models";
import { Button, Container, Row, Col, Pagination, Table } from "react-bootstrap";
import { PageItems, InfoText } from "../components/Utilities";
import DataProvider from "../components/DataProvider";
import { deserialize } from "class-transformer";

export const DoubleBookingsPage = () => {
    const [tasks, setTasks] = useState(new PagedDoubleBookedTasks())
    const [page, setPage] = useState(1)
    const pageSize = 15;

    const rows = useMemo(() => {
        let member: string = '';
        let event: string = '';

        const renderRow = (data: DoubleBookedTask) => {
            const row = <tr key={`${data.assigned_id}-${data.activity_id}`}>
                <td>{data.assigned_id === member ? null :
                    <a href={Member.urlForId(data.assigned_id)}>{data.assigned_fullname}</a>}
                </td>
                <td>{data.event_id === event ? null :
                    <a href={T13Event.urlForId(data.event_id)}>{data.event_name}</a>}
                </td>
                <td><a href={Activity.urlForId(data.activity_id)}>{data.activity_name}</a></td>
                <td>{data.activity_comment}</td>
                <td>
                    <Button href={Member.adminUrlForId(data.assigned_id)} variant='secondary' size='sm'>
                        Administrera
                    </Button>
                </td>
            </tr>

            member = data.assigned_id;
            event = data.event_id;

            return row;
        }

        return tasks.results.map(renderRow)
    }, [tasks])

    return <Container fluid>
        <Row>
            <Col md={8}>
                <h1>Medlemmar som har dubbelbokat sig med samma/ingen kommentar</h1>
            </Col>
            <Col md={1}>
                <Pagination>
                    <PageItems count={tasks.count} pageSize={pageSize} currentPage={page} setFunc={setPage} />
                </Pagination>
            </Col>
            <Col md={3}>
                <h3>
                    {rows.length} / {tasks.count} st
                </h3>
            </Col>
        </Row>
        <Row>
            <Col md={9}>
                <DataProvider
                    url={`/api/members/double_booked?page=${page}&page_size=${pageSize}`}
                    ctor={json => deserialize(PagedDoubleBookedTasks, json)}
                    onLoaded={setTasks}>
                    <Table>
                        <thead>
                            <tr>
                                <th>Namn</th>
                                <th>Aktivitet</th>
                                <th>Uppgifter</th>
                                <th>Kommentar</th>
                                <th>Admin</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows}
                        </tbody>
                    </Table>
                    <Pagination>
                        <PageItems count={tasks.count} pageSize={pageSize} currentPage={page} setFunc={setPage} />
                    </Pagination>
                </DataProvider>
            </Col>
            <Col md={3}>
                <InfoText textKey="membercard-doublebookings" />
            </Col>
        </Row>
    </Container>
}

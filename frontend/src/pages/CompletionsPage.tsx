import React, { useState, useMemo } from "react";
import { PagedCompletions, Completion, Member, T13Event, Activity } from "../Models";
import { Button, Container, Row, Col, Pagination, Table } from "react-bootstrap";
import { PageItems, InfoText } from "../components/Utilities";
import DataProvider from "../components/DataProvider";
import { deserialize } from "class-transformer";
import Cookies from "universal-cookie";

const cookies = new Cookies();

class SetConfirmResponse {
    activity_id! : string;
    completed!: boolean;
}

export const CompletionsPage = () => {
    const [tasks, setTasks] = useState(new PagedCompletions())
    const [filter, setFilter] = useState('')
    const [page, setPage] = useState(1)
    const pageSize = 15;

    const rows = useMemo(() => {
        let member: string = '';
        let event: string = '';

        const renderRow = (data: Completion) => {
            const toggleCompletedState = () => {
                fetch(`/api/members/set_completed/${data.activity_id}`, {
                    method: 'PATCH',
                    headers: {
                        'Accept': 'application/json',
                        'X-CSRFToken': cookies.get('csrftoken'),
                        'Content-Type': 'application/json',
                        },
                    body: JSON.stringify({
                        completed: !data.completed
                    })
                }).then((resp) => {
                    if (resp.status >= 300) {
                        resp.text().then(console.error);
                        throw resp.statusText;
                    }

                    return resp.json();
                }).then((data:SetConfirmResponse) => {
                    console.log(data);
                    setTasks(tasks => {
                        tasks.results = tasks.results.map(task => {
                            if (task.activity_id === data.activity_id) {
                                task.completed = data.completed;
                            }
                            return task;
                        });
                        return tasks;
                    });
                    // above doesn't work?!
                    window.location.reload();
                }).catch(err => {
                    console.error(err);
                    throw err;
                });                
            }

            const timeOpts = {hour: '2-digit', minute: '2-digit'};

            const row = <tr key={`${data.assigned_id}-${data.activity_id}`}>
                <td>{data.assigned_id === member ? null :
                    <a href={Member.urlForId(data.assigned_id)}>{data.assigned_fullname}</a>}
                </td>
                <td>{data.event_id === event ? null :
                    <a href={T13Event.urlForId(data.event_id)}>{data.event_name}</a>}
                </td>
                <td><a href={Activity.urlForId(data.activity_id)}>{data.activity_name}</a></td>
                <td>{data.start_date.getDate() === data.end_date.getDate()
                    ? <div>
                        {data.start_date.toLocaleDateString()}
                        <span> </span>
                        {data.start_date.toLocaleTimeString(undefined, timeOpts)}
                        -
                        {data.end_date.toLocaleTimeString(undefined, timeOpts)}
                    </div> 
                    : <div>
                        {data.start_date.toLocaleDateString()}
                        <span> </span>
                        {data.start_date.toLocaleTimeString(undefined, timeOpts)}
                        <br/>
                        {data.end_date.toLocaleDateString()}
                        <span> </span>
                        {data.end_date.toLocaleTimeString(undefined, timeOpts)}                
                    </div>
                    }
                </td>
                <td>
                    <Button onClick={toggleCompletedState} 
                            variant={data.completed ? 'success' : 'danger'} size='sm'>
                        {data.completed ? "Bekräftad" : "Obekräftad"}
                    </Button>
                </td>
            </tr>

            return row;
        }

        return tasks.results.map(renderRow)
    }, [tasks])

    return <Container fluid>
        <Row>
            <Col md={8}>
                <h1>Närvaroregistrering</h1>
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
            <Col md={6}>
                <span>Sök användare (minst 3 tecken): </span> 
                <input type='text'
                    onChange={e => setFilter(e.target.value)}
                    value={filter}
                    autoFocus={true}/>
                <button onClick={() => setFilter('')}>Reset</button>
            </Col>
        </Row>
        <Row>
            <Col md={9}>
                <DataProvider
                    url={(filter.length === 0)  
                        ? `/api/members/completions?page=${page}&page_size=${pageSize}`
                        : (filter.length >= 3) 
                        ? `/api/members/completions?filter=${filter}`
                        : undefined}
                    ctor={json => deserialize(PagedCompletions, json)}
                    onLoaded={setTasks}>
                    <Table>
                        <thead>
                            <tr>
                                <th>Namn</th>
                                <th>Aktivitet</th>
                                <th>Uppgift</th>
                                <th>Datum/Tid</th>
                                <th>Närvaro</th>
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
                <InfoText textKey="admin-confirmations" />
            </Col>
        </Row>
    </Container>
}

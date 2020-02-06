import React, { useState } from "react"
import { Container, Row, Col, Table, Pagination } from "react-bootstrap"
import { PagedActivityTypes, ActivityType } from "../Models";
import DataProvider from "../components/DataProvider";
import { deserialize } from "class-transformer";
import { PageItems, MarkDown } from "../components/Utilities";
import { Reimbursements } from './ActivityTypePage';

export const ActivityTypesPage = () => {
    return <Container className="table-container">
        <Row>
            <Col md={12}>
                <TaskTypesComponent />
            </Col>
        </Row>
    </Container>
}


export const TaskTypesComponent = () => {
    const [data, setData] = useState<PagedActivityTypes>(new PagedActivityTypes());
    const [page, setPage] = useState(1);

    const renderRow = (model: ActivityType) => {
        return <tr key={model.id}>
            <td style={{textOverflow:'nowrap'}}><a href={model.url()}>{model.name}</a></td>
            <td style={{ textAlign: 'left' }}><MarkDown source={model.description} /></td>
            <td><Reimbursements model={model} /></td>
        </tr>
    }

    const pageSize = 5;

    return <DataProvider<PagedActivityTypes>
        ctor={json => deserialize(PagedActivityTypes, json)}
        url={ActivityType.apiUrlAll() + `?page=${page}&page_size=${pageSize}`}
        onLoaded={setData}>
        <Row>
            <Col>
                <h1>Uppgiftstyper</h1>
            </Col>            
            <h3 className="table-count">{data.results.length}/{data.count} st</h3>
            <Col style={{ textAlign: 'right' }}>
                <Pagination style={{width:'100%'}}>
                    <PageItems count={data.count} pageSize={pageSize} currentPage={page} setFunc={setPage} />
                </Pagination>
            </Col>
        </Row>
        <Row>
            <Col>
                <Table >
                    <thead>
                        <tr>
                            <th style={{minWidth:'12em'}}>Namn</th>
                            <th>Beskrivning</th>
                            <th>Ersättningar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.results.map(renderRow)}
                    </tbody>
                </Table>
            </Col>
        </Row>
    </DataProvider>
}
export default ActivityTypesPage;